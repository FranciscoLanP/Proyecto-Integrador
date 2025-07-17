'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, IconButton, Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
  const [fecha, setFecha] = useState('');
  const [problema, setProblema] = useState('');
  const [comentario, setComentario] = useState('');
  const [errors, setErrors] = useState({
    cliente: false,
    vehiculo: false,
    empleado: false,
    fecha: false
  });

  const initial = useRef({
    clienteId: '', vehiculoId: '', empleadoId: '', fecha: '', problema: '', comentario: ''
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
    const dt = rec?.fecha
      ? new Date(rec.fecha).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16);
    setFecha(dt);
    setProblema(rec?.problema_reportado ?? '');
    setComentario(rec?.comentario ?? '');
    initial.current = {
      clienteId: cliId,
      vehiculoId: vehId,
      empleadoId: empId,
      fecha: dt,
      problema: rec?.problema_reportado ?? '',
      comentario: rec?.comentario ?? ''
    };
    setErrors({ cliente: false, vehiculo: false, empleado: false, fecha: false });
  }, [open, defaultData, vehiculos]);

  // Filtrar vehículos del cliente
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
    fecha !== initial.current.fecha ||
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
      empleado: !empleadoId,
      fecha: !fecha
    };
    setErrors(e);
    if (e.cliente || e.vehiculo || e.empleado || e.fecha) return;

    onSubmit({
      id_vehiculo: vehiculoId,
      id_empleadoInformacion: empleadoId,
      fecha: new Date(fecha).toISOString(),
      problema_reportado: problema || undefined,
      comentario: comentario || undefined
    });
  };

  return (
    <Dialog open={open} onClose={tryClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ position: 'relative', pr: 6 }}>
        {defaultData ? 'Editar Recepción' : 'Nueva Recepción'}
        <IconButton
          onClick={tryClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
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
            helperText={errors.cliente ? 'Obligatorio' : ''}
            fullWidth
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
            helperText={errors.vehiculo ? 'Obligatorio' : ''}
            fullWidth
            disabled={!clienteId}
          >
            {availableVehiculos.map(v => (
              <MenuItem key={v._id} value={v._id}>
                {v.chasis}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Empleado"
            value={empleadoId}
            onChange={e => setEmpleadoId(e.target.value)}
            error={errors.empleado}
            helperText={errors.empleado ? 'Obligatorio' : ''}
            fullWidth
          >
            {empleados.map(emp => (
              <MenuItem key={emp._id} value={emp._id}>
                {emp.nombre}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Fecha y hora"
            type="datetime-local"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            error={errors.fecha}
            helperText={errors.fecha ? 'Obligatorio' : ''}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Problema reportado (opcional)"
            value={problema}
            onChange={e => setProblema(e.target.value)}
            multiline
            rows={2}
            fullWidth
          />

          <TextField
            label="Comentario (opcional)"
            value={comentario}
            onChange={e => setComentario(e.target.value)}
            multiline
            rows={2}
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
