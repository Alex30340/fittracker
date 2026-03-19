"""
Routes API Fitness : calcul TDEE, calories par exercice, session complète.
"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# MET values (Metabolic Equivalent of Task)
MET = {
    "squat":6.0, "deadlift":6.0, "bench_press":5.0, "overhead_press":5.0,
    "rowing":5.5, "pullup":8.0, "dip":8.0, "lunge":6.0,
    "leg_press":5.0, "leg_curl":4.0, "leg_extension":4.0,
    "curl":3.5, "tricep_extension":3.5, "lateral_raise":3.0,
    "face_pull":3.0, "plank":3.8, "crunch":3.5,
    "hip_thrust":5.5, "calf_raise":3.0, "shrug":3.5,
    "default_compound":5.5, "default_isolation":3.5, "default_cardio":8.0,
}


class ExerciseLog(BaseModel):
    exercise_name: str
    exercise_type: str = "default_compound"
    sets: int
    reps_per_set: int
    weight_kg: float = 0
    rest_seconds: int = 90
    user_weight_kg: float = 75


class SessionLog(BaseModel):
    exercises: list[ExerciseLog]


class ProfileCalc(BaseModel):
    age: int
    weight_kg: float
    height_cm: float
    sex: str  # "M" or "F"
    activity_level: float = 1.55
    goal: str = "maintain"  # "bulk", "cut", "maintain"


@router.post("/calories")
def calc_exercise_calories(log: ExerciseLog):
    """Calories brûlées pour un exercice (basé sur MET)."""
    met = MET.get(log.exercise_type, MET["default_compound"])
    time_per_set = log.reps_per_set * 3  # ~3s/rep
    active_sec = time_per_set * log.sets
    rest_sec = log.rest_seconds * (log.sets - 1)
    total_min = (active_sec + rest_sec) / 60

    active_cal = met * log.user_weight_kg * (active_sec / 3600)
    rest_cal = 1.5 * log.user_weight_kg * (rest_sec / 3600)
    total_cal = round(active_cal + rest_cal, 1)
    volume = log.sets * log.reps_per_set * log.weight_kg

    return {
        "exercise": log.exercise_name,
        "calories_burned": total_cal,
        "total_time_min": round(total_min, 1),
        "volume_kg": round(volume, 1),
        "met_used": met,
    }


@router.post("/session-calories")
def calc_session(session: SessionLog):
    """Calories totales d'une séance complète."""
    total_cal = total_time = total_vol = 0
    details = []
    for ex in session.exercises:
        r = calc_exercise_calories(ex)
        total_cal += r["calories_burned"]
        total_time += r["total_time_min"]
        total_vol += r["volume_kg"]
        details.append(r)
    return {
        "total_calories": round(total_cal, 1),
        "total_time_min": round(total_time, 1),
        "total_volume_kg": round(total_vol, 1),
        "exercise_count": len(session.exercises),
        "details": details,
    }


@router.post("/tdee")
def calc_tdee(p: ProfileCalc):
    """Calcul BMR (Mifflin-St Jeor), TDEE et macros."""
    if p.sex.upper() in ("M", "HOMME"):
        bmr = 10 * p.weight_kg + 6.25 * p.height_cm - 5 * p.age + 5
    else:
        bmr = 10 * p.weight_kg + 6.25 * p.height_cm - 5 * p.age - 161

    tdee = round(bmr * p.activity_level)

    if p.goal == "bulk":
        target = tdee + 300
    elif p.goal == "cut":
        target = tdee - 400
    else:
        target = tdee

    prot_g = round(p.weight_kg * 2.0)
    fat_g = round(p.weight_kg * 1.0)
    carbs_g = max(round((target - prot_g * 4 - fat_g * 9) / 4), 50)

    return {
        "bmr": round(bmr),
        "tdee": tdee,
        "target_calories": target,
        "macros": {"protein_g": prot_g, "carbs_g": carbs_g, "fat_g": fat_g},
        "ratios": {
            "protein_pct": round(prot_g * 4 / target * 100),
            "carbs_pct": round(carbs_g * 4 / target * 100),
            "fat_pct": round(fat_g * 9 / target * 100),
        },
    }
