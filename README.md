# LearnFlow - AI-Powered Adaptive Micro-Learning Portal for Institutes

LearnFlow is an end-to-end role-based adaptive micro-learning platform that converts institute curriculum and trainer-uploaded materials into versioned micro-capsules and quizzes. Through a closed-loop adaptive engine, it continually computes topic-level student mastery and recommends personalized learning paths.

---

## 🚀 Key Features

- **Role-Based Portals**: Tailored workflows and layouts for **Students**, **Trainers**, and **Admins**.
- **Document Ingestion Pipeline**: Extracts and chunks PDF, DOCX, PPTX, and TXT files with page/slide provenance.
- **AI Content Orchestrator**: Multi-provider LLM abstraction (Gemini 1.5/2.0, OpenAI GPT-4o, and offline Mock Provider) with strict Pydantic structured output validation.
- **Human-In-The-Loop Publishing**: All AI-generated capsules and quizzes are saved in `DRAFT` state until a trainer reviews, edits, and publishes them.
- **Closed-Loop Adaptive Engine**: Multi-factor mastery formula:
  $$\text{Mastery} = 0.55(\text{Recent Quiz}) + 0.20(\text{Completion}) + 0.15(\text{Trend}) + 0.10(\text{Prerequisite})$$
  - Categorizes topics into `STRONG` ($\ge 80\%$), `DEVELOPING` ($50-79\%$), and `NEEDS_SUPPORT` ($< 50\%$).
  - Dynamically routes learners to simplified capsules, foundational prerequisite review, or advanced challenge units.
- **Secure Quiz System**: Server-side scoring with zero client-side answer leakage.
- **Interactive Analytics**: Visualized learning trends, completion donuts, mastery heatmaps, and institute-level KPIs with Recharts.

---

## 🛠️ Tech Stack

| Area | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand, Axios, React Hook Form, Zod, Recharts, Lucide Icons |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy 2, Pydantic v2, Alembic, PostgreSQL / SQLite, Redis, Celery / Dramatiq |
| **AI Layer** | Google Gemini API (`gemini-1.5-pro` / `gemini-2.0-flash`), OpenAI API (`gpt-4o`), Mock Provider fallback |
| **Security** | Argon2 / Bcrypt password hashing, JWT access & rotating refresh tokens, RBAC middleware |
| **Infrastructure** | Docker Compose, PostgreSQL, Redis, Nginx reverse proxy |

---

## 📦 Project Structure

```
learnflow/
├── frontend/             # React 18 + Vite + Tailwind + TypeScript application
├── backend/              # FastAPI + SQLAlchemy 2 + Pydantic v2 API & workers
├── database/             # ER diagrams & seed SQL files
├── docs/                 # Architecture, API contracts, prompt specifications
├── infrastructure/       # Docker Compose & Nginx configuration
├── Makefile              # Project workflow shortcuts
└── README.md
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: v18+ (v20+ recommended)
- **Python**: 3.10+ (3.12 recommended) or **Docker & Docker Compose**

---

### 2. Running with Docker Compose (Recommended)

```bash
# 1. Clone & Enter repository
git clone <repo-url>
cd "Learn flow project"

# 2. Setup environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Start all services (PostgreSQL, Redis, FastAPI Backend, Celery Worker, Frontend)
docker compose -f infrastructure/docker-compose.yml up --build
```
- Frontend: `http://localhost:5173` (or `http://localhost` with Nginx)
- Backend API & Interactive Docs: `http://localhost:8000/docs`

---

### 3. Running Locally for Development

#### A. Backend Setup
```bash
cd backend

# Create & activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run seed data script (creates default demo users & courses)
python seed.py

# Launch FastAPI development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### B. Frontend Setup
```bash
cd frontend

# Install npm packages
npm install

# Start Vite dev server
npm run dev
```

---

## 🔑 Demo Login Credentials

The development database seeder initializes the following accounts:

| Role | Email | Password | Allowed Scope |
|---|---|---|---|
| **Admin** | `admin@learnflow.edu` | `AdminPass123!` | Full system administration, user activation, course moderation |
| **Trainer** | `trainer@learnflow.edu` | `TrainerPass123!` | Create courses, upload files, AI content review & publish |
| **Student (Strong)** | `student1@learnflow.edu` | `StudentPass123!` | Advanced progress, high mastery, next-topic unlocked |
| **Student (Needs Support)** | `student2@learnflow.edu` | `StudentPass123!` | Low quiz scores, simplified capsule recommendations |

---

## 🧪 Running Tests

### Backend Unit & Integration Tests
```bash
cd backend
pytest -v
```
Tests cover:
- JWT authentication & refresh token rotation.
- RBAC role denial & course ownership enforcement.
- Quiz server-side scoring & absence of answer leaks.
- Adaptive learning engine formulas & recommendation states.
- AI provider structured output Pydantic validation.

### Frontend TypeScript Verification
```bash
cd frontend
npm run build
```

---

## 📖 API Documentation & Endpoints

Once the backend is running, visit:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc UI**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **OpenAPI Schema**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

---

## 🛡️ Security & Privacy Notice

- AI API keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`) are managed exclusively on the backend.
- Passwords are encrypted using salted bcrypt/argon2 hashes.
- Student quiz endpoints redact `is_correct` flags until full attempt submission.
