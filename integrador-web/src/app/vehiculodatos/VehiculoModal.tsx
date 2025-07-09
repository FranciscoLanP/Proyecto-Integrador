'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Box
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ position: 'relative', pr: 6 }}>
        {defaultData ? 'Editar Vehículo' : 'Nuevo Vehículo'}
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>

          <TextField
            label="Chasis"
            value={chasis}
            onChange={e => handleChasisChange(e.target.value)}
            error={!!chasisError}
            helperText={chasisError}
            required
            fullWidth
          />

          <FormControl fullWidth required>
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

          <TextField
            select
            label="Cliente"
            value={clienteId}
            onChange={e => setClienteId(e.target.value)}
            required
            fullWidth
          >
            {clientes.map(c => (
              <MenuItem key={c._id} value={c._id}>
                {c.nombre}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Marca"
            value={marcaId}
            onChange={e => onMarcaChange(e.target.value)}
            required
            fullWidth
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
          >
            {colores.map(c => (
              <MenuItem key={c._id} value={c._id}>
                {c.nombre_color}
              </MenuItem>
            ))}
          </TextField>

        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={disabledSave}
          onClick={handleSave}
        >
          {defaultData ? 'Guardar cambios' : 'Crear Vehículo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default VehiculoModal;
