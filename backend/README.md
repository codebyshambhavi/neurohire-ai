# NeuroHire AI — Backend (Phase 1)

FastAPI backend for NeuroHire AI, a multimodal AI interview intelligence
platform. This phase implements the full application skeleton — auth,
data models, and every route the frontend needs — with clean, typed
interfaces for the four AI modules (**AnswerMind**, **SpeechIQ**,
**VisionNet**, **NeuroCore**). Real model inference is intentionally
**not** implemented yet; see [ML client interfaces](#ml-client-interfaces-phase-1-stubs) below.

## Architecture

```
backend/
  app/
    main.py              # FastAPI app, CORS, startup
    core/
      config.py           # env-driven settings (pydantic-settings)
      security.py          # bcrypt password hashing + JWT
    db/
      base.py               # SQLAlchemy declarative base + mixins
      session.py             # engine + session factory
    models/                    # SQLAlchemy ORM models
      user.py, interview.py, question.py, answer.py, report.py, enums.py
    schemas/                    # Pydantic request/response models
      (mirror frontend/lib/mock-data.ts shapes 1:1)
    api/v1/                       # route handlers, one file per resource
      auth.py, interviews.py, sessions.py, reports.py, dashboard.py
    services/                      # business logic, called by routes
      interview_service.py, session_service.py, report_service.py,
      dashboard_service.py, question_bank.py
    ml_clients/                     # ML module interfaces (Phase 1: stubs)
      schemas.py, base.py, answermind_client.py, speechiq_client.py,
      visionnet_client.py, neurocore_client.py
  migrations/                        # Alembic migration scaffold
  requirements.txt
  .env.example
```

**Design principles applied:**
- **Schemas mirror the frontend exactly.** Every Pydantic response model in `app/schemas/` is shaped to match the corresponding type in `frontend/lib/mock-data.ts` (`dashboardStats`, `reportRadar`, `reportBreakdown`, `feedback`, etc.), so wiring up the frontend later requires no remapping.
- **Services own logic, routes stay thin.** Route handlers in `api/v1/` only handle HTTP concerns (auth, validation, status codes) and delegate to `services/`.
- **ML is a seam, not a shortcut.** `ml_clients/` defines the exact input/output contract each module will use, but every method raises `NotImplementedError`. Callers (see `session_service.submit_answer`) catch this and leave analysis as `"pending"` rather than fabricating scores. This keeps the dashboard and reports **honest**: a fresh deployment correctly shows empty/pending states, not fake numbers.
- **No fake data, anywhere.** The dashboard aggregates real rows from the database. Until Phase 6 (NeuroCore) ships, most dashboard fields will legitimately be empty — that's correct behavior, not a bug.

## ML client interfaces (Phase 1 stubs)

| Client | Contract file | Real implementation lands in |
|---|---|---|
| `AnswerMindClient` | `ml_clients/answermind_client.py` | Phase 3 |
| `SpeechIQClient` | `ml_clients/speechiq_client.py` | Phase 4 |
| `VisionNetClient` | `ml_clients/visionnet_client.py` | Phase 5 |
| `NeuroCoreClient` | `ml_clients/neurocore_client.py` | Phase 6 |

Each defines typed dataclass I/O (`ml_clients/schemas.py`) so the standalone
`ml-engine/` service can implement against the exact same contract later —
no backend changes needed when real inference lands, only the method body.

## API routes implemented

```
POST   /api/v1/auth/signup
POST   /api/v1/auth/login
GET    /api/v1/auth/me

POST   /api/v1/interviews
GET    /api/v1/interviews
GET    /api/v1/interviews/{interview_id}

GET    /api/v1/sessions/{interview_id}/question
POST   /api/v1/sessions/{interview_id}/answer
POST   /api/v1/sessions/{interview_id}/finish

GET    /api/v1/reports/{interview_id}

GET    /api/v1/dashboard/summary

GET    /health
```

All routes except `/auth/*` and `/health` require `Authorization: Bearer <token>`.

## Setup

### 1. Create a virtual environment and install dependencies
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` — at minimum, set a real `SECRET_KEY`:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```
The default `DATABASE_URL` uses SQLite and works out of the box for local development.

### 3. Run the server
```bash
uvicorn app.main:app --reload --port 8000
```
On startup (non-production only), tables are created automatically from the
SQLAlchemy models — no migration step needed for local dev.

Interactive API docs: **http://localhost:8000/docs**

### 4. (Production) Use Alembic instead of auto-create
```bash
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```
Set `ENVIRONMENT=production` in `.env` to disable the dev auto-`create_all`
and rely on migrations exclusively.

### 5. Connect the frontend
The frontend expects the API at a base URL — point it at
`http://localhost:8000/api/v1` once frontend networking is added (Phase 2).
CORS is already configured for `http://localhost:3000` by default
(`CORS_ORIGINS` in `.env`).

## Verified working (manually tested end-to-end)

- Signup → login → `/auth/me`, including duplicate-email (409), wrong-password (401), and unauthenticated (401) cases
- Interview creation seeds a real question set from the static question bank (`services/question_bank.py`) based on role/difficulty/type
- Full session flow: fetch next question → submit answer → repeat → session reports `is_complete` → finish → pending `Report` created
- Answer submission with a transcript correctly attempts `AnswerMindClient.analyze()`, catches the expected `NotImplementedError`, and stores the answer with `analysis_status: "pending"`
- `GET /reports/{id}` returns a well-formed pending report (`neuroscore: null`, empty radar/breakdown/feedback) rather than erroring
- `GET /dashboard/summary` returns real counts and honest empty states — no placeholder scores
- Cross-user access returns 404/401 rather than leaking another user's data

## Known Phase 1 limitations (by design, addressed in later phases)

- No refresh tokens — a single long-lived access token (`ACCESS_TOKEN_EXPIRE_MINUTES`) is issued at login/signup.
- No audio/video file upload endpoint yet — `Answer.audio_url` / `video_url` accept a pre-uploaded storage reference. Media upload/storage design is a Phase 4/5 concern (SpeechIQ/VisionNet need decoded media, not raw multipart blobs in this API layer).
- No WebSocket layer yet for live in-room signals — planned last, once the underlying modules exist to stream real values instead of the frontend's current fake jitter.
