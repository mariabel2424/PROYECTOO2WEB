import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/config';
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  Usuario,
} from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.login,
      credentials
    );
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    return data;
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const { data } = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.auth.register,
      userData
    );
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.auth.logout);
    } finally {
      // Siempre limpiar el token local, incluso si falla el backend
      localStorage.removeItem('auth_token');
    }
  },

  async getMe(): Promise<Usuario> {
    const { data } = await apiClient.get<{ user: Usuario }>(
      API_ENDPOINTS.auth.me
    );
    return data.user;
  },

  async cambiarPassword(
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<void> {
    await apiClient.post(API_ENDPOINTS.auth.cambiarPassword, {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: confirmPassword,
    });
  },

  async verificarEmail(email: string): Promise<{ exists: boolean }> {
    const { data } = await apiClient.post<{ exists: boolean }>(
      API_ENDPOINTS.auth.verificarEmail,
      { email }
    );
    return data;
  },

  async enviarCodigo(email: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.auth.enviarCodigo, { email });
  },

  async verificarCodigo(
    email: string,
    codigo: string
  ): Promise<{ valid: boolean }> {
    const { data } = await apiClient.post<{ valid: boolean }>(
      API_ENDPOINTS.auth.verificarCodigo,
      { email, codigo }
    );
    return data;
  },

  async solicitarReset(email: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.auth.solicitarReset, { email });
  },

  async verificarToken(token: string): Promise<{ valid: boolean }> {
    const { data } = await apiClient.post<{ valid: boolean }>(
      API_ENDPOINTS.auth.verificarToken,
      { token }
    );
    return data;
  },

  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
  },
};
