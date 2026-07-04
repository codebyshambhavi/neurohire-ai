"""
Static interview question bank.

This is content, not AI: a fixed, versioned set of prompts used to seed each
Interview's Question rows at creation time. It exists so the session flow
(GET /sessions/{id}/question, etc.) is fully functional in Phase 1, before
any dynamic/LLM-generated question logic exists.

Replacing this with an AnswerMind-driven adaptive question generator is a
future-phase concern and should only require swapping `build_question_set`.
"""
from app.models.enums import Difficulty, InterviewType, QuestionType, RoleTrack

_WARM_UP = "To start, walk me through a project you're most proud of and your specific role in it."

_ROLE_TECHNICAL: dict[RoleTrack, list[str]] = {
    RoleTrack.SWE: [
        "Explain the tradeoffs between an array and a linked list, and when you'd pick each.",
        "How would you design a rate limiter for a public API?",
        "Walk through how you would debug a memory leak in a long-running service.",
    ],
    RoleTrack.ML: [
        "Explain the bias-variance tradeoff. How would you diagnose underfitting vs. overfitting?",
        "You have a highly imbalanced classification dataset. What techniques would you use, and how would you evaluate the model?",
        "Describe how you would detect and handle data drift in a production ML system.",
    ],
    RoleTrack.DATA_ANALYST: [
        "Walk me through how you'd investigate a sudden drop in a key metric.",
        "How do you decide between a t-test and a chi-squared test for a given analysis?",
        "Describe how you would design an A/B test for a new product feature.",
    ],
    RoleTrack.PRODUCT_MANAGER: [
        "How would you prioritize a roadmap when engineering capacity is cut in half?",
        "Walk me through how you'd define success metrics for a new feature launch.",
        "How would you handle conflicting feedback from sales and engineering?",
    ],
}

_SYSTEM_DESIGN: dict[RoleTrack, str] = {
    RoleTrack.SWE: "Design a URL shortener that can handle 100 million requests per day.",
    RoleTrack.ML: "Design a system to serve real-time recommendations to 10 million daily users.",
    RoleTrack.DATA_ANALYST: "Design a data pipeline and dashboard to monitor daily active users across three products.",
    RoleTrack.PRODUCT_MANAGER: "Design the end-to-end launch plan for a new feature, from spec to post-launch metrics.",
}

_BEHAVIORAL = [
    "Tell me about a time you disagreed with a teammate on a decision. How did you resolve it?",
    "Describe a time you had to deliver difficult feedback. How did you approach it?",
    "Tell me about a project that failed. What did you learn?",
    "Describe a time you had to make a decision with incomplete information.",
]


def build_question_set(
    role: RoleTrack, difficulty: Difficulty, interview_type: InterviewType
) -> list[tuple[QuestionType, str]]:
    """
    Return an ordered list of (QuestionType, text) pairs for a new interview.

    Deterministic and content-only — no randomness, no model calls — so
    results are reproducible and easy to reason about in tests.
    """
    technical_pool = _ROLE_TECHNICAL[role]

    if interview_type == InterviewType.BEHAVIORAL:
        return [(QuestionType.WARM_UP, _WARM_UP)] + [
            (QuestionType.BEHAVIORAL, q) for q in _BEHAVIORAL[:4]
        ]

    questions: list[tuple[QuestionType, str]] = [(QuestionType.WARM_UP, _WARM_UP)]
    questions += [(QuestionType.TECHNICAL, q) for q in technical_pool[:2]]

    if difficulty != Difficulty.BEGINNER:
        questions.append((QuestionType.SYSTEM_DESIGN, _SYSTEM_DESIGN[role]))
    else:
        questions.append((QuestionType.TECHNICAL, technical_pool[2 % len(technical_pool)]))

    if interview_type == InterviewType.MIXED:
        questions.append((QuestionType.BEHAVIORAL, _BEHAVIORAL[0]))
    else:
        questions.append((QuestionType.TECHNICAL, technical_pool[-1]))

    return questions
