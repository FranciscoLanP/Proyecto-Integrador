import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, IconButton, Box, TextField, Button, MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Factura, reparacionVehiculoService } from '@/services/facturaService';

interface Props {
  open: boolean;
  defaultData?: Factura;
  onClose: () => void;
  onSubmit: (data: Factura) => void;
}

const metodoPagoOptions = [
  'Efectivo',
  'Tarjeta',
  'Transferencia',
  'Cheque'
];

export default function FacturaModal({ open, defaultData, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<Factura>(
    defaultData ?? {
      id_reparacion: '',
      fecha_emision: new Date().toISOString().slice(0, 10),
      total: 0,
      metodo_pago: '',
      detalles: '',
      emitida: false,
      descuento_porcentaje: 0
    }
  );

  const [reparaciones, setReparaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchDropdownData();
    }
  }, [open]);

  useEffect(() => {
    if (defaultData) {
      const processedData = {
        ...defaultData,
        id_reparacion: typeof defaultData.id_reparacion === 'object' && (defaultData.id_reparacion as any)?._id
          ? (defaultData.id_reparacion as any)._id
          : defaultData.id_reparacion
      };

      console.log('🔧 Datos procesados para edición:', {
        original: defaultData,
        processed: processedData
      });

      setForm(processedData);
    } else {
      
      setForm({
        id_reparacion: '',
        fecha_emision: new Date().toISOString().slice(0, 10),
        total: 0,
        metodo_pago: '',
        detalles: '',
        emitida: false,
        descuento_porcentaje: 0
      });
    }
  }, [defaultData, open]); 

  const fetchDropdownData = async () => {
    setLoading(true);
    try {
      const reparacionesData = await reparacionVehiculoService.fetchAll();
      console.log('🚗 Reparaciones para factura:', reparacionesData); 
      setReparaciones(reparacionesData);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleReparacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reparacionId = e.target.value;
    const reparacionSeleccionada = reparaciones.find(r => r._id === reparacionId);

    setForm(f => ({
      ...f,
      id_reparacion: reparacionId,
      total: reparacionSeleccionada?.costo_total || f.total
    }));
  };

  const handleSave = () => {
    onSubmit(form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ position: 'relative', pr: 6 }}>
        {defaultData ? 'Editar Factura' : 'Nueva Factura'}
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
            select
            label="Reparación"
            name="id_reparacion"
            value={form.id_reparacion}
            onChange={handleReparacionChange}
            required
            fullWidth
            disabled={form.emitida || loading}
          >
            {reparaciones.map(reparacion => {
              const infoText = (() => {
                try {
                  const inspeccion = reparacion.id_inspeccion;
                  if (inspeccion && typeof inspeccion === 'object') {
                    const cliente = inspeccion.id_recibo?.id_recepcion?.id_vehiculo?.id_cliente;
                    const vehiculo = inspeccion.id_recibo?.id_recepcion?.id_vehiculo;

                    if (cliente && vehiculo) {
                      const clienteNombre = cliente.nombre || 'Cliente';
                      const vehiculoInfo = vehiculo.id_modelo?.nombre_modelo || 'Vehículo';
                      return `${clienteNombre} | ${vehiculoInfo} | $${reparacion.costo_total || 0}`;
                    }
                  }
                  return `Reparación | ${reparacion.descripcion || 'Sin descripción'} | $${reparacion.costo_total || 0}`;
                } catch (error) {
                  console.error('Error al procesar reparación:', error);
                  return `Reparación ${reparacion._id} | $${reparacion.costo_total || 0}`;
                }
              })();

              return (
                <MenuItem key={reparacion._id} value={reparacion._id}>
                  {infoText}
                </MenuItem>
              );
            })}
          </TextField>

          <TextField
            label="Fecha de emisión"
            name="fecha_emision"
            type="date"
            value={form.fecha_emision}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            disabled={form.emitida}
          />
          <TextField
            label="Total"
            name="total"
            type="number"
            value={form.total}
            onChange={handleChange}
            fullWidth
            disabled={form.emitida}
          />
          <TextField
            label="Descuento (%)"
            name="descuento_porcentaje"
            type="number"
            value={form.descuento_porcentaje ?? 0}
            onChange={handleChange}
            fullWidth
            disabled={form.emitida}
            inputProps={{ min: 0, max: 100, step: 0.1 }}
            helperText="Porcentaje de descuento (0-100%)"
          />
          <TextField
            select
            label="Método de pago"
            name="metodo_pago"
            value={form.metodo_pago}
            onChange={handleChange}
            required
            fullWidth
            disabled={form.emitida}
          >
            {metodoPagoOptions.map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Detalles"
            name="detalles"
            value={form.detalles ?? ''}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={2}
            disabled={form.emitida}
          />
        </Box>
        <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={form.emitida}
          >
            Guardar
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}