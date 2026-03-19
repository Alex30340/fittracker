"""
Routes API pour les produits (catalogue + détail + offres).
Remplace page_catalogue() et page_product() de app.py Streamlit.
Utilise directement les fonctions de core/db.py (inchangées).
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional

from core.db import (
    get_all_products,
    get_product_by_id,
    get_product_offers,
    get_product_images,
    get_price_history,
    get_top_products,
    get_recent_products,
)
from core.scoring import (
    calculate_price_score_10,
    calculate_final_score_10,
)

router = APIRouter()


@router.get("")
def list_products(
    search: Optional[str] = Query(None, description="Recherche par nom ou marque"),
    type_whey: Optional[str] = Query(None, description="Filtrer par type: native, isolate, hydrolysate, concentrate"),
    clean_only: bool = Query(False, description="Sans édulcorant uniquement"),
    sort_by: str = Query("score", description="Tri: score, protein, price, health"),
    min_score: Optional[float] = Query(None, description="Score minimum"),
    max_price_kg: Optional[float] = Query(None, description="Prix/kg maximum"),
    min_protein: Optional[float] = Query(None, description="Protéines/100g minimum"),
    origin: Optional[str] = Query(None, description="Filtrer par origine: France, EU, etc."),
    limit: int = Query(100, le=300),
    offset: int = Query(0, ge=0),
):
    """
    Liste les produits du catalogue avec filtres, recherche et tri.
    Equivalent de page_catalogue() dans l'ancien app.py.
    """
    # Récupère tous les produits (avec meilleure offre jointe)
    all_products = get_all_products(min_confidence=0.0, limit=300)

    # Filtrage
    filtered = []
    for p in all_products:
        # Recherche texte
        if search:
            q = search.lower()
            name = (p.get("name") or "").lower()
            brand = (p.get("brand") or "").lower()
            if q not in name and q not in brand:
                continue

        # Type whey
        if type_whey and p.get("type_whey") != type_whey:
            continue

        # Clean (sans édulcorant)
        if clean_only:
            if p.get("has_sucralose") or p.get("has_acesulfame_k") or p.get("has_aspartame"):
                continue

        # Score minimum
        if min_score is not None and (p.get("score_final") or 0) < min_score:
            continue

        # Prix/kg maximum
        if max_price_kg is not None:
            pkg = p.get("offer_prix_par_kg")
            if pkg is None or pkg > max_price_kg:
                continue

        # Protéines minimum
        if min_protein is not None and (p.get("proteines_100g") or 0) < min_protein:
            continue

        # Origine
        if origin and p.get("origin_label") != origin:
            continue

        filtered.append(p)

    # Tri
    def sort_key(p):
        if sort_by == "score":
            return -(p.get("score_final") or 0)
        elif sort_by == "protein":
            return -(p.get("proteines_100g") or 0)
        elif sort_by == "price":
            return p.get("offer_prix_par_kg") or 9999
        elif sort_by == "health":
            return -(p.get("score_sante") or 0)
        return -(p.get("score_final") or 0)

    filtered.sort(key=sort_key)

    # Pagination
    total = len(filtered)
    paginated = filtered[offset:offset + limit]

    return {
        "total": total,
        "offset": offset,
        "limit": limit,
        "products": paginated,
    }


@router.get("/top")
def top_products(limit: int = Query(5, le=20)):
    """Top produits par score final (pour la landing page)."""
    products = get_top_products(limit=limit)
    return {"products": products}


@router.get("/recent")
def recent_products(limit: int = Query(10, le=50)):
    """Produits récemment ajoutés."""
    products = get_recent_products(limit=limit)
    return {"products": products}


@router.get("/brands")
def list_brands():
    """Liste des marques uniques dans le catalogue."""
    all_products = get_all_products(limit=300)
    brands = {}
    for p in all_products:
        brand = p.get("brand", "")
        if brand:
            if brand not in brands:
                brands[brand] = {"brand": brand, "count": 0, "avg_score": 0, "scores": []}
            brands[brand]["count"] += 1
            s = p.get("score_final")
            if s is not None:
                brands[brand]["scores"].append(s)

    result = []
    for b in brands.values():
        if b["scores"]:
            b["avg_score"] = round(sum(b["scores"]) / len(b["scores"]), 1)
        del b["scores"]
        result.append(b)

    result.sort(key=lambda x: -x["avg_score"])
    return {"brands": result}


@router.get("/{product_id}")
def get_product(product_id: int):
    """
    Détail complet d'un produit.
    Equivalent de page_product() dans l'ancien app.py.
    """
    product = get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Produit introuvable")

    # Offres
    offers = get_product_offers(product_id)

    # Images
    try:
        images = get_product_images(product_id)
    except Exception:
        images = []

    # Historique prix
    try:
        price_hist = get_price_history(product_id)
    except Exception:
        price_hist = []

    # Score détaillé (recalcul pour le détail)
    price_per_kg = None
    if offers:
        best = min(
            [o for o in offers if o.get("prix_par_kg") is not None],
            key=lambda o: o["prix_par_kg"],
            default=None,
        )
        if best:
            price_per_kg = best["prix_par_kg"]

    score_details = calculate_final_score_10(
        score_proteique=product.get("score_proteique"),
        score_sante=product.get("score_sante"),
        price_per_kg=price_per_kg,
        protein_per_100g=product.get("proteines_100g"),
        leucine_g=product.get("leucine_g"),
        has_aminogram=product.get("has_aminogram", False),
        origin_label=product.get("origin_label", "Inconnu"),
        bcaa_missing=product.get("bcaa_per_100g_prot") is None,
        leucine_missing=product.get("leucine_g") is None,
        ingredient_count=product.get("ingredient_count"),
    )

    return {
        "product": product,
        "offers": offers,
        "images": images,
        "price_history": price_hist,
        "score_details": score_details,
    }


@router.get("/{product_id}/offers")
def get_offers(product_id: int):
    """Offres disponibles pour un produit."""
    product = get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    offers = get_product_offers(product_id)
    return {"offers": offers}


@router.get("/{product_id}/price-history")
def price_history(product_id: int, limit: int = Query(90)):
    """Historique des prix pour le graphique."""
    product = get_product_by_id(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Produit introuvable")
    history = get_price_history(product_id)
    return {"history": history[:limit]}


@router.get("/ranking")
def ranking(
    type_whey: Optional[str] = Query(None),
    clean_only: bool = Query(False),
    origin: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
):
    """Classement officiel avec rang et score breakdown."""
    from core.scoring import calculate_final_score_10
    all_prods = get_all_products(min_confidence=0.0, limit=300)
    scored = [p for p in all_prods if p.get("score_final") is not None]

    if type_whey:
        scored = [p for p in scored if p.get("type_whey") == type_whey]
    if clean_only:
        scored = [p for p in scored if not p.get("has_sucralose") and not p.get("has_acesulfame_k") and not p.get("has_aspartame")]
    if origin:
        scored = [p for p in scored if p.get("origin_label") == origin]

    scored.sort(key=lambda x: -(x.get("score_final") or 0))

    for i, p in enumerate(scored):
        p["rank"] = i + 1
        p["score_breakdown"] = calculate_final_score_10(
            score_proteique=p.get("score_proteique"),
            score_sante=p.get("score_sante"),
            price_per_kg=p.get("offer_prix_par_kg"),
            protein_per_100g=p.get("proteines_100g"),
            leucine_g=p.get("leucine_g"),
            has_aminogram=p.get("has_aminogram", False),
            origin_label=p.get("origin_label", "Inconnu"),
            bcaa_missing=p.get("bcaa_per_100g_prot") is None,
            leucine_missing=p.get("leucine_g") is None,
            ingredient_count=p.get("ingredient_count"),
        )

    return {"total": len(scored), "ranking": scored[:limit]}


@router.get("/brands")
def list_brands():
    """Liste des marques avec stats."""
    all_prods = get_all_products(min_confidence=0.0, limit=300)
    brand_map = {}
    for p in all_prods:
        b = p.get("brand", "")
        if not b:
            continue
        if b not in brand_map:
            brand_map[b] = {"brand": b, "count": 0, "scores": []}
        brand_map[b]["count"] += 1
        s = p.get("score_final")
        if s is not None:
            brand_map[b]["scores"].append(s)
    result = []
    for v in brand_map.values():
        v["avg_score"] = round(sum(v["scores"]) / len(v["scores"]), 1) if v["scores"] else 0
        del v["scores"]
        result.append(v)
    result.sort(key=lambda x: -x["avg_score"])
    return {"brands": result}
