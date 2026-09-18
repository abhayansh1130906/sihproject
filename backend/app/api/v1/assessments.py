from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.assessment import Assessment
from app.models.assessment_attempt import AssessmentAttempt
from app.models.official import Official
from app.models.question import Question
from app.models.question_option import QuestionOption

from app.schemas.assessment import AssessmentResponse
from app.schemas.assessment_attempt import (
    AssessmentAttemptRequest,
    AssessmentAttemptResponse,
)
from app.schemas.question import QuestionResponse


router = APIRouter(
    prefix="/api/v1/assessments",
    tags=["Assessments"]
)


@router.get(
    "",
    response_model=list[AssessmentResponse]
)
def get_assessments(
    db: Session = Depends(get_db)
):
    return db.query(Assessment).all()


@router.get(
    "/{assessment_id}",
    response_model=AssessmentResponse
)
def get_assessment(
    assessment_id: str,
    db: Session = Depends(get_db)
):
    assessment = db.get(
        Assessment,
        assessment_id
    )

    if not assessment:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found"
        )

    return assessment


@router.get(
    "/{assessment_id}/questions",
    response_model=list[QuestionResponse]
)
def get_assessment_questions(
    assessment_id: str,
    db: Session = Depends(get_db)
):
    assessment = db.get(
        Assessment,
        assessment_id
    )

    if not assessment:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found"
        )

    questions = (
        db.query(Question)
        .filter(
            Question.assessment_id == assessment_id,
            Question.is_active.is_(True)
        )
        .all()
    )

    result = []

    for question in questions:
        options = (
            db.query(QuestionOption)
            .filter(
                QuestionOption.question_id
                == question.question_id
            )
            .all()
        )

        result.append(
            {
                "question_id": question.question_id,
                "question_text": question.question_text,
                "explanation": question.explanation,
                "question_type": question.question_type,
                "marks": question.marks,
                "options": [
                    {
                        "option_id": option.option_id,
                        "option_text": option.option_text,
                    }
                    for option in options
                ],
            }
        )

    return result


@router.post(
    "/{assessment_id}/attempts",
    response_model=AssessmentAttemptResponse
)
def submit_assessment(
    assessment_id: str,
    request: AssessmentAttemptRequest,
    db: Session = Depends(get_db)
):
    assessment = db.get(
        Assessment,
        assessment_id
    )

    if not assessment:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found"
        )

    official = db.get(
        Official,
        request.official_id
    )

    if not official:
        raise HTTPException(
            status_code=404,
            detail="Official not found"
        )

    questions = (
        db.query(Question)
        .filter(
            Question.assessment_id == assessment_id,
            Question.is_active.is_(True)
        )
        .all()
    )

    if not questions:
        raise HTTPException(
            status_code=400,
            detail="Assessment has no active questions"
        )

    score = 0

    for question in questions:
        selected_option_id = request.answers.get(
            question.question_id
        )

        if not selected_option_id:
            continue

        selected_option = (
            db.query(QuestionOption)
            .filter(
                QuestionOption.option_id
                == selected_option_id,
                QuestionOption.question_id
                == question.question_id
            )
            .first()
        )

        if selected_option and selected_option.is_correct:
            score += question.marks

    total_marks = sum(
        question.marks
        for question in questions
    )

    percentage = (
        (score / total_marks) * 100
        if total_marks > 0
        else 0
    )

    passed = percentage >= assessment.passing_score

    now = datetime.now(timezone.utc)

    attempt = AssessmentAttempt(
        attempt_id=uuid4().hex[:20],
        assessment_id=assessment_id,
        official_id=request.official_id,
        score=score,
        passed=passed,
        started_at=now,
        completed_at=now,
    )

    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return attempt