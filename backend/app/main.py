import os
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from app.routers import ai

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

app = FastAPI(title="ReplyPilot AI", version="1.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^chrome-extension://.*$",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _expected_api_key() -> str:
    return (os.getenv("REPLYPILOT_API_KEY") or "").strip()

@app.middleware("http")
async def api_key_guard(request: Request, call_next):
    if request.method != "OPTIONS" and request.url.path.startswith("/api/"):
        expected = _expected_api_key()
        if expected:
            provided = (request.headers.get("x-api-key") or "").strip()
            if provided != expected:
                return JSONResponse(status_code=401, content={"detail": "Invalid or missing X-API-Key"})
    return await call_next(request)

app.include_router(ai.router)

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "ReplyPilot AI",
        "byok": True,
        "api_key_required": bool(_expected_api_key()),
    }
