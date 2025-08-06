'use client'

import React, { useState } from 'react'
import { Typography, Box } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import WorkIcon from '@mui/icons-material/Work'
import { useCrud } from '@/hooks/useCrud'
import { useNotification } from '@/components/utils/NotificationProvider'
import { useHydration, defaultTheme } from '@/hooks/useHydration'
import { useTheme } from '../context/ThemeContext'
import { EmpleadoConUbicacion, IEmpleadoInformacion } from '../types'
import EmpleadoInformacionModal from './EmpleadoInformacionModal'
import RoleGuard from '@/components/RoleGuard'
import {
  ModernTable,
  useModernTable,
  ClientCell,
  ContactCell,
  StatusChip,
  ActionButtons,
  type TableColumn
} from '@/components/ModernTable'

export default function EmpleadoInformacionPage() {
  return (
    <RoleGuard allowedRoles={['administrador']}>
      <EmpleadoInformacionPageContent />
    </RoleGuard>
  );
}

function EmpleadoInformacionPageContent() {
  const { notify } = useNotification()
  const isHydrated = useHydration()
  const { currentTheme } = useTheme()
  const empleadoCrud = useCrud<IEmpleadoInformacion>('empleadoinformaciones')

  const { data: empleados = [], isLoading, error } = empleadoCrud.allQuery

  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState<EmpleadoConUbicacion>()

  // Hook para manejar la lógica de la tabla
  const {
    filteredData,
    paginatedData,
    searchQuery,
    page,
    rowsPerPage,
    handleSearchChange,
    handlePageChange,
    handleRowsPerPageChange,
    totalRows
  } = useModernTable({
    data: empleados,
    searchFields: ['nombre', 'tipo_empleado', 'telefono'],
    initialRowsPerPage: 10
  });

  // Funciones adaptadoras para el componente ModernTable
  const onSearchChange = (value: string) => {
    const mockEvent = {
      target: { value }
    } as React.ChangeEvent<HTMLInputElement>;
    handleSearchChange(mockEvent);
  };

  const onPageChange = (page: number) => {
    handlePageChange(null, page);
  };

  const onRowsPerPageChange = (rowsPerPage: number) => {
    const mockEvent = {
      target: { value: rowsPerPage.toString() }
    } as React.ChangeEvent<HTMLInputElement>;
    handleRowsPerPageChange(mockEvent);
  };

  if (isLoading) return <Typography>Cargando empleados...</Typography>
  if (error) return <Typography color="error">Error: {error.message}</Typography>

  // Mostrar loader durante la hidratación
  if (!isHydrated) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh'
      }}>
        <Typography variant="h6" sx={{ color: '#6b7280' }}>
          Cargando empleados...
        </Typography>
      </Box>
    )
  }

  // Usar tema por defecto durante la hidratación para evitar cambios visuales
  const safeTheme = isHydrated ? currentTheme : defaultTheme;

  const openNew = () => {
    setEditData(undefined)
    setModalOpen(true)
  }

  const openEdit = (row: IEmpleadoInformacion) => {
    const coords = row.location?.coordinates ?? [-69.9312, 18.4861]
    const [lng, lat] = coords as [number, number]
    setEditData({
      ...row,
      latitude: lat,
      longitude: lng,
      direccion: row.direccion,
      ubicacionLabel: row.ubicacionLabel
    })
    setModalOpen(true)
  }

  const closeModal = () => setModalOpen(false)

  const handleSubmit = (payload: EmpleadoConUbicacion) => {
    if (editData?._id) {
      empleadoCrud.updateM.mutate(
        { id: editData._id, data: payload },
        {
          onSuccess: () => notify('Empleado actualizado', 'success'),
          onError: () => notify('Error al actualizar', 'error'),
        }
      )
    } else {
      empleadoCrud.createM.mutate(
        payload,
        {
          onSuccess: () => notify('Empleado creado', 'success'),
          onError: () => notify('Error al crear', 'error'),
        }
      )
    }
    setModalOpen(false)
  }

  // Definir las columnas de la tabla
  const columns: TableColumn[] = [
    {
      id: 'empleado',
      label: 'Empleado',
      minWidth: 250,
      render: (value, row, index) => (
        <ClientCell
          nombre={row.nombre}
          tipo_cliente={row.tipo_empleado}
          index={index}
        />
      )
    },
    {
      id: 'contacto',
      label: 'Contacto',
      minWidth: 200,
      render: (value, row) => (
        <ContactCell
          telefono={row.telefono}
          email={row.correo}
        />
      )
    },
    {
      id: 'direccion',
      label: 'Dirección',
      minWidth: 200,
      render: (value, row) => (
        <Typography variant="body2" sx={{ color: '#4a5568' }}>
          {row.direccion || row.ubicacionLabel || 'Sin dirección'}
        </Typography>
      )
    },
    {
      id: 'estado',
      label: 'Estado',
      minWidth: 120,
      render: (value, row) => (
        <StatusChip
          status="Activo" // Siempre activo por defecto
          colorMap={{
            'Activo': 'linear-gradient(45deg, #4CAF50, #8BC34A)',
            'Inactivo': 'linear-gradient(45deg, #f44336, #ff5722)'
          }}
        />
      )
    },
    {
      id: 'acciones',
      label: 'Acciones',
      align: 'center',
      minWidth: 120,
      render: (value, row) => (
        <ActionButtons
          onEdit={() => openEdit(row)}
          customActions={[
            {
              icon: <WorkIcon fontSize="small" />,
              onClick: () => notify('Ver historial laboral', 'info'),
              color: 'linear-gradient(45deg, #673AB7, #9C27B0)',
              tooltip: 'Historial Laboral'
            }
          ]}
        />
      )
    }
  ]

  return (
    <>
      <ModernTable
        title="Información de Empleados"
        subtitle="Gestiona la información del personal de la empresa"
        titleIcon="👥"
        columns={columns}
        data={paginatedData}
        searchTerm={searchQuery}
        onSearchChange={onSearchChange}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        onCreateNew={openNew}
        createButtonText="Nuevo Empleado"
        emptyMessage="No hay empleados registrados"
        emptySubMessage="Comienza agregando el primer empleado"
        searchPlaceholder="Buscar por nombre, tipo o teléfono..."
        height={650}
      />

      <EmpleadoInformacionModal
        open={modalOpen}
        defaultData={editData}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </>
  )
}
