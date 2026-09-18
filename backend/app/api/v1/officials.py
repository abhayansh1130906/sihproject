from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.competency_gap_service import get_competency_gaps

from app.schemas.competency_gap import CompetencyGapResponse


router = APIRouter(
    prefix="/api/v1/officials",
    tags=["Officials"]
)


@router.get(
    "/{official_id}/competency-gaps",
    response_model=list[CompetencyGapResponse]
)
def competency_gaps(
    official_id: str,
    db: Session = Depends(get_db)
):
    gaps = get_competency_gaps(db, official_id)

    if gaps is None:
        raise HTTPException(
            status_code=404,
            detail="Official not found"
        )

    return gaps