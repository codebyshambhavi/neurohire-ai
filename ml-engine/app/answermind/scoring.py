import re
from collections import Counter

from app.answermind.preprocessing import TextStatistics, normalize_text, text_statistics


STAR_SIGNALS = {
    "situation": ("situation", "context", "at the time", "the challenge", "we faced"),
    "task": ("task", "goal", "objective", "responsible for", "needed to", "my role"),
    "action": ("action", "i did", "i created", "i built", "i implemented", "i decided", "i led", "i worked"),
    "result": ("result", "outcome", "impact", "as a result", "ultimately", "this led", "improved", "reduced", "increased"),
}
EXAMPLE_SIGNALS = ("for example", "for instance", "specifically", "such as", "one example")
FILLER_WORDS = {"um", "uh", "erm", "basically", "actually", "literally", "like"}
FILLER_PHRASES = ("you know", "kind of", "sort of", "i mean")
STOPWORDS = {
    "a",
    "an",
    "and",
    "are",
    "as",
    "at",
    "be",
    "by",
    "for",
    "from",
    "how",
    "i",
    "in",
    "is",
    "it",
    "of",
    "on",
    "or",
    "that",
    "the",
    "to",
    "was",
    "we",
    "what",
    "when",
    "where",
    "which",
    "with",
    "would",
}
TECH_TOOL_TERMS = {
    "python",
    "java",
    "javascript",
    "typescript",
    "sql",
    "postgres",
    "mysql",
    "redis",
    "docker",
    "kubernetes",
    "aws",
    "gcp",
    "azure",
    "fastapi",
    "flask",
    "django",
    "react",
    "next",
    "node",
    "spark",
    "airflow",
    "pytorch",
    "tensorflow",
    "scikit",
    "xgboost",
    "bert",
    "llm",
    "grpc",
    "rest",
    "graphql",
    "cache",
    "queue",
    "index",
    "ci",
    "cd",
}
PROGRAMMING_CONCEPTS = {
    "algorithm",
    "complexity",
    "datastructure",
    "data",
    "thread",
    "concurrency",
    "async",
    "memory",
    "latency",
    "throughput",
    "api",
    "schema",
    "validation",
    "test",
    "debug",
    "profiling",
    "refactor",
}
ML_CONCEPTS = {
    "feature",
    "training",
    "inference",
    "evaluation",
    "precision",
    "recall",
    "f1",
    "accuracy",
    "auc",
    "embedding",
    "token",
    "transformer",
    "regularization",
    "overfit",
    "drift",
}
SYSTEM_DESIGN_CONCEPTS = {
    "scalability",
    "availability",
    "partition",
    "replication",
    "sharding",
    "consistency",
    "idempotent",
    "load",
    "balancer",
    "cache",
    "message",
    "queue",
    "retry",
    "timeout",
    "backoff",
}
IMPLEMENTATION_VERBS = (
    "implemented",
    "built",
    "designed",
    "optimized",
    "debugged",
    "migrated",
    "deployed",
    "tested",
    "measured",
    "benchmarked",
    "instrumented",
)
CHRONOLOGY_SIGNALS = ("first", "then", "after", "next", "finally", "before", "once")
RESULT_SIGNALS = (
    "increased",
    "reduced",
    "improved",
    "cut",
    "saved",
    "boosted",
    "dropped",
    "resulted",
    "led",
)
ROLE_TERM_MAP = {
    "software": {"api", "backend", "frontend", "database", "service", "deploy", "testing"},
    "swe": {"api", "backend", "frontend", "database", "service", "deploy", "testing"},
    "ml": {"model", "feature", "inference", "training", "evaluation", "experiment", "drift"},
    "data": {"pipeline", "etl", "warehouse", "query", "dashboard", "metric", "aggregation"},
    "analyst": {"dashboard", "kpi", "query", "cohort", "metric", "trend", "sql"},
    "product": {"roadmap", "stakeholder", "experiment", "adoption", "retention", "user", "impact"},
    "pm": {"roadmap", "stakeholder", "experiment", "adoption", "retention", "user", "impact"},
}
METRIC_PATTERN = re.compile(
    r"(?:\b\d+(?:\.\d+)?\s*(?:%|percent|ms|seconds?|minutes?|hours?|days?|users?|requests?|x)\b|\b(?:increased|decreased|reduced|improved)\s+by\b)",
    re.IGNORECASE,
)
PROJECT_NAME_PATTERN = re.compile(r"\b(?:[A-Z]{2,}|[A-Z][a-z]+(?:[A-Z][a-z]+)+|[A-Za-z]+-[A-Za-z0-9]+)\b")


def clamp_score(value: float) -> int:
    return round(max(0.0, min(100.0, value)))


