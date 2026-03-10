"""Nutrition Plan API - Generate and manage meal plans."""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel, Field
from app.database import get_db
from app.models import User, UserProfile, NutritionPlan
from app.core.security import get_current_user
from app.services.nutrition_ai import generate_nutrition_plan_with_ai

router = APIRouter(prefix="/nutrition", tags=["nutrition plans"])


# --- Schemas ---

class GeneratePlanRequest(BaseModel):
    meals_per_day: int = Field(default=5, ge=3, le=7)
    dietary_type: str = "standard"
    exclude_foods: Optional[List[str]] = None
    favorite_foods: Optional[List[str]] = None
    cooking_time_max: Optional[int] = Field(None, ge=5, le=120)
    budget: str = "medium"
    training_days: Optional[List[int]] = None
    notes: Optional[str] = None


# --- Routes ---

@router.post("/plans/generate")
async def generate_plan(
    req: GeneratePlanRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate a personalized nutrition plan with AI."""

    # Get profile for macro targets
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Complète ton profil fitness d'abord")

    if not profile.target_calories:
        raise HTTPException(status_code=400, detail="Macros non calculées. Remplis ton profil complet (sexe, âge, taille, poids, objectif).")

    # Build profile dict for AI service
    profile_dict = {
        "sex": profile.sex,
        "birth_date": profile.birth_date,
        "current_weight_kg": profile.current_weight_kg,
        "height_cm": profile.height_cm,
        "primary_goal": profile.primary_goal,
        "experience_level": profile.experience_level,
    }

    try:
        plan_data = await generate_nutrition_plan_with_ai(
            profile=profile_dict,
            target_calories=profile.target_calories,
            target_protein_g=profile.target_protein_g,
            target_carbs_g=profile.target_carbs_g,
            target_fat_g=profile.target_fat_g,
            meals_per_day=req.meals_per_day,
            dietary_type=req.dietary_type,
            exclusions=req.exclude_foods,
            favorites=req.favorite_foods,
            cooking_time_max=req.cooking_time_max,
            budget=req.budget,
            training_days=req.training_days,
            notes=req.notes,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur génération: {str(e)}")

    # Deactivate previous plans
    db.query(NutritionPlan).filter(
        NutritionPlan.user_id == user.id,
        NutritionPlan.is_active == True,
    ).update({"is_active": False})

    # Save new plan
    plan = NutritionPlan(
        user_id=user.id,
        name=plan_data.get("name", "Plan nutrition"),
        target_calories=profile.target_calories,
        target_protein_g=profile.target_protein_g,
        target_carbs_g=profile.target_carbs_g,
        target_fat_g=profile.target_fat_g,
        meals_per_day=req.meals_per_day,
        plan_data=plan_data,
        is_active=True,
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)

    return {
        "id": plan.id,
        "name": plan.name,
        "target_calories": plan.target_calories,
        "target_protein_g": plan.target_protein_g,
        "target_carbs_g": plan.target_carbs_g,
        "target_fat_g": plan.target_fat_g,
        "meals_per_day": plan.meals_per_day,
        "plan": plan_data,
    }


@router.get("/plans")
def list_plans(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all nutrition plans for the user."""
    plans = (
        db.query(NutritionPlan)
        .filter(NutritionPlan.user_id == user.id)
        .order_by(desc(NutritionPlan.created_at))
        .all()
    )
    return [
        {
            "id": p.id,
            "name": p.name,
            "target_calories": p.target_calories,
            "meals_per_day": p.meals_per_day,
            "is_active": p.is_active,
            "created_at": p.created_at.isoformat(),
        }
        for p in plans
    ]


@router.get("/plans/{plan_id}")
def get_plan(
    plan_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get full plan details with all meals."""
    plan = db.query(NutritionPlan).filter(
        NutritionPlan.id == plan_id,
        NutritionPlan.user_id == user.id,
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Plan introuvable")

    return {
        "id": plan.id,
        "name": plan.name,
        "target_calories": plan.target_calories,
        "target_protein_g": plan.target_protein_g,
        "target_carbs_g": plan.target_carbs_g,
        "target_fat_g": plan.target_fat_g,
        "meals_per_day": plan.meals_per_day,
        "is_active": plan.is_active,
        "plan": plan.plan_data,
        "created_at": plan.created_at.isoformat(),
    }


@router.get("/plans/active")
def get_active_plan(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the currently active nutrition plan."""
    plan = db.query(NutritionPlan).filter(
        NutritionPlan.user_id == user.id,
        NutritionPlan.is_active == True,
    ).first()

    if not plan:
        return {"message": "Aucun plan actif. Génère-en un via /plans/generate"}

    return {
        "id": plan.id,
        "name": plan.name,
        "target_calories": plan.target_calories,
        "target_protein_g": plan.target_protein_g,
        "target_carbs_g": plan.target_carbs_g,
        "target_fat_g": plan.target_fat_g,
        "meals_per_day": plan.meals_per_day,
        "plan": plan.plan_data,
        "created_at": plan.created_at.isoformat(),
    }


@router.delete("/plans/{plan_id}")
def delete_plan(
    plan_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a nutrition plan."""
    plan = db.query(NutritionPlan).filter(
        NutritionPlan.id == plan_id,
        NutritionPlan.user_id == user.id,
    ).first()

    if not plan:
        raise HTTPException(status_code=404, detail="Plan introuvable")

    db.delete(plan)
    db.commit()
    return {"message": "Plan supprimé"}


@router.get("/shopping-list")
def get_shopping_list(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the shopping list from the active plan."""
    plan = db.query(NutritionPlan).filter(
        NutritionPlan.user_id == user.id,
        NutritionPlan.is_active == True,
    ).first()

    if not plan or not plan.plan_data:
        return {"items": [], "message": "Aucun plan actif"}

    shopping_list = plan.plan_data.get("shopping_list", [])
    total_price = sum(item.get("estimated_price_eur", 0) for item in shopping_list)

    return {
        "plan_name": plan.name,
        "items": shopping_list,
        "total_estimated_price": round(total_price, 2),
        "supplements": plan.plan_data.get("supplements", []),
        "tips": plan.plan_data.get("tips", []),
    }
