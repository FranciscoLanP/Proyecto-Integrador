'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  TextField, Button, MenuItem, Box, Typography
} from '@mui/material';
import { ModernModal } from '@/components/ModernModal';
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

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      '&:hover': {
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'primary.main',
          borderWidth: '2px'
        }
      },
      '&.Mui-focused': {
        '& .MuiOutlinedInput-notchedOutline': {
          borderWidth: '2px',
          boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)'
        }
      }
    },
    '& .MuiInputLabel-root': {
      zIndex: 10,
      '&.Mui-focused': {
        zIndex: 10
      }
    },
    '& .MuiInputLabel-shrink': {
      zIndex: 10,
      transform: 'translate(14px, -9px) scale(0.75)'
    }
  };

  const isEdit = Boolean(defaultData);

  return (
    <ModernModal
      open={open}
      onClose={tryClose}
      title={isEdit ? 'Editar Recibo' : 'Nuevo Recibo'}
    >
      <Box display="flex" flexDirection="column" gap={3}>
        <Box>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.dark' }}>
            Información del Recibo
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              select
              label="Recepción"
              value={recepcionId}
              onChange={e => setRecepcionId(e.target.value)}
              error={errors.recepcion}
              helperText={errors.recepcion ? 'Selecciona una recepción' : 'Selecciona la recepción para generar el recibo'}
              fullWidth
              sx={textFieldStyle}
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
                const fecha = new Date(r.createdAt || new Date()).toLocaleString();
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
              sx={textFieldStyle}
              placeholder="Observaciones adicionales sobre el recibo..."
            />
          </Box>
        </Box>

        <Box
          display="flex"
          justifyContent="flex-end"
          gap={2}
          pt={2}
          borderTop="1px solid rgba(0,0,0,0.1)"
        >
          <Button
            onClick={tryClose}
            sx={{
              borderRadius: '25px',
              minWidth: '100px'
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              borderRadius: '25px',
              minWidth: '100px',
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
              }
            }}
          >
            {isEdit ? 'Guardar' : 'Crear'}
          </Button>
        </Box>
      </Box>
    </ModernModal>
  );
}
