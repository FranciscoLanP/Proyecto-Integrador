'use client';

import React, { useEffect, useState, JSX } from 'react';
import {
  TextField,
  Button,
  MenuItem,
  Box,
  Typography
} from '@mui/material';
import { useNotification } from '@/components/utils/NotificationProvider';
import { useCrud } from '@/hooks/useCrud';
import { ModernModal } from '@/components/ModernModal';
import type {
  IPiezaInventario,
  ISuplidor,
  ISuplidorPiezaRelacion,
  IEventoHistorico
} from '@/app/types';

interface Props {
  piezaToEdit?: IPiezaInventario;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export default function RegistroCompraModal({
  piezaToEdit,
  open,
  onClose,
  onSaved
}: Props): JSX.Element {
  const { notify } = useNotification();

  const { allQuery: suplQ } = useCrud<ISuplidor>('suplidorpiezas');
  const { allQuery: relQ } = useCrud<ISuplidorPiezaRelacion>('suplidorpiezasrelaciones');
  const { createM, updateM } = useCrud<IPiezaInventario>('piezasinventario');
  const { createM: createRel } = useCrud<ISuplidorPiezaRelacion>('suplidorpiezasrelaciones');

  const suplidores = suplQ.data ?? [];
  const relaciones = relQ.data ?? [];

  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState(0);
  const [costo, setCosto] = useState(0);
  const [supl, setSupl] = useState('');

  useEffect(() => {
    if (!open) return;

    if (piezaToEdit) {
      setNombre(piezaToEdit.nombre_pieza);
      setCantidad(piezaToEdit.cantidad_disponible);
      setCosto(piezaToEdit.costo_promedio);

      const relacion = relaciones.find(r => r.id_pieza === piezaToEdit._id);
      setSupl(relacion?.id_suplidor || '');
    } else {
      setNombre('');
      setCantidad(0);
      setCosto(0);
      setSupl('');
    }
  }, [open, piezaToEdit?._id, relaciones.length]);

  const validSup = piezaToEdit
    ? suplidores // Mostrar todos los suplidores en lugar de filtrar por relaciones
    : suplidores;

  const handleSave = (): void => {
    if (!nombre.trim()) {
      notify('El nombre de la pieza es requerido', 'error');
      return;
    }
    if (!supl) {
      notify('Debes seleccionar un suplidor', 'error');
      return;
    }
    if (cantidad <= 0 || costo <= 0) {
      notify('Cantidad y costo unitario deben ser mayores que cero', 'error');
      return;
    }

    if (!piezaToEdit) {
      const historial: IEventoHistorico[] = [{
        cantidad,
        costo_unitario: costo,
        fecha: new Date().toISOString()
      }];

      createM.mutate(
        {
          nombre_pieza: nombre.trim(),
          cantidad_disponible: cantidad,
          costo_promedio: costo,
          historial
        },
        {
          onSuccess: pieza => {
            createRel.mutate(
              { id_pieza: pieza._id, id_suplidor: supl },
              {
                onSuccess: () => {
                  notify('Pieza creada y suplidor asignado', 'success');
                  onSaved();
                  onClose();
                },
                onError: () => notify('Pieza creada, pero fallo al asignar suplidor', 'warning')
              }
            );
          },
          onError: () => notify('Error al crear pieza', 'error')
        }
      );
    } else {
      updateM.mutate(
        {
          id: piezaToEdit._id,
          data: {
            nombre_pieza: nombre.trim(),
            cantidad_disponible: cantidad,
            costo_promedio: costo,
            historial: piezaToEdit.historial
          }
        },
        {
          onSuccess: () => {
            notify('Pieza actualizada correctamente', 'success');
            onSaved();
            onClose();
          },
          onError: () => notify('Error al actualizar pieza', 'error')
        }
      );
    }
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

  const isEdit = Boolean(piezaToEdit);

  return (
    <ModernModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Pieza' : 'Nueva Pieza'}
    >
      <Box display="flex" flexDirection="column" gap={3}>
        <Box>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.dark' }}>
            Información de la Pieza
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Nombre de la pieza"
              fullWidth
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              required
              sx={textFieldStyle}
              placeholder="Ingresa el nombre de la pieza..."
            />

            <TextField
              select
              label="Suplidor"
              fullWidth
              value={supl}
              onChange={e => setSupl(e.target.value)}
              required
              sx={textFieldStyle}
            >
              {(piezaToEdit ? validSup : suplidores).map(s => (
                <MenuItem key={s._id} value={s._id}>
                  {s.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>

        <Box>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.dark' }}>
            Inventario y Costos
          </Typography>
          <Box display="flex" gap={2}>
            <TextField
              label="Cantidad disponible"
              type="number"
              fullWidth
              value={cantidad}
              onChange={e => setCantidad(+e.target.value)}
              required
              inputProps={{ min: 0 }}
              sx={textFieldStyle}
            />

            <TextField
              label="Costo promedio"
              type="number"
              fullWidth
              value={costo}
              onChange={e => setCosto(+e.target.value)}
              required
              inputProps={{ min: 0, step: 0.01 }}
              sx={textFieldStyle}
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
            onClick={onClose}
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
            {isEdit ? 'Actualizar' : 'Crear'}
          </Button>
        </Box>
      </Box>
    </ModernModal>
  );
}
