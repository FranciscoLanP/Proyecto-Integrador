import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, IconButton, Box, TextField, Button, MenuItem, Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ReparacionVehiculo, inspeccionVehiculoService, empleadoInformacionService } from '@/services/reparacionVehiculoService';
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
    id_empleadoInformacion: '',
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
        id_empleadoInformacion: '',
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
          id_empleadoInformacion: '',
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
        let piezasUsadas = defaultData.piezas_usadas;

        if (Array.isArray(piezasUsadas) && piezasUsadas.length > 0) {
          // Si las piezas ya son objetos completos (con populate), extraer solo id_pieza y cantidad
          if (typeof piezasUsadas[0] === 'object' && piezasUsadas[0]?.id_pieza) {
            piezasUsadas = piezasUsadas.map((p: any) => ({
              id_pieza: p.id_pieza,
              cantidad: p.cantidad
            }));
          }
          // Si son solo IDs de string, hacer fetch individual (fallback)
          else if (typeof piezasUsadas[0] === 'string') {
            const detalles = await Promise.all(
              piezasUsadas.map(async (id) => {
                try {
                  const res = await fetch(`/api/piezas-usadas/${id}`);
                  if (!res.ok) return null;
                  const data = await res.json();
                  return { id_pieza: data.id_pieza, cantidad: data.cantidad };
                } catch {
                  return null;
                }
              })
            );
            piezasUsadas = detalles.filter(Boolean) as Array<{ id_pieza: string; cantidad: number; }>;
          }
        }

        setForm({
          ...defaultData,
          // 🔥 EXTRAER solo los IDs de los objetos poblados
          id_inspeccion: typeof defaultData.id_inspeccion === 'object'
            ? (defaultData.id_inspeccion as any)?._id || defaultData.id_inspeccion
            : defaultData.id_inspeccion,
          id_empleadoInformacion: typeof defaultData.id_empleadoInformacion === 'object'
            ? (defaultData.id_empleadoInformacion as any)?._id || defaultData.id_empleadoInformacion
            : defaultData.id_empleadoInformacion,
          fecha_inicio: defaultData.fecha_inicio ? new Date(defaultData.fecha_inicio).toISOString().slice(0, 10) : '',
          fecha_fin: defaultData.fecha_fin ? new Date(defaultData.fecha_fin).toISOString().slice(0, 10) : '',
          piezas_usadas: piezasUsadas ?? []
        });
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
                {empleado.nombre}
              </MenuItem>
            ))}
          </TextField>

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