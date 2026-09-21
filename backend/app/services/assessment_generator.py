import io
import json
import os
import re
from datetime import datetime, timezone
from uuid import uuid4

from dotenv import load_dotenv
from groq import Groq
import pypdf
from sqlalchemy.orm import Session

from app.models.assessment import Assessment
from app.models.competency import Competency
from app.models.question import Question
from app.models.question_option import QuestionOption

load_dotenv()

PRIMARY_MODEL = "openai/gpt-oss-120b"
FALLBACK_MODEL = "openai/gpt-oss-20b"


def get_groq_client() -> Groq:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not set in environment.")
    return Groq(api_key=api_key)


def extract_text_from_pdf(file_bytes: bytes, max_pages: int = 25, max_chars: int = 15000) -> str:
    """Extract readable text from PDF bytes."""
    try:
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        extracted = []
        char_count = 0
        pages_to_read = min(len(reader.pages), max_pages)

        for i in range(pages_to_read):
            page = reader.pages[i]
            text = page.extract_text()
            if text:
                cleaned = " ".join(text.split())
                extracted.append(f"[Page {i + 1}]\n{cleaned}")
                char_count += len(cleaned)
                if char_count >= max_chars:
                    break

        full_text = "\n\n".join(extracted).strip()
        if not full_text:
            raise ValueError(
                "No readable text could be extracted from this PDF. "
                "Please verify the document contains selectable text rather than scanned images."
            )
        return full_text[:max_chars]
    except Exception as e:
        if isinstance(e, ValueError):
            raise e
        raise ValueError(f"Failed to process PDF: {str(e)}")


def clean_json_response(content: str) -> str:
    """Strip markdown code blocks if the LLM wraps the JSON in ```json ... ```"""
    content = content.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", content)
    if match:
        return match.group(1).strip()
    return content


def generate_quiz_content(
    competency_name: str,
    competency_domain: str,
    competency_description: str,
    topic: str | None,
    num_questions: int,
    difficulty: str,
    study_material: str | None = None,
) -> dict:
    client = get_groq_client()

    prompt_context = f"""Competency: {competency_name} ({competency_domain})
Description: {competency_description}
Focus Topic: {topic if topic else "Core concepts and syllabus extracted from the document"}
Difficulty Level: {difficulty}
Number of Questions: {num_questions}
"""
    if study_material:
        prompt_context += f"\nReference Study Material / Document Excerpt:\n{study_material[:12000]}\n"

    system_prompt = (
        "You are an expert assessment specialist and statistical educator for India's "
        "Ministry of Statistics and Programme Implementation (MoSPI) and National Statistical Systems.\n"
        "Generate a rigorous, high-quality multiple choice evaluation based strictly on the provided context "
        "and document excerpt.\n\n"
        "You MUST respond ONLY with a valid JSON object adhering strictly to this schema:\n"
        "{\n"
        '  "title": "Clear concise assessment title (under 80 chars)",\n'
        '  "description": "Comprehensive explanation of what is tested",\n'
        '  "passing_score": 70,\n'
        '  "questions": [\n'
        "    {\n"
        '      "question_text": "Detailed question text",\n'
        '      "explanation": "Clear explanation justifying the correct answer",\n'
        '      "marks": 1,\n'
        '      "options": [\n'
        '        {"option_text": "Option A text", "is_correct": false},\n'
        '        {"option_text": "Option B text", "is_correct": true},\n'
        '        {"option_text": "Option C text", "is_correct": false},\n'
        '        {"option_text": "Option D text", "is_correct": false}\n'
        "      ]\n"
        "    }\n"
        "  ]\n"
        "}\n\n"
        "Requirements:\n"
        f"- Generate exactly {num_questions} questions.\n"
        "- Each question must have exactly 4 options.\n"
        "- Exactly one option must have is_correct = true, the other three must be false.\n"
        "- Questions must be realistic, domain-accurate, and aligned with Indian statistical and data standards.\n"
        "- Do NOT include any intro or conversational text outside the JSON."
    )

    models_to_try = [PRIMARY_MODEL, FALLBACK_MODEL, "qwen/qwen3.8-27b"]
    last_error = None

    for model_name in models_to_try:
        try:
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {
                        "role": "user",
                        "content": f"Generate the assessment based on the following specifications:\n\n{prompt_context}",
                    },
                ],
                temperature=0.2,
            )

            raw_content = response.choices[0].message.content
            cleaned_json = clean_json_response(raw_content)
            data = json.loads(cleaned_json)

            if "questions" in data and len(data["questions"]) > 0:
                return data
        except Exception as e:
            last_error = e
            continue

    raise RuntimeError(f"Failed to generate quiz with Groq AI: {last_error}")


def save_assessment_to_db(
    db: Session,
    title: str,
    description: str,
    competency_id: str,
    source_type: str,
    source_reference: str | None,
    passing_score: int,
    questions_data: list[dict],
) -> Assessment:
    """Persist Assessment, Question, and QuestionOption records inside a single transaction."""
    assessment_id = f"ASSM-{uuid4().hex[:12].upper()}"
    now = datetime.now(timezone.utc)

    assessment = Assessment(
        assessment_id=assessment_id,
        title=title[:255],
        description=description,
        competency_id=competency_id,
        source_type=source_type,
        source_reference=source_reference,
        question_count=len(questions_data),
        passing_score=passing_score,
        created_at=now,
    )
    db.add(assessment)

    for q_idx, q_item in enumerate(questions_data, start=1):
        question_id = f"Q-{uuid4().hex[:14].upper()}"
        question = Question(
            question_id=question_id,
            assessment_id=assessment_id,
            question_text=q_item.get("question_text", f"Question {q_idx}"),
            explanation=q_item.get("explanation", ""),
            question_type=q_item.get("question_type", "MULTIPLE_CHOICE"),
            marks=q_item.get("marks", 1),
            is_active=True,
        )
        db.add(question)

        options = q_item.get("options", [])
        # Ensure at least one option is correct
        has_correct = any(opt.get("is_correct") for opt in options)

        for opt_idx, opt_item in enumerate(options, start=1):
            is_corr = opt_item.get("is_correct", False)
            if not has_correct and opt_idx == 1:
                is_corr = True

            option = QuestionOption(
                option_id=f"OPT-{uuid4().hex[:14].upper()}",
                question_id=question_id,
                option_text=opt_item.get("option_text", f"Option {opt_idx}"),
                is_correct=is_corr,
            )
            db.add(option)

    db.commit()
    db.refresh(assessment)
    return assessment
