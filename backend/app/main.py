from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import engine, Base
from app.api import auth, products, coach, tracking, admin, nutrition_plans, achievements
from app.models.achievements import Achievement, UserAchievement, UserXP  # Ensure tables created

settings = get_settings()

# Create tables
Base.metadata.create_all(bind=engine)

# App
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(products.router, prefix="/api/v1")
app.include_router(coach.router, prefix="/api/v1")
app.include_router(tracking.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(nutrition_plans.router, prefix="/api/v1")
app.include_router(achievements.router, prefix="/api/v1")


@app.get("/")
def root():
    return {
        "app": "FitTracker API",
        "version": settings.app_version,
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "ok"}
