"""
Scraper Service - Bridge between legacy ProteinScan scraper and FitTracker backend.

This service wraps the existing scraper.py, extractor.py, scoring.py etc.
and writes results into the new SQLAlchemy models.

SETUP:
1. Copy these files from ProteinScan into backend/app/services/legacy/:
   - scraper.py
   - extractor.py
   - validator.py
   - page_validator.py
   - scoring.py
   - multi_source_extractor.py
   - nutrition_extractor.py
   - browser_scraper.py
   - resolver.py
   - seed_data.json

2. Install extra dependencies:
   pip install httpx beautifulsoup4 lxml playwright

3. The scraper service below imports from legacy/ and writes to SQLAlchemy models.
"""

import logging
import os
import sys
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from app.models import Product, Offer, PriceHistory, ProductCategory

logger = logging.getLogger(__name__)

# Add legacy scraper path
LEGACY_PATH = os.path.join(os.path.dirname(__file__), "legacy")
if LEGACY_PATH not in sys.path:
    sys.path.insert(0, LEGACY_PATH)


def _import_legacy():
    """Lazy import of legacy scraper modules."""
    try:
        from scraper import (
            extract_product_data,
            generate_discovery_queries,
            search_brave,
            SEED_BRANDS,
            BLOCK_DOMAINS,
        )
        from scoring import (
            calculate_protein_score,
            calculate_health_score,
            calculate_final_score_10,
        )
        return {
            "extract_product_data": extract_product_data,
            "generate_discovery_queries": generate_discovery_queries,
            "search_brave": search_brave,
            "calculate_protein_score": calculate_protein_score,
            "calculate_health_score": calculate_health_score,
            "calculate_final_score_10": calculate_final_score_10,
            "SEED_BRANDS": SEED_BRANDS,
            "BLOCK_DOMAINS": BLOCK_DOMAINS,
        }
    except ImportError as e:
        logger.error(f"[SCRAPER] Legacy modules not found. Copy them to {LEGACY_PATH}/. Error: {e}")
        return None


def _normalize_key(name: str, brand: str) -> str:
    """Generate a normalized key for product deduplication."""
    import re
    combined = f"{brand}:{name}".lower().strip()
    combined = re.sub(r"[^a-z0-9àâäéèêëïîôùûüÿç]+", "_", combined)
    combined = re.sub(r"_+", "_", combined).strip("_")
    return combined[:500]


def _get_or_create_whey_category(db: Session) -> int:
    """Get or create the whey category."""
    cat = db.query(ProductCategory).filter(ProductCategory.slug == "whey").first()
    if not cat:
        cat = ProductCategory(
            slug="whey",
            name="Whey Protéine",
            description="Protéines de lactosérum",
            scoring_weights={"protein": 0.50, "health": 0.35, "price": 0.15},
            icon="🥛",
            sort_order=1,
        )
        db.add(cat)
        db.flush()
    return cat.id


