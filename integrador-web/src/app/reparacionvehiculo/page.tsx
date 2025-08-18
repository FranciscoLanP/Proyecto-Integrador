'use client';

import React, { useEffect, useState } from 'react';
import {
  Box, Typography, CircularProgress, IconButton, Chip
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ModernTable from '@/components/ModernTable/ModernTable';
import { useHydration } from '@/hooks/useHydration';
import { useTheme } from '@/app/context/ThemeContext';
import { useNotification } from '@/components/utils/NotificationProvider';
import ReparacionVehiculoModal from './ReparacionVehiculoModal';
import { reparacionVehiculoService, ReparacionVehiculo } from '@/services/reparacionVehiculoService';

dayjs.locale('es');

export default function ReparacionVehiculoPage() {
  const { notify } = useNotification();
  const [reparaciones, setReparaciones] = useState<ReparacionVehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<ReparacionVehiculo | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaCreacion, setFechaCreacion] = useState<dayjs.Dayjs | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Estados para el modal de advertencia de eliminación
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [reparacionToDelete, setReparacionToDelete] = useState<string | null>(null);

  const { currentTheme, isHydrated } = useTheme();
  const isHydratedCustom = useHydration();

  const fetchReparaciones = async () => {
    setLoading(true);
    try {
      const data = await reparacionVehiculoService.fetchAll();
      console.log('🔍 Reparaciones desde el backend:', data);
      if (data.length > 0) {
        console.log('🧩 Estructura de piezas_usadas:', data[0].piezas_usadas);
      }
      setReparaciones(data);
    } catch (err) {
      alert('Error al cargar reparaciones');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReparaciones();
  }, []);

  const handleCreate = () => {
    setEditData(undefined);
    setModalOpen(true);
  };

  const handleEdit = (data: ReparacionVehiculo) => {
    setEditData(data);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setReparacionToDelete(id);
    setShowDeleteWarning(true);
  };

  const proceedWithDelete = async () => {
    if (!reparacionToDelete) return;

    setShowDeleteWarning(false);
    try {
      await reparacionVehiculoService.remove(reparacionToDelete);
      notify('Reparación eliminada correctamente', 'success');
      fetchReparaciones();
    } catch (error: any) {
      console.log('Error completo:', error);
      console.log('Error response:', error.response);
      console.log('Error response data:', error.response?.data);
      console.log('Error response status:', error.response?.status);

      if (error.response?.status === 400 && error.response.data?.message) {
        notify(error.response.data.message, 'error');
      } else {
        notify('Error al eliminar la reparación', 'error');
      }
    } finally {
      setReparacionToDelete(null);
    }
  };

  const handleModalSubmit = async (data: ReparacionVehiculo) => {
    try {
      if (editData && editData._id) {
        await reparacionVehiculoService.update(editData._id, data);
      } else {
        await reparacionVehiculoService.create(data);
      }
      setModalOpen(false);
      setEditData(undefined);
      fetchReparaciones();
    } catch {
      alert('Error al guardar');
    }
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const getClienteVehiculoInfo = (reparacion: ReparacionVehiculo): { cliente: string; vehiculo: string } => {
    const inspeccion = reparacion.id_inspeccion as any;
    if (!inspeccion || typeof inspeccion === 'string') {
      return { cliente: 'Cliente desconocido', vehiculo: 'Info no disponible' };
    }

    const cliente = inspeccion.id_recibo?.id_recepcion?.id_vehiculo?.id_cliente;
    const vehiculo = inspeccion.id_recibo?.id_recepcion?.id_vehiculo;

    const clienteInfo = cliente?.nombre || 'Cliente desconocido';
    const vehiculoInfo = vehiculo
      ? `${vehiculo.id_modelo?.id_marca?.nombre_marca || ''} ${vehiculo.id_modelo?.nombre_modelo || ''} ${vehiculo.anio || ''}`.trim()
      : 'Vehículo desconocido';

    return { cliente: clienteInfo, vehiculo: vehiculoInfo };
  };

  const getEmpleadosInfo = (reparacion: ReparacionVehiculo) => {
    const empleadosTrabajos = (reparacion as any).empleados_trabajos;
    if (empleadosTrabajos && empleadosTrabajos.length > 0) {
      return empleadosTrabajos.map((et: any) => ({
        nombre: et.id_empleado?.nombre || 'Empleado desconocido',
        trabajo: et.descripcion_trabajo || 'Sin descripción'
      }));
    }

    const empleadoAnterior = (reparacion.id_empleadoInformacion as any);
    if (empleadoAnterior?.nombre) {
      return [{ nombre: empleadoAnterior.nombre, trabajo: 'Trabajo general' }];
    }

    return [{ nombre: 'Sin empleado', trabajo: 'Sin descripción' }];
  };

  const getPiezasInfo = (reparacion: ReparacionVehiculo) => {
    console.log('🔧 Procesando piezas_usadas:', reparacion.piezas_usadas);

    if (!reparacion.piezas_usadas || reparacion.piezas_usadas.length === 0) {
      return [];
    }

    return reparacion.piezas_usadas.map((piezaUsada: any) => {
      console.log('🔍 PiezaUsada completa:', piezaUsada);

      const pieza = piezaUsada.id_pieza;
      console.log('🧩 Pieza poblada:', pieza);

      if (pieza && typeof pieza === 'object' && pieza.nombre_pieza) {
        return {
          nombre: pieza.nombre_pieza,
          cantidad: piezaUsada.cantidad || 0,
          precio: pieza.costo_promedio || 0
        };
      }

      return {
        nombre: 'Pieza desconocida',
        cantidad: piezaUsada.cantidad || 0,
        precio: 0
      };
    });
  };

  const reparacionesFiltradas = React.useMemo(() => {
    let filtered = reparaciones.filter(reparacion => {
      if (!searchTerm.trim()) return true;

      const clienteInfo = getClienteVehiculoInfo(reparacion);
      return clienteInfo.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (fechaCreacion) {
      filtered = filtered.filter(reparacion => {
        const fechaReparacion = reparacion.createdAt?.toString().slice(0, 10) ||
          reparacion.fecha_inicio?.slice(0, 10) || '';
        const fechaSeleccionada = fechaCreacion.format('YYYY-MM-DD');
        return fechaReparacion === fechaSeleccionada;
      });
    }

    return filtered;
  }, [reparaciones, searchTerm, fechaCreacion]);

  const tableData = reparacionesFiltradas.map(reparacion => {
    const clienteVehiculo = getClienteVehiculoInfo(reparacion);
    const empleados = getEmpleadosInfo(reparacion);
    const piezas = getPiezasInfo(reparacion);

    return {
      id: reparacion._id || '',
      clienteVehiculo: (
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
            �
          </Box>
          <Box>
            <div className="font-medium" style={{ color: '#374151' }}>
              {clienteVehiculo.cliente}
            </div>
            <div className="text-sm text-gray-500">{clienteVehiculo.vehiculo}</div>
          </Box>
        </Box>
      ),
      empleados: (
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
            👨‍🔧
          </Box>
          <Box>
            {empleados.slice(0, 2).map((emp: any, idx: number) => (
              <div key={idx} className="text-sm">
                <div className="font-medium" style={{ color: '#374151' }}>{emp.nombre}</div>
                <div className="text-xs text-gray-500">{emp.trabajo}</div>
              </div>
            ))}
            {empleados.length > 2 && (
              <Chip
                size="small"
                label={`+${empleados.length - 2} más`}
                sx={{
                  background: 'linear-gradient(45deg, #6B7280, #9CA3AF)',
                  color: 'white',
                  fontSize: '0.7rem',
                  mt: 0.5
                }}
              />
            )}
          </Box>
        </Box>
      ),
      descripcion: reparacion.descripcion || '—',
      piezas: piezas.length > 0 ? (
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
            🔩
          </Box>
          <Box>
            {piezas.slice(0, 2).map((p: any, idx: number) => (
              <div key={idx} className="text-sm" style={{ color: '#374151' }}>
                {p.nombre} (x{p.cantidad})
              </div>
            ))}
            {piezas.length > 2 && (
              <Chip
                size="small"
                label={`+${piezas.length - 2} más piezas`}
                sx={{
                  background: 'linear-gradient(45deg, #8B5CF6, #A78BFA)',
                  color: 'white',
                  fontSize: '0.7rem',
                  mt: 0.5
                }}
              />
            )}
          </Box>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #9CA3AF, #D1D5DB)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            ❌
          </Box>
          <Typography variant="body2" sx={{ color: '#6B7280', fontStyle: 'italic' }}>
            Sin piezas
          </Typography>
        </Box>
      ),
      acciones: (
        <Box display="flex" gap={0.5}>
          <IconButton
            size="small"
            onClick={() => handleEdit(reparacion)}
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
            onClick={() => handleDelete(reparacion._id!)}
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
      fechaCreacion: (
        <Typography variant="body2" sx={{ color: '#374151', fontSize: '0.85rem' }}>
          {new Date(reparacion.createdAt || new Date()).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          })}
        </Typography>
      ),
      originalData: reparacion
    };
  }); const columns = [
    { id: 'clienteVehiculo', label: 'Cliente | Vehículo' },
    { id: 'empleados', label: 'Empleados' },
    { id: 'descripcion', label: 'Descripción' },
    { id: 'piezas', label: 'Piezas Usadas' },
    { id: 'fechaCreacion', label: 'Fecha Creación' },
    { id: 'acciones', label: 'Acciones' }
  ];

  if (!isHydrated || !isHydratedCustom) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Reparaciones de Vehículos</h1>
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
      <div className="max-w-7xl mx-auto">



        {loading ? (
          <div className="flex justify-center items-center h-64">
            <CircularProgress size={40} />
          </div>
        ) : (
          <ModernTable
            title="Reparaciones de Vehículos"
            subtitle="Gestiona las reparaciones del taller y crea facturas"
            data={tableData}
            columns={columns}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            onCreateNew={handleCreate}
            createButtonText="Nueva Reparación"
            emptyMessage="No se encontraron reparaciones"
            searchPlaceholder="Buscar por cliente..."
            filterComponent={
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  {/* Filtro de fecha de creación */}
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

                  {/* Botón para limpiar filtro de fecha */}
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
        )}

        <ReparacionVehiculoModal
          open={modalOpen}
          defaultData={editData}
          onClose={() => {
            setModalOpen(false);
            setEditData(undefined);
          }}
          onSubmit={handleModalSubmit}
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
              Confirmar Eliminación de Reparación
            </h2>
            <p style={{
              color: '#666',
              marginBottom: '24px',
              fontSize: '1.1rem',
              lineHeight: 1.5
            }}>
              <strong>¿Está seguro que desea eliminar esta reparación?</strong>
              <br /><br />
              Esta acción no se puede deshacer. Si la reparación está asignada a una factura, no podrá eliminarse.
            </p>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowDeleteWarning(false);
                  setReparacionToDelete(null);
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
                onClick={proceedWithDelete}
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
                🗑️ Eliminar Reparación
              </button>
            </Box>
          </Box>
        </Box>
      </div>
    </div>
  );
}