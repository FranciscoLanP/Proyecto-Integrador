'use client';

import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Chip
} from '@mui/material';
import { createCrudService } from '@/services/crudService';

interface Pieza {
  _id: string;
  nombre_pieza: string;
  precio?: number;          // Mantener por compatibilidad
  costo_promedio?: number;  // ← Agregar este campo
  cantidad_disponible: number;
  categoria?: string;
}

interface Props {
  value: string;
  onChange: (piezaId: string, piezaData?: Pieza) => void;
  label?: string;
  size?: 'small' | 'medium';
  disabled?: boolean;
  placeholder?: string;
}

const piezaInventarioService = createCrudService<Pieza>('piezasinventario');

export default function PiezaBuscador({
  value,
  onChange,
  label = 'Buscar pieza',
  size = 'medium',
  disabled = false,
  placeholder = 'Escribe para buscar piezas...'
}: Props) {
  const [piezas, setPiezas] = useState<Pieza[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  // Carga inicial de piezas
  useEffect(() => {
    fetchPiezas();
  }, []);

  // Encontrar la pieza seleccionada
  const selectedPieza = piezas.find(p => p._id === value) || null;

  // Sincronizar inputValue con la pieza seleccionada
  useEffect(() => {
    if (value && selectedPieza) {
      setInputValue(selectedPieza.nombre_pieza || '');
    } else if (!value) {
      setInputValue('');
    }
  }, [value, selectedPieza]);

  const fetchPiezas = async () => {
    setLoading(true);
    try {
      const data = await piezaInventarioService.fetchAll();
      // Filtrar solo piezas que tienen nombre (permitir 0 stock para edición)
      const piezasValidas = data.filter(p => p.nombre_pieza);
      setPiezas(piezasValidas);
    } catch (error) {
      console.error('Error loading piezas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Eliminar la declaración duplicada de selectedPieza

  return (
    <Autocomplete
      options={piezas}
      getOptionLabel={(option) => option.nombre_pieza || ''}
      value={selectedPieza}
      onChange={(_, newValue) => {
        onChange(newValue?._id || '', newValue ?? undefined);
      }}
      inputValue={inputValue}
      onInputChange={(_, newInput) => {
        setInputValue(newInput);
      }}
      loading={loading}
      disabled={disabled}
      size={size}
      noOptionsText="No se encontraron piezas"
      loadingText="Cargando piezas..."
      filterOptions={(options, { inputValue }) => {
        if (!inputValue) {
          // Mostrar piezas con stock disponible + la pieza seleccionada si existe
          const piezasConStock = options.filter(p => p.cantidad_disponible > 0);
          if (selectedPieza && !piezasConStock.find(p => p._id === selectedPieza._id)) {
            return [selectedPieza, ...piezasConStock.slice(0, 9)];
          }
          return piezasConStock.slice(0, 10);
        }

        const filtro = inputValue.toLowerCase();
        const piezasFiltradas = options.filter(option => {
          const nombre = option.nombre_pieza?.toLowerCase() ?? '';
          const categoria = option.categoria?.toLowerCase() ?? '';
          return nombre.includes(filtro) || categoria.includes(filtro);
        });

        // Asegurar que la pieza seleccionada esté en las opciones si coincide con el filtro
        if (selectedPieza && !piezasFiltradas.find(p => p._id === selectedPieza._id)) {
          const nombreSeleccionada = selectedPieza.nombre_pieza?.toLowerCase() ?? '';
          const categoriaSeleccionada = selectedPieza.categoria?.toLowerCase() ?? '';
          if (nombreSeleccionada.includes(filtro) || categoriaSeleccionada.includes(filtro)) {
            return [selectedPieza, ...piezasFiltradas];
          }
        }

        return piezasFiltradas;
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            )
          }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...rest } = props;
        // Usar costo_promedio si existe, sino precio
        const precioMostrar = option.costo_promedio ?? option.precio ?? 0;

        return (
          <Box component="li" key={key} {...rest} sx={{ p: 1 }}>
            <Box sx={{ width: '100%' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body1" fontWeight="medium">
                  {option.nombre_pieza}
                </Typography>
                <Typography variant="body2" color="primary" fontWeight="bold">
                  ${precioMostrar.toFixed(2)}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                <Typography variant="caption" color="text.secondary">
                  {option.categoria ? `Categoría: ${option.categoria}` : 'Sin categoría'}
                </Typography>
                <Chip
                  label={`Stock: ${option.cantidad_disponible}`}
                  size="small"
                  variant="outlined"
                  color={option.cantidad_disponible > 10 ? 'success' :
                    option.cantidad_disponible > 0 ? 'warning' : 'error'}
                />
              </Box>
            </Box>
          </Box>
        );
      }}
    />
  );
}
