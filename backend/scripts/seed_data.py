import json
from pathlib import Path

from app.db.session import SessionLocal
from app import models
from datetime import date


BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"


def load_json(filename: str):
    file_path = DATA_DIR / filename

    with file_path.open("r", encoding="utf-8") as file:
        return json.load(file)


def record_exists(db, model, primary_key, value):
    return db.get(model, value) is not None


def main():
    db = SessionLocal()

    try:
        # -------------------------
        # Competencies
        # -------------------------
        competencies = load_json("competencies.json")

        for item in competencies:
            if record_exists(
                db,
                models.Competency,
                item["competency_id"],
                item["competency_id"],
            ):
                continue

            competency = models.Competency(
                competency_id=item["competency_id"],
                name=item["name"],
                domain=item["domain"],
                competency_type=item["competency_type"],
                description=item["description"],
                source_type=item["source_type"],
                source=item["source"],
                source_document=item["source_document"],
                source_url=item["source_url"],
            )

            db.add(competency)

        # -------------------------
        # Roles
        # -------------------------
        roles = load_json("roles.json")

        for item in roles:
            if record_exists(
                db,
                models.Role,
                item["role_id"],
                item["role_id"],
            ):
                continue

            role = models.Role(
                role_id=item["role_id"],
                role_name=item["role_name"],
                role_type=item["role_type"],
                department=item["department"],
                division=item["division"],
                responsibilities=item["responsibilities"],
                source=item["source"],
                source_document=item["source_document"],
                source_url=item["source_url"],
            )

            db.add(role)

                # -------------------------
        # Role Competencies
        # -------------------------
        role_competencies = load_json("role_competencies.json")

        for item in role_competencies:
            existing = (
                db.query(models.RoleCompetency)
                .filter(
                    models.RoleCompetency.role_id == item["role_id"],
                    models.RoleCompetency.competency_id == item["competency_id"],
                )
                .first()
            )

            if existing:
                continue

            role_competency = models.RoleCompetency(
                role_id=item["role_id"],
                competency_id=item["competency_id"],
                required_level=item["required_level"],
                mapping_basis=item["mapping_basis"],
            )

            db.add(role_competency)

                # -------------------------
        # iGOT Courses
        # -------------------------
        courses = load_json("igot_courses.json")

        for item in courses:
            if record_exists(
                db,
                models.Course,
                item["course_id"],
                item["course_id"],
            ):
                continue

            course = models.Course(
                course_id=item["course_id"],
                title=item["title"],
                description=item["description"],
                provider=item["provider"],
                duration_minutes=item["duration_minutes"],
                tags=item["tags"],
                target_audience=item["target_audience"],
                learning_outcomes=item["learning_outcomes"],
                course_type=item["course_type"],
                source_url=item["source_url"],
                catalogue_source=item["catalogue_source"],
                verification_status=item["verification_status"],
            )

            db.add(course)

                # -------------------------
        # Course Competencies
        # -------------------------
        course_competencies = load_json("course_competencies.json")

        for item in course_competencies:
            existing = (
                db.query(models.CourseCompetency)
                .filter(
                    models.CourseCompetency.course_id == item["course_id"],
                    models.CourseCompetency.competency_id == item["competency_id"],
                )
                .first()
            )

            if existing:
                continue

            course_competency = models.CourseCompetency(
                course_id=item["course_id"],
                competency_id=item["competency_id"],
                mapping_basis=item["mapping_basis"],
            )

            db.add(course_competency)

                # -------------------------
        # NSSTA Training Programmes
        # -------------------------
        training_programmes = load_json("nssta_training_programmes.json")

        for item in training_programmes:
            if record_exists(
                db,
                models.TrainingProgramme,
                item["training_id"],
                item["training_id"],
            ):
                continue

            training_programme = models.TrainingProgramme(
                training_id=item["training_id"],
                title=item["title"],
                category=item["category"],
                target_audience=item["target_audience"],
                topic=item["topic"],
                duration=item["duration"],
                year=item["year"],
                provider=item["provider"],
                source_document=item["source_document"],
                source_url=item["source_url"],
            )

            db.add(training_programme)

                # -------------------------
        # Training Competencies
        # -------------------------
        training_competencies = load_json("training_competencies.json")

        for item in training_competencies:
            existing = (
                db.query(models.TrainingCompetency)
                .filter(
                    models.TrainingCompetency.training_id == item["training_id"],
                    models.TrainingCompetency.competency_id == item["competency_id"],
                )
                .first()
            )

            if existing:
                continue

            training_competency = models.TrainingCompetency(
                training_id=item["training_id"],
                competency_id=item["competency_id"],
                relevance=item["relevance"],
            )

            db.add(training_competency)

                # -------------------------
        # Officials
        # -------------------------
        officials = load_json("officials.json")

        for item in officials:
            if record_exists(
                db,
                models.Official,
                item["official_id"],
                item["official_id"],
            ):
                continue

            official = models.Official(
                official_id=item["official_id"],
                role_id=item["role_id"],
                name=item["name"],
                designation=item["designation"],
                department=item["department"],
                division=item["division"],
                current_assignment=item["current_assignment"],
                education=item["education"],
                experience_years=item["experience_years"],
                previous_trainings=item["previous_trainings"],
            )

            db.add(official)

                # -------------------------
        # Official Competencies
        # -------------------------
        official_competencies = load_json("official_competencies.json")

        for item in official_competencies:
            existing = (
                db.query(models.OfficialCompetency)
                .filter(
                    models.OfficialCompetency.official_id == item["official_id"],
                    models.OfficialCompetency.competency_id == item["competency_id"],
                )
                .first()
            )

            if existing:
                continue

            official_competency = models.OfficialCompetency(
                official_id=item["official_id"],
                competency_id=item["competency_id"],
                current_level=item["current_level"],
                assessment_source=item["assessment_source"],
            )

            db.add(official_competency)

                # -------------------------
        # Learning History
        # -------------------------
        learning_history = load_json("demo_learning_history.json")

        for item in learning_history:
            if record_exists(
                db,
                models.LearningHistory,
                item["history_id"],
                item["history_id"],
            ):
                continue

            history = models.LearningHistory(
                history_id=item["history_id"],
                official_id=item["official_id"],
                learning_type=item["learning_type"],
                resource_id=item["resource_id"],
                resource_title=item["resource_title"],
                status=item["status"],
                completion_date=(
                    date.fromisoformat(item["completion_date"])
                    if item["completion_date"]
                    else None
                ),
                score=item["score"],
                source_type=item["source_type"],
            )

            db.add(history)

        db.commit()

        print(f"Loaded {len(competencies)} competencies")
        print(f"Loaded {len(roles)} roles")
        print("Database seeding completed successfully.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    main()