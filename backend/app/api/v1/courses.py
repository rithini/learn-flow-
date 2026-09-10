from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.permissions import get_current_user, get_current_trainer, verify_course_ownership
from app.core.exceptions import NotFoundException, ForbiddenException, BadRequestException
from app.models.user import User
from app.models.course import Course, CourseEnrollment
from app.models.topic import Topic, TopicPrerequisite
from app.models.enums import CourseStatus, TopicStatus, EnrollmentStatus, UserRole
from app.schemas.course import CourseCreate, CourseUpdate, CourseResponse
from app.schemas.topic import TopicCreate, TopicUpdate, TopicResponse

router = APIRouter(tags=["Courses & Topics"])


@router.get("/trainer/courses", response_model=List[CourseResponse])
def list_trainer_courses(
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    courses = (
        db.query(Course)
        .filter(Course.trainer_id == current_trainer.id)
        .order_by(Course.created_at.desc())
        .all()
    )
    result = []
    for c in courses:
        topic_count = db.query(Topic).filter(Topic.course_id == c.id).count()
        enrolled_count = db.query(CourseEnrollment).filter(CourseEnrollment.course_id == c.id).count()
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
                topic_count=topic_count,
                enrolled_count=enrolled_count,
            )
        )
    return result


@router.post("/trainer/courses", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    req: CourseCreate,
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    course = Course(
        trainer_id=current_trainer.id,
        title=req.title,
        description=req.description,
        thumbnail_url=req.thumbnail_url,
        status=CourseStatus.DRAFT,
    )
    db.add(course)
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
        topic_count=0,
        enrolled_count=0,
    )


@router.get("/trainer/courses/{course_id}", response_model=CourseResponse)
def get_course_details(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = verify_course_ownership(course_id, current_user, db)
    topic_count = db.query(Topic).filter(Topic.course_id == course.id).count()
    enrolled_count = db.query(CourseEnrollment).filter(CourseEnrollment.course_id == course.id).count()
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
        topic_count=topic_count,
        enrolled_count=enrolled_count,
    )


@router.patch("/trainer/courses/{course_id}", response_model=CourseResponse)
def update_course(
    course_id: str,
    req: CourseUpdate,
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    course = verify_course_ownership(course_id, current_trainer, db)
    if req.title is not None:
        course.title = req.title
    if req.description is not None:
        course.description = req.description
    if req.thumbnail_url is not None:
        course.thumbnail_url = req.thumbnail_url
    if req.status is not None:
        course.status = req.status
        if req.status == CourseStatus.PUBLISHED and not course.published_at:
            course.published_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(course)
    topic_count = db.query(Topic).filter(Topic.course_id == course.id).count()
    enrolled_count = db.query(CourseEnrollment).filter(CourseEnrollment.course_id == course.id).count()
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
        topic_count=topic_count,
        enrolled_count=enrolled_count,
    )


@router.delete("/trainer/courses/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: str,
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    course = verify_course_ownership(course_id, current_trainer, db)
    db.delete(course)
    db.commit()
    return None


# --- Topics Management ---

@router.get("/trainer/courses/{course_id}/topics", response_model=List[TopicResponse])
def list_course_topics(
    course_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    course = verify_course_ownership(course_id, current_user, db)
    topics = db.query(Topic).filter(Topic.course_id == course.id).order_by(Topic.sequence_no).all()
    results = []
    for t in topics:
        prereqs = db.query(TopicPrerequisite).filter(TopicPrerequisite.topic_id == t.id).all()
        prereq_ids = [p.prerequisite_topic_id for p in prereqs]
        capsule = t.capsules[0] if t.capsules else None
        quiz = t.quizzes[0] if t.quizzes else None
        results.append(
            TopicResponse(
                id=t.id,
                course_id=t.course_id,
                parent_topic_id=t.parent_topic_id,
                title=t.title,
                description=t.description,
                sequence_no=t.sequence_no,
                estimated_minutes=t.estimated_minutes,
                status=t.status,
                created_at=t.created_at,
                prerequisite_ids=prereq_ids,
                capsule_id=capsule.id if capsule else None,
                quiz_id=quiz.id if quiz else None,
            )
        )
    return results


@router.post("/trainer/courses/{course_id}/topics", response_model=TopicResponse, status_code=status.HTTP_201_CREATED)
def create_topic(
    course_id: str,
    req: TopicCreate,
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    course = verify_course_ownership(course_id, current_trainer, db)
    topic = Topic(
        course_id=course.id,
        parent_topic_id=req.parent_topic_id,
        title=req.title,
        description=req.description,
        sequence_no=req.sequence_no,
        estimated_minutes=req.estimated_minutes,
        status=TopicStatus.DRAFT,
    )
    db.add(topic)
    db.flush()

    for pid in req.prerequisite_topic_ids:
        if pid != topic.id:
            prereq = TopicPrerequisite(topic_id=topic.id, prerequisite_topic_id=pid)
            db.add(prereq)

    db.commit()
    db.refresh(topic)
    return TopicResponse(
        id=topic.id,
        course_id=topic.course_id,
        parent_topic_id=topic.parent_topic_id,
        title=topic.title,
        description=topic.description,
        sequence_no=topic.sequence_no,
        estimated_minutes=topic.estimated_minutes,
        status=topic.status,
        created_at=topic.created_at,
        prerequisite_ids=req.prerequisite_topic_ids,
    )


@router.patch("/trainer/topics/{topic_id}", response_model=TopicResponse)
def update_topic(
    topic_id: str,
    req: TopicUpdate,
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise NotFoundException("Topic", topic_id)
    verify_course_ownership(topic.course_id, current_trainer, db)

    if req.title is not None:
        topic.title = req.title
    if req.description is not None:
        topic.description = req.description
    if req.sequence_no is not None:
        topic.sequence_no = req.sequence_no
    if req.estimated_minutes is not None:
        topic.estimated_minutes = req.estimated_minutes
    if req.status is not None:
        topic.status = req.status
    if req.parent_topic_id is not None:
        topic.parent_topic_id = req.parent_topic_id

    if req.prerequisite_topic_ids is not None:
        db.query(TopicPrerequisite).filter(TopicPrerequisite.topic_id == topic.id).delete()
        for pid in req.prerequisite_topic_ids:
            if pid != topic.id:
                db.add(TopicPrerequisite(topic_id=topic.id, prerequisite_topic_id=pid))

    db.commit()
    db.refresh(topic)

    prereqs = db.query(TopicPrerequisite).filter(TopicPrerequisite.topic_id == topic.id).all()
    prereq_ids = [p.prerequisite_topic_id for p in prereqs]

    return TopicResponse(
        id=topic.id,
        course_id=topic.course_id,
        parent_topic_id=topic.parent_topic_id,
        title=topic.title,
        description=topic.description,
        sequence_no=topic.sequence_no,
        estimated_minutes=topic.estimated_minutes,
        status=topic.status,
        created_at=topic.created_at,
        prerequisite_ids=prereq_ids,
    )


@router.delete("/trainer/topics/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_topic(
    topic_id: str,
    current_trainer: User = Depends(get_current_trainer),
    db: Session = Depends(get_db),
):
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise NotFoundException("Topic", topic_id)
    verify_course_ownership(topic.course_id, current_trainer, db)
    db.delete(topic)
    db.commit()
    return None
