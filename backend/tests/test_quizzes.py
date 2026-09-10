from app.models.course import Course
from app.models.topic import Topic
from app.models.quiz import Quiz, QuizQuestion, QuizOption
from app.models.enums import CourseStatus, TopicStatus, QuizType, DifficultyLevel


def test_quiz_delivery_no_answer_leakage(client, db_session, seed_test_users):
    trainer = seed_test_users["trainer"]
    student = seed_test_users["student"]

    course = Course(trainer_id=trainer.id, title="Test Course", status=CourseStatus.PUBLISHED)
    db_session.add(course)
    db_session.flush()

    topic = Topic(course_id=course.id, title="Quiz Topic", sequence_no=1, status=TopicStatus.PUBLISHED)
    db_session.add(topic)
    db_session.flush()

    quiz = Quiz(topic_id=topic.id, title="Secure Quiz", pass_score=70.0, status=CourseStatus.PUBLISHED)
    db_session.add(quiz)
    db_session.flush()

    q = QuizQuestion(quiz_id=quiz.id, question_text="What is 2+2?", difficulty=DifficultyLevel.EASY)
    db_session.add(q)
    db_session.flush()

    db_session.add(QuizOption(question_id=q.id, option_text="4", is_correct=True, sequence_no=1))
    db_session.add(QuizOption(question_id=q.id, option_text="5", is_correct=False, sequence_no=2))
    db_session.commit()

    # Login as student
    login_resp = client.post("/api/v1/auth/login", json={"email": "student@test.edu", "password": "Secret123!"})
    token = login_resp.json()["access_token"]

    # Student fetches quiz questions
    resp = client.get(f"/api/v1/quizzes/{quiz.id}", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 200
    data = resp.json()

    # Verify NO is_correct or answer key is returned
    for question in data["questions"]:
        assert "explanation" not in question or question.get("explanation") is None
        for option in question["options"]:
            assert "is_correct" not in option
            assert "correct_option_index" not in option


def test_quiz_submission_and_server_grading(client, db_session, seed_test_users):
    trainer = seed_test_users["trainer"]
    student = seed_test_users["student"]

    course = Course(trainer_id=trainer.id, title="Course", status=CourseStatus.PUBLISHED)
    db_session.add(course)
    db_session.flush()

    topic = Topic(course_id=course.id, title="Topic", sequence_no=1, status=TopicStatus.PUBLISHED)
    db_session.add(topic)
    db_session.flush()

    quiz = Quiz(topic_id=topic.id, title="Quiz", pass_score=70.0, status=CourseStatus.PUBLISHED)
    db_session.add(quiz)
    db_session.flush()

    q1 = QuizQuestion(quiz_id=quiz.id, question_text="Q1", marks=1.0)
    db_session.add(q1)
    db_session.flush()
    opt1_correct = QuizOption(question_id=q1.id, option_text="Opt A", is_correct=True, sequence_no=1)
    opt1_wrong = QuizOption(question_id=q1.id, option_text="Opt B", is_correct=False, sequence_no=2)
    db_session.add_all([opt1_correct, opt1_wrong])
    db_session.commit()

    # Login student
    login_resp = client.post("/api/v1/auth/login", json={"email": "student@test.edu", "password": "Secret123!"})
    token = login_resp.json()["access_token"]

    # Submit correct answer
    submission = {
        "answers": [{"question_id": q1.id, "selected_option_id": opt1_correct.id}],
        "time_taken_seconds": 60,
    }
    resp = client.post(
        f"/api/v1/quizzes/{quiz.id}/attempts",
        headers={"Authorization": f"Bearer {token}"},
        json=submission,
    )
    assert resp.status_code == 200
    res_data = resp.json()
    assert res_data["score"] == 1.0
    assert res_data["percentage"] == 100.0
    assert res_data["passed"] is True
    assert res_data["answers"][0]["is_correct"] is True
