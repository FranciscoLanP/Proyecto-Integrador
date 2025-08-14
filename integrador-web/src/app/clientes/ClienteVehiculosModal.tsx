'use client';

import React from 'react';
import {
  Button,
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper
} from '@mui/material';
import ModernModal from '@/components/ModernModal/ModernModal';
import { ICliente, IVehiculoDatos } from '../types';
import { useVehiculosCliente } from './useVehiculosCliente';

interface Props {
  open: boolean;
  onClose: () => void;
  client: ICliente;
}

export default function ClienteVehiculosModal({
  open,
  onClose,
  client
}: Props) {
  const vehQuery = useVehiculosCliente(client._id);
  const vehiculos = vehQuery.data || [];

  if (vehQuery.isLoading) {
    return (
      <ModernModal open={open} onClose={onClose} title={`Vehículos de ${client.nombre}`} maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <Typography>Cargando vehículos…</Typography>
        </Box>
      </ModernModal>
    );
  }

  if (vehQuery.error) {
    return (
      <ModernModal open={open} onClose={onClose} title={`Vehículos de ${client.nombre}`} maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <Typography color="error">
            {vehQuery.error instanceof Error
              ? vehQuery.error.message
              : String(vehQuery.error)}
          </Typography>
        </Box>
      </ModernModal>
    );
  }

  const listado = vehiculos.filter(v => v.activo);

  return (
    <ModernModal
      open={open}
      onClose={onClose}
      title={`Vehículos de ${client.nombre}`}
      maxWidth="md"
    >
      <Box display="flex" flexDirection="column" gap={2}>
        {listado.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <Typography variant="h6" color="text.secondary">
              📋 No hay vehículos activos registrados para este cliente
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Se encontraron {listado.length} vehículo{listado.length !== 1 ? 's' : ''} activo{listado.length !== 1 ? 's' : ''}
            </Typography>

            <Paper elevation={0} sx={{ border: '2px solid rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <Table>
                <TableHead sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Chasis
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Marca
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Modelo
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Color
                    </TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center' }}>
                      Año
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {listado.map((v: IVehiculoDatos, index: number) => {
                    const modelo = typeof v.id_modelo === 'object' ? v.id_modelo : null;
                    const marca = modelo && typeof modelo === 'object' && 'id_marca' in modelo
                      ? (modelo.id_marca as { nombre_marca?: string })
                      : null;
                    const color = typeof v.id_color === 'object' ? v.id_color : null;

                    return (
                      <TableRow
                        key={v._id}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: 'rgba(0,0,0,0.02)' },
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            transform: 'scale(1.01)',
                            transition: 'all 0.2s ease-in-out',
                          },
                          cursor: 'default'
                        }}
                      >
                        <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                          {v.chasis}
                        </TableCell>
                        <TableCell>
                          {typeof marca === 'object' && marca?.nombre_marca ? marca.nombre_marca : '—'}
                        </TableCell>
                        <TableCell>
                          {modelo?.nombre_modelo ?? '—'}
                        </TableCell>
                        <TableCell>
                          <Box
                            component="span"
                            sx={{
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              backgroundColor: 'rgba(102, 126, 234, 0.1)',
                              fontSize: '0.85rem',
                              fontWeight: 'medium'
                            }}
                          >
                            {color?.nombre_color ?? '—'}
                          </Box>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                          {v.anio}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        )}

        {/* Botón de cerrar */}
        <Box display="flex" justifyContent="flex-end" sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Button
            onClick={onClose}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Cerrar
          </Button>
        </Box>
      </Box>
    </ModernModal>
  );
}
