from datetime import datetime, date
from typing import Optional, List
from sqlalchemy import (
    String, Integer, Float, Boolean, Text, DateTime, Date, Time,
    ForeignKey, UniqueConstraint, Index, JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base


# ============================================================
# USERS & AUTH
# ============================================================

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    display_name: Mapped[str] = mapped_column(String(100), default="")
    avatar_url: Mapped[Optional[str]] = mapped_column(Text)
    role: Mapped[str] = mapped_column(String(20), default="user")  # user, admin, coach
    plan: Mapped[str] = mapped_column(String(20), default="free")  # free, pro, elite, coach
    plan_expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    profile: Mapped[Optional["UserProfile"]] = relationship(back_populates="user", uselist=False)
    reviews: Mapped[List["Review"]] = relationship(back_populates="user")
    favorites: Mapped[List["UserFavorite"]] = relationship(back_populates="user")
    workout_programs: Mapped[List["WorkoutProgram"]] = relationship(back_populates="user")
    workout_logs: Mapped[List["WorkoutLog"]] = relationship(back_populates="user")
    food_logs: Mapped[List["FoodLog"]] = relationship(back_populates="user")
    body_metrics: Mapped[List["BodyMetric"]] = relationship(back_populates="user")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)

    # Physical
    sex: Mapped[Optional[str]] = mapped_column(String(10))
    birth_date: Mapped[Optional[date]] = mapped_column(Date)
    height_cm: Mapped[Optional[float]] = mapped_column(Float)
    current_weight_kg: Mapped[Optional[float]] = mapped_column(Float)
    target_weight_kg: Mapped[Optional[float]] = mapped_column(Float)
    body_fat_pct: Mapped[Optional[float]] = mapped_column(Float)

    # Goals
    primary_goal: Mapped[Optional[str]] = mapped_column(String(50))
    experience_level: Mapped[int] = mapped_column(Integer, default=1)
    available_days: Mapped[int] = mapped_column(Integer, default=4)
    session_duration_min: Mapped[int] = mapped_column(Integer, default=60)
    equipment: Mapped[str] = mapped_column(String(50), default="full_gym")
    injuries: Mapped[Optional[dict]] = mapped_column(JSON, default=list)
    dietary_preferences: Mapped[Optional[dict]] = mapped_column(JSON, default=list)

    # Calculated
    bmr: Mapped[Optional[float]] = mapped_column(Float)
    tdee: Mapped[Optional[float]] = mapped_column(Float)
    target_calories: Mapped[Optional[float]] = mapped_column(Float)
    target_protein_g: Mapped[Optional[float]] = mapped_column(Float)
    target_carbs_g: Mapped[Optional[float]] = mapped_column(Float)
    target_fat_g: Mapped[Optional[float]] = mapped_column(Float)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="profile")


# ============================================================
# PRODUCTS
# ============================================================

class ProductCategory(Base):
    __tablename__ = "product_categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    scoring_weights: Mapped[Optional[dict]] = mapped_column(JSON, default=dict)
    icon: Mapped[Optional[str]] = mapped_column(String(10))
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    products: Mapped[List["Product"]] = relationship(back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    category_id: Mapped[Optional[int]] = mapped_column(ForeignKey("product_categories.id"))
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    brand: Mapped[Optional[str]] = mapped_column(String(200))
    normalized_key: Mapped[Optional[str]] = mapped_column(String(500), unique=True)
    type_whey: Mapped[str] = mapped_column(String(50), default="unknown")

    # Nutrition
    proteines_100g: Mapped[Optional[float]] = mapped_column(Float)
    kcal_per_100g: Mapped[Optional[float]] = mapped_column(Float)
    carbs_per_100g: Mapped[Optional[float]] = mapped_column(Float)
    fat_per_100g: Mapped[Optional[float]] = mapped_column(Float)
    sugar_per_100g: Mapped[Optional[float]] = mapped_column(Float)

    # Amino
    bcaa_per_100g_prot: Mapped[Optional[float]] = mapped_column(Float)
    leucine_g: Mapped[Optional[float]] = mapped_column(Float)
    has_aminogram: Mapped[bool] = mapped_column(Boolean, default=False)

    # Composition
    ingredients: Mapped[Optional[str]] = mapped_column(Text)
    ingredient_count: Mapped[Optional[int]] = mapped_column(Integer)
    has_sucralose: Mapped[bool] = mapped_column(Boolean, default=False)
    has_acesulfame_k: Mapped[bool] = mapped_column(Boolean, default=False)
    has_aspartame: Mapped[bool] = mapped_column(Boolean, default=False)

    # Origin
    origin_label: Mapped[str] = mapped_column(String(50), default="Inconnu")
    made_in_france: Mapped[bool] = mapped_column(Boolean, default=False)

    # Scores
    score_proteique: Mapped[Optional[float]] = mapped_column(Float)
    score_sante: Mapped[Optional[float]] = mapped_column(Float)
    score_final: Mapped[Optional[float]] = mapped_column(Float)

    # Meta
    image_url: Mapped[Optional[str]] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relations
    category: Mapped[Optional["ProductCategory"]] = relationship(back_populates="products")
    offers: Mapped[List["Offer"]] = relationship(back_populates="product")
    reviews: Mapped[List["Review"]] = relationship(back_populates="product")
    comments: Mapped[List["ProductComment"]] = relationship(back_populates="product")

    __table_args__ = (
        Index("idx_products_score", "score_final", postgresql_nulls_not_distinct=False),
    )


class Offer(Base):
    __tablename__ = "offers"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    merchant: Mapped[Optional[str]] = mapped_column(String(200))
    url: Mapped[str] = mapped_column(Text, nullable=False)
    prix: Mapped[Optional[float]] = mapped_column(Float)
    devise: Mapped[str] = mapped_column(String(10), default="EUR")
    poids_kg: Mapped[Optional[float]] = mapped_column(Float)
    prix_par_kg: Mapped[Optional[float]] = mapped_column(Float)
    disponibilite: Mapped[Optional[str]] = mapped_column(String(100))
    confidence: Mapped[float] = mapped_column(Float, default=0.5)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    product: Mapped["Product"] = relationship(back_populates="offers")


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(255))
    comment: Mapped[Optional[str]] = mapped_column(Text)
    is_hidden: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    product: Mapped["Product"] = relationship(back_populates="reviews")
    user: Mapped["User"] = relationship(back_populates="reviews")


class ProductComment(Base):
    __tablename__ = "product_comments"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    parent_id: Mapped[Optional[int]] = mapped_column(ForeignKey("product_comments.id", ondelete="CASCADE"))
    content: Mapped[str] = mapped_column(Text, nullable=False)
    is_hidden: Mapped[bool] = mapped_column(Boolean, default=False)
    likes_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    product: Mapped["Product"] = relationship(back_populates="comments")
    user: Mapped["User"] = relationship()
    replies: Mapped[List["ProductComment"]] = relationship()


class UserFavorite(Base):
    __tablename__ = "user_favorites"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="favorites")

    __table_args__ = (UniqueConstraint("user_id", "product_id"),)


class PriceHistory(Base):
    __tablename__ = "price_history"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    prix: Mapped[Optional[float]] = mapped_column(Float)
    prix_par_kg: Mapped[Optional[float]] = mapped_column(Float)
    merchant: Mapped[Optional[str]] = mapped_column(String(255))
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


# ============================================================
# WORKOUTS
# ============================================================

class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    name_en: Mapped[Optional[str]] = mapped_column(String(200))
    muscle_primary: Mapped[str] = mapped_column(String(50), nullable=False)
    muscle_secondary: Mapped[Optional[dict]] = mapped_column(JSON, default=list)
    equipment: Mapped[str] = mapped_column(String(50), nullable=False)
    movement_type: Mapped[Optional[str]] = mapped_column(String(30))
    difficulty: Mapped[int] = mapped_column(Integer, default=2)
    met_value: Mapped[float] = mapped_column(Float, default=5.0)
    video_url: Mapped[Optional[str]] = mapped_column(Text)
    instructions: Mapped[Optional[str]] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class WorkoutProgram(Base):
    __tablename__ = "workout_programs"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    split_type: Mapped[Optional[str]] = mapped_column(String(50))
    duration_weeks: Mapped[int] = mapped_column(Integer, default=8)
    days_per_week: Mapped[int] = mapped_column(Integer, default=4)
    goal: Mapped[Optional[str]] = mapped_column(String(50))
    program_data: Mapped[Optional[dict]] = mapped_column(JSON)  # Full program structure from AI
    ai_prompt: Mapped[Optional[str]] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="workout_programs")


class WorkoutLog(Base):
    __tablename__ = "workout_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    program_id: Mapped[Optional[int]] = mapped_column(ForeignKey("workout_programs.id"))
    started_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    finished_at: Mapped[Optional[datetime]] = mapped_column(DateTime)
    duration_minutes: Mapped[Optional[int]] = mapped_column(Integer)
    total_volume: Mapped[Optional[float]] = mapped_column(Float)
    total_sets: Mapped[Optional[int]] = mapped_column(Integer)
    estimated_calories: Mapped[Optional[float]] = mapped_column(Float)
    average_rpe: Mapped[Optional[float]] = mapped_column(Float)
    session_rating: Mapped[Optional[int]] = mapped_column(Integer)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    exercises_data: Mapped[Optional[dict]] = mapped_column(JSON)  # Full exercise log
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="workout_logs")


# ============================================================
# NUTRITION
# ============================================================

class NutritionPlan(Base):
    __tablename__ = "nutrition_plans"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    target_calories: Mapped[Optional[float]] = mapped_column(Float)
    target_protein_g: Mapped[Optional[float]] = mapped_column(Float)
    target_carbs_g: Mapped[Optional[float]] = mapped_column(Float)
    target_fat_g: Mapped[Optional[float]] = mapped_column(Float)
    meals_per_day: Mapped[int] = mapped_column(Integer, default=5)
    plan_data: Mapped[Optional[dict]] = mapped_column(JSON)  # Full plan from AI
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class FoodLog(Base):
    __tablename__ = "food_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    logged_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    meal_type: Mapped[Optional[str]] = mapped_column(String(30))
    food_name: Mapped[str] = mapped_column(String(300), nullable=False)
    quantity_g: Mapped[Optional[float]] = mapped_column(Float)
    calories: Mapped[float] = mapped_column(Float, default=0)
    protein_g: Mapped[float] = mapped_column(Float, default=0)
    carbs_g: Mapped[float] = mapped_column(Float, default=0)
    fat_g: Mapped[float] = mapped_column(Float, default=0)
    source: Mapped[str] = mapped_column(String(30), default="manual")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="food_logs")


# ============================================================
# BODY TRACKING
# ============================================================

class BodyMetric(Base):
    __tablename__ = "body_metrics"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    measured_at: Mapped[date] = mapped_column(Date, default=date.today)
    weight_kg: Mapped[Optional[float]] = mapped_column(Float)
    body_fat_pct: Mapped[Optional[float]] = mapped_column(Float)
    chest_cm: Mapped[Optional[float]] = mapped_column(Float)
    waist_cm: Mapped[Optional[float]] = mapped_column(Float)
    hips_cm: Mapped[Optional[float]] = mapped_column(Float)
    bicep_left_cm: Mapped[Optional[float]] = mapped_column(Float)
    bicep_right_cm: Mapped[Optional[float]] = mapped_column(Float)
    thigh_left_cm: Mapped[Optional[float]] = mapped_column(Float)
    thigh_right_cm: Mapped[Optional[float]] = mapped_column(Float)
    notes: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship(back_populates="body_metrics")


# ============================================================
# NOTIFICATIONS & ACHIEVEMENTS
# ============================================================

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[Optional[str]] = mapped_column(String(200))
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
