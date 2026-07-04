# NeuroHire AI

A multimodal AI interview intelligence platform.

## Repository structure

```
neurohire-ai/
├── frontend/     Next.js + TypeScript + Tailwind
├── backend/      FastAPI (planned)
├── ml-engine/    Machine learning modules (planned)
└── README.md
```

### frontend

The web application built with **Next.js**, **TypeScript**, and **Tailwind CSS**. Includes the marketing site, auth flows, interview room UI, dashboard, and reporting views.

```bash
cd frontend
npm install
npm run dev
```

### backend

Will contain the **FastAPI** backend — REST/WebSocket APIs, auth, and orchestration between the frontend and ML services.

### ml-engine

Will contain machine learning modules:

- **AnswerMind** — NLP engine
- **SpeechIQ** — Audio engine
- **VisionNet** — Computer vision engine

## Getting started

Start with the frontend while backend and ML components are under development:

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
