"""Fitness calculation helpers."""


def calculate_bmr(sex: str, weight_kg: float, height_cm: float, age: int) -> float:
    """Mifflin-St Jeor equation for Basal Metabolic Rate."""
    if sex == "male":
        return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5
    else:
        return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161


def calculate_tdee(bmr: float, activity_level: int) -> float:
    """Total Daily Energy Expenditure based on activity level (1-5)."""
    multipliers = {1: 1.2, 2: 1.375, 3: 1.55, 4: 1.725, 5: 1.9}
    return bmr * multipliers.get(activity_level, 1.55)


def calculate_macros(tdee: float, goal: str, weight_kg: float) -> dict:
    """Calculate macro targets based on fitness goal."""
    goals = {
        "mass_gain":  {"cal_adj": 350,  "prot_mult": 2.0, "fat_mult": 1.0},
        "cut":        {"cal_adj": -400, "prot_mult": 2.2, "fat_mult": 0.8},
        "recomp":     {"cal_adj": 0,    "prot_mult": 2.0, "fat_mult": 0.9},
        "strength":   {"cal_adj": 200,  "prot_mult": 2.0, "fat_mult": 1.0},
        "endurance":  {"cal_adj": 100,  "prot_mult": 1.6, "fat_mult": 1.0},
        "general":    {"cal_adj": 0,    "prot_mult": 1.8, "fat_mult": 1.0},
    }

    g = goals.get(goal, goals["general"])
    target_cal = tdee + g["cal_adj"]
    protein_g = weight_kg * g["prot_mult"]
    fat_g = weight_kg * g["fat_mult"]
    carbs_g = (target_cal - protein_g * 4 - fat_g * 9) / 4

    return {
        "target_calories": round(target_cal),
        "target_protein_g": round(protein_g),
        "target_carbs_g": round(max(carbs_g, 50)),
        "target_fat_g": round(fat_g),
    }


def estimate_calories_burned(met: float, weight_kg: float, duration_min: float) -> float:
    """Estimate calories burned using MET formula."""
    return met * weight_kg * (duration_min / 60)


def estimate_1rm(weight: float, reps: int) -> float:
    """Brzycki formula for estimated 1RM."""
    if reps <= 0 or reps >= 37:
        return weight
    if reps == 1:
        return weight
    return round(weight * (36 / (37 - reps)), 1)


def update_profile_macros(profile) -> dict:
    """Recalculate and return macros for a user profile."""
    if not all([profile.sex, profile.current_weight_kg, profile.height_cm, profile.birth_date]):
        return {}

    from datetime import date
    age = date.today().year - profile.birth_date.year

    bmr = calculate_bmr(profile.sex, profile.current_weight_kg, profile.height_cm, age)
    tdee = calculate_tdee(bmr, profile.experience_level)
    macros = calculate_macros(tdee, profile.primary_goal or "general", profile.current_weight_kg)

    return {
        "bmr": round(bmr),
        "tdee": round(tdee),
        **macros,
    }
