export type UserRole = 'ADMIN' | 'TRAINER' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  student_code?: string | null;
  institution_name?: string | null;
  current_level?: string | null;
  employee_code?: string | null;
  department?: string | null;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type TopicStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'DROPPED';
export type MaterialStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type CapsuleLevel = 'BASIC' | 'STANDARD' | 'ADVANCED';
export type CapsuleStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';
export type SectionType = 'SUMMARY' | 'KEY_POINTS' | 'EXAMPLE' | 'SIMPLE_EXPLANATION' | 'PRACTICE' | 'RECAP';
export type QuizType = 'DIAGNOSTIC' | 'QUICK' | 'PRACTICE';
export type QuestionType = 'MCQ' | 'TRUE_FALSE';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';
export type StrengthStatus = 'STRONG' | 'DEVELOPING' | 'NEEDS_SUPPORT' | 'UNCERTAIN';
export type RecommendationType =
  | 'NEXT_TOPIC'
  | 'SIMPLIFIED_CAPSULE'
  | 'TARGETED_PRACTICE'
  | 'ADVANCED_PRACTICE'
  | 'PREREQUISITE_REVIEW'
  | 'CHECKPOINT';
export type RecommendationStatus = 'ACTIVE' | 'COMPLETED' | 'DISMISSED' | 'EXPIRED';

export interface Course {
  id: string;
  trainer_id: string;
  title: string;
  description?: string | null;
  thumbnail_url?: string | null;
  status: CourseStatus;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  topic_count: number;
  enrolled_count: number;
}

export interface Topic {
  id: string;
  course_id: string;
  parent_topic_id?: string | null;
  title: string;
  description?: string | null;
  sequence_no: number;
  estimated_minutes: number;
  status: TopicStatus;
  created_at: string;
  prerequisite_ids: string[];
  capsule_id?: string | null;
  quiz_id?: string | null;
}

export interface StudentTopicView {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  sequence_no: number;
  estimated_minutes: number;
  is_locked: boolean;
  lock_reason?: string | null;
  mastery_score: number;
  strength_status: StrengthStatus;
  has_completed_capsule: boolean;
  has_completed_quiz: boolean;
  capsule_id?: string | null;
  quiz_id?: string | null;
  prerequisite_ids: string[];
}

export interface CapsuleSection {
  id: string;
  capsule_id: string;
  section_type: SectionType;
  sequence_no: number;
  content_json: Record<string, any>;
}

export interface Video {
  id: string;
  capsule_id: string;
  script: string;
  duration_seconds: number;
  status: string;
  video_url?: string | null;
}

export interface LearningCapsule {
  id: string;
  topic_id: string;
  version: number;
  level: CapsuleLevel;
  title: string;
  status: CapsuleStatus;
  estimated_minutes: number;
  created_by: string;
  published_at?: string | null;
  created_at: string;
  sections: CapsuleSection[];
  video?: Video | null;
}

export interface QuizOptionPublic {
  id: string;
  option_text: string;
  sequence_no: number;
}

export interface QuizOptionTrainer {
  id?: string;
  option_text: string;
  is_correct: boolean;
  sequence_no: number;
}

export interface QuizQuestionPublic {
  id: string;
  question_text: string;
  question_type: QuestionType;
  difficulty: DifficultyLevel;
  sequence_no: number;
  marks: number;
  options: QuizOptionPublic[];
}

export interface QuizQuestionTrainer {
  id?: string;
  question_text: string;
  question_type: QuestionType;
  difficulty: DifficultyLevel;
  explanation?: string | null;
  sequence_no: number;
  marks: number;
  options: QuizOptionTrainer[];
}

export interface QuizDelivery {
  id: string;
  topic_id: string;
  type: QuizType;
  title: string;
  pass_score: number;
  status: CourseStatus;
  questions: QuizQuestionPublic[];
}

export interface QuizTrainer {
  id: string;
  topic_id: string;
  topic_title?: string | null;
  course_title?: string | null;
  type: QuizType;
  title: string;
  pass_score: number;
  status: CourseStatus;
  version: number;
  created_at: string;
  questions: QuizQuestionTrainer[];
}

export interface QuizCreateInput {
  topic_id: string;
  type: QuizType;
  title: string;
  pass_score: number;
  questions: Array<{
    question_text: string;
    question_type: QuestionType;
    difficulty: DifficultyLevel;
    explanation?: string;
    sequence_no: number;
    marks: number;
    options: Array<{
      option_text: string;
      is_correct: boolean;
      sequence_no: number;
    }>;
  }>;
}

export interface QuizUpdateInput {
  title?: string;
  pass_score?: number;
  status?: CourseStatus;
  questions?: Array<{
    question_text: string;
    question_type: QuestionType;
    difficulty: DifficultyLevel;
    explanation?: string;
    sequence_no: number;
    marks: number;
    options: Array<{
      option_text: string;
      is_correct: boolean;
      sequence_no: number;
    }>;
  }>;
}

export interface QuizAnswerSubmission {
  question_id: string;
  selected_option_id?: string | null;
  answer_text?: string | null;
}

export interface QuizAttemptSubmit {
  answers: QuizAnswerSubmission[];
  time_taken_seconds: number;
}

export interface QuizAnswerResult {
  question_id: string;
  question_text: string;
  selected_option_id?: string | null;
  correct_option_id?: string | null;
  is_correct: boolean;
  marks_awarded: number;
  explanation?: string | null;
  difficulty: DifficultyLevel;
}

export interface QuizAttemptResult {
  id: string;
  quiz_id: string;
  quiz_title: string;
  student_id: string;
  attempt_no: number;
  started_at: string;
  submitted_at?: string | null;
  score: number;
  percentage: number;
  pass_score: number;
  passed: boolean;
  time_taken_seconds: number;
  status: string;
  answers: QuizAnswerResult[];
  mastery_updated: number;
  strength_status: string;
  next_recommendation?: {
    id: string;
    recommendation_type: RecommendationType;
    reason_code: string;
    explanation: string;
    priority: number;
  } | null;
}

export interface Recommendation {
  id: string;
  student_id: string;
  course_id: string;
  topic_id?: string | null;
  topic_title?: string | null;
  course_title?: string | null;
  recommendation_type: RecommendationType;
  priority: number;
  reason_code: string;
  explanation: string;
  generated_by: string;
  status: RecommendationStatus;
  created_at: string;
  expires_at?: string | null;
}

export interface LearningPathItem {
  id: string;
  topic_id: string;
  topic_title: string;
  capsule_id?: string | null;
  quiz_id?: string | null;
  position: number;
  activity_type: string;
  status: EnrollmentStatus;
  reason_code?: string | null;
  mastery_score: number;
  estimated_minutes: number;
  difficulty?: DifficultyLevel | string;
  strength_status?: StrengthStatus;
  prerequisite_ids?: string[];
  prerequisite_titles?: string[];
  prerequisites_met?: boolean;
  is_locked?: boolean;
  lock_reason?: string | null;
  recommended_action?: 'STUDY' | 'QUIZ' | 'REMEDY' | 'ADVANCED' | 'LOCKED' | string;
}

export interface LearningPath {
  id: string;
  student_id: string;
  course_id: string;
  course_title: string;
  version: number;
  status: EnrollmentStatus;
  generated_at: string;
  pacing_mode?: 'SPRINT' | 'STANDARD' | 'DEEP_MASTERY' | string;
  estimated_total_minutes?: number;
  readiness_percentage?: number;
  completed_items_count?: number;
  total_items_count?: number;
  items: LearningPathItem[];
}

export interface StudentPerformance {
  student_id: string;
  topic_id: string;
  topic_title: string;
  course_id: string;
  course_title: string;
  mastery_score: number;
  confidence_score: number;
  strength_status: StrengthStatus;
  attempt_count: number;
  recent_accuracy: number;
  completion_quality: number;
  last_assessed_at?: string | null;
}

export interface ActivityTimelineEvent {
  id: string;
  event_type: 'QUIZ' | 'CAPSULE';
  title: string;
  topic_title: string;
  timestamp: string;
  time_spent_seconds: number;
  time_spent_formatted: string;
  score?: number | null;
  percentage: number;
  passed: boolean;
  badge_label: string;
  speed_pace: string;
}

export interface ActivityTimelineData {
  total_study_minutes: number;
  total_study_hours: number;
  average_session_minutes: number;
  efficiency_rating: string;
  streak_days: number;
  daily_velocity: Array<{
    day: string;
    date: string;
    minutes: number;
    accuracy: number;
    target: number;
  }>;
  events: ActivityTimelineEvent[];
}

export interface StudentDashboardData {
  student_name: string;
  current_level: string;
  overall_progress: number;
  streak_days: number;
  total_quizzes_taken: number;
  average_score: number;
  enrolled_courses_count: number;
  active_recommendation?: Recommendation | null;
  recent_recommendations: Recommendation[];
  weak_topics: StudentPerformance[];
  strong_topics: StudentPerformance[];
  recent_quiz_attempts: Array<{
    id: string;
    quiz_title: string;
    score: number;
    percentage: number;
    submitted_at?: string | null;
    passed: boolean;
  }>;
}

export interface TrainerDashboardData {
  total_courses: number;
  total_students: number;
  active_capsules_count: number;
  pending_drafts_count: number;
  average_quiz_score: number;
  difficult_topics: Array<{
    topic_id: string;
    topic_title: string;
    course_title: string;
    struggling_percent: number;
    average_mastery: number;
    total_students: number;
  }>;
  recent_student_activity: Array<{
    student_name: string;
    quiz_title: string;
    score: number;
    date: string;
  }>;
}

export interface CourseAnalyticsData {
  course_id: string;
  course_title: string;
  enrolled_students: number;
  completion_rate: number;
  average_score: number;
  median_score: number;
  topic_performance: Array<{
    topic_title: string;
    average_mastery: number;
    accuracy: number;
    student_count: number;
  }>;
  score_distribution: Array<{
    range: string;
    count: number;
  }>;
}

export interface AdminDashboardData {
  total_users: number;
  total_students: number;
  total_trainers: number;
  total_admins: number;
  total_courses: number;
  total_capsules: number;
  total_quizzes_taken: number;
  total_materials_processed: number;
  recent_audit_logs: Array<{
    id: string;
    action: string;
    entity_type: string;
    entity_id?: string | null;
    timestamp: string;
  }>;
  system_health: Record<string, string>;
}

export interface Material {
  id: string;
  course_id: string;
  topic_id?: string | null;
  uploaded_by: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  status: MaterialStatus;
  created_at: string;
  chunk_count: number;
}
