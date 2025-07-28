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
      emitida: false
    }
  );

  // Estados para los datos de los dropdowns
  const [reparaciones, setReparaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar datos para los dropdowns
  useEffect(() => {
    if (open) {
      fetchDropdownData();
    }
  }, [open]);

  useEffect(() => {
    if (defaultData) {
      setForm(defaultData);
    }
  }, [defaultData]);

  const fetchDropdownData = async () => {
    setLoading(true);
    try {
      const reparacionesData = await reparacionVehiculoService.fetchAll();
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
            {reparaciones.map(reparacion => (
              <MenuItem key={reparacion._id} value={reparacion._id}>
                {`${reparacion._id} - ${reparacion.descripcion} ($${reparacion.costo_total || 0})`}
              </MenuItem>
            ))}
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