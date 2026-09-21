import json
from datetime import date
from pathlib import Path

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.competency import Competency
from app.models.role import Role
from app.models.role_competency import RoleCompetency
from app.models.official import Official
from app.models.official_competency import OfficialCompetency
from app.models.course import Course
from app.models.course_competency import CourseCompetency
from app.models.training_programme import TrainingProgramme
from app.models.training_competency import TrainingCompetency
from app.models.learning_history import LearningHistory

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


def load_json(filename: str):
    with (DATA_DIR / filename).open("r", encoding="utf-8") as file:
        return json.load(file)


def upsert(db, model, values: dict, identity_fields: tuple[str, ...]):
    identity = {field: values[field] for field in identity_fields}
    existing = db.execute(
        select(model).filter_by(**identity)
    ).scalar_one_or_none()

    if existing:
        for key, value in values.items():
            setattr(existing, key, value)
        return "updated"

    db.add(model(**values))
    return "inserted"


def seed_database():
    db = SessionLocal()
    counts = {"inserted": 0, "updated": 0}

    try:
        # 1. Parent tables
        for item in load_json("competencies.json"):
            result = upsert(db, Competency, item, ("competency_id",))
            counts[result] += 1

        for item in load_json("roles.json"):
            result = upsert(db, Role, item, ("role_id",))
            counts[result] += 1

        db.flush()

        # 2. Role-to-competency mapping
        for item in load_json("role_competencies.json"):
            result = upsert(
                db,
                RoleCompetency,
                item,
                ("role_id", "competency_id"),
            )
            counts[result] += 1

        # 3. Officials and their competency levels
        for item in load_json("officials.json"):
            values = {key: value for key, value in item.items() if key != "profile_type"}
            result = upsert(db, Official, values, ("official_id",))
            counts[result] += 1

        db.flush()

        for item in load_json("official_competencies.json"):
            result = upsert(
                db,
                OfficialCompetency,
                item,
                ("official_id", "competency_id"),
            )
            counts[result] += 1
            

        # 4. Courses and course-to-competency mapping
        for item in load_json("igot_courses.json"):
            values = {key: value for key, value in item.items() if key != "competencies"}
            result = upsert(db, Course, values, ("course_id",))
            counts[result] += 1

        for item in load_json("course_competencies.json"):
            result = upsert(
                db,
                CourseCompetency,
                item,
                ("course_id", "competency_id"),
            )
            counts[result] += 1

        # 5. NSSTA training programmes and mapping
        for item in load_json("nssta_training_programmes.json"):
            values = {key: value for key, value in item.items() if key != "competencies"}
            result = upsert(db, TrainingProgramme, values, ("training_id",))
            counts[result] += 1

        db.flush()

        for item in load_json("training_competencies.json"):
            result = upsert(
                db,
                TrainingCompetency,
                item,
                ("training_id", "competency_id"),
            )
            counts[result] += 1

        # 6. Learning history
        for item in load_json("demo_learning_history.json"):
            values = dict(item)
            if values.get("completion_date"):
                values["completion_date"] = date.fromisoformat(
                    values["completion_date"]
                )
            result = upsert(db, LearningHistory, values, ("history_id",))
            counts[result] += 1

        db.commit()
        print("Database seeding completed successfully.")
        print(f"Inserted: {counts['inserted']}")
        print(f"Updated: {counts['updated']}")

    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
