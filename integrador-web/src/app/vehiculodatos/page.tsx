'use client';

import React, { useState, useMemo } from 'react';
import { Typography, Chip, Box } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CarRepairIcon from '@mui/icons-material/CarRepair';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useCrud } from '../../hooks/useCrud';
import { useNotification } from '../../components/utils/NotificationProvider';
import { useHydration, defaultTheme } from '@/hooks/useHydration';
import { useTheme } from '../context/ThemeContext';
import type {
  IVehiculoDatos,
  ICliente,
  IModelosDatos,
  IColoresDatos,
  IMarcaVehiculo
} from '../types';
import VehiculoModal from './VehiculoModal';
import {
  ModernTable,
  useModernTable,
  StatusChip,
  ActionButtons,
  type TableColumn
} from '@/components/ModernTable';

export default function VehiculoDatosPage() {
  const { notify } = useNotification();
  const isHydrated = useHydration();
  const { currentTheme } = useTheme();

  const vehCrud = useCrud<IVehiculoDatos>('vehiculodatos');
  const cliCrud = useCrud<ICliente>('clientes');
  const modCrud = useCrud<IModelosDatos>('modelosdatos');
  const colCrud = useCrud<IColoresDatos>('coloresdatos');
  const marCrud = useCrud<IMarcaVehiculo>('marcasvehiculos');

  const { data: vehiculos = [], isLoading, error } = vehCrud.allQuery;
  const { data: clientes = [] } = cliCrud.allQuery;
  const { data: modelos = [] } = modCrud.allQuery;
  const { data: colores = [] } = colCrud.allQuery;
  const { data: marcas = [] } = marCrud.allQuery;

  const [openForm, setOpenForm] = useState<boolean>(false);
  const [editData, setEditData] = useState<IVehiculoDatos | null>(null);

  // Estados para búsqueda personalizada
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Función para obtener el nombre del cliente
  const getClienteName = (clienteId: string | ICliente) => {
    if (typeof clienteId === 'object') return clienteId.nombre;
    const cliente = clientes.find(c => c._id === clienteId);
    return cliente?.nombre || 'Cliente no encontrado';
  };

  // Filtrado personalizado que busca en chasis y nombre del cliente
  const filteredVehiculos = useMemo(() => {
    if (!searchQuery.trim()) {
      return vehiculos;
    }

    const query = searchQuery.toLowerCase().trim();

    return vehiculos.filter(vehiculo => {
      const chasisMatch = vehiculo.chasis?.toLowerCase().includes(query);
      const clienteNombre = getClienteName(vehiculo.id_cliente);
      const clienteMatch = clienteNombre.toLowerCase().includes(query);

      return chasisMatch || clienteMatch;
    });
  }, [vehiculos, searchQuery, clientes]);

  const onSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const onPageChange = (newPage: number) => {
    setPage(newPage);
  };

  const onRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const loadError =
    vehCrud.allQuery.error ||
    cliCrud.allQuery.error ||
    modCrud.allQuery.error ||
    colCrud.allQuery.error ||
    marCrud.allQuery.error;

  if (
    vehCrud.allQuery.isLoading ||
    cliCrud.allQuery.isLoading ||
    modCrud.allQuery.isLoading ||
    colCrud.allQuery.isLoading ||
    marCrud.allQuery.isLoading
  ) {
    return <Typography>Cargando vehículos...</Typography>;
  }

  if (loadError) {
    return <Typography color="error">Error: {loadError.message}</Typography>;
  }

  if (!isHydrated) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50vh'
      }}>
        <Typography variant="h6" sx={{ color: '#6b7280' }}>
          Cargando vehículos...
        </Typography>
      </Box>
    )
  }

  const safeTheme = isHydrated ? currentTheme : defaultTheme;

  const openNew = (): void => {
    setEditData(null);
    setOpenForm(true);
  };

  const openEdit = (v: IVehiculoDatos): void => {
    setEditData(v);
    setOpenForm(true);
  };

  const closeForm = (): void => setOpenForm(false);

  const onSubmit = (data: Partial<IVehiculoDatos>): void => {
    if (editData) {
      vehCrud.updateM.mutate(
        { id: editData._id, data },
        {
          onSuccess: () => notify('Vehículo actualizado correctamente', 'success'),
          onError: () => notify('Error al actualizar vehículo', 'error'),
        }
      );
    } else {
      vehCrud.createM.mutate(
        data,
        {
          onSuccess: () => notify('Vehículo creado correctamente', 'success'),
          onError: () => notify('Error al crear vehículo', 'error'),
        }
      );
    }
    closeForm();
  };

  const handleDelete = async (v: IVehiculoDatos) => {
    try {
      await vehCrud.deleteM.mutateAsync(v._id);
      notify('Vehículo eliminado correctamente', 'success');
    } catch (error) {
      notify('Error al eliminar vehículo', 'error');
    }
  };

  const toggleActivo = (v: IVehiculoDatos): void => {
    vehCrud.updateM.mutate(
      { id: v._id, data: { activo: !v.activo } },
      {
        onSuccess: () =>
          notify(
            `Vehículo ${v.activo ? 'desactivado' : 'activado'} correctamente`,
            'success'
          ),
        onError: () => notify('Error al cambiar estado del vehículo', 'error'),
      }
    );
  };

  const getModeloInfo = (modeloId: string | IModelosDatos) => {
    if (typeof modeloId === 'object') return modeloId;
    return modelos.find(m => m._id === modeloId);
  };

  const getColorName = (colorId: string | IColoresDatos) => {
    if (typeof colorId === 'object') return colorId.nombre_color;
    const color = colores.find(c => c._id === colorId);
    return color?.nombre_color || 'Color no encontrado';
  };

  const getMarcaName = (marcaId: string | IMarcaVehiculo) => {
    if (typeof marcaId === 'object') return marcaId.nombre_marca;
    const marca = marcas.find(m => m._id === marcaId);
    return marca?.nombre_marca || 'Marca no encontrada';
  };

  const columns: TableColumn[] = [
    {
      id: 'vehiculo',
      label: 'Vehículo',
      minWidth: 280,
      render: (value, row) => {
        const modelo = getModeloInfo(row.id_modelo);
        const marca = modelo ? getMarcaName(modelo.id_marca) : 'N/A';
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
              }}
            >
              <DirectionsCarIcon />
            </Box>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                {marca} {modelo?.nombre_modelo || 'Modelo N/A'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280' }}>
                Chasis: {row.chasis}
              </Typography>
            </Box>
          </Box>
        );
      }
    },
    {
      id: 'propietario',
      label: 'Propietario',
      minWidth: 200,
      render: (value, row) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#374151' }}>
            {getClienteName(row.id_cliente)}
          </Typography>
          <Chip
            size="small"
            label="Cliente"
            sx={{
              background: 'linear-gradient(45deg, #10B981, #34D399)',
              color: 'white',
              fontSize: '0.7rem',
              mt: 0.5
            }}
          />
        </Box>
      )
    },
    {
      id: 'identificacion',
      label: 'Identificación',
      minWidth: 200,
      render: (value, row) => (
        <Box>
          <Typography variant="body2" sx={{ color: '#4b5563', mb: 0.5 }}>
            <strong>Chasis:</strong> {row.chasis}
          </Typography>
          <Typography variant="body2" sx={{ color: '#4b5563' }}>
            <strong>Año:</strong> {row.anio}
          </Typography>
        </Box>
      )
    },
    {
      id: 'detalles',
      label: 'Detalles',
      minWidth: 180,
      render: (value, row) => (
        <Box>
          <Typography variant="body2" sx={{ color: '#4b5563', mb: 0.5 }}>
            <strong>Año:</strong> {row.anio}
          </Typography>
          <Chip
            size="small"
            label={getColorName(row.id_color)}
            sx={{
              background: 'linear-gradient(45deg, #F59E0B, #FBBF24)',
              color: 'white',
              fontSize: '0.7rem'
            }}
          />
        </Box>
      )
    },
    {
      id: 'estado',
      label: 'Estado',
      minWidth: 120,
      render: (value, row) => (
        <StatusChip
          status={row.activo ? 'Activo' : 'Inactivo'}
          colorMap={{
            'Activo': 'linear-gradient(45deg, #10B981, #34D399)',
            'Inactivo': 'linear-gradient(45deg, #EF4444, #F87171)',
            'Mantenimiento': 'linear-gradient(45deg, #F59E0B, #FBBF24)'
          }}
        />
      )
    },
    {
      id: 'fechaCreacion',
      label: 'Fecha Creación',
      minWidth: 130,
      render: (value, row) => (
        <Typography variant="body2" sx={{ color: '#374151', fontSize: '0.85rem' }}>
          {new Date((row as any).createdAt || new Date()).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          })}
        </Typography>
      )
    },
    {
      id: 'acciones',
      label: 'Acciones',
      align: 'center',
      minWidth: 180,
      render: (value, row) => (
        <ActionButtons
          onEdit={() => openEdit(row)}
          onDelete={() => handleDelete(row)}
          customActions={[
            {
              icon: row.activo ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />,
              onClick: () => toggleActivo(row),
              color: row.activo
                ? 'linear-gradient(45deg, #10B981, #34D399)'
                : 'linear-gradient(45deg, #F59E0B, #FBBF24)',
              tooltip: row.activo ? 'Desactivar' : 'Activar'
            }
          ]}
        />
      )
    }
  ];

  return (
    <>
      <ModernTable
        title="Gestión de Vehículos"
        subtitle="Administra la información de todos los vehículos registrados"
        titleIcon="🚗"
        columns={columns}
        data={filteredVehiculos}
        searchTerm={searchQuery}
        onSearchChange={onSearchChange}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        onCreateNew={openNew}
        createButtonText="Registrar Vehículo"
        emptyMessage="No hay vehículos registrados"
        emptySubMessage="Comienza registrando el primer vehículo"
        searchPlaceholder="Buscar por chasis o cliente..."
      />

      <VehiculoModal
        open={openForm}
        defaultData={editData ?? undefined}
        clientes={clientes}
        marcas={marcas}
        modelos={modelos}
        colores={colores}
        onClose={closeForm}
        onSubmit={onSubmit}
      />
    </>
  );
}
