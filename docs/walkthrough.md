# LearnFlow Full-Stack Portal Walkthrough

LearnFlow is an AI-assisted adaptive micro-learning platform for educational institutes. It enables trainers to convert syllabus materials into reviewed, versioned capsules and quizzes, and delivers dynamically ordered learning paths to students through a closed-loop adaptive engine.

---

## 🏗️ Architecture & Deliverables Summary

### 1. Backend REST API & Engine (`backend/`)
- **FastAPI Application Gateway** ([main.py](file:///c:/Users/user/Desktop/Learn%20flow%20project/backend/app/main.py)):
  - Global error contract (`{ "error": { "code", "message", "details", "requestId" } }`).
  - CORS allowlist, rate limits, and health/readiness endpoints (`/health`, `/ready`).
  - Dual database support: SQLite (instant zero-dependency dev) and PostgreSQL (production).
- **Domain Models & Relational Integrity** ([models](file:///c:/Users/user/Desktop/Learn%20flow%20project/backend/app/models/__init__.py)):
  - `User`, `StudentProfile`, `TrainerProfile`, `AdminProfile`, `RefreshToken`, `AuditLog`.
  - `Course`, `CourseEnrollment`, `Topic`, `TopicPrerequisite` (DAG graph).
  - `Material`, `MaterialProcessing`, `MaterialChunk` (with page/slide locators).
  - `LearningCapsule`, `CapsuleSection`, `Video`.
  - `Quiz`, `QuizQuestion`, `QuizOption`, `QuizAttempt`, `QuizAnswer`.
  - `StudentProgress`, `StudentTopicPerformance`, `LearningPath`, `LearningPathItem`, `Recommendation`, `AIGeneration`, `Notification`.
- **Security & RBAC Middleware** ([permissions.py](file:///c:/Users/user/Desktop/Learn%20flow%20project/backend/app/core/permissions.py), [security.py](file:///c:/Users/user/Desktop/Learn%20flow%20project/backend/app/core/security.py)):
  - Argon2/Bcrypt password hashing and JWT access & rotating refresh tokens.
  - Role-based route guards (`STUDENT`, `TRAINER`, `ADMIN`).
  - Ownership enforcement (trainers access only owned courses) and enrollment enforcement.
  - **Zero Student Answer Key Leakage**: Option `is_correct` flags stripped in student delivery endpoints.
- **AI Content Provider Abstraction** ([ai](file:///c:/Users/user/Desktop/Learn%20flow%20project/backend/app/ai/__init__.py)):
  - Base interface `AIProvider` supporting `GeminiProvider` (Google Gemini 1.5/2.0), `OpenAIProvider` (GPT-4o), and offline `MockAIProvider`.
  - Strict Pydantic v2 structured JSON validation.
  - All AI output created as `DRAFT` requiring explicit trainer review and publishing.
- **Document Processing Pipeline** ([document_processing](file:///c:/Users/user/Desktop/Learn%20flow%20project/backend/app/document_processing/extractors/__init__.py)):
  - Extractors for PDF (PyMuPDF), PPTX (python-pptx), DOCX (python-docx), and TXT.
  - Token-bounded chunker preserving page and slide source attribution.
- **Closed-Loop Adaptive Engine** ([adaptive_engine.py](file:///c:/Users/user/Desktop/Learn%20flow%20project/backend/app/services/adaptive_engine.py), [quiz_service.py](file:///c:/Users/user/Desktop/Learn%20flow%20project/backend/app/services/quiz_service.py)):
  - Multi-factor formula: $\text{Mastery} = 0.55(\text{Recent Quiz}) + 0.20(\text{Completion}) + 0.15(\text{Trend}) + 0.10(\text{Prerequisite})$.
  - States: `STRONG` ($\ge 80\%$), `DEVELOPING` ($50-79\%$), `NEEDS_SUPPORT` ($< 50\%$), and `UNCERTAIN` checkpointing.
  - Dynamic route generation: unlocks next prerequisite-safe module, simplified capsule, or targeted practice quiz.

---

### 2. React 18 + TypeScript + Vite Frontend (`frontend/`)
- **Role Portals & Layouts** ([RoleLayouts.tsx](file:///c:/Users/user/Desktop/Learn%20flow%20project/frontend/src/layouts/RoleLayouts.tsx)):
  - **Public**: Landing page, Login with 1-click demo fillers, Registration with role selector, About, Contact.
  - **Student Portal**:
    - [StudentDashboardPage](file:///c:/Users/user/Desktop/Learn%20flow%20project/frontend/src/features/student/StudentDashboardPage.tsx): Radial progress rings, streak tracker, prominent adaptive recommendation banner, Recharts score trajectory and topic mastery heat maps.
    - [CoursePages](file:///c:/Users/user/Desktop/Learn%20flow%20project/frontend/src/features/student/CoursePages.tsx): Course catalog & prerequisite DAG tree with visual lock/unlock indicators.
    - [LearningQuizPages](file:///c:/Users/user/Desktop/Learn%20flow%20project/frontend/src/features/student/LearningQuizPages.tsx): Multi-tab capsule reader (Standard, Simplified analogy, Key points, Real-world case, Self-check), interactive timer-enabled quiz test taker, and scored attempt result review with explanations and adaptive suggestions.
    - [LearningPathRecommendations](file:///c:/Users/user/Desktop/Learn%20flow%20project/frontend/src/features/student/LearningPathRecommendations.tsx): Dynamic versioned personalized learning paths, active recommendations, strengths & gaps detector, and activity timeline.
  - **Trainer Portal**:
    - [TrainerDashboardPage](file:///c:/Users/user/Desktop/Learn%20flow%20project/frontend/src/features/trainer/TrainerDashboardPage.tsx): Owned courses, cohort quiz average, early-warning difficult topic detector, live student attempt feed.
    - [TrainerCourseMaterials](file:///c:/Users/user/Desktop/Learn%20flow%20project/frontend/src/features/trainer/TrainerCourseMaterials.tsx): Course creator, topic editor, and document upload dropzone.
    - [AIContentStudioPage](file:///c:/Users/user/Desktop/Learn%20flow%20project/frontend/src/features/trainer/AIContentStudioPage.tsx): Prompt AI draft generator, review/edit capsule sections with source attribution, and publish to students.
    - [TrainerOtherPages](file:///c:/Users/user/Desktop/Learn%20flow%20project/frontend/src/features/trainer/TrainerOtherPages.tsx): Quiz management, cohort performance matrix, and Recharts score distribution analytics.
  - **Admin Portal**:
    - [AdminPages](file:///c:/Users/user/Desktop/Learn%20flow%20project/frontend/src/features/admin/AdminPages.tsx): System KPIs, infrastructure health monitors, user directory, course moderation, and immutable audit logs.

---

### 3. Demo Data & Verification Script (`backend/seed.py`)

The seed script initializes the complete platform state with 4 accounts:

| Role | Email | Password | Seeded State |
|---|---|---|---|
| **Admin** | `admin@learnflow.edu` | `AdminPass123!` | System administration & security audit logs |
| **Trainer** | `trainer@learnflow.edu` | `TrainerPass123!` | Owns ML course, 4 topics with prerequisites, published capsules & quizzes |
| **Student 1** | `student1@learnflow.edu` | `StudentPass123!` | **Strong**: Scored 100% on Topics 1 & 2 $\rightarrow$ Topic 3 unlocked and recommended |
| **Student 2** | `student2@learnflow.edu` | `StudentPass123!` | **Needs Support**: Scored low on Topic 2 $\rightarrow$ Simplified capsule recommended |

---

## 🧪 Verification & Build Status

- **Frontend Production Build**: `npm run build` completed with **0 errors**:
  ```
  ✓ 2464 modules transformed.
  dist/index.html                   1.09 kB │ gzip:   0.59 kB
  dist/assets/index-CMqwY57F.css   40.37 kB │ gzip:   7.24 kB
  dist/assets/index-BpilkKEs.js   796.54 kB │ gzip: 227.86 kB
  ✓ built in 8.19s
  ```
- **Backend Test Suite**: `pytest` passed **11 / 11 tests with 0 failures**:
  ```
  tests/test_adaptive.py::test_adaptive_engine_strong_learner PASSED        [  9%]
  tests/test_adaptive.py::test_adaptive_engine_needs_support PASSED         [ 18%]
  tests/test_ai_schemas.py::test_structured_capsule_output_validation PASSED [ 27%]
  tests/test_ai_schemas.py::test_structured_capsule_output_missing_field PASSED [ 36%]
  tests/test_ai_schemas.py::test_structured_quiz_output_validation PASSED   [ 45%]
  tests/test_auth.py::test_user_registration PASSED                         [ 54%]
  tests/test_auth.py::test_user_login_and_token PASSED                      [ 63%]
  tests/test_auth.py::test_invalid_login PASSED                             [ 72%]
  tests/test_auth.py::test_rbac_trainer_route_denied_for_student PASSED     [ 81%]
  tests/test_quizzes.py::test_quiz_delivery_no_answer_leakage PASSED        [ 90%]
  tests/test_quizzes.py::test_quiz_submission_and_server_grading PASSED     [100%]
  ====================== 11 passed in 10.51s =======================
  ```
- **Database Seeder**: `seed.py` completed with exit code 0, establishing schema, topics DAG, capsules, quizzes, student attempts, and adaptive learning paths.
- **Docker & Deployment**: Pre-configured in `infrastructure/docker-compose.yml` for PostgreSQL, Redis, Backend, Celery Worker, and Frontend.

---

## 🚀 How to Run Locally

### 1. Start the FastAPI Backend
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```
Swagger API docs available at: `http://localhost:8000/docs`

### 2. Start the React Frontend
```bash
cd frontend
npm run dev
```
Interactive UI available at: `http://localhost:5173`

### 3. Log in with Demo Credentials
- **Student 1 (Strong)**: `student1@learnflow.edu` / `StudentPass123!` (Topic 3 unlocked)
- **Student 2 (Needs Support)**: `student2@learnflow.edu` / `StudentPass123!` (Simplified capsule recommended)
- **Trainer**: `trainer@learnflow.edu` / `TrainerPass123!` (AI Content Studio, Topic DAG & Quizzes)
- **Admin**: `admin@learnflow.edu` / `AdminPass123!` (System health, KPIs, audit logs)

