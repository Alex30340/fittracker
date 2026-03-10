from typing import Optional, List
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from pydantic import BaseModel, Field
from app.database import get_db
from app.models import User, UserProfile, FoodLog, BodyMetric, NutritionPlan
from app.core.security import get_current_user
from app.services.calculations import update_profile_macros

router = APIRouter(tags=["profile & tracking"])


# ============================================================
# PROFILE
# ============================================================

class ProfileUpdate(BaseModel):
    sex: Optional[str] = None
    birth_date: Optional[str] = None  # YYYY-MM-DD
    height_cm: Optional[float] = None
    current_weight_kg: Optional[float] = None
    target_weight_kg: Optional[float] = None
    body_fat_pct: Optional[float] = None
    primary_goal: Optional[str] = None
    experience_level: Optional[int] = Field(None, ge=1, le=5)
    available_days: Optional[int] = Field(None, ge=1, le=7)
    session_duration_min: Optional[int] = Field(None, ge=15, le=180)
    equipment: Optional[str] = None
    injuries: Optional[List[str]] = None
    dietary_preferences: Optional[List[str]] = None


@router.get("/profile")
def get_profile(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not profile:
        return {"message": "Profil non créé"}

    return {
        "user_id": profile.user_id,
        "sex": profile.sex,
        "birth_date": profile.birth_date.isoformat() if profile.birth_date else None,
        "height_cm": profile.height_cm,
        "current_weight_kg": profile.current_weight_kg,
        "target_weight_kg": profile.target_weight_kg,
        "body_fat_pct": profile.body_fat_pct,
        "primary_goal": profile.primary_goal,
        "experience_level": profile.experience_level,
        "available_days": profile.available_days,
        "session_duration_min": profile.session_duration_min,
        "equipment": profile.equipment,
        "injuries": profile.injuries,
        "dietary_preferences": profile.dietary_preferences,
        "bmr": profile.bmr,
        "tdee": profile.tdee,
        "target_calories": profile.target_calories,
        "target_protein_g": profile.target_protein_g,
        "target_carbs_g": profile.target_carbs_g,
        "target_fat_g": profile.target_fat_g,
    }


@router.put("/profile")
def update_profile(
    req: ProfileUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not profile:
        profile = UserProfile(user_id=user.id)
        db.add(profile)

    # Update fields
    update_data = req.model_dump(exclude_unset=True)
    if "birth_date" in update_data and update_data["birth_date"]:
        update_data["birth_date"] = date.fromisoformat(update_data["birth_date"])

    for key, value in update_data.items():
        setattr(profile, key, value)

    # Recalculate macros
    macros = update_profile_macros(profile)
    if macros:
        profile.bmr = macros["bmr"]
        profile.tdee = macros["tdee"]
        profile.target_calories = macros["target_calories"]
        profile.target_protein_g = macros["target_protein_g"]
        profile.target_carbs_g = macros["target_carbs_g"]
        profile.target_fat_g = macros["target_fat_g"]

    db.commit()
    db.refresh(profile)

    return {"message": "Profil mis à jour", "macros": macros}


# ============================================================
# NUTRITION LOG
# ============================================================

class FoodLogCreate(BaseModel):
    food_name: str
    meal_type: Optional[str] = None
    quantity_g: Optional[float] = None
    calories: float = 0
    protein_g: float = 0
    carbs_g: float = 0
    fat_g: float = 0
    logged_at: Optional[str] = None


@router.post("/nutrition/log")
def log_food(
    req: FoodLogCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    log = FoodLog(
        user_id=user.id,
        food_name=req.food_name,
        meal_type=req.meal_type,
        quantity_g=req.quantity_g,
        calories=req.calories,
        protein_g=req.protein_g,
        carbs_g=req.carbs_g,
        fat_g=req.fat_g,
        logged_at=datetime.fromisoformat(req.logged_at) if req.logged_at else datetime.utcnow(),
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    # Check achievements
    from app.services.achievement_service import check_and_award
    new_badges = check_and_award(db, user.id, action="nutrition")
    db.commit()

    return {"id": log.id, "message": "Aliment ajouté", "new_achievements": new_badges}


@router.get("/nutrition/daily")
def get_daily_nutrition(
    day: Optional[str] = None,  # YYYY-MM-DD
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    target_date = date.fromisoformat(day) if day else date.today()

    logs = (
        db.query(FoodLog)
        .filter(
            FoodLog.user_id == user.id,
            func.date(FoodLog.logged_at) == target_date,
        )
        .order_by(FoodLog.logged_at)
        .all()
    )

    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    targets = {
        "calories": profile.target_calories if profile else 2000,
        "protein_g": profile.target_protein_g if profile else 150,
        "carbs_g": profile.target_carbs_g if profile else 250,
        "fat_g": profile.target_fat_g if profile else 70,
    }

    totals = {"calories": 0, "protein_g": 0, "carbs_g": 0, "fat_g": 0}
    meals = {}
    for log in logs:
        totals["calories"] += log.calories
        totals["protein_g"] += log.protein_g
        totals["carbs_g"] += log.carbs_g
        totals["fat_g"] += log.fat_g

        mt = log.meal_type or "other"
        if mt not in meals:
            meals[mt] = []
        meals[mt].append({
            "id": log.id,
            "food_name": log.food_name,
            "quantity_g": log.quantity_g,
            "calories": log.calories,
            "protein_g": log.protein_g,
            "carbs_g": log.carbs_g,
            "fat_g": log.fat_g,
            "time": log.logged_at.strftime("%H:%M"),
        })

    return {
        "date": target_date.isoformat(),
        "totals": totals,
        "targets": targets,
        "adherence_pct": round(totals["calories"] / targets["calories"] * 100, 1) if targets["calories"] else 0,
        "meals": meals,
    }


# ============================================================
# BODY METRICS
# ============================================================

class MetricCreate(BaseModel):
    measured_at: Optional[str] = None
    weight_kg: Optional[float] = None
    body_fat_pct: Optional[float] = None
    chest_cm: Optional[float] = None
    waist_cm: Optional[float] = None
    hips_cm: Optional[float] = None
    bicep_left_cm: Optional[float] = None
    bicep_right_cm: Optional[float] = None
    thigh_left_cm: Optional[float] = None
    thigh_right_cm: Optional[float] = None
    notes: Optional[str] = None


@router.post("/metrics")
def add_metric(
    req: MetricCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    metric = BodyMetric(
        user_id=user.id,
        measured_at=date.fromisoformat(req.measured_at) if req.measured_at else date.today(),
        weight_kg=req.weight_kg,
        body_fat_pct=req.body_fat_pct,
        chest_cm=req.chest_cm,
        waist_cm=req.waist_cm,
        hips_cm=req.hips_cm,
        bicep_left_cm=req.bicep_left_cm,
        bicep_right_cm=req.bicep_right_cm,
        thigh_left_cm=req.thigh_left_cm,
        thigh_right_cm=req.thigh_right_cm,
        notes=req.notes,
    )
    db.add(metric)
    db.commit()

    # Update profile weight if provided
    if req.weight_kg:
        profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
        if profile:
            profile.current_weight_kg = req.weight_kg
            macros = update_profile_macros(profile)
            if macros:
                profile.bmr = macros["bmr"]
                profile.tdee = macros["tdee"]
                profile.target_calories = macros["target_calories"]
                profile.target_protein_g = macros["target_protein_g"]
                profile.target_carbs_g = macros["target_carbs_g"]
                profile.target_fat_g = macros["target_fat_g"]
            db.commit()

    # Check achievements
    from app.services.achievement_service import check_and_award
    new_badges = check_and_award(db, user.id, action="progress")
    db.commit()

    return {"id": metric.id, "message": "Mesure ajoutée", "new_achievements": new_badges}


@router.get("/metrics")
def get_metrics(
    type: str = "weight",  # weight, measurements
    period: str = "90d",
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    metrics = (
        db.query(BodyMetric)
        .filter(BodyMetric.user_id == user.id)
        .order_by(desc(BodyMetric.measured_at))
        .limit(100)
        .all()
    )

    if type == "weight":
        return [
            {"date": m.measured_at.isoformat(), "weight_kg": m.weight_kg, "body_fat_pct": m.body_fat_pct}
            for m in metrics if m.weight_kg
        ]
    else:
        return [
            {
                "date": m.measured_at.isoformat(),
                "chest_cm": m.chest_cm, "waist_cm": m.waist_cm,
                "hips_cm": m.hips_cm, "bicep_left_cm": m.bicep_left_cm,
                "thigh_left_cm": m.thigh_left_cm,
            }
            for m in metrics
        ]
