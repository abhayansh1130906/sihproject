# SkillIntel Optimization Log

This document records the performance, responsiveness, and operational improvements currently present in the working tree.

## Summary

| Area | Change | Benefit |
|---|---|---|
| Dashboard frontend | Fetch profile, competencies, and gaps concurrently | Reduces dashboard wait time from the sum of three requests to roughly the slowest request |
| Learning history | Add records optimistically and roll back on failure | Makes successful submissions feel immediate without hiding API errors |
| Shared UI states | Memoize loading, error, and empty state components | Avoids rendering unchanged feedback components |
| List APIs | Add `skip` and `limit` pagination parameters | Prevents unbounded database queries and response payloads |
| Assessment generation | Run blocking Groq calls in worker threads | Keeps FastAPI's event loop available for other requests |
| Groq integration | Reuse one lazily created client | Avoids rebuilding the client for every assessment request |
| Database access | Add indexes to frequently joined foreign keys | Speeds up common relationship lookups as data grows |
| Recommendation queries | Batch course and training lookups by competency | Removes the per-gap N+1 query pattern |
| RAG service | Add an explicit corpus reload endpoint | Updates retrieval data without restarting the backend |

## Frontend changes

### Existing frontend optimizations

The following optimizations were already present and are included here for completeness:

- **Admin dashboard parallel loading:** `app/admin/page.tsx` loads officials, competencies, courses, training programmes, and assessments concurrently with `Promise.allSettled`. One failed catalogue request does not discard successful results from the other requests.
- **Parallel official inspection:** the admin drawer loads competency gaps and current competencies concurrently with `Promise.all`.
- **Memoized derived lists:** `useMemo` avoids recalculating filtered or grouped data unless its source data or filter values change in:
  - `app/admin/page.tsx`
  - `app/dashboard/page.tsx`
  - `app/learning-history/page.tsx`
  - `app/recommendations/page.tsx`

### Parallel dashboard loading

**File:** `app/dashboard/page.tsx`

- Wrapped `fetchProfile`, `fetchCompetencies`, and `fetchGaps` in `useCallback`.
- Changed `refreshAll` to run all three requests with `Promise.all`.
- Added the callbacks to the effect dependency list so the refresh remains correct when the authenticated official changes.
- Existing retry buttons continue to call each request independently.

This removes artificial request serialization while preserving separate loading and error states.

### Optimistic learning-history submissions

**File:** `app/learning-history/page.tsx`

- Inserts a temporary record immediately after submission starts.
- Closes the modal without waiting for the network.
- Replaces the temporary record with the server response after success.
- Removes the temporary record and reopens the form with the entered values after failure.
- Preserves the existing success message and error reporting.

The temporary ID is client-only and is never treated as a persisted database identifier.

### Memoized shared feedback components

**File:** `components/StateFeedback.tsx`

`LoadingState`, `ErrorState`, and `EmptyState` now use `React.memo`. They still expose the same props and behavior, but can skip rerendering when their inputs are unchanged.

## Backend API changes

### Bounded list queries

The following endpoints now accept:

```text
skip: integer = 0
limit: integer = 100
```

Affected files:

- `backend/app/api/v1/assessments.py`
- `backend/app/api/v1/competencies.py`
- `backend/app/api/v1/courses.py`
- `backend/app/api/v1/officials.py`
- `backend/app/api/v1/training_programmes.py`

The database query now applies `offset(skip).limit(limit)` before returning results. Assessment listing retains descending creation-date ordering.

`limit=100` is a safety ceiling for normal calls; clients that need more data should page through results rather than request an unbounded collection.

### Non-blocking assessment generation

**File:** `backend/app/api/v1/assessments.py`

The competency and PDF assessment-generation routes are asynchronous and call the synchronous Groq-backed generator through `asyncio.to_thread`.

This prevents the blocking model request from occupying the FastAPI event-loop thread. The generation work is still synchronous inside the worker thread, so existing model selection, fallback behavior, validation, and persistence remain unchanged.

### RAG corpus reload

**Files:**

- `backend/app/services/retrieval_service.py`
- `backend/app/api/v1/assistant.py`

Added `reload_corpus()` and:

```text
POST /api/v1/assistant/reload-corpus
```

The endpoint reloads `data/rag_corpus.json` and returns the number of loaded documents. It is intended for controlled administrative use after corpus updates; it does not replace authentication or authorization if the deployment exposes the route beyond a trusted environment.

## Database changes

Added indexed foreign keys in:

- `backend/app/models/assessment.py`: `competency_id`
- `backend/app/models/assessment_attempt.py`: `assessment_id`, `official_id`
- `backend/app/models/learning_history.py`: `official_id`
- `backend/app/models/official.py`: `role_id`
- `backend/app/models/question.py`: `assessment_id`
- `backend/app/models/question_option.py`: `question_id`
- `backend/app/models/course_competency.py`: `competency_id`
- `backend/app/models/training_competency.py`: `competency_id`

These indexes support the joins and filters used by assessment, official, learning-history, question, and competency queries.

The indexes are declared in the SQLAlchemy models. A production database should receive a corresponding Alembic migration before relying on them; model declarations alone do not alter an already-created database.

## LLM client reuse

**File:** `backend/app/services/assessment_generator.py`

- Removed per-call environment loading.
- Uses the existing application `settings` object for `GROQ_API_KEY`.
- Creates the Groq client lazily on first use.
- Reuses the module-level client for subsequent requests.

This reduces repeated configuration parsing and client construction while keeping the existing missing-key error.

## Existing backend caching

### Cached assistant LLM client

**File:** `backend/app/services/llm_service.py`

`get_client()` uses `functools.lru_cache`, so the assistant's Groq client is constructed once and reused for later chat requests.

### Lazy RAG corpus loading

**File:** `backend/app/services/retrieval_service.py`

The RAG corpus is loaded from disk only on the first search through `get_corpus()`. Later searches reuse the in-memory list until the explicit reload endpoint is called.

## Remaining optimization opportunities

These are not yet implemented:

- **Pagination validation:** list endpoints accept `skip` and `limit`, but should add non-negative/range constraints if they become public-facing.

## Compatibility and behavior

- API response shapes are unchanged except for the new pagination controls and corpus-reload response.
- Existing callers that omit pagination parameters retain the previous first-page behavior, capped at 100 records.
- Failed optimistic submissions are rolled back instead of leaving unsaved data visible.
- Assessment generation remains compatible with the existing synchronous generator.
- RAG reload replaces the in-memory corpus only after loading the file.

## Validation

- `git diff --check` passes.
- No new dependency was added.
- No test suite was added for these changes; the primary behavior checks are the existing frontend lint/build and backend endpoint checks.

## Follow-up

1. Apply the new Alembic migration before production deployment.
2. Protect `POST /api/v1/assistant/reload-corpus` with the project's admin authentication if it is exposed outside a trusted internal network.
3. Add measured pagination metadata (`total`, `next`, or equivalent) only when a client needs navigation across large collections.
