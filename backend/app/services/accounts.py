import base64
import hashlib
import os
import secrets
from dataclasses import dataclass
from cryptography.fernet import Fernet, InvalidToken
from app.db import connect, init_db

def _app_secret() -> str:
    secret = (os.getenv("APP_SECRET") or "").strip()
    if not secret:
        raise RuntimeError("APP_SECRET is required in backend/.env")
    return secret

def _fernet() -> Fernet:
    digest = hashlib.sha256(_app_secret().encode("utf-8")).digest()
    return Fernet(base64.urlsafe_b64encode(digest))

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def encrypt_openai_key(openai_key: str) -> str:
    return _fernet().encrypt(openai_key.encode("utf-8")).decode("utf-8")

def decrypt_openai_key(blob: str) -> str:
    try:
        return _fernet().decrypt(blob.encode("utf-8")).decode("utf-8")
    except InvalidToken as exc:
        raise RuntimeError("Could not decrypt stored OpenAI key. Check APP_SECRET.") from exc

@dataclass
class Account:
    id: int
    label: str
    openai_key: str

def create_account(label: str, openai_key: str) -> str:
    init_db()
    token = f"rp_{secrets.token_urlsafe(32)}"
    with connect() as conn:
        conn.execute(
            "INSERT INTO accounts (label, token_hash, openai_key_enc, active) VALUES (?, ?, ?, 1)",
            (label.strip() or "default", hash_token(token), encrypt_openai_key(openai_key.strip())),
        )
        conn.commit()
    return token

def get_account_by_token(token: str) -> Account | None:
    raw = (token or "").strip()
    if not raw:
        return None
    init_db()
    with connect() as conn:
        row = conn.execute(
            "SELECT id, label, openai_key_enc FROM accounts WHERE token_hash = ? AND active = 1",
            (hash_token(raw),),
        ).fetchone()
    if not row:
        return None
    return Account(id=row["id"], label=row["label"], openai_key=decrypt_openai_key(row["openai_key_enc"]))
