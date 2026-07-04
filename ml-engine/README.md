# NeuroHire AI - ML Engine

Standalone FastAPI inference service for NeuroHire's deterministic interview
analysis modules. It does not use random scores or external generative APIs.

## Setup

```powershell
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8001
```

OpenAPI documentation is available at `http://127.0.0.1:8001/docs`.

## Endpoints

### AnswerMind

`POST /answermind/analyze` analyzes answer relevance, technical specificity,
clarity, structure, completeness, and feedback. Semantic relevance uses
`sentence-transformers/all-MiniLM-L6-v2`, loaded lazily on the first request.

### SpeechMind

`POST /speechmind/analyze`

```json
{
  "transcript": "I led the migration and reduced latency by 30 percent.",
  "duration_seconds": 12
}
```

SpeechMind deterministically evaluates words per minute, filler frequency,
repeated words, hesitation indicators, sentence flow, confidence, and overall
delivery. When duration is omitted, sentence flow provides the pace proxy and
feedback recommends supplying duration for measured WPM.

All returned scores are integers from 0 to 100.

## Layout

```text
app/
|-- main.py
|-- answermind/
`-- speechmind/
```

Future VisionNet and NeuroCore modules should be added beside these modules.
