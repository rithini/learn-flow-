from app.models.learning import StudentTopicPerformance
from app.models.topic import Topic, TopicPrerequisite
from app.models.course import Course
from app.models.enums import CourseStatus, StrengthStatus, RecommendationType
from app.services.adaptive_engine import adaptive_engine


def test_adaptive_engine_strong_learner(db_session, seed_test_users):
    trainer = seed_test_users["trainer"]
    student = seed_test_users["student"]

    course = Course(trainer_id=trainer.id, title="Test Course", status=CourseStatus.PUBLISHED)
    db_session.add(course)
    db_session.flush()

    t1 = Topic(course_id=course.id, title="Topic 1", sequence_no=1, status=CourseStatus.PUBLISHED)
    t2 = Topic(course_id=course.id, title="Topic 2", sequence_no=2, status=CourseStatus.PUBLISHED)
    db_session.add_all([t1, t2])
    db_session.flush()

    db_session.add(TopicPrerequisite(topic_id=t2.id, prerequisite_topic_id=t1.id))
    db_session.commit()

    # High performance on Topic 1 (90%)
    perf = StudentTopicPerformance(
        student_id=student.id,
        topic_id=t1.id,
        mastery_score=90.0,
        confidence_score=85.0,
        strength_status=StrengthStatus.STRONG,
        attempt_count=2,
        recent_accuracy=90.0,
        completion_quality=100.0,
    )
    db_session.add(perf)
    db_session.commit()

    recs = adaptive_engine.evaluate(db_session, student.id, course.id, t1.id, perf)
    assert len(recs) > 0
    assert recs[0]["recommendation_type"] == RecommendationType.NEXT_TOPIC
    assert recs[0]["topic_id"] == t2.id


def test_adaptive_engine_needs_support(db_session, seed_test_users):
    trainer = seed_test_users["trainer"]
    student = seed_test_users["student"]

    course = Course(trainer_id=trainer.id, title="Test Course", status=CourseStatus.PUBLISHED)
    db_session.add(course)
    db_session.flush()

    t1 = Topic(course_id=course.id, title="Topic 1", sequence_no=1, status=CourseStatus.PUBLISHED)
    db_session.add(t1)
    db_session.commit()

    # Low performance on Topic 1 (35%)
    perf = StudentTopicPerformance(
        student_id=student.id,
        topic_id=t1.id,
        mastery_score=35.0,
        confidence_score=75.0,
        strength_status=StrengthStatus.NEEDS_SUPPORT,
        attempt_count=2,
        recent_accuracy=35.0,
        completion_quality=40.0,
    )
    db_session.add(perf)
    db_session.commit()

    recs = adaptive_engine.evaluate(db_session, student.id, course.id, t1.id, perf)
    assert len(recs) > 0
    assert recs[0]["recommendation_type"] == RecommendationType.SIMPLIFIED_CAPSULE
