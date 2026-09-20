from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.training_programme import TrainingProgramme
from app.schemas.training_programme import TrainingProgrammeResponse


router = APIRouter(
    prefix="/api/v1/training-programmes",
    tags=["Training Programmes"]
)


@router.get(
    "",
    response_model=list[TrainingProgrammeResponse]
)
def get_training_programmes(
    db: Session = Depends(get_db)
):
    return db.query(TrainingProgramme).all()


@router.get(
    "/{training_id}",
    response_model=TrainingProgrammeResponse
)
def get_training_programme(
    training_id: str,
    db: Session = Depends(get_db)
):
    training = db.get(
        TrainingProgramme,
        training_id
    )

    if not training:
        raise HTTPException(
            status_code=404,
            detail="Training programme not found"
        )

    return training