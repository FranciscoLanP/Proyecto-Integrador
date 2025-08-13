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

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este modelo?')) {
      modelosCrud.deleteM.mutate(id, {
        onSuccess: () => notify('Modelo eliminado correctamente', 'success'),
        onError: () => notify('Error al eliminar modelo', 'error')
      });
    }
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

  const tableData = modelos.map(modelo => {
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
            onClick={() => handleDelete(modelo._id)}
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
      originalData: modelo
    };
  });

  const columns = [
    { id: 'modelo', label: 'Modelo de Vehículo' },
    { id: 'marca', label: 'Marca' },
    { id: 'estado', label: 'Estado' },
    { id: 'acciones', label: 'Acciones' }
  ];

  if (!isHydrated || !isHydratedCustom) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Modelos de Vehículo</h1>
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
      {loadingMarcas || loadingModelos ? (
        <div className="flex justify-center items-center h-64">
          <CircularProgress size={40} />
        </div>
      ) : (
        <ModernTable
          title="Modelos de Vehículo"
          subtitle="Administra los modelos de vehículo asociados a cada marca"
          data={tableData}
          columns={columns}
          searchTerm=""
          onSearchChange={() => { }}
          page={0}
          rowsPerPage={10}
          onPageChange={() => { }}
          onRowsPerPageChange={() => { }}
          onCreateNew={handleCreate}
          createButtonText="Nuevo Modelo"
          emptyMessage="No se encontraron modelos de vehículo"
        />
      )}

      <ModelosDatosModal
        open={modalOpen}
        defaultData={editData ?? undefined}
        marcas={marcas}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
