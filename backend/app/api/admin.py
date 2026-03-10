"""Admin API endpoints for scraper pipelines and data management."""

import os
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, Product, Offer, PriceHistory, ProductCategory
from app.core.security import get_current_user
from app.services.scraper_service import (
    run_discovery_pipeline,
    run_refresh_pipeline,
    import_seed_data,
)

router = APIRouter(prefix="/admin", tags=["admin"])


def _require_admin(user: User):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin requis")


@router.get("/stats")
def get_admin_stats(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    _require_admin(user)

    total_products = db.query(func.count(Product.id)).filter(Product.is_active == True).scalar()
    total_offers = db.query(func.count(Offer.id)).filter(Offer.is_active == True).scalar()
    with_price = db.query(func.count(Offer.id)).filter(Offer.is_active == True, Offer.prix != None).scalar()
    with_protein = db.query(func.count(Product.id)).filter(Product.proteines_100g != None).scalar()
    with_score = db.query(func.count(Product.id)).filter(Product.score_final != None).scalar()
    with_image = db.query(func.count(Product.id)).filter(Product.image_url != None).scalar()

    categories = (
        db.query(ProductCategory.name, func.count(Product.id))
        .outerjoin(Product)
        .group_by(ProductCategory.name)
        .all()
    )

    return {
        "total_products": total_products,
        "total_active_offers": total_offers,
        "offers_with_price": with_price,
        "products_with_protein": with_protein,
        "products_with_score": with_score,
        "products_with_image": with_image,
        "completeness_pct": round((with_score / total_products * 100) if total_products else 0, 1),
        "categories": {name: count for name, count in categories},
    }


@router.post("/pipeline/discovery")
async def run_discovery(
    max_urls: int = 50,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_admin(user)

    brave_key = os.environ.get("BRAVE_API_KEY", "")
    if not brave_key:
        raise HTTPException(status_code=400, detail="BRAVE_API_KEY non configurée. Ajoute-la dans .env")

    stats = run_discovery_pipeline(db, brave_key, max_urls=max_urls)
    return {"status": "completed", **stats}


@router.post("/pipeline/refresh")
async def run_refresh(
    limit: int = 50,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _require_admin(user)

    stats = run_refresh_pipeline(db, limit=limit)
    return {"status": "completed", **stats}


@router.post("/import/seed")
async def import_seed(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Import products from seed_data.json."""
    _require_admin(user)

    seed_paths = [
        os.path.join(os.path.dirname(__file__), "..", "services", "legacy", "seed_data.json"),
        os.path.join(os.path.dirname(__file__), "..", "..", "seed_data.json"),
        "seed_data.json",
    ]

    seed_file = None
    for p in seed_paths:
        if os.path.exists(p):
            seed_file = p
            break

    if not seed_file:
        raise HTTPException(status_code=404, detail="seed_data.json introuvable. Place-le dans backend/ ou backend/app/services/legacy/")

    stats = import_seed_data(db, seed_file)
    return {"status": "completed", **stats}


@router.post("/import/rescrape-all")
async def rescrape_all(
    limit: int = 20,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Re-scrape products missing critical data."""
    _require_admin(user)

    from app.services.scraper_service import _import_legacy, upsert_product_from_scrape

    legacy = _import_legacy()
    if not legacy:
        raise HTTPException(status_code=500, detail="Legacy scraper modules not found")

    # Find products missing score or protein
    incomplete = (
        db.query(Product)
        .filter(
            Product.is_active == True,
            (Product.score_final == None) | (Product.proteines_100g == None),
        )
        .limit(limit)
        .all()
    )

    stats = {"checked": 0, "updated": 0, "errors": 0}

    for product in incomplete:
        # Find an active offer URL
        offer = db.query(Offer).filter(
            Offer.product_id == product.id, Offer.is_active == True
        ).first()

        if not offer:
            continue

        stats["checked"] += 1
        try:
            data = legacy["extract_product_data"](offer.url)
            if data:
                updated = upsert_product_from_scrape(db, data)
                if updated:
                    stats["updated"] += 1
        except Exception as e:
            stats["errors"] += 1

    db.commit()
    return {"status": "completed", **stats}
