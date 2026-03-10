import json
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel, Field
from app.database import get_db
from app.models import User, UserProfile, WorkoutProgram, WorkoutLog, Exercise
from app.core.security import get_current_user
from app.services.coach_ai import generate_program_with_ai
from app.services.calculations import estimate_calories_burned

router = APIRouter(prefix="/coach", tags=["coach"])


# --- Schemas ---

class GenerateProgramRequest(BaseModel):
    goal: str = "mass_gain"
    split_type: Optional[str] = None
    duration_weeks: int = Field(default=8, ge=4, le=16)
    days_per_week: int = Field(default=4, ge=2, le=6)
    focus_muscles: Optional[List[str]] = None
    avoid_exercises: Optional[List[str]] = None
    notes: Optional[str] = None


class LogWorkoutRequest(BaseModel):
    program_id: Optional[int] = None
    started_at: str
    finished_at: Optional[str] = None
    session_rating: Optional[int] = Field(None, ge=1, le=5)
    notes: Optional[str] = None
    exercises: List[dict]  # [{exercise_id, sets_data: [{weight_kg, reps, rpe}]}]


# --- Routes ---

@router.post("/generate-program")
async def generate_program(
    req: GenerateProgramRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Get user profile
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Complète ton profil fitness d'abord")

    # Get available exercises
    exercises = db.query(Exercise).filter(Exercise.is_active == True).all()
    if not exercises:
        raise HTTPException(status_code=500, detail="Aucun exercice en base de données")

    # Generate with AI
    try:
        program_data = await generate_program_with_ai(
            profile=profile,
            exercises=exercises,
            goal=req.goal,
            split_type=req.split_type,
            duration_weeks=req.duration_weeks,
            days_per_week=req.days_per_week,
            focus_muscles=req.focus_muscles,
            avoid_exercises=req.avoid_exercises,
            notes=req.notes,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur génération IA: {str(e)}")

    # Deactivate previous programs
    db.query(WorkoutProgram).filter(
        WorkoutProgram.user_id == user.id, WorkoutProgram.is_active == True
    ).update({"is_active": False})

    # Save program
    program = WorkoutProgram(
        user_id=user.id,
        name=program_data.get("name", f"Programme {req.goal}"),
        description=program_data.get("description", ""),
        split_type=req.split_type or program_data.get("split_type", "custom"),
        duration_weeks=req.duration_weeks,
        days_per_week=req.days_per_week,
        goal=req.goal,
        program_data=program_data,
        is_active=True,
    )
    db.add(program)
    db.commit()
    db.refresh(program)

    return {
        "id": program.id,
        "name": program.name,
        "description": program.description,
        "split_type": program.split_type,
        "duration_weeks": program.duration_weeks,
        "days_per_week": program.days_per_week,
        "goal": program.goal,
        "program": program_data,
    }


@router.get("/programs")
def list_programs(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    programs = (
        db.query(WorkoutProgram)
        .filter(WorkoutProgram.user_id == user.id)
        .order_by(desc(WorkoutProgram.created_at))
        .all()
    )
    return [
        {
            "id": p.id, "name": p.name, "description": p.description,
            "split_type": p.split_type, "duration_weeks": p.duration_weeks,
            "goal": p.goal, "is_active": p.is_active,
            "created_at": p.created_at.isoformat(),
        }
        for p in programs
    ]


@router.get("/programs/{program_id}")
def get_program(program_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    program = db.query(WorkoutProgram).filter(
        WorkoutProgram.id == program_id, WorkoutProgram.user_id == user.id
    ).first()
    if not program:
        raise HTTPException(status_code=404, detail="Programme introuvable")

    return {
        "id": program.id, "name": program.name, "description": program.description,
        "split_type": program.split_type, "duration_weeks": program.duration_weeks,
        "days_per_week": program.days_per_week, "goal": program.goal,
        "is_active": program.is_active,
        "program": program.program_data,
        "created_at": program.created_at.isoformat(),
    }


@router.get("/exercises")
def list_exercises(
    muscle: Optional[str] = None,
    equipment: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Exercise).filter(Exercise.is_active == True)
    if muscle:
        query = query.filter(Exercise.muscle_primary == muscle)
    if equipment:
        query = query.filter(Exercise.equipment == equipment)
    if search:
        query = query.filter(Exercise.name.ilike(f"%{search}%"))

    exercises = query.order_by(Exercise.muscle_primary, Exercise.name).all()
    return [
        {
            "id": e.id, "name": e.name, "name_en": e.name_en,
            "muscle_primary": e.muscle_primary, "muscle_secondary": e.muscle_secondary,
            "equipment": e.equipment, "movement_type": e.movement_type,
            "difficulty": e.difficulty, "met_value": e.met_value,
            "video_url": e.video_url, "instructions": e.instructions,
        }
        for e in exercises
    ]


@router.post("/workouts/log")
def log_workout(
    req: LogWorkoutRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    weight_kg = profile.current_weight_kg if profile else 75

    # Calculate totals
    total_volume = 0
    total_sets = 0
    total_calories = 0
    rpe_sum = 0
    rpe_count = 0

    for ex_data in req.exercises:
        exercise = db.query(Exercise).filter(Exercise.id == ex_data.get("exercise_id")).first()
        met = exercise.met_value if exercise else 5.0

        for s in ex_data.get("sets_data", []):
            w = s.get("weight_kg", 0)
            r = s.get("reps", 0)
            total_volume += w * r
            total_sets += 1
            if s.get("rpe"):
                rpe_sum += s["rpe"]
                rpe_count += 1

        # Estimate ~2min per set for calorie calc
        set_count = len(ex_data.get("sets_data", []))
        duration_min = set_count * 2
        total_calories += estimate_calories_burned(met, weight_kg, duration_min)

    log = WorkoutLog(
        user_id=user.id,
        program_id=req.program_id,
        started_at=req.started_at,
        finished_at=req.finished_at,
        total_volume=round(total_volume, 1),
        total_sets=total_sets,
        estimated_calories=round(total_calories, 0),
        average_rpe=round(rpe_sum / rpe_count, 1) if rpe_count > 0 else None,
        session_rating=req.session_rating,
        notes=req.notes,
        exercises_data=req.exercises,
    )
    db.add(log)
    db.commit()
    db.refresh(log)

    # Check achievements
    from app.services.achievement_service import check_and_award
    new_badges = check_and_award(db, user.id, action="workout")
    db.commit()

    return {
        "id": log.id,
        "total_volume": log.total_volume,
        "total_sets": log.total_sets,
        "estimated_calories": log.estimated_calories,
        "average_rpe": log.average_rpe,
        "new_achievements": new_badges,
    }


@router.get("/workouts/history")
def workout_history(
    period: str = "30d",
    page: int = 1,
    per_page: int = 20,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = (
        db.query(WorkoutLog)
        .filter(WorkoutLog.user_id == user.id)
        .order_by(desc(WorkoutLog.started_at))
    )

    logs = query.offset((page - 1) * per_page).limit(per_page).all()
    return [
        {
            "id": l.id, "started_at": l.started_at.isoformat(),
            "finished_at": l.finished_at.isoformat() if l.finished_at else None,
            "duration_minutes": l.duration_minutes,
            "total_volume": l.total_volume, "total_sets": l.total_sets,
            "estimated_calories": l.estimated_calories,
            "session_rating": l.session_rating,
            "exercises_count": len(l.exercises_data) if l.exercises_data else 0,
        }
        for l in logs
    ]
