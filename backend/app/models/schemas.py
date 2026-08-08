from pydantic import BaseModel, Field, field_validator
from typing import Literal

Tone = Literal["professional", "friendly", "short", "formal", "clear"]

ALLOWED_LANGUAGES = {
    "English",
    "Hindi",
}

class TextRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=12000)

class RewriteRequest(TextRequest):
    tone: Tone = "professional"

class TranslateRequest(TextRequest):
    target_language: str = Field(default="English", min_length=2, max_length=64)

    @field_validator("target_language")
    @classmethod
    def validate_language(cls, value: str) -> str:
        normalized = value.strip()
        match = next((lang for lang in ALLOWED_LANGUAGES if lang.lower() == normalized.lower()), None)
        if not match:
            allowed = ", ".join(sorted(ALLOWED_LANGUAGES))
            raise ValueError(f"Unsupported language. Allowed: {allowed}")
        return match

class AiResult(BaseModel):
    result: str
