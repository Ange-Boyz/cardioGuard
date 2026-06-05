# CardioGuard — Backend Documentation

This document explains the backend for the CardioGuard project: architecture, key modules, endpoints, environment variables, deployment notes and troubleshooting tips.

## Overview

- Framework: FastAPI — lightweight, async-ready web framework for Python.
- ASGI server: Uvicorn (development) / Gunicorn + Uvicorn workers (recommended for production).
- Database: PostgreSQL via SQLAlchemy ORM.
- Authentication: JWT (access + refresh tokens) using `python-jose` and `passlib` for password hashing.
- Rate limiting: `slowapi`.
- HTTP client: `httpx` for outgoing requests (push notifications to Expo).

The backend exposes REST endpoints for authentication, profile management, history sync, and push notifications.

## Project layout (important files)

- `main.py` — FastAPI application, routes and high-level logic (auth, profile, sync, health checks). Entry point used by Uvicorn/Gunicorn.
- `database.py` — SQLAlchemy engine, session factory and `get_db` dependency.
- `models.py` — SQLAlchemy models: `User`, `Profile`, `HistoryEntry`, `RefreshToken`.
- `auth.py` — authentication helpers: password hashing, JWT creation/validation, refresh token hashing.
- `schemas.py` — Pydantic request/response models used by routes.
- `requirements.txt` — project Python dependencies.
- `doc.md` — this documentation.

## Key endpoints

- `POST /auth/signup` — create a new user, create profile, return `access_token` + `refresh_token`.
- `POST /auth/login` — login and receive tokens.
- `POST /auth/refresh` — exchange a refresh token for new access + refresh tokens (rotating refresh tokens).
- `GET /auth/me` — get current user metadata (protected).
- `PUT /profile` — update user's profile (protected).
- `GET /profile` — fetch user's profile (protected).
- `POST /sync` — upload local history entries (deduplicated via `client_id`) and optional push token. Returns counts: received, duplicates, total.
- `GET /history` — fetch recent history entries for the current user (protected).
- `POST /notify/{user_id}` — send an Expo push notification to a user (requires push token).

Protected endpoints require an Authorization header: `Authorization: Bearer <access_token>`.

## Authentication details

- Access tokens: short-lived JWTs (type=`access`).
- Refresh tokens: longer-lived JWTs (type=`refresh`) stored hashed in the database (rotation implemented — old refresh tokens are revoked when a new one is issued).
- Passwords: hashed with `passlib` CryptContext (`pbkdf2_sha256` by default for easier development). You can switch to `bcrypt` in production if desired.

## Database schema highlights

- `users` table stores user accounts and push token.
- `profiles` is one-to-one with `users` via `user_id`.
- `history_entries` stores predictions recorded on the client; `client_id` is unique and used to deduplicate during syncs.
- `refresh_tokens` stores hashed refresh tokens with expiry and `revoked` flag.

## Environment variables

Set these in your production environment (Render, Heroku, Docker, etc.):

- `DATABASE_URL` — full Postgres connection URL (e.g. `postgres://user:pass@host:5432/dbname`). Required.
- `SECRET_KEY` — secret used to sign JWTs. Required.
- `ALGORITHM` — JWT signing algorithm (default `HS256`). Optional.
- `ACCESS_TOKEN_EXPIRE_MINUTES` — integer, default 60.
- `REFRESH_TOKEN_EXPIRE_DAYS` — integer, default 30.
- `EXPO_PUSH_URL` — Expo push endpoint if using push notifications.

Do not commit secrets to the repository.

## Dependencies

Primary Python packages used (listed in `requirements.txt`):

- `fastapi` — web framework
- `uvicorn` — ASGI server
- `gunicorn` — production process manager (with Uvicorn workers)
- `SQLAlchemy` — ORM
- `psycopg2-binary` — Postgres driver
- `python-dotenv` — local .env loading
- `passlib` — password hashing
- `python-jose` — JWT handling
- `slowapi` — rate limiting
- `httpx` — HTTP client for outgoing requests

## Deployment notes (Render example)

Recommended Render settings:

- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command (production):
	`gunicorn -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:$PORT --workers 2`
- Health Check Path: `/health`
- Environment variables: set `DATABASE_URL`, `SECRET_KEY`, and other required vars in the Render dashboard.

Troubleshooting common deploy issues:

- `gunicorn: command not found` — ensure `gunicorn` is in `requirements.txt` (added).
- `Exited with status 1` — check live logs for Python exceptions (often missing `DATABASE_URL` or invalid DB credentials).
- `psycopg2` binary errors — prefer `psycopg2-binary` in `requirements.txt` to avoid compilation in many environments.

## Sync behavior and deduplication

- Clients send history entries with `id` field (referred to as `client_id` server-side). The `/sync` endpoint checks existing `client_id`s for the user and skips duplicates. Batch requests are deduplicated both against the DB and within the incoming payload to avoid unique constraint errors.

## Recommended improvements

- Use Alembic for migrations instead of relying on `Base.metadata.create_all` for production schema changes.
- Add structured logging and Sentry (or similar) for error monitoring.
- Consider moving to `bcrypt` for password hashing in production (requires building bcrypt wheels on the deploy target).
- Add tests for the `/sync` endpoint to verify deduplication and error handling.

## Local development

1. Create a Python virtualenv and activate it.
2. Set environment variables locally (or create a `.env` file and use `python-dotenv`). Example `.env` keys: `DATABASE_URL`, `SECRET_KEY`.
3. Install dependencies:
```
pip install -r requirements.txt
```
4. Run locally with Uvicorn for quick testing:
```
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Where to look for errors

- Render / hosting logs (build and live logs).
- Backend logs printed to stdout/stderr (captured by hosting provider).
- Database logs for unique constraint or connection issues.



