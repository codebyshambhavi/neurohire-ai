import re
import unicodedata
from dataclasses import dataclass


WORD_PATTERN = re.compile(r"[a-z0-9]+(?:'[a-z0-9]+)?", re.IGNORECASE)
SENTENCE_BOUNDARY = re.compile(r"(?<=[.!?])\s+")
VOWEL_GROUP = re.compile(r"[aeiouy]+", re.IGNORECASE)


@dataclass(frozen=True)
class TextStatistics:
    words: tuple[str, ...]
    sentences: tuple[str, ...]
    word_count: int
    sentence_count: int
    average_sentence_length: float
    unique_word_ratio: float
    syllable_count: int


def normalize_text(text: str) -> str:
    normalized = unicodedata.normalize("NFKC", text).lower()
    return re.sub(r"\s+", " ", normalized).strip()


def split_sentences(text: str) -> list[str]:
    normalized = re.sub(r"\s+", " ", unicodedata.normalize("NFKC", text)).strip()
    if not normalized:
        return []
    return [sentence.strip() for sentence in SENTENCE_BOUNDARY.split(normalized) if sentence.strip()]


def tokenize_words(text: str) -> list[str]:
    return WORD_PATTERN.findall(normalize_text(text))


def count_syllables(word: str) -> int:
    cleaned = re.sub(r"[^a-z]", "", word.lower())
    if not cleaned:
        return 0
    groups = len(VOWEL_GROUP.findall(cleaned))
    if cleaned.endswith("e") and not cleaned.endswith(("le", "ye")) and groups > 1:
        groups -= 1
    return max(1, groups)


def text_statistics(text: str) -> TextStatistics:
    words = tuple(tokenize_words(text))
    sentences = tuple(split_sentences(text))
    word_count = len(words)
    sentence_count = max(1, len(sentences)) if words else 0
    return TextStatistics(
        words=words,
        sentences=sentences,
        word_count=word_count,
        sentence_count=sentence_count,
        average_sentence_length=word_count / sentence_count if sentence_count else 0.0,
        unique_word_ratio=len(set(words)) / word_count if word_count else 0.0,
        syllable_count=sum(count_syllables(word) for word in words),
    )
