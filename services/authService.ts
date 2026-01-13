import { api } from '@/lib/api/client';
import { useAuthStore } from '@/stores/useAuthStore';

type UserData = App.Data.User.UserData;
type LoginResponse = Api.Response.Login;
type SingleUser = Api.Response.Single<UserData>;

interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Auth service - handles authentication operations
 * Non-reactive singleton that can be used outside React components
 */
export const Auth = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<UserData> {
    const store = useAuthStore.getState();
    store.setLoading(true);

    try {
      // Get token from API
      const response = await api.post<LoginResponse>('/auth/token', credentials);
      const token = response.token;

      // Store token
      store.setToken(token);

      // Set cookie for middleware (httpOnly would be better in production)
      document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Lax`;

      // Fetch user data
      const userResponse = await api.get<SingleUser>('/auth/token/user');
      const user = userResponse.item;

      // Verify user is admin
      if (user.role !== 'admin') {
        // Clear everything if not admin
        store.logout();
        document.cookie = 'auth-token=; path=/; max-age=0';
        throw new Error('Access denied. Admin privileges required.');
      }

      store.setUser(user);
      return user;
    } finally {
      store.setLoading(false);
    }
  },

  /**
   * Logout - clear token and user
   */
  async logout(): Promise<void> {
    const store = useAuthStore.getState();

    try {
      // Call API to delete token
      await api.destroy('/auth/token');
    } catch {
      // Ignore errors during logout
    } finally {
      // Clear local state
      store.logout();
      // Clear cookie
      document.cookie = 'auth-token=; path=/; max-age=0';
    }
  },

  /**
   * Refresh user data from server
   */
  async refresh(): Promise<UserData | null> {
    const store = useAuthStore.getState();

    if (!store.token) {
      return null;
    }

    try {
      const response = await api.get<SingleUser>('/auth/token/user');
      const user = response.item;

      // Verify still admin
      if (user.role !== 'admin') {
        store.logout();
        document.cookie = 'auth-token=; path=/; max-age=0';
        return null;
      }

      store.setUser(user);
      return user;
    } catch {
      // Token may be invalid
      store.logout();
      document.cookie = 'auth-token=; path=/; max-age=0';
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  check(): boolean {
    return useAuthStore.getState().isAuthenticated();
  },

  /**
   * Check if user is admin
   */
  checkAdmin(): boolean {
    return useAuthStore.getState().isAdmin();
  },

  /**
   * Get current user
   */
  user(): UserData | null {
    return useAuthStore.getState().user;
  },

  /**
   * Get current token
   */
  token(): string | null {
    return useAuthStore.getState().token;
  },
};
