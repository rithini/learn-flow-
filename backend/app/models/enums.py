import enum


class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    TRAINER = "TRAINER"
    STUDENT = "STUDENT"


class CourseStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"


class TopicStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"


class EnrollmentStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    DROPPED = "DROPPED"


class MaterialStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class CapsuleLevel(str, enum.Enum):
    BASIC = "BASIC"
    STANDARD = "STANDARD"
    ADVANCED = "ADVANCED"


class CapsuleStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    REVIEW = "REVIEW"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"


class SectionType(str, enum.Enum):
    SUMMARY = "SUMMARY"
    KEY_POINTS = "KEY_POINTS"
    EXAMPLE = "EXAMPLE"
    SIMPLE_EXPLANATION = "SIMPLE_EXPLANATION"
    PRACTICE = "PRACTICE"
    RECAP = "RECAP"


class QuizType(str, enum.Enum):
    DIAGNOSTIC = "DIAGNOSTIC"
    QUICK = "QUICK"
    PRACTICE = "PRACTICE"


class QuestionType(str, enum.Enum):
    MCQ = "MCQ"
    TRUE_FALSE = "TRUE_FALSE"


class DifficultyLevel(str, enum.Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"


class AttemptStatus(str, enum.Enum):
    IN_PROGRESS = "IN_PROGRESS"
    SUBMITTED = "SUBMITTED"
    ABANDONED = "ABANDONED"


class StrengthStatus(str, enum.Enum):
    STRONG = "STRONG"
    DEVELOPING = "DEVELOPING"
    NEEDS_SUPPORT = "NEEDS_SUPPORT"
    UNCERTAIN = "UNCERTAIN"


class RecommendationType(str, enum.Enum):
    NEXT_TOPIC = "NEXT_TOPIC"
    SIMPLIFIED_CAPSULE = "SIMPLIFIED_CAPSULE"
    TARGETED_PRACTICE = "TARGETED_PRACTICE"
    ADVANCED_PRACTICE = "ADVANCED_PRACTICE"
    PREREQUISITE_REVIEW = "PREREQUISITE_REVIEW"
    CHECKPOINT = "CHECKPOINT"


class RecommendationStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    DISMISSED = "DISMISSED"
    EXPIRED = "EXPIRED"


class GenerationType(str, enum.Enum):
    TOPIC_EXTRACTION = "TOPIC_EXTRACTION"
    SUMMARY = "SUMMARY"
    CAPSULE = "CAPSULE"
    QUIZ = "QUIZ"
    VIDEO_SCRIPT = "VIDEO_SCRIPT"


class VideoStatus(str, enum.Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    READY = "READY"
    FAILED = "FAILED"
