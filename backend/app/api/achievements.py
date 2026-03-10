"""Achievement API endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.core.security import get_current_user
from app.services.achievement_service import get_user_achievements, check_and_award

router = APIRouter(prefix="/achievements", tags=["achievements"])


@router.get("")
def list_achievements(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all achievements with user progress, XP, level, streaks."""
    return get_user_achievements(db, user.id)


@router.post("/check")
def check_achievements(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Manually trigger achievement check (usually auto-triggered after actions)."""
    newly_awarded = check_and_award(db, user.id)
    db.commit()
    return {
        "newly_awarded": newly_awarded,
        "count": len(newly_awarded),
    }
