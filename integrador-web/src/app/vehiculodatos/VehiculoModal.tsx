'use client';

import React, { useState, useEffect } from 'react';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Box
} from '@mui/material';
import ModernModal from '@/components/ModernModal/ModernModal';
import type {
  IVehiculoDatos,
  ICliente,
  IModelosDatos,
  IColoresDatos,
  IMarcaVehiculo
} from '../types';

interface Props {
  open: boolean;
  defaultData?: IVehiculoDatos;
  clientes: ICliente[];
  marcas: IMarcaVehiculo[];
  modelos: IModelosDatos[];
  colores: IColoresDatos[];
  onClose: () => void;
  onSubmit: (data: Partial<IVehiculoDatos>) => void;
}

const VehiculoModal: React.FC<Props> = ({
  open,
  defaultData,
  clientes,
  marcas,
  modelos,
  colores,
  onClose,
  onSubmit
}) => {
  // Estilo moderno para TextFields con bordes visibles
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

  const [chasis, setChasis] = useState('');
  const [anio, setAnio] = useState<number | ''>('');
  const [clienteId, setClienteId] = useState('');
  const [marcaId, setMarcaId] = useState('');
  const [modeloId, setModeloId] = useState('');
  const [colorId, setColorId] = useState('');
  const [chasisError, setChasisError] = useState('');

  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: currentYear - 1980 + 1 },
    (_, i) => currentYear - i
  );

  useEffect(() => {
    if (open && defaultData) {
      setChasis(defaultData.chasis ?? '');
      setAnio(defaultData.anio ?? '');

      const rawCli = defaultData.id_cliente;
      const cliVal =
        rawCli != null
          ? typeof rawCli === 'string'
            ? rawCli
            : rawCli._id
          : '';
      setClienteId(cliVal);

      const rawMod = defaultData.id_modelo;
      const modVal =
        rawMod != null
          ? typeof rawMod === 'string'
            ? rawMod
            : rawMod._id
          : '';
      setModeloId(modVal);

      const modeloEdit = modelos.find(m => m._id === modVal);
      setMarcaId(modeloEdit?.id_marca ?? '');

      const rawCol = defaultData.id_color;
      const colVal =
        rawCol != null
          ? typeof rawCol === 'string'
            ? rawCol
            : rawCol._id
          : '';
      setColorId(colVal);

      setChasisError('');
    } else {
      setChasis('');
      setAnio('');
      setClienteId('');
      setMarcaId('');
      setModeloId('');
      setColorId('');
      setChasisError('');
    }
  }, [open, defaultData, modelos]);

  const handleChasisChange = (v: string): void => {
    const s = v.toUpperCase().replace(/\s+/g, '');
    setChasis(s);
    setChasisError(s.length < 5 ? 'Chasis muy corto' : '');
  };

  const onMarcaChange = (id: string): void => {
    setMarcaId(id);
    setModeloId('');
  };

  const modelosFiltrados = modelos.filter(
    m => m.id_marca === marcaId
  );

  const disabledSave =
    !chasis.trim() ||
    anio === '' ||
    !clienteId ||
    !marcaId ||
    !modeloId ||
    !colorId ||
    !!chasisError;

  const handleSave = (): void => {
    if (!disabledSave) {
      onSubmit({
        chasis,
        anio: Number(anio),
        id_cliente: clienteId,
        id_modelo: modeloId,
        id_color: colorId
      });
    }
  };

  return (
    <ModernModal
      open={open}
      onClose={onClose}
      title={defaultData ? 'Editar Vehículo' : 'Nuevo Vehículo'}
      maxWidth="sm"
    >
      <Box display="flex" flexDirection="column" gap={3}>
        {/* Sección: Información del Vehículo */}
        <Box>
          <Box sx={{ mb: 2, pb: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
            <strong style={{ fontSize: '1.1rem' }}>Información del Vehículo</strong>
          </Box>

          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Chasis"
              value={chasis}
              onChange={e => handleChasisChange(e.target.value)}
              error={!!chasisError}
              helperText={chasisError || "Número de chasis del vehículo (mínimo 5 caracteres)"}
              required
              fullWidth
              sx={textFieldStyle}
              placeholder="Ej: JH4TB2H26CC000123"
            />

            <FormControl fullWidth required sx={textFieldStyle}>
              <InputLabel id="year-label">Año</InputLabel>
              <Select
                labelId="year-label"
                label="Año"
                value={anio}
                onChange={e => setAnio(Number(e.target.value))}
                MenuProps={{
                  PaperProps: { style: { maxHeight: 200 } }
                }}
              >
                {years.map(y => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Sección: Propietario */}
        <Box>
          <Box sx={{ mb: 2, pb: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
            <strong style={{ fontSize: '1.1rem' }}>Propietario</strong>
          </Box>

          <TextField
            select
            label="Cliente"
            value={clienteId}
            onChange={e => setClienteId(e.target.value)}
            required
            fullWidth
            sx={textFieldStyle}
            helperText="Selecciona el propietario del vehículo"
          >
            {clientes.map(c => (
              <MenuItem key={c._id} value={c._id}>
                {c.nombre}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Sección: Especificaciones */}
        <Box>
          <Box sx={{ mb: 2, pb: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
            <strong style={{ fontSize: '1.1rem' }}>Especificaciones del Vehículo</strong>
          </Box>

          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              select
              label="Marca"
              value={marcaId}
              onChange={e => onMarcaChange(e.target.value)}
              required
              fullWidth
              sx={textFieldStyle}
              helperText="Selecciona la marca del vehículo"
            >
              {marcas.map(mk => (
                <MenuItem key={mk._id} value={mk._id}>
                  {mk.nombre_marca}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Modelo"
              value={modeloId}
              onChange={e => setModeloId(e.target.value)}
              required
              fullWidth
              disabled={!marcaId}
              sx={textFieldStyle}
              helperText={!marcaId ? "Primero selecciona una marca" : "Modelos disponibles para la marca seleccionada"}
            >
              {modelosFiltrados.map(md => (
                <MenuItem key={md._id} value={md._id}>
                  {md.nombre_modelo}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Color"
              value={colorId}
              onChange={e => setColorId(e.target.value)}
              required
              fullWidth
              sx={textFieldStyle}
              helperText="Color del vehículo"
            >
              {colores.map(c => (
                <MenuItem key={c._id} value={c._id}>
                  {c.nombre_color}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>

        {/* Botones de acción */}
        <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
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
            variant="contained"
            disabled={disabledSave}
            onClick={handleSave}
            sx={{
              background: disabledSave
                ? 'rgba(0,0,0,0.12)'
                : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: disabledSave ? 'rgba(0,0,0,0.26)' : 'white',
              fontWeight: 'bold',
              '&:hover': !disabledSave ? {
                background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
              } : {},
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {defaultData ? 'Guardar cambios' : 'Crear Vehículo'}
          </Button>
        </Box>
      </Box>
    </ModernModal>
  );
};

export default VehiculoModal;
