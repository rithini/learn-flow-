import hashlib
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.user import (
    User,
    StudentProfile,
    TrainerProfile,
    AdminProfile,
    RefreshToken,
    AuditLog,
)
from app.models.enums import UserRole
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.core.exceptions import (
    UnauthorizedException,
    ConflictException,
    NotFoundException,
    BadRequestException,
)
from app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    AuthResponse,
    UserResponse,
)


class AuthService:
    @staticmethod
    def register(db: Session, req: UserRegisterRequest) -> UserResponse:
        existing = db.query(User).filter(User.email == req.email.lower()).first()
        if existing:
            raise ConflictException(f"User with email '{req.email}' already exists.")

        user = User(
            email=req.email.lower(),
            full_name=req.full_name,
            password_hash=get_password_hash(req.password),
            role=req.role,
            is_active=True,
        )
        db.add(user)
        db.flush()

        # Create corresponding role profile
        if req.role == UserRole.STUDENT:
            student_profile = StudentProfile(
                user_id=user.id,
                student_code=req.student_code or f"STU-{user.id[:8].upper()}",
                institution_name=req.institution_name or "LearnFlow Institute",
                current_level=req.current_level or "Undergraduate",
            )
            db.add(student_profile)
        elif req.role == UserRole.TRAINER:
            trainer_profile = TrainerProfile(
                user_id=user.id,
                employee_code=req.employee_code or f"TRN-{user.id[:8].upper()}",
                department=req.department or "Computer Science & Engineering",
            )
            db.add(trainer_profile)
        elif req.role == UserRole.ADMIN:
            admin_profile = AdminProfile(user_id=user.id)
            db.add(admin_profile)

        # Audit Log
        audit = AuditLog(
            actor_user_id=user.id,
            action="USER_REGISTERED",
            entity_type="USER",
            entity_id=user.id,
            metadata_json={"email": user.email, "role": user.role.value},
        )
        db.add(audit)

        db.commit()
        db.refresh(user)
        return AuthService._to_user_response(user)

    @staticmethod
    def login(db: Session, req: UserLoginRequest) -> AuthResponse:
        user = db.query(User).filter(User.email == req.email.lower()).first()
        if not user or not verify_password(req.password, user.password_hash):
            raise UnauthorizedException("Invalid email or password.")

        if not user.is_active:
            raise UnauthorizedException("Your account is deactivated. Contact administrator.")

        access_token = create_access_token(subject=user.id, role=user.role.value)
        refresh_tok_str, refresh_exp = create_refresh_token(subject=user.id, role=user.role.value)

        # Store refresh token record
        db_refresh = RefreshToken(
            user_id=user.id,
            token_hash=hashlib.sha256(refresh_tok_str.encode("utf-8")).hexdigest(),
            expires_at=refresh_exp,
        )
        db.add(db_refresh)

        # Audit Log
        audit = AuditLog(
            actor_user_id=user.id,
            action="USER_LOGGED_IN",
            entity_type="USER",
            entity_id=user.id,
        )
        db.add(audit)

        db.commit()

        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_tok_str,
            token_type="bearer",
            expires_in=86400,
            user=AuthService._to_user_response(user),
        )

    @staticmethod
    def refresh(db: Session, refresh_token_str: str) -> AuthResponse:
        payload = decode_token(refresh_token_str)
        if not payload or payload.get("type") != "refresh":
            raise UnauthorizedException("Invalid or expired refresh token.")

        user_id = payload.get("sub")
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.is_active:
            raise UnauthorizedException("User not found or inactive.")

        new_access = create_access_token(subject=user.id, role=user.role.value)
        new_refresh, new_exp = create_refresh_token(subject=user.id, role=user.role.value)

        db_refresh = RefreshToken(
            user_id=user.id,
            token_hash=hashlib.sha256(new_refresh.encode("utf-8")).hexdigest(),
            expires_at=new_exp,
        )
        db.add(db_refresh)
        db.commit()

        return AuthResponse(
            access_token=new_access,
            refresh_token=new_refresh,
            token_type="bearer",
            expires_in=86400,
            user=AuthService._to_user_response(user),
        )

    @staticmethod
    def _to_user_response(user: User) -> UserResponse:
        student_code = None
        institution = None
        level = None
        emp_code = None
        dept = None

        if user.student_profile:
            student_code = user.student_profile.student_code
            institution = user.student_profile.institution_name
            level = user.student_profile.current_level
        if user.trainer_profile:
            emp_code = user.trainer_profile.employee_code
            dept = user.trainer_profile.department

        return UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            student_code=student_code,
            institution_name=institution,
            current_level=level,
            employee_code=emp_code,
            department=dept,
        )


auth_service = AuthService()