def structure_score(text: str) -> int:
    normalized = normalize_text(text)
    star_count = sum(any(signal in normalized for signal in signals) for signals in STAR_SIGNALS.values())

    situation_present = star_count > 0 or any(
        signal in normalized for signal in ("when", "while", "during", "customer", "production", "deadline")
    )
    task_present = any(
        signal in normalized
        for signal in ("needed to", "had to", "was responsible", "my goal", "target was", "owned")
    )
    action_present = bool(
        re.search(
            r"\b(?:i|we)\s+(?:implemented|built|designed|optimized|debugged|migrated|deployed|tested|analyzed|created)\b",
            normalized,
        )
    )
    result_present = bool(METRIC_PATTERN.search(normalized)) or any(signal in normalized for signal in RESULT_SIGNALS)
    star_stage_count = sum((situation_present, task_present, action_present, result_present))

    example_present = any(signal in normalized for signal in EXAMPLE_SIGNALS)
    metric_present = bool(METRIC_PATTERN.search(normalized))
    chronology_present = sum(signal in normalized for signal in CHRONOLOGY_SIGNALS) >= 2
    sentence_count = len(text_statistics(text).sentences)

    score = max(star_count * 12.5, star_stage_count * 20)
    score += 10 if example_present else 0
    score += 15 if metric_present else 0
    score += 10 if chronology_present else 0
    score += 5 if sentence_count >= 3 else 0
    return clamp_score(score)


def _flesch_reading_ease(stats: TextStatistics) -> float:
    if not stats.word_count or not stats.sentence_count:
        return 0.0
    return 206.835 - (1.015 * stats.average_sentence_length) - (
        84.6 * stats.syllable_count / stats.word_count
    )


def _length_score(word_count: int) -> float:
    if word_count < 20:
        return word_count / 20 * 35
    if word_count < 60:
        return 35 + (word_count - 20) / 40 * 45
    if word_count <= 300:
        return 80 + min(20, (word_count - 60) / 120 * 20)
    return max(55, 100 - (word_count - 300) / 10)


def _filler_ratio(stats: TextStatistics, normalized: str) -> float:
    if not stats.word_count:
        return 1.0
    filler_count = sum(1 for word in stats.words if word in FILLER_WORDS)
    filler_count += sum(normalized.count(phrase) for phrase in FILLER_PHRASES)
    return filler_count / stats.word_count


def _repetition_ratio(stats: TextStatistics) -> float:
    if not stats.word_count:
        return 1.0
    counts = Counter(stats.words)
    repeated = sum(count - 2 for count in counts.values() if count > 2)
    adjacent = sum(left == right for left, right in zip(stats.words, stats.words[1:]))
    return (repeated + adjacent) / stats.word_count


def clarity_score(text: str) -> int:
    stats = text_statistics(text)
    if not stats.word_count:
        return 0

    readability = _flesch_reading_ease(stats)
    readability_score = max(0.0, min(100.0, (readability + 10) / 100 * 100))
    sentence_score = max(0.0, 100 - abs(stats.average_sentence_length - 18) * 4)
    filler_score = max(0.0, 100 - _filler_ratio(stats, normalize_text(text)) * 800)
    repetition_score = max(0.0, 100 - _repetition_ratio(stats) * 500)

    return clamp_score(
        readability_score * 0.25
        + sentence_score * 0.2
        + _length_score(stats.word_count) * 0.25
        + filler_score * 0.15
        + repetition_score * 0.15
    )


def specificity_score(text: str) -> int:
    stats = text_statistics(text)
    normalized = normalize_text(text)
    metric_bonus = 35 if METRIC_PATTERN.search(text) else 0
    example_bonus = 25 if any(signal in normalized for signal in EXAMPLE_SIGNALS) else 0
    tool_bonus = min(20, sum(term in normalized for term in TECH_TOOL_TERMS) * 5)
    lexical_score = min(40, stats.unique_word_ratio * 50)
    return clamp_score(metric_bonus + example_bonus + lexical_score + tool_bonus)


def completeness_score(text: str, relevance: int, structure: int) -> int:
    stats = text_statistics(text)
    coverage = min(100.0, stats.word_count / 100 * 100)
    return clamp_score(relevance * 0.35 + structure * 0.35 + coverage * 0.3)


