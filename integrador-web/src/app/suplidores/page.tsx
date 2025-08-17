'use client'

import React, { useState, JSX } from 'react'
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  Chip
} from '@mui/material'
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  WarningAmber as WarningAmberIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ContactPhone as ContactPhoneIcon
} from '@mui/icons-material'
import { useCrud } from '@/hooks/useCrud'
import { useNotification } from '@/components/utils/NotificationProvider'
import { useHydration, defaultTheme } from '@/hooks/useHydration'
import { useTheme } from '../context/ThemeContext'
import {
  ModernTable,
  useModernTable,
  StatusChip,
  ActionButtons,
  type TableColumn
} from '@/components/ModernTable'
import type { ISuplidor } from '../types'
import SuplidorModal from './SuplidorModal'

export default function SuplidorPage(): JSX.Element {
  const { notify } = useNotification()
  const isHydrated = useHydration()
  const { currentTheme } = useTheme()
  const { allQuery, createM, updateM, deleteM } =
    useCrud<ISuplidor>('suplidorpiezas')
  const { data: suplidores = [], isLoading, error } = allQuery

  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState<ISuplidor>()
  const [confirmDel, setConfirmDel] = useState(false)
  const [toDelete, setToDelete] = useState<ISuplidor>()

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
    data: suplidores,
    searchFields: ['nombre', 'rnc', 'numero_telefono', 'correo'],
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

  if (isLoading) return <Typography>Cargando suplidores...</Typography>
  if (error) return <Typography color="error">Error: {error.message}</Typography>

  if (!isHydrated) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh'
      }}>
        <Typography variant="h6" sx={{ color: '#6b7280' }}>
          Cargando tema...
        </Typography>
      </Box>
    )
  }

  const safeTheme = isHydrated ? currentTheme : defaultTheme;

  const openNew = (): void => {
    setEditData(undefined)
    setModalOpen(true)
  }

  const openEdit = (s: ISuplidor): void => {
    const coords = s.location?.coordinates ?? [-69.9312, 18.4861]
    const [lng, lat] = coords as [number, number]
    setEditData({
      ...s,
      latitude: lat,
      longitude: lng,
      direccion: s.direccion,
      ubicacionLabel: s.ubicacionLabel
    })
    setModalOpen(true)
  }

  const closeModal = (): void => setModalOpen(false)

  const handleSubmit = (payload: ISuplidor): void => {
    if (editData?._id) {
      updateM.mutate(
        { id: editData._id, data: payload },
        {
          onSuccess: () => notify('Suplidor actualizado correctamente', 'success'),
          onError: () => notify('Error al actualizar suplidor', 'error')
        }
      )
    } else {
      createM.mutate(payload, {
        onSuccess: () => notify('Suplidor creado correctamente', 'success'),
        onError: () => notify('Error al crear suplidor', 'error')
      })
    }
    setModalOpen(false)
  }

  const askDelete = (s: ISuplidor): void => {
    setToDelete(s)
    setConfirmDel(true)
  }

  const confirmDelete = (): void => {
    if (toDelete) {
      deleteM.mutate(toDelete._id!, {
        onSuccess: () => notify('Suplidor eliminado correctamente', 'success'),
        onError: () => notify('Error al eliminar suplidor', 'error')
      })
    }
    setConfirmDel(false)
    setToDelete(undefined)
  }

  const columns: TableColumn[] = [
    {
      id: 'suplidor',
      label: 'Suplidor',
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
            <BusinessIcon />
          </Box>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#374151' }}>
              {row.nombre}
            </Typography>
            <Chip
              size="small"
              label={row.rnc ? `RNC: ${row.rnc}` : 'Sin RNC'}
              sx={{
                background: row.rnc
                  ? 'linear-gradient(45deg, #10B981, #34D399)'
                  : 'linear-gradient(45deg, #6B7280, #9CA3AF)',
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
      id: 'contacto',
      label: 'Información de Contacto',
      minWidth: 250,
      render: (value, row) => (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <PhoneIcon sx={{ fontSize: 16, color: safeTheme.colors.primary }} />
            <Typography variant="body2" sx={{ color: '#4b5563' }}>
              {row.numero_telefono || 'Sin teléfono'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmailIcon sx={{ fontSize: 16, color: safeTheme.colors.secondary }} />
            <Typography variant="body2" sx={{ color: '#4b5563' }}>
              {row.correo || 'Sin email'}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      id: 'ubicacion',
      label: 'Ubicación',
      minWidth: 200,
      render: (value, row) => (
        <Typography variant="body2" sx={{ color: '#6b7280' }}>
          {row.direccion || row.ubicacionLabel || 'Sin dirección especificada'}
        </Typography>
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
        title="Gestión de Suplidores"
        subtitle="Administra la información de proveedores y suplidores de piezas"
        titleIcon="🏢"
        columns={columns}
        data={filteredData}
        searchTerm={searchQuery}
        onSearchChange={onSearchChange}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        onCreateNew={openNew}
        createButtonText="Nuevo Suplidor"
        emptyMessage="No hay suplidores registrados"
        emptySubMessage="Comienza agregando el primer suplidor"
        searchPlaceholder="Buscar por nombre, RNC, teléfono o email..."
      />

      <SuplidorModal
        open={modalOpen}
        defaultData={editData}
        onClose={closeModal}
        onSubmit={handleSubmit}
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
          ¿Confirmas eliminar este suplidor?
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
  )
}
