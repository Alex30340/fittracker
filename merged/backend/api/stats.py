"""
Routes API pour les statistiques.
"""

from fastapi import APIRouter

from core.db import get_catalog_stats, get_data_quality_stats

router = APIRouter()


@router.get("/catalog")
def catalog_stats():
    """Stats globales du catalogue (landing page, admin)."""
    stats = get_catalog_stats()
    return stats


@router.get("/quality")
def quality_stats():
    """Stats de qualité des données (admin)."""
    try:
        stats = get_data_quality_stats()
        return stats
    except Exception as e:
        return {"error": str(e)}