def relevance_score(question_text: str, answer_text: str, semantic_similarity_score: float, question_type: str) -> int:
    question_stats = text_statistics(question_text)
    answer_stats = text_statistics(answer_text)
    normalized_question = normalize_text(question_text)
    normalized_answer = normalize_text(answer_text)

    question_terms = {w for w in question_stats.words if len(w) > 2 and w not in STOPWORDS}
    answer_terms = {w for w in answer_stats.words if len(w) > 2 and w not in STOPWORDS}
    overlap_ratio = len(question_terms & answer_terms) / max(1, len(question_terms))

    role_term_bonus = _role_term_coverage(normalized_question, answer_terms) * 100
    evidence_score = _concrete_evidence_score(answer_text, normalized_answer)
    technical_alignment = _technical_signal_density(normalized_answer) * 100
    implementation_alignment = _implementation_detail_density(normalized_answer) * 100
    word_count = answer_stats.word_count
    metrics_present = bool(METRIC_PATTERN.search(answer_text))
    tool_count = sum(term in normalized_answer for term in TECH_TOOL_TERMS)
    decision_signals = sum(
        signal in normalized_answer
        for signal in ("tradeoff", "because", "constraint", "feature flag", "monitor", "benchmark")
    )

    technical_question = _is_technical_prompt(normalize_text(question_type), normalized_question)
    score = semantic_similarity_score * 36
    score += overlap_ratio * 24
    score += evidence_score * 0.34
    score += role_term_bonus * 0.22
    if technical_question:
        score += technical_alignment * 0.16
        score += implementation_alignment * 0.08

        # High-quality technical answers should escape mid-range compression.
        evidence_gate = evidence_score >= 65 and tool_count >= 2 and metrics_present and word_count >= 70
        if evidence_gate:
            score += 10
            if implementation_alignment >= 55:
                score += 6
            if decision_signals >= 2:
                score += 4
            if overlap_ratio >= 0.1 and evidence_score >= 80:
                score += 8

    # Keep weak answers low unless they provide enough depth and specificity.
    if word_count < 35:
        score -= 10
    elif word_count < 55:
        score -= 4

    return clamp_score(score)


def technical_correctness_score(
    relevance: int,
    specificity: int,
    question_type: str,
    question_text: str,
    answer_text: str,
) -> int:
    normalized_question = normalize_text(question_text)
    normalized_answer = normalize_text(answer_text)
    technical_question = _is_technical_prompt(normalize_text(question_type), normalized_question)

    concept_density = _technical_signal_density(normalized_answer) * 100
    implementation_density = _implementation_detail_density(normalized_answer) * 100
    role_coverage = _role_term_coverage(normalized_question, set(text_statistics(answer_text).words)) * 100
    metrics_present = bool(METRIC_PATTERN.search(answer_text))
    tool_hits = sum(term in normalized_answer for term in TECH_TOOL_TERMS)
    decision_hits = sum(
        signal in normalized_answer
        for signal in ("tradeoff", "constraint", "because", "feature flag", "benchmark", "monitor", "retry")
    )
    word_count = text_statistics(answer_text).word_count

    if technical_question:
        score = relevance * 0.24 + specificity * 0.22 + concept_density * 0.3 + implementation_density * 0.24
        score += min(10, tool_hits * 2)
        score += 6 if metrics_present else 0
        score += min(8, decision_hits * 2)
        if concept_density >= 60 and implementation_density >= 60 and metrics_present:
            score += 10
        if word_count < 35:
            score -= 8
        return clamp_score(score)

    score = relevance * 0.6 + specificity * 0.2 + implementation_density * 0.1 + role_coverage * 0.1
    return clamp_score(score)


def _is_technical_prompt(question_type: str, normalized_question: str) -> bool:
    if question_type in {"technical", "system design", "system_design"}:
        return True
    technical_cues = (
        "design",
        "implement",
        "architecture",
        "algorithm",
        "debug",
        "scal",
        "model",
        "pipeline",
        "database",
        "performance",
    )
    return any(cue in normalized_question for cue in technical_cues)


def _concrete_evidence_score(raw_text: str, normalized_text: str) -> int:
    example = any(signal in normalized_text for signal in EXAMPLE_SIGNALS)
    metric = bool(METRIC_PATTERN.search(raw_text))
    project_name = bool(PROJECT_NAME_PATTERN.search(raw_text))
    tech_terms = min(4, sum(term in normalized_text for term in TECH_TOOL_TERMS))
    implementation_terms = min(4, sum(verb in normalized_text for verb in IMPLEMENTATION_VERBS))

    score = 0
    score += 20 if example else 0
    score += 30 if metric else 0
    score += 20 if project_name else 0
    score += tech_terms * 7
    score += implementation_terms * 5
    return clamp_score(score)


def _technical_signal_density(normalized_text: str) -> float:
    concept_hits = sum(token in normalized_text for token in PROGRAMMING_CONCEPTS)
    concept_hits += sum(token in normalized_text for token in ML_CONCEPTS)
    concept_hits += sum(token in normalized_text for token in SYSTEM_DESIGN_CONCEPTS)
    return min(1.0, concept_hits / 10)


def _implementation_detail_density(normalized_text: str) -> float:
    verb_hits = sum(verb in normalized_text for verb in IMPLEMENTATION_VERBS)
    detail_hits = sum(term in normalized_text for term in ("because", "tradeoff", "constraint", "tested", "rolled out", "monitor"))
    return min(1.0, (verb_hits + detail_hits) / 8)


def _role_term_coverage(normalized_question: str, answer_terms: set[str]) -> float:
    role_terms: set[str] = set()
    for role_key, terms in ROLE_TERM_MAP.items():
        if role_key in normalized_question:
            role_terms |= terms

    if not role_terms:
        return 0.0
    hits = sum(term in answer_terms for term in role_terms)
    return hits / len(role_terms)
