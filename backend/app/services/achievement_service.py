"""
Achievement Service - Automatic detection and awarding of badges.

This service checks user activity against achievement conditions
and awards badges + XP automatically.

Call `check_and_award(db, user_id)` after any significant action:
- After logging a workout
- After logging food
- After adding a body metric
- After posting a review/comment
- After adding a favorite
- After creating a price alert
"""

import logging
from datetime import date, datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import User, WorkoutLog, FoodLog, BodyMetric, Review, ProductComment, UserFavorite
from app.models.achievements import Achievement, UserAchievement, UserXP

logger = logging.getLogger(__name__)

# XP per level: level N requires N * 100 XP
def _level_for_xp(total_xp: int) -> int:
    level = 1
    threshold = 100
    while total_xp >= threshold:
        level += 1
        threshold += level * 100
    return level


def _get_or_create_xp(db: Session, user_id: int) -> UserXP:
    xp = db.query(UserXP).filter(UserXP.user_id == user_id).first()
    if not xp:
        xp = UserXP(user_id=user_id, total_xp=0, level=1, current_streak_days=0, longest_streak_days=0)
        db.add(xp)
        db.flush()
    return xp


def _has_achievement(db: Session, user_id: int, slug: str) -> bool:
    return db.query(UserAchievement).join(Achievement).filter(
        UserAchievement.user_id == user_id,
        Achievement.slug == slug,
    ).first() is not None


def _award(db: Session, user_id: int, achievement: Achievement) -> Optional[dict]:
    """Award an achievement to a user. Returns achievement data if newly awarded, None if already had it."""
    if _has_achievement(db, user_id, achievement.slug):
        return None

    ua = UserAchievement(user_id=user_id, achievement_id=achievement.id)
    db.add(ua)

    # Add XP
    xp = _get_or_create_xp(db, user_id)
    xp.total_xp += achievement.xp_reward
    xp.level = _level_for_xp(xp.total_xp)

    logger.info(f"[ACHIEVEMENTS] Awarded '{achievement.slug}' to user {user_id} (+{achievement.xp_reward} XP)")

    return {
        "slug": achievement.slug,
        "name": achievement.name,
        "description": achievement.description,
        "icon": achievement.icon,
        "xp_reward": achievement.xp_reward,
    }


def update_streak(db: Session, user_id: int):
    """Update the user's activity streak. Call after any activity."""
    xp = _get_or_create_xp(db, user_id)
    today = date.today().isoformat()

    if xp.last_activity_date == today:
        return  # Already active today

    yesterday = (date.today() - timedelta(days=1)).isoformat()

    if xp.last_activity_date == yesterday:
        xp.current_streak_days += 1
    elif xp.last_activity_date is None or xp.last_activity_date < yesterday:
        xp.current_streak_days = 1

    if xp.current_streak_days > xp.longest_streak_days:
        xp.longest_streak_days = xp.current_streak_days

    xp.last_activity_date = today


