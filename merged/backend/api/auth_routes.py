"""
Routes Auth avec JWT.
Remplace page_login() et page_register() de app.py Streamlit.
"""

import os
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from jose import jwt, JWTError

from core.db import create_user, get_user_by_email, get_user_preferences, save_user_preferences
from core.auth import hash_password, verify_password

router = APIRouter()
security = HTTPBearer(auto_error=False)

JWT_SECRET = os.environ.get("JWT_SECRET", "change-me-in-production-please")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 72


def create_token(user_id: int, email: str, plan: str) -> str:
    payload = {
        "sub": str(user_id),
        "email": email,
        "plan": plan,
        "exp": datetime.utcnow() + timedelta(hours=JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency: extrait l'utilisateur du JWT. Retourne None si pas de token."""
    if credentials is None:
        return None
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return {
            "id": int(payload["sub"]),
            "email": payload["email"],
            "plan": payload.get("plan", "free"),
        }
    except JWTError:
        raise HTTPException(status_code=401, detail="Token invalide ou expiré")


def require_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency: utilisateur obligatoire."""
    if credentials is None:
        raise HTTPException(status_code=401, detail="Authentification requise")
    return get_current_user(credentials)


# ── Routes ──

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/register")
def register(req: RegisterRequest):
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Mot de passe trop court (min 6 caractères)")

    pw_hash = hash_password(req.password)
    user = create_user(req.email, pw_hash, req.display_name or req.email.split("@")[0])

    if user is None:
        raise HTTPException(status_code=409, detail="Cet email est déjà utilisé")

    token = create_token(user["id"], user["email"], user.get("plan", "free"))

    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "display_name": user["display_name"],
            "plan": user.get("plan", "free"),
        },
    }


@router.post("/login")
def login(req: LoginRequest):
    user = get_user_by_email(req.email)
    if not user:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    if not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    token = create_token(user["id"], user["email"], user.get("plan", "free"))

    return {
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "display_name": user.get("display_name", ""),
            "plan": user.get("plan", "free"),
        },
    }


@router.get("/me")
def get_me(user=Depends(require_user)):
    """Retourne le profil de l'utilisateur connecté."""
    full_user = get_user_by_email(user["email"])
    if not full_user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")

    prefs = None
    try:
        prefs = get_user_preferences(full_user["id"])
    except Exception:
        pass

    return {
        "user": {
            "id": full_user["id"],
            "email": full_user["email"],
            "display_name": full_user.get("display_name", ""),
            "plan": full_user.get("plan", "free"),
            "created_at": str(full_user.get("created_at", "")),
        },
        "preferences": prefs,
    }
