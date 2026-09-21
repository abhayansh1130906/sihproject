from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.assessment import Assessment
from app.models.assessment_attempt import AssessmentAttempt
from app.models.competency import Competency
from app.models.official import Official
from app.models.question import Question
from app.models.question_option import QuestionOption

from app.schemas.assessment import (
    AssessmentCreateRequest,
    AssessmentResponse,
    GenerateQuizRequest,
)
from app.schemas.assessment_attempt import (
    AssessmentAttemptRequest,
    AssessmentAttemptResponse,
)
from app.schemas.question import QuestionResponse
from app.services.assessment_generator import (
    PRIMARY_MODEL,
    extract_text_from_pdf,
    generate_quiz_content,
    save_assessment_to_db,
)


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
    return db.query(Assessment).order_by(Assessment.created_at.desc()).all()


@router.post(
    "/generate",
    response_model=AssessmentResponse
)
def generate_assessment(
    request: GenerateQuizRequest,
    db: Session = Depends(get_db)
):
    competency = db.get(Competency, request.competency_id)
    if not competency:
        raise HTTPException(
            status_code=404,
            detail=f"Competency '{request.competency_id}' not found"
        )

    try:
        quiz_data = generate_quiz_content(
            competency_name=competency.name,
            competency_domain=competency.domain,
            competency_description=competency.description,
            topic=request.topic,
            num_questions=request.num_questions,
            difficulty=request.difficulty,
            study_material=request.study_material,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Quiz generation failed: {str(e)}"
        )

    assessment = save_assessment_to_db(
        db=db,
        title=quiz_data.get("title", f"{competency.name} Evaluation"),
        description=quiz_data.get("description", f"AI-generated assessment for {competency.name}"),
        competency_id=competency.competency_id,
        source_type="AI_GENERATED",
        source_reference=f"Groq-{PRIMARY_MODEL}",
        passing_score=quiz_data.get("passing_score", 70),
        questions_data=quiz_data.get("questions", []),
    )

    return assessment


@router.post(
    "/generate-from-pdf",
    response_model=AssessmentResponse
)
async def generate_assessment_from_pdf(
    file: UploadFile = File(...),
    competency_id: str = Form(...),
    topic: str | None = Form(None),
    difficulty: str = Form("Intermediate"),
    num_questions: int = Form(5),
    db: Session = Depends(get_db)
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF documents (.pdf) are supported."
        )

    competency = db.get(Competency, competency_id)
    if not competency:
        raise HTTPException(
            status_code=404,
            detail=f"Competency '{competency_id}' not found"
        )

    try:
        pdf_bytes = await file.read()
        extracted_text = extract_text_from_pdf(pdf_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to extract text from PDF: {str(e)}"
        )

    clean_topic = topic.strip() if topic and topic.strip() else f"Material from {file.filename}"

    try:
        quiz_data = generate_quiz_content(
            competency_name=competency.name,
            competency_domain=competency.domain,
            competency_description=competency.description,
            topic=clean_topic,
            num_questions=max(1, min(15, num_questions)),
            difficulty=difficulty,
            study_material=extracted_text,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Quiz generation from PDF failed: {str(e)}"
        )

    base_name = file.filename.replace(".pdf", "").replace("_", " ").title()
    title = quiz_data.get("title") or f"{base_name} Assessment"
    description = (
        quiz_data.get("description")
        or f"Assessment generated from {file.filename} aligned to {competency.name}"
    )

    assessment = save_assessment_to_db(
        db=db,
        title=title,
        description=description,
        competency_id=competency.competency_id,
        source_type="PDF_UPLOAD",
        source_reference=f"PDF: {file.filename[:200]}",
        passing_score=quiz_data.get("passing_score", 70),
        questions_data=quiz_data.get("questions", []),
    )

    return assessment


@router.post(
    "/upload",
    response_model=AssessmentResponse
)
def upload_assessment(
    request: AssessmentCreateRequest,
    db: Session = Depends(get_db)
):
    competency = db.get(Competency, request.competency_id)
    if not competency:
        raise HTTPException(
            status_code=404,
            detail=f"Competency '{request.competency_id}' not found"
        )

    if not request.questions or len(request.questions) == 0:
        raise HTTPException(
            status_code=400,
            detail="Assessment must contain at least one question."
        )

    questions_data = []
    for q in request.questions:
        options_data = [
            {"option_text": opt.option_text, "is_correct": opt.is_correct}
            for opt in q.options
        ]
        questions_data.append(
            {
                "question_text": q.question_text,
                "explanation": q.explanation,
                "question_type": q.question_type,
                "marks": q.marks,
                "options": options_data,
            }
        )

    assessment = save_assessment_to_db(
        db=db,
        title=request.title,
        description=request.description,
        competency_id=request.competency_id,
        source_type=request.source_type or "MANUAL_UPLOAD",
        source_reference=request.source_reference or "Direct Upload",
        passing_score=request.passing_score,
        questions_data=questions_data,
    )

    return assessment


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


@router.delete(
    "/{assessment_id}"
)
def delete_assessment(
    assessment_id: str,
    db: Session = Depends(get_db)
):
    assessment = db.get(Assessment, assessment_id)
    if not assessment:
        raise HTTPException(
            status_code=404,
            detail="Assessment not found"
        )

    # Delete attempts
    db.query(AssessmentAttempt).filter(
        AssessmentAttempt.assessment_id == assessment_id
    ).delete()

    # Delete question options
    questions = db.query(Question).filter(
        Question.assessment_id == assessment_id
    ).all()
    for q in questions:
        db.query(QuestionOption).filter(
            QuestionOption.question_id == q.question_id
        ).delete()

    # Delete questions
    db.query(Question).filter(
        Question.assessment_id == assessment_id
    ).delete()

    # Delete assessment
    db.delete(assessment)
    db.commit()

    return {"message": "Assessment deleted successfully", "assessment_id": assessment_id}