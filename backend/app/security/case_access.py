"""Opaque per-case capabilities for the anonymous, no-login experience."""

import hashlib
import secrets

from fastapi import Header, HTTPException

from ..models.case import CaseRecord


def issue_case_access_token() -> tuple[str, str]:
    token = secrets.token_urlsafe(32)
    return token, hash_case_access_token(token)


def hash_case_access_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def require_case_access(
    case_record: CaseRecord,
    x_case_token: str | None = Header(default=None, alias="X-Case-Token"),
) -> None:
    if not x_case_token or not case_record.access_token_hash:
        raise HTTPException(status_code=403, detail="This case requires its private access token.")
    if not secrets.compare_digest(case_record.access_token_hash, hash_case_access_token(x_case_token)):
        raise HTTPException(status_code=403, detail="You do not have access to this case.")
