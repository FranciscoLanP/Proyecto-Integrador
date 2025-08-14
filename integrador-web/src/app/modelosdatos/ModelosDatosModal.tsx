'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  TextField, Button, MenuItem, Box, Typography
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { ModernModal } from '@/components/ModernModal';
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
  const [nombre, setNombre] = useState('');
  const [marcaId, setMarcaId] = useState('');
  const [showError, setShowError] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const initial = useRef({ nombre: '', marcaId: '' });

  useEffect(() => {
    if (open) {
      const nm = defaultData?.nombre_modelo ?? '';
      const md = defaultData?.id_marca ?? '';
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
    <>
      <ModernModal
        open={open}
        onClose={tryClose}
        title={isEdit ? 'Editar Modelo' : 'Nuevo Modelo'}
      >
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Información del Modelo */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.dark' }}>
              Información del Modelo
            </Typography>
            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Nombre del modelo"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                error={showError && !nombre.trim()}
                helperText={showError && !nombre.trim() ? 'Este campo es obligatorio' : ''}
                fullWidth
                sx={textFieldStyle}
                placeholder="Ingresa el nombre del modelo..."
              />

              <TextField
                select
                label="Marca"
                value={marcaId}
                onChange={e => setMarcaId(e.target.value)}
                error={showError && !marcaId}
                helperText={showError && !marcaId ? 'Selecciona una marca' : ''}
                fullWidth
                sx={textFieldStyle}
              >
                {marcas.map(mk => (
                  <MenuItem key={mk._id} value={mk._id}>
                    {mk.nombre_marca}
                  </MenuItem>
                ))}
              </TextField>
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

      {/* Modal de Confirmación para Descartar Cambios */}
      <ModernModal
        open={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        title="¿Descartar cambios?"
      >
        <Box display="flex" flexDirection="column" gap={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <WarningAmberIcon
              color="warning"
              sx={{ fontSize: '2rem' }}
            />
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Tienes cambios sin guardar. ¿Estás seguro de que quieres descartarlos?
            </Typography>
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
              onClick={() => setConfirmDiscard(false)}
              sx={{
                borderRadius: '25px',
                minWidth: '100px'
              }}
            >
              Volver
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={confirmClose}
              sx={{
                borderRadius: '25px',
                minWidth: '100px',
                background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #c62828 0%, #b71c1c 100%)',
                }
              }}
            >
              Descartar
            </Button>
          </Box>
        </Box>
      </ModernModal>
    </>
  );
}
