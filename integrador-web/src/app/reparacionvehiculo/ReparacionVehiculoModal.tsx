import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, IconButton, Box, TextField, Button, MenuItem, Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
  // 🔥 Estado inicial limpio - se resetea en useEffect
  const [form, setForm] = useState<ReparacionVehiculo>({
    id_inspeccion: '',
    empleados_trabajos: [{ id_empleado: '', descripcion_trabajo: '' }],
    fecha_inicio: new Date().toISOString().slice(0, 10),
    descripcion: '',
    piezas_usadas: []
  });

  // Estados para los datos de los dropdowns
  const [inspecciones, setInspecciones] = useState<any[]>([]);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [piezasCatalogo, setPiezasCatalogo] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔥 RESETEAR formulario cuando el modal se cierra
  useEffect(() => {
    if (!open) {
      setForm({
        id_inspeccion: '',
        empleados_trabajos: [{ id_empleado: '', descripcion_trabajo: '' }],
        fecha_inicio: new Date().toISOString().slice(0, 10),
        descripcion: '',
        piezas_usadas: []
      });
    }
  }, [open]);

  // Cargar datos para los dropdowns
  useEffect(() => {
    if (open) {
      fetchDropdownData();
      piezaInventarioService.fetchAll().then(setPiezasCatalogo).catch(() => setPiezasCatalogo([]));

      // 🔥 RESETEAR formulario cuando es nueva reparación
      if (!defaultData) {
        setForm({
          id_inspeccion: '',
          empleados_trabajos: [{ id_empleado: '', descripcion_trabajo: '' }],
          fecha_inicio: new Date().toISOString().slice(0, 10),
          descripcion: '',
          piezas_usadas: []
        });
      }
    }
  }, [open, defaultData]);

  useEffect(() => {
    if (defaultData) {
      // Procesar piezas usadas según su formato
      const cargarPiezasUsadas = async () => {
        let piezasUsadas = defaultData.piezas_usadas || [];

        console.log('🔧 Procesando piezas usadas:', piezasUsadas);

        if (Array.isArray(piezasUsadas) && piezasUsadas.length > 0) {
          // Si las piezas tienen formato completo con id_pieza
          if (piezasUsadas[0]?.id_pieza) {
            piezasUsadas = piezasUsadas.map((p: any) => ({
              id_pieza: typeof p.id_pieza === 'object' && p.id_pieza._id
                ? p.id_pieza._id
                : p.id_pieza,
              cantidad: p.cantidad || 1
            }));
          }
          // Si son objetos pero sin id_pieza directa (fallback)
          else if (typeof piezasUsadas[0] === 'object') {
            piezasUsadas = piezasUsadas.map((p: any) => ({
              id_pieza: p._id || p.id || '',
              cantidad: p.cantidad || 1
            }));
          }
        }

        console.log('🔧 Piezas procesadas:', piezasUsadas);

        // Procesar empleados trabajos
        let empleadosTrabajos = defaultData.empleados_trabajos || [];

        // Compatibilidad con campo anterior
        if ((!empleadosTrabajos || empleadosTrabajos.length === 0) && defaultData.id_empleadoInformacion) {
          const empleadoId = typeof defaultData.id_empleadoInformacion === 'object'
            ? (defaultData.id_empleadoInformacion as any)?._id || defaultData.id_empleadoInformacion
            : defaultData.id_empleadoInformacion;

          empleadosTrabajos = [{
            id_empleado: empleadoId,
            descripcion_trabajo: 'Trabajo general de reparación'
          }];
        }

        // Procesar empleados poblados
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
          // 🔥 EXTRAER solo los IDs de los objetos poblados
          id_inspeccion: typeof defaultData.id_inspeccion === 'object'
            ? (defaultData.id_inspeccion as any)?._id || defaultData.id_inspeccion
            : defaultData.id_inspeccion || '',
          empleados_trabajos: empleadosTrabajos,
          fecha_inicio: defaultData.fecha_inicio ? new Date(defaultData.fecha_inicio).toISOString().slice(0, 10) : '',
          fecha_fin: defaultData.fecha_fin ? new Date(defaultData.fecha_fin).toISOString().slice(0, 10) : '',
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

  // 🔥 NUEVO useEffect: Cargar piezas cuando cambie la inspección en el form
  useEffect(() => {
    // Solo ejecutar si:
    // 1. Hay una inspección seleccionada
    // 2. Las inspecciones están cargadas
    // 3. El modal está abierto
    // 4. NO es una edición (defaultData está undefined/null)
    // 5. NO hay piezas usadas ya en el formulario
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
          piezas_usadas: inspeccionSeleccionada.piezas_sugeridas.map((pieza: any) => ({
            id_pieza: pieza.id_pieza,
            cantidad: pieza.cantidad
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

  // Manejo de empleados trabajos
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

  // Manejo de piezas usadas
  const handleAddPieza = () => {
    setForm(f => ({
      ...f,
      piezas_usadas: [
        ...(f.piezas_usadas ?? []),
        { id_pieza: '', cantidad: 1 }
      ]
    }));
  };

  const handlePiezaChange = (idx: number, field: string, value: any, piezaData?: any) => {
    setForm(f => ({
      ...f,
      piezas_usadas: f.piezas_usadas?.map((p, i) =>
        i === idx ? {
          ...p,
          [field]: value
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

  // 🔥 NUEVA FUNCIÓN: Manejar cambio de inspección
  const handleInspeccionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inspeccionId = e.target.value;
    const inspeccionSeleccionada = inspecciones.find(i => i._id === inspeccionId);
    setForm(f => ({
      ...f,
      id_inspeccion: inspeccionId,
      // Solo autollenar piezas si no es edición
      piezas_usadas: defaultData
        ? f.piezas_usadas // Si es edición, no tocar piezas
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ position: 'relative', pr: 6 }}>
        {defaultData ? 'Editar Reparación' : 'Nueva Reparación'}
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            select
            label="Inspección"
            name="id_inspeccion"
            value={form.id_inspeccion}
            onChange={handleInspeccionChange} // 🔥 Usar la nueva función
            required
            fullWidth
            disabled={loading}
          >
            {inspecciones.map(inspeccion => {
              // Construir descripción rica de la inspección
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

          {/* Empleados trabajos */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <strong>Empleados y trabajos realizados</strong>
              <Button onClick={handleAddEmpleado} size="small" variant="outlined">Agregar empleado</Button>
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
                    sx={{ minWidth: 200 }}
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
                    sx={{ flex: 1 }}
                    placeholder="Describe el trabajo realizado por este empleado..."
                  />
                  {(form.empleados_trabajos?.length ?? 0) > 1 && (
                    <Button
                      color="error"
                      onClick={() => handleRemoveEmpleado(idx)}
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      Quitar
                    </Button>
                  )}
                </Box>
              );
            })}
          </Box>

          <TextField
            label="Fecha inicio"
            name="fecha_inicio"
            type="date"
            value={form.fecha_inicio}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Fecha fin"
            name="fecha_fin"
            type="date"
            value={form.fecha_fin ?? ''}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Descripción"
            name="descripcion"
            value={form.descripcion}
            onChange={handleChange}
            required
            fullWidth
            multiline
            minRows={2}
          />
          <TextField
            label="Costo total"
            name="costo_total"
            type="number"
            value={form.costo_total ?? ''}
            onChange={handleChange}
            fullWidth
          />

          {/* Piezas usadas */}
          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Box>
                <strong>Piezas usadas</strong>
                <Alert severity="warning" sx={{ mt: 1 }}>
                  ⚠️ Las piezas usadas SÍ descuentan del inventario al guardar la reparación.
                </Alert>
              </Box>
              <Button onClick={handleAddPieza} size="small" variant="outlined">Agregar pieza</Button>
            </Box>
            {(form.piezas_usadas ?? []).map((pieza, idx) => {
              // Buscar el nombre de la pieza por id
              const piezaInfo = piezasCatalogo.find(p => p._id === pieza.id_pieza);
              return (
                <Box key={idx} display="flex" gap={1} mb={1} alignItems="center">
                  <Box sx={{ minWidth: 300 }}>
                    <PiezaBuscador
                      value={pieza.id_pieza}
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
                    sx={{ width: 120 }}
                  />
                  <Button color="error" onClick={() => handleRemovePieza(idx)} size="small">Quitar</Button>
                </Box>
              );
            })}
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