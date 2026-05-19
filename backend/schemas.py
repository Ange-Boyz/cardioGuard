# schemas.py
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
import uuid

# ─── Auth ────────────────────────────────────────────────────────────────────

class SignUpRequest(BaseModel):
    email:     EmailStr
    password:  str = Field(min_length=8, max_length=128)
    full_name: Optional[str] = None

class LoginRequest(BaseModel):
    email:    EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token:  str
    refresh_token: str
    token_type:    str = "bearer"
    user_id:       str
    email:         str
    full_name:     Optional[str]

class RefreshRequest(BaseModel):
    refresh_token: str

# ─── Profile ─────────────────────────────────────────────────────────────────

class ProfileUpdate(BaseModel):
    age:            Optional[int]   = None
    gender:         Optional[str]   = None
    bmi:            Optional[float] = None
    height:         Optional[float] = None
    weight:         Optional[float] = None
    smoking:        Optional[str]   = None
    alcohol:        Optional[str]   = None
    family_history: Optional[str]   = None
    systolic_bp:    Optional[int]   = None
    diastolic_bp:   Optional[int]   = None

# ─── Sync ────────────────────────────────────────────────────────────────────

class HistoryEntryIn(BaseModel):
    id:           str       # client_id (UUID généré côté app)
    timestamp:    int       # ms epoch
    probability:  float
    cvd_detected: bool
    snapshot:     Optional[dict] = None

class SyncRequest(BaseModel):
    entries:    List[HistoryEntryIn]
    push_token: Optional[str] = None  # mis à jour à chaque sync

class SyncResponse(BaseModel):
    received:   int
    duplicates: int
    total:      int

# ─── Notifications ───────────────────────────────────────────────────────────

class PushNotificationRequest(BaseModel):
    user_id: str
    title:   str
    body:    str
    data:    Optional[dict] = None