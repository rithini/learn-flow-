import { apiClient } from './client';
import {
  StudentDashboardData,
  Course,
  StudentTopicView,
  Recommendation,
  LearningPath,
  StudentPerformance,
} from '../types';
import {
  mockStudentDashboard,
  mockCourse,
  mockStudentTopicsView,
  mockCourse as sampleCourse,
} from './mockData';

export const studentApi = {
  getDashboard: async (): Promise<StudentDashboardData> => {
    try {
      const res = await apiClient.get<StudentDashboardData>('/students/me/dashboard');
      return res.data;
    } catch {
      return mockStudentDashboard;
    }
  },

  getMyCourses: async (): Promise<Course[]> => {
    try {
      const res = await apiClient.get<Course[]>('/students/me/courses');
      return res.data;
    } catch {
      return [mockCourse];
    }
  },

  getCourseStudentView: async (courseId: string): Promise<StudentTopicView[]> => {
    try {
      const res = await apiClient.get<StudentTopicView[]>(`/courses/${courseId}/student-view`);
      return res.data;
    } catch {
      return mockStudentTopicsView;
    }
  },

  getRecommendations: async (courseId?: string): Promise<Recommendation[]> => {
    try {
      const url = courseId ? `/students/me/recommendations?course_id=${courseId}` : '/students/me/recommendations';
      const res = await apiClient.get<Recommendation[]>(url);
      return res.data;
    } catch {
      return mockStudentDashboard.recent_recommendations;
    }
  },

  getLearningPath: async (courseId: string): Promise<LearningPath | null> => {
    try {
      const res = await apiClient.get<LearningPath>(`/students/me/learning-path?course_id=${courseId}`);
      return res.data;
    } catch {
      return {
        id: 'lp-1',
        student_id: 'usr-student-01',
        course_id: courseId,
        course_title: 'Introduction to Machine Learning & Neural Networks',
        version: 1,
        status: 'ACTIVE',
        generated_at: new Date().toISOString(),
        pacing_mode: 'STANDARD',
        estimated_total_minutes: 45,
        readiness_percentage: 68.5,
        completed_items_count: 2,
        total_items_count: 4,
        items: [
          {
            id: 'lpi-1',
            topic_id: 'top-1',
            topic_title: '1. Mathematical Foundations for Machine Learning',
            capsule_id: 'cap-1',
            quiz_id: 'quiz-1',
            position: 1,
            activity_type: 'CAPSULE',
            status: 'COMPLETED',
            mastery_score: 92.5,
            estimated_minutes: 20,
            difficulty: 'EASY',
            strength_status: 'STRONG',
            prerequisite_ids: [],
            prerequisite_titles: [],
            prerequisites_met: true,
            is_locked: false,
            recommended_action: 'QUIZ',
            reason_code: 'Proficient - Mastered foundations',
          },
          {
            id: 'lpi-2',
            topic_id: 'top-2',
            topic_title: '2. Linear & Logistic Regression',
            capsule_id: 'cap-2',
            quiz_id: 'quiz-2',
            position: 2,
            activity_type: 'CAPSULE',
            status: 'COMPLETED',
            mastery_score: 89.0,
            estimated_minutes: 25,
            difficulty: 'EASY',
            strength_status: 'STRONG',
            prerequisite_ids: ['top-1'],
            prerequisite_titles: ['Mathematical Foundations'],
            prerequisites_met: true,
            is_locked: false,
            recommended_action: 'QUIZ',
            reason_code: 'Proficient - Checkpoint passed',
          },
          {
            id: 'lpi-3',
            topic_id: 'top-3',
            topic_title: '3. Neural Network Architecture & Backpropagation',
            capsule_id: 'cap-3',
            quiz_id: 'quiz-3',
            position: 3,
            activity_type: 'CAPSULE',
            status: 'ACTIVE',
            mastery_score: 42.0,
            estimated_minutes: 30,
            difficulty: 'HARD',
            strength_status: 'NEEDS_SUPPORT',
            prerequisite_ids: ['top-2'],
            prerequisite_titles: ['Linear & Logistic Regression'],
            prerequisites_met: true,
            is_locked: false,
            recommended_action: 'REMEDY',
            reason_code: 'Developing - Targeted reinforcement active',
          },
          {
            id: 'lpi-4',
            topic_id: 'top-4',
            topic_title: '4. Deep Learning Optimization & Regularization',
            capsule_id: 'cap-4',
            quiz_id: 'quiz-4',
            position: 4,
            activity_type: 'CAPSULE',
            status: 'ACTIVE',
            mastery_score: 0.0,
            estimated_minutes: 35,
            difficulty: 'MEDIUM',
            strength_status: 'UNCERTAIN',
            prerequisite_ids: ['top-3'],
            prerequisite_titles: ['Neural Network Architecture & Backpropagation'],
            prerequisites_met: false,
            is_locked: true,
            lock_reason: 'Prerequisite required: Neural Network Architecture & Backpropagation',
            recommended_action: 'LOCKED',
            reason_code: 'Upcoming module',
          },
        ],
      };
    }
  },

  recalibrateLearningPath: async (courseId: string, pacingMode: string = 'STANDARD'): Promise<LearningPath> => {
    try {
      const res = await apiClient.post<LearningPath>('/students/me/learning-path/recalibrate', {
        course_id: courseId,
        pacing_mode: pacingMode,
      });
      return res.data;
    } catch {
      const current = await studentApi.getLearningPath(courseId);
      if (current) {
        return {
          ...current,
          version: (current.version || 1) + 1,
          pacing_mode: pacingMode,
          generated_at: new Date().toISOString(),
        };
      }
      throw new Error('Failed to recalibrate');
    }
  },

  getPerformance: async (courseId?: string): Promise<StudentPerformance[]> => {
    try {
      const url = courseId ? `/students/me/performance?course_id=${courseId}` : '/students/me/performance';
      const res = await apiClient.get<StudentPerformance[]>(url);
      return res.data;
    } catch {
      return mockStudentDashboard.strong_topics;
    }
  },

  getActivityTimeline: async (): Promise<import('../types').ActivityTimelineData> => {
    try {
      const res = await apiClient.get<import('../types').ActivityTimelineData>('/students/me/activity-timeline');
      return res.data;
    } catch {
      return {
        total_study_minutes: 245,
        total_study_hours: 4.1,
        average_session_minutes: 18.2,
        efficiency_rating: 'Top 10% Velocity (94% Efficiency)',
        streak_days: 4,
        daily_velocity: [
          { day: 'Mon', date: 'Sep 06', minutes: 25, accuracy: 90, target: 20 },
          { day: 'Tue', date: 'Sep 07', minutes: 35, accuracy: 95, target: 20 },
          { day: 'Wed', date: 'Sep 08', minutes: 15, accuracy: 80, target: 20 },
          { day: 'Thu', date: 'Sep 09', minutes: 40, accuracy: 100, target: 20 },
          { day: 'Fri', date: 'Sep 10', minutes: 30, accuracy: 85, target: 20 },
          { day: 'Sat', date: 'Sep 11', minutes: 50, accuracy: 92, target: 20 },
          { day: 'Sun', date: 'Sep 12', minutes: 20, accuracy: 88, target: 20 },
        ],
        events: [
          {
            id: 'evt-1',
            event_type: 'QUIZ',
            title: 'Completed Checkpoint: Linear & Logistic Regression',
            topic_title: '2. Linear & Logistic Regression',
            timestamp: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
            time_spent_seconds: 145,
            time_spent_formatted: '2m 25s',
            score: 2.0,
            percentage: 100.0,
            passed: true,
            badge_label: '100% Score',
            speed_pace: 'Fast Pace (High Retention)',
          },
          {
            id: 'evt-2',
            event_type: 'CAPSULE',
            title: 'Studied Capsule: Mathematical Foundations',
            topic_title: '1. Mathematical Foundations for Machine Learning',
            timestamp: new Date(Date.now() - 3600 * 1000 * 26).toISOString(),
            time_spent_seconds: 720,
            time_spent_formatted: '12m 00s',
            score: null,
            percentage: 100.0,
            passed: true,
            badge_label: '100% Read',
            speed_pace: 'Standard Module Pace',
          },
          {
            id: 'evt-3',
            event_type: 'QUIZ',
            title: 'Completed Checkpoint: Mathematical Foundations',
            topic_title: '1. Mathematical Foundations for Machine Learning',
            timestamp: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
            time_spent_seconds: 180,
            time_spent_formatted: '3m 00s',
            score: 2.0,
            percentage: 100.0,
            passed: true,
            badge_label: '100% Score',
            speed_pace: 'Standard Pace',
          },
          {
            id: 'evt-4',
            event_type: 'CAPSULE',
            title: 'Studied Capsule: Linear & Logistic Regression',
            topic_title: '2. Linear & Logistic Regression',
            timestamp: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
            time_spent_seconds: 960,
            time_spent_formatted: '16m 00s',
            score: null,
            percentage: 85.0,
            passed: false,
            badge_label: '85% Read',
            speed_pace: 'Deep Focus',
          },
        ],
      };
    }
  },

  updateProfile: async (payload: {
    full_name?: string;
    institution_name?: string;
    current_level?: string;
  }): Promise<import('../types').User> => {
    try {
      const res = await apiClient.put<import('../types').User>('/students/me/profile', payload);
      return res.data;
    } catch {
      return {
        id: 'usr-student-01',
        email: 'student1@learnflow.edu',
        full_name: payload.full_name || 'Alex Chen',
        role: 'STUDENT',
        is_active: true,
        student_code: 'STU-2026-001',
        institution_name: payload.institution_name || 'National Institute of Technology',
        current_level: payload.current_level || 'Senior Undergraduate',
      };
    }
  },
};
