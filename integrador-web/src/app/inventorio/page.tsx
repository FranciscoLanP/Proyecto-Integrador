'use client';

import React, { useState, ChangeEvent, JSX } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Chip
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  Build as BuildIcon,
  ShoppingCart as ShoppingCartIcon,
  WarningAmber as WarningAmberIcon
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
  const [confirmDel, setConfirmDel] = useState(false);
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
    setConfirmDel(true);
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
    setConfirmDel(false);
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
      id: 'estado',
      label: 'Estado',
      minWidth: 120,
      render: (value, row) => (
        <StatusChip
          status="Activo"
          colorMap={{
            'Activo': safeTheme.gradient,
            'Inactivo': 'linear-gradient(45deg, #6B7280, #9CA3AF)'
          }}
        />
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
          customActions={[
            {
              icon: <ShoppingCartIcon fontSize="small" />,
              onClick: () => notify('Ver historial de compras', 'info'),
              color: 'linear-gradient(45deg, #8B5CF6, #A78BFA)',
              tooltip: 'Historial de Compras'
            }
          ]}
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
        data={paginatedData}
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

      <Dialog
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            background: safeTheme.colors.surface,
            backdropFilter: 'blur(10px)',
            boxShadow: `0 20px 40px ${safeTheme.colors.primary}20`
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: '1.1rem',
            color: safeTheme.colors.text,
            background: `linear-gradient(135deg, ${safeTheme.colors.primary}10, ${safeTheme.colors.secondary}10)`,
            borderRadius: '16px 16px 0 0'
          }}
        >
          <WarningAmberIcon sx={{ color: safeTheme.colors.warning }} />
          ¿Confirmas eliminar esta pieza?
        </DialogTitle>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => setConfirmDel(false)}
            sx={{
              borderRadius: '8px',
              color: safeTheme.colors.text,
              '&:hover': {
                background: `${safeTheme.colors.primary}10`
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={confirmDelete}
            sx={{
              borderRadius: '8px',
              background: 'linear-gradient(45deg, #EF4444, #F87171)',
              '&:hover': {
                background: 'linear-gradient(45deg, #DC2626, #EF4444)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
