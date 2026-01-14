import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist, createJSONStorage } from 'zustand/middleware';

type UserData = App.Data.User.UserData;

interface AuthState {
  user: UserData | null;
  token: string | null;
  hydrated: boolean;
  loading: boolean;
}

interface AuthActions {
  setUser: (user: UserData) => void;
  clearUser: () => void;
  setToken: (token: string) => void;
  clearToken: () => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  immer(
    persist(
      (set, get) => ({
        // State
        user: null,
        token: null,
        hydrated: false,
        loading: false,

        // Actions
        setUser: (user) =>
          set((state) => {
            state.user = user;
          }),

        clearUser: () =>
          set((state) => {
            state.user = null;
          }),

        setToken: (token) =>
          set((state) => {
            state.token = token;
          }),

        clearToken: () =>
          set((state) => {
            state.token = null;
          }),

        setLoading: (loading) =>
          set((state) => {
            state.loading = loading;
          }),

        logout: () =>
          set((state) => {
            state.user = null;
            state.token = null;
          }),

        isAuthenticated: () => !!get().token,

        isAdmin: () => get().user?.role === 'admin',
      }),
      {
        name: 'admin-auth-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          user: state.user,
          token: state.token,
        }),
        onRehydrateStorage: () => () => {
          // Always set hydrated to true after rehydration attempt
          useAuthStore.setState({ hydrated: true });
        },
      },
    ),
  ),
);

/**
 * Hook to use auth state reactively
 */
export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);
  const loading = useAuthStore((state) => state.loading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const logout = useAuthStore((state) => state.logout);

  return {
    user,
    token,
    hydrated,
    loading,
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
    logout,
  };
}
