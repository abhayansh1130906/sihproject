from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.course import Course
from app.schemas.course import CourseResponse


router = APIRouter(
    prefix="/api/v1/courses",
    tags=["Courses"]
)


@router.get(
    "",
    response_model=list[CourseResponse]
)
def get_courses(
    db: Session = Depends(get_db)
):
    return db.query(Course).all()


@router.get(
    "/{course_id}",
    response_model=CourseResponse
)
def get_course(
    course_id: str,
    db: Session = Depends(get_db)
):
    course = db.get(
        Course,
        course_id
    )

    if not course:
        raise HTTPException(
            status_code=404,
            detail="Course not found"
        )

    return course