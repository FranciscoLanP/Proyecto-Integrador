import { apiClient } from '@/services/apiClient';
import { useQuery, useQueryClient } from 'react-query';
import { IVehiculoDatos } from '../types';
import { useEffect } from 'react';

export const useVehiculosCliente = (idCliente: string) => {
  const queryClient = useQueryClient();

  const query = useQuery(
    ['vehiculosCliente', idCliente],
    async () => {
      const res = await apiClient.get<IVehiculoDatos[]>(`/vehiculodatos/cliente/${idCliente}`);
      return res.data;
    },
    {
      enabled: !!idCliente,
      refetchOnWindowFocus: true,
      staleTime: 0,
      cacheTime: 1000 * 60 * 5,
    }
  );

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'vehiculo_updated') {
        queryClient.invalidateQueries(['vehiculosCliente', idCliente]);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [idCliente, queryClient]);

  return {
    ...query,
    refetch: () => query.refetch()
  };
};
