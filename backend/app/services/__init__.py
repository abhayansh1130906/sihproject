from sqlalchemy.orm import Session

from app.models.competency import Competency
from app.models.official import Official
from app.models.official_competency import OfficialCompetency
from app.models.role_competency import RoleCompetency


def get_competency_gaps(
    db: Session,
    official_id: str
) -> list[dict]:
    official = db.get(Official, official_id)

    if not official:
        return []

    rows = (
        db.query(
            RoleCompetency,
            Competency,
            OfficialCompetency
        )
        .join(
            Competency,
            RoleCompetency.competency_id == Competency.competency_id
        )
        .outerjoin(
            OfficialCompetency,
            (
                (OfficialCompetency.official_id == official_id)
                &
                (
                    OfficialCompetency.competency_id
                    == RoleCompetency.competency_id
                )
            )
        )
        .filter(
            RoleCompetency.role_id == official.role_id
        )
        .all()
    )

    gaps = []

    for role_competency, competency, official_competency in rows:
        current_level = (
            official_competency.current_level
            if official_competency
            else 0
        )

        required_level = role_competency.required_level

        gap = max(required_level - current_level, 0)

        gaps.append(
            {
                "competency_id": competency.competency_id,
                "competency_name": competency.name,
                "domain": competency.domain,
                "required_level": required_level,
                "current_level": current_level,
                "gap": gap,
                "gap_status": (
                    "gap"
                    if gap > 0
                    else "met"
                ),
            }
        )

    return gaps