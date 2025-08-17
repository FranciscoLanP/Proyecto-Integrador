'use client';

import React, { useState } from 'react';
import { Typography, Box, Chip, IconButton } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import PrintIcon from '@mui/icons-material/Print';
import ReceiptIcon from '@mui/icons-material/Receipt';
import PersonIcon from '@mui/icons-material/Person';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

dayjs.locale('es');

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
  const [fechaCreacion, setFechaCreacion] = useState<dayjs.Dayjs | null>(null);

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

  const getSearchInfo = (recibo: IReciboVehiculo) => {
    const recepcion = getRecepcionData(recibo.id_recepcion);
    const vehiculo = recepcion ? getVehiculoFromRecepcion(recepcion) : null;
    const cliente = vehiculo ? getClienteFromVehiculo(vehiculo) : null;

    return {
      clienteNombre: cliente?.nombre || '',
      vehiculoChasis: vehiculo?.chasis || ''
    };
  };

  const recibosFiltrados = React.useMemo(() => {
    let filtered = recibos.filter(recibo => {
      if (!searchTerm) return true;
      const { clienteNombre, vehiculoChasis } = getSearchInfo(recibo);
      const searchLower = searchTerm.toLowerCase();
      return (
        clienteNombre.toLowerCase().includes(searchLower) ||
        vehiculoChasis.toLowerCase().includes(searchLower)
      );
    });

    if (fechaCreacion) {
      filtered = filtered.filter(recibo => {
        const recepcion = recibo.id_recepcion as IRecepcionVehiculo;
        const fechaRecibo = recepcion?.createdAt?.toString().slice(0, 10) || recepcion?.fecha?.slice(0, 10) || '';
        const fechaSeleccionada = fechaCreacion.format('YYYY-MM-DD');
        return fechaRecibo === fechaSeleccionada;
      });
    }

    return filtered;
  }, [recibos, searchTerm, fechaCreacion]);

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
            @page { size: A5; margin: 10mm; }
            * { box-sizing: border-box; }
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 8px; 
              color: #333; 
              font-size: 11px;
              line-height: 1.2;
            }
            .header { 
              text-align: center; 
              border-bottom: 2px solid #005B96; 
              padding-bottom: 6px; 
              margin-bottom: 8px; 
            }
            .header h1 { 
              margin: 0; 
              color: #005B96; 
              font-size: 16px; 
              font-weight: bold; 
            }
            .header .subtitle { 
              margin: 2px 0 0; 
              color: #007ACC; 
              font-size: 10px; 
              font-weight: normal; 
            }
            .recibo-info { 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              margin-bottom: 8px; 
              padding: 4px; 
              background: #f8f9fa; 
              border-radius: 3px; 
            }
            .recibo-num { 
              font-weight: bold; 
              color: #005B96; 
              font-size: 12px; 
            }
            .fecha { 
              font-size: 9px; 
              color: #666; 
            }
            .info-grid { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 4px; 
              margin-bottom: 8px; 
            }
            .info-item { 
              display: flex; 
              flex-direction: column; 
              padding: 3px; 
              border: 1px solid #e0e0e0; 
              border-radius: 2px; 
              background: #fafafa; 
            }
            .info-label { 
              font-weight: bold; 
              color: #005B96; 
              font-size: 9px; 
              margin-bottom: 1px; 
            }
            .info-value { 
              color: #333; 
              font-size: 10px; 
              word-break: break-word; 
            }
            .full-width { 
              grid-column: 1 / -1; 
            }
            .observaciones { 
              margin: 6px 0; 
              padding: 6px; 
              border: 1px solid #ccc; 
              border-radius: 3px; 
              background: #f9f9f9; 
            }
            .obs-label { 
              font-weight: bold; 
              color: #005B96; 
              font-size: 10px; 
              margin-bottom: 3px; 
            }
            .obs-content { 
              font-size: 10px; 
              color: #333; 
              min-height: 15px; 
            }
            .signatures { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 15px; 
              margin: 12px 0 8px; 
              padding: 8px 0; 
            }
            .signature-box { 
              text-align: center; 
              padding: 4px; 
            }
            .signature-line { 
              border-top: 1px solid #333; 
              margin: 20px 0 4px; 
              height: 1px; 
            }
            .signature-label { 
              font-size: 9px; 
              color: #333; 
              font-weight: bold; 
            }
            .signature-sublabel { 
              font-size: 8px; 
              color: #666; 
              margin-top: 2px; 
            }
            .footer { 
              text-align: center; 
              margin-top: 8px; 
              padding-top: 6px; 
              border-top: 1px solid #ccc; 
              font-size: 9px; 
              color: #666; 
            }
            @media print {
              body { font-size: 10px; }
              .header h1 { font-size: 14px; }
              .recibo-num { font-size: 11px; }
              .signature-line { margin: 25px 0 4px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>JHS AutoServicios</h1>
            <div class="subtitle">Recibo de Servicio de Vehículo</div>
          </div>
          
          <div class="recibo-info">
            <span class="recibo-num">Recibo #${r._id.slice(-6).toUpperCase()}</span>
            <span class="fecha">${now}</span>
          </div>
          
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Cliente</div>
              <div class="info-value">${cli?.nombre ?? '—'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Empleado</div>
              <div class="info-value">${empleado}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Chasis</div>
              <div class="info-value">${veh?.chasis ?? '—'}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Año</div>
              <div class="info-value">${veh?.anio ?? '—'}</div>
            </div>
            <div class="info-item full-width">
              <div class="info-label">Problema Reportado</div>
              <div class="info-value">${rec.problema_reportado ?? '—'}</div>
            </div>
            ${rec.comentario ? `
            <div class="info-item full-width">
              <div class="info-label">Comentario</div>
              <div class="info-value">${rec.comentario}</div>
            </div>
            ` : ''}
          </div>
          
          <div class="observaciones">
            <div class="obs-label">Observaciones</div>
            <div class="obs-content">${r.observaciones ?? 'Sin observaciones adicionales'}</div>
          </div>
          
          <div class="signatures">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Firma del Cliente</div>
              <div class="signature-sublabel">${cli?.nombre ?? '—'}</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Firma del Empleado</div>
              <div class="signature-sublabel">${empleado}</div>
            </div>
          </div>
          
          <div class="footer">
            Gracias por confiar en JHS AutoServicios
          </div>
        </body>
      </html>
    `;

    const w = window.open('', 'recibo_print', 'width=600,height=700,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no');
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
        sx={{ maxWidth: '100%', margin: '0 auto' }}
        filterComponent={
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <DatePicker
                label="📅 Fecha de Creación"
                value={fechaCreacion}
                onChange={(newValue) => setFechaCreacion(newValue)}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: {
                      minWidth: 200,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(15px)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          boxShadow: '0 6px 25px rgba(0,0,0,0.12)',
                          transform: 'translateY(-1px)'
                        },
                        '& fieldset': {
                          borderColor: 'rgba(100, 149, 237, 0.3)',
                          borderRadius: '12px',
                          borderWidth: '1.5px'
                        },
                        '&:hover fieldset': {
                          borderColor: 'rgba(100, 149, 237, 0.5)',
                          borderWidth: '2px'
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: 'primary.main',
                          borderWidth: '2px',
                          boxShadow: '0 0 10px rgba(100, 149, 237, 0.3)'
                        }
                      },
                      '& .MuiInputLabel-root': {
                        color: 'text.secondary',
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: 'primary.main'
                        }
                      }
                    }
                  },
                  openPickerIcon: {
                    sx: {
                      color: 'primary.main',
                      '&:hover': {
                        color: 'primary.dark'
                      }
                    }
                  }
                }}
                sx={{
                  '& .MuiPickersDay-root': {
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: 'rgba(100, 149, 237, 0.1)'
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      '&:hover': {
                        backgroundColor: 'primary.dark'
                      }
                    }
                  }
                }}
              />

              {fechaCreacion && (
                <IconButton
                  size="small"
                  onClick={() => setFechaCreacion(null)}
                  sx={{
                    background: 'linear-gradient(45deg, #ff6b6b, #ff8e53)',
                    color: 'white',
                    width: 36,
                    height: 36,
                    boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #ee5a52, #ff7043)',
                      transform: 'scale(1.1)',
                      boxShadow: '0 6px 20px rgba(255, 107, 107, 0.4)'
                    }
                  }}
                  title="Limpiar filtro de fecha"
                >
                  ✕
                </IconButton>
              )}
            </Box>
          </LocalizationProvider>
        }
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
