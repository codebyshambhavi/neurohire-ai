# NeuroHire AI Architecture

## Overview

NeuroHire AI follows a modular architecture separating user experience, application logic, and machine learning inference.

The system consists of three primary layers:

- Frontend Application
- Backend API Service
- Machine Learning Engine


## High Level Architecture

```text
Client
  |
  v
Frontend (Next.js)
  |
  v
Backend API (FastAPI)
  |
  v
ML Engine Service

      |
      |
 -----------------------
 |          |          |
AnswerMind SpeechIQ VisionNet

          |
          v

      NeuroCore
```

---

## Frontend Layer

Responsibilities:

- User interface
- Authentication flow
- Interview experience
- Dashboard visualization
- Report rendering

Technology:

- Next.js
- React
- TypeScript
- Tailwind CSS


---

## Backend Layer

Responsibilities:

- Authentication
- User management
- Interview lifecycle
- Data persistence
- Communication with ML services

Technology:

- FastAPI
- PostgreSQL
- SQLAlchemy


---

## Machine Learning Layer

Independent ML service responsible for processing:

- Text
- Audio
- Video

Outputs structured intelligence scores consumed by backend services.
