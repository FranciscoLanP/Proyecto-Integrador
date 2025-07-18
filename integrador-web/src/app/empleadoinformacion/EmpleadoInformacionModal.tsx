'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, IconButton, Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type {
  IEmpleadoInformacion,
  ITipoEmpleado
} from '../types';

interface Props {
  open: boolean;
  defaultData?: IEmpleadoInformacion;
  tipos: ITipoEmpleado[];
  onClose: () => void;
  onSubmit: (data: Partial<IEmpleadoInformacion>) => void;
}

export default function EmpleadoInformacionModal({
  open,
  defaultData,
  tipos,
  onClose,
  onSubmit
}: Props) {
  const [tipoId, setTipoId] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [errors, setErrors] = useState({
    tipo: false,
    nombre: false,
    telefono: false,
    correo: false
  });
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const initial = useRef({ tipoId: '', nombre: '', telefono: '', correo: '' });

  const formatPhone = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 10);
    if (d.length <= 3) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 3)})- ${d.slice(3)}`;
    return `(${d.slice(0, 3)})- ${d.slice(3, 6)}-${d.slice(6)}`;
  };

  const validPhone = (v: string) =>
    /^\(\d{3}\)- \d{3}-\d{4}$/.test(v);

  const validEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  useEffect(() => {
    if (!open) return;
    const tid = defaultData?.id_tipo_empleado ?? '';
    setTipoId(typeof tid === 'string' ? tid : tid._id);
    setNombre(defaultData?.nombre ?? '');
    setTelefono(defaultData?.telefono ?? '');
    setCorreo(defaultData?.correo ?? '');
    initial.current = {
      tipoId: typeof tid === 'string' ? tid : tid._id,
      nombre: defaultData?.nombre ?? '',
      telefono: defaultData?.telefono ?? '',
      correo: defaultData?.correo ?? ''
    };
    setErrors({ tipo: false, nombre: false, telefono: false, correo: false });
  }, [open, defaultData]);

  const isDirty = () =>
    tipoId !== initial.current.tipoId ||
    nombre.trim() !== initial.current.nombre ||
    telefono.trim() !== initial.current.telefono ||
    correo.trim() !== initial.current.correo;

  const tryClose = () => isDirty() ? setConfirmDiscard(true) : onClose();
  const confirmClose = () => { setConfirmDiscard(false); onClose(); };

  const handleSave = () => {
    const e = {
      tipo: !tipoId,
      nombre: !nombre.trim(),
      telefono: !validPhone(telefono),
      correo: !validEmail(correo)
    };
    setErrors(e);
    if (!e.tipo && !e.nombre && !e.telefono && !e.correo) {
      onSubmit({
        id_tipo_empleado: tipoId,
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        correo: correo.trim()
      });
    }
  };

  return (
    <>
      <Dialog open={open} onClose={tryClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ position: 'relative', pr: 6 }}>
          {defaultData ? 'Editar Empleado' : 'Nuevo Empleado'}
          <IconButton onClick={tryClose} sx={{ position: 'absolute', right: 8, top: 8 }} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              select
              label="Tipo de Empleado"
              value={tipoId}
              onChange={e => setTipoId(e.target.value)}
              error={errors.tipo}
              helperText={errors.tipo ? 'Obligatorio' : ''}
              fullWidth
            >
              {tipos.map(t => (
                <MenuItem key={t._id} value={t._id}>
                  {t.nombre_tipo_empleado}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Nombre"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              error={errors.nombre}
              helperText={errors.nombre ? 'Obligatorio' : ''}
              fullWidth
            />

            <TextField
              label="Teléfono"
              value={telefono}
              onChange={e => setTelefono(formatPhone(e.target.value))}
              error={errors.telefono}
              helperText={errors.telefono ? 'Formato: (123)- 456-7890' : ''}
              fullWidth
            />

            <TextField
              label="Correo electrónico"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              error={errors.correo}
              helperText={errors.correo ? 'Correo inválido' : ''}
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

      <Dialog open={confirmDiscard} onClose={() => setConfirmDiscard(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="warning" fontSize="small" /> ¿Descartar cambios?
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmDiscard(false)}>Volver</Button>
          <Button color="error" onClick={confirmClose}>Descartar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
