import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.db import init_db
from app.routers import accounts, ai

load_dotenv(Path(__file__).resolve().parent.parent / ".env")
init_db()

app = FastAPI(title="ReplyPilot AI", version="1.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^chrome-extension://[a-p]{32}$",
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "X-API-Key"],
    expose_headers=[],
    max_age=600,
)

app.include_router(ai.router)
app.include_router(accounts.router)

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "ReplyPilot AI",
        "auth": "settings_openai_key",
        "storage": "sqlite",
        "openai_keys_client_side": False,
        "host": os.getenv("HOST", "127.0.0.1"),
    }
