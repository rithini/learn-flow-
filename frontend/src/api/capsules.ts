import { apiClient } from './client';
import { LearningCapsule } from '../types';
import { mockCapsule } from './mockData';

export const capsuleApi = {
  getStudentCapsule: async (capsuleId: string): Promise<LearningCapsule> => {
    try {
      const res = await apiClient.get<LearningCapsule>(`/capsules/${capsuleId}`);
      return res.data;
    } catch {
      return mockCapsule;
    }
  },

  getTrainerCapsule: async (capsuleId: string): Promise<LearningCapsule> => {
    try {
      const res = await apiClient.get<LearningCapsule>(`/trainer/capsules/${capsuleId}`);
      return res.data;
    } catch {
      return mockCapsule;
    }
  },

  updateTrainerCapsule: async (capsuleId: string, payload: Partial<LearningCapsule>): Promise<LearningCapsule> => {
    const res = await apiClient.patch<LearningCapsule>(`/trainer/capsules/${capsuleId}`, payload);
    return res.data;
  },

  publishCapsule: async (capsuleId: string): Promise<LearningCapsule> => {
    const res = await apiClient.post<LearningCapsule>(`/trainer/capsules/${capsuleId}/publish`);
    return res.data;
  },

  recordProgress: async (capsuleId: string, payload: {
    completion_percent: number;
    time_spent_seconds: number;
  }): Promise<{ message: string }> => {
    const res = await apiClient.post(`/capsules/${capsuleId}/progress`, payload);
    return res.data;
  },

  generateVideo: async (capsuleId: string): Promise<{ job_id: string; message: string }> => {
    const res = await apiClient.post(`/trainer/capsules/${capsuleId}/video`);
    return res.data;
  },
};
