'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>Vehículos de {client.nombre}</DialogTitle>
        <DialogContent>
          <Typography>Cargando vehículos…</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  if (vehQuery.error) {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>Vehículos de {client.nombre}</DialogTitle>
        <DialogContent>
          <Typography color="error">
            {vehQuery.error instanceof Error
              ? vehQuery.error.message
              : String(vehQuery.error)}
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  const listado = vehiculos.filter(v => v.activo);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ position: 'relative', pr: 6 }}>
        Vehículos de {client.nombre}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {listado.length === 0 ? (
          <Typography>No hay vehículos activos registrados.</Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: 'action.hover' }}>
                <TableRow>
                  <TableCell>Chasis</TableCell>
                  <TableCell>Marca</TableCell>
                  <TableCell>Modelo</TableCell>
                  <TableCell>Color</TableCell>
                  <TableCell>Año</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {listado.map((v: IVehiculoDatos) => {
                  const modelo = typeof v.id_modelo === 'object' ? v.id_modelo : null;
                  const marca = modelo && typeof modelo === 'object' && 'id_marca' in modelo
                    ? (modelo.id_marca as { nombre_marca?: string })
                    : null;
                  const color = typeof v.id_color === 'object' ? v.id_color : null;

                  return (
                    <TableRow key={v._id} hover>
                      <TableCell>{v.chasis}</TableCell>
                      <TableCell>
                        {typeof marca === 'object' && marca?.nombre_marca ? marca.nombre_marca : '—'}
                      </TableCell>
                      <TableCell>
                        {modelo?.nombre_modelo ?? '—'}
                      </TableCell>
                      <TableCell>
                        {color?.nombre_color ?? '—'}
                      </TableCell>
                      <TableCell>{v.anio}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
