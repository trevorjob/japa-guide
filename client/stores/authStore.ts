import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/lib/services';
import { setAuthTokens, getAccessToken } from '@/lib/api';
import type { User, AuthTokens, LoginCredentials, RegisterData } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  claimSession: () => Promise<{ claimed_roadmaps: number }>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const tokens: AuthTokens = await authService.login(credentials);
          setAuthTokens(tokens);
          
          // Fetch user data
          const user = await authService.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.detail || 'Login failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const tokens: AuthTokens = await authService.register(data);
          setAuthTokens(tokens);
          
          // Fetch user data
          const user = await authService.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          set({ 
            error: error.response?.data?.detail || 'Registration failed', 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: () => {
        setAuthTokens(null);
        set({ user: null, isAuthenticated: false, error: null });
      },

      fetchUser: async () => {
        const token = getAccessToken();
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        try {
          const user = await authService.getMe();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          // Token might be expired, clear auth
          setAuthTokens(null);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },

      claimSession: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await authService.claimSession();
          set({ isLoading: false });
          return result;
        } catch (error: any) {
          set({ 
            error: error.response?.data?.detail || 'Failed to claim session', 
            isLoading: false 
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        isAuthenticated: state.isAuthenticated,
        // Don't persist user data for security
      }),
    }
  )
);