def upsert_product_from_scrape(db: Session, data: dict) -> Optional[Product]:
    """
    Takes raw scraper output dict and upserts into Product + Offer tables.
    Returns the Product object or None if data is insufficient.
    """
    name = (data.get("nom") or "").strip()
    brand = (data.get("marque") or "").strip()
    url = data.get("url", "")

    if not name or name == "Produit inconnu":
        return None

    normalized_key = _normalize_key(name, brand)
    category_id = _get_or_create_whey_category(db)

    # Find or create product
    product = db.query(Product).filter(Product.normalized_key == normalized_key).first()

    if product:
        # Update only if new data is better (don't overwrite with None)
        if data.get("proteines_100g") and not product.proteines_100g:
            product.proteines_100g = data["proteines_100g"]
        if data.get("score_final") is not None:
            product.score_final = data["score_final"]
        if data.get("score_proteique") is not None:
            product.score_proteique = data["score_proteique"]
        if data.get("score_sante") is not None:
            product.score_sante = data["score_sante"]
        if data.get("ingredients") and not product.ingredients:
            product.ingredients = data["ingredients"]
        if data.get("image_url") and not product.image_url:
            product.image_url = data["image_url"]
        # Always update these
        if data.get("type_whey") and data["type_whey"] != "unknown":
            product.type_whey = data["type_whey"]
        product.updated_at = datetime.utcnow()
    else:
        product = Product(
            category_id=category_id,
            name=name,
            brand=brand,
            normalized_key=normalized_key,
            type_whey=data.get("type_whey", "unknown"),
            proteines_100g=data.get("proteines_100g"),
            kcal_per_100g=data.get("kcal_per_100g"),
            carbs_per_100g=data.get("carbs_per_100g"),
            fat_per_100g=data.get("fat_per_100g"),
            sugar_per_100g=data.get("sugar_per_100g"),
            bcaa_per_100g_prot=data.get("bcaa_per_100g_prot"),
            leucine_g=data.get("leucine_g"),
            has_aminogram=data.get("has_aminogram", False),
            ingredients=data.get("ingredients"),
            ingredient_count=data.get("ingredient_count"),
            has_sucralose=data.get("has_sucralose", False),
            has_acesulfame_k=data.get("has_acesulfame_k", False),
            has_aspartame=data.get("has_aspartame", False),
            origin_label=data.get("origin_label", "Inconnu"),
            made_in_france=data.get("made_in_france", False),
            score_proteique=data.get("score_proteique"),
            score_sante=data.get("score_sante"),
            score_final=data.get("score_final"),
            image_url=data.get("image_url"),
        )
        db.add(product)

    db.flush()

    # Upsert offer
    if url:
        from urllib.parse import urlparse
        merchant = urlparse(url).netloc.replace("www.", "")

        existing_offer = db.query(Offer).filter(
            Offer.product_id == product.id,
            Offer.url == url,
        ).first()

        price = data.get("prix")
        weight = data.get("poids_kg")
        ppk = data.get("prix_par_kg")
        availability = data.get("disponibilite", "")

        if existing_offer:
            if price is not None:
                existing_offer.prix = price
            if weight is not None:
                existing_offer.poids_kg = weight
            if ppk is not None:
                existing_offer.prix_par_kg = ppk
            if availability:
                existing_offer.disponibilite = availability
            existing_offer.is_active = True
            existing_offer.updated_at = datetime.utcnow()
        else:
            from validator import compute_confidence_v2
            try:
                confidence = compute_confidence_v2(data)
            except Exception:
                confidence = 0.5

            offer = Offer(
                product_id=product.id,
                merchant=merchant,
                url=url,
                prix=price,
                poids_kg=weight,
                prix_par_kg=ppk,
                disponibilite=availability,
                confidence=confidence,
                is_active=True,
            )
            db.add(offer)

        # Record price history
        if price is not None:
            history = PriceHistory(
                product_id=product.id,
                prix=price,
                prix_par_kg=ppk,
                merchant=merchant,
            )
            db.add(history)

    return product


