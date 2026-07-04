# Machine Learning Pipeline

## Overview

NeuroHire AI uses multimodal analysis to evaluate interview performance.

Input sources:

- Text
- Audio
- Video


---

# AnswerMind

Input:

- Interview question
- Candidate transcript

Processing:

- Text preprocessing
- Embedding generation
- Semantic comparison
- Response quality analysis


Output:

```json
{
  "relevance": 90,
  "clarity": 85,
  "technical_depth": 80
}
```

---

# SpeechIQ

Input:

Candidate audio.

Processing:

- Speech transcription
- Audio feature extraction
- Pause analysis
- Fluency analysis


Output:

```json
{
  "confidence": 88,
  "fluency": 84
}
```

---

# VisionNet

Input:

Interview video frames.

Processing:

- Face detection
- Landmark extraction
- Attention estimation


Output:

```json
{
  "eye_contact": 91,
  "engagement": 86
}
```

---

# NeuroCore

Combines multimodal features.

Input:

```text
[
AnswerMind features,
SpeechIQ features,
VisionNet features
]
```

Output:

- Final NeuroScore
- Strengths
- Improvements
- Recommendations
