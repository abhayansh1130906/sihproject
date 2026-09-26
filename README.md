# SkillIntel

**AI-enabled Skill Intelligence and Learning Platform for India's Official Statistical System**

Built for **Smart India Hackathon 2026 — Problem Statement SIH26101** (Ministry of Statistics and Programme Implementation / MoSPI).

SkillIntel acts as an AI intelligence layer on top of existing government learning infrastructure — **iGOT Karmayogi** and **NSSTA training programmes** — to surface personalised competency gaps and learning recommendations for statistical officials.

---

## Architecture

```text
Next.js 16 Frontend (TypeScript)
        │
        │  REST API  (http://127.0.0.1:8000)
        ▼
FastAPI Backend (Python)
        │
        ├── PostgreSQL  (via SQLAlchemy + Alembic)
        │
        ├── AI Services
        │     ├── Embedding Service  (semantic similarity)
        │     └── LLM Service        (Groq)
        │
        └── Data Integrations
              ├── iGOT Karmayogi  (courses)
              └── NSSTA           (training programmes)
```

---

## Project Structure

```text
sihproject/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout with AuthProvider
│   ├── page.tsx                  # Entry point — redirects to /login or /dashboard
│   ├── globals.css
│   ├── login/                    # Demo login with quick-fill accounts
│   ├── dashboard/                # Official profile, competency overview, gap summary
│   ├── recommendations/          # AI-powered learning recommendations
│   ├── assessments/              # Browse and attempt competency assessments
│   ├── assistant/                # RAG-powered AI chat assistant
│   └── learning-history/         # Learning history log
│
├── components/
│   ├── AppShell.tsx              # Navigation shell shared across all pages
│   └── StateFeedback.tsx         # Reusable loading / error / empty state components
│
├── context/
│   └── AuthContext.tsx           # Auth state management (localStorage persistence)
│
├── lib/
│   ├── api.ts                    # Typed API client for all backend endpoints
│   └── types.ts                  # Shared TypeScript interfaces
│
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app entry point
│   │   ├── api/v1/               # Route handlers
│   │   │   ├── auth.py           # Demo authentication
│   │   │   ├── officials.py      # Official profiles, competencies, gaps, recommendations
│   │   │   ├── competencies.py   # Competency catalogue
│   │   │   ├── courses.py        # iGOT course catalogue
│   │   │   ├── training_programmes.py  # NSSTA training programmes
│   │   │   ├── assessments.py    # Assessments and attempts
│   │   │   └── assistant.py      # RAG AI assistant chat
│   │   ├── core/
│   │   │   └── config.py         # Pydantic Settings (env vars)
│   │   ├── db/
│   │   │   ├── base.py           # SQLAlchemy declarative base
│   │   │   └── session.py        # DB session factory
│   │   ├── models/               # SQLAlchemy ORM models
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   └── services/             # Business logic
│   │       ├── competency_gap_service.py
│   │       ├── recommendation_service.py
│   │       ├── embedding_service.py
│   │       ├── llm_service.py
│   │       └── retrieval_service.py
│   ├── alembic/                  # Database migration scripts
│   ├── data/                     # Prototype JSON seed datasets
│   ├── scripts/
│   │   └── seed_data.py          # Database seeding script
│   ├── requirements.txt
│   └── README.md                 # Backend-specific documentation
│
├── package.json
└── README.md
```

---

## Features

### Frontend

| Page | Description |
|---|---|
| `/login` | Demo login with quick-fill official accounts |
| `/dashboard` | Profile card, competency levels, gap summary, key metrics |
| `/recommendations` | AI-matched iGOT courses and NSSTA programmes sorted by gap priority |
| `/assessments` | Browse assessments, answer MCQs, view results |
| `/assistant` | Ask questions about competencies, roles, and learning resources (RAG) |
| `/learning-history` | Timeline of completed and in-progress learning activities |

### Backend

