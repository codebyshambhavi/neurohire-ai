import re
from collections import Counter

from app.answermind.preprocessing import normalize_text, text_statistics


FILLER_WORDS = {"um", "uh", "erm", "hmm", "basically", "actually", "literally"}
FILLER_PHRASES = ("you know", "kind of", "sort of", "i mean")
HESITATION_PHRASES = ("i think", "i guess", "maybe", "probably", "not sure", "let me think")


def clamp_score(value: float) -> int:
    return round(max(0.0, min(100.0, value)))


def words_per_minute(word_count: int, duration_seconds: float | None) -> float | None:
    if duration_seconds is None:
        return None
    return word_count / duration_seconds * 60


def sentence_flow_score(transcript: str) -> int:
    stats = text_statistics(transcript)
    if not stats.word_count:
        return 0

    sentence_lengths = [len(text_statistics(sentence).words) for sentence in stats.sentences]
    average = stats.average_sentence_length
    length_score = max(0.0, 100 - abs(average - 17) * 5)
    fragment_penalty = sum(length < 4 for length in sentence_lengths) * 12
    run_on_penalty = sum(length > 35 for length in sentence_lengths) * 15
    punctuation_bonus = min(10, max(0, len(stats.sentences) - 1) * 2)
    return clamp_score(length_score - fragment_penalty - run_on_penalty + punctuation_bonus)


def pace_score(transcript: str, duration_seconds: float | None) -> int:
    stats = text_statistics(transcript)
    wpm = words_per_minute(stats.word_count, duration_seconds)
    flow = sentence_flow_score(transcript)
    if wpm is None:
        return flow
    if 120 <= wpm <= 170:
        wpm_score = 100.0
    elif wpm < 120:
        wpm_score = max(0.0, (wpm - 60) / 60 * 100)
    else:
        wpm_score = max(0.0, (240 - wpm) / 70 * 100)
    return clamp_score(wpm_score * 0.8 + flow * 0.2)


def _filler_count(transcript: str) -> int:
    normalized = normalize_text(transcript)
    words = text_statistics(transcript).words
    return sum(word in FILLER_WORDS for word in words) + sum(
        normalized.count(phrase) for phrase in FILLER_PHRASES
    )


def filler_score(transcript: str) -> int:
    stats = text_statistics(transcript)
    if not stats.word_count:
        return 0
    rate = _filler_count(transcript) / stats.word_count
    return clamp_score(100 - rate * 900)


def _repetition_rate(transcript: str) -> float:
    words = text_statistics(transcript).words
    if not words:
        return 1.0
    counts = Counter(words)
    excess = sum(count - 3 for count in counts.values() if count > 3)
    adjacent = sum(left == right for left, right in zip(words, words[1:]))
    return (excess + adjacent) / len(words)


def _hesitation_rate(transcript: str) -> float:
    normalized = normalize_text(transcript)
    word_count = max(1, text_statistics(transcript).word_count)
    phrase_count = sum(normalized.count(phrase) for phrase in HESITATION_PHRASES)
    pause_markers = len(re.findall(r"\.{3,}|-{2,}|\b(?:um+|uh+)\b", normalized))
    return (phrase_count + pause_markers) / word_count


def confidence_score(transcript: str) -> int:
    stats = text_statistics(transcript)
    if not stats.word_count:
        return 0
    filler_component = filler_score(transcript)
    repetition_component = max(0.0, 100 - _repetition_rate(transcript) * 700)
    hesitation_component = max(0.0, 100 - _hesitation_rate(transcript) * 900)
    vocabulary_component = min(100.0, stats.unique_word_ratio * 125)
    return clamp_score(
        filler_component * 0.3
        + repetition_component * 0.25
        + hesitation_component * 0.3
        + vocabulary_component * 0.15
    )


def delivery_score(pace: int, confidence: int, filler: int, flow: int) -> int:
    return clamp_score(pace * 0.3 + confidence * 0.3 + filler * 0.2 + flow * 0.2)
