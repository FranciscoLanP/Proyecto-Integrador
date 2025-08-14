import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, MenuItem, Typography
} from '@mui/material';
import { Factura, MetodoPago, reparacionVehiculoService } from '@/services/facturaService';
import { ModernModal } from '@/components/ModernModal';

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

  const calcularTotalReparacion = (reparacion: any, descuentoPorcentaje: number = 0): number => {
    if (!reparacion) return 0;

    const inspeccion = reparacion.id_inspeccion;
    const costoManoObra = inspeccion?.costo_mano_obra || 0;

    let totalPiezas = 0;
    if (reparacion.piezas_usadas?.length > 0) {
      totalPiezas = reparacion.piezas_usadas.reduce((sum: number, pieza: any) => {
        const precio = pieza.precio_unitario || pieza.id_pieza?.costo_promedio || 0;
        const cantidad = pieza.cantidad || 1;
        return sum + (precio * cantidad);
      }, 0);
    }

    const subtotalSinImpuestos = costoManoObra + totalPiezas;

    const montoDescuento = subtotalSinImpuestos * (descuentoPorcentaje / 100);
    const subtotalConDescuento = subtotalSinImpuestos - montoDescuento;

    const itbis = subtotalConDescuento * 0.18;
    const totalConItbis = subtotalConDescuento + itbis;

    console.log(`💰 Cálculo de total para reparación:`, {
      reparacionId: reparacion._id,
      inspeccionId: inspeccion?._id,
      costoManoObra,
      totalPiezas,
      subtotalSinImpuestos,
      descuentoPorcentaje,
      montoDescuento,
      subtotalConDescuento,
      itbis,
      totalConItbis,
      piezasUsadas: reparacion.piezas_usadas?.length || 0
    });

    return totalConItbis;
  };
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchDropdownData();
    }
  }, [open]);

  useEffect(() => {
    if (defaultData && reparaciones.length > 0) {
      let metodosPago = defaultData.metodos_pago || [];

      if ((!metodosPago || metodosPago.length === 0) && defaultData.metodo_pago) {
        metodosPago = [{
          tipo: defaultData.metodo_pago as any,
          monto: defaultData.total || 0
        }];
      }

      let reparacionId = '';
      if (typeof defaultData.id_reparacion === 'object' && defaultData.id_reparacion) {
        reparacionId = (defaultData.id_reparacion as any)?._id || '';
      } else {
        reparacionId = defaultData.id_reparacion || '';
      }

      const reparacionSeleccionada = reparaciones.find(r => r._id === reparacionId);
      const totalCorrecto = reparacionSeleccionada ?
        calcularTotalReparacion(reparacionSeleccionada, defaultData.descuento_porcentaje || 0) :
        defaultData.total || 0;

      console.log('🔧 Recalculando total para edición:', {
        reparacionId,
        costoReparacionBD: reparacionSeleccionada?.costo_total,
        totalCalculado: totalCorrecto,
        totalAnterior: defaultData.total,
        descuento: defaultData.descuento_porcentaje
      });

      const processedData = {
        ...defaultData,
        metodos_pago: metodosPago.map((mp, idx) =>
          idx === 0 ? { ...mp, monto: totalCorrecto } : mp
        ),
        tipo_factura: defaultData.tipo_factura || 'Contado',
        id_reparacion: reparacionId,
        detalles: defaultData.detalles || '',
        fecha_emision: defaultData.fecha_emision?.split('T')[0] || new Date().toISOString().slice(0, 10),
        total: totalCorrecto,
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

  const totalMetodosPago = form.metodos_pago.reduce((sum, mp) => sum + (mp.monto || 0), 0);

  const handleReparacionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reparacionId = e.target.value;
    const reparacionSeleccionada = reparaciones.find(r => r._id === reparacionId);

    const nuevoTotal = reparacionSeleccionada ?
      calcularTotalReparacion(reparacionSeleccionada, form.descuento_porcentaje || 0) :
      form.total;

    setForm(f => ({
      ...f,
      id_reparacion: reparacionId,
      total: nuevoTotal,
      metodos_pago: f.metodos_pago.map((mp, idx) =>
        idx === 0 ? { ...mp, monto: nuevoTotal } : mp
      )
    }));
  };

  const handleSave = () => {
    if (!form.id_reparacion) {
      alert('Debe seleccionar una reparación');
      return;
    }

    if (!form.fecha_emision) {
      alert('Debe especificar la fecha de emisión');
      return;
    }

    if (!form.total || form.total <= 0) {
      alert('El total debe ser mayor que 0');
      return;
    }

    if (Math.abs(totalMetodosPago - form.total) > 0.01) {
      alert('El total de métodos de pago debe coincidir con el total de la factura');
      return;
    }

    if (form.metodos_pago.length === 0) {
      alert('Debe agregar al menos un método de pago');
      return;
    }

    console.log('🔍 Estado del formulario antes de enviar:', {
      formCompleto: form,
      tipo_factura_form: form.tipo_factura,
      tipo_factura_typeof: typeof form.tipo_factura
    });

    const dataToSubmit = {
      ...form,
      metodo_pago: form.metodos_pago[0]?.tipo || 'Efectivo',
      id_reparacion: form.id_reparacion || '',
      fecha_emision: form.fecha_emision || new Date().toISOString().slice(0, 10),
      total: Number(form.total) || 0,
      tipo_factura: form.tipo_factura || 'Contado'
    };

    console.log('🧾 Datos enviados al backend:', {
      dataToSubmit,
      tipo_factura_final: dataToSubmit.tipo_factura
    });
    onSubmit(dataToSubmit);
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
    <ModernModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Factura' : 'Nueva Factura'}
    >
      <Box display="flex" flexDirection="column" gap={3}>
        {/* Sección de Información Básica */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.dark' }}>
            Información de la Factura
          </Typography>
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
              sx={textFieldStyle}
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

            <Box display="flex" gap={2}>
              <TextField
                label="Fecha de emisión"
                name="fecha_emision"
                type="date"
                value={form.fecha_emision || ''}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={form.emitida}
                sx={textFieldStyle}
              />
              <TextField
                label="Total"
                name="total"
                type="number"
                value={form.total || 0}
                onChange={handleChange}
                fullWidth
                disabled={form.emitida}
                sx={textFieldStyle}
              />
            </Box>

            <Box display="flex" gap={2}>
              <TextField
                select
                label="Tipo de Factura"
                name="tipo_factura"
                value={form.tipo_factura || 'Contado'}
                onChange={handleChange}
                required
                fullWidth
                disabled={form.emitida}
                sx={textFieldStyle}
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
                sx={textFieldStyle}
              />
            </Box>
          </Box>
        </Box>

        {/* Sección de Métodos de Pago */}
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" sx={{ color: 'primary.dark' }}>
              Métodos de Pago
            </Typography>
            <Button
              onClick={handleAddMetodoPago}
              size="small"
              variant="outlined"
              sx={{ borderRadius: '20px' }}
            >
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
                sx={{
                  minWidth: 130,
                  ...textFieldStyle
                }}
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
                sx={{
                  width: 120,
                  ...textFieldStyle
                }}
                inputProps={{ min: 0, step: 0.01 }}
              />
              {(metodoPago.tipo === 'Transferencia' || metodoPago.tipo === 'Cheque') && (
                <TextField
                  label="Referencia"
                  value={metodoPago.referencia || ''}
                  onChange={e => handleMetodoPagoChange(idx, 'referencia', e.target.value)}
                  size="small"
                  sx={{
                    flex: 1,
                    ...textFieldStyle
                  }}
                  placeholder={metodoPago.tipo === 'Cheque' ? 'N° Cheque' : 'N° Transferencia'}
                />
              )}
              {form.metodos_pago.length > 1 && (
                <Button
                  color="error"
                  onClick={() => handleRemoveMetodoPago(idx)}
                  size="small"
                  sx={{ borderRadius: '20px' }}
                >
                  Quitar
                </Button>
              )}
            </Box>
          ))}

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={2}
            p={2}
            sx={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,240,240,0.9) 100%)',
              borderRadius: '12px',
              border: '1px solid rgba(0,0,0,0.1)'
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Total métodos de pago:
            </Typography>
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              sx={{
                color: totalMetodosPago === form.total ? '#4caf50' : '#f44336'
              }}
            >
              ${totalMetodosPago.toFixed(2)}
            </Typography>
          </Box>

          {totalMetodosPago !== form.total && (
            <Box
              sx={{
                color: 'error.main',
                fontSize: '0.875rem',
                mt: 1,
                p: 1,
                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                borderRadius: '8px'
              }}
            >
              ⚠️ El total de métodos de pago debe coincidir con el total de la factura (${form.total})
            </Box>
          )}
        </Box>

        {/* Sección de Detalles Adicionales */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.dark' }}>
            Detalles Adicionales
          </Typography>
          <TextField
            label="Detalles"
            name="detalles"
            value={form.detalles || ''}
            onChange={handleChange}
            fullWidth
            multiline
            minRows={3}
            disabled={form.emitida}
            sx={textFieldStyle}
            placeholder="Información adicional sobre la factura..."
          />
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
            onClick={onClose}
            sx={{
              borderRadius: '25px',
              minWidth: '100px'
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={form.emitida || loading}
            sx={{
              borderRadius: '25px',
              minWidth: '100px',
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
              }
            }}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </Box>
      </Box>
    </ModernModal>
  );
}