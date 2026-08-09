from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.accounts import create_account

router = APIRouter(prefix="/api")

class CreateAccountRequest(BaseModel):
    openai_key: str = Field(..., min_length=10, max_length=256)
    label: str = Field(default="extension", max_length=64)

class CreateAccountResponse(BaseModel):
    access_token: str

@router.post("/accounts", response_model=CreateAccountResponse)
def create_account_route(payload: CreateAccountRequest) -> CreateAccountResponse:
    key = payload.openai_key.strip()
    if not key.startswith("sk-"):
        raise HTTPException(status_code=400, detail="OpenAI API key should start with sk-")
    try:
        token = create_account(payload.label.strip() or "extension", key)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    return CreateAccountResponse(access_token=token)
