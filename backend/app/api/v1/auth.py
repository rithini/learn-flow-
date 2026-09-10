from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    RefreshTokenRequest,
    UserResponse,
    AuthResponse,
    UserUpdateRequest,
)
from app.services.auth_service import auth_service
from app.core.permissions import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    return auth_service.register(db, req)


@router.post("/login", response_model=AuthResponse)
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    return auth_service.login(db, req)


@router.post("/refresh", response_model=AuthResponse)
def refresh_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    return auth_service.refresh(db, req.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(current_user: User = Depends(get_current_user)):
    return None


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return auth_service._to_user_response(current_user)


@router.patch("/me", response_model=UserResponse)
def update_me(
    req: UserUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if req.full_name:
        current_user.full_name = req.full_name
    if req.student_code and current_user.student_profile:
        current_user.student_profile.student_code = req.student_code
    if req.institution_name and current_user.student_profile:
        current_user.student_profile.institution_name = req.institution_name
    if req.current_level and current_user.student_profile:
        current_user.student_profile.current_level = req.current_level
    if req.department and current_user.trainer_profile:
        current_user.trainer_profile.department = req.department

    db.commit()
    db.refresh(current_user)
    return auth_service._to_user_response(current_user)
