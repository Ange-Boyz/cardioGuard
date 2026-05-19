# main.py
from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from datetime import datetime
import httpx
import os
from dotenv import load_dotenv

from database import get_db, engine, Base
from models import User, Profile, HistoryEntry, RefreshToken
from schemas import (
    SignUpRequest, LoginRequest, TokenResponse, RefreshRequest,
    ProfileUpdate, SyncRequest, SyncResponse, PushNotificationRequest
)
from auth import (
    hash_password, verify_password,
    create_access_token, create_refresh_token,
    hash_token, decode_token
)

load_dotenv()

# Créer les tables au démarrage
Base.metadata.create_all(bind=engine)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="CardioGuard API", version="2.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS — en prod, remplace "*" par l'URL exacte de ton app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

security = HTTPBearer()

# ─── Helper : extraire l'utilisateur depuis le JWT ───────────────────────────

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token   = credentials.credentials
    payload = decode_token(token)

    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide ou expiré.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="Utilisateur introuvable.")

    return user

# ─── Health check ─────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"service": "CardioGuard API", "version": "2.0.0", "status": "ok"}

@app.get("/health")
def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

# ─── Auth : Inscription ───────────────────────────────────────────────────────

@app.post("/auth/signup", response_model=TokenResponse, status_code=201)
@limiter.limit("5/minute")
def signup(request: Request, body: SignUpRequest, db: Session = Depends(get_db)):
    # Vérifier si l'email est déjà utilisé
    existing = db.query(User).filter(User.email == body.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un compte avec cet email existe déjà."
        )

    # Créer l'utilisateur
    user = User(
        email         = body.email.lower(),
        password_hash = hash_password(body.password),
        full_name     = body.full_name,
    )
    db.add(user)
    db.flush()  # pour avoir l'ID avant commit

    # Créer un profil vide associé
    profile = Profile(user_id=user.id)
    db.add(profile)

    # Générer les tokens
    access_token            = create_access_token(str(user.id))
    refresh_token, exp_date = create_refresh_token(str(user.id))

    # Stocker le refresh token hashé
    rt = RefreshToken(
        user_id    = user.id,
        token_hash = hash_token(refresh_token),
        expires_at = exp_date,
    )
    db.add(rt)
    db.commit()

    return TokenResponse(
        access_token  = access_token,
        refresh_token = refresh_token,
        user_id       = str(user.id),
        email         = user.email,
        full_name     = user.full_name,
    )

# ─── Auth : Connexion ─────────────────────────────────────────────────────────

@app.post("/auth/login", response_model=TokenResponse)
@limiter.limit("10/minute")
def login(request: Request, body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email.lower()).first()

    # Toujours vérifier le mot de passe même si user=None (évite le timing attack)
    dummy_hash = "$2b$12$dummy.hash.to.prevent.timing.attack.on.email.enumeration"
    password_ok = verify_password(body.password, user.password_hash if user else dummy_hash)

    if not user or not password_ok or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou mot de passe incorrect."
        )

    access_token            = create_access_token(str(user.id))
    refresh_token, exp_date = create_refresh_token(str(user.id))

    rt = RefreshToken(
        user_id    = user.id,
        token_hash = hash_token(refresh_token),
        expires_at = exp_date,
    )
    db.add(rt)
    db.commit()

    return TokenResponse(
        access_token  = access_token,
        refresh_token = refresh_token,
        user_id       = str(user.id),
        email         = user.email,
        full_name     = user.full_name,
    )

# ─── Auth : Refresh token ─────────────────────────────────────────────────────

@app.post("/auth/refresh", response_model=TokenResponse)
def refresh_token_endpoint(body: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(body.refresh_token)

    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Refresh token invalide.")

    token_hash = hash_token(body.refresh_token)
    stored = db.query(RefreshToken).filter(
        RefreshToken.token_hash == token_hash,
        RefreshToken.revoked == False,
    ).first()

    if not stored or stored.expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Refresh token expiré ou révoqué.")

    # Révoquer l'ancien et émettre un nouveau (token rotation)
    stored.revoked = True

    user = db.query(User).filter(User.id == payload["sub"]).first()
    new_access               = create_access_token(str(user.id))
    new_refresh, exp_date    = create_refresh_token(str(user.id))

    new_rt = RefreshToken(
        user_id    = user.id,
        token_hash = hash_token(new_refresh),
        expires_at = exp_date,
    )
    db.add(new_rt)
    db.commit()

    return TokenResponse(
        access_token  = new_access,
        refresh_token = new_refresh,
        user_id       = str(user.id),
        email         = user.email,
        full_name     = user.full_name,
    )

# ─── Auth : Me ───────────────────────────────────────────────────────────────

@app.get("/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id":         str(current_user.id),
        "email":      current_user.email,
        "full_name":  current_user.full_name,
        "created_at": current_user.created_at.isoformat(),
    }

# ─── Profil ───────────────────────────────────────────────────────────────────

@app.put("/profile")
def update_profile(
    body: ProfileUpdate,
    current_user: User  = Depends(get_current_user),
    db: Session         = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    for field, value in body.dict(exclude_none=True).items():
        setattr(profile, field, value)

    db.commit()
    return {"message": "Profil mis à jour."}

@app.get("/profile")
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session        = Depends(get_db),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        return {}
    return {
        "age":            profile.age,
        "gender":         profile.gender,
        "bmi":            profile.bmi,
        "height":         profile.height,
        "weight":         profile.weight,
        "smoking":        profile.smoking,
        "alcohol":        profile.alcohol,
        "family_history": profile.family_history,
        "systolic_bp":    profile.systolic_bp,
        "diastolic_bp":   profile.diastolic_bp,
    }

# ─── Sync historique ──────────────────────────────────────────────────────────

@app.post("/sync", response_model=SyncResponse)
def sync_history(
    body: SyncRequest,
    current_user: User = Depends(get_current_user),
    db: Session        = Depends(get_db),
):
    # Mettre à jour le push token si fourni
    if body.push_token:
        current_user.push_token = body.push_token
        db.add(current_user)

    # Récupérer les client_ids déjà en base (déduplication)
    existing_ids = set(
        row[0] for row in
        db.query(HistoryEntry.client_id)
          .filter(HistoryEntry.user_id == current_user.id)
          .all()
    )

    received   = 0
    duplicates = 0

    for entry in body.entries:
        if entry.id in existing_ids:
            duplicates += 1
            continue

        he = HistoryEntry(
            user_id      = current_user.id,
            client_id    = entry.id,
            timestamp    = datetime.utcfromtimestamp(entry.timestamp / 1000),
            probability  = entry.probability,
            cvd_detected = entry.cvd_detected,
            snapshot     = entry.snapshot,
        )
        db.add(he)
        received += 1

    db.commit()

    total = db.query(HistoryEntry).filter(HistoryEntry.user_id == current_user.id).count()

    return SyncResponse(received=received, duplicates=duplicates, total=total)

@app.get("/history")
def get_history(
    limit:       int  = 100,
    current_user: User = Depends(get_current_user),
    db: Session        = Depends(get_db),
):
    entries = (
        db.query(HistoryEntry)
          .filter(HistoryEntry.user_id == current_user.id)
          .order_by(HistoryEntry.timestamp.desc())
          .limit(limit)
          .all()
    )
    return {
        "entries": [
            {
                "id":           str(e.id),
                "client_id":    e.client_id,
                "timestamp":    e.timestamp.isoformat(),
                "probability":  e.probability,
                "cvd_detected": e.cvd_detected,
                "snapshot":     e.snapshot,
            }
            for e in entries
        ],
        "total": len(entries),
    }

# ─── Notifications Push ───────────────────────────────────────────────────────

async def send_expo_push(push_token: str, title: str, body: str, data: dict = None):
    """Envoie une notification push via l'API Expo."""
    payload = {
        "to":    push_token,
        "title": title,
        "body":  body,
        "sound": "default",
        "data":  data or {},
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(
            os.getenv("EXPO_PUSH_URL"),
            json=payload,
            headers={"Accept": "application/json", "Content-Type": "application/json"},
            timeout=10,
        )
    return response.json()

@app.post("/notify/{user_id}")
async def notify_user(
    user_id:  str,
    body:     PushNotificationRequest,
    db:       Session = Depends(get_db),
):
    """
    Envoie une notification push à un utilisateur.
    En production : protège cet endpoint avec un token admin.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.push_token:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable ou pas de push token.")

    result = await send_expo_push(
        push_token = user.push_token,
        title      = body.title,
        body       = body.body,
        data       = body.data,
    )
    return {"sent": True, "expo_response": result}