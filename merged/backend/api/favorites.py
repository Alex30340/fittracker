"""
Routes API pour les favoris.
"""

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from core.db import toggle_favorite, is_favorite, get_user_favorites
from api.auth_routes import require_user

router = APIRouter()


class FavoriteToggle(BaseModel):
    product_id: int


@router.get("")
def list_favorites(user=Depends(require_user)):
    """Liste des favoris de l'utilisateur."""
    favorites = get_user_favorites(user["id"])
    return {"favorites": favorites}


@router.post("/toggle")
def toggle(req: FavoriteToggle, user=Depends(require_user)):
    """Ajouter/retirer un produit des favoris."""
    result = toggle_favorite(user["id"], req.product_id)
    is_fav = is_favorite(user["id"], req.product_id)
    return {"is_favorite": is_fav}
