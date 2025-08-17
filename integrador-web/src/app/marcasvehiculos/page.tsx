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
import type { IMarcaVehiculo } from '../types';
import MarcasVehiculoModal from './MarcasVehiculoModal';

export default function MarcasVehiculoPage(): JSX.Element {
  const { notify } = useNotification();
  const { currentTheme, isHydrated } = useTheme();
  const isHydratedCustom = useHydration();

  const { allQuery, createM, updateM, deleteM } =
    useCrud<IMarcaVehiculo>('marcasvehiculos');
  const { data: marcas = [], isLoading, error } = allQuery;

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<IMarcaVehiculo | null>(null);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [toDelete, setToDelete] = useState<IMarcaVehiculo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  if (error) return <Typography color="error">{error.message}</Typography>;

  const handleCreate = (): void => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleEdit = (marca: IMarcaVehiculo): void => {
    setEditData(marca);
    setModalOpen(true);
  };

  const askDelete = (marca: IMarcaVehiculo): void => {
    setToDelete(marca);
    setShowDeleteWarning(true);
  };

  const confirmDelete = (): void => {
    if (toDelete) {
      deleteM.mutate(toDelete._id, {
        onSuccess: () => notify('Marca eliminada correctamente', 'success'),
        onError: () => notify('Error al eliminar marca', 'error')
      });
    }
    setShowDeleteWarning(false);
    setToDelete(null);
  };

  const handleModalSubmit = (payload: { nombre_marca: string }): void => {
    if (editData) {
      updateM.mutate(
        { id: editData._id, data: { nombre_marca: payload.nombre_marca } },
        {
          onSuccess: () => notify('Marca actualizada correctamente', 'success'),
          onError: () => notify('Error al actualizar marca', 'error')
        }
      );
    } else {
      createM.mutate(
        { nombre_marca: payload.nombre_marca },
        {
          onSuccess: () => notify('Marca creada correctamente', 'success'),
          onError: () => notify('Error al crear marca', 'error')
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
    setPage(0);
  };

  const filteredMarcas = marcas.filter(marca =>
    marca.nombre_marca.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tableData = filteredMarcas.map(marca => ({
    id: marca._id || '',
    marca: (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 45,
            height: 45,
            borderRadius: '12px',
            background: currentTheme.buttonGradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            boxShadow: `0 4px 12px ${currentTheme.colors.primary}30`
          }}
        >
          🏷️
        </Box>
        <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#374151' }}>
          {marca.nombre_marca}
        </Typography>
      </Box>
    ),
    estado: (
      <Chip
        label="Activa"
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
          onClick={() => handleEdit(marca)}
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
          onClick={() => askDelete(marca)}
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
        {new Date((marca as any).createdAt || new Date()).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        })}
      </Typography>
    ),
    originalData: marca
  }));

  const columns = [
    { id: 'marca', label: 'Marca de Vehículo' },
    { id: 'estado', label: 'Estado' },
    { id: 'fechaCreacion', label: 'Fecha Creación' },
    { id: 'acciones', label: 'Acciones' }
  ];

  if (!isHydrated || !isHydratedCustom) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Marcas de Vehículo</h1>
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
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <CircularProgress size={40} />
        </div>
      ) : (
        <ModernTable
          title="Marcas de Vehículo"
          subtitle="Administra las marcas de vehículo disponibles en el sistema"
          data={tableData}
          columns={columns}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          onCreateNew={handleCreate}
          createButtonText="Nueva Marca"
          emptyMessage="No se encontraron marcas de vehículo"
          searchPlaceholder="Buscar marcas por nombre..."
        />
      )}

      <MarcasVehiculoModal
        open={modalOpen}
        defaultData={editData ?? undefined}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: showDeleteWarning ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
      >
        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: 3,
            padding: 4,
            maxWidth: 500,
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🗑️</div>
          <h2 style={{
            color: '#d32f2f',
            marginBottom: '16px',
            fontSize: '1.5rem'
          }}>
            Confirmar Eliminación de Marca
          </h2>
          <p style={{
            color: '#666',
            marginBottom: '24px',
            fontSize: '1.1rem',
            lineHeight: 1.5
          }}>
            <strong>¿Está seguro que desea eliminar esta marca de vehículo?</strong>
            <br /><br />
            Esta acción no se puede deshacer. Se eliminará permanentemente la marca del sistema.
          </p>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <button
              onClick={() => {
                setShowDeleteWarning(false);
                setToDelete(null);
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#555'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#666'}
            >
              ❌ Cancelar
            </button>

            <button
              onClick={confirmDelete}
              style={{
                padding: '12px 24px',
                backgroundColor: '#d32f2f',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#c62828'}
              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#d32f2f'}
            >
              🗑️ Eliminar Marca
            </button>
          </Box>
        </Box>
      </Box>
    </div>
  );
}