def run_discovery_pipeline(db: Session, brave_api_key: str, max_urls: int = 50) -> dict:
    """
    Run the discovery pipeline: search for new products and scrape them.
    Returns stats dict.
    """
    legacy = _import_legacy()
    if not legacy:
        return {"error": "Legacy scraper modules not found", "products_found": 0}

    stats = {"urls_found": 0, "products_scraped": 0, "products_saved": 0, "errors": 0}

    # Generate search queries
    queries = legacy["generate_discovery_queries"](
        use_brand_seeds=True,
        block_domains=legacy["BLOCK_DOMAINS"],
    )

    # Search
    all_urls = set()
    for q_info in queries[:20]:  # Limit queries per run
        try:
            urls = legacy["search_brave"](brave_api_key, q_info["query"], count=10)
            all_urls.update(urls)
            if len(all_urls) >= max_urls:
                break
        except Exception as e:
            logger.warning(f"[DISCOVERY] Search error: {e}")
            stats["errors"] += 1

    stats["urls_found"] = len(all_urls)
    logger.info(f"[DISCOVERY] Found {len(all_urls)} unique URLs")

    # Scrape each URL
    for url in list(all_urls)[:max_urls]:
        try:
            data = legacy["extract_product_data"](url)
            if data:
                stats["products_scraped"] += 1
                product = upsert_product_from_scrape(db, data)
                if product:
                    stats["products_saved"] += 1
        except Exception as e:
            logger.warning(f"[DISCOVERY] Scrape error for {url}: {e}")
            stats["errors"] += 1

    db.commit()
    logger.info(f"[DISCOVERY] Complete: {stats}")
    return stats


def run_refresh_pipeline(db: Session, limit: int = 50) -> dict:
    """
    Refresh existing offers: re-scrape active offer URLs to update prices.
    """
    legacy = _import_legacy()
    if not legacy:
        return {"error": "Legacy scraper modules not found", "offers_updated": 0}

    stats = {"offers_checked": 0, "offers_updated": 0, "offers_deactivated": 0, "errors": 0}

    # Get active offers to refresh
    offers = (
        db.query(Offer)
        .filter(Offer.is_active == True)
        .order_by(Offer.updated_at.asc())
        .limit(limit)
        .all()
    )

    for offer in offers:
        stats["offers_checked"] += 1
        try:
            data = legacy["extract_product_data"](offer.url)
            if data:
                new_price = data.get("prix")
                new_availability = data.get("disponibilite", "")

                if new_price is not None:
                    offer.prix = new_price
                    offer.prix_par_kg = data.get("prix_par_kg")
                    stats["offers_updated"] += 1

                offer.disponibilite = new_availability or offer.disponibilite
                offer.updated_at = datetime.utcnow()
                offer.fail_count = 0

                # Record price history
                if new_price is not None:
                    from urllib.parse import urlparse
                    merchant = urlparse(offer.url).netloc.replace("www.", "")
                    history = PriceHistory(
                        product_id=offer.product_id,
                        prix=new_price,
                        prix_par_kg=data.get("prix_par_kg"),
                        merchant=merchant,
                    )
                    db.add(history)

                # Update product scores if we got new nutrition data
                product = db.query(Product).filter(Product.id == offer.product_id).first()
                if product and data.get("score_final") is not None:
                    product.score_final = data["score_final"]
                    product.score_proteique = data.get("score_proteique")
                    product.score_sante = data.get("score_sante")

            else:
                # Page no longer valid
                offer.fail_count = (offer.fail_count or 0) + 1
                if offer.fail_count >= 3:
                    offer.is_active = False
                    stats["offers_deactivated"] += 1

        except Exception as e:
            logger.warning(f"[REFRESH] Error refreshing {offer.url}: {e}")
            offer.fail_count = (offer.fail_count or 0) + 1
            stats["errors"] += 1

    db.commit()
    logger.info(f"[REFRESH] Complete: {stats}")
    return stats


def import_seed_data(db: Session, seed_file: str) -> dict:
    """
    Import products from seed_data.json (ProteinScan export).
    """
    import json

    if not os.path.exists(seed_file):
        return {"error": f"File not found: {seed_file}"}

    with open(seed_file, "r", encoding="utf-8") as f:
        seed = json.load(f)

    stats = {"imported": 0, "skipped": 0}

    items = seed if isinstance(seed, list) else seed.get("products", [])

    for item in items:
        try:
            product = upsert_product_from_scrape(db, item)
            if product:
                stats["imported"] += 1
            else:
                stats["skipped"] += 1
        except Exception as e:
            logger.warning(f"[SEED] Error importing: {e}")
            stats["skipped"] += 1

    db.commit()
    return stats
