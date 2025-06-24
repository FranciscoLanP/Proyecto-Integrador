'use client'

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  IconButton,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { IBarrio, ICliente, ClienteTipo } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ICliente>) => void;
  defaultData?: ICliente;
  barrios: IBarrio[];
}

export default function ClientModal({
  open,
  onClose,
  onSubmit,
  defaultData,
  barrios
}: Props) {
  const [cedula, setCedula] = useState('');
  const [rnc, setRnc] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [barrioId, setBarrioId] = useState('');
  const [tipoCliente, setTipoCliente] = useState<ClienteTipo | ''>('');

  const [cedulaError, setCedulaError] = useState('');
  const [rncError, setRncError] = useState('');
  const [correoError, setCorreoError] = useState('');
  const [telefonoError, setTelefonoError] = useState('');

  const cedulaRegex = /^\d{3}-\d{7}-\d{1}$/;
  const rncRegex = /^\d{3}-\d{6,7}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\(\d{3}\)-\d{3}-\d{4}$/;

  const formatCedulaInput = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 10)}-${d.slice(10)}`;
  };

  const formatRncInput = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 9);
    if (d.length <= 3) return d;
    return `${d.slice(0, 3)}-${d.slice(3)}`;
  };

  const formatPhoneInput = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 10);
    if (d.length <= 3) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 3)})-${d.slice(3)}`;
    return `(${d.slice(0, 3)})-${d.slice(3, 6)}-${d.slice(6)}`;
  };

  const handleCedulaChange = (v: string) => {
    const f = formatCedulaInput(v);
    setCedula(f);
    setCedulaError(cedulaRegex.test(f) ? '' : 'Debe ser XXX-XXXXXXX-X');
  };

  const handleRncChange = (v: string) => {
    const f = formatRncInput(v);
    setRnc(f);
    setRncError(f === '' || rncRegex.test(f) ? '' : 'Debe ser XXX-XXXXXXX');
  };

  const handleCorreoChange = (v: string) => {
    setCorreo(v);
    setCorreoError(emailRegex.test(v) ? '' : 'Correo inválido');
  };

  const handleTelefonoChange = (v: string) => {
    const f = formatPhoneInput(v);
    setTelefono(f);
    setTelefonoError(phoneRegex.test(f) ? '' : 'Debe ser (XXX)-XXX-XXXX');
  };

  useEffect(() => {
    if (open) {
      setCedula(defaultData?.cedula ?? '');
      setRnc(defaultData?.rnc ?? '');
      setNombre(defaultData?.nombre ?? '');
      setTelefono(defaultData?.numero_telefono ?? '');
      setCorreo(defaultData?.correo ?? '');
      setBarrioId(defaultData?.id_barrio ?? '');
      setTipoCliente(defaultData?.tipo_cliente ?? '');

      setCedulaError('');
      setRncError('');
      setCorreoError('');
      setTelefonoError('');
    } else {
      setCedula('');
      setRnc('');
      setNombre('');
      setTelefono('');
      setCorreo('');
      setBarrioId('');
      setTipoCliente('');
    }
  }, [open, defaultData]);

  const handleSave = () => {
    if (!cedulaError && !rncError && !correoError && !telefonoError && tipoCliente) {
      onSubmit({
        cedula,
        rnc: rnc || undefined,
        nombre,
        numero_telefono: telefono,
        correo,
        id_barrio: barrioId,
        tipo_cliente: tipoCliente
      });
    }
  };

  const disabledSave =
    !cedula.trim() ||
    !nombre.trim() ||
    !telefono.trim() ||
    !correo.trim() ||
    !barrioId ||
    !tipoCliente ||
    !!cedulaError ||
    !!rncError ||
    !!correoError ||
    !!telefonoError;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ position: 'relative', pr: 6 }}>
        {defaultData ? 'Editar Cliente' : 'Nuevo Cliente'}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Cédula"
            value={cedula}
            onChange={e => handleCedulaChange(e.target.value)}
            error={!!cedulaError}
            helperText={cedulaError}
            required
            fullWidth
          />

          <TextField
            label="RNC (opcional)"
            value={rnc}
            onChange={e => handleRncChange(e.target.value)}
            error={!!rncError}
            helperText={rncError}
            fullWidth
          />

          <TextField
            label="Nombre completo"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Teléfono"
            value={telefono}
            onChange={e => handleTelefonoChange(e.target.value)}
            error={!!telefonoError}
            helperText={telefonoError}
            required
            fullWidth
          />

          <TextField
            label="Correo electrónico"
            type="email"
            value={correo}
            onChange={e => handleCorreoChange(e.target.value)}
            error={!!correoError}
            helperText={correoError}
            required
            fullWidth
          />

          <TextField
            select
            label="Tipo de cliente"
            value={tipoCliente}
            onChange={e => setTipoCliente(e.target.value as ClienteTipo)}
            error={!tipoCliente}
            helperText={!tipoCliente ? 'Seleccione un tipo' : ''}
            required
            fullWidth
          >
            {['Individual', 'Empresarial', 'Aseguradora', 'Gobierno'].map(t => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Barrio"
            value={barrioId}
            onChange={e => setBarrioId(e.target.value)}
            required
            fullWidth
          >
            {barrios.map(b => (
              <MenuItem key={b._id} value={b._id}>
                {b.nombre_barrio}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={disabledSave}
          onClick={handleSave}
        >
          {defaultData ? 'Guardar cambios' : 'Crear Cliente'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
