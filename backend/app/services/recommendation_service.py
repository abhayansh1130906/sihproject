from sqlalchemy.orm import Session

from app.models.course import Course
from app.models.course_competency import CourseCompetency
from app.models.learning_history import LearningHistory
from app.models.training_competency import TrainingCompetency
from app.models.training_programme import TrainingProgramme
from app.models.official import Official
from app.services.competency_gap_service import get_competency_gaps


def get_recommendations(
    db: Session,
    official_id: str
) -> list[dict] | None:

    official = db.get(Official, official_id)

    if not official:
        return None

    gaps = get_competency_gaps(db, official_id)

    if not gaps:
        return []

    completed_resources = {
        resource_id
        for (resource_id,) in db.query(LearningHistory.resource_id)
        .filter(
            LearningHistory.official_id == official_id,
            LearningHistory.status == "completed"
        )
        .all()
    }

    gaps_by_competency = {gap["competency_id"]: gap for gap in gaps}
    competency_ids = list(gaps_by_competency)
    recommendations = []

    course_rows = (
        db.query(Course, CourseCompetency.competency_id)
        .join(CourseCompetency, Course.course_id == CourseCompetency.course_id)
        .filter(CourseCompetency.competency_id.in_(competency_ids))
        .all()
    )

    for course, competency_id in course_rows:
        if course.course_id in completed_resources:
            continue
        gap = gaps_by_competency[competency_id]
        recommendations.append(
            {
                "resource_id": course.course_id,
                "resource_type": "iGOT",
                "title": course.title,
                "competency_id": competency_id,
                "competency_name": gap["competency_name"],
                "gap": gap["gap"],
                "reason": (
                    f"Recommended because it is mapped to "
                    f"{gap['competency_name']}, where the current "
                    f"competency level is below the required level."
                ),
                "source_url": course.source_url,
            }
        )

    training_rows = (
        db.query(TrainingProgramme, TrainingCompetency.competency_id)
        .join(
            TrainingCompetency,
            TrainingProgramme.training_id == TrainingCompetency.training_id,
        )
        .filter(TrainingCompetency.competency_id.in_(competency_ids))
        .all()
    )

    for training, competency_id in training_rows:
        if training.training_id in completed_resources:
            continue
        gap = gaps_by_competency[competency_id]
        recommendations.append(
            {
                "resource_id": training.training_id,
                "resource_type": "NSSTA",
                "title": training.title,
                "competency_id": competency_id,
                "competency_name": gap["competency_name"],
                "gap": gap["gap"],
                "reason": (
                    f"Recommended because it is mapped to "
                    f"{gap['competency_name']}, where the current "
                    f"competency level is below the required level."
                ),
                "source_url": training.source_url,
            }
        )

    return recommendations