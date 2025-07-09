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
import { useCrud } from '../../hooks/useCrud';
import type {
  IVehiculoDatos,
  IModelosDatos,
  IColoresDatos,
  IMarcaVehiculo,
  ICliente
} from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  client: ICliente;
  modelos: IModelosDatos[];
  colores: IColoresDatos[];
  marcas: IMarcaVehiculo[];
}

export default function ClienteVehiculosModal({
  open,
  onClose,
  client,
  modelos,
  colores,
  marcas
}: Props) {
  const vehQuery = useCrud<IVehiculoDatos>('vehiculodatos').allQuery;
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
          <Typography color="error">{vehQuery.error.message}</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  const listado = vehiculos.filter(v => {
    const vid = typeof v.id_cliente === 'string'
      ? v.id_cliente
      : (v.id_cliente as ICliente)._id;
    return vid === client._id && v.activo === true;
  });

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
                {listado.map(v => {
                  const modeloId = typeof v.id_modelo === 'string'
                    ? v.id_modelo
                    : (v.id_modelo as IModelosDatos)._id;
                  const colorId = typeof v.id_color === 'string'
                    ? v.id_color
                    : (v.id_color as IColoresDatos)._id;

                  const modObj = modelos.find(m => m._id === modeloId);
                  const modeloNombre = modObj?.nombre_modelo ?? '—';
                  const marcaNombre = marcas.find(mk => mk._id === modObj?.id_marca)
                    ?.nombre_marca ?? '—';
                  const colorNombre = colores.find(c => c._id === colorId)
                    ?.nombre_color ?? '—';


                  return (
                    <TableRow key={v._id} hover>
                      <TableCell>{v.chasis}</TableCell>
                      <TableCell>{marcaNombre}</TableCell>
                      <TableCell>{modeloNombre}</TableCell>
                      <TableCell>{colorNombre}</TableCell>
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
