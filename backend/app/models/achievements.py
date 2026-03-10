"""
Achievement models - Add these to app/models/__init__.py

Copy the two classes below into your existing models file,
or this file will be imported separately.
"""

from datetime import datetime
from sqlalchemy import String, Integer, Float, Boolean, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


class Achievement(Base):
    __tablename__ = "achievements"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="")
    icon: Mapped[str] = mapped_column(String(10), default="🏆")
    category: Mapped[str] = mapped_column(String(50), default="general")  # workout, nutrition, progress, community, product
    condition_type: Mapped[str] = mapped_column(String(50), nullable=False)  # streak, count, milestone, first_action
    condition_value: Mapped[float] = mapped_column(Float, default=1)
    xp_reward: Mapped[int] = mapped_column(Integer, default=10)
    is_secret: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class UserAchievement(Base):
    __tablename__ = "user_achievements"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    achievement_id: Mapped[int] = mapped_column(ForeignKey("achievements.id"))
    earned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    achievement: Mapped["Achievement"] = relationship()

    __table_args__ = (UniqueConstraint("user_id", "achievement_id"),)


class UserXP(Base):
    __tablename__ = "user_xp"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    total_xp: Mapped[int] = mapped_column(Integer, default=0)
    level: Mapped[int] = mapped_column(Integer, default=1)
    current_streak_days: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak_days: Mapped[int] = mapped_column(Integer, default=0)
    last_activity_date: Mapped[str] = mapped_column(String(10), nullable=True)  # YYYY-MM-DD
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
