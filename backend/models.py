# models.py
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base
import uuid
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email         = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name     = Column(String(255), nullable=True)
    push_token    = Column(String(255), nullable=True)   # Expo push token
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime, default=datetime.utcnow)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    profile       = relationship("Profile", back_populates="user", uselist=False)
    history       = relationship("HistoryEntry", back_populates="user")
    refresh_tokens = relationship("RefreshToken", back_populates="user")


class Profile(Base):
    __tablename__ = "profiles"

    id             = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id        = Column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True, nullable=False)
    age            = Column(Integer, nullable=True)
    gender         = Column(String(10), nullable=True)
    bmi            = Column(Float, nullable=True)
    height         = Column(Float, nullable=True)
    weight         = Column(Float, nullable=True)
    smoking        = Column(String(10), nullable=True)
    alcohol        = Column(String(20), nullable=True)
    family_history = Column(String(10), nullable=True)
    systolic_bp    = Column(Integer, nullable=True)
    diastolic_bp   = Column(Integer, nullable=True)
    updated_at     = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user           = relationship("User", back_populates="profile")


class HistoryEntry(Base):
    __tablename__ = "history_entries"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id     = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    client_id   = Column(String(100), unique=True, nullable=False)  # ID généré côté app, pour déduplication
    timestamp   = Column(DateTime, nullable=False)
    probability = Column(Float, nullable=False)
    cvd_detected = Column(Boolean, nullable=False)
    snapshot    = Column(JSON, nullable=True)   # { hr, spo2, sys, dia }
    synced_at   = Column(DateTime, default=datetime.utcnow)

    user        = relationship("User", back_populates="history")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    token_hash = Column(String(255), nullable=False, unique=True)
    expires_at = Column(DateTime, nullable=False)
    revoked    = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user       = relationship("User", back_populates="refresh_tokens")