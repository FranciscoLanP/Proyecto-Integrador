
import { IUbicacion } from '@/app/types';
import { apiClient } from './apiClient';

interface CreateUbicacionPayload {
  userId: string;
  latitude: number;
  longitude: number;
  direccion?: string;
}

interface UpdateUbicacionPayload {
  latitude?: number;
  longitude?: number;
  direccion?: string;
}

export const ubicacionesService = {
  fetchAll: (): Promise<IUbicacion[]> =>
    apiClient.get<IUbicacion[]>('/ubicaciones').then(res => res.data),

  fetchById: (id: string): Promise<IUbicacion> =>
    apiClient.get<IUbicacion>(`/ubicaciones/${id}`).then(res => res.data),

  create: (data: CreateUbicacionPayload): Promise<IUbicacion> =>
    apiClient.post<IUbicacion>('/ubicaciones', data).then(res => res.data),

  update: (id: string, data: UpdateUbicacionPayload): Promise<IUbicacion> =>
    apiClient.put<IUbicacion>(`/ubicaciones/${id}`, data).then(res => res.data),

  remove: (id: string): Promise<void> =>
    apiClient.delete<void>(`/ubicaciones/${id}`).then(res => res.data),
};
