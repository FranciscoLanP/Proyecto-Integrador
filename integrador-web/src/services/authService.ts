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
  hasSecretQuestion: boolean;
}

export interface UpdateProfilePayload {
  username?: string;
  password?: string;
  currentPassword: string;
}

export interface UpdateProfileResponse {
  message: string;
  usuario: {
    username: string;
    role: 'administrador' | 'empleado';
  };
}

export interface SecretQuestionPayload {
  username: string;
}

export interface SecretQuestionResponse {
  secretQuestion: string;
}

export interface ResetPasswordPayload {
  username: string;
  secretAnswer: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export function loginRequest(payload: LoginPayload): Promise<LoginResponse> {
  return apiClient
    .post<LoginResponse>('/auth/login', payload)
    .then(res => res.data);
}

export function updateProfileRequest(payload: UpdateProfilePayload): Promise<UpdateProfileResponse> {
  return apiClient
    .put<UpdateProfileResponse>('/auth/profile', payload)
    .then(res => res.data);
}

export function getSecretQuestionRequest(payload: SecretQuestionPayload): Promise<SecretQuestionResponse> {
  return apiClient
    .post<SecretQuestionResponse>('/auth/secret-question', payload)
    .then(res => res.data);
}

export function resetPasswordRequest(payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
  return apiClient
    .post<ResetPasswordResponse>('/auth/reset-password', payload)
    .then(res => res.data);
}
