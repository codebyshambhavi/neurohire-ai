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
METRIC_PATTERN = re.compile(
    r"(?:\b\d+(?:\.\d+)?\s*(?:%|percent|ms|seconds?|minutes?|hours?|days?|users?|requests?|x)\b|\b(?:increased|decreased|reduced|improved)\s+by\b)",
    re.IGNORECASE,
)


def clamp_score(value: float) -> int:
    return round(max(0.0, min(100.0, value)))


def structure_score(text: str) -> int:
    normalized = normalize_text(text)
    star_count = sum(any(signal in normalized for signal in signals) for signals in STAR_SIGNALS.values())
    example_present = any(signal in normalized for signal in EXAMPLE_SIGNALS)
    metric_present = bool(METRIC_PATTERN.search(normalized))
    sentence_count = len(text_statistics(text).sentences)

    score = star_count * 17.5
    score += 10 if example_present else 0
    score += 15 if metric_present else 0
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
    metric_bonus = 35 if METRIC_PATTERN.search(text) else 0
    example_bonus = 25 if any(signal in normalize_text(text) for signal in EXAMPLE_SIGNALS) else 0
    lexical_score = min(40, stats.unique_word_ratio * 50)
    return clamp_score(metric_bonus + example_bonus + lexical_score)


def completeness_score(text: str, relevance: int, structure: int) -> int:
    stats = text_statistics(text)
    coverage = min(100.0, stats.word_count / 100 * 100)
    return clamp_score(relevance * 0.35 + structure * 0.35 + coverage * 0.3)


def technical_correctness_score(relevance: int, specificity: int, question_type: str) -> int:
    if normalize_text(question_type) not in {"technical", "system design", "system_design"}:
        return clamp_score(relevance * 0.8 + specificity * 0.2)
    return clamp_score(relevance * 0.7 + specificity * 0.3)
