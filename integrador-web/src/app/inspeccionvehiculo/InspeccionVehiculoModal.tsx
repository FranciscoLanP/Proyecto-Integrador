import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, IconButton, Box, TextField, Button, MenuItem, Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { InspeccionVehiculo, reciboVehiculoService, empleadoInformacionService } from '@/services/inspeccionVehiculoService';
import PiezaBuscador from '@/services/piezaInventarioService';


interface Props {
  open: boolean;
  defaultData?: InspeccionVehiculo;
  onClose: () => void;
  onSubmit: (data: InspeccionVehiculo) => void;
}

export default function InspeccionVehiculoModal({ open, defaultData, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<InspeccionVehiculo>(
    defaultData ?? {
      id_recibo: '',
      id_empleadoInformacion: '',
      fecha_inspeccion: new Date().toISOString().slice(0, 10),
      piezas_sugeridas: []
    }
  );

  // Estados para los datos de los dropdowns
  const [recibos, setRecibos] = useState<any[]>([]);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [piezasSugeridas, setPiezasSugeridas] = useState(
    defaultData?.piezas_sugeridas?.map(p => ({
      piezaId: p.id_pieza,
      nombre_pieza: p.nombre_pieza || '',
      cantidad: p.cantidad,
      precio_unitario: p.precio_unitario
    })) ?? []
  );

  // Cargar datos para los dropdowns
  useEffect(() => {
    if (open) {
      fetchDropdownData();
    }
  }, [open]);

  useEffect(() => {
    if (defaultData) {
      // En modo edición, extraer solo los IDs para el formulario
      const extractedForm = {
        ...defaultData,
        id_recibo: typeof defaultData.id_recibo === 'string' ? defaultData.id_recibo : (defaultData.id_recibo as any)?._id || '',
        id_empleadoInformacion: typeof defaultData.id_empleadoInformacion === 'string' ? defaultData.id_empleadoInformacion : (defaultData.id_empleadoInformacion as any)?._id || ''
      };
      setForm(extractedForm);
      setPiezasSugeridas(
        defaultData.piezas_sugeridas?.map(p => ({
          piezaId: p.id_pieza,
          nombre_pieza: p.nombre_pieza || '',
          cantidad: p.cantidad,
          precio_unitario: p.precio_unitario
        })) ?? []
      );
    } else {
      // Resetear formulario cuando no hay defaultData
      setForm({
        id_recibo: '',
        id_empleadoInformacion: '',
        fecha_inspeccion: new Date().toISOString().slice(0, 10),
        piezas_sugeridas: []
      });
      setPiezasSugeridas([]);
    }
  }, [defaultData]);

  const fetchDropdownData = async () => {
    setLoading(true);
    try {
      const [recibosData, empleadosData] = await Promise.all([
        reciboVehiculoService.fetchAll(),
        empleadoInformacionService.fetchAll()
      ]);
      setRecibos(recibosData);
      setEmpleados(empleadosData);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
    setLoading(false);
  };

  const handleSave = () => {
    onSubmit({
      ...form,
      piezas_sugeridas: piezasSugeridas.map(p => ({
        id_pieza: p.piezaId,
        nombre_pieza: p.nombre_pieza,
        cantidad: p.cantidad,
        precio_unitario: p.precio_unitario
      }))
    });
  };

  const handleCantidadChange = (i: number, cantidad: number) => {
    setPiezasSugeridas(prev => {
      const arr = [...prev];
      arr[i] = { ...arr[i], cantidad };
      return arr;
    });
  };

  const handlePrecioUnitarioChange = (i: number, precio: number) => {
    setPiezasSugeridas(prev => {
      const arr = [...prev];
      arr[i] = { ...arr[i], precio_unitario: precio };
      return arr;
    });
  };

  const quitarPieza = (i: number) => {
    setPiezasSugeridas(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleAddPieza = () => {
    setPiezasSugeridas(prev => [
      ...prev,
      { piezaId: '', nombre_pieza: '', cantidad: 1, precio_unitario: 0 }
    ]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const calcularCostoTotal = () => {
    return piezasSugeridas.reduce((total, pieza) =>
      total + (pieza.cantidad * pieza.precio_unitario), 0
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ position: 'relative', pr: 6 }}>
        {defaultData ? 'Editar Inspección' : 'Nueva Inspección'}
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          {/* Campos básicos */}
          <TextField
            select
            label="Recibo"
            name="id_recibo"
            value={form.id_recibo}
            onChange={handleChange}
            required
            fullWidth
            disabled={loading}
          >
            {recibos.map(recibo => {
              // Extraer información del recibo para mostrar info descriptiva
              const infoText = (() => {
                if (recibo.id_recepcion?.id_vehiculo?.id_cliente) {
                  const cliente = recibo.id_recepcion.id_vehiculo.id_cliente;
                  const vehiculo = recibo.id_recepcion.id_vehiculo;
                  const clienteName = cliente.nombre || 'Cliente sin nombre';
                  const vehiculoInfo = vehiculo.id_modelo?.nombre_modelo || 'Modelo desconocido';
                  return `${clienteName} | ${vehiculoInfo}`;
                }
                return `${recibo._id} - ${recibo.observaciones || 'Sin observaciones'}`;
              })();

              return (
                <MenuItem key={recibo._id} value={recibo._id}>
                  {infoText}
                </MenuItem>
              );
            })}
          </TextField>

          <TextField
            select
            label="Empleado"
            name="id_empleadoInformacion"
            value={form.id_empleadoInformacion}
            onChange={handleChange}
            required
            fullWidth
            disabled={loading}
          >
            {empleados.map(empleado => (
              <MenuItem key={empleado._id} value={empleado._id}>
                {`${empleado.nombre} (${empleado.tipo_empleado || 'N/A'})`}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Fecha Inspección"
            name="fecha_inspeccion"
            type="date"
            value={form.fecha_inspeccion}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          {/* Más campos... */}
          <TextField
            label="Comentario"
            name="comentario"
            value={form.comentario ?? ''}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
          />

          <Box display="flex" gap={2}>
            <TextField
              label="Tiempo estimado (dias)"
              name="tiempo_estimado"
              type="number"
              value={form.tiempo_estimado ?? ''}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Costo mano de obra"
              name="costo_mano_obra"
              type="number"
              value={form.costo_mano_obra ?? ''}
              onChange={handleChange}
              fullWidth
            />
          </Box>

          <TextField
            label="Descripcion"
            name="resultado"
            value={form.resultado ?? ''}
            onChange={handleChange}
            fullWidth
          />

          {/* Piezas sugeridas */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <strong>Piezas sugeridas</strong>
                <Alert severity="info" sx={{ mt: 1 }}>
                  Las piezas sugeridas NO afectan el inventario. Solo son recomendaciones.
                </Alert>
              </Box>
              <Button
                onClick={handleAddPieza}
                size="small"
                variant="outlined"
                startIcon={<AddIcon />}
              >
                Agregar pieza
              </Button>
            </Box>

            {piezasSugeridas.map((pieza, i) => (
              <Box
                key={i}
                sx={{
                  display: 'flex',
                  gap: 1,
                  alignItems: 'flex-start',
                  mb: 2,
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  backgroundColor: '#fafafa'
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <PiezaBuscador
                    value={pieza.piezaId}
                    onChange={(id, data) => {
                      console.log('🔍 Pieza seleccionada:', data); // Debug
                      console.log('🏷️ Campos disponibles:', Object.keys(data || {})); // Ver qué campos tiene

                      setPiezasSugeridas(prev => {
                        const arr = [...prev];

                        // Probar diferentes campos de precio
                        const precioUsar = data?.costo_promedio ??
                          data?.precio ??
                          data?.costo_promedio ?? 0;

                        console.log('💰 Precio que se va a asignar:', precioUsar); // Debug

                        arr[i] = {
                          ...arr[i],
                          piezaId: id,
                          nombre_pieza: data?.nombre_pieza || '',
                          precio_unitario: precioUsar
                        };

                        console.log('✅ Estado actualizado:', arr[i]); // Debug
                        return arr;
                      });
                    }}
                    size="small"
                    placeholder="Busca y selecciona una pieza..."
                  />
                </Box>
                <TextField
                  label="Cantidad"
                  type="number"
                  size="small"
                  value={pieza.cantidad}
                  onChange={e => handleCantidadChange(i, Number(e.target.value))}
                  sx={{ width: 100 }}
                  inputProps={{ min: 1 }}
                />
                <TextField
                  label="Precio unit."
                  type="number"
                  size="small"
                  value={pieza.precio_unitario ?? ''}
                  sx={{ width: 120 }}
                  inputProps={{ min: 0, step: 0.01, readOnly: true }}
                  helperText="Precio del inventario"
                  disabled
                />
                <IconButton
                  color="error"
                  onClick={() => quitarPieza(i)}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}

            {piezasSugeridas.length > 0 && (
              <Box sx={{ mt: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                <strong>Costo estimado de piezas: ${calcularCostoTotal().toFixed(2)}</strong>
              </Box>
            )}
          </Box>
        </Box>

        <Box mt={2} display="flex" justifyContent="flex-end" gap={2}>
          <Button onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained">Guardar</Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}