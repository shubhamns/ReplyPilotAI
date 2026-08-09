# ReplyPilot AI

AI writing assistant Chrome extension — fix grammar, rewrite, translate, summarize, and generate replies on any website.

**GitHub:** https://github.com/shubhamns/ReplyPilotAI

```
Chrome Extension → Background Worker → FastAPI (SQLite) → OpenAI GPT-4o mini
```

**Security model:** Enter your OpenAI API key in extension **Settings**. It is sent once to your backend, encrypted in SQLite, and not kept in the extension. Do not put OpenAI keys in `.env` or ship them in the extension build.

## Project structure

```
ReplyPilotAI/
├── README.md
├── extension/   # Chrome MV3 (React + TypeScript + Vite + Tailwind)
└── backend/     # FastAPI + SQLite + OpenAI
```

## Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# set APP_SECRET to a long random string
./run.sh
```

`backend/.env`:

```env
HOST=127.0.0.1
PORT=8000
APP_SECRET=change-me-to-a-long-random-string
DATABASE_PATH=./data/replypilot.db
```

## Extension settings

1. Open the extension popup → gear icon
2. Set **API URL** (e.g. `http://127.0.0.1:8000`)
3. Paste your **OpenAI API Key** (`sk-...`)
4. Save — key is stored encrypted on the backend

## Load the extension

```bash
cd extension
npm install
npm run build
```

Chrome → `chrome://extensions` → Developer mode → **Load unpacked** → `extension/dist`

## API

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/accounts` | Save OpenAI key from Settings |
| POST | `/api/reply` | Requires session from Settings |
| POST | `/api/grammar` | |
| POST | `/api/rewrite` | |
| POST | `/api/translate` | |
| POST | `/api/summarize` | |

CORS allows only `chrome-extension://` origins, methods `GET|POST|OPTIONS`, and headers `Content-Type` + `X-API-Key`.

## GitHub workflow

```bash
git pull origin main
git add .
git commit -m "your message"
git push origin main
```

Update `VITE_GITHUB_REPO_URL` in `extension/.env` (see `.env.example`) if the repo URL changes, then rebuild.