def check_and_award(db: Session, user_id: int, action: str = "general") -> List[dict]:
    """
    Check all achievement conditions and award any newly earned badges.
    
    Args:
        db: Database session
        user_id: User ID to check
        action: Type of action that triggered the check (workout, nutrition, review, etc.)
    
    Returns:
        List of newly awarded achievements
    """
    # Update streak first
    update_streak(db, user_id)

    achievements = db.query(Achievement).all()
    if not achievements:
        _seed_achievements(db)
        achievements = db.query(Achievement).all()

    newly_awarded = []

    for ach in achievements:
        # Skip if already earned
        if _has_achievement(db, user_id, ach.slug):
            continue

        earned = False

        # --- WORKOUT achievements ---
        if ach.slug == "first_workout":
            count = db.query(func.count(WorkoutLog.id)).filter(WorkoutLog.user_id == user_id).scalar()
            earned = count >= 1

        elif ach.slug == "sessions_10":
            count = db.query(func.count(WorkoutLog.id)).filter(WorkoutLog.user_id == user_id).scalar()
            earned = count >= 10

        elif ach.slug == "sessions_50":
            count = db.query(func.count(WorkoutLog.id)).filter(WorkoutLog.user_id == user_id).scalar()
            earned = count >= 50

        elif ach.slug == "sessions_100":
            count = db.query(func.count(WorkoutLog.id)).filter(WorkoutLog.user_id == user_id).scalar()
            earned = count >= 100

        elif ach.slug == "sessions_200":
            count = db.query(func.count(WorkoutLog.id)).filter(WorkoutLog.user_id == user_id).scalar()
            earned = count >= 200

        elif ach.slug == "volume_10k":
            total = db.query(func.sum(WorkoutLog.total_volume)).filter(WorkoutLog.user_id == user_id).scalar() or 0
            earned = total >= 10000

        elif ach.slug == "volume_50k":
            total = db.query(func.sum(WorkoutLog.total_volume)).filter(WorkoutLog.user_id == user_id).scalar() or 0
            earned = total >= 50000

        elif ach.slug == "volume_100k":
            total = db.query(func.sum(WorkoutLog.total_volume)).filter(WorkoutLog.user_id == user_id).scalar() or 0
            earned = total >= 100000

        elif ach.slug == "calories_10k":
            total = db.query(func.sum(WorkoutLog.estimated_calories)).filter(WorkoutLog.user_id == user_id).scalar() or 0
            earned = total >= 10000

        elif ach.slug == "calories_50k":
            total = db.query(func.sum(WorkoutLog.estimated_calories)).filter(WorkoutLog.user_id == user_id).scalar() or 0
            earned = total >= 50000

        # --- STREAK achievements ---
        elif ach.slug == "streak_7":
            xp = _get_or_create_xp(db, user_id)
            earned = xp.current_streak_days >= 7

        elif ach.slug == "streak_30":
            xp = _get_or_create_xp(db, user_id)
            earned = xp.current_streak_days >= 30

        elif ach.slug == "streak_60":
            xp = _get_or_create_xp(db, user_id)
            earned = xp.current_streak_days >= 60

        elif ach.slug == "streak_100":
            xp = _get_or_create_xp(db, user_id)
            earned = xp.current_streak_days >= 100

        # --- NUTRITION achievements ---
        elif ach.slug == "first_food_log":
            count = db.query(func.count(FoodLog.id)).filter(FoodLog.user_id == user_id).scalar()
            earned = count >= 1

        elif ach.slug == "food_log_7days":
            distinct_days = db.query(func.count(func.distinct(func.date(FoodLog.logged_at)))).filter(
                FoodLog.user_id == user_id
            ).scalar()
            earned = (distinct_days or 0) >= 7

        elif ach.slug == "food_log_30days":
            distinct_days = db.query(func.count(func.distinct(func.date(FoodLog.logged_at)))).filter(
                FoodLog.user_id == user_id
            ).scalar()
            earned = (distinct_days or 0) >= 30

        # --- PROGRESS achievements ---
        elif ach.slug == "first_weigh_in":
            count = db.query(func.count(BodyMetric.id)).filter(
                BodyMetric.user_id == user_id, BodyMetric.weight_kg != None
            ).scalar()
            earned = count >= 1

        elif ach.slug == "weigh_in_30":
            count = db.query(func.count(BodyMetric.id)).filter(
                BodyMetric.user_id == user_id, BodyMetric.weight_kg != None
            ).scalar()
            earned = count >= 30

        # --- COMMUNITY achievements ---
        elif ach.slug == "first_review":
            count = db.query(func.count(Review.id)).filter(Review.user_id == user_id).scalar()
            earned = count >= 1

        elif ach.slug == "reviews_5":
            count = db.query(func.count(Review.id)).filter(Review.user_id == user_id).scalar()
            earned = count >= 5

        elif ach.slug == "reviews_10":
            count = db.query(func.count(Review.id)).filter(Review.user_id == user_id).scalar()
            earned = count >= 10

        elif ach.slug == "first_comment":
            count = db.query(func.count(ProductComment.id)).filter(ProductComment.user_id == user_id).scalar()
            earned = count >= 1

        elif ach.slug == "comments_20":
            count = db.query(func.count(ProductComment.id)).filter(ProductComment.user_id == user_id).scalar()
            earned = count >= 20

        # --- PRODUCT achievements ---
        elif ach.slug == "first_favorite":
            count = db.query(func.count(UserFavorite.id)).filter(UserFavorite.user_id == user_id).scalar()
            earned = count >= 1

        elif ach.slug == "collector_10":
            count = db.query(func.count(UserFavorite.id)).filter(UserFavorite.user_id == user_id).scalar()
            earned = count >= 10

        elif ach.slug == "collector_25":
            count = db.query(func.count(UserFavorite.id)).filter(UserFavorite.user_id == user_id).scalar()
            earned = count >= 25

        # Award if earned
        if earned:
            result = _award(db, user_id, ach)
            if result:
                newly_awarded.append(result)

    if newly_awarded:
        db.flush()

    return newly_awarded


def get_user_achievements(db: Session, user_id: int) -> dict:
    """Get all achievements for a user with progress info."""

    # All achievements
    all_achievements = db.query(Achievement).order_by(Achievement.category, Achievement.slug).all()

    # User's earned achievements
    earned = db.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()
    earned_ids = {ua.achievement_id: ua.earned_at for ua in earned}

    # XP info
    xp = _get_or_create_xp(db, user_id)

    # Build response
    achievements_list = []
    for ach in all_achievements:
        if ach.is_secret and ach.id not in earned_ids:
            continue  # Hide secret achievements

        achievements_list.append({
            "slug": ach.slug,
            "name": ach.name,
            "description": ach.description,
            "icon": ach.icon,
            "category": ach.category,
            "xp_reward": ach.xp_reward,
            "earned": ach.id in earned_ids,
            "earned_at": earned_ids[ach.id].isoformat() if ach.id in earned_ids else None,
        })

    # Category summary
    categories = {}
    for ach in achievements_list:
        cat = ach["category"]
        if cat not in categories:
            categories[cat] = {"total": 0, "earned": 0}
        categories[cat]["total"] += 1
        if ach["earned"]:
            categories[cat]["earned"] += 1

    return {
        "level": xp.level,
        "total_xp": xp.total_xp,
        "next_level_xp": (xp.level + 1) * 100,
        "current_streak": xp.current_streak_days,
        "longest_streak": xp.longest_streak_days,
        "achievements_earned": len(earned_ids),
        "achievements_total": len([a for a in all_achievements if not a.is_secret]),
        "categories": categories,
        "achievements": achievements_list,
    }


