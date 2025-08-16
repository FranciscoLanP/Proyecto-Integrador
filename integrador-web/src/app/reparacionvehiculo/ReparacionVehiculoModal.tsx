import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Button, MenuItem, Alert
} from '@mui/material';
import ModernModal from '@/components/ModernModal/ModernModal';
import { ReparacionVehiculo, EmpleadoTrabajo, inspeccionVehiculoService, empleadoInformacionService } from '@/services/reparacionVehiculoService';
import PiezaBuscador from '@/services/piezaInventarioService';
import { piezaInventarioService } from '@/services/reparacionVehiculoService';

interface Props {
  open: boolean;
  defaultData?: ReparacionVehiculo;
  onClose: () => void;
  onSubmit: (data: ReparacionVehiculo) => void;
}

export default function ReparacionVehiculoModal({ open, defaultData, onClose, onSubmit }: Props) {
  // Estilo moderno para TextFields con bordes visibles y tema adaptativo
  const textFieldStyle = {
    '& .MuiInputLabel-root': {
      zIndex: 1,
      backgroundColor: 'transparent',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'rgba(0, 0, 0, 0.23)',
        borderWidth: '2px',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(0, 0, 0, 0.6)',
        borderWidth: '2px',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1976d2',
        borderWidth: '2px',
      },
    },
  };

  // 🔥 Estado inicial limpio - se resetea en useEffect
  const [form, setForm] = useState<ReparacionVehiculo>({
    id_inspeccion: '',
    empleados_trabajos: [{ id_empleado: '', descripcion_trabajo: '' }],
    descripcion: '',
    piezas_usadas: []
  });

  // Estados para los datos de los dropdowns
  const [inspecciones, setInspecciones] = useState<any[]>([]);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [piezasCatalogo, setPiezasCatalogo] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setForm({
        id_inspeccion: '',
        empleados_trabajos: [{ id_empleado: '', descripcion_trabajo: '' }],
        descripcion: '',
        piezas_usadas: []
      });
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      fetchDropdownData();
      piezaInventarioService.fetchAll().then(setPiezasCatalogo).catch(() => setPiezasCatalogo([]));

      if (!defaultData) {
        setForm({
          id_inspeccion: '',
          empleados_trabajos: [{ id_empleado: '', descripcion_trabajo: '' }],
          descripcion: '',
          piezas_usadas: []
        });
      }
    }
  }, [open, defaultData]);

  useEffect(() => {
    if (defaultData) {
      const cargarPiezasUsadas = async () => {
        let piezasUsadas = defaultData.piezas_usadas || [];

        console.log('🔧 Procesando piezas usadas:', piezasUsadas);

        if (Array.isArray(piezasUsadas) && piezasUsadas.length > 0) {
          if (piezasUsadas[0]?.id_pieza) {
            piezasUsadas = piezasUsadas.map((p: any, index: number) => ({
              _id: p._id || `temp_${index}`,
              id_pieza: typeof p.id_pieza === 'object'
                ? {
                  _id: p.id_pieza._id || '',
                  nombre_pieza: p.id_pieza.nombre_pieza || '',
                  costo_promedio: p.id_pieza.costo_promedio || 0,
                  precio: p.id_pieza.precio
                }
                : {
                  _id: p.id_pieza || '',
                  nombre_pieza: '',
                  costo_promedio: 0
                },
              cantidad: p.cantidad || 1,
              origen: p.origen || 'reparacion' as 'inspeccion' | 'reparacion',
              referencia: p.referencia || `REF_${index}`,
              precio_utilizado: p.precio_utilizado || p.precio_unitario
            }));
          }
          else if (typeof piezasUsadas[0] === 'object') {
            piezasUsadas = piezasUsadas.map((p: any, index: number) => ({
              _id: p._id || `temp_${index}`,
              id_pieza: {
                _id: p._id || p.id || '',
                nombre_pieza: p.nombre_pieza || '',
                costo_promedio: p.costo_promedio || 0
              },
              cantidad: p.cantidad || 1,
              origen: 'reparacion' as 'inspeccion' | 'reparacion',
              referencia: `REF_${index}`,
              precio_utilizado: p.costo_promedio || 0
            }));
          }
        }

        console.log('🔧 Piezas procesadas:', piezasUsadas);

        let empleadosTrabajos = defaultData.empleados_trabajos || [];

        if ((!empleadosTrabajos || empleadosTrabajos.length === 0) && defaultData.id_empleadoInformacion) {
          const empleadoId = typeof defaultData.id_empleadoInformacion === 'object'
            ? (defaultData.id_empleadoInformacion as any)?._id || defaultData.id_empleadoInformacion
            : defaultData.id_empleadoInformacion;

          empleadosTrabajos = [{
            id_empleado: empleadoId,
            descripcion_trabajo: 'Trabajo general de reparación'
          }];
        }

        if (empleadosTrabajos.length > 0) {
          empleadosTrabajos = empleadosTrabajos.map((emp: any) => ({
            id_empleado: typeof emp.id_empleado === 'object'
              ? emp.id_empleado._id || emp.id_empleado
              : emp.id_empleado,
            descripcion_trabajo: emp.descripcion_trabajo || 'Trabajo general'
          }));
        }

        const processedForm = {
          ...defaultData,
          id_inspeccion: typeof defaultData.id_inspeccion === 'object'
            ? (defaultData.id_inspeccion as any)?._id || defaultData.id_inspeccion
            : defaultData.id_inspeccion || '',
          empleados_trabajos: empleadosTrabajos,
          piezas_usadas: piezasUsadas,
          descripcion: defaultData.descripcion || '',
          costo_total: defaultData.costo_total || 0
        };

        console.log('🔧 Formulario procesado:', processedForm);
        setForm(processedForm);
      };
      cargarPiezasUsadas();
    }
  }, [defaultData]);

  useEffect(() => {

    if (
      form.id_inspeccion &&
      inspecciones.length > 0 &&
      open &&
      !defaultData &&
      (!form.piezas_usadas || form.piezas_usadas.length === 0)
    ) {
      const inspeccionSeleccionada = inspecciones.find(i => i._id === form.id_inspeccion);
      if (inspeccionSeleccionada?.piezas_sugeridas) {
        setForm(f => ({
          ...f,
          piezas_usadas: inspeccionSeleccionada.piezas_sugeridas.map((pieza: any, index: number) => ({
            _id: `temp_insp_${index}`,
            id_pieza: {
              _id: typeof pieza.id_pieza === 'object' ? pieza.id_pieza._id : pieza.id_pieza,
              nombre_pieza: typeof pieza.id_pieza === 'object' ? pieza.id_pieza.nombre_pieza : '',
              costo_promedio: typeof pieza.id_pieza === 'object' ? pieza.id_pieza.costo_promedio : 0
            },
            cantidad: pieza.cantidad || 1,
            origen: 'inspeccion' as 'inspeccion' | 'reparacion',
            referencia: `INSP_${index}`,
            precio_utilizado: typeof pieza.id_pieza === 'object' ? pieza.id_pieza.costo_promedio : 0
          }))
        }));
      }
    }
  }, [form.id_inspeccion, inspecciones, open, defaultData, form.piezas_usadas]);

  const fetchDropdownData = async () => {
    setLoading(true);
    try {
      const [inspeccionesData, empleadosData] = await Promise.all([
        inspeccionVehiculoService.fetchAll(),
        empleadoInformacionService.fetchAll()
      ]);
      setInspecciones(inspeccionesData);
      setEmpleados(empleadosData);
    } catch (error) {
      console.error('Error loading dropdown data:', error);
    }
    setLoading(false);
  };

  const handleAddEmpleado = () => {
    setForm(f => ({
      ...f,
      empleados_trabajos: [
        ...(f.empleados_trabajos ?? []),
        { id_empleado: '', descripcion_trabajo: '' }
      ]
    }));
  };

  const handleEmpleadoChange = (idx: number, field: keyof EmpleadoTrabajo, value: string) => {
    setForm(f => ({
      ...f,
      empleados_trabajos: f.empleados_trabajos?.map((emp, i) =>
        i === idx ? { ...emp, [field]: value } : emp
      )
    }));
  };

  const handleRemoveEmpleado = (idx: number) => {
    setForm(f => ({
      ...f,
      empleados_trabajos: f.empleados_trabajos?.filter((_, i) => i !== idx)
    }));
  };

  const handleAddPieza = () => {
    const nuevaPieza = {
      _id: `temp_${Date.now()}`,
      id_pieza: {
        _id: '',
        nombre_pieza: '',
        costo_promedio: 0
      },
      cantidad: 1,
      origen: 'reparacion' as 'inspeccion' | 'reparacion',
      referencia: `REF_${Date.now()}`,
      precio_utilizado: 0
    };

    setForm(f => ({
      ...f,
      piezas_usadas: [
        ...(f.piezas_usadas ?? []),
        nuevaPieza
      ]
    }));
  };

  const handlePiezaChange = (idx: number, field: string, value: any, piezaData?: any) => {
    setForm(f => ({
      ...f,
      piezas_usadas: f.piezas_usadas?.map((p, i) =>
        i === idx ? {
          ...p,
          [field]: value,
          // Si se está cambiando id_pieza y se proporcionan datos de la pieza
          ...(field === 'id_pieza' && piezaData ? {
            id_pieza: {
              _id: piezaData._id || value,
              nombre_pieza: piezaData.nombre_pieza || '',
              costo_promedio: piezaData.costo_promedio || 0,
              precio: piezaData.precio
            },
            precio_utilizado: piezaData.costo_promedio || 0
          } : {})
        } : p
      )
    }));
  };

  const handleRemovePieza = (idx: number) => {
    setForm(f => ({
      ...f,
      piezas_usadas: f.piezas_usadas?.filter((_, i) => i !== idx)
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleInspeccionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inspeccionId = e.target.value;
    const inspeccionSeleccionada = inspecciones.find(i => i._id === inspeccionId);
    setForm(f => ({
      ...f,
      id_inspeccion: inspeccionId,
      piezas_usadas: defaultData
        ? f.piezas_usadas
        : (inspeccionSeleccionada?.piezas_sugeridas?.map((pieza: any) => ({
          id_pieza: pieza.id_pieza,
          cantidad: pieza.cantidad
        })) ?? [])
    }));
  };

  const handleSave = () => {
    onSubmit(form);
  };

  return (
    <ModernModal
      open={open}
      onClose={onClose}
      title={defaultData ? 'Editar Reparación' : 'Nueva Reparación'}
      maxWidth="md"
    >
      <Box display="flex" flexDirection="column" gap={3}>
        {/* Sección: Información de la Reparación */}
        <Box>
          <Box sx={{ mb: 2, pb: 1, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <strong style={{ fontSize: '1.1rem' }}>Información de la Reparación</strong>
          </Box>

          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              select
              label="Inspección"
              name="id_inspeccion"
              value={form.id_inspeccion}
              onChange={handleInspeccionChange}
              required
              fullWidth
              disabled={loading}
              sx={textFieldStyle}
              helperText="Selecciona la inspección base para esta reparación"
            >
              {inspecciones.map(inspeccion => {
                const cliente = inspeccion.id_recibo?.id_recepcion?.id_vehiculo?.id_cliente;
                const vehiculo = inspeccion.id_recibo?.id_recepcion?.id_vehiculo;
                const recepcion = inspeccion.id_recibo?.id_recepcion;

                const clienteInfo = cliente?.nombre || 'Cliente desconocido';
                const vehiculoInfo = vehiculo
                  ? `${vehiculo.id_modelo?.id_marca?.nombre_marca || ''} ${vehiculo.id_modelo?.nombre_modelo || ''} ${vehiculo.anio || ''} (${vehiculo.id_color?.nombre_color || ''})`.trim()
                  : 'Vehículo desconocido';
                const problemaInfo = recepcion?.problema_reportado || inspeccion.comentario || 'Sin comentario';

                return (
                  <MenuItem key={inspeccion._id} value={inspeccion._id}>
                    {`${clienteInfo} | ${vehiculoInfo} | ${problemaInfo}`}
                  </MenuItem>
                );
              })}
            </TextField>

            <TextField
              label="Descripción"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              required
              fullWidth
              multiline
              minRows={3}
              sx={textFieldStyle}
              placeholder="Describe el trabajo de reparación realizado..."
              helperText="Descripción detallada del trabajo realizado"
            />

            <TextField
              label="Costo total"
              name="costo_total"
              type="number"
              value={form.costo_total ?? ''}
              onChange={handleChange}
              fullWidth
              sx={textFieldStyle}
              helperText="Costo total de la reparación"
              InputProps={{
                startAdornment: <span style={{ marginRight: '8px' }}>$</span>,
              }}
            />
          </Box>
        </Box>

        {/* Sección: Empleados y Trabajos */}
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} pb={1} sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <strong style={{ fontSize: '1.1rem' }}>Empleados y Trabajos Realizados</strong>
            <Button
              onClick={handleAddEmpleado}
              size="small"
              variant="outlined"
              sx={{
                borderColor: '#1976d2',
                color: '#1976d2',
                borderWidth: '2px',
                fontWeight: 'bold',
                '&:hover': {
                  borderColor: '#1565c0',
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  color: '#1565c0',
                }
              }}
            >
              Agregar empleado
            </Button>
          </Box>

          {(form.empleados_trabajos ?? []).map((empleado, idx) => {
            const empleadoInfo = empleados.find(e => e._id === empleado.id_empleado);
            return (
              <Box key={idx} display="flex" gap={1} mb={2} alignItems="flex-start">
                <TextField
                  select
                  label="Empleado"
                  value={empleado.id_empleado}
                  onChange={e => handleEmpleadoChange(idx, 'id_empleado', e.target.value)}
                  required
                  size="small"
                  sx={{ ...textFieldStyle, minWidth: 200 }}
                >
                  {empleados.map(emp => (
                    <MenuItem key={emp._id} value={emp._id}>
                      {`${emp.nombre} (${emp.tipo_empleado || 'N/A'})`}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  multiline
                  minRows={2}
                  label="Descripción del trabajo"
                  value={empleado.descripcion_trabajo}
                  onChange={e => handleEmpleadoChange(idx, 'descripcion_trabajo', e.target.value)}
                  required
                  size="small"
                  sx={{ ...textFieldStyle, flex: 1 }}
                  placeholder="Describe el trabajo realizado por este empleado..."
                />
                {(form.empleados_trabajos?.length ?? 0) > 1 && (
                  <Button
                    color="error"
                    onClick={() => handleRemoveEmpleado(idx)}
                    size="small"
                    variant="outlined"
                    sx={{
                      mt: 1,
                      minWidth: 'auto',
                      borderColor: '#d32f2f',
                      color: '#d32f2f',
                      borderWidth: '1px',
                      '&:hover': {
                        backgroundColor: 'rgba(211, 47, 47, 0.1)',
                        borderColor: '#c62828',
                        color: '#c62828',
                      }
                    }}
                  >
                    Quitar
                  </Button>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Sección: Piezas Usadas */}
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} pb={1} sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <Box>
              <strong style={{ fontSize: '1.1rem' }}>Piezas Usadas</strong>
              <Alert severity="warning" sx={{ mt: 1, backgroundColor: 'rgba(255, 152, 0, 0.1)', border: '1px solid rgba(255, 152, 0, 0.3)' }}>
                ⚠️ Las piezas usadas SÍ descuentan del inventario al guardar la reparación.
              </Alert>
            </Box>
            <Button
              onClick={handleAddPieza}
              size="small"
              variant="outlined"
              sx={{
                borderColor: '#1976d2',
                color: '#1976d2',
                borderWidth: '2px',
                fontWeight: 'bold',
                '&:hover': {
                  borderColor: '#1565c0',
                  backgroundColor: 'rgba(25, 118, 210, 0.1)',
                  color: '#1565c0',
                }
              }}
            >
              Agregar pieza
            </Button>
          </Box>

          {(form.piezas_usadas ?? []).map((pieza, idx) => {
            const piezaId = typeof pieza.id_pieza === 'object' ? pieza.id_pieza._id : pieza.id_pieza;
            const piezaInfo = piezasCatalogo.find(p => p._id === piezaId);
            return (
              <Box key={idx} display="flex" gap={1} mb={1} alignItems="center">
                <Box sx={{ minWidth: 300 }}>
                  <PiezaBuscador
                    value={piezaId}
                    onChange={(piezaId, piezaData) => handlePiezaChange(idx, 'id_pieza', piezaId, piezaData)}
                    label={piezaInfo ? `${piezaInfo.nombre_pieza}` : 'Buscar pieza'}
                    size="small"
                  />
                </Box>
                <TextField
                  label="Cantidad"
                  type="number"
                  value={pieza.cantidad}
                  onChange={e => handlePiezaChange(idx, 'cantidad', Number(e.target.value))}
                  size="small"
                  sx={{ ...textFieldStyle, width: 120 }}
                />
                <Button
                  color="error"
                  onClick={() => handleRemovePieza(idx)}
                  size="small"
                  variant="outlined"
                  sx={{
                    minWidth: 'auto',
                    borderColor: '#d32f2f',
                    color: '#d32f2f',
                    borderWidth: '1px',
                    '&:hover': {
                      backgroundColor: 'rgba(211, 47, 47, 0.1)',
                      borderColor: '#c62828',
                      color: '#c62828',
                    }
                  }}
                >
                  Quitar
                </Button>
              </Box>
            );
          })}
        </Box>

        {/* Botones de acción */}
        <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: 'rgba(0,0,0,0.5)',
              color: 'rgba(0,0,0,0.7)',
              borderWidth: '1px',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.05)',
                borderColor: 'rgba(0,0,0,0.7)',
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Guardar
          </Button>
        </Box>
      </Box>
    </ModernModal>
  );
}