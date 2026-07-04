from app.answermind.embeddings import semantic_similarity
from app.answermind.schemas import AnswerMindAnalyzeRequest, AnswerMindAnalyzeResponse
from app.answermind.scoring import (
    clamp_score,
    clarity_score,
    completeness_score,
    specificity_score,
    structure_score,
    technical_correctness_score,
)


def _feedback(relevance: int, structure: int, clarity: int, completeness: int) -> str:
    suggestions: list[str] = []
    if relevance < 60:
        suggestions.append("Answer the question more directly and connect each point to the prompt")
    if structure < 60:
        suggestions.append("use a clear situation, task, action, and result structure with a concrete example")
    if clarity < 60:
        suggestions.append("use concise sentences and reduce filler or repeated words")
    if completeness < 60:
        suggestions.append("add enough detail to explain your decisions and outcome")

    if not suggestions:
        return "The answer is relevant, structured, and clear. Keep supporting key claims with specific evidence."
    return "; ".join(suggestions).capitalize() + "."


def analyze(payload: AnswerMindAnalyzeRequest) -> AnswerMindAnalyzeResponse:
    relevance = clamp_score(semantic_similarity(payload.question_text, payload.transcript) * 100)
    structure = structure_score(payload.transcript)
    clarity = clarity_score(payload.transcript)
    specificity = specificity_score(payload.transcript)
    completeness = completeness_score(payload.transcript, relevance, structure)
    technical_correctness = technical_correctness_score(
        relevance,
        specificity,
        payload.question_type,
    )

    return AnswerMindAnalyzeResponse(
        relevance=relevance,
        technical_correctness=technical_correctness,
        clarity=clarity,
        structure=structure,
        completeness=completeness,
        feedback=_feedback(relevance, structure, clarity, completeness),
    )
