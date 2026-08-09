from typing import Annotated
from fastapi import Header, HTTPException
from app.services.accounts import Account, get_account_by_token

async def require_account(x_api_key: Annotated[str | None, Header(alias="X-API-Key")] = None) -> Account:
    account = get_account_by_token((x_api_key or "").strip())
    if not account:
        raise HTTPException(status_code=401, detail="Add your OpenAI API key in Settings")
    return account
