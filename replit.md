# ZdorovLife Telegram Mini App

FastAPI server serving a static Telegram Mini App (web/index.html) and an aiogram bot (bot.py).

## Replit setup
- Workflow: `Start application` runs `uvicorn server:app --host 0.0.0.0 --port 5000` (webview).
- Deployment: autoscale, runs uvicorn on port 5000.
- The bot (`bot.py`) is not auto-started; it requires `BOT_TOKEN` and `WEBAPP_URL` env vars.
