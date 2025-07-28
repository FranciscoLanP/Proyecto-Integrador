'use client';

import React, { useEffect, useState, JSX } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem
} from '@mui/material';
import { useNotification } from '@/components/utils/NotificationProvider';
import { useCrud } from '@/hooks/useCrud';
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

  // Hooks CRUD
  const { allQuery: suplQ } = useCrud<ISuplidor>('suplidorpiezas');
  const { allQuery: relQ } = useCrud<ISuplidorPiezaRelacion>('suplidorpiezasrelaciones');
  const { createM, updateM } = useCrud<IPiezaInventario>('piezasinventario');
  const { createM: createRel } = useCrud<ISuplidorPiezaRelacion>('suplidorpiezasrelaciones');

  const suplidores = suplQ.data ?? [];
  const relaciones = relQ.data ?? [];

  // Form state
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState(0);
  const [costo, setCosto] = useState(0);
  const [supl, setSupl] = useState('');

  useEffect(() => {
    if (!open) return;
    
    if (piezaToEdit) {
      // MODO EDITAR: Cargar todos los datos de la pieza
      setNombre(piezaToEdit.nombre_pieza);
      setCantidad(piezaToEdit.cantidad_disponible);
      setCosto(piezaToEdit.costo_promedio);
      
      // Buscar el suplidor asociado a esta pieza
      const relacion = relaciones.find(r => r.id_pieza === piezaToEdit._id);
      setSupl(relacion?.id_suplidor || '');
    } else {
      // MODO CREAR: Limpiar campos
      setNombre('');
      setCantidad(0);
      setCosto(0);
      setSupl('');
    }
  }, [open, piezaToEdit?._id, relaciones.length]); // ✅ Usar solo el ID y la longitud

  const validSup = piezaToEdit
    ? relaciones
        .filter(r => r.id_pieza === piezaToEdit._id)
        .map(r => suplidores.find(s => s._id === r.id_suplidor))
        .filter((s): s is ISuplidor => !!s)
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
      // CREAR NUEVA PIEZA
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
              { onSuccess: () => {
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
      // EDITAR PIEZA EXISTENTE
      updateM.mutate(
        {
          id: piezaToEdit._id,
          data: {
            nombre_pieza: nombre.trim(),
            cantidad_disponible: cantidad,
            costo_promedio: costo,
            // Mantener el historial existente
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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {piezaToEdit ? 'Editar Pieza' : 'Nueva Pieza'}
      </DialogTitle>

      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        <TextField
          label="Nombre de la pieza"
          fullWidth
          size="small"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />

        <TextField
          select
          label="Suplidor"
          fullWidth
          size="small"
          value={supl}
          onChange={e => setSupl(e.target.value)}
          required
        >
          {(piezaToEdit ? validSup : suplidores).map(s => (
            <MenuItem key={s._id} value={s._id}>
              {s.nombre}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Cantidad disponible"
          type="number"
          fullWidth
          size="small"
          value={cantidad}
          onChange={e => setCantidad(+e.target.value)}
          required
          inputProps={{ min: 0 }}
        />

        <TextField
          label="Costo promedio"
          type="number"
          fullWidth
          size="small"
          value={costo}
          onChange={e => setCosto(+e.target.value)}
          required
          inputProps={{ min: 0, step: 0.01 }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave}>
          {piezaToEdit ? 'Actualizar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
