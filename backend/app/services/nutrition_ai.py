"""
Nutrition AI Service - Generate personalized meal plans using Claude API.

Generates 7-day meal plans with:
- Macro targets based on user profile
- Dietary preferences support (vegetarian, vegan, gluten-free, etc.)
- Shopping list generation
- Supplement recommendations from the product catalog
"""

import json
import logging
from typing import Optional, List
from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


NUTRITION_PLAN_PROMPT = """Tu es un nutritionniste sportif expert, spécialisé en nutrition pour la performance.
Génère un plan alimentaire personnalisé sur 7 jours en JSON structuré.

PROFIL UTILISATEUR :
- Sexe : {sex}
- Âge : {age} ans
- Poids : {weight} kg
- Taille : {height} cm
- Objectif : {goal}
- Niveau sportif : {level}/5
- Jours d'entraînement : {training_days}/semaine

OBJECTIFS NUTRITIONNELS :
- Calories cibles : {target_cal} kcal/jour
- Protéines : {target_prot}g/jour
- Glucides : {target_carbs}g/jour
- Lipides : {target_fat}g/jour

CONTRAINTES :
- Nombre de repas : {meals_per_day}/jour
- Régime : {dietary_type}
- Allergies / exclusions : {exclusions}
- Aliments préférés : {favorites}
- Temps de cuisine max : {cooking_time} min/repas
- Budget : {budget}

CONSIGNES IMPORTANTES :
1. Respecte les macros cibles (tolérance ±5%)
2. Utilise des aliments courants, accessibles en France
3. Varie les repas sur les 7 jours (pas les mêmes chaque jour)
4. Adapte les jours d'entraînement (plus de glucides) vs repos (moins de glucides)
5. Les quantités doivent être en grammes
6. Recettes simples et rapides à préparer
7. Inclus les collations pré et post-entraînement les jours de sport
8. Suggère des suppléments adaptés au profil

JOURS D'ENTRAÎNEMENT : {training_schedule}

Réponds UNIQUEMENT en JSON valide (pas de markdown, pas de backticks) :
{{
  "name": "Plan {goal_label} - {target_cal}kcal",
  "description": "Plan sur 7 jours adapté à ton profil",
  "daily_targets": {{
    "calories": {target_cal},
    "protein_g": {target_prot},
    "carbs_g": {target_carbs},
    "fat_g": {target_fat}
  }},
  "days": [
    {{
      "day_number": 1,
      "day_name": "Lundi",
      "is_training_day": true,
      "daily_totals": {{
        "calories": 2400,
        "protein_g": 180,
        "carbs_g": 280,
        "fat_g": 75
      }},
      "meals": [
        {{
          "meal_type": "breakfast",
          "time": "07:30",
          "name": "Petit-déjeuner protéiné",
          "foods": [
            {{
              "name": "Flocons d'avoine",
              "quantity_g": 80,
              "calories": 294,
              "protein_g": 10.8,
              "carbs_g": 46.4,
              "fat_g": 5.6
            }}
          ],
          "total_calories": 510,
          "total_protein_g": 42,
          "total_carbs_g": 62,
          "total_fat_g": 12,
          "prep_time_min": 5,
          "recipe": "Mélanger les flocons avec de l'eau chaude, ajouter la whey et la banane coupée."
        }}
      ]
    }}
  ],
  "shopping_list": [
    {{
      "name": "Flocons d'avoine",
      "quantity": "500g",
      "estimated_price_eur": 1.80,
      "category": "cereales"
    }}
  ],
  "supplements": [
    {{
      "name": "Whey Isolate",
      "dosage": "30g post-entraînement",
      "timing": "Dans les 30min après la séance",
      "reason": "Récupération musculaire et synthèse protéique"
    }},
    {{
      "name": "Créatine Monohydrate",
      "dosage": "5g/jour",
      "timing": "À n'importe quel moment de la journée",
      "reason": "Amélioration de la force et de la puissance"
    }}
  ],
  "tips": [
    "Bois au minimum 2.5L d'eau par jour",
    "Prépare tes repas le dimanche pour la semaine (meal prep)"
  ]
}}"""


GOAL_LABELS = {
    "mass_gain": "Prise de masse",
    "cut": "Sèche",
    "recomp": "Recomposition corporelle",
    "strength": "Force",
    "endurance": "Endurance",
    "general": "Forme générale",
}

DIETARY_LABELS = {
    "standard": "Standard (omnivore)",
    "vegetarian": "Végétarien",
    "vegan": "Végan",
    "pescatarian": "Pescétarien",
    "keto": "Keto / Low-carb",
    "gluten_free": "Sans gluten",
    "lactose_free": "Sans lactose",
    "halal": "Halal",
}


