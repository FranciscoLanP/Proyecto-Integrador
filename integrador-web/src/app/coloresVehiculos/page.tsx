'use client';

import React, { useState, ChangeEvent, JSX } from 'react';
import {
  Box, Typography, IconButton, CircularProgress, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ModernTable from '@/components/ModernTable/ModernTable';
import { useHydration } from '@/hooks/useHydration';
import { useTheme } from '@/app/context/ThemeContext';

import { useCrud } from '../../hooks/useCrud';
import { useNotification } from '../../components/utils/NotificationProvider';
import type { IColoresDatos } from '../types';
import ColoresDatosModal from './ColoresModal';

export default function ColoresDatosPage(): JSX.Element {
  const { notify } = useNotification();
  const { currentTheme, isHydrated } = useTheme();
  const isHydratedCustom = useHydration();

  const { allQuery, createM, updateM, deleteM } =
    useCrud<IColoresDatos>('coloresdatos');
  const { data: colores = [], isLoading, error } = allQuery;

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<IColoresDatos | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  if (error) return <Typography color="error">{error.message}</Typography>;

  const handleCreate = (): void => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleEdit = (color: IColoresDatos): void => {
    setEditData(color);
    setModalOpen(true);
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (confirm('¿Seguro que deseas eliminar este color?')) {
      deleteM.mutate(id, {
        onSuccess: () => notify('Color eliminado correctamente', 'success'),
        onError: () => notify('Error al eliminar color', 'error')
      });
    }
  };

  const handleModalSubmit = (payload: { nombre_color: string }): void => {
    if (editData) {
      updateM.mutate(
        { id: editData._id, data: { nombre_color: payload.nombre_color } },
        {
          onSuccess: () => notify('Color actualizado correctamente', 'success'),
          onError: () => notify('Error al actualizar color', 'error')
        }
      );
    } else {
      createM.mutate(
        { nombre_color: payload.nombre_color },
        {
          onSuccess: () => notify('Color creado correctamente', 'success'),
          onError: () => notify('Error al crear color', 'error')
        }
      );
    }
    setModalOpen(false);
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when changing rows per page
  };

  // Función para obtener un color representativo basado en el nombre
  const getColorFromName = (colorName: string): string => {
    const colorLower = colorName.toLowerCase();
    if (colorLower.includes('rojo') || colorLower.includes('red')) return '#EF4444';
    if (colorLower.includes('azul') || colorLower.includes('blue')) return '#3B82F6';
    if (colorLower.includes('verde') || colorLower.includes('green')) return '#10B981';
    if (colorLower.includes('amarillo') || colorLower.includes('yellow')) return '#F59E0B';
    if (colorLower.includes('negro') || colorLower.includes('black')) return '#374151';
    if (colorLower.includes('blanco') || colorLower.includes('white')) return '#F3F4F6';
    if (colorLower.includes('gris') || colorLower.includes('gray') || colorLower.includes('grey')) return '#6B7280';
    if (colorLower.includes('naranja') || colorLower.includes('orange')) return '#F97316';
    if (colorLower.includes('morado') || colorLower.includes('purple')) return '#8B5CF6';
    if (colorLower.includes('rosa') || colorLower.includes('pink')) return '#EC4899';
    return '#6B7280'; // Color por defecto
  };

  // Datos para la tabla moderna
  const tableData = colores.map(color => {
    const colorHex = getColorFromName(color.nombre_color);

    return {
      id: color._id || '',
      color: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 45,
              height: 45,
              borderRadius: '12px',
              background: `linear-gradient(135deg, ${colorHex}, ${colorHex}CC)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colorHex === '#F3F4F6' ? '#374151' : 'white',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              boxShadow: `0 4px 12px ${colorHex}40`,
              border: colorHex === '#F3F4F6' ? '2px solid #E5E7EB' : 'none'
            }}
          >
            🎨
          </Box>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#374151' }}>
              {color.nombre_color}
            </Typography>
            <Typography variant="caption" sx={{ color: '#6B7280' }}>
              {colorHex}
            </Typography>
          </Box>
        </Box>
      ),
      muestra: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: colorHex,
              border: colorHex === '#F3F4F6' ? '2px solid #E5E7EB' : 'none',
              boxShadow: `0 2px 8px ${colorHex}30`
            }}
          />
          <Typography variant="body2" sx={{ color: '#374151', fontWeight: 'medium' }}>
            Muestra
          </Typography>
        </Box>
      ),
      estado: (
        <Chip
          label="Disponible"
          sx={{
            background: 'linear-gradient(45deg, #10B981, #34D399)',
            color: 'white',
            fontWeight: 'medium'
          }}
          size="small"
        />
      ),
      acciones: (
        <Box display="flex" gap={0.5}>
          <IconButton
            size="small"
            onClick={() => handleEdit(color)}
            title="Editar"
            sx={{
              background: 'linear-gradient(45deg, #3B82F6, #60A5FA)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #2563EB, #3B82F6)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
              },
              transition: 'all 0.3s ease',
              width: 32,
              height: 32
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(color._id)}
            title="Eliminar"
            sx={{
              background: 'linear-gradient(45deg, #EF4444, #F87171)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #DC2626, #EF4444)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
              },
              transition: 'all 0.3s ease',
              width: 32,
              height: 32
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
      fechaCreacion: (
        <Typography variant="body2" sx={{ color: '#374151', fontSize: '0.85rem' }}>
          {new Date((color as any).createdAt || new Date()).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          })}
        </Typography>
      ),
      originalData: color
    };
  });

  const columns = [
    { id: 'color', label: 'Color' },
    { id: 'muestra', label: 'Muestra' },
    { id: 'estado', label: 'Estado' },
    { id: 'fechaCreacion', label: 'Fecha Creación' },
    { id: 'acciones', label: 'Acciones' }
  ];

  if (!isHydrated || !isHydratedCustom) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Colores de Vehículo</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <CircularProgress size={40} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6 transition-colors duration-300"
      style={{
        background: currentTheme.colors.background
      }}
    >
      {/* Tabla Moderna */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <CircularProgress size={40} />
        </div>
      ) : (
        <ModernTable
          title="Colores de Vehículo"
          subtitle="Administra los colores disponibles para los vehículos del sistema"
          data={tableData}
          columns={columns}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          onCreateNew={handleCreate}
          createButtonText="Nuevo Color"
          emptyMessage="No se encontraron colores de vehículo"
        />
      )}

      {/* Modal */}
      <ColoresDatosModal
        open={modalOpen}
        defaultData={editData ?? undefined}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
