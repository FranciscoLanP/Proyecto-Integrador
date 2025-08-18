'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, IconButton, Chip, Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import ModernTable from '@/components/ModernTable/ModernTable';
import { useHydration } from '@/hooks/useHydration';
import { useClientTheme } from '@/hooks/useClientTheme';
import { useJwtDecode } from '@/hooks/useJwtDecode';
import { useNotification } from '@/components/utils/NotificationProvider';
import LoadingSpinner from '@/components/LoadingSpinner';
import InspeccionVehiculoModal from './InspeccionVehiculoModal';
import { inspeccionVehiculoService, InspeccionVehiculo } from '@/services/inspeccionVehiculoService';


dayjs.locale('es');

export default function InspeccionVehiculoPage() {
  const { notify } = useNotification();
  const [inspecciones, setInspecciones] = useState<InspeccionVehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<InspeccionVehiculo | undefined>(undefined);
  const [printHtml, setPrintHtml] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fechaCreacion, setFechaCreacion] = useState<dayjs.Dayjs | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [inspeccionToDelete, setInspeccionToDelete] = useState<string | null>(null);

  const { currentTheme, isHydrated } = useClientTheme();
  const isHydratedCustom = useHydration();
  const { role: userRole } = useJwtDecode();

  const fetchInspecciones = async () => {
    setLoading(true);
    try {
      const inspeccionesData = await inspeccionVehiculoService.fetchAll();
      console.log('🔍 Inspecciones pobladas del backend:', inspeccionesData);
      setInspecciones(inspeccionesData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      alert('Error al cargar inspecciones');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInspecciones();
  }, []);

  const getClienteNombre = (inspeccion: InspeccionVehiculo) => {
    try {
      const recibo = inspeccion.id_recibo as any;
      if (!recibo || typeof recibo === 'string') return 'Cliente no encontrado';
      const cliente = recibo.id_recepcion?.id_vehiculo?.id_cliente;
      return cliente?.nombre || 'Cliente no encontrado';
    } catch (error) {
      console.error('Error al obtener cliente:', error);
      return 'Error al obtener cliente';
    }
  };

  const getEmpleadoNombre = (inspeccion: InspeccionVehiculo) => {
    try {
      const empleado = inspeccion.id_empleadoInformacion as any;
      if (!empleado || typeof empleado === 'string') return 'Empleado no encontrado';
      return empleado.nombre || 'Empleado no encontrado';
    } catch (error) {
      console.error('Error al obtener empleado:', error);
      return 'Error al obtener empleado';
    }
  };

  const getInspectionStatus = (resultado: string) => {
    if (!resultado) return { status: 'Sin resultado', color: 'gray' as const };

    const resultadoLower = resultado.toLowerCase();
    if (resultadoLower.includes('aprobado') || resultadoLower.includes('bueno') || resultadoLower.includes('correcto')) {
      return { status: 'Aprobado', color: 'green' as const };
    } else if (resultadoLower.includes('rechazado') || resultadoLower.includes('malo') || resultadoLower.includes('fallido')) {
      return { status: 'Rechazado', color: 'red' as const };
    } else if (resultadoLower.includes('pendiente') || resultadoLower.includes('proceso')) {
      return { status: 'Pendiente', color: 'yellow' as const };
    } else {
      return { status: 'Revisión', color: 'blue' as const };
    }
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleCreate = () => {
    setEditData(undefined);
    setModalOpen(true);
  };

  const handleEdit = (data: InspeccionVehiculo) => {
    setEditData(data);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setInspeccionToDelete(id);
    setShowDeleteWarning(true);
  };

  const proceedWithDelete = async () => {
    if (!inspeccionToDelete) return;

    setShowDeleteWarning(false);
    try {
      await inspeccionVehiculoService.remove(inspeccionToDelete);
      notify('Inspección eliminada correctamente', 'success');
      fetchInspecciones();
    } catch (error: any) {
      console.log('Error completo:', error);
      console.log('Error response:', error.response);
      console.log('Error response data:', error.response?.data);
      console.log('Error response status:', error.response?.status);

      if (error.response?.status === 400 && error.response.data?.message) {
        // Mostrar el mensaje exacto del backend
        notify(error.response.data.message, 'error');
      } else {
        notify('Error al eliminar la inspección', 'error');
      }
    } finally {
      setInspeccionToDelete(null);
    }
  };

  const handleModalSubmit = async (data: InspeccionVehiculo) => {
    try {
      if (editData && editData._id) {
        await inspeccionVehiculoService.update(editData._id, data);
      } else {
        await inspeccionVehiculoService.create(data);
      }
      setModalOpen(false);
      fetchInspecciones();
    } catch {
      alert('Error al guardar');
    }
  };

  const handlePrint = (inspeccion: InspeccionVehiculo) => {
    try {
      const recibo = inspeccion.id_recibo as any;
      const empleado = inspeccion.id_empleadoInformacion as any;

      if (!recibo || typeof recibo === 'string') {
        return alert('Datos del recibo no disponibles');
      }

      if (!empleado || typeof empleado === 'string') {
        return alert('Datos del empleado no disponibles');
      }

      const cliente = recibo.id_recepcion?.id_vehiculo?.id_cliente;
      if (!cliente) {
        return alert('Datos del cliente no disponibles');
      }

      const now = new Date().toLocaleString();
      const piezas = inspeccion.piezas_sugeridas ?? [];
      const total = piezas.reduce((acc, p) => acc + (p.precio_unitario ?? 0) * p.cantidad, 0);
      const subtotal = total / 1.18;
      const itbis = total - subtotal;
      const descuento = 0;

      const html = `
      <style>
        .container { max-width: 800px; margin: 0 auto; padding: 40px; font-family: 'Segoe UI', Tahoma, sans-serif; color:#222; background:#fff; }
        header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
        .brand { font-size:2rem; font-weight:bold; color:#1976d2; }
        .brand-sub { color:#1976d2; font-weight:bold; }
        .right { text-align:right; }
        .subtitle { margin:5px 0 20px; color:#1976d2; }
        hr { border: none; border-top: 1px solid #eee; margin: 16px 0; }
        table { width:100%; border-collapse:collapse; margin-top:20px; }
        th, td { padding:8px; border-bottom:1px solid #eee; }
        th { background:#f5f5f5; }
        .label { font-weight:bold; color:#1976d2; }
        .total { font-weight:bold; background:#e3f2fd; }
        .footer { text-align:center; margin-top:30px; font-size:0.95em; color:#666; }
        .section-title { font-weight:bold; margin-top:24px; }
        .info-table td { border:none; padding:2px 8px; }
        .totals-table { width: 300px; float: right; margin-top: 24px; }
        .totals-table td { border: none; text-align: right; font-size: 1.05em; }
        .totals-table .label { color: #1976d2; }
        .totals-table .total-row td { font-weight: bold; font-size: 1.1em; }
      </style>
      <div class="container">
        <header>
          <div>
            <div class="brand">JHS AutoServicios</div>
            <div class="subtitle">Cotización de Inspección</div>
            <div style="font-size:0.95em;color:#888;">N° ${inspeccion._id}</div>
          </div>
          <div class="right">
            <div class="brand-sub">Taller Mecánico</div>
            <div style="font-size:0.95em;">Dirección: Calle Ficticia 123</div>
            <div style="font-size:0.95em;">Tel: 555-123-4567</div>
          </div>
        </header>
        <hr />
        <table class="info-table" style="margin-bottom: 0;">
          <tr>
            <td class="label">Cliente:</td>
            <td>${cliente?.nombre ?? '—'}</td>
            <td class="label">Atendió:</td>
            <td>${empleado?.nombre ?? '—'}</td>
          </tr>
        </table>
        <hr />
        <div class="section-title">Detalle de Inspección</div>
        <table class="info-table">
          <tr>
            <td class="label">Comentario:</td>
            <td>${inspeccion.comentario ?? '—'}</td>
            <td class="label">Resultado:</td>
            <td>${inspeccion.resultado ?? '—'}</td>
            <td class="label">Fecha impresión:</td>
            <td>${now}</td>
          </tr>
        </table>
        <hr />
        <div class="section-title">Piezas Sugeridas</div>
        <table>
          <tr>
            <th>Pieza</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Subtotal</th>
          </tr>
          ${piezas.map(p => `
            <tr>
              <td>${p.nombre_pieza}</td>
              <td>${p.cantidad}</td>
              <td>$${(p.precio_unitario ?? 0).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</td>
              <td>$${((p.precio_unitario ?? 0) * p.cantidad).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</td>
            </tr>
          `).join('')}
        </table>
        <table class="totals-table">
          <tr>
            <td class="label">SUBTOTAL</td>
            <td>${subtotal.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td class="label">DESC.</td>
            <td>${descuento.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td class="label">ITBIS</td>
            <td>${itbis.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
          <tr class="total-row">
            <td class="label">TOTAL</td>
            <td>$${total.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        </table>
        <div style="clear:both"></div>
        <div class="footer">
          * Esta cotización es informativa y no representa un compromiso de reparación.<br>
          Gracias por preferir JHS AutoServicios
        </div>
      </div>
    `;

      setPrintHtml(html);
    } catch (error) {
      console.error('Error al generar la impresión:', error);
      alert('Error al generar la cotización');
    }
  };

  useEffect(() => {
    if (printHtml) {
      setTimeout(() => {
        window.print();
        setPrintHtml(null);
      }, 0);
    }
  }, [printHtml]);

  const inspeccionesFiltradas = React.useMemo(() => {
    let filtered = inspecciones.filter(inspeccion => {
      const cliente = getClienteNombre(inspeccion);
      const empleado = getEmpleadoNombre(inspeccion);
      const comentario = inspeccion.comentario || '';

      const matchesSearch = searchTerm === '' ||
        cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empleado.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comentario.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });

    if (fechaCreacion) {
      filtered = filtered.filter(inspeccion => {
        const fechaInspeccion = inspeccion.createdAt?.toString().slice(0, 10) || '';
        const fechaSeleccionada = fechaCreacion.format('YYYY-MM-DD');
        return fechaInspeccion === fechaSeleccionada;
      });
    }

    return filtered;
  }, [inspecciones, searchTerm, fechaCreacion]);
  const tableData = inspeccionesFiltradas.map(inspeccion => {
    const cliente = getClienteNombre(inspeccion);
    const empleado = getEmpleadoNombre(inspeccion);
    const { status, color } = getInspectionStatus(inspeccion.resultado || '');
    const fechaCreacion = inspeccion.createdAt ? new Date(inspeccion.createdAt).toLocaleDateString('es-ES') : '—';
    const piezas = inspeccion.piezas_sugeridas ?? [];
    const total = piezas.reduce((acc, p) => acc + (p.precio_unitario ?? 0) * p.cantidad, 0);

    return {
      id: inspeccion._id || '',
      cliente: (
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
              {cliente}
            </div>
            <div className="text-sm text-gray-500">{empleado}</div>
          </Box>
        </Box>
      ),
      comentario: (
        <Typography variant="body2" sx={{
          color: '#374151',
          maxWidth: '200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {inspeccion.comentario || 'Sin comentario'}
        </Typography>
      ),
      resultado: (
        <Chip
          label={status}
          sx={{
            background: color === 'green' ? 'linear-gradient(45deg, #10B981, #34D399)' :
              color === 'red' ? 'linear-gradient(45deg, #EF4444, #F87171)' :
                color === 'yellow' ? 'linear-gradient(45deg, #F59E0B, #FBBF24)' :
                  color === 'blue' ? 'linear-gradient(45deg, #3B82F6, #60A5FA)' :
                    'linear-gradient(45deg, #6B7280, #9CA3AF)',
            color: 'white',
            fontWeight: 'medium'
          }}
          size="small"
        />
      ),
      piezas: piezas.length > 0 ? (
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#8B5CF6' }}>
          {piezas.length} pieza{piezas.length !== 1 ? 's' : ''}
        </Typography>
      ) : (
        <Typography variant="body2" sx={{ color: '#6B7280', fontStyle: 'italic' }}>
          Sin piezas
        </Typography>
      ),
      total: (
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#059669' }}>
          ${total.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
        </Typography>
      ),
      acciones: (
        <Box display="flex" gap={0.5}>
          {userRole === 'administrador' && (
            <IconButton
              size="small"
              onClick={() => handleEdit(inspeccion)}
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
          )}
          {userRole === 'administrador' && (
            <IconButton
              size="small"
              onClick={() => handleDelete(inspeccion._id!)}
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
          )}
          <IconButton
            size="small"
            onClick={() => handlePrint(inspeccion)}
            title="Imprimir inspección"
            sx={{
              background: 'linear-gradient(45deg, #8B5CF6, #A78BFA)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #7C3AED, #8B5CF6)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)'
              },
              transition: 'all 0.3s ease',
              width: 32,
              height: 32
            }}
          >
            <PrintIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
      fechaCreacion: fechaCreacion,
      originalData: inspeccion
    };
  });

  const columns = [
    { id: 'cliente', label: 'Cliente | Empleado' },
    { id: 'comentario', label: 'Comentario' },
    { id: 'resultado', label: 'Estado' },
    { id: 'piezas', label: 'Piezas Sugeridas' },
    { id: 'total', label: 'Total Estimado' },
    { id: 'fechaCreacion', label: 'Fecha Creación' },
    { id: 'acciones', label: 'Acciones' }
  ];

  if (!isHydrated || !isHydratedCustom) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Inspecciones de Vehículos</h1>
          </div>
          <LoadingSpinner
            variant="minimal"
            message="Inicializando aplicación..."
            size={40}
          />
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
          <LoadingSpinner
            variant="detailed"
            message="Cargando inspecciones..."
            size={45}
          />
        ) : (
          <ModernTable
            title="Inspecciones de Vehículos"
            subtitle="Gestiona las inspecciones técnicas y genera cotizaciones de reparación"
            data={tableData}
            columns={columns}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            onCreateNew={handleCreate}
            createButtonText="Nueva Inspección"
            emptyMessage="No se encontraron inspecciones"
            searchPlaceholder="Buscar por cliente, empleado o comentario..."
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
        )}

        <InspeccionVehiculoModal
          open={modalOpen}
          defaultData={editData}
          onClose={() => setModalOpen(false)}
          onSubmit={handleModalSubmit}
        />

        {printHtml && (
          <div
            id="print-area"
            dangerouslySetInnerHTML={{ __html: printHtml }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'white',
              zIndex: 9999,
              overflow: 'auto'
            }}
          />
        )}

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
              Confirmar Eliminación de Inspección
            </h2>
            <p style={{
              color: '#666',
              marginBottom: '24px',
              fontSize: '1.1rem',
              lineHeight: 1.5
            }}>
              <strong>¿Está seguro que desea eliminar esta inspección?</strong>
              <br /><br />
              Esta acción no se puede deshacer. Si la inspección está asignada a una reparación, no podrá eliminarse.
            </p>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowDeleteWarning(false);
                  setInspeccionToDelete(null);
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
                🗑️ Eliminar Inspección
              </button>
            </Box>
          </Box>
        </Box>
      </div>
    </div>
  );
}