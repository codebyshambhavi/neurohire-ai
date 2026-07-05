from app.answermind.embeddings import semantic_similarity
from app.answermind.schemas import AnswerMindAnalyzeRequest, AnswerMindAnalyzeResponse
from app.answermind.scoring import (
    clamp_score,
    clarity_score,
    completeness_score,
    relevance_score,
    specificity_score,
    structure_score,
    technical_correctness_score,
)


def _feedback(
    relevance: int,
    structure: int,
    clarity: int,
    completeness: int,
    technical_correctness: int,
    transcript: str,
) -> str:
    normalized = transcript.lower()
    suggestions: list[str] = []

    if relevance < 60:
        suggestions.append(
            "Tie each point directly to the question and include one concrete example with the stack or tools you used"
        )
    if structure < 60:
        suggestions.append(
            "Organize the answer as context, your responsibility, implementation steps, and the final outcome"
        )
    if clarity < 60:
        suggestions.append("Shorten long sentences and remove filler so the core decisions are easier to follow")
    if technical_correctness < 60:
        suggestions.append(
            "Add technical depth by naming design choices, tradeoffs, and validation steps such as tests, metrics, or monitoring"
        )
    if completeness < 60:
        suggestions.append(
            "Include measurable results like latency reduction, accuracy lift, error-rate drop, or user/business impact"
        )

    if "because" not in normalized and "tradeoff" not in normalized:
        suggestions.append("Explain why you chose that approach and what alternative you considered")
    if not any(token in normalized for token in ("%", "ms", "seconds", "users", "x", "improved", "reduced", "increased")):
        suggestions.append("Quantify the result with at least one metric to make the impact credible")

    if not suggestions:
        return (
            "Strong answer with clear implementation detail and outcome. Keep this quality by grounding impact in one or two crisp metrics."
        )
    return "; ".join(suggestions).capitalize() + "."


def analyze(payload: AnswerMindAnalyzeRequest) -> AnswerMindAnalyzeResponse:
    semantic = semantic_similarity(payload.question_text, payload.transcript)
    relevance = relevance_score(payload.question_text, payload.transcript, semantic, payload.question_type)
    structure = structure_score(payload.transcript)
    clarity = clarity_score(payload.transcript)
    specificity = specificity_score(payload.transcript)
    completeness = completeness_score(payload.transcript, relevance, structure)
    technical_correctness = technical_correctness_score(
        relevance,
        specificity,
        payload.question_type,
        payload.question_text,
        payload.transcript,
    )

    return AnswerMindAnalyzeResponse(
        relevance=relevance,
        technical_correctness=technical_correctness,
        clarity=clarity,
        structure=structure,
        completeness=completeness,
        feedback=_feedback(
            relevance,
            structure,
            clarity,
            completeness,
            technical_correctness,
            payload.transcript,
        ),
    )
