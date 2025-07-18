import { apiClient } from '@/services/apiClient';
import { useQuery } from 'react-query';
import { IVehiculoDatos } from '../types';

export const useVehiculosCliente = (idCliente: string) => {
  return useQuery(
    ['vehiculosCliente', idCliente],
    async () => {
      const res = await apiClient.get<IVehiculoDatos[]>(`/vehiculodatos/cliente/${idCliente}`);
      return res.data;
    },
    { enabled: !!idCliente }
  );
};
