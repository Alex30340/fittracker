"""
Routes API admin pour les pipelines discovery/refresh.
Remplace la section admin de app.py Streamlit.
"""

import os
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import Optional

from core.db import get_pipeline_runs, get_data_quality_stats, get_anomalous_products
from api.auth_routes import require_user

router = APIRouter()

ADMIN_EMAILS = os.environ.get("ADMIN_EMAILS", "").split(",")


def require_admin(user=Depends(require_user)):
    """Vérifie que l'utilisateur est admin."""
    if user["email"] not in ADMIN_EMAILS and user["plan"] != "admin":
        raise HTTPException(status_code=403, detail="Accès admin requis")
    return user


def _run_discovery_task():
    """Tâche de fond pour la découverte."""
    try:
        from core.scraper import run_discovery
        api_key = os.environ.get("BRAVE_API_KEY", "")
        if api_key:
            run_discovery(api_key)
    except Exception as e:
        import logging
        logging.error(f"Discovery task error: {e}")


def _run_refresh_task():
    """Tâche de fond pour le refresh."""
    try:
        from core.scraper import run_refresh
        run_refresh()
    except Exception as e:
        import logging
        logging.error(f"Refresh task error: {e}")


@router.post("/discovery")
def start_discovery(bg: BackgroundTasks, user=Depends(require_admin)):
    """Lance le pipeline de découverte en arrière-plan."""
    bg.add_task(_run_discovery_task)
    return {"status": "started", "task": "discovery"}


@router.post("/refresh")
def start_refresh(bg: BackgroundTasks, user=Depends(require_admin)):
    """Lance le pipeline de refresh en arrière-plan."""
    bg.add_task(_run_refresh_task)
    return {"status": "started", "task": "refresh"}


@router.get("/pipeline-runs")
def pipeline_runs(limit: int = 10, user=Depends(require_admin)):
    """Historique des exécutions de pipeline."""
    runs = get_pipeline_runs(limit=limit)
    return {"runs": runs}


@router.get("/anomalies")
def anomalies(user=Depends(require_admin)):
    """Produits avec des données anormales."""
    try:
        products = get_anomalous_products()
        return {"products": products}
    except Exception as e:
        return {"products": [], "error": str(e)}
