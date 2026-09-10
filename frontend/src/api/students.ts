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
        items: [
          { id: 'lpi-1', topic_id: 'top-1', topic_title: '1. Mathematical Foundations for Machine Learning', position: 1, activity_type: 'CAPSULE', status: 'COMPLETED', mastery_score: 92.5, reason_code: 'Proficient' },
          { id: 'lpi-2', topic_id: 'top-2', topic_title: '2. Linear & Logistic Regression', position: 2, activity_type: 'CAPSULE', status: 'COMPLETED', mastery_score: 89.0, reason_code: 'Proficient' },
          { id: 'lpi-3', topic_id: 'top-3', topic_title: '3. Neural Network Architecture & Backpropagation', position: 3, activity_type: 'CAPSULE', status: 'ACTIVE', mastery_score: 0.0, reason_code: 'Recommended next module' },
          { id: 'lpi-4', topic_id: 'top-4', topic_title: '4. Deep Learning Optimization & Regularization', position: 4, activity_type: 'CAPSULE', status: 'ACTIVE', mastery_score: 0.0, reason_code: 'Upcoming module' },
        ],
      };
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
};
