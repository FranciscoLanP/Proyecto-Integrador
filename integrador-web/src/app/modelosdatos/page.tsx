'use client';

import React, { useState, ChangeEvent, JSX } from 'react';
import {
  Box, Typography, IconButton, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ModernTable from '@/components/ModernTable/ModernTable';
import { useHydration } from '@/hooks/useHydration';
import { useTheme } from '@/app/context/ThemeContext';
import LoadingSpinner from '@/components/LoadingSpinner';

import { useCrud } from '../../hooks/useCrud';
import { useNotification } from '../../components/utils/NotificationProvider';
import type { IModelosDatos, IMarcaVehiculo } from '../types';
import ModelosDatosModal from './ModelosDatosModal';

export default function ModelosDatosPage(): JSX.Element {
  const { notify } = useNotification();
  const { currentTheme, isHydrated } = useTheme();
  const isHydratedCustom = useHydration();

  const marcaCrud = useCrud<IMarcaVehiculo>('marcasvehiculos');
  const modelosCrud = useCrud<IModelosDatos>('modelosdatos');
  const { data: marcas = [], isLoading: loadingMarcas, error: errMarcas } = marcaCrud.allQuery;
  const { data: modelos = [], isLoading: loadingModelos, error: errModelos } = modelosCrud.allQuery;

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<IModelosDatos | null>(null);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [toDelete, setToDelete] = useState<IModelosDatos | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  if (errMarcas) return <Typography color="error">{errMarcas.message}</Typography>;
  if (errModelos) return <Typography color="error">{errModelos.message}</Typography>;

  const handleCreate = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const handleEdit = (modelo: IModelosDatos) => {
    setEditData(modelo);
    setModalOpen(true);
  };

  const askDelete = (modelo: IModelosDatos) => {
    setToDelete(modelo);
    setShowDeleteWarning(true);
  };

  const confirmDelete = () => {
    if (toDelete) {
      modelosCrud.deleteM.mutate(toDelete._id, {
        onSuccess: () => notify('Modelo eliminado correctamente', 'success'),
        onError: () => notify('Error al eliminar modelo', 'error')
      });
    }
    setShowDeleteWarning(false);
    setToDelete(null);
  };

  const handleModalSubmit = (payload: Partial<IModelosDatos>) => {
    if (editData) {
      modelosCrud.updateM.mutate(
        { id: editData._id, data: payload },
        {
          onSuccess: () => notify('Modelo actualizado correctamente', 'success'),
          onError: () => notify('Error al actualizar modelo', 'error')
        }
      );
    } else {
      modelosCrud.createM.mutate(
        payload,
        {
          onSuccess: () => notify('Modelo creado correctamente', 'success'),
          onError: () => notify('Error al crear modelo', 'error')
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

  const filteredModelos = modelos.filter(modelo => {
    const marca = marcas.find(mk => mk._id === modelo.id_marca);
    return (
      modelo.nombre_modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (marca?.nombre_marca.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );
  });

  const tableData = filteredModelos.map(modelo => {
    const marca = marcas.find(mk => mk._id === modelo.id_marca);

    return {
      id: modelo._id || '',
      modelo: (
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
            🚙
          </Box>
          <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#374151' }}>
            {modelo.nombre_modelo}
          </Typography>
        </Box>
      ),
      marca: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #8B5CF6, #A78BFA)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            🏷️
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#374151' }}>
            {marca?.nombre_marca || 'Sin marca'}
          </Typography>
        </Box>
      ),
      estado: (
        <Chip
          label="Activo"
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
            onClick={() => handleEdit(modelo)}
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
            onClick={() => askDelete(modelo)}
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
          {new Date((modelo as any).createdAt || new Date()).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          })}
        </Typography>
      ),
      originalData: modelo
    };
  });

  const columns = [
    { id: 'modelo', label: 'Modelo de Vehículo' },
    { id: 'marca', label: 'Marca' },
    { id: 'estado', label: 'Estado' },
    { id: 'fechaCreacion', label: 'Fecha Creación' },
    { id: 'acciones', label: 'Acciones' }
  ];

  if (!isHydrated || !isHydratedCustom) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Modelos de Vehículo</h1>
          </div>
          <LoadingSpinner
            variant="minimal"
            message="Inicializando aplicación..."
            size={40}
          />
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
      {loadingMarcas || loadingModelos ? (
        <LoadingSpinner
          variant="detailed"
          message="Cargando modelos y marcas de vehículos..."
          size={45}
        />
      ) : (
        <ModernTable
          title="Modelos de Vehículo"
          subtitle="Administra los modelos de vehículo asociados a cada marca"
          data={tableData}
          columns={columns}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          onCreateNew={handleCreate}
          createButtonText="Nuevo Modelo"
          emptyMessage="No se encontraron modelos de vehículo"
          searchPlaceholder="Buscar modelos por nombre o marca..."
        />
      )}

      <ModelosDatosModal
        open={modalOpen}
        defaultData={editData ?? undefined}
        marcas={marcas}
        existingModelos={modelos}
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
            Confirmar Eliminación de Modelo
          </h2>
          <p style={{
            color: '#666',
            marginBottom: '24px',
            fontSize: '1.1rem',
            lineHeight: 1.5
          }}>
            <strong>¿Está seguro que desea eliminar este modelo de vehículo?</strong>
            <br /><br />
            Esta acción no se puede deshacer. Se eliminará permanentemente el modelo del sistema.
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
              🗑️ Eliminar Modelo
            </button>
          </Box>
        </Box>
      </Box>
    </div>
  );
}
