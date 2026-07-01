# AI Project Management Tool

A full-stack, AI-powered project management dashboard built for IT teams. Generate project tasks,
summarize meeting notes, and predict delivery risk — all powered by Groq's LLM API, with a FastAPI
backend and a React (Vite) frontend.

## ✨ Features

- **Auth**: JWT-based registration & login
- **Projects**: Full CRUD for IT projects
- **Tasks**: Full CRUD with status (Pending / In Progress / Completed / Blocked) and priority
  (Low / Medium / High / Urgent)
- **AI Task Generation**: Describe a project and get a full task breakdown
- **AI Meeting Notes (MOM)**: Paste raw meeting notes and get a structured summary, decisions,
  and action items
- **AI Risk Prediction**: Enter project status and get a risk level, reasons, impact, and
  mitigation plan
- **Dashboard**: KPI cards for projects, tasks, completed tasks, and high-risk projects

## 🏗️ Tech Stack

| Layer      | Technology                          |
|------------|--------------------------------------|
| Frontend   | React + Vite                        |
| Backend    | FastAPI                             |
| Database   | PostgreSQL (NeonDB)                 |
| AI         | Groq API (Llama models)             |
| Auth       | JWT (python-jose + passlib/bcrypt)  |
| Frontend hosting | Vercel                        |
| Backend hosting  | Hugging Face Spaces (Docker) |

## 📁 Folder Structure

```
ai-project-management-tool/
├── frontend/                  # React + Vite app
│   ├── src/
│   │   ├── api/               # Axios API client
│   │   ├── components/        # Sidebar, Layout, Modal, Badge, KpiCard, ProtectedRoute
│   │   ├── context/           # AuthContext
│   │   ├── pages/             # Login, Register, Dashboard, Projects, Tasks,
│   │   │                      # AITaskGenerator, MeetingNotes, RiskPrediction, Settings
│   │   └── styles/            # Global CSS design system
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json
│   └── .env.example
├── backend/                   # FastAPI app
│   ├── app/
│   │   ├── main.py            # App entrypoint, CORS, startup, seed data
│   │   ├── database.py        # SQLAlchemy engine/session
│   │   ├── models.py          # User, Project, Task, MeetingNote, RiskPrediction
│   │   ├── schemas.py         # Pydantic request/response models
│   │   ├── auth.py            # JWT + password hashing
│   │   ├── routers/           # auth, projects, tasks, meeting_notes, risk_predictions
│   │   └── services/
│   │       └── groq_service.py  # Groq API wrapper (backend-only)
│   ├── requirements.txt
│   ├── Dockerfile             # Hugging Face Spaces compatible
│   └── .env.example
├── README.md
└── deployment-guide.md
```

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- A NeonDB PostgreSQL connection string (or any Postgres instance)
- A Groq API key ([console.groq.com/keys](https://console.groq.com/keys))

### 1. Backend

```bash
cd backend
py -3.11 -m venv venv
venv\Scripts\activate        # Linux: source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env and set DATABASE_URL, GROQ_API_KEY, JWT_SECRET_KEY

uvicorn app.main:app --reload
```

The backend starts at `http://localhost:8000`. On first startup it automatically creates all
database tables and inserts demo data:

- **Demo login**: `demo@example.com` / `Demo@1234`

API docs are available at `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install

cp .env.example .env
# VITE_API_URL=http://localhost:8000  (default is fine for local dev)

npm run dev
```

The frontend starts at `http://localhost:5173`.

### 3. Try it out

1. Open `http://localhost:5173`
2. Log in with the demo account, or register a new one
3. Create a project, then use **AI Task Generator**, **Meeting Notes**, and **Risk Prediction**
   from the sidebar

## 🔑 Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|----------|--------------|
| `DATABASE_URL` | NeonDB/Postgres connection string |
| `GROQ_API_KEY` | Groq API key (kept server-side only) |
| `JWT_SECRET_KEY` | Secret used to sign JWTs — generate with `openssl rand -hex 32` |
| `JWT_ALGORITHM` | Defaults to `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Defaults to `1440` (24h) |
| `FRONTEND_ORIGIN` | Comma-separated allowed CORS origins |

### Frontend (`frontend/.env`)
| Variable | Description |
|----------|--------------|
| `VITE_API_URL` | Base URL of the FastAPI backend |

> ⚠️ The Groq API key is **never** used in the frontend. All AI calls happen in
> `backend/app/services/groq_service.py`.

## 📡 API Reference

**Auth**
- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

**Projects**
- `GET /projects`
- `POST /projects`
- `GET /projects/{id}`
- `PUT /projects/{id}`
- `DELETE /projects/{id}`

**Tasks**
- `GET /tasks`
- `POST /tasks`
- `PUT /tasks/{id}`
- `DELETE /tasks/{id}`
- `POST /ai/generate-tasks`

**Meeting Notes**
- `GET /meeting-notes`
- `POST /meeting-notes`
- `POST /ai/generate-meeting-notes`

**Risk Prediction**
- `GET /risk-predictions`
- `POST /risk-predictions`
- `POST /ai/predict-risk`

See `deployment-guide.md` for full deployment instructions (NeonDB, Groq, Vercel, Hugging Face
Spaces).
