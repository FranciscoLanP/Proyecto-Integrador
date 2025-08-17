'use client';

import React, { useState, ChangeEvent, JSX } from 'react';
import {
  Box,
  Typography,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  Build as BuildIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { useCrud } from '@/hooks/useCrud';
import { useNotification } from '@/components/utils/NotificationProvider';
import { useHydration, defaultTheme } from '@/hooks/useHydration';
import { useTheme } from '../context/ThemeContext';
import {
  ModernTable,
  useModernTable,
  StatusChip,
  ActionButtons,
  type TableColumn
} from '@/components/ModernTable';
import type { IPiezaInventario } from '@/app/types';
import RegistroCompraModal from './RegistroCompraModal';

export default function PiezasPage(): JSX.Element {
  const { notify } = useNotification();
  const isHydrated = useHydration();
  const { currentTheme } = useTheme();
  const { allQuery, createM, updateM, deleteM } =
    useCrud<IPiezaInventario>('piezasinventario');
  const { data: piezas = [], isLoading, error, refetch } = allQuery;

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<IPiezaInventario | undefined>(undefined);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [toDelete, setToDelete] = useState<IPiezaInventario | null>(null);

  const {
    filteredData,
    paginatedData,
    searchQuery,
    page,
    rowsPerPage,
    handleSearchChange,
    handlePageChange,
    handleRowsPerPageChange
  } = useModernTable({
    data: piezas,
    searchFields: ['nombre_pieza', 'serial'],
    initialRowsPerPage: 10
  });

  const onSearchChange = (value: string) => {
    const mockEvent = { target: { value } } as React.ChangeEvent<HTMLInputElement>;
    handleSearchChange(mockEvent);
  };

  const onPageChange = (page: number) => {
    handlePageChange(null, page);
  };

  const onRowsPerPageChange = (rowsPerPage: number) => {
    const mockEvent = { target: { value: rowsPerPage.toString() } } as React.ChangeEvent<HTMLInputElement>;
    handleRowsPerPageChange(mockEvent);
  };

  if (isLoading) return <Typography>Cargando inventario...</Typography>;
  if (error) return <Typography color="error">Error: {error.message}</Typography>;

  if (!isHydrated) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh'
      }}>
        <Typography variant="h6" sx={{ color: '#6b7280' }}>
          Cargando inventario...
        </Typography>
      </Box>
    )
  }

  const safeTheme = isHydrated ? currentTheme : defaultTheme;

  const openNew = () => {
    setEditData(undefined);
    setModalOpen(true);
  };

  const openEdit = (p: IPiezaInventario) => {
    setEditData(p);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSaved = () => {
    refetch();
  };

  const askDelete = (p: IPiezaInventario) => {
    setToDelete(p);
    setShowDeleteWarning(true);
  };

  const confirmDelete = () => {
    if (toDelete) {
      deleteM.mutate(toDelete._id, {
        onSuccess: () => {
          notify('Pieza eliminada correctamente', 'success');
          refetch();
        },
        onError: () => notify('Error al eliminar pieza', 'error')
      });
    }
    setShowDeleteWarning(false);
    setToDelete(null);
  };

  const getStockStatus = (cantidad: number) => {
    if (cantidad === 0) return 'Sin Stock';
    if (cantidad <= 5) return 'Stock Bajo';
    if (cantidad <= 20) return 'Stock Medio';
    return 'Stock Alto';
  };

  const getStockColor = (cantidad: number) => {
    if (cantidad === 0) return 'linear-gradient(45deg, #EF4444, #F87171)';
    if (cantidad <= 5) return 'linear-gradient(45deg, #F59E0B, #FBBF24)';
    if (cantidad <= 20) return 'linear-gradient(45deg, #3B82F6, #60A5FA)';
    return 'linear-gradient(45deg, #10B981, #34D399)';
  };

  const columns: TableColumn[] = [
    {
      id: 'pieza',
      label: 'Pieza',
      minWidth: 280,
      render: (value, row, index) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 45,
              height: 45,
              borderRadius: '12px',
              background: safeTheme.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              boxShadow: `0 4px 12px ${safeTheme.colors.primary}30`
            }}
          >
            <BuildIcon />
          </Box>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#374151' }}>
              {row.nombre_pieza}
            </Typography>
            <Chip
              size="small"
              label={`Serial: ${row.serial}`}
              sx={{
                background: 'linear-gradient(45deg, #6B7280, #9CA3AF)',
                color: 'white',
                fontSize: '0.7rem',
                mt: 0.5
              }}
            />
          </Box>
        </Box>
      )
    },
    {
      id: 'stock',
      label: 'Stock Disponible',
      minWidth: 180,
      render: (value, row) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
            {row.cantidad_disponible}
          </Typography>
          <StatusChip
            status={getStockStatus(row.cantidad_disponible)}
            colorMap={{
              'Sin Stock': 'linear-gradient(45deg, #EF4444, #F87171)',
              'Stock Bajo': 'linear-gradient(45deg, #F59E0B, #FBBF24)',
              'Stock Medio': 'linear-gradient(45deg, #3B82F6, #60A5FA)',
              'Stock Alto': 'linear-gradient(45deg, #10B981, #34D399)'
            }}
          />
        </Box>
      )
    },
    {
      id: 'costo',
      label: 'Información Financiera',
      minWidth: 200,
      render: (value, row) => (
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1f2937', mb: 0.5 }}>
            ${row.costo_promedio.toFixed(2)}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6b7280' }}>
            Costo promedio por unidad
          </Typography>
          <Typography variant="body2" sx={{ color: '#059669', fontWeight: 'medium', mt: 0.5 }}>
            Valor total: ${(row.cantidad_disponible * row.costo_promedio).toFixed(2)}
          </Typography>
        </Box>
      )
    },
    {
      id: 'fechaCreacion',
      label: 'Fecha Creación',
      minWidth: 120,
      render: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.9rem'
            }}
          >
            📅
          </Box>
          <Box>
            <Typography variant="body2" sx={{ color: '#374151', fontSize: '0.85rem' }}>
              {row.createdAt ? new Date(row.createdAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }) : 'N/A'}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      id: 'acciones',
      label: 'Acciones',
      align: 'center',
      minWidth: 150,
      render: (value, row) => (
        <ActionButtons
          onEdit={() => openEdit(row)}
          onDelete={() => askDelete(row)}
        />
      )
    }
  ];

  return (
    <>
      <ModernTable
        title="Gestión de Inventario"
        subtitle="Administra el stock y control de piezas del taller"
        titleIcon="🔧"
        columns={columns}
        data={filteredData}
        searchTerm={searchQuery}
        onSearchChange={onSearchChange}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        onCreateNew={openNew}
        createButtonText="Nueva Pieza"
        emptyMessage="No hay piezas en inventario"
        emptySubMessage="Comienza agregando la primera pieza al inventario"
        searchPlaceholder="Buscar por nombre o serial..."
      />

      <RegistroCompraModal
        piezaToEdit={editData}
        open={modalOpen}
        onClose={closeModal}
        onSaved={handleSaved}
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
            Confirmar Eliminación de Pieza
          </h2>
          <p style={{
            color: '#666',
            marginBottom: '24px',
            fontSize: '1.1rem',
            lineHeight: 1.5
          }}>
            <strong>¿Está seguro que desea eliminar esta pieza del inventario?</strong>
            <br /><br />
            Esta acción no se puede deshacer. Se eliminará permanentemente la pieza y sus datos asociados.
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
              🗑️ Eliminar Pieza
            </button>
          </Box>
        </Box>
      </Box>
    </>
  );
}
