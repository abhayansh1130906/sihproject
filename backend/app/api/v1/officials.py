from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.competency import Competency
from app.models.learning_history import LearningHistory
from app.models.official import Official
from app.models.official_competency import OfficialCompetency
from app.services.competency_gap_service import get_competency_gaps

from app.schemas.competency_gap import CompetencyGapResponse
from app.schemas.learning_history import LearningHistoryResponse, LearningHistoryCreateRequest
from app.schemas.official import OfficialResponse
from app.schemas.official_competency import OfficialCompetencyResponse

from app.services.recommendation_service import get_recommendations
from app.schemas.recommendation import RecommendationResponse

from uuid import uuid4

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


@router.get(
    "/{official_id}",
    response_model=OfficialResponse
)
def get_official(
    official_id: str,
    db: Session = Depends(get_db)
):
    official = db.get(Official, official_id)

    if not official:
        raise HTTPException(
            status_code=404,
            detail="Official not found"
        )

    return official


@router.get(
    "/{official_id}/competencies",
    response_model=list[OfficialCompetencyResponse]
)
def get_official_competencies(
    official_id: str,
    db: Session = Depends(get_db)
):
    official = db.get(Official, official_id)

    if not official:
        raise HTTPException(
            status_code=404,
            detail="Official not found"
        )

    rows = (
        db.query(
            OfficialCompetency,
            Competency
        )
        .join(
            Competency,
            OfficialCompetency.competency_id
            == Competency.competency_id
        )
        .filter(
            OfficialCompetency.official_id == official_id
        )
        .all()
    )

    return [
        {
            "competency_id": competency.competency_id,
            "competency_name": competency.name,
            "domain": competency.domain,
            "current_level": official_competency.current_level,
            "assessment_source": official_competency.assessment_source,
        }
        for official_competency, competency in rows
    ]


@router.get(
    "/{official_id}/learning-history",
    response_model=list[LearningHistoryResponse]
)
def get_learning_history(
    official_id: str,
    db: Session = Depends(get_db)
):
    official = db.get(Official, official_id)

    if not official:
        raise HTTPException(
            status_code=404,
            detail="Official not found"
        )

    return (
        db.query(LearningHistory)
        .filter(
            LearningHistory.official_id == official_id
        )
        .all()
    )

@router.get(
    "",
    response_model=list[OfficialResponse]
)
def get_officials(
    db: Session = Depends(get_db)
):
    return db.query(Official).all()

@router.get(
    "/{official_id}/recommendations",
    response_model=list[RecommendationResponse]
)
def recommendations(
    official_id: str,
    db: Session = Depends(get_db)
):
    result = get_recommendations(db, official_id)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail="Official not found"
        )

    return result

@router.get(
    "",
    response_model=list[OfficialResponse]
)
def get_officials(
    db: Session = Depends(get_db)
):
    return db.query(Official).all()

@router.post(
    "/{official_id}/learning-history",
    response_model=LearningHistoryResponse,
    status_code=201,
)
def create_learning_history(
    official_id: str,
    request: LearningHistoryCreateRequest,
    db: Session = Depends(get_db),
):
    official = db.get(Official, official_id)

    if not official:
        raise HTTPException(
            status_code=404,
            detail="Official not found",
        )

    history = LearningHistory(
        history_id=uuid4().hex[:20],
        official_id=official_id,
        learning_type=request.learning_type,
        resource_id=request.resource_id,
        resource_title=request.resource_title,
        status=request.status,
        completion_date=request.completion_date,
        score=request.score,
        source_type=request.source_type,
    )

    db.add(history)
    db.commit()
    db.refresh(history)

    return history