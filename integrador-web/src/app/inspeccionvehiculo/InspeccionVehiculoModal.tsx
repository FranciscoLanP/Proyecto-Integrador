import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, MenuItem, Alert, Typography, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { InspeccionVehiculo, reciboVehiculoService, empleadoInformacionService } from '@/services/inspeccionVehiculoService';
import PiezaBuscador from '@/services/piezaInventarioService';
import { ModernModal } from '@/components/ModernModal';


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

  useEffect(() => {
    if (open) {
      fetchDropdownData();
    }
  }, [open]);

  useEffect(() => {
    if (defaultData) {
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
      title={isEdit ? 'Editar Inspección' : 'Nueva Inspección'}
    >
      <Box display="flex" flexDirection="column" gap={3}>
        {/* Sección de Información Básica */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.dark' }}>
            Información de la Inspección
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              select
              label="Recibo"
              name="id_recibo"
              value={form.id_recibo}
              onChange={handleChange}
              required
              fullWidth
              disabled={loading}
              sx={textFieldStyle}
            >
              {recibos.map(recibo => {
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
              sx={textFieldStyle}
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
              sx={textFieldStyle}
            />
          </Box>
        </Box>

        {/* Sección de Detalles de la Inspección */}
        <Box>
          <Typography variant="h6" sx={{ mb: 2, color: 'primary.dark' }}>
            Detalles de la Inspección
          </Typography>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Comentario"
              name="comentario"
              value={form.comentario ?? ''}
              onChange={handleChange}
              fullWidth
              multiline
              rows={2}
              sx={textFieldStyle}
              placeholder="Observaciones durante la inspección..."
            />

            <Box display="flex" gap={2}>
              <TextField
                label="Tiempo estimado (días)"
                name="tiempo_estimado"
                type="number"
                value={form.tiempo_estimado ?? ''}
                onChange={handleChange}
                fullWidth
                sx={textFieldStyle}
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Costo mano de obra"
                name="costo_mano_obra"
                type="number"
                value={form.costo_mano_obra ?? ''}
                onChange={handleChange}
                fullWidth
                sx={textFieldStyle}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Box>

            <TextField
              label="Descripción del resultado"
              name="resultado"
              value={form.resultado ?? ''}
              onChange={handleChange}
              fullWidth
              sx={textFieldStyle}
              placeholder="Descripción detallada del resultado de la inspección..."
            />
          </Box>
        </Box>

        {/* Sección de Piezas Sugeridas */}
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography variant="h6" sx={{ color: 'primary.dark' }}>
                Piezas Sugeridas
              </Typography>
              <Alert
                severity="info"
                sx={{
                  mt: 1,
                  borderRadius: '8px',
                  backgroundColor: 'rgba(33, 150, 243, 0.1)'
                }}
              >
                Las piezas sugeridas NO afectan el inventario. Solo son recomendaciones.
              </Alert>
            </Box>
            <Button
              onClick={handleAddPieza}
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{
                borderRadius: '20px',
                minWidth: '140px'
              }}
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
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Box sx={{ flex: 1 }}>
                <PiezaBuscador
                  value={pieza.piezaId}
                  onChange={(id, data) => {
                    console.log('🔍 Pieza seleccionada:', data);
                    console.log('🏷️ Campos disponibles:', Object.keys(data || {}));

                    setPiezasSugeridas(prev => {
                      const arr = [...prev];

                      const precioUsar = data?.costo_promedio ??
                        data?.precio ??
                        data?.costo_promedio ?? 0;

                      console.log('💰 Precio que se va a asignar:', precioUsar);

                      arr[i] = {
                        ...arr[i],
                        piezaId: id,
                        nombre_pieza: data?.nombre_pieza || '',
                        precio_unitario: precioUsar
                      };

                      console.log('✅ Estado actualizado:', arr[i]);
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
                sx={{
                  width: 100,
                  ...textFieldStyle
                }}
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Precio unit."
                type="number"
                size="small"
                value={pieza.precio_unitario ?? ''}
                sx={{
                  width: 120,
                  ...textFieldStyle
                }}
                inputProps={{ min: 0, step: 0.01, readOnly: true }}
                helperText="Precio del inventario"
                disabled
              />
              <IconButton
                color="error"
                onClick={() => quitarPieza(i)}
                size="small"
                sx={{
                  mt: 1,
                  borderRadius: '50%',
                  '&:hover': {
                    backgroundColor: 'rgba(244, 67, 54, 0.1)'
                  }
                }}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}

          {piezasSugeridas.length > 0 && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(21, 101, 192, 0.1) 100%)',
                borderRadius: '12px',
                border: '1px solid rgba(33, 150, 243, 0.2)'
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'primary.dark' }}>
                Costo estimado de piezas: ${calcularCostoTotal().toFixed(2)}
              </Typography>
            </Box>
          )}
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
            sx={{
              borderRadius: '25px',
              minWidth: '100px',
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
              }
            }}
          >
            Guardar
          </Button>
        </Box>
      </Box>
    </ModernModal>
  );
}