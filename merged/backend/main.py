"""
FitTracker × ProteinScan — FastAPI Backend
Remplace app.py (Streamlit) par une API REST.
Les fichiers core/ (db.py, scoring.py, scraper.py...) restent INCHANGÉS.
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.db import init_db, ensure_product_images_table, ensure_user_favorites_table

from api.products import router as products_router
from api.compare import router as compare_router
from api.auth_routes import router as auth_router
from api.reviews import router as reviews_router
from api.favorites import router as favorites_router
from api.stats import router as stats_router
from api.pipeline import router as pipeline_router
from api.fitness import router as fitness_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: init DB (même logique que ton init_db() Streamlit)
    init_db()
    ensure_product_images_table()
    ensure_user_favorites_table()
    yield
    # Shutdown: rien de spécial


app = FastAPI(
    title="FitTracker × ProteinScan API",
    description="API REST pour le comparateur de whey protéines et l'app fitness",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — autorise ton frontend Next.js
FRONTEND_URLS = os.environ.get(
    "FRONTEND_URLS",
    "http://localhost:3000,http://localhost:3001,https://fittracker.vercel.app"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ──
app.include_router(auth_router,     prefix="/api/auth",     tags=["Auth"])
app.include_router(products_router, prefix="/api/products", tags=["Products"])
app.include_router(compare_router,  prefix="/api/compare",  tags=["Compare"])
app.include_router(reviews_router,  prefix="/api/reviews",  tags=["Reviews"])
app.include_router(favorites_router,prefix="/api/favorites",tags=["Favorites"])
app.include_router(stats_router,    prefix="/api/stats",    tags=["Stats"])
app.include_router(pipeline_router, prefix="/api/admin",    tags=["Admin"])
app.include_router(fitness_router,  prefix="/api/fitness",  tags=["Fitness"])


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "fittracker-proteinscan"}
