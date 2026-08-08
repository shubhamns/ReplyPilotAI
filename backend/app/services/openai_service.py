from openai import AsyncOpenAI

MODEL = "gpt-4o-mini"

def require_api_key(request_key: str | None) -> str:
    key = (request_key or "").strip()
    if not key:
        raise RuntimeError("OpenAI API key required. Add it in the extension Settings.")
    return key

async def complete(system: str, user: str, api_key: str | None = None) -> str:
    client = AsyncOpenAI(api_key=require_api_key(api_key))
    response = await client.chat.completions.create(
        model=MODEL,
        temperature=0.4,
        timeout=45.0,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    )
    content = response.choices[0].message.content
    return (content or "").strip()

REPLY_SYSTEM = (
    "You are ReplyPilot AI. Write a natural, concise reply to the message. "
    "Match the language of the original message. Do not add quotes or labels."
)

GRAMMAR_SYSTEM = (
    "You are ReplyPilot AI. Fix grammar, spelling, and punctuation. "
    "Preserve meaning and tone. Return only the corrected text."
)

REWRITE_SYSTEM = {
    "professional": "Rewrite the text in a polished professional tone. Return only the rewritten text.",
    "friendly": "Rewrite the text in a warm, friendly tone. Return only the rewritten text.",
    "short": "Rewrite the text to be shorter and tighter while keeping meaning. Return only the rewritten text.",
    "formal": "Rewrite the text in a formal, respectful tone. Return only the rewritten text.",
    "clear": "Rewrite the text to be clearer and easier to understand. Return only the rewritten text.",
}

def translate_system(language: str) -> str:
    return (
        f"You are ReplyPilot AI. Translate the text into {language}. "
        "Return only the translation with no explanations."
    )

SUMMARIZE_SYSTEM = (
    "You are ReplyPilot AI. Summarize the text into a short, clear response. "
    "Return only the summary."
)

async def generate_reply(text: str, api_key: str | None = None) -> str:
    return await complete(REPLY_SYSTEM, text, api_key)

async def fix_grammar(text: str, api_key: str | None = None) -> str:
    return await complete(GRAMMAR_SYSTEM, text, api_key)

async def rewrite_text(text: str, tone: str, api_key: str | None = None) -> str:
    system = REWRITE_SYSTEM.get(tone, REWRITE_SYSTEM["professional"])
    return await complete(system, text, api_key)

async def translate_text(text: str, target_language: str, api_key: str | None = None) -> str:
    return await complete(translate_system(target_language), text, api_key)

async def summarize_text(text: str, api_key: str | None = None) -> str:
    return await complete(SUMMARIZE_SYSTEM, text, api_key)
