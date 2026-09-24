# SkillIntel Backend

Backend API for **SkillIntel — AI-enabled Skill Intelligence and Learning Platform for India’s Official Statistical System**.

SkillIntel is designed as an AI intelligence layer on top of existing government learning resources such as **iGOT Karmayogi** and **NSSTA training programmes**.

The backend manages officials, competencies, roles, learning resources, competency gaps, recommendations, learning history, and assessments.

---

## Architecture

```text
Next.js Frontend
        │
        │ REST API
        ▼
FastAPI Backend
        │
        ├── PostgreSQL
        │
        ├── AI Services
        │     ├── Embeddings
        │     └── LLM
        │
        └── Integrations
              ├── iGOT Karmayogi
              └── NSSTA
```

---

## Technology Stack

- **Python 3.14**
- **FastAPI**
- **SQLAlchemy**
- **PostgreSQL**
- **Pydantic**
- **Pydantic Settings**
- **Alembic**
- **Uvicorn**
- **REST APIs**
- **JSON-based prototype datasets**

---

## Project Structure

```text
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── officials.py
│   │       ├── competencies.py
│   │       ├── courses.py
│   │       ├── training_programmes.py
│   │       └── assessments.py
│   │
│   ├── core/
│   │   └── config.py
│   │
│   ├── db/
│   │   ├── base.py
│   │   └── session.py
│   │
│   ├── models/
│   │   ├── competency.py
│   │   ├── role.py
│   │   ├── role_competency.py
│   │   ├── course.py
│   │   ├── course_competency.py
│   │   ├── training_programme.py
│   │   ├── training_competency.py
│   │   ├── official.py
│   │   ├── official_competency.py
│   │   ├── learning_history.py
│   │   ├── assessment.py
│   │   ├── question.py
│   │   ├── question_option.py
│   │   └── assessment_attempt.py
│   │
│   ├── schemas/
│   │   ├── competency.py
│   │   ├── competency_gap.py
│   │   ├── official.py
│   │   ├── official_competency.py
│   │   ├── learning_history.py
│   │   ├── recommendation.py
│   │   ├── course.py
│   │   ├── training_programme.py
│   │   ├── assessment.py
│   │   ├── question.py
│   │   └── assessment_attempt.py
│   │
│   └── services/
│       ├── competency_gap_service.py
│       └── recommendation_service.py
│
├── alembic/
│
├── data/
│   ├── competencies.json
│   ├── roles.json
│   ├── role_competencies.json
│   ├── igot_courses.json
│   ├── course_competencies.json
│   ├── nssta_training_programmes.json
│   ├── training_competencies.json
│   ├── officials.json
│   ├── official_competencies.json
│   ├── demo_learning_history.json
│   └── rag_corpus.json
│
├── scripts/
│   └── seed_data.py
│
├── .env
├── .env.example
├── requirements.txt
└── README.md
```

---

## Core Data Model

The backend uses a relational model connecting government roles, competencies, officials, and learning resources.

### Main Entities

| Entity | Purpose |
|---|---|
| `competencies` | Stores statistical, technical, digital governance, and behavioural competencies |
| `roles` | Stores official roles and their responsibilities |
| `role_competencies` | Maps required competencies and required levels to roles |
| `officials` | Stores learner/official profiles |
| `official_competencies` | Stores current competency levels |
| `courses` | Stores iGOT learning resources |
| `course_competencies` | Maps iGOT courses to competencies |
| `training_programmes` | Stores NSSTA training programmes |
| `training_competencies` | Maps NSSTA programmes to competencies |
| `learning_history` | Tracks completed and in-progress learning |
| `assessments` | Stores assessments |
| `questions` | Stores assessment questions |
| `question_options` | Stores MCQ options |
| `assessment_attempts` | Stores assessment results |

---

## Competency Domains

SkillIntel currently organizes competencies into four major domains.

### Statistical

Examples include:

- Survey Design
- Sampling Methodology
- National Accounts Statistics
- Price Statistics
- Labour Statistics
- Agricultural Statistics
- Industrial Statistics
- SDG Indicator Monitoring
- Statistical Metadata Standards
- Data Quality Frameworks

### Technical

Examples include:

- Python Programming
- R Programming
- SQL and Database Querying
- Data Analytics
- Data Visualisation
- GIS
- Artificial Intelligence
- Cloud Computing
- Data Management

### Digital Governance

Examples include:

- Cybersecurity
- Data Privacy
- Digital Signatures and Authentication
- Government Cloud Infrastructure
- Digital Public Infrastructure
- Data Governance

### Behavioural and Managerial

Examples include:

- Leadership
- Communication
- Project Management
- Decision Making
- Change Management
- Problem Solving
- Stakeholder Management

---

## Competency Gap Engine

The competency gap engine compares an official's current competency level against the competency level required by their role.

The core calculation is deterministic:

```text
gap = required_level - current_level
```

A negative gap is treated as zero.

Only competencies where:

```text
gap > 0
```

are returned as competency gaps.

### Example

```text
Required Level: 4
Current Level: 2

Gap: 2
Status: gap
```

This calculation is performed by the backend and does not depend on an LLM.

---

## Recommendation Engine

The recommendation engine uses competency gaps to identify relevant learning resources.

The current prototype:

1. Calculates the official's competency gaps.
2. Finds iGOT courses mapped to those competencies.
3. Finds NSSTA training programmes mapped to those competencies.
4. Removes resources already marked as completed.
5. Returns the relevant learning resources with the associated competency gap.

The current recommendation logic is deterministic.

AI-based semantic ranking and explanation will be integrated later.

---

## Learning History

Learning history tracks an official's interaction with learning resources.

Supported information includes:

- Learning type
- Resource ID
- Resource title
- Status
- Completion date
- Score
- Source type

Example:

```json
{
  "learning_type": "iGOT",
  "resource_id": "IGOT001",
  "resource_title": "Data Driven Decision Making For Government",
  "status": "completed",
  "completion_date": "2026-07-15",
  "score": 78,
  "source_type": "Synthetic demo history"
}
```

---

## Assessment System

The backend includes the foundation for an intelligent assessment system.

### Assessment

Stores:

- Assessment title
- Description
- Competency
- Source type
- Source reference
- Question count
- Passing score
- Creation timestamp

### Questions

Each question stores:

- Question text
- Explanation
- Question type
- Marks
- Active status

### Question Options

Each MCQ option stores:

- Option text
- Correct/incorrect status

### Assessment Attempts

Stores:

- Official
- Assessment
- Score
- Pass/fail status
- Start time
- Completion time

The backend can evaluate submitted answers using the stored correct options.

---

## API Endpoints

### Officials

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/officials` | List officials |
| `GET` | `/api/v1/officials/{official_id}` | Get an official |
| `GET` | `/api/v1/officials/{official_id}/competencies` | Get current competencies |
| `GET` | `/api/v1/officials/{official_id}/competency-gaps` | Calculate competency gaps |
| `GET` | `/api/v1/officials/{official_id}/learning-history` | Get learning history |
| `POST` | `/api/v1/officials/{official_id}/learning-history` | Add learning history |
| `GET` | `/api/v1/officials/{official_id}/recommendations` | Get learning recommendations |

### Competencies

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/competencies` | List competencies |
| `GET` | `/api/v1/competencies/{competency_id}` | Get a competency |

### iGOT Courses

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/courses` | List iGOT courses |
| `GET` | `/api/v1/courses/{course_id}` | Get an iGOT course |

### NSSTA Training Programmes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/training-programmes` | List training programmes |
| `GET` | `/api/v1/training-programmes/{training_id}` | Get a training programme |

### Assessments

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/assessments` | List assessments |
| `GET` | `/api/v1/assessments/{assessment_id}` | Get an assessment |
| `GET` | `/api/v1/assessments/{assessment_id}/questions` | Get assessment questions |
| `POST` | `/api/v1/assessments/{assessment_id}/attempts` | Submit an assessment attempt |

---

## Database and Migrations

Database schema changes are managed using **Alembic**.

Typical migration workflow:

```bash
python -m alembic revision --autogenerate -m "description"
python -m alembic upgrade head
```

The backend uses PostgreSQL through SQLAlchemy.

Database configuration is managed through environment variables using Pydantic Settings.

---

## Seed Data

Prototype datasets are stored in the `data/` directory.

The seed script populates:

- Competencies
- Roles
- Role-competency mappings
- iGOT courses
- Course-competency mappings
- NSSTA training programmes
- Training-competency mappings
- Synthetic officials
- Official competency levels
- Demo learning history

Run the seed script with:

```bash
python scripts/seed_data.py
```

The prototype data is intended for demonstration and development.

---

## Running the Backend

### 1. Create and activate the virtual environment

```bash
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment variables

Create a `.env` file based on:

```text
.env.example
```

### 4. Apply database migrations

```bash
python -m alembic upgrade head
```

### 5. Seed the database

```bash
python scripts/seed_data.py
```

### 6. Start the FastAPI server

```bash
uvicorn app.main:app --reload
```

The API will be available at:

```text
http://127.0.0.1:8000
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

---

## Render Deployment

When deploying to **Render**:

1. **Root Directory**: `backend`
2. **Build Command**:
   ```bash
   chmod +x render-build.sh && ./render-build.sh
   ```
3. **Start Command**:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
   *(Do NOT use `--reload` in production. Binding to `--host 0.0.0.0 --port $PORT` is required for Render port detection.)*

---


## Current Scope

The current backend provides the foundation for:

- Official profiles
- Competency management
- Role competency requirements
- Deterministic competency-gap analysis
- iGOT course catalogue
- NSSTA training programme catalogue
- Learning history
- Learning recommendations
- Assessment data models
- Assessment APIs
- PostgreSQL database
- Alembic migrations
- Prototype seed data

---

## AI Integration

The AI layer will be integrated on top of the existing deterministic backend.

Planned AI capabilities include:

### Semantic Recommendation

Embeddings will be used to improve matching between:

- Official responsibilities
- Competency gaps
- Course descriptions
- Learning outcomes
- Training programmes

The recommendation pipeline will combine structured competency matching with semantic similarity.

### RAG Assistant

A retrieval-augmented generation system will allow officials to ask questions about:

- Competencies
- Government statistical roles
- Learning resources
- Training programmes
- Skill gaps
- Capacity-building resources

The system will retrieve relevant information from the SkillIntel knowledge corpus before generating a response.

### AI Assessment Generation

Uploaded learning materials will be processed to generate:

- Multiple-choice questions
- Answer options
- Correct answers
- Explanations

Generated questions will be validated before being stored in the assessment system.

---

## Design Principle

SkillIntel separates deterministic business logic from AI-generated intelligence.

```text
Deterministic Backend
        │
        ├── Role requirements
        ├── Current competency levels
        ├── Competency gaps
        └── Structured filtering
                │
                ▼
        AI Intelligence Layer
                │
                ├── Semantic search
                ├── Recommendation ranking
                ├── Explanations
                ├── RAG assistant
                └── Assessment generation
```

This allows the core competency-gap calculation and structured data relationships to remain predictable and explainable while AI enhances personalization and interaction.

---

## Status

**Backend foundation and core API layer completed.**

AI services, advanced recommendation ranking, RAG, and external iGOT integration are planned as subsequent development phases.
