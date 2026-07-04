def clamp_score(value: float) -> int:
    return round(max(0.0, min(100.0, value)))


def normalize_indicator(value: float | None) -> float | None:
    if value is None:
        return None
    return value * 100 if value <= 1 else value


def eye_contact_score(face_detected: bool, ratio: float | None) -> int:
    if not face_detected or ratio is None:
        return 0
    return clamp_score(ratio * 100)


def body_language_score(
    face_detected: bool,
    posture: float | None,
    movement: float | None,
) -> int:
    if not face_detected:
        return 0

    posture_value = normalize_indicator(posture)
    movement_value = normalize_indicator(movement)
    stability_value = 100 - movement_value if movement_value is not None else None

    if posture_value is not None and stability_value is not None:
        return clamp_score(posture_value * 0.7 + stability_value * 0.3)
    if posture_value is not None:
        return clamp_score(posture_value)
    if stability_value is not None:
        return clamp_score(stability_value)
    return 0


def confidence_score(
    face_detected: bool,
    eye_contact: int,
    body_language: int,
    has_eye_contact: bool,
    has_body_language: bool,
) -> int:
    if not face_detected:
        return 0
    if has_eye_contact and has_body_language:
        return clamp_score(eye_contact * 0.55 + body_language * 0.45)
    if has_eye_contact:
        return eye_contact
    if has_body_language:
        return body_language
    return 0


def presence_score(
    face_detected: bool,
    eye_contact: int,
    body_language: int,
    confidence: int,
    has_eye_contact: bool,
    has_body_language: bool,
) -> int:
    if not face_detected:
        return 0
    weighted: list[tuple[int, float]] = [(confidence, 0.4)]
    if has_eye_contact:
        weighted.append((eye_contact, 0.35))
    if has_body_language:
        weighted.append((body_language, 0.25))
    total_weight = sum(weight for _, weight in weighted)
    return clamp_score(sum(score * weight for score, weight in weighted) / total_weight)
