import sys
import os
from datetime import datetime, timezone, timedelta

# Reconfigure stdout/stderr for Windows console compatibility
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Ensure backend path is on sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.db.base import Base
from app.db.session import engine, SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, StudentProfile, TrainerProfile, AdminProfile
from app.models.course import Course, CourseEnrollment
from app.models.topic import Topic, TopicPrerequisite
from app.models.capsule import LearningCapsule, CapsuleSection, Video
from app.models.quiz import Quiz, QuizQuestion, QuizOption, QuizAttempt, QuizAnswer
from app.models.learning import (
    StudentProgress,
    StudentTopicPerformance,
    LearningPath,
    LearningPathItem,
    Recommendation,
)
from app.models.enums import (
    UserRole,
    CourseStatus,
    TopicStatus,
    CapsuleStatus,
    CapsuleLevel,
    SectionType,
    QuizType,
    QuestionType,
    DifficultyLevel,
    AttemptStatus,
    StrengthStatus,
    RecommendationType,
    RecommendationStatus,
    EnrollmentStatus,
    VideoStatus,
)


def seed_database():
    print("🌱 Resetting and initializing LearnFlow database schema...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    now = datetime.now(timezone.utc)

    try:
        print("👤 Creating Demo Users...")
        # 1. Admin
        admin = User(
            email="admin@learnflow.edu",
            full_name="Dr. Eleanor Vance (Admin)",
            password_hash=get_password_hash("AdminPass123!"),
            role=UserRole.ADMIN,
            is_active=True,
        )
        db.add(admin)
        db.flush()
        db.add(AdminProfile(user_id=admin.id))

        # 2. Trainer
        trainer = User(
            email="trainer@learnflow.edu",
            full_name="Prof. Alan Turing",
            password_hash=get_password_hash("TrainerPass123!"),
            role=UserRole.TRAINER,
            is_active=True,
        )
        db.add(trainer)
        db.flush()
        db.add(
            TrainerProfile(
                user_id=trainer.id,
                employee_code="TRN-ENG-042",
                department="Computer Science & Artificial Intelligence",
            )
        )

        # 3. Student 1 (High performer / Strong)
        student1 = User(
            email="student1@learnflow.edu",
            full_name="Alex Chen",
            password_hash=get_password_hash("StudentPass123!"),
            role=UserRole.STUDENT,
            is_active=True,
        )
        db.add(student1)
        db.flush()
        db.add(
            StudentProfile(
                user_id=student1.id,
                student_code="STU-2026-001",
                institution_name="National Institute of Technology",
                current_level="Senior Undergraduate",
            )
        )

        # 4. Student 2 (Needs support / Developing)
        student2 = User(
            email="student2@learnflow.edu",
            full_name="Sophia Martinez",
            password_hash=get_password_hash("StudentPass123!"),
            role=UserRole.STUDENT,
            is_active=True,
        )
        db.add(student2)
        db.flush()
        db.add(
            StudentProfile(
                user_id=student2.id,
                student_code="STU-2026-002",
                institution_name="National Institute of Technology",
                current_level="First-Year Undergraduate",
            )
        )

        db.commit()

        # --- Course Creation ---
        print("📚 Creating Course & Topic DAG...")
        course = Course(
            trainer_id=trainer.id,
            title="Introduction to Machine Learning & Neural Networks",
            description="Master end-to-end predictive modeling, loss optimization, and deep neural network architectures.",
            thumbnail_url="https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&auto=format&fit=crop&q=60",
            status=CourseStatus.PUBLISHED,
            published_at=now - timedelta(days=14),
        )
        db.add(course)
        db.flush()

        # Enroll both students
        db.add(CourseEnrollment(course_id=course.id, student_id=student1.id, status=EnrollmentStatus.ACTIVE))
        db.add(CourseEnrollment(course_id=course.id, student_id=student2.id, status=EnrollmentStatus.ACTIVE))

        # --- Topics ---
        t1 = Topic(
            course_id=course.id,
            title="1. Mathematical Foundations for Machine Learning",
            description="Linear algebra essentials, vector spaces, dot products, and multivariate gradients.",
            sequence_no=1,
            estimated_minutes=15,
            status=TopicStatus.PUBLISHED,
        )
        t2 = Topic(
            course_id=course.id,
            title="2. Linear & Logistic Regression",
            description="Formulating cost functions, mean squared error, cross-entropy, and gradient descent optimization.",
            sequence_no=2,
            estimated_minutes=20,
            status=TopicStatus.PUBLISHED,
        )
        t3 = Topic(
            course_id=course.id,
            title="3. Neural Network Architecture & Backpropagation",
            description="Multilayer perceptrons, activation functions (ReLU, Sigmoid), and reverse-mode automatic differentiation.",
            sequence_no=3,
            estimated_minutes=25,
            status=TopicStatus.PUBLISHED,
        )
        t4 = Topic(
            course_id=course.id,
            title="4. Deep Learning Optimization & Regularization",
            description="Adam and RMSProp optimizers, dropout, batch normalization, and mitigating overfitting.",
            sequence_no=4,
            estimated_minutes=25,
            status=TopicStatus.PUBLISHED,
        )
        db.add_all([t1, t2, t3, t4])
        db.flush()

        # Topic Prerequisites
        # t2 requires t1; t3 requires t2; t4 requires t3
        db.add(TopicPrerequisite(topic_id=t2.id, prerequisite_topic_id=t1.id))
        db.add(TopicPrerequisite(topic_id=t3.id, prerequisite_topic_id=t2.id))
        db.add(TopicPrerequisite(topic_id=t4.id, prerequisite_topic_id=t3.id))
        db.commit()

        # --- Capsules and Sections ---
        print("💡 Adding Published Learning Capsules...")
        topics_list = [
            (
                t1,
                "Foundations: Vectors, Matrices & Loss",
                "Linear algebra and calculus are the foundational vocabulary of modern artificial intelligence. Every data point is represented as a high-dimensional vector in feature space. When an algorithm transforms inputs into predictions, it performs matrix-vector multiplication.\n\nOptimization requires calculus: we calculate partial derivatives to form a gradient vector pointing in the direction of steepest ascent. By subtracting the gradient, gradient descent iteratively minimizes error.",
                "Imagine you are in a foggy mountain valley trying to find the lowest river basin. Vectors represent your steps; the gradient is the slope beneath your feet. Stepping downhill repeatedly guides you directly to the lowest point.",
                [
                    "A vector represents coordinates or features in N-dimensional space.",
                    "The dot product calculates the directional similarity between two vectors.",
                    "A gradient vector contains all partial derivatives of the cost function.",
                    "Gradient descent iteratively updates parameters: W = W - alpha * dW.",
                ],
                "Search engines like Google calculate vector dot products between your query embedding and billions of web documents to retrieve the closest semantic matches in milliseconds.",
            ),
            (
                t2,
                "Mastering Linear & Logistic Regression",
                "Linear regression predicts continuous scalar values by fitting a hyperplane that minimizes the sum of squared residuals. It assumes a linear relationship between input features and target outputs.\n\nLogistic regression adapts this framework for binary classification by feeding linear outputs through the Sigmoid activation function, compressing raw scores into probabilities between 0 and 1. We optimize logistic regression using Binary Cross-Entropy Loss.",
                "Linear regression predicts how many inches a tree will grow (continuous), while logistic regression predicts whether an email is spam or not (yes/no probability).",
                [
                    "Linear regression utilizes Mean Squared Error (MSE) cost function.",
                    "Logistic regression uses the Sigmoid function: sigma(z) = 1 / (1 + e^-z).",
                    "Decision boundaries separate classification classes in feature space.",
                    "L1 (Lasso) and L2 (Ridge) regularization penalize excessively large weights to prevent overfitting.",
                ],
                "Banks and credit unions apply logistic regression to calculate credit default probabilities before approving mortgage applications.",
            ),
            (
                t3,
                "Neural Networks & The Backpropagation Engine",
                "Artificial neural networks stack linear transformations interleaved with non-linear activation functions (such as ReLU, GELU, or Swish). This stacking enables networks to approximate arbitrary continuous functions.\n\nBackpropagation is an efficient application of the chain rule from calculus. During the forward pass, predictions and losses are computed. During the backward pass, gradients flow backward through the computational graph, determining how each individual weight contributed to the loss.",
                "Think of a company supply chain. If the final product has defects (loss), management traces backward through each assembly team (chain rule) to determine which specific machine needs recalibration.",
                [
                    "Non-linear activations prevent deep networks from collapsing into simple linear models.",
                    "Forward pass computes intermediate activations: A[l] = g(W[l]A[l-1] + b[l]).",
                    "Backward pass computes gradients: dW[l] = dZ[l] * A[l-1]^T.",
                    "Vanishing gradients can occur if derivative magnitudes repeatedly shrink through deep layers.",
                ],
                "Autonomous vehicle perception models process high-resolution camera feeds through deep convolutional neural networks to segment lane markers and pedestrian obstacles in real time.",
            ),
            (
                t4,
                "Optimization & Modern Regularization Techniques",
                "Standard Stochastic Gradient Descent (SGD) can oscillate violently across narrow ravines in the loss landscape. Advanced optimizers like Momentum, RMSProp, and Adam (Adaptive Moment Estimation) maintain running averages of past gradients and second moments to accelerate convergence smoothly.\n\nTo ensure deep networks generalize well on unseen test data, we deploy Dropout (randomly zeroing unit activations during training) and Batch Normalization (normalizing layer inputs to stabilize internal covariate shift).",
                "Adam optimization is like a heavy bobsled sliding down an icy track: momentum keeps it moving forward smoothly rather than jerking side to side on small bumps.",
                [
                    "Momentum accelerates SGD in the relevant direction and dampens oscillations.",
                    "Adam combines momentum (1st moment) and RMSProp scaling (2nd moment).",
                    "Dropout prevents co-adaptation of features by randomly dropping neurons during training.",
                    "Batch normalization reduces training time and acts as a mild regularizer.",
                ],
                "Language models like Gemini and GPT utilize AdamW optimizers and carefully scheduled learning rate warmups to stabilize trillion-token training runs across thousands of TPUs.",
            ),
        ]

        for topic_obj, cap_title, std_exp, simp_exp, points, example in topics_list:
            capsule = LearningCapsule(
                topic_id=topic_obj.id,
                version=1,
                level=CapsuleLevel.STANDARD,
                title=cap_title,
                status=CapsuleStatus.PUBLISHED,
                estimated_minutes=5,
                created_by=trainer.id,
                published_at=now - timedelta(days=7),
            )
            db.add(capsule)
            db.flush()

            db.add(CapsuleSection(capsule_id=capsule.id, section_type=SectionType.SUMMARY, sequence_no=1, content_json={"explanation": std_exp}))
            db.add(CapsuleSection(capsule_id=capsule.id, section_type=SectionType.KEY_POINTS, sequence_no=2, content_json={"points": points, "objectives": ["Understand core mechanics", "Analyze real tradeoffs"]}))
            db.add(CapsuleSection(capsule_id=capsule.id, section_type=SectionType.SIMPLE_EXPLANATION, sequence_no=3, content_json={"simple_explanation": simp_exp}))
            db.add(CapsuleSection(capsule_id=capsule.id, section_type=SectionType.EXAMPLE, sequence_no=4, content_json={"example": example}))
            db.add(CapsuleSection(capsule_id=capsule.id, section_type=SectionType.RECAP, sequence_no=5, content_json={"recap_question": "Why is regularized loss preferred over unregularized empirical error?"}))

            # Add video placeholder
            db.add(Video(
                capsule_id=capsule.id,
                script=f"Welcome to this 90-second micro-lesson on {topic_obj.title}.\nScene 1: Introduction to {cap_title}.\nScene 2: Mathematical mechanics.\nScene 3: Real world applications and wrap-up.",
                storage_key="videos/sample_micro_lesson.mp4",
                duration_seconds=90,
                status=VideoStatus.READY,
            ))

        db.commit()

        # --- Quizzes ---
        print("📝 Creating Topic Assessment Quizzes...")
        # Quiz for Topic 1
        q1 = Quiz(topic_id=t1.id, type=QuizType.QUICK, title="Math Foundations Knowledge Check", pass_score=70.0, status=CourseStatus.PUBLISHED, version=1)
        db.add(q1)
        db.flush()

        qq1 = QuizQuestion(quiz_id=q1.id, question_text="What does a gradient vector represent in multivariate calculus?", difficulty=DifficultyLevel.EASY, explanation="The gradient vector points in the direction of greatest rate of increase of the function.", sequence_no=1, marks=1.0)
        db.add(qq1)
        db.flush()
        db.add(QuizOption(question_id=qq1.id, option_text="Direction of steepest ascent of the cost function", is_correct=True, sequence_no=1))
        db.add(QuizOption(question_id=qq1.id, option_text="The global minimum scalar value", is_correct=False, sequence_no=2))
        db.add(QuizOption(question_id=qq1.id, option_text="The determinant of the input matrix", is_correct=False, sequence_no=3))
        db.add(QuizOption(question_id=qq1.id, option_text="The number of training samples", is_correct=False, sequence_no=4))

        qq2 = QuizQuestion(quiz_id=q1.id, question_text="Why do we subtract the gradient during parameter updates in gradient descent?", difficulty=DifficultyLevel.MEDIUM, explanation="Subtracting the gradient steps in the direction of steepest descent to minimize loss.", sequence_no=2, marks=1.0)
        db.add(qq2)
        db.flush()
        db.add(QuizOption(question_id=qq2.id, option_text="To step in the direction of steepest descent (minimizing error)", is_correct=True, sequence_no=1))
        db.add(QuizOption(question_id=qq2.id, option_text="To increase model parameters exponentially", is_correct=False, sequence_no=2))
        db.add(QuizOption(question_id=qq2.id, option_text="To invert the Hessian matrix directly", is_correct=False, sequence_no=3))
        db.add(QuizOption(question_id=qq2.id, option_text="To remove negative numbers from the dataset", is_correct=False, sequence_no=4))

        # Quiz for Topic 2
        q2 = Quiz(topic_id=t2.id, type=QuizType.QUICK, title="Linear & Logistic Regression Checkpoint", pass_score=70.0, status=CourseStatus.PUBLISHED, version=1)
        db.add(q2)
        db.flush()

        qq3 = QuizQuestion(quiz_id=q2.id, question_text="Which activation function maps real numbers into a (0, 1) probability range?", difficulty=DifficultyLevel.EASY, explanation="The Sigmoid function 1 / (1 + e^-z) maps values to the range (0, 1).", sequence_no=1, marks=1.0)
        db.add(qq3)
        db.flush()
        db.add(QuizOption(question_id=qq3.id, option_text="Sigmoid function", is_correct=True, sequence_no=1))
        db.add(QuizOption(question_id=qq3.id, option_text="ReLU", is_correct=False, sequence_no=2))
        db.add(QuizOption(question_id=qq3.id, option_text="Identity function", is_correct=False, sequence_no=3))
        db.add(QuizOption(question_id=qq3.id, option_text="Leaky ReLU", is_correct=False, sequence_no=4))

        qq4 = QuizQuestion(quiz_id=q2.id, question_text="What is the primary difference between L1 (Lasso) and L2 (Ridge) regularization?", difficulty=DifficultyLevel.HARD, explanation="L1 penalizes absolute weights promoting sparsity, while L2 penalizes squared weights.", sequence_no=2, marks=1.0)
        db.add(qq4)
        db.flush()
        db.add(QuizOption(question_id=qq4.id, option_text="L1 encourages sparse weights (feature selection), while L2 shrinks weights smoothly.", is_correct=True, sequence_no=1))
        db.add(QuizOption(question_id=qq4.id, option_text="L1 is only used for image classification.", is_correct=False, sequence_no=2))
        db.add(QuizOption(question_id=qq4.id, option_text="L2 completely zeros out 80% of parameters.", is_correct=False, sequence_no=3))
        db.add(QuizOption(question_id=qq4.id, option_text="There is no mathematical difference.", is_correct=False, sequence_no=4))

        # Quiz for Topic 3
        q3 = Quiz(topic_id=t3.id, type=QuizType.QUICK, title="Backpropagation & Neural Nets Quiz", pass_score=70.0, status=CourseStatus.PUBLISHED, version=1)
        db.add(q3)
        db.flush()

        qq5 = QuizQuestion(quiz_id=q3.id, question_text="What mathematical rule forms the computational backbone of backpropagation?", difficulty=DifficultyLevel.MEDIUM, explanation="The chain rule allows compounding derivatives across composite functions.", sequence_no=1, marks=1.0)
        db.add(qq5)
        db.flush()
        db.add(QuizOption(question_id=qq5.id, option_text="The Chain Rule", is_correct=True, sequence_no=1))
        db.add(QuizOption(question_id=qq5.id, option_text="L'Hopital's Rule", is_correct=False, sequence_no=2))
        db.add(QuizOption(question_id=qq5.id, option_text="Fourier Transform", is_correct=False, sequence_no=3))
        db.add(QuizOption(question_id=qq5.id, option_text="Bayes' Theorem", is_correct=False, sequence_no=4))

        # Quiz for Topic 4
        q4 = Quiz(topic_id=t4.id, type=QuizType.QUICK, title="Optimization & Modern Regularization Quiz", pass_score=70.0, status=CourseStatus.PUBLISHED, version=1)
        db.add(q4)
        db.flush()

        qq6 = QuizQuestion(quiz_id=q4.id, question_text="How does Dropout regularize deep neural networks during training?", difficulty=DifficultyLevel.MEDIUM, explanation="Dropout randomly zeroes out activations during training to prevent co-adaptation.", sequence_no=1, marks=1.0)
        db.add(qq6)
        db.flush()
        db.add(QuizOption(question_id=qq6.id, option_text="By randomly deactivating neurons with probability p during forward passes", is_correct=True, sequence_no=1))
        db.add(QuizOption(question_id=qq6.id, option_text="By permanently deleting weights from disk", is_correct=False, sequence_no=2))
        db.add(QuizOption(question_id=qq6.id, option_text="By decreasing the batch size dynamically", is_correct=False, sequence_no=3))
        db.add(QuizOption(question_id=qq6.id, option_text="By skipping backpropagation on odd iterations", is_correct=False, sequence_no=4))

        db.commit()

        # --- Student 1 (Alex - Strong Learner) Attempts & Performance ---
        print("🎯 Simulating Student 1 (Strong) Attempts & Mastery...")
        att1 = QuizAttempt(
            quiz_id=q1.id,
            student_id=student1.id,
            attempt_no=1,
            started_at=now - timedelta(days=5),
            submitted_at=now - timedelta(days=5, minutes=10),
            score=2.0,
            percentage=100.0,
            time_taken_seconds=180,
            status=AttemptStatus.SUBMITTED,
        )
        db.add(att1)
        db.flush()
        db.add(QuizAnswer(attempt_id=att1.id, question_id=qq1.id, selected_option_id=qq1.options[0].id, is_correct=True, marks_awarded=1.0))
        db.add(QuizAnswer(attempt_id=att1.id, question_id=qq2.id, selected_option_id=qq2.options[0].id, is_correct=True, marks_awarded=1.0))

        att2 = QuizAttempt(
            quiz_id=q2.id,
            student_id=student1.id,
            attempt_no=1,
            started_at=now - timedelta(days=2),
            submitted_at=now - timedelta(days=2, minutes=8),
            score=2.0,
            percentage=100.0,
            time_taken_seconds=220,
            status=AttemptStatus.SUBMITTED,
        )
        db.add(att2)
        db.flush()
        db.add(QuizAnswer(attempt_id=att2.id, question_id=qq3.id, selected_option_id=qq3.options[0].id, is_correct=True, marks_awarded=1.0))
        db.add(QuizAnswer(attempt_id=att2.id, question_id=qq4.id, selected_option_id=qq4.options[0].id, is_correct=True, marks_awarded=1.0))

        # Topic 1 Performance (Strong)
        db.add(StudentTopicPerformance(
            student_id=student1.id,
            topic_id=t1.id,
            mastery_score=92.5,
            confidence_score=85.0,
            strength_status=StrengthStatus.STRONG,
            attempt_count=1,
            recent_accuracy=100.0,
            completion_quality=100.0,
            last_assessed_at=now - timedelta(days=5),
        ))
        # Topic 2 Performance (Strong)
        db.add(StudentTopicPerformance(
            student_id=student1.id,
            topic_id=t2.id,
            mastery_score=89.0,
            confidence_score=85.0,
            strength_status=StrengthStatus.STRONG,
            attempt_count=1,
            recent_accuracy=100.0,
            completion_quality=100.0,
            last_assessed_at=now - timedelta(days=2),
        ))
        # Student 1 Progress
        db.add(StudentProgress(student_id=student1.id, course_id=course.id, topic_id=t1.id, completion_percent=100.0, time_spent_seconds=600))
        db.add(StudentProgress(student_id=student1.id, course_id=course.id, topic_id=t2.id, completion_percent=100.0, time_spent_seconds=750))

        # Student 1 Recommendation: Unlock Next Topic (Topic 3)
        db.add(Recommendation(
            student_id=student1.id,
            course_id=course.id,
            topic_id=t3.id,
            recommendation_type=RecommendationType.NEXT_TOPIC,
            priority=95.0,
            reason_code="MASTERY_EXCEEDED_PROGRESS",
            explanation=f"Outstanding! You demonstrated 89% mastery on 'Linear & Logistic Regression'. Ready to unlock Topic 3: '{t3.title}'.",
            generated_by="RULE_ENGINE_V1",
            status=RecommendationStatus.ACTIVE,
        ))

        # --- Student 2 (Sophia - Needs Support) Attempts & Performance ---
        print("🎯 Simulating Student 2 (Needs Support) Attempts & Mastery...")
        att_s2 = QuizAttempt(
            quiz_id=q2.id,
            student_id=student2.id,
            attempt_no=1,
            started_at=now - timedelta(days=1),
            submitted_at=now - timedelta(days=1, minutes=12),
            score=0.0,
            percentage=0.0,
            time_taken_seconds=310,
            status=AttemptStatus.SUBMITTED,
        )
        db.add(att_s2)
        db.flush()
        db.add(QuizAnswer(attempt_id=att_s2.id, question_id=qq3.id, selected_option_id=qq3.options[1].id, is_correct=False, marks_awarded=0.0))
        db.add(QuizAnswer(attempt_id=att_s2.id, question_id=qq4.id, selected_option_id=qq4.options[1].id, is_correct=False, marks_awarded=0.0))

        # Topic 1 Performance for Student 2 (Moderate baseline)
        db.add(StudentTopicPerformance(
            student_id=student2.id,
            topic_id=t1.id,
            mastery_score=68.0,
            confidence_score=70.0,
            strength_status=StrengthStatus.DEVELOPING,
            attempt_count=1,
            recent_accuracy=70.0,
            completion_quality=80.0,
            last_assessed_at=now - timedelta(days=3),
        ))
        # Topic 2 Performance for Student 2 (Needs Support)
        db.add(StudentTopicPerformance(
            student_id=student2.id,
            topic_id=t2.id,
            mastery_score=38.5,
            confidence_score=65.0,
            strength_status=StrengthStatus.NEEDS_SUPPORT,
            attempt_count=1,
            recent_accuracy=0.0,
            completion_quality=50.0,
            last_assessed_at=now - timedelta(days=1),
        ))
        db.add(StudentProgress(student_id=student2.id, course_id=course.id, topic_id=t1.id, completion_percent=80.0, time_spent_seconds=500))
        db.add(StudentProgress(student_id=student2.id, course_id=course.id, topic_id=t2.id, completion_percent=40.0, time_spent_seconds=340))

        # Student 2 Recommendation: Simplified Capsule & Prerequisite Review
        db.add(Recommendation(
            student_id=student2.id,
            course_id=course.id,
            topic_id=t2.id,
            recommendation_type=RecommendationType.SIMPLIFIED_CAPSULE,
            priority=98.0,
            reason_code="LOW_MASTERY_SIMPLIFIED_REVIEW",
            explanation="Your recent quiz score on 'Linear & Logistic Regression' indicates foundational gaps. We prepared a simplified, step-by-step breakdown.",
            generated_by="RULE_ENGINE_V1",
            status=RecommendationStatus.ACTIVE,
        ))

        # --- Learning Paths ---
        print("🗺️ Building Personalized Learning Paths...")
        path1 = LearningPath(student_id=student1.id, course_id=course.id, version=1, status=EnrollmentStatus.ACTIVE)
        db.add(path1)
        db.flush()
        db.add(LearningPathItem(path_id=path1.id, topic_id=t1.id, position=1, activity_type="CAPSULE", status=EnrollmentStatus.COMPLETED, reason_code="Mastery demonstrated"))
        db.add(LearningPathItem(path_id=path1.id, topic_id=t2.id, position=2, activity_type="CAPSULE", status=EnrollmentStatus.COMPLETED, reason_code="Mastery demonstrated"))
        db.add(LearningPathItem(path_id=path1.id, topic_id=t3.id, position=3, activity_type="CAPSULE", status=EnrollmentStatus.ACTIVE, reason_code="Recommended next module"))
        db.add(LearningPathItem(path_id=path1.id, topic_id=t4.id, position=4, activity_type="CAPSULE", status=EnrollmentStatus.ACTIVE, reason_code="Upcoming module"))

        path2 = LearningPath(student_id=student2.id, course_id=course.id, version=1, status=EnrollmentStatus.ACTIVE)
        db.add(path2)
        db.flush()
        db.add(LearningPathItem(path_id=path2.id, topic_id=t1.id, position=1, activity_type="CAPSULE", status=EnrollmentStatus.COMPLETED, reason_code="Foundations baseline"))
        db.add(LearningPathItem(path_id=path2.id, topic_id=t2.id, position=2, activity_type="SIMPLIFIED_CAPSULE", status=EnrollmentStatus.ACTIVE, reason_code="Remediation active - simplified review"))
        db.add(LearningPathItem(path_id=path2.id, topic_id=t3.id, position=3, activity_type="CAPSULE", status=EnrollmentStatus.ACTIVE, reason_code="Locked: Complete prerequisite t2"))
        db.add(LearningPathItem(path_id=path2.id, topic_id=t4.id, position=4, activity_type="CAPSULE", status=EnrollmentStatus.ACTIVE, reason_code="Locked: Complete prerequisite t3"))

        db.commit()
        print("✅ Database seeding completed successfully!")
        print("\n✨ Ready to test with demo accounts:")
        print("   - Admin:   admin@learnflow.edu    / AdminPass123!")
        print("   - Trainer: trainer@learnflow.edu  / TrainerPass123!")
        print("   - Student: student1@learnflow.edu / StudentPass123! (Strong: Topic 3 recommended)")
        print("   - Student: student2@learnflow.edu / StudentPass123! (Needs Support: Simplified Topic 2 recommended)")

    except Exception as e:
        db.rollback()
        print(f"❌ Error during seed: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
