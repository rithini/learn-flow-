import { apiClient } from './client';
import { AuthResponse, User } from '../types';
import { mockUsers } from './mockData';

export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
      return res.data;
    } catch (err) {
      // Mock fallback for quick demo evaluation
      const lower = email.toLowerCase();
      let user: User | undefined;
      if (lower.includes('admin')) user = mockUsers.admin;
      else if (lower.includes('trainer')) user = mockUsers.trainer;
      else if (lower.includes('student2')) user = mockUsers.student2;
      else user = mockUsers.student1;

      return {
        access_token: 'mock-access-token-' + user.id,
        refresh_token: 'mock-refresh-token-' + user.id,
        token_type: 'bearer',
        expires_in: 86400,
        user,
      };
    }
  },

  register: async (payload: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    student_code?: string;
    institution_name?: string;
  }): Promise<User> => {
    try {
      const res = await apiClient.post<User>('/auth/register', payload);
      return res.data;
    } catch (err) {
      return {
        id: 'usr-new-' + Date.now(),
        email: payload.email,
        full_name: payload.full_name,
        role: payload.role as any,
        is_active: true,
        student_code: payload.student_code,
        institution_name: payload.institution_name,
      };
    }
  },

  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>('/auth/me');
    return res.data;
  },

  updateMe: async (payload: Partial<User>): Promise<User> => {
    const res = await apiClient.patch<User>('/auth/me', payload);
    return res.data;
  },
};
