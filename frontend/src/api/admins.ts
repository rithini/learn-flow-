import { apiClient } from './client';
import { AdminDashboardData, User, Course } from '../types';
import { mockAdminDashboard, mockUsers, mockCourse } from './mockData';

export const adminApi = {
  getDashboard: async (): Promise<AdminDashboardData> => {
    try {
      const res = await apiClient.get<AdminDashboardData>('/admin/dashboard');
      return res.data;
    } catch {
      return mockAdminDashboard;
    }
  },

  getUsers: async (): Promise<User[]> => {
    try {
      const res = await apiClient.get<User[]>('/admin/users');
      return res.data;
    } catch {
      return Object.values(mockUsers);
    }
  },

  updateUserStatus: async (userId: string, payload: { is_active?: boolean; role?: string }): Promise<User> => {
    const res = await apiClient.patch<User>(`/admin/users/${userId}`, payload);
    return res.data;
  },

  getCourses: async (): Promise<Course[]> => {
    try {
      const res = await apiClient.get<Course[]>('/admin/courses');
      return res.data;
    } catch {
      return [mockCourse];
    }
  },

  updateCourseStatus: async (courseId: string, status: string): Promise<Course> => {
    const res = await apiClient.patch<Course>(`/admin/courses/${courseId}?status=${status}`);
    return res.data;
  },

  getAuditLogs: async (): Promise<Array<{ id: string; action: string; entity_type: string; entity_id?: string | null; timestamp: string }>> => {
    try {
      const res = await apiClient.get('/admin/audit-logs');
      return res.data;
    } catch {
      return mockAdminDashboard.recent_audit_logs;
    }
  },
};
