# Deployment Guide

This guide walks through deploying the AI Project Management Tool end-to-end:
NeonDB (database) → Groq (AI) → Hugging Face Spaces (backend) → Vercel (frontend).

## 1. Local Setup (quick recap)

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in values
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
cp .env.example .env
npm run dev
```

## 2. Set Up NeonDB (PostgreSQL)

1. Create a free account at [neon.tech](https://neon.tech).
2. Create a new **Project** (choose any region close to your Hugging Face Space region).
3. In the Neon dashboard, open **Connection Details** and copy the connection string. It looks
   like:
   ```
   postgresql://<user>:<password>@<host>/<database>?sslmode=require
   ```
4. Paste this into `backend/.env` as `DATABASE_URL`.
5. NeonDB requires SSL — the connection string above already includes `sslmode=require`, which
   the backend's SQLAlchemy engine respects automatically.
6. No manual schema setup is needed — `app/main.py` calls `Base.metadata.create_all()` on startup,
   which creates all tables (`users`, `projects`, `tasks`, `meeting_notes`, `risk_predictions`) if
   they don't already exist. Demo/seed data is also inserted automatically on first run.

## 3. Set Up Groq API Key

1. Create an account at [console.groq.com](https://console.groq.com).
2. Go to **API Keys** → **Create API Key**.
3. Copy the key and paste it into `backend/.env` as `GROQ_API_KEY`.
4. The default model used is `llama-3.3-70b-versatile` (set via `GROQ_MODEL` env var if you want
   to change it). The Groq API is called exclusively from `backend/app/services/groq_service.py`
   — it is never exposed to the frontend or the browser.

## 4. Deploy the Backend to Hugging Face Spaces

1. Create a free account at [huggingface.co](https://huggingface.co).
2. Click **New Space**.
   - Space name: `ai-project-management-tool-backend` (or any name)
   - SDK: **Docker**
   - Visibility: your choice (public/private)
3. Push the contents of the `backend/` folder to the new Space's git repo:
   ```bash
   cd backend
   git init
   git remote add space https://huggingface.co/spaces/<your-username>/<space-name>
   git add .
   git commit -m "Initial backend deployment"
   git push space main
   ```
   The included `Dockerfile` builds the FastAPI app and serves it on port `7860`, which is what
   Hugging Face Spaces expects for Docker-based Spaces.
4. In the Space settings, go to **Settings → Variables and secrets** and add:
   - `DATABASE_URL` (as a **secret**)
   - `GROQ_API_KEY` (as a **secret**)
   - `JWT_SECRET_KEY` (as a **secret**)
   - `FRONTEND_ORIGIN` (as a variable, e.g. `https://your-app.vercel.app`)
5. The Space will build and start automatically. Your backend will be available at:
   ```
   https://<your-username>-<space-name>.hf.space
   ```
6. Test it by visiting `https://<your-username>-<space-name>.hf.space/health` — you should see
   `{"status": "healthy"}`.

> Note: Free Hugging Face Spaces may sleep after inactivity. The first request after a period of
> inactivity may take a few seconds while the Space wakes up.

## 5. Deploy the Frontend to Vercel

1. Push the `frontend/` folder to a GitHub repository (or the whole monorepo, setting the Vercel
   **Root Directory** to `frontend`).
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repository.
3. Set the **Root Directory** to `frontend` if deploying from a monorepo.
4. Vercel auto-detects the Vite framework preset. Confirm:
   - Build command: `npm run build`
   - Output directory: `dist`
5. Add an environment variable:
   - `VITE_API_URL` = `https://<your-username>-<space-name>.hf.space` (your Hugging Face backend
     URL, **no trailing slash**)
6. Click **Deploy**. The included `vercel.json` adds a rewrite rule so client-side routing
   (React Router) works correctly on page refresh/direct links.
7. Once deployed, copy your Vercel URL (e.g. `https://ai-project-management-tool.vercel.app`) and
   go back to your Hugging Face Space secrets to update `FRONTEND_ORIGIN` to this value, so CORS
   allows requests from your live frontend. Restart the Space after updating secrets.

## 6. Environment Variable Summary

| Variable | Where | Example |
|----------|-------|---------|
| `DATABASE_URL` | Backend (HF Spaces secret) | `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require` |
| `GROQ_API_KEY` | Backend (HF Spaces secret) | `gsk_xxxxxxxxxxxxxxxxxxxx` |
| `JWT_SECRET_KEY` | Backend (HF Spaces secret) | output of `openssl rand -hex 32` |
| `FRONTEND_ORIGIN` | Backend (HF Spaces variable) | `https://your-app.vercel.app` |
| `VITE_API_URL` | Frontend (Vercel env var) | `https://your-username-space.hf.space` |

## 7. Post-Deployment Checklist

- [ ] Visit the backend `/health` endpoint — returns `{"status": "healthy"}`
- [ ] Visit the backend `/docs` endpoint — Swagger UI loads
- [ ] Register a new user from the deployed frontend
- [ ] Create a project, then generate tasks with AI
- [ ] Generate meeting notes with AI
- [ ] Run a risk prediction with AI
- [ ] Confirm no CORS errors in the browser console (if you see any, double-check
      `FRONTEND_ORIGIN` on the backend matches your Vercel URL exactly)

## 8. Updating the Deployment

- **Backend**: commit changes and `git push space main` again — Hugging Face rebuilds
  automatically.
- **Frontend**: push to your connected GitHub branch — Vercel redeploys automatically.
