from fastapi import APIRouter, Depends, HTTPException
from openai import APIError, APITimeoutError, AuthenticationError, RateLimitError
from app.deps import require_account
from app.models.schemas import AiResult, RewriteRequest, TextRequest, TranslateRequest
from app.services import openai_service
from app.services.accounts import Account

router = APIRouter(prefix="/api")

async def _run(awaitable):
    try:
        return await awaitable
    except RuntimeError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    except AuthenticationError as exc:
        raise HTTPException(status_code=401, detail="Invalid OpenAI API key for this account.") from exc
    except RateLimitError as exc:
        raise HTTPException(status_code=429, detail="OpenAI rate limit exceeded. Try again shortly.") from exc
    except APITimeoutError as exc:
        raise HTTPException(status_code=504, detail="OpenAI request timed out. Try again.") from exc
    except APIError as exc:
        raise HTTPException(status_code=502, detail="AI provider request failed.") from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Unexpected AI processing error.") from exc

@router.post("/reply", response_model=AiResult)
async def reply(payload: TextRequest, account: Account = Depends(require_account)) -> AiResult:
    return AiResult(result=await _run(openai_service.generate_reply(payload.text, account.openai_key)))

@router.post("/grammar", response_model=AiResult)
async def grammar(payload: TextRequest, account: Account = Depends(require_account)) -> AiResult:
    return AiResult(result=await _run(openai_service.fix_grammar(payload.text, account.openai_key)))

@router.post("/rewrite", response_model=AiResult)
async def rewrite(payload: RewriteRequest, account: Account = Depends(require_account)) -> AiResult:
    return AiResult(result=await _run(openai_service.rewrite_text(payload.text, payload.tone, account.openai_key)))

@router.post("/translate", response_model=AiResult)
async def translate(payload: TranslateRequest, account: Account = Depends(require_account)) -> AiResult:
    return AiResult(result=await _run(openai_service.translate_text(payload.text, payload.target_language, account.openai_key)))

@router.post("/summarize", response_model=AiResult)
async def summarize(payload: TextRequest, account: Account = Depends(require_account)) -> AiResult:
    return AiResult(result=await _run(openai_service.summarize_text(payload.text, account.openai_key)))
