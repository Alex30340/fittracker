"""
Routes API pour le comparateur.
Remplace page_compare() de app.py Streamlit.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from core.db import get_products_by_ids, get_all_products

router = APIRouter()


class CompareRequest(BaseModel):
    product_ids: list[int]


@router.post("")
def compare_products(req: CompareRequest):
    """
    Compare jusqu'à 5 produits côte à côte.
    Equivalent de page_compare() dans l'ancien app.py.
    """
    if len(req.product_ids) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 produits")
    if len(req.product_ids) < 1:
        raise HTTPException(status_code=400, detail="Au moins 1 produit requis")

    products = get_products_by_ids(tuple(req.product_ids))
    if not products:
        raise HTTPException(status_code=404, detail="Aucun produit trouvé")

    return {"products": products}


@router.get("/suggestions")
def compare_suggestions():
    """
    Suggestions pré-faites de comparaison.
    Equivalent des "suggestion-card" dans page_compare() Streamlit.
    """
    all_prods = get_all_products(limit=300)
    scored = [p for p in all_prods if p.get("score_final") is not None]

    # Top 3 Native/Isolate
    native_isolate = sorted(
        [p for p in scored if p.get("type_whey") in ("native", "isolate")],
        key=lambda x: -(x.get("score_final") or 0)
    )[:3]

    # Meilleur rapport qualité/prix
    best_value = sorted(
        [p for p in scored if p.get("offer_prix_par_kg") is not None],
        key=lambda x: -(x.get("score_final") or 0) / max(1, (x.get("offer_prix_par_kg") or 100) / 30)
    )[:3]

    # Sans édulcorant
    no_sweetener = sorted(
        [p for p in scored
         if not p.get("has_sucralose")
         and not p.get("has_acesulfame_k")
         and not p.get("has_aspartame")],
        key=lambda x: -(x.get("score_final") or 0)
    )[:3]

    return {
        "suggestions": [
            {
                "title": "Top 3 Isolate / Native",
                "description": "Les meilleures wheys isolate et native",
                "product_ids": [p["id"] for p in native_isolate],
                "products": native_isolate,
            },
            {
                "title": "Meilleur rapport qualité/prix",
                "description": "Score élevé, prix compétitif",
                "product_ids": [p["id"] for p in best_value],
                "products": best_value,
            },
            {
                "title": "Top 3 sans édulcorant",
                "description": "Sans sucralose, sans acésulfame-K",
                "product_ids": [p["id"] for p in no_sweetener],
                "products": no_sweetener,
            },
        ]
    }
