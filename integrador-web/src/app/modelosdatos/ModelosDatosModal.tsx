'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Button,
  MenuItem, IconButton, Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { IModelosDatos, IMarcaVehiculo } from '../types';

interface Props {
  open: boolean;
  defaultData?: IModelosDatos;
  marcas: IMarcaVehiculo[];
  onClose: () => void;
  onSubmit: (data: Partial<IModelosDatos>) => void;
}

export default function ModelosDatosModal({
  open, defaultData, marcas, onClose, onSubmit
}: Props) {
  const [nombre, setNombre]   = useState('');
  const [marcaId, setMarcaId] = useState('');
  const [showError, setShowError] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const initial = useRef({ nombre: '', marcaId: '' });

  useEffect(() => {
    if (open) {
      const nm = defaultData?.nombre_modelo ?? '';
      const md = defaultData?.id_marca     ?? '';
      setNombre(nm);
      setMarcaId(md);
      initial.current = { nombre: nm, marcaId: md };
      setShowError(false);
    }
  }, [open, defaultData]);

  const isDirty = () =>
    nombre.trim() !== initial.current.nombre ||
    marcaId !== initial.current.marcaId;

  const tryClose = () => {
    if (isDirty()) setConfirmDiscard(true);
    else onClose();
  };

  const confirmClose = () => {
    setConfirmDiscard(false);
    onClose();
  };

  const handleSave = () => {
    if (!nombre.trim() || !marcaId) {
      setShowError(true);
      return;
    }
    onSubmit({ nombre_modelo: nombre.trim(), id_marca: marcaId });
  };

  return (
    <>
      <Dialog open={open} onClose={tryClose} fullWidth maxWidth="sm">
        <DialogTitle sx={{ position: 'relative', pr: 6 }}>
          {defaultData ? 'Editar Modelo' : 'Nuevo Modelo'}
          <IconButton onClick={tryClose} sx={{ position: 'absolute', right: 8, top: 8 }} size="small">
            <CloseIcon fontSize="small"/>
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Nombre del modelo"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              error={showError && !nombre.trim()}
              helperText={showError && !nombre.trim() ? 'Obligatorio' : ''}
              fullWidth
            />
            <TextField
              select
              label="Marca"
              value={marcaId}
              onChange={e => setMarcaId(e.target.value)}
              error={showError && !marcaId}
              helperText={showError && !marcaId ? 'Obligatorio' : ''}
              fullWidth
            >
              {marcas.map(mk => (
                <MenuItem key={mk._id} value={mk._id}>
                  {mk.nombre_marca}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={tryClose}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>
            {defaultData ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDiscard} onClose={() => setConfirmDiscard(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="warning" fontSize="small"/> ¿Descartar cambios?
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmDiscard(false)}>Volver</Button>
          <Button color="error" onClick={confirmClose}>Descartar</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
