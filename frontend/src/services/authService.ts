import api from '../lib/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: string[];
  allergies?: string[];
  medications?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authService = {
  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/api/users/login', credentials);
    const { access_token, user } = response.data;
    
    // Store token and user data
    localStorage.setItem('auth_token', access_token);
    localStorage.setItem('user_data', JSON.stringify(user));
    
    return response.data;
  },

  // Register new user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/api/users/register', userData);
    const { access_token, user } = response.data;
    
    // Store token and user data
    localStorage.setItem('auth_token', access_token);
    localStorage.setItem('user_data', JSON.stringify(user));
    
    return response.data;
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await api.post('/api/users/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    const response = await api.get('/api/users/profile');
    return response.data;
  },

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.patch('/api/users/profile', userData);
    
    // Update stored user data
    const updatedUser = response.data;
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
    
    return updatedUser;
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  // Get stored user data
  getCurrentUser(): User | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  // Reset password
  async resetPassword(email: string): Promise<void> {
    await api.post('/api/users/reset-password', { email });
  },

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    await api.post('/api/users/verify-email', { token });
  },
};

export default authService;