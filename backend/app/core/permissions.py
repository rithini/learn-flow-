from typing import List, Optional
from fastapi import Depends, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.security import decode_token
from app.core.exceptions import UnauthorizedException, ForbiddenException, NotFoundException
from app.models.user import User
from app.models.course import Course, CourseEnrollment
from app.models.enums import UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> User:
    actual_token = token
    if not actual_token and authorization and authorization.startswith("Bearer "):
        actual_token = authorization.split(" ")[1]

    if not actual_token:
        raise UnauthorizedException("Authentication token is missing")

    payload = decode_token(actual_token)
    if not payload or payload.get("type") != "access":
        raise UnauthorizedException("Invalid or expired access token")

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Invalid token payload")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise UnauthorizedException("User no longer exists")

    if not user.is_active:
        raise ForbiddenException("User account has been deactivated")

    return user


def require_role(allowed_roles: List[UserRole]):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles and current_user.role != UserRole.ADMIN:
            raise ForbiddenException(
                f"Access forbidden: requires one of roles {[r.value for r in allowed_roles]}"
            )
        return current_user

    return role_checker


def get_current_student(current_user: User = Depends(require_role([UserRole.STUDENT]))) -> User:
    return current_user


def get_current_trainer(current_user: User = Depends(require_role([UserRole.TRAINER]))) -> User:
    return current_user


def get_current_admin(current_user: User = Depends(require_role([UserRole.ADMIN]))) -> User:
    return current_user


def verify_course_ownership(course_id: str, current_user: User, db: Session) -> Course:
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise NotFoundException("Course", course_id)

    if current_user.role == UserRole.ADMIN:
        return course

    if course.trainer_id != current_user.id:
        raise ForbiddenException("You are not the owner of this course")

    return course


def verify_course_enrollment(course_id: str, current_user: User, db: Session) -> Course:
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise NotFoundException("Course", course_id)

    if current_user.role in (UserRole.ADMIN, UserRole.TRAINER):
        return course

    enrollment = (
        db.query(CourseEnrollment)
        .filter(
            CourseEnrollment.course_id == course_id,
            CourseEnrollment.student_id == current_user.id,
        )
        .first()
    )
    if not enrollment:
        raise ForbiddenException("You are not enrolled in this course")

    return course
