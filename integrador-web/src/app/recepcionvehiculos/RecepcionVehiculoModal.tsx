'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  TextField, Button, MenuItem, Box, Typography
} from '@mui/material';
import { ModernModal } from '@/components/ModernModal';
import type {
  IRecepcionVehiculo,
  ICliente,
  IEmpleadoInformacion
} from '../types';
import type { IVehiculoDatos } from '../types';

interface Props {
  open: boolean;
  defaultData?: IRecepcionVehiculo;
  clientes: ICliente[];
  empleados: IEmpleadoInformacion[];
  vehiculos: IVehiculoDatos[];
  onClose: () => void;
  onSubmit: (data: Partial<IRecepcionVehiculo>) => void;
}

export default function RecepcionVehiculoModal({
  open, defaultData, clientes, empleados, vehiculos, onClose, onSubmit
}: Props) {
  const [clienteId, setClienteId] = useState('');
  const [vehiculoId, setVehiculoId] = useState('');
  const [empleadoId, setEmpleadoId] = useState('');
  const [problema, setProblema] = useState('');
  const [comentario, setComentario] = useState('');
  const [errors, setErrors] = useState({
    cliente: false,
    vehiculo: false,
    empleado: false
  });

  const initial = useRef({
    clienteId: '', vehiculoId: '', empleadoId: '', problema: '', comentario: ''
  });

  useEffect(() => {
    if (!open) return;
    const rec = defaultData;


    let cliId = '';
    let vehId = '';
    if (rec?.id_vehiculo) {
      let vehObj: IVehiculoDatos | undefined;
      if (typeof rec.id_vehiculo === 'string') {
        vehId = rec.id_vehiculo;
        vehObj = vehiculos.find(v => v._id === rec.id_vehiculo);
      } else {
        vehObj = rec.id_vehiculo;
        vehId = rec.id_vehiculo._id;
      }
      if (vehObj) {
        const vCli = vehObj.id_cliente;
        cliId = typeof vCli === 'string' ? vCli : vCli?._id ?? '';
      }
    }
    setClienteId(cliId);
    setVehiculoId(vehId);

    const empId = rec?.id_empleadoInformacion
      ? (typeof rec.id_empleadoInformacion === 'string'
        ? rec.id_empleadoInformacion
        : rec.id_empleadoInformacion._id)
      : '';
    setEmpleadoId(empId);
    setProblema(rec?.problema_reportado ?? '');
    setComentario(rec?.comentario ?? '');
    initial.current = {
      clienteId: cliId,
      vehiculoId: vehId,
      empleadoId: empId,
      problema: rec?.problema_reportado ?? '',
      comentario: rec?.comentario ?? ''
    };
    setErrors({ cliente: false, vehiculo: false, empleado: false });
  }, [open, defaultData, vehiculos]);

  const availableVehiculos = vehiculos.filter(v => {
    const vCli = typeof v.id_cliente === 'string'
      ? v.id_cliente
      : v.id_cliente?._id;
    return vCli === clienteId;
  });

  const isDirty = () =>
    clienteId !== initial.current.clienteId ||
    vehiculoId !== initial.current.vehiculoId ||
    empleadoId !== initial.current.empleadoId ||
    problema !== initial.current.problema ||
    comentario !== initial.current.comentario;

  const tryClose = () => {
    if (isDirty()) setErrors(e => ({ ...e, cliente: false }));
    onClose();
  };

  const handleSave = () => {
    const e = {
      cliente: !clienteId,
      vehiculo: !vehiculoId,
      empleado: !empleadoId
    };
    setErrors(e);
    if (e.cliente || e.vehiculo || e.empleado) return;

    onSubmit({
      id_vehiculo: vehiculoId,
      id_empleadoInformacion: empleadoId,
      problema_reportado: problema || undefined,
      comentario: comentario || undefined
    });
  };

  // Estilo base para los TextFields
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
      title={isEdit ? 'Editar Recepción' : 'Nueva Recepción'}
    >
      <Box display="flex" flexDirection="column" gap={3}>
        {/* Sección de Selección de Cliente y Vehículo */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.dark' }}>
            Cliente y Vehículo
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              select
              label="Cliente"
              value={clienteId}
              onChange={e => {
                setClienteId(e.target.value);
                setVehiculoId('');
              }}
              error={errors.cliente}
              helperText={errors.cliente ? 'Selecciona un cliente' : ''}
              fullWidth
              sx={textFieldStyle}
            >
              {clientes.map(c => (
                <MenuItem key={c._id} value={c._id}>
                  {c.nombre}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Vehículo"
              value={vehiculoId}
              onChange={e => setVehiculoId(e.target.value)}
              error={errors.vehiculo}
              helperText={
                errors.vehiculo
                  ? 'Selecciona un vehículo'
                  : !clienteId
                    ? 'Primero selecciona un cliente'
                    : availableVehiculos.length === 0
                      ? 'Este cliente no tiene vehículos registrados'
                      : ''
              }
              fullWidth
              disabled={!clienteId}
              sx={textFieldStyle}
            >
              {availableVehiculos.map(v => (
                <MenuItem key={v._id} value={v._id}>
                  {v.chasis}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>

        {/* Sección de Información de Recepción */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.dark' }}>
            Información de Recepción
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              select
              label="Empleado"
              value={empleadoId}
              onChange={e => setEmpleadoId(e.target.value)}
              error={errors.empleado}
              helperText={errors.empleado ? 'Selecciona un empleado' : ''}
              fullWidth
              sx={textFieldStyle}
            >
              {empleados.map(emp => (
                <MenuItem key={emp._id} value={emp._id}>
                  {emp.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>

        {/* Sección de Detalles Adicionales */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.dark' }}>
            Detalles Adicionales
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Problema reportado (opcional)"
              value={problema}
              onChange={e => setProblema(e.target.value)}
              multiline
              rows={2}
              fullWidth
              sx={textFieldStyle}
              placeholder="Describe el problema reportado por el cliente..."
            />

            <TextField
              label="Comentario (opcional)"
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              multiline
              rows={2}
              fullWidth
              sx={textFieldStyle}
              placeholder="Comentarios adicionales sobre la recepción..."
            />
          </Box>
        </Box>

        {/* Botones de Acción */}
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
