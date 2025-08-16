
'use client';

import React, { useState } from 'react';
import { Typography, Box, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AssignmentIcon from '@mui/icons-material/Assignment';

import { useCrud } from '../../hooks/useCrud';
import { useNotification } from '../../components/utils/NotificationProvider';
import type {
  IReciboVehiculo,
  IRecepcionVehiculo,
  IEmpleadoInformacion,
  ICliente,
  IVehiculoDatos
} from '../types';
import ReciboVehiculoModal from './ReciboVehiculoModal';
import {
  ModernTable,
  useModernTable,
  StatusChip,
  ActionButtons,
  type TableColumn
} from '@/components/ModernTable';

export default function RecibosVehiculosPage() {
  const { notify } = useNotification();

  const reciboCrud = useCrud<IReciboVehiculo>('recibosvehiculos');
  const recepCrud = useCrud<IRecepcionVehiculo>('recepcionvehiculos');
  const empCrud = useCrud<IEmpleadoInformacion>('empleadoinformaciones');
  const vehCrud = useCrud<IVehiculoDatos>('vehiculodatos');
  const cliCrud = useCrud<ICliente>('clientes');

  const { data: recibos = [], isLoading: loadRec, error: errRec } = reciboCrud.allQuery;
  const { data: recepciones = [], isLoading: loadRep, error: errRep } = recepCrud.allQuery;
  const { data: empleados = [], isLoading: loadEmp, error: errEmp } = empCrud.allQuery;
  const { data: vehiculos = [], isLoading: loadVeh, error: errVeh } = vehCrud.allQuery;
  const { data: clientes = [], isLoading: loadCli, error: errCli } = cliCrud.allQuery;

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<IReciboVehiculo | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Funciones auxiliares para obtener datos relacionados
  const getRecepcionData = (recepcionId: string | IRecepcionVehiculo) => {
    if (typeof recepcionId === 'object') return recepcionId;
    return recepciones.find(r => r._id === recepcionId);
  };

  const getVehiculoFromRecepcion = (recepcion: IRecepcionVehiculo) => {
    if (typeof recepcion.id_vehiculo === 'object') return recepcion.id_vehiculo;
    return vehiculos.find(v => v._id === recepcion.id_vehiculo);
  };

  const getClienteFromVehiculo = (vehiculo: IVehiculoDatos) => {
    if (typeof vehiculo.id_cliente === 'object') return vehiculo.id_cliente;
    return clientes.find(c => c._id === vehiculo.id_cliente);
  };

  const getEmpleadoFromRecepcion = (recepcion: IRecepcionVehiculo) => {
    if (typeof recepcion.id_empleadoInformacion === 'object') return recepcion.id_empleadoInformacion;
    return empleados.find(e => e._id === recepcion.id_empleadoInformacion);
  };

  // Función para obtener información de búsqueda de un recibo
  const getSearchInfo = (recibo: IReciboVehiculo) => {
    const recepcion = getRecepcionData(recibo.id_recepcion);
    const vehiculo = recepcion ? getVehiculoFromRecepcion(recepcion) : null;
    const cliente = vehiculo ? getClienteFromVehiculo(vehiculo) : null;

    return {
      clienteNombre: cliente?.nombre || '',
      vehiculoChasis: vehiculo?.chasis || ''
    };
  };

  // Filtrar recibos por término de búsqueda (cliente o vehículo)
  const recibosFiltrados = recibos.filter(recibo => {
    if (!searchTerm) return true;
    const { clienteNombre, vehiculoChasis } = getSearchInfo(recibo);
    const searchLower = searchTerm.toLowerCase();
    return (
      clienteNombre.toLowerCase().includes(searchLower) ||
      vehiculoChasis.toLowerCase().includes(searchLower)
    );
  });

  // Hook simplificado para manejar solo paginación
  const {
    paginatedData,
    page,
    rowsPerPage,
    handlePageChange,
    handleRowsPerPageChange
  } = useModernTable({
    data: recibosFiltrados,
    initialRowsPerPage: 10
  });

  // Funciones adaptadoras
  const onSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const onPageChange = (page: number) => {
    handlePageChange(null, page);
  };

  const onRowsPerPageChange = (rowsPerPage: number) => {
    const mockEvent = { target: { value: rowsPerPage.toString() } } as React.ChangeEvent<HTMLInputElement>;
    handleRowsPerPageChange(mockEvent);
  };

  if (loadRec || loadRep || loadEmp || loadVeh || loadCli) {
    return <Typography>Cargando recibos...</Typography>;
  }
  if (errRec) return <Typography color="error">Error recibos: {errRec.message}</Typography>;
  if (errRep) return <Typography color="error">Error recepciones: {errRep.message}</Typography>;
  if (errEmp) return <Typography color="error">Error empleados: {errEmp.message}</Typography>;
  if (errVeh) return <Typography color="error">Error vehículos: {errVeh.message}</Typography>;
  if (errCli) return <Typography color="error">Error clientes: {errCli.message}</Typography>;

  const openNew = () => {
    setEditData(null);
    setModalOpen(true);
  };

  const openEdit = (row: IReciboVehiculo) => {
    setEditData(row);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (payload: Partial<IReciboVehiculo>) => {
    try {
      if (editData) {
        await reciboCrud.updateM.mutateAsync({ id: editData._id, data: payload });
        notify('Recibo actualizado correctamente', 'success');
      } else {
        await reciboCrud.createM.mutateAsync(payload);
        notify('Recibo creado correctamente', 'success');
      }
      await reciboCrud.allQuery.refetch();
    } catch {
      notify('Error al guardar recibo', 'error');
    } finally {
      setModalOpen(false);
    }
  };

  const handleDelete = async (row: IReciboVehiculo) => {
    try {
      await reciboCrud.deleteM.mutateAsync(row._id);
      notify('Recibo eliminado correctamente', 'success');
    } catch {
      notify('Error al eliminar recibo', 'error');
    }
  };

  const handlePrint = (r: IReciboVehiculo) => {
    const rec = recepciones.find(rep => {
      const rid = typeof r.id_recepcion === 'string'
        ? r.id_recepcion
        : r.id_recepcion._id;
      return rid === rep._id;
    });
    if (!rec) return alert('Recepción no encontrada');

    const veh = vehiculos.find(v => {
      const vid = typeof rec.id_vehiculo === 'string'
        ? rec.id_vehiculo
        : rec.id_vehiculo._id;
      return vid === v._id;
    });
    const cli = veh
      ? clientes.find(c => {
        const cid = typeof veh.id_cliente === 'string'
          ? veh.id_cliente
          : veh.id_cliente._id;
        return cid === c._id;
      })
      : null;
    const empleado = empleados.find(e => {
      const eid = typeof rec.id_empleadoInformacion === 'string'
        ? rec.id_empleadoInformacion
        : rec.id_empleadoInformacion._id;
      return eid === e._id;
    })?.nombre ?? '—';

    const now = new Date().toLocaleString();
    const html = `
      <html>
        <head>
          <title>Recibo - JHS AutoServicios</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, sans-serif; margin:0; padding:20px; color:#333; }
            header { text-align:center; margin-bottom:20px; }
            h1 { margin:0; color:#005B96; }
            .subtitle { margin:5px 0 20px; color:#007ACC; }
            table { width:100%; border-collapse:collapse; margin-top:20px; }
            td { padding:8px; border-bottom:1px solid #ddd; }
            .label { font-weight:bold; width:30%; color:#005B96; }
            footer { text-align:center; margin-top:30px; font-size:0.85em; color:#666; }
          </style>
        </head>
        <body>
          <header>
            <h1>JHS AutoServicios</h1>
            <div class="subtitle">Recibo de Servicio de Vehículo</div>
          </header>
          <table>
            <tr><td class="label">Cliente</td><td>${cli?.nombre ?? '—'}</td></tr>
            <tr><td class="label">Chasis</td><td>${veh?.chasis ?? '—'}</td></tr>
            <tr><td class="label">Empleado</td><td>${empleado}</td></tr>
            <tr><td class="label">Fecha Impresión</td><td>${now}</td></tr>
            <tr><td class="label">Problema</td><td>${rec.problema_reportado ?? '—'}</td></tr>
            <tr><td class="label">Comentario</td><td>${rec.comentario ?? '—'}</td></tr>
            <tr><td class="label">Observaciones</td><td>${r.observaciones ?? '—'}</td></tr>
          </table>
          <footer>Gracias por preferir JHS AutoServicios</footer>
        </body>
      </html>
    `;

    const w = window.open('', 'recibo_print', 'width=800,height=900,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no');
    if (!w) {
      alert('Por favor permite las ventanas emergentes para imprimir el recibo');
      return;
    }
    w.document.write(html);
    w.document.close();
    w.focus();
    w.onafterprint = () => w.close();
    w.print();
  };

  // Definir las columnas
  const columns: TableColumn[] = [
    {
      id: 'recibo',
      label: 'Recibo',
      minWidth: 120,
      render: (value, row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #EC4899, #BE185D)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.9rem'
            }}
          >
            <ReceiptIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1f2937', fontSize: '0.8rem' }}>
              #{row._id.slice(-4).toUpperCase()}
            </Typography>
            <Chip
              size="small"
              label="Recibo"
              sx={{
                background: 'linear-gradient(45deg, #EC4899, #F472B6)',
                color: 'white',
                fontSize: '0.6rem',
                height: '16px'
              }}
            />
          </Box>
        </Box>
      )
    },
    {
      id: 'cliente',
      label: 'Cliente',
      minWidth: 140,
      render: (value, row) => {
        const recepcion = getRecepcionData(row.id_recepcion);
        const vehiculo = recepcion ? getVehiculoFromRecepcion(recepcion) : null;
        const cliente = vehiculo ? getClienteFromVehiculo(vehiculo) : null;

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '6px',
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
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#374151', fontSize: '0.8rem' }}>
                {cliente?.nombre || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>
                {cliente?.tipo_cliente || 'N/A'}
              </Typography>
            </Box>
          </Box>
        );
      }
    },
    {
      id: 'vehiculo',
      label: 'Vehículo',
      minWidth: 120,
      render: (value, row) => {
        const recepcion = getRecepcionData(row.id_recepcion);
        const vehiculo = recepcion ? getVehiculoFromRecepcion(recepcion) : null;

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '6px',
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
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#374151', fontSize: '0.8rem' }}>
                {vehiculo?.chasis || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>
                {vehiculo?.anio || 'N/A'}
              </Typography>
            </Box>
          </Box>
        );
      }
    },
    {
      id: 'empleado',
      label: 'Empleado',
      minWidth: 110,
      render: (value, row) => {
        const recepcion = getRecepcionData(row.id_recepcion);
        const empleado = recepcion ? getEmpleadoFromRecepcion(recepcion) : null;

        return (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#374151', fontSize: '0.8rem' }}>
              {empleado?.nombre || 'N/A'}
            </Typography>
            <Chip
              size="small"
              label={empleado?.tipo_empleado || 'N/A'}
              sx={{
                background: 'linear-gradient(45deg, #8B5CF6, #A78BFA)',
                color: 'white',
                fontSize: '0.6rem',
                height: '16px',
                mt: 0.5
              }}
            />
          </Box>
        );
      }
    },
    {
      id: 'observaciones',
      label: 'Observaciones',
      minWidth: 160,
      render: (value, row) => (
        <Box>
          <Typography
            variant="body2"
            sx={{
              color: '#374151',
              fontStyle: row.observaciones ? 'normal' : 'italic',
              maxWidth: '160px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '0.8rem'
            }}
          >
            {row.observaciones || 'Sin observaciones'}
          </Typography>
          {row.observaciones && (
            <Chip
              size="small"
              label="Con obs."
              sx={{
                background: 'linear-gradient(45deg, #F59E0B, #FBBF24)',
                color: 'white',
                fontSize: '0.6rem',
                height: '16px',
                mt: 0.5
              }}
            />
          )}
        </Box>
      )
    },
    {
      id: 'estado',
      label: 'Estado',
      minWidth: 90,
      render: (value, row) => (
        <StatusChip
          status="Completado"
          colorMap={{
            'Completado': 'linear-gradient(45deg, #10B981, #059669)',
            'Pendiente': 'linear-gradient(45deg, #F59E0B, #FBBF24)',
            'Anulado': 'linear-gradient(45deg, #EF4444, #F87171)'
          }}
        />
      )
    },
    {
      id: 'fechaCreacion',
      label: 'Fecha Creación',
      minWidth: 110,
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
      minWidth: 130,
      render: (value, row) => (
        <ActionButtons
          onEdit={() => openEdit(row)}
          onDelete={() => handleDelete(row)}
          customActions={[
            {
              icon: <PrintIcon fontSize="small" />,
              onClick: () => handlePrint(row),
              color: 'linear-gradient(45deg, #06B6D4, #0891B2)',
              tooltip: 'Imprimir Recibo'
            },
            {
              icon: <AssignmentIcon fontSize="small" />,
              onClick: () => notify('Ver detalles del recibo', 'info'),
              color: 'linear-gradient(45deg, #8B5CF6, #A78BFA)',
              tooltip: 'Ver Detalles'
            }
          ]}
        />
      )
    }
  ];

  return (
    <>
      <ModernTable
        title="Recibos de Vehículo"
        subtitle="Gestiona los recibos y comprobantes de servicio vehicular"
        titleIcon="🧾"
        columns={columns}
        data={recibosFiltrados}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
        onCreateNew={openNew}
        createButtonText="Nuevo Recibo"
        emptyMessage="No hay recibos registrados"
        emptySubMessage="Comienza generando el primer recibo"
        searchPlaceholder="Buscar por cliente o vehículo (chasis)..."
      />

      <ReciboVehiculoModal
        open={modalOpen}
        defaultData={editData ?? undefined}
        recepciones={recepciones}
        vehiculos={vehiculos}
        clientes={clientes}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </>
  );
}
