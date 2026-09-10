# LearnFlow API Contract Specification

**Base URL**: `/api/v1`

---

## 1. Authentication & Users

### `POST /auth/register`
- **Access**: Public
- **Request**:
  ```json
  {
    "email": "user@example.com",
    "password": "StrongPassword123!",
    "full_name": "Jane Doe",
    "role": "STUDENT",
    "student_code": "STU1001",
    "institution_name": "State University",
    "current_level": "Undergraduate"
  }
  ```
- **Response** `(201 Created)`:
  ```json
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "user@example.com",
    "full_name": "Jane Doe",
    "role": "STUDENT",
    "is_active": true
  }
  ```

### `POST /auth/login`
- **Access**: Public
- **Request**:
  ```json
  {
    "email": "user@example.com",
    "password": "StrongPassword123!"
  }
  ```
- **Response** `(200 OK)`:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "expires_in": 3600,
    "user": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "email": "user@example.com",
      "full_name": "Jane Doe",
      "role": "STUDENT"
    }
  }
  ```

### `POST /auth/refresh`
- **Access**: Public (Bearer refresh token)
- **Request**: `{ "refresh_token": "eyJhbGciOi..." }`
- **Response** `(200 OK)`: `{ "access_token": "eyJhbGciOi...", "refresh_token": "eyJhbGciOi...", "token_type": "bearer" }`

---

## 2. Student Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/students/me/dashboard` | `STUDENT` | Progress stats, streak, current recommendations, enrolled courses |
| `GET` | `/students/me/courses` | `STUDENT` | List of enrolled courses with progress percentages |
| `GET` | `/students/me/performance` | `STUDENT` | Topic mastery matrix, recent quiz trend series |
| `GET` | `/students/me/recommendations` | `STUDENT` | Active adaptive recommendations with reasoning |
| `GET` | `/students/me/learning-path` | `STUDENT` | Ordered personal path of prerequisite-safe units |
| `GET` | `/courses/{course_id}/student-view` | `STUDENT` | Topics tree with lock/unlock status & mastery |
| `GET` | `/capsules/{capsule_id}` | `STUDENT` | Read published micro-capsule content |
| `POST` | `/capsules/{capsule_id}/progress` | `STUDENT` | Record capsule completion & time spent |
| `GET` | `/quizzes/{quiz_id}` | `STUDENT` | Retrieve quiz questions (NO answer keys) |
| `POST` | `/quizzes/{quiz_id}/attempts` | `STUDENT` | Submit answers for server-side grading |
| `GET` | `/attempts/{attempt_id}/result` | `STUDENT/TRAINER` | View scored result, explanations, and remediation |

---

## 3. Trainer Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/trainer/dashboard` | `TRAINER` | Owned courses, student count, difficult topics |
| `GET` | `/trainer/courses` | `TRAINER` | List owned courses |
| `POST` | `/trainer/courses` | `TRAINER` | Create a new course |
| `GET/PATCH/DELETE` | `/trainer/courses/{course_id}` | `TRAINER` (Owner) | Manage course metadata |
| `POST` | `/trainer/courses/{course_id}/topics` | `TRAINER` (Owner) | Add topic with sequence & prerequisites |
| `POST` | `/trainer/materials` | `TRAINER` | Upload PDF/PPTX/DOCX/TXT file |
| `POST` | `/trainer/topics/{topic_id}/generations`| `TRAINER` | Request AI capsule or quiz generation |
| `GET/PATCH` | `/trainer/capsules/{capsule_id}` | `TRAINER` | Review & edit draft capsule |
| `POST` | `/trainer/capsules/{capsule_id}/publish` | `TRAINER` | Make capsule available to students |
| `POST` | `/trainer/quizzes/{quiz_id}/publish` | `TRAINER` | Publish quiz to students |
| `GET` | `/trainer/courses/{course_id}/analytics`| `TRAINER` (Owner) | Topic completion, score distributions |

---

## 4. Admin Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/admin/dashboard` | `ADMIN` | Total users, courses, processing jobs, error counts |
| `GET` | `/admin/users` | `ADMIN` | List and search all platform accounts |
| `PATCH` | `/admin/users/{user_id}` | `ADMIN` | Activate/deactivate or adjust user roles |
| `GET` | `/admin/courses` | `ADMIN` | System-wide course registry |
| `GET` | `/admin/audit-logs` | `ADMIN` | Security and moderation audit events |
| `GET` | `/admin/analytics` | `ADMIN` | Growth, retention, and AI utilization telemetry |
