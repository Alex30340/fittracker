"""
Routes API pour les avis produit.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional

from core.db import (
    create_review, get_reviews_for_product, get_average_rating,
    create_recommendation, get_recommendations_for_product,
    flag_review,
)
from api.auth_routes import require_user, get_current_user

router = APIRouter()


class ReviewCreate(BaseModel):
    product_id: int
    rating: int  # 1-5
    title: Optional[str] = None
    comment: Optional[str] = None
    purchased_from: Optional[str] = None


class RecommendationCreate(BaseModel):
    product_id: int
    usage_context: str  # "masse", "seche", "general"
    level: Optional[str] = None
    pros: Optional[str] = None
    cons: Optional[str] = None
    comment: str


@router.get("/product/{product_id}")
def get_product_reviews(product_id: int):
    """Avis et note moyenne pour un produit."""
    reviews = get_reviews_for_product(product_id)
    avg = get_average_rating(product_id)
    recommendations = get_recommendations_for_product(product_id)

    return {
        "reviews": reviews,
        "average_rating": avg,
        "review_count": len(reviews),
        "recommendations": recommendations,
    }


@router.post("")
def add_review(req: ReviewCreate, user=Depends(require_user)):
    """Créer un avis (utilisateur connecté requis)."""
    if req.rating < 1 or req.rating > 5:
        raise HTTPException(status_code=400, detail="Note entre 1 et 5")

    review = create_review(
        product_id=req.product_id,
        user_id=user["id"],
        rating=req.rating,
        title=req.title,
        comment=req.comment,
        purchased_from=req.purchased_from,
    )
    return {"review": review}


@router.post("/recommendation")
def add_recommendation(req: RecommendationCreate, user=Depends(require_user)):
    """Créer une recommandation."""
    reco = create_recommendation(
        product_id=req.product_id,
        user_id=user["id"],
        usage_context=req.usage_context,
        level=req.level,
        pros=req.pros,
        cons=req.cons,
        comment=req.comment,
    )
    return {"recommendation": reco}


@router.post("/{review_id}/flag")
def flag_a_review(review_id: int, user=Depends(require_user)):
    """Signaler un avis."""
    flag_review(review_id)
    return {"flagged": True}
