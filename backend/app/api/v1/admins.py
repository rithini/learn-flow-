from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.permissions import get_current_admin
from app.core.exceptions import NotFoundException
from app.models.user import User, AuditLog
from app.models.course import Course
from app.models.capsule import LearningCapsule
from app.models.quiz import QuizAttempt
from app.models.material import Material
from app.models.enums import UserRole, CourseStatus
from app.schemas.auth import UserResponse
from app.schemas.course import CourseResponse
from app.schemas.analytics import AdminDashboardResponse
from app.services.auth_service import auth_service

router = APIRouter(prefix="/admin", tags=["Admin Portal"])


@router.get("/dashboard", response_model=AdminDashboardResponse)
def get_admin_dashboard(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    total_users = db.query(User).count()
    total_students = db.query(User).filter(User.role == UserRole.STUDENT).count()
    total_trainers = db.query(User).filter(User.role == UserRole.TRAINER).count()
    total_admins = db.query(User).filter(User.role == UserRole.ADMIN).count()
    total_courses = db.query(Course).count()
    total_capsules = db.query(LearningCapsule).count()
    total_quizzes = db.query(QuizAttempt).count()
    total_materials = db.query(Material).count()

    recent_logs = (
        db.query(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .limit(8)
        .all()
    )
    log_dicts = [
        {
            "id": l.id,
            "action": l.action,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "timestamp": l.created_at.isoformat(),
        }
        for l in recent_logs
    ]

    return AdminDashboardResponse(
        total_users=total_users,
        total_students=total_students,
        total_trainers=total_trainers,
        total_admins=total_admins,
        total_courses=total_courses,
        total_capsules=total_capsules,
        total_quizzes_taken=total_quizzes,
        total_materials_processed=total_materials,
        recent_audit_logs=log_dicts,
        system_health={"database": "HEALTHY", "redis": "OPERATIONAL", "ai_gateway": "ONLINE"},
    )


@router.get("/users", response_model=List[UserResponse])
def list_users(
    role: Optional[UserRole] = None,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    q = db.query(User)
    if role:
        q = q.filter(User.role == role)
    users = q.order_by(User.created_at.desc()).all()
    return [auth_service._to_user_response(u) for u in users]


@router.patch("/users/{user_id}", response_model=UserResponse)
def update_user_status(
    user_id: str,
    is_active: Optional[bool] = None,
    role: Optional[UserRole] = None,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundException("User", user_id)

    if is_active is not None:
        user.is_active = is_active
    if role is not None:
        user.role = role

    # Audit Log
    db.add(
        AuditLog(
            actor_user_id=current_admin.id,
            action="ADMIN_UPDATED_USER",
            entity_type="USER",
            entity_id=user.id,
            metadata_json={"is_active": user.is_active, "role": user.role.value},
        )
    )
    db.commit()
    db.refresh(user)
    return auth_service._to_user_response(user)


@router.get("/courses", response_model=List[CourseResponse])
def list_all_courses_admin(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    courses = db.query(Course).order_by(Course.created_at.desc()).all()
    result = []
    for c in courses:
        result.append(
            CourseResponse(
                id=c.id,
                trainer_id=c.trainer_id,
                title=c.title,
                description=c.description,
                thumbnail_url=c.thumbnail_url,
                status=c.status,
                published_at=c.published_at,
                created_at=c.created_at,
                updated_at=c.updated_at,
                topic_count=len(c.topics),
                enrolled_count=len(c.enrollments),
            )
        )
    return result


@router.patch("/courses/{course_id}", response_model=CourseResponse)
def update_course_admin(
    course_id: str,
    status: CourseStatus,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise NotFoundException("Course", course_id)

    course.status = status
    db.add(
        AuditLog(
            actor_user_id=current_admin.id,
            action="ADMIN_MODERATED_COURSE",
            entity_type="COURSE",
            entity_id=course.id,
            metadata_json={"new_status": status.value},
        )
    )
    db.commit()
    db.refresh(course)
    return CourseResponse(
        id=course.id,
        trainer_id=course.trainer_id,
        title=course.title,
        description=course.description,
        thumbnail_url=course.thumbnail_url,
        status=course.status,
        published_at=course.published_at,
        created_at=course.created_at,
        updated_at=course.updated_at,
        topic_count=len(course.topics),
        enrolled_count=len(course.enrollments),
    )


@router.get("/audit-logs")
def get_audit_logs(
    limit: int = 50,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "actor_user_id": l.actor_user_id,
            "action": l.action,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "metadata": l.metadata_json,
            "created_at": l.created_at,
        }
        for l in logs
    ]
