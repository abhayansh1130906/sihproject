from sqlalchemy.orm import Session

from app.models.competency import Competency
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

    recommendations = []

    completed_resources = {
        history.resource_id
        for history in db.query(LearningHistory)
        .filter(
            LearningHistory.official_id == official_id,
            LearningHistory.status == "completed"
        )
        .all()
    }

    for gap in gaps:
        competency_id = gap["competency_id"]
        gap_value = gap["gap"]

        competency = db.get(
            Competency,
            competency_id
        )

        if not competency:
            continue

        course_rows = (
            db.query(Course)
            .join(
                CourseCompetency,
                Course.course_id == CourseCompetency.course_id
            )
            .filter(
                CourseCompetency.competency_id == competency_id
            )
            .all()
        )

        for course in course_rows:

            if course.course_id in completed_resources:
                continue

            recommendations.append(
                {
                    "resource_id": course.course_id,
                    "resource_type": "iGOT",
                    "title": course.title,
                    "competency_id": competency_id,
                    "competency_name": competency.name,
                    "gap": gap_value,
                    "reason": (
                        f"Recommended because it is mapped to "
                        f"{competency.name}, where the current "
                        f"competency level is below the required level."
                    ),
                    "source_url": course.source_url,
                }
            )

        training_rows = (
            db.query(TrainingProgramme)
            .join(
                TrainingCompetency,
                TrainingProgramme.training_id
                == TrainingCompetency.training_id
            )
            .filter(
                TrainingCompetency.competency_id == competency_id
            )
            .all()
        )

        for training in training_rows:

            if training.training_id in completed_resources:
                continue

            recommendations.append(
                {
                    "resource_id": training.training_id,
                    "resource_type": "NSSTA",
                    "title": training.title,
                    "competency_id": competency_id,
                    "competency_name": competency.name,
                    "gap": gap_value,
                    "reason": (
                        f"Recommended because it is mapped to "
                        f"{competency.name}, where the current "
                        f"competency level is below the required level."
                    ),
                    "source_url": training.source_url,
                }
            )

    return recommendations