import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, IconButton, Box, TextField, Button, MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Factura, MetodoPago, reparacionVehiculoService } from '@/services/facturaService';

interface Props {
  open: boolean;
  defaultData?: Factura;
  onClose: () => void;
  onSubmit: (data: Factura) => void;
}

const tiposPago = ['Efectivo', 'Tarjeta', 'Transferencia', 'Cheque'] as const;
const tiposFactura = ['Contado', 'Credito'] as const;

export default function FacturaModal({ open, defaultData, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<Factura>({
    id_reparacion: '',
    fecha_emision: new Date().toISOString().slice(0, 10),
    total: 0,
    tipo_factura: 'Contado',
    metodos_pago: [{ tipo: 'Efectivo', monto: 0 }],
    detalles: '',
    emitida: false,
    descuento_porcentaje: 0
  });

  const [reparaciones, setReparaciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchDropdownData();
    }
  }, [open]);

  // Procesar defaultData después de cargar las reparaciones
  useEffect(() => {
    if (defaultData && reparaciones.length > 0) {
      // Procesar los datos para manejar compatibilidad
      let metodosPago = defaultData.metodos_pago || [];

      // Si viene del formato anterior, convertir
      if ((!metodosPago || metodosPago.length === 0) && defaultData.metodo_pago) {
        metodosPago = [{
          tipo: defaultData.metodo_pago as any,
          monto: defaultData.total || 0
        }];
      }

      // Procesar id_reparacion correctamente
      let reparacionId = '';
      if (typeof defaultData.id_reparacion === 'object' && defaultData.id_reparacion) {
        reparacionId = (defaultData.id_reparacion as any)?._id || '';
      } else {
        reparacionId = defaultData.id_reparacion || '';
      }

      const processedData = {
        ...defaultData,
        metodos_pago: metodosPago,
        tipo_factura: defaultData.tipo_factura || 'Contado',
        id_reparacion: reparacionId,
        detalles: defaultData.detalles || '',
        fecha_emision: defaultData.fecha_emision?.split('T')[0] || new Date().toISOString().slice(0, 10),
        total: defaultData.total || 0,
        descuento_porcentaje: defaultData.descuento_porcentaje || 0,
        emitida: defaultData.emitida || false
      };

      console.log('🔧 Datos procesados para edición:', {
        original: defaultData,
        processed: processedData,
        id_reparacion_original: defaultData.id_reparacion,
        id_reparacion_processed: reparacionId,
        reparaciones_disponibles: reparaciones.length
      });

      setForm(processedData);
    } else if (!defaultData && open) {
      setForm({
        id_reparacion: '',
        fecha_emision: new Date().toISOString().slice(0, 10),
        total: 0,
        tipo_factura: 'Contado',
        metodos_pago: [{ tipo: 'Efectivo', monto: 0 }],
        detalles: '',
        emitida: false,
        descuento_porcentaje: 0
      });
    }
  }, [defaultData, open, reparaciones]);

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

  // Funciones para manejar métodos de pago
  const handleAddMetodoPago = () => {
    setForm(f => ({
      ...f,
      metodos_pago: [
        ...f.metodos_pago,
        { tipo: 'Efectivo', monto: 0 }
      ]
    }));
  };

  const handleMetodoPagoChange = (idx: number, field: keyof MetodoPago, value: string | number) => {
    setForm(f => ({
      ...f,
      metodos_pago: f.metodos_pago.map((mp, i) =>
        i === idx ? { ...mp, [field]: value } : mp
      )
    }));
  };

  const handleRemoveMetodoPago = (idx: number) => {
    setForm(f => ({
      ...f,
      metodos_pago: f.metodos_pago.filter((_, i) => i !== idx)
    }));
  };

  // Calcular total de métodos de pago
  const totalMetodosPago = form.metodos_pago.reduce((sum, mp) => sum + (mp.monto || 0), 0);

  const handleReparacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reparacionId = e.target.value;
    const reparacionSeleccionada = reparaciones.find(r => r._id === reparacionId);

    const nuevoTotal = reparacionSeleccionada?.costo_total || form.total;

    setForm(f => ({
      ...f,
      id_reparacion: reparacionId,
      total: nuevoTotal,
      // Actualizar el primer método de pago con el total
      metodos_pago: f.metodos_pago.map((mp, idx) =>
        idx === 0 ? { ...mp, monto: nuevoTotal } : mp
      )
    }));
  };

  const handleSave = () => {
    // Validación: total de métodos de pago debe coincidir con el total
    if (Math.abs(totalMetodosPago - form.total) > 0.01) {
      alert('El total de métodos de pago debe coincidir con el total de la factura');
      return;
    }

    // Validación: debe haber al menos un método de pago
    if (form.metodos_pago.length === 0) {
      alert('Debe agregar al menos un método de pago');
      return;
    }

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
            value={form.id_reparacion || ''}
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
            value={form.fecha_emision || ''}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            disabled={form.emitida}
          />
          <TextField
            label="Total"
            name="total"
            type="number"
            value={form.total || 0}
            onChange={handleChange}
            fullWidth
            disabled={form.emitida}
          />

          <TextField
            select
            label="Tipo de Factura"
            name="tipo_factura"
            value={form.tipo_factura || 'Contado'}
            onChange={handleChange}
            required
            fullWidth
            disabled={form.emitida}
          >
            {tiposFactura.map(tipo => (
              <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
            ))}
          </TextField>

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

          {/* Métodos de pago */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <strong>Métodos de Pago</strong>
              <Button onClick={handleAddMetodoPago} size="small" variant="outlined">
                Agregar método
              </Button>
            </Box>
            {form.metodos_pago.map((metodoPago, idx) => (
              <Box key={idx} display="flex" gap={1} mb={2} alignItems="center">
                <TextField
                  select
                  label="Tipo"
                  value={metodoPago.tipo || 'Efectivo'}
                  onChange={e => handleMetodoPagoChange(idx, 'tipo', e.target.value)}
                  size="small"
                  sx={{ minWidth: 130 }}
                >
                  {tiposPago.map(tipo => (
                    <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Monto"
                  type="number"
                  value={metodoPago.monto || 0}
                  onChange={e => handleMetodoPagoChange(idx, 'monto', Number(e.target.value))}
                  size="small"
                  sx={{ width: 120 }}
                  inputProps={{ min: 0, step: 0.01 }}
                />
                {(metodoPago.tipo === 'Transferencia' || metodoPago.tipo === 'Cheque') && (
                  <TextField
                    label="Referencia"
                    value={metodoPago.referencia || ''}
                    onChange={e => handleMetodoPagoChange(idx, 'referencia', e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                    placeholder={metodoPago.tipo === 'Cheque' ? 'N° Cheque' : 'N° Transferencia'}
                  />
                )}
                {form.metodos_pago.length > 1 && (
                  <Button
                    color="error"
                    onClick={() => handleRemoveMetodoPago(idx)}
                    size="small"
                  >
                    Quitar
                  </Button>
                )}
              </Box>
            ))}
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1} p={1} bgcolor="#f5f5f5" borderRadius={1}>
              <strong>Total métodos de pago:</strong>
              <strong style={{ color: totalMetodosPago === form.total ? '#4caf50' : '#f44336' }}>
                ${totalMetodosPago.toFixed(2)}
              </strong>
            </Box>
            {totalMetodosPago !== form.total && (
              <Box color="error.main" fontSize="0.875rem" mt={1}>
                ⚠️ El total de métodos de pago debe coincidir con el total de la factura (${form.total})
              </Box>
            )}
          </Box>
          <TextField
            label="Detalles"
            name="detalles"
            value={form.detalles || ''}
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