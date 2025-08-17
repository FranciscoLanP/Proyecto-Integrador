
'use client';

import React, { useState } from 'react';
import { Typography, Box, Chip } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

import { useCrud } from '../../hooks/useCrud';
import { useNotification } from '../../components/utils/NotificationProvider';
import type {
  IRecepcionVehiculo,
  ICliente,
  IEmpleadoInformacion,
  IVehiculoDatos
} from '../types';
import RecepcionVehiculoModal from './RecepcionVehiculoModal';
import {
  ModernTable,
  useModernTable,
  StatusChip,
  ActionButtons,
  DateDisplay,
  type TableColumn
} from '@/components/ModernTable';

export default function RecepcionVehiculosPage() {
  const { notify } = useNotification();

  const recepCrud = useCrud<IRecepcionVehiculo>('recepcionvehiculos');
  const cliCrud = useCrud<ICliente>('clientes');
  const empCrud = useCrud<IEmpleadoInformacion>('empleadoinformaciones');
  const vehCrud = useCrud<IVehiculoDatos>('vehiculodatos');

  const { data: recepciones = [], isLoading: loadRec, error: errRec } = recepCrud.allQuery;
  const { data: clientes = [], isLoading: loadCli, error: errCli } = cliCrud.allQuery;
  const { data: empleados = [], isLoading: loadEmp, error: errEmp } = empCrud.allQuery;
  const { data: vehiculos = [], isLoading: loadVeh, error: errVeh } = vehCrud.allQuery;

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<IRecepcionVehiculo | null>(null);

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
    data: recepciones,
    searchFields: ['problema_reportado', 'comentario', 'fecha'],
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

  if (loadRec || loadCli || loadEmp || loadVeh) return <Typography>Cargando recepciones...</Typography>;
  if (errRec) return <Typography color="error">Error recepciones: {errRec.message}</Typography>;
  if (errCli) return <Typography color="error">Error clientes: {errCli.message}</Typography>;
  if (errEmp) return <Typography color="error">Error empleados: {errEmp.message}</Typography>;
  if (errVeh) return <Typography color="error">Error vehículos: {errVeh.message}</Typography>;

  const openNew = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const openEdit = (row: IRecepcionVehiculo) => {
    setEditData(row);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (payload: Partial<IRecepcionVehiculo>) => {
    try {
      if (editData) {
        await recepCrud.updateM.mutateAsync({ id: editData._id, data: payload });
        notify('Recepción actualizada correctamente', 'success');
      } else {
        await recepCrud.createM.mutateAsync(payload);
        notify('Recepción creada correctamente', 'success');
      }
      await recepCrud.allQuery.refetch();
    } catch {
      notify('Error al guardar recepción', 'error');
    } finally {
      setModalOpen(false);
    }
  };

  const handleDelete = async (row: IRecepcionVehiculo) => {
    try {
      await recepCrud.deleteM.mutateAsync(row._id);
      notify('Recepción eliminada correctamente', 'success');
    } catch {
      notify('Error al eliminar recepción', 'error');
    }
  };

  const getEmpleadoName = (empId: string | IEmpleadoInformacion) => {
    if (typeof empId === 'object') return empId.nombre;
    const empleado = empleados.find(e => e._id === empId);
    return empleado?.nombre || 'Empleado no encontrado';
  };

  const getVehiculoData = (vehId: string | IVehiculoDatos) => {
    if (typeof vehId === 'object') return vehId;
    return vehiculos.find(v => v._id === vehId);
  };

  const getClienteFromVehiculo = (vehiculo: IVehiculoDatos) => {
    if (typeof vehiculo.id_cliente === 'object') return vehiculo.id_cliente.nombre;
    const cliente = clientes.find(c => c._id === vehiculo.id_cliente);
    return cliente?.nombre || 'Cliente no encontrado';
  };

  const columns: TableColumn[] = [
    {
      id: 'fecha',
      label: 'Fecha',
      minWidth: 130,
      render: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #06B6D4, #0891B2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1rem'
            }}
          >
            📅
          </Box>
          <Box>
            <DateDisplay date={row.fecha} format="short" />
          </Box>
        </Box>
      )
    },
    {
      id: 'empleado',
      label: 'Empleado',
      minWidth: 140,
      render: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <PersonIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#374151', fontSize: '0.85rem' }}>
              {getEmpleadoName(row.id_empleadoInformacion)}
            </Typography>
            <Chip
              size="small"
              label="Recep."
              sx={{
                background: 'linear-gradient(45deg, #10B981, #34D399)',
                color: 'white',
                fontSize: '0.65rem',
                height: '18px'
              }}
            />
          </Box>
        </Box>
      )
    },
    {
      id: 'vehiculo',
      label: 'Vehículo',
      minWidth: 170,
      render: (value, row) => {
        const vehiculo = getVehiculoData(row.id_vehiculo);
        const clienteNombre = vehiculo ? getClienteFromVehiculo(vehiculo) : 'N/A';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              <DirectionsCarIcon fontSize="small" />
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#374151', fontSize: '0.85rem' }}>
                {vehiculo?.chasis || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.75rem' }}>
                {clienteNombre}
              </Typography>
            </Box>
          </Box>
        );
      }
    },
    {
      id: 'problema',
      label: 'Problema',
      minWidth: 160,
      render: (value, row) => (
        <Box>
          <Typography variant="body2" sx={{ color: '#374151', fontWeight: 'medium', mb: 0.5, fontSize: '0.85rem' }}>
            {row.problema_reportado || 'Sin especificar'}
          </Typography>
          {row.problema_reportado && (
            <Chip
              size="small"
              label="Reportado"
              sx={{
                background: 'linear-gradient(45deg, #F59E0B, #FBBF24)',
                color: 'white',
                fontSize: '0.65rem',
                height: '18px'
              }}
            />
          )}
        </Box>
      )
    },
    {
      id: 'comentario',
      label: 'Comentarios',
      minWidth: 150,
      render: (value, row) => (
        <Box>
          <Typography
            variant="body2"
            sx={{
              color: '#6b7280',
              fontStyle: row.comentario ? 'normal' : 'italic',
              maxWidth: '150px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '0.85rem'
            }}
          >
            {row.comentario || 'Sin comentarios'}
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
      minWidth: 130,
      render: (value, row) => (
        <ActionButtons
          onEdit={() => openEdit(row)}
          onDelete={() => handleDelete(row)}
        />
      )
    }
  ];

  return (
    <>
      <ModernTable
        title="Recepción de Vehículos"
        subtitle="Gestiona las recepciones de vehículos para servicio y reparación"
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
        createButtonText="Nueva Recepción"
        emptyMessage="No hay recepciones registradas"
        emptySubMessage="Comienza registrando la primera recepción"
        searchPlaceholder="Buscar por problema, comentario o fecha..."
      />

      <RecepcionVehiculoModal
        open={modalOpen}
        defaultData={editData ?? undefined}
        clientes={clientes}
        empleados={empleados}
        vehiculos={vehiculos}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </>
  );
}
