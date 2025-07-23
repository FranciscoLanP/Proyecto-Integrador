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
  // servicio para crear relaciones
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
      // Añadir stock
      setNombre(piezaToEdit.nombre_pieza);
    } else {
      // Crear pieza
      setNombre('');
    }
    setCantidad(0);
    setCosto(0);
    setSupl('');
  }, [open, piezaToEdit]);

  const validSup = piezaToEdit
    ? relaciones
        .filter(r => r.id_pieza === piezaToEdit._id)
        .map(r => suplidores.find(s => s._id === r.id_suplidor))
        .filter((s): s is ISuplidor => !!s)
    : suplidores;

  const handleSave = (): void => {
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
            // crear relación pieza↔suplidor
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
      // AÑADIR STOCK
      const nuevoEvento: IEventoHistorico = {
        cantidad,
        costo_unitario: costo,
        fecha: new Date().toISOString()
      };
      const prevCant = piezaToEdit.cantidad_disponible;
      const prevCost = piezaToEdit.costo_promedio;
      const nuevaCant = prevCant + cantidad;
      const nuevoProm = ((prevCost * prevCant) + (costo * cantidad)) / nuevaCant;

      updateM.mutate(
        {
          id: piezaToEdit._id,
          data: {
            cantidad_disponible: nuevaCant,
            costo_promedio: nuevoProm,
            historial: [...piezaToEdit.historial, nuevoEvento]
          }
        },
        {
          onSuccess: () => {
            notify('Stock agregado correctamente', 'success');
            onSaved();
            onClose();
          },
          onError: () => notify('Error al agregar stock', 'error')
        }
      );
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>
        {piezaToEdit ? 'Agregar Stock' : 'Nueva Pieza'}
      </DialogTitle>

      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
        {!piezaToEdit && (
          <TextField
            label="Nombre de la pieza"
            fullWidth
            size="small"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
          />
        )}

        <TextField
          select
          label="Suplidor"
          fullWidth
          size="small"
          value={supl}
          onChange={e => setSupl(e.target.value)}
        >
          {validSup.map(s => (
            <MenuItem key={s._id} value={s._id}>
              {s.nombre}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Cantidad"
          type="number"
          fullWidth
          size="small"
          value={cantidad}
          onChange={e => setCantidad(+e.target.value)}
        />

        <TextField
          label="Costo unitario"
          type="number"
          fullWidth
          size="small"
          value={costo}
          onChange={e => setCosto(+e.target.value)}
        />
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave}>
          {piezaToEdit ? 'Agregar' : 'Crear'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
