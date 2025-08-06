
'use client';

import React, { useState } from 'react';
import { Typography, Box, Chip } from '@mui/material';
import BuildIcon from '@mui/icons-material/Build';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AssignmentIcon from '@mui/icons-material/Assignment';

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

  // Hook para manejar la tabla
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

  // Funciones adaptadoras
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

  // Funciones helper para obtener datos relacionados
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

  // Definir las columnas
  const columns: TableColumn[] = [
    {
      id: 'fecha',
      label: 'Fecha & Hora',
      minWidth: 180,
      render: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06B6D4, #0891B2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.2rem'
            }}
          >
            📅
          </Box>
          <Box>
            <DateDisplay date={row.fecha} format="long" />
          </Box>
        </Box>
      )
    },
    {
      id: 'empleado',
      label: 'Empleado',
      minWidth: 200,
      render: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
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
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#374151' }}>
              {getEmpleadoName(row.id_empleadoInformacion)}
            </Typography>
            <Chip
              size="small"
              label="Recepcionista"
              sx={{
                background: 'linear-gradient(45deg, #10B981, #34D399)',
                color: 'white',
                fontSize: '0.7rem'
              }}
            />
          </Box>
        </Box>
      )
    },
    {
      id: 'vehiculo',
      label: 'Vehículo & Cliente',
      minWidth: 250,
      render: (value, row) => {
        const vehiculo = getVehiculoData(row.id_vehiculo);
        const clienteNombre = vehiculo ? getClienteFromVehiculo(vehiculo) : 'N/A';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '10px',
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
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#374151' }}>
                Chasis: {vehiculo?.chasis || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.8rem' }}>
                Cliente: {clienteNombre}
              </Typography>
            </Box>
          </Box>
        );
      }
    },
    {
      id: 'problema',
      label: 'Problema Reportado',
      minWidth: 300,
      render: (value, row) => (
        <Box>
          <Typography variant="body2" sx={{ color: '#374151', fontWeight: 'medium', mb: 0.5 }}>
            {row.problema_reportado || 'Sin problema especificado'}
          </Typography>
          {row.problema_reportado && (
            <Chip
              size="small"
              label="Reportado"
              sx={{
                background: 'linear-gradient(45deg, #F59E0B, #FBBF24)',
                color: 'white',
                fontSize: '0.7rem'
              }}
            />
          )}
        </Box>
      )
    },
    {
      id: 'comentario',
      label: 'Comentarios',
      minWidth: 250,
      render: (value, row) => (
        <Box>
          <Typography
            variant="body2"
            sx={{
              color: '#6b7280',
              fontStyle: row.comentario ? 'normal' : 'italic',
              maxWidth: '250px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {row.comentario || 'Sin comentarios adicionales'}
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
          status="Recibido"
          colorMap={{
            'Recibido': 'linear-gradient(45deg, #06B6D4, #0891B2)',
            'En Proceso': 'linear-gradient(45deg, #F59E0B, #FBBF24)',
            'Completado': 'linear-gradient(45deg, #10B981, #059669)'
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
          onDelete={() => handleDelete(row)}
          customActions={[
            {
              icon: <AssignmentIcon fontSize="small" />,
              onClick: () => notify('Ver detalles de recepción', 'info'),
              color: 'linear-gradient(45deg, #8B5CF6, #A78BFA)',
              tooltip: 'Ver Detalles'
            },
            {
              icon: <BuildIcon fontSize="small" />,
              onClick: () => notify('Iniciar reparación', 'info'),
              color: 'linear-gradient(45deg, #F59E0B, #FBBF24)',
              tooltip: 'Iniciar Reparación'
            }
          ]}
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
        data={paginatedData}
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
        height={700}
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
