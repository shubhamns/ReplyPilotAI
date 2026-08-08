# ReplyPilot AI

AI writing assistant Chrome extension — fix grammar, rewrite, translate, summarize, and generate replies on any website.

**GitHub:** https://github.com/shubhamns/ReplyPilotAI

```
Chrome Extension → Background Worker → FastAPI → OpenAI GPT-4o mini
```

Each developer sets their **own API URL + OpenAI API key** in the extension **Settings (gear icon)**. Keys stay in `chrome.storage.local` (this browser only) and are sent as `X-OpenAI-Key` — not stored in backend `.env` or git.

## Project structure

```
ReplyPilotAI/
├── README.md
├── PRIVACY.md
├── extension/   # Chrome MV3 (React + TypeScript + Vite + Tailwind)
└── backend/     # FastAPI proxy to OpenAI
```

## Configure in the app (required)

1. Open the extension popup
2. Click the **gear** icon
3. Set:
   - **API URL** — your backend, e.g. `http://127.0.0.1:8000`
   - **OpenAI API Key** — your key from https://platform.openai.com/api-keys
4. Click **Save**

Click the **GitHub** icon to open the repository.

## Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
./run.sh
```

`backend/.env` (no OpenAI key):

```env
HOST=127.0.0.1
PORT=8000
REPLYPILOT_API_KEY=
```

`REPLYPILOT_API_KEY` is optional — only if you want to protect a public host with a shared secret header.

## Load the extension

```bash
cd extension
npm install
npm run build
```

Chrome → `chrome://extensions` → Developer mode → **Load unpacked** → `extension/dist`

## API

All AI routes require `X-OpenAI-Key` from the extension Settings.

| Method | Path |
|--------|------|
| POST | `/api/reply` |
| POST | `/api/grammar` |
| POST | `/api/rewrite` |
| POST | `/api/translate` |
| POST | `/api/summarize` |

## GitHub workflow

```bash
git pull origin main
git add .
git commit -m "your message"
git push origin main
```

Update `VITE_GITHUB_REPO_URL` in `extension/.env` (see `.env.example`) if the repo URL changes, then rebuild.
