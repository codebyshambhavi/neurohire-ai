# NeuroHire AI - ML Engine

<<<<<<< HEAD
Standalone FastAPI inference service for NeuroHire's ML modules. AnswerMind v1
combines sentence-transformer embeddings with deterministic NLP heuristics; it
does not use random values or external generative APIs.

## Setup

```powershell
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8001
```

OpenAPI documentation is available at `http://127.0.0.1:8001/docs`.

The first analysis request downloads and caches
`sentence-transformers/all-MiniLM-L6-v2`. Service startup and OpenAPI generation
do not load the model.

## Endpoint

`POST /answermind/analyze`

```json
{
  "question_text": "Tell me about a difficult project.",
  "question_type": "behavioral",
  "transcript": "The situation was..."
}
```

The response matches the backend `AnswerMindResult` contract:

- `relevance`: cosine similarity between normalized question and answer embeddings.
- `structure`: STAR signals, examples, actions, outcomes, and measurable results.
- `clarity`: readability, sentence length, response length, filler words, and repetition.
- `completeness`: relevance, structure, and answer coverage.
- `technical_correctness`: v1 proxy based on semantic alignment and answer specificity.
- `feedback`: deterministic guidance for dimensions below their quality threshold.

All scores are integers from 0 to 100. Technical correctness is not yet factual
verification because v1 has no reference-answer or retrieval knowledge base.

## Layout

```text
app/
|-- main.py
`-- answermind/
    |-- embeddings.py
    |-- preprocessing.py
    |-- router.py
    |-- schemas.py
    |-- scoring.py
    `-- service.py
```

Future SpeechIQ, VisionNet, and NeuroCore modules should be added beside
`app/answermind/`.
=======
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
>>>>>>> answermind-engine
