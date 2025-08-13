'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, IconButton, Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type {
  IReciboVehiculo,
  IRecepcionVehiculo,
  ICliente
} from '../types';
import type { IVehiculoDatos } from '../types';

interface Props {
  open: boolean;
  defaultData?: IReciboVehiculo;
  recepciones: IRecepcionVehiculo[];
  vehiculos: IVehiculoDatos[];
  clientes: ICliente[];
  onClose: () => void;
  onSubmit: (data: Partial<IReciboVehiculo>) => void;
}

export default function ReciboVehiculoModal({
  open,
  defaultData,
  recepciones,
  vehiculos,
  clientes,
  onClose,
  onSubmit
}: Props) {
  const [recepcionId, setRecepcionId] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [errors, setErrors] = useState({ recepcion: false });

  const initial = useRef({ recepcionId: '', observaciones: '' });

  useEffect(() => {
    if (!open) return;
    const rid = defaultData?.id_recepcion ?? '';
    setRecepcionId(typeof rid === 'string' ? rid : rid._id);
    setObservaciones(defaultData?.observaciones ?? '');
    initial.current = {
      recepcionId: typeof rid === 'string' ? rid : rid._id,
      observaciones: defaultData?.observaciones ?? ''
    };
    setErrors({ recepcion: false });
  }, [open, defaultData]);

  const isDirty = () =>
    recepcionId !== initial.current.recepcionId ||
    observaciones !== initial.current.observaciones;

  const tryClose = () => {
    if (isDirty()) setErrors(e => ({ ...e, recepcion: false }));
    onClose();
  };

  const handleSave = () => {
    const err = !recepcionId;
    setErrors({ recepcion: err });
    if (err) return;
    onSubmit({ id_recepcion: recepcionId, observaciones: observaciones || undefined });
  };

  return (
    <Dialog open={open} onClose={tryClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ position: 'relative', pr: 6 }}>
        {defaultData ? 'Editar Recibo' : 'Nuevo Recibo'}
        <IconButton onClick={tryClose} sx={{ position: 'absolute', right: 8, top: 8 }} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            select
            label="Recepción"
            value={recepcionId}
            onChange={e => setRecepcionId(e.target.value)}
            error={errors.recepcion}
            helperText={errors.recepcion ? 'Obligatorio' : ''}
            fullWidth
          >
            {recepciones.map(r => {
              const veh = vehiculos.find(v => {
                const vid = typeof r.id_vehiculo === 'string'
                  ? r.id_vehiculo
                  : r.id_vehiculo._id;
                return vid === v._id;
              });
              const cli = veh
                ? clientes.find(c => {
                  const cid = typeof veh.id_cliente === 'string'
                    ? veh.id_cliente
                    : veh.id_cliente._id;
                  return cid === c._id;
                })
                : null;
              const fecha = new Date(r.fecha).toLocaleString();
              const label = cli && veh
                ? `${cli.nombre} — ${veh.chasis} — ${fecha}`
                : `${fecha} — ${r._id}`;
              return (
                <MenuItem key={r._id} value={r._id}>
                  {label}
                </MenuItem>
              );
            })}
          </TextField>

          <TextField
            label="Observaciones (opcional)"
            value={observaciones}
            onChange={e => setObservaciones(e.target.value)}
            multiline
            rows={3}
            fullWidth
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1 }}>
        <Button onClick={tryClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave}>
          {defaultData ? 'Guardar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