async def generate_nutrition_plan_with_ai(
    profile: dict,
    target_calories: float,
    target_protein_g: float,
    target_carbs_g: float,
    target_fat_g: float,
    meals_per_day: int = 5,
    dietary_type: str = "standard",
    exclusions: Optional[List[str]] = None,
    favorites: Optional[List[str]] = None,
    cooking_time_max: Optional[int] = None,
    budget: str = "medium",
    training_days: Optional[List[int]] = None,
    notes: Optional[str] = None,
) -> dict:
    """Generate a personalized nutrition plan using Claude API."""

    # If no API key, return template plan
    if not settings.anthropic_api_key:
        return _generate_template_plan(
            target_calories, target_protein_g, target_carbs_g, target_fat_g,
            meals_per_day, dietary_type,
        )

    import anthropic
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    # Build training schedule
    day_names = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
    t_days = training_days or [1, 2, 4, 5]  # default PPL
    training_schedule = ", ".join(day_names[d - 1] for d in t_days if 1 <= d <= 7)

    # Calculate age
    age = "inconnu"
    if profile.get("birth_date"):
        from datetime import date
        bd = profile["birth_date"]
        if isinstance(bd, str):
            bd = date.fromisoformat(bd)
        age = date.today().year - bd.year

    prompt = NUTRITION_PLAN_PROMPT.format(
        sex=profile.get("sex", "non précisé"),
        age=age,
        weight=profile.get("current_weight_kg", 75),
        height=profile.get("height_cm", 175),
        goal=profile.get("primary_goal", "general"),
        goal_label=GOAL_LABELS.get(profile.get("primary_goal", "general"), "Forme"),
        level=profile.get("experience_level", 3),
        training_days=len(t_days),
        target_cal=int(target_calories),
        target_prot=int(target_protein_g),
        target_carbs=int(target_carbs_g),
        target_fat=int(target_fat_g),
        meals_per_day=meals_per_day,
        dietary_type=DIETARY_LABELS.get(dietary_type, dietary_type),
        exclusions=", ".join(exclusions) if exclusions else "aucune",
        favorites=", ".join(favorites) if favorites else "pas de préférence",
        cooking_time=cooking_time_max or 20,
        budget={"low": "serré (< 50€/sem)", "medium": "moyen (50-80€/sem)", "high": "confortable (> 80€/sem)"}.get(budget, "moyen"),
        training_schedule=training_schedule,
    )

    if notes:
        prompt += f"\n\nNOTES SUPPLÉMENTAIRES DE L'UTILISATEUR : {notes}"

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=8000,
        messages=[{"role": "user", "content": prompt}],
    )

    text = message.content[0].text.strip()
    # Clean markdown fences
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]

    plan = json.loads(text)

    # Validate totals
    _validate_plan(plan, target_calories, target_protein_g)

    return plan


def _validate_plan(plan: dict, target_cal: float, target_prot: float):
    """Basic validation of generated plan."""
    days = plan.get("days", [])
    if len(days) < 7:
        logger.warning(f"[NUTRITION_AI] Plan has only {len(days)} days instead of 7")

    for day in days:
        day_cal = day.get("daily_totals", {}).get("calories", 0)
        if day_cal > 0:
            deviation = abs(day_cal - target_cal) / target_cal * 100
            if deviation > 15:
                logger.warning(
                    f"[NUTRITION_AI] Day {day.get('day_number')}: {day_cal}kcal "
                    f"deviates {deviation:.0f}% from target {target_cal}kcal"
                )


def _generate_template_plan(
    target_cal: float,
    target_prot: float,
    target_carbs: float,
    target_fat: float,
    meals_per_day: int,
    dietary_type: str,
) -> dict:
    """Fallback: generate a basic template meal plan without AI."""

    # Base meals templates
    breakfast_options = [
        {"name": "Petit-déj protéiné classique", "foods": [
            {"name": "Flocons d'avoine", "quantity_g": 80, "calories": 294, "protein_g": 10.8, "carbs_g": 46.4, "fat_g": 5.6},
            {"name": "Whey Isolate", "quantity_g": 30, "calories": 110, "protein_g": 27, "carbs_g": 1, "fat_g": 0.5},
            {"name": "Banane", "quantity_g": 120, "calories": 107, "protein_g": 1.3, "carbs_g": 27.4, "fat_g": 0.4},
        ]},
        {"name": "Oeufs & tartines", "foods": [
            {"name": "Oeufs entiers", "quantity_g": 150, "calories": 233, "protein_g": 18.9, "carbs_g": 1.7, "fat_g": 17},
            {"name": "Pain complet", "quantity_g": 80, "calories": 198, "protein_g": 6.8, "carbs_g": 36.8, "fat_g": 2.8},
            {"name": "Fromage blanc 0%", "quantity_g": 150, "calories": 74, "protein_g": 12, "carbs_g": 5.3, "fat_g": 0.3},
        ]},
        {"name": "Smoothie protéiné", "foods": [
            {"name": "Whey Isolate", "quantity_g": 30, "calories": 110, "protein_g": 27, "carbs_g": 1, "fat_g": 0.5},
            {"name": "Banane", "quantity_g": 120, "calories": 107, "protein_g": 1.3, "carbs_g": 27.4, "fat_g": 0.4},
            {"name": "Beurre de cacahuète", "quantity_g": 20, "calories": 118, "protein_g": 5, "carbs_g": 4, "fat_g": 10},
            {"name": "Lait demi-écrémé", "quantity_g": 250, "calories": 115, "protein_g": 8, "carbs_g": 12, "fat_g": 4},
        ]},
    ]

    lunch_options = [
        {"name": "Poulet riz brocolis", "foods": [
            {"name": "Poulet grillé", "quantity_g": 180, "calories": 297, "protein_g": 55.8, "carbs_g": 0, "fat_g": 6.5},
            {"name": "Riz complet cuit", "quantity_g": 200, "calories": 246, "protein_g": 5.4, "carbs_g": 51.2, "fat_g": 2},
            {"name": "Brocolis", "quantity_g": 200, "calories": 68, "protein_g": 5.6, "carbs_g": 13.2, "fat_g": 0.8},
        ]},
        {"name": "Saumon patate douce", "foods": [
            {"name": "Saumon", "quantity_g": 150, "calories": 312, "protein_g": 30, "carbs_g": 0, "fat_g": 20.1},
            {"name": "Patate douce", "quantity_g": 250, "calories": 215, "protein_g": 4, "carbs_g": 50.3, "fat_g": 0.3},
            {"name": "Salade verte", "quantity_g": 100, "calories": 15, "protein_g": 1.4, "carbs_g": 2, "fat_g": 0.2},
        ]},
        {"name": "Boeuf haché quinoa", "foods": [
            {"name": "Boeuf haché 5%", "quantity_g": 150, "calories": 195, "protein_g": 30, "carbs_g": 0, "fat_g": 7.5},
            {"name": "Quinoa cuit", "quantity_g": 200, "calories": 240, "protein_g": 8.8, "carbs_g": 42, "fat_g": 3.6},
            {"name": "Courgette", "quantity_g": 200, "calories": 34, "protein_g": 2.4, "carbs_g": 6.2, "fat_g": 0.6},
        ]},
    ]

    snack_options = [
        {"name": "Collation amandes", "foods": [
            {"name": "Amandes", "quantity_g": 30, "calories": 174, "protein_g": 6.4, "carbs_g": 6.5, "fat_g": 15},
            {"name": "Pomme", "quantity_g": 150, "calories": 78, "protein_g": 0.4, "carbs_g": 20.7, "fat_g": 0.3},
        ]},
        {"name": "Yaourt grec", "foods": [
            {"name": "Yaourt grec 0%", "quantity_g": 170, "calories": 100, "protein_g": 17, "carbs_g": 6, "fat_g": 0.7},
            {"name": "Miel", "quantity_g": 10, "calories": 30, "protein_g": 0, "carbs_g": 8, "fat_g": 0},
        ]},
    ]

    dinner_options = [
        {"name": "Thon salade composée", "foods": [
            {"name": "Thon en conserve", "quantity_g": 150, "calories": 174, "protein_g": 38.3, "carbs_g": 0, "fat_g": 1.5},
            {"name": "Riz complet cuit", "quantity_g": 150, "calories": 185, "protein_g": 4.1, "carbs_g": 38.4, "fat_g": 1.5},
            {"name": "Avocat", "quantity_g": 80, "calories": 128, "protein_g": 1.6, "carbs_g": 6.8, "fat_g": 11.8},
        ]},
        {"name": "Omelette légumes", "foods": [
            {"name": "Oeufs entiers", "quantity_g": 200, "calories": 310, "protein_g": 25.2, "carbs_g": 2.2, "fat_g": 22.6},
            {"name": "Champignons", "quantity_g": 100, "calories": 22, "protein_g": 3.1, "carbs_g": 3.3, "fat_g": 0.3},
            {"name": "Pain complet", "quantity_g": 60, "calories": 148, "protein_g": 5.1, "carbs_g": 27.6, "fat_g": 2.1},
        ]},
    ]

    day_names = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"]
    training_days_set = {1, 2, 4, 5}

    days = []
    for d in range(7):
        is_training = (d + 1) in training_days_set
        day_meals = []

        # Pick meals with rotation
        bf = breakfast_options[d % len(breakfast_options)]
        day_meals.append({"meal_type": "breakfast", "time": "07:30", **bf,
            "total_calories": sum(f["calories"] for f in bf["foods"]),
            "total_protein_g": round(sum(f["protein_g"] for f in bf["foods"]), 1),
            "total_carbs_g": round(sum(f["carbs_g"] for f in bf["foods"]), 1),
            "total_fat_g": round(sum(f["fat_g"] for f in bf["foods"]), 1),
            "prep_time_min": 5, "recipe": "Préparation simple."})

        if meals_per_day >= 4:
            sn = snack_options[d % len(snack_options)]
            day_meals.append({"meal_type": "snack_am", "time": "10:30", **sn,
                "total_calories": sum(f["calories"] for f in sn["foods"]),
                "total_protein_g": round(sum(f["protein_g"] for f in sn["foods"]), 1),
                "total_carbs_g": round(sum(f["carbs_g"] for f in sn["foods"]), 1),
                "total_fat_g": round(sum(f["fat_g"] for f in sn["foods"]), 1),
                "prep_time_min": 2, "recipe": ""})

        ln = lunch_options[d % len(lunch_options)]
        day_meals.append({"meal_type": "lunch", "time": "12:30", **ln,
            "total_calories": sum(f["calories"] for f in ln["foods"]),
            "total_protein_g": round(sum(f["protein_g"] for f in ln["foods"]), 1),
            "total_carbs_g": round(sum(f["carbs_g"] for f in ln["foods"]), 1),
            "total_fat_g": round(sum(f["fat_g"] for f in ln["foods"]), 1),
            "prep_time_min": 15, "recipe": "Cuisson à la poêle ou au four."})

        if meals_per_day >= 5:
            sn2 = snack_options[(d + 1) % len(snack_options)]
            day_meals.append({"meal_type": "snack_pm", "time": "16:00", **sn2,
                "total_calories": sum(f["calories"] for f in sn2["foods"]),
                "total_protein_g": round(sum(f["protein_g"] for f in sn2["foods"]), 1),
                "total_carbs_g": round(sum(f["carbs_g"] for f in sn2["foods"]), 1),
                "total_fat_g": round(sum(f["fat_g"] for f in sn2["foods"]), 1),
                "prep_time_min": 2, "recipe": ""})

        dn = dinner_options[d % len(dinner_options)]
        day_meals.append({"meal_type": "dinner", "time": "19:30", **dn,
            "total_calories": sum(f["calories"] for f in dn["foods"]),
            "total_protein_g": round(sum(f["protein_g"] for f in dn["foods"]), 1),
            "total_carbs_g": round(sum(f["carbs_g"] for f in dn["foods"]), 1),
            "total_fat_g": round(sum(f["fat_g"] for f in dn["foods"]), 1),
            "prep_time_min": 15, "recipe": "Préparation simple."})

        day_totals = {
            "calories": sum(m["total_calories"] for m in day_meals),
            "protein_g": round(sum(m["total_protein_g"] for m in day_meals), 1),
            "carbs_g": round(sum(m["total_carbs_g"] for m in day_meals), 1),
            "fat_g": round(sum(m["total_fat_g"] for m in day_meals), 1),
        }

        days.append({
            "day_number": d + 1,
            "day_name": day_names[d],
            "is_training_day": is_training,
            "daily_totals": day_totals,
            "meals": day_meals,
        })

    # Shopping list
    all_foods = {}
    for day in days:
        for meal in day["meals"]:
            for food in meal["foods"]:
                name = food["name"]
                if name not in all_foods:
                    all_foods[name] = 0
                all_foods[name] += food["quantity_g"]

    shopping_list = [
        {"name": name, "quantity": f"{int(qty * 1)}g/semaine", "estimated_price_eur": round(qty * 0.008, 2), "category": "divers"}
        for name, qty in sorted(all_foods.items())
    ]

    return {
        "name": f"Plan Template - {int(target_cal)}kcal",
        "description": f"Plan basique 7 jours, {meals_per_day} repas/jour. Personnalise avec une clé API Claude pour des plans sur-mesure.",
        "daily_targets": {
            "calories": int(target_cal),
            "protein_g": int(target_prot),
            "carbs_g": int(target_carbs),
            "fat_g": int(target_fat),
        },
        "days": days,
        "shopping_list": shopping_list,
        "supplements": [
            {"name": "Whey Isolate", "dosage": "30g", "timing": "Post-entraînement", "reason": "Récupération musculaire"},
            {"name": "Créatine Monohydrate", "dosage": "5g/jour", "timing": "Quotidien", "reason": "Force et puissance"},
        ],
        "tips": [
            "Bois au minimum 2L d'eau par jour",
            "Prépare tes repas à l'avance le dimanche",
            "Ajuste les portions selon ta faim et ta progression",
        ],
    }
