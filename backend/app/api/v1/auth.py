import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.official import Official
from app.schemas.auth import DemoLoginRequest, DemoLoginResponse


router = APIRouter(
    prefix="/api/v1/auth",
    tags=["Authentication"],
)


@router.post("/demo-login", response_model=DemoLoginResponse)
def demo_login(
    request: DemoLoginRequest,
    db: Session = Depends(get_db),
):
    official = db.get(Official, request.official_id)

    if not official:
        raise HTTPException(
            status_code=401,
            detail="Invalid official ID or password",
        )

    password_is_valid = secrets.compare_digest(
        request.password,
        settings.demo_login_password,
    )

    if not password_is_valid:
        raise HTTPException(
            status_code=401,
            detail="Invalid official ID or password",
        )

    return DemoLoginResponse(
        official_id=official.official_id,
        name=official.name,
        designation=official.designation,
        department=official.department,
        role_id=official.role_id,
        demo_mode=True,
    )