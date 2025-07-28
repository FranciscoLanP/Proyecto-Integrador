import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, IconButton, Box, TextField, Button, MenuItem, Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ReparacionVehiculo, inspeccionVehiculoService, empleadoInformacionService } from '@/services/reparacionVehiculoService';
import PiezaBuscador from '@/services/piezaInventarioService';

interface Props {
  open: boolean;
  defaultData?: ReparacionVehiculo;
  onClose: () => void;
  onSubmit: (data: ReparacionVehiculo) => void;
}

export default function ReparacionVehiculoModal({ open, defaultData, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<ReparacionVehiculo>(
    defaultData ?? {
      id_inspeccion: '',
      id_empleadoInformacion: '',
      fecha_inicio: new Date().toISOString().slice(0, 10),
      descripcion: '',
      piezas_usadas: []
    }
  );

  // Estados para los datos de los dropdowns
  const [inspecciones, setInspecciones] = useState<any[]>([]);
  const [empleados, setEmpleados] = useState<any[]>([]);
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

  // 🔥 NUEVO useEffect: Cargar piezas cuando cambie la inspección en el form
  useEffect(() => {
    if (form.id_inspeccion && inspecciones.length > 0) {
      const inspeccionSeleccionada = inspecciones.find(i => i._id === form.id_inspeccion);
      
      // Solo cargar piezas si no tiene piezas ya (para evitar sobrescribir en edición)
      if (inspeccionSeleccionada?.piezas_sugeridas && (!form.piezas_usadas || form.piezas_usadas.length === 0)) {
        setForm(f => ({
          ...f,
          piezas_usadas: inspeccionSeleccionada.piezas_sugeridas.map((pieza: any) => ({
            id_pieza: pieza.id_pieza,
            cantidad: pieza.cantidad
          }))
        }));
      }
    }
  }, [form.id_inspeccion, inspecciones]); // Se ejecuta cuando cambia la inspección o se cargan las inspecciones

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
      // Siempre cargar las piezas cuando se cambia manualmente
      piezas_usadas: inspeccionSeleccionada?.piezas_sugeridas?.map((pieza: any) => ({
        id_pieza: pieza.id_pieza,
        cantidad: pieza.cantidad
      })) ?? []
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
            {inspecciones.map(inspeccion => (
              <MenuItem key={inspeccion._id} value={inspeccion._id}>
                {`${inspeccion._id} - ${inspeccion.comentario || 'Sin comentario'}`}
              </MenuItem>
            ))}
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
            {(form.piezas_usadas ?? []).map((pieza, idx) => (
              <Box key={idx} display="flex" gap={1} mb={1} alignItems="center">
                <Box sx={{ minWidth: 300 }}>
                  <PiezaBuscador
                    value={pieza.id_pieza}
                    onChange={(piezaId, piezaData) => handlePiezaChange(idx, 'id_pieza', piezaId, piezaData)}
                    label="Buscar pieza"
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
            ))}
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