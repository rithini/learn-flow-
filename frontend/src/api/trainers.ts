import { apiClient } from './client';
import {
  TrainerDashboardData,
  CourseAnalyticsData,
  Course,
  Topic,
  Material,
} from '../types';
import { mockTrainerDashboard, mockCourse, mockTopics } from './mockData';

export const trainerApi = {
  getDashboard: async (): Promise<TrainerDashboardData> => {
    try {
      const res = await apiClient.get<TrainerDashboardData>('/trainer/dashboard');
      return res.data;
    } catch {
      return mockTrainerDashboard;
    }
  },

  getCourses: async (): Promise<Course[]> => {
    try {
      const res = await apiClient.get<Course[]>('/trainer/courses');
      return res.data;
    } catch {
      return [mockCourse];
    }
  },

  createCourse: async (payload: { title: string; description?: string; thumbnail_url?: string }): Promise<Course> => {
    const res = await apiClient.post<Course>('/trainer/courses', payload);
    return res.data;
  },

  updateCourse: async (courseId: string, payload: Partial<Course>): Promise<Course> => {
    const res = await apiClient.patch<Course>(`/trainer/courses/${courseId}`, payload);
    return res.data;
  },

  getCourseTopics: async (courseId: string): Promise<Topic[]> => {
    try {
      const res = await apiClient.get<Topic[]>(`/trainer/courses/${courseId}/topics`);
      return res.data;
    } catch {
      return mockTopics;
    }
  },

  createTopic: async (courseId: string, payload: {
    title: string;
    description?: string;
    sequence_no: number;
    estimated_minutes: number;
    prerequisite_topic_ids: string[];
  }): Promise<Topic> => {
    const res = await apiClient.post<Topic>(`/trainer/courses/${courseId}/topics`, payload);
    return res.data;
  },

  updateTopic: async (topicId: string, payload: Partial<Topic>): Promise<Topic> => {
    const res = await apiClient.patch<Topic>(`/trainer/topics/${topicId}`, payload);
    return res.data;
  },

  uploadMaterial: async (formData: FormData): Promise<{ job_id: string; message: string }> => {
    const res = await apiClient.post('/trainer/materials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getMaterials: async (courseId?: string): Promise<Material[]> => {
    const url = courseId ? `/trainer/materials?course_id=${courseId}` : '/trainer/materials';
    try {
      const res = await apiClient.get<Material[]>(url);
      return res.data;
    } catch {
      return [
        {
          id: 'mat-1',
          course_id: 'crs-ml-101',
          topic_id: 'top-1',
          uploaded_by: 'usr-trainer-01',
          original_name: 'CS_ML_LectureNotes_Ch1_4.pdf',
          mime_type: 'application/pdf',
          size_bytes: 4280000,
          status: 'COMPLETED',
          created_at: '2026-08-16T10:00:00Z',
          chunk_count: 32,
        },
      ];
    }
  },

  requestAIGeneration: async (topicId: string, payload: {
    generation_type: string;
    level?: string;
    difficulty?: string;
    question_count?: number;
  }): Promise<{ job_id: string; message: string }> => {
    const res = await apiClient.post(`/trainer/topics/${topicId}/generations`, payload);
    return res.data;
  },

  getCourseAnalytics: async (courseId: string): Promise<CourseAnalyticsData> => {
    try {
      const res = await apiClient.get<CourseAnalyticsData>(`/trainer/courses/${courseId}/analytics`);
      return res.data;
    } catch {
      return {
        course_id: courseId,
        course_title: 'Introduction to Machine Learning & Neural Networks',
        enrolled_students: 24,
        completion_rate: 72.0,
        average_score: 82.5,
        median_score: 85.0,
        topic_performance: [
          { topic_title: '1. Mathematical Foundations', average_mastery: 91.0, accuracy: 92.5, student_count: 24 },
          { topic_title: '2. Linear & Logistic Regression', average_mastery: 74.2, accuracy: 76.0, student_count: 24 },
          { topic_title: '3. Neural Networks & Backprop', average_mastery: 68.0, accuracy: 69.5, student_count: 18 },
          { topic_title: '4. Optimization & Regularization', average_mastery: 84.0, accuracy: 85.0, student_count: 12 },
        ],
        score_distribution: [
          { range: '0-49% (Needs Support)', count: 3 },
          { range: '50-79% (Developing)', count: 9 },
          { range: '80-100% (Strong)', count: 12 },
        ],
      };
    }
  },
};