- **Competency Gap Engine** — deterministic gap calculation (`required_level − current_level`) per role
- **Recommendation Engine** — matches resources to gaps using competency-to-course/programme mappings
- **Embedding Service** — semantic similarity for improved resource matching
- **RAG Assistant** — retrieval-augmented generation over the SkillIntel knowledge corpus using Groq LLM
- **Assessment System** — MCQ assessments with scoring and attempt tracking
- **Demo Authentication** — password-protected demo login for prototype use

---

## Tech Stack

### Frontend
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Lucide React** (icons)

### Backend
- **Python 3.14**
- **FastAPI**
- **SQLAlchemy**
- **PostgreSQL**
- **Pydantic / Pydantic Settings**
- **Alembic**
- **Uvicorn**
- **Groq** (LLM)

---

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.14+
- PostgreSQL

---

### 1. Clone the repo

```bash
git clone <repo-url>
cd sihproject
```

---

### 2. Backend setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/skillintel
SECRET_KEY=your-secret-key
GROQ_API_KEY=your-groq-api-key
DEMO_LOGIN_PASSWORD=demo
```

Apply migrations and seed the database:

```bash
python -m alembic upgrade head
python scripts/seed_data.py
```

Start the API server:

```bash
uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`.
Interactive docs: `http://127.0.0.1:8000/docs`

---

### 3. Frontend setup

From the project root:

```bash
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

Start the dev server:

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

---

### 4. Demo login

Use any of the pre-seeded officials with the demo password configured in your `.env`:

| Official ID | Name | Role |
|---|---|---|
| `OFF001` | Aarav Sharma | Deputy Director |
| `OFF002` | Priya Mehta | Statistical Officer |
| `OFF003` | Rahul Verma | Assistant Director |

---

## API Reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/demo-login` | Demo login |

### Officials

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/officials` | List officials |
| `GET` | `/api/v1/officials/{id}` | Get official profile |
| `GET` | `/api/v1/officials/{id}/competencies` | Get current competency levels |
| `GET` | `/api/v1/officials/{id}/competency-gaps` | Calculate competency gaps |
| `GET` | `/api/v1/officials/{id}/recommendations` | Get learning recommendations |
| `GET` | `/api/v1/officials/{id}/learning-history` | Get learning history |
| `POST` | `/api/v1/officials/{id}/learning-history` | Log a learning activity |

### Competencies

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/competencies` | List all competencies |
| `GET` | `/api/v1/competencies/{id}` | Get a competency |

### Courses & Training

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/courses` | List iGOT courses |
| `GET` | `/api/v1/training-programmes` | List NSSTA training programmes |

### Assessments

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/assessments` | List assessments |
| `GET` | `/api/v1/assessments/{id}` | Get an assessment |
| `GET` | `/api/v1/assessments/{id}/questions` | Get questions |
| `POST` | `/api/v1/assessments/{id}/attempts` | Submit an attempt |

### AI Assistant

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/assistant/chat` | Ask a question (RAG) |

---

## Competency Domains

SkillIntel organises competencies across four domains:

- **Statistical** — Survey Design, Sampling, National Accounts, SDG Monitoring, etc.
- **Technical** — Python, R, SQL, Data Analytics, GIS, AI, Cloud Computing, etc.
- **Digital Governance** — Cybersecurity, Data Privacy, Digital Public Infrastructure, etc.
- **Behavioural & Managerial** — Leadership, Communication, Project Management, etc.

---

## Deployment on AWS

The application is fully containerized and production-ready for AWS deployment (AWS EC2, AWS ECS Fargate, or AWS App Runner).

For detailed step-by-step instructions, see the [AWS Deployment Guide](AWS_DEPLOYMENT_GUIDE.md).

### Quick Start with Docker (Local / EC2)

1. **Configure Environment**:
   ```bash
   cp .env.example .env
   ```
2. **Run in Production Mode (Nginx reverse proxy on port 80)**:
   ```bash
   docker compose -f docker-compose.prod.yml up -d --build
   ```
3. **Run in Local Development Mode**:
   ```bash
   docker compose up -d --build
   ```
4. **Access the application**:
   - Web App: `http://localhost` (or `http://<EC2_IP>`)
   - API Docs: `http://localhost/docs` (or `http://<EC2_IP>/docs`)
   - Healthcheck: `http://localhost/health`

