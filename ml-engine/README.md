# NeuroHire AI - ML Engine

Standalone FastAPI service for NeuroHire's machine-learning modules. This
phase provides the service boundary and AnswerMind HTTP contract only; no
models or inference logic are implemented yet.

## Structure

```text
ml-engine/
|-- app/
|   |-- main.py
|   `-- answermind/
|       |-- router.py
|       `-- schemas.py
|-- requirements.txt
`-- README.md
```

Future modules such as SpeechIQ, VisionNet, and NeuroCore should live beside
`app/answermind/` and expose their own routers and schemas.

## Run locally

```powershell
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8001
```

OpenAPI documentation is available at `http://127.0.0.1:8001/docs`.

## AnswerMind contract

`POST /answermind/analyze`

Request fields match the backend `AnswerMindInput` contract:

```json
{
  "question_text": "Explain the bias-variance tradeoff.",
  "question_type": "technical",
  "transcript": "Candidate answer text"
}
```

The declared success response matches `AnswerMindResult`: relevance,
technical correctness, clarity, structure, and completeness scores from 0 to
100, plus textual feedback. Until inference is implemented, the endpoint
returns HTTP 501 with a clear `not implemented` detail and never fabricates
scores.