def _seed_achievements(db: Session):
    """Seed the achievements table with all available badges."""
    ACHIEVEMENTS = [
        # Workout
        {"slug": "first_workout", "name": "Premier pas", "description": "Complète ta première séance", "icon": "🏃", "category": "workout", "condition_type": "first_action", "condition_value": 1, "xp_reward": 10},
        {"slug": "sessions_10", "name": "Habitué", "description": "10 séances complétées", "icon": "💪", "category": "workout", "condition_type": "count", "condition_value": 10, "xp_reward": 25},
        {"slug": "sessions_50", "name": "Régulier", "description": "50 séances complétées", "icon": "🏋️", "category": "workout", "condition_type": "count", "condition_value": 50, "xp_reward": 75},
        {"slug": "sessions_100", "name": "Centurion", "description": "100 séances complétées", "icon": "🎖️", "category": "workout", "condition_type": "count", "condition_value": 100, "xp_reward": 150},
        {"slug": "sessions_200", "name": "Acharné", "description": "200 séances complétées", "icon": "🏆", "category": "workout", "condition_type": "count", "condition_value": 200, "xp_reward": 300},
        {"slug": "volume_10k", "name": "10 tonnes", "description": "10 000 kg de volume total", "icon": "🪨", "category": "workout", "condition_type": "milestone", "condition_value": 10000, "xp_reward": 30},
        {"slug": "volume_50k", "name": "50 tonnes", "description": "50 000 kg de volume total", "icon": "⛰️", "category": "workout", "condition_type": "milestone", "condition_value": 50000, "xp_reward": 75},
        {"slug": "volume_100k", "name": "Titan", "description": "100 000 kg de volume total", "icon": "🌋", "category": "workout", "condition_type": "milestone", "condition_value": 100000, "xp_reward": 200},
        {"slug": "calories_10k", "name": "Brûleur", "description": "10 000 kcal brûlées", "icon": "🔥", "category": "workout", "condition_type": "milestone", "condition_value": 10000, "xp_reward": 30},
        {"slug": "calories_50k", "name": "Fournaise", "description": "50 000 kcal brûlées", "icon": "☄️", "category": "workout", "condition_type": "milestone", "condition_value": 50000, "xp_reward": 100},

        # Streaks
        {"slug": "streak_7", "name": "Semaine parfaite", "description": "7 jours consécutifs d'activité", "icon": "🔥", "category": "streak", "condition_type": "streak", "condition_value": 7, "xp_reward": 25},
        {"slug": "streak_30", "name": "Machine", "description": "30 jours consécutifs", "icon": "⚡", "category": "streak", "condition_type": "streak", "condition_value": 30, "xp_reward": 100},
        {"slug": "streak_60", "name": "Inarrêtable", "description": "60 jours consécutifs", "icon": "💎", "category": "streak", "condition_type": "streak", "condition_value": 60, "xp_reward": 200},
        {"slug": "streak_100", "name": "Légende", "description": "100 jours consécutifs", "icon": "👑", "category": "streak", "condition_type": "streak", "condition_value": 100, "xp_reward": 500},

        # Nutrition
        {"slug": "first_food_log", "name": "Conscience alimentaire", "description": "Log ton premier repas", "icon": "🥗", "category": "nutrition", "condition_type": "first_action", "condition_value": 1, "xp_reward": 10},
        {"slug": "food_log_7days", "name": "Discipliné", "description": "7 jours de log nutritionnel", "icon": "📋", "category": "nutrition", "condition_type": "count", "condition_value": 7, "xp_reward": 30},
        {"slug": "food_log_30days", "name": "Moine nutrition", "description": "30 jours de log nutritionnel", "icon": "🧘", "category": "nutrition", "condition_type": "count", "condition_value": 30, "xp_reward": 100},

        # Progress
        {"slug": "first_weigh_in", "name": "Sur la balance", "description": "Première pesée enregistrée", "icon": "⚖️", "category": "progress", "condition_type": "first_action", "condition_value": 1, "xp_reward": 10},
        {"slug": "weigh_in_30", "name": "Suivi régulier", "description": "30 pesées enregistrées", "icon": "📊", "category": "progress", "condition_type": "count", "condition_value": 30, "xp_reward": 50},

        # Community
        {"slug": "first_review", "name": "Critique", "description": "Publie ton premier avis", "icon": "⭐", "category": "community", "condition_type": "first_action", "condition_value": 1, "xp_reward": 10},
        {"slug": "reviews_5", "name": "Testeur", "description": "5 avis publiés", "icon": "📝", "category": "community", "condition_type": "count", "condition_value": 5, "xp_reward": 25},
        {"slug": "reviews_10", "name": "Expert produit", "description": "10 avis publiés", "icon": "🎓", "category": "community", "condition_type": "count", "condition_value": 10, "xp_reward": 50},
        {"slug": "first_comment", "name": "Social", "description": "Premier commentaire publié", "icon": "💬", "category": "community", "condition_type": "first_action", "condition_value": 1, "xp_reward": 10},
        {"slug": "comments_20", "name": "Bavard", "description": "20 commentaires publiés", "icon": "🗣️", "category": "community", "condition_type": "count", "condition_value": 20, "xp_reward": 40},

        # Product
        {"slug": "first_favorite", "name": "Coup de coeur", "description": "Ajoute ton premier favori", "icon": "❤️", "category": "product", "condition_type": "first_action", "condition_value": 1, "xp_reward": 5},
        {"slug": "collector_10", "name": "Collectionneur", "description": "10 produits en favoris", "icon": "📌", "category": "product", "condition_type": "count", "condition_value": 10, "xp_reward": 25},
        {"slug": "collector_25", "name": "Connaisseur", "description": "25 produits en favoris", "icon": "🏅", "category": "product", "condition_type": "count", "condition_value": 25, "xp_reward": 50},
    ]

    for data in ACHIEVEMENTS:
        existing = db.query(Achievement).filter(Achievement.slug == data["slug"]).first()
        if not existing:
            db.add(Achievement(**data))

    db.flush()
    logger.info(f"[ACHIEVEMENTS] Seeded {len(ACHIEVEMENTS)} achievements")
