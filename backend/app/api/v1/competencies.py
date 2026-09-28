from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.competency import Competency
from app.schemas.competency import CompetencyResponse


router = APIRouter(
    prefix="/api/v1/competencies",
    tags=["Competencies"]
)


@router.get(
    "",
    response_model=list[CompetencyResponse]
)
def get_competencies(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return db.query(Competency).offset(skip).limit(limit).all()


@router.get(
    "/{competency_id}",
    response_model=CompetencyResponse
)
def get_competency(
    competency_id: str,
    db: Session = Depends(get_db)
):
    competency = db.get(
        Competency,
        competency_id
    )

    if not competency:
        raise HTTPException(
            status_code=404,
            detail="Competency not found"
        )

    return competency