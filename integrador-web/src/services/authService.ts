import { apiClient } from './apiClient';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    username: string;
    role: 'administrador' | 'empleado';
  };
}

export function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  return apiClient
    .post<LoginResponse>('/auth/login', payload)
    .then(res => res.data);
}
