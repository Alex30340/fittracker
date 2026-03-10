import json
from typing import Optional, List
from app.config import get_settings
from app.models import UserProfile, Exercise

settings = get_settings()

PROGRAM_PROMPT = """Tu es un coach sportif expert en programmation d'entraînement.
Génère un programme d'entraînement personnalisé en JSON structuré.

PROFIL UTILISATEUR :
- Sexe : {sex}
- Poids : {weight} kg
- Taille : {height} cm
- Niveau : {level}/5
- Objectif : {goal}
- Jours disponibles : {days}/semaine
- Durée séance : {duration} min
- Équipement : {equipment}
- Blessures/limitations : {injuries}

PARAMÈTRES :
- Split demandé : {split_type}
- Durée : {weeks} semaines
- Focus : {focus}
- Notes : {notes}

EXERCICES DISPONIBLES (utilise UNIQUEMENT ces IDs) :
{exercises_list}

CONSIGNES :
1. Utilise uniquement les IDs d'exercices fournis
2. Adapte charge et volume au niveau
3. Progression semaine par semaine
4. Deload toutes les 4 semaines
5. Chaque séance < {duration} minutes
6. Respecte les limitations

Réponds UNIQUEMENT en JSON valide (pas de markdown, pas de backticks) :
{{
  "name": "Nom du programme",
  "description": "Description courte",
  "split_type": "ppl",
  "weeks": [
    {{
      "week_number": 1,
      "theme": "Adaptation",
      "intensity_pct": 70,
      "sessions": [
        {{
          "day_of_week": 1,
          "session_type": "push",
          "name": "Push - Pectoraux & Épaules",
          "estimated_duration_min": 55,
          "exercises": [
            {{
              "exercise_id": 1,
              "exercise_name": "Développé couché",
              "sets": 3,
              "reps_target": "10-12",
              "rest_seconds": 90,
              "rpe_target": 7,
              "notes": ""
            }}
          ]
        }}
      ]
    }}
  ]
}}"""


async def generate_program_with_ai(
    profile: UserProfile,
    exercises: List[Exercise],
    goal: str,
    split_type: Optional[str],
    duration_weeks: int,
    days_per_week: int,
    focus_muscles: Optional[List[str]] = None,
    avoid_exercises: Optional[List[str]] = None,
    notes: Optional[str] = None,
) -> dict:
    """Generate a workout program using Claude API."""

    # If no API key, return a template program
    if not settings.anthropic_api_key:
        return _generate_template_program(
            profile, exercises, goal, split_type, duration_weeks, days_per_week
        )

    import anthropic
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    # Build exercises list
    ex_list = "\n".join(
        f"ID:{e.id} | {e.name} | {e.muscle_primary} | {e.equipment} | diff:{e.difficulty}"
        for e in exercises
    )

    # Calculate age from birth_date
    age = "inconnu"
    if profile.birth_date:
        from datetime import date
        today = date.today()
        age = today.year - profile.birth_date.year

    prompt = PROGRAM_PROMPT.format(
        sex=profile.sex or "non précisé",
        weight=profile.current_weight_kg or 75,
        height=profile.height_cm or 175,
        level=profile.experience_level,
        goal=goal,
        days=days_per_week,
        duration=profile.session_duration_min,
        equipment=profile.equipment,
        injuries=", ".join(profile.injuries) if profile.injuries else "aucune",
        split_type=split_type or "au choix de l'IA",
        weeks=duration_weeks,
        focus=", ".join(focus_muscles) if focus_muscles else "aucun focus particulier",
        notes=notes or "aucune",
        exercises_list=ex_list,
    )

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}],
    )

    # Parse response
    text = message.content[0].text.strip()
    # Remove potential markdown fences
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
    if text.endswith("```"):
        text = text.rsplit("```", 1)[0]

    return json.loads(text)


def _generate_template_program(
    profile: UserProfile,
    exercises: List[Exercise],
    goal: str,
    split_type: Optional[str],
    duration_weeks: int,
    days_per_week: int,
) -> dict:
    """Fallback: generate a basic template program without AI."""
    
    # Group exercises by muscle
    by_muscle = {}
    for e in exercises:
        by_muscle.setdefault(e.muscle_primary, []).append(e)

    # Simple PPL split
    push_muscles = ["chest", "shoulders", "triceps"]
    pull_muscles = ["back", "biceps"]
    leg_muscles = ["quads", "hamstrings", "glutes", "calves"]

    def make_session(name, stype, muscles, sets=3, reps="10-12"):
        exs = []
        for m in muscles:
            available = by_muscle.get(m, [])
            for e in available[:2]:  # Max 2 per muscle
                exs.append({
                    "exercise_id": e.id,
                    "exercise_name": e.name,
                    "sets": sets,
                    "reps_target": reps,
                    "rest_seconds": 90,
                    "rpe_target": 7,
                    "notes": "",
                })
        return {"day_of_week": 0, "session_type": stype, "name": name,
                "estimated_duration_min": len(exs) * 8, "exercises": exs}

    push_session = make_session("Push", "push", push_muscles)
    pull_session = make_session("Pull", "pull", pull_muscles)
    legs_session = make_session("Legs", "legs", leg_muscles)

    # Build weeks
    weeks = []
    sessions_template = [push_session, pull_session, legs_session, push_session][:days_per_week]
    
    for w in range(1, duration_weeks + 1):
        intensity = 70 + min(w * 3, 25) if w % 4 != 0 else 60
        theme = "Deload" if w % 4 == 0 else f"Semaine {w}"
        
        sessions = []
        for i, s in enumerate(sessions_template):
            session = {**s, "day_of_week": i + 1}
            sessions.append(session)
        
        weeks.append({
            "week_number": w,
            "theme": theme,
            "intensity_pct": intensity,
            "sessions": sessions,
        })

    return {
        "name": f"Programme {goal.replace('_', ' ').title()}",
        "description": f"Programme {duration_weeks} semaines, {days_per_week}j/sem, objectif {goal}",
        "split_type": split_type or "ppl",
        "weeks": weeks,
    }
