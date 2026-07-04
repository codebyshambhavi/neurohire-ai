"""
Password hashing and JWT token utilities.

Kept dependency-light and framework-agnostic so it can be unit tested
without spinning up the full FastAPI app.

Note: password hashing uses the `bcrypt` library directly rather than
`passlib`. `passlib` 1.7.4 (its last release) is incompatible with
`bcrypt` >= 4.1's changed backend-detection API and raises spurious
"password cannot be longer than 72 bytes" errors even for short passwords.
Since passlib is unmaintained, calling bcrypt directly avoids the pin.
"""
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings

TOKEN_TYPE = "bearer"

# bcrypt has a hard 72-byte input limit; longer inputs are truncated
# deliberately (matches standard bcrypt behavior) rather than erroring.
_BCRYPT_MAX_BYTES = 72


def hash_password(plain_password: str) -> str:
    truncated = plain_password.encode("utf-8")[:_BCRYPT_MAX_BYTES]
    return bcrypt.hashpw(truncated, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    truncated = plain_password.encode("utf-8")[:_BCRYPT_MAX_BYTES]
    try:
        return bcrypt.checkpw(truncated, hashed_password.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(subject: str, expires_delta: timedelta | None = None) -> str:
    """Create a signed JWT for the given subject (typically the user id)."""
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode: dict[str, Any] = {"sub": subject, "exp": expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> str | None:
    """Return the subject (user id) encoded in the token, or None if invalid/expired."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None
    return payload.get("sub")
