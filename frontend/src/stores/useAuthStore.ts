import { create } from 'zustand';
import { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

const STORAGE_KEY_TOKEN = 'learnflow_token';
const STORAGE_KEY_REFRESH = 'learnflow_refresh';
const STORAGE_KEY_USER = 'learnflow_user';

export const useAuthStore = create<AuthState>((set) => {
  // Initialize from localStorage if present
  let initialUser: User | null = null;
  let initialToken = localStorage.getItem(STORAGE_KEY_TOKEN);
  let initialRefresh = localStorage.getItem(STORAGE_KEY_REFRESH);

  try {
    const storedUser = localStorage.getItem(STORAGE_KEY_USER);
    if (storedUser) {
      initialUser = JSON.parse(storedUser);
    }
  } catch (e) {
    console.error('Failed to parse cached user', e);
  }

  return {
    user: initialUser,
    token: initialToken,
    refreshToken: initialRefresh,
    isAuthenticated: !!(initialToken && initialUser),

    setAuth: (user: User, token: string, refreshToken: string) => {
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
      localStorage.setItem(STORAGE_KEY_REFRESH, refreshToken);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      set({ user, token, refreshToken, isAuthenticated: true });
    },

    updateUser: (updatedFields: Partial<User>) => {
      set((state) => {
        if (!state.user) return state;
        const newUser = { ...state.user, ...updatedFields };
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
        return { user: newUser };
      });
    },

    logout: () => {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_REFRESH);
      localStorage.removeItem(STORAGE_KEY_USER);
      set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
    },
  };
});
