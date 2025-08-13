'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, IconButton, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import BuildIcon from '@mui/icons-material/Build';
import PrintIcon from '@mui/icons-material/Print';
import ModernTable from '@/components/ModernTable/ModernTable';
import { useHydration } from '@/hooks/useHydration';
import { useTheme } from '@/app/context/ThemeContext';
import InspeccionVehiculoModal from './InspeccionVehiculoModal';
import ReparacionVehiculoModal from '../reparacionvehiculo/ReparacionVehiculoModal';
import { inspeccionVehiculoService, InspeccionVehiculo } from '@/services/inspeccionVehiculoService';
import { reparacionVehiculoService, ReparacionVehiculo } from '@/services/reparacionVehiculoService';

export default function InspeccionVehiculoPage() {
  const [inspecciones, setInspecciones] = useState<InspeccionVehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<InspeccionVehiculo | undefined>(undefined);
  const [reparacionModalOpen, setReparacionModalOpen] = useState(false);
  const [reparacionDefault, setReparacionDefault] = useState<ReparacionVehiculo | undefined>(undefined);
  const [printHtml, setPrintHtml] = useState<string | null>(null);

  const { currentTheme, isHydrated } = useTheme();
  const isHydratedCustom = useHydration();

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

  const handleCreate = () => {
    setEditData(undefined);
    setModalOpen(true);
  };

  const handleEdit = (data: InspeccionVehiculo) => {
    setEditData(data);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar esta inspección?')) {
      try {
        await inspeccionVehiculoService.remove(id);
        fetchInspecciones();
      } catch {
        alert('Error al eliminar');
      }
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

  const handleCrearReparacion = (inspeccion: InspeccionVehiculo) => {
    setReparacionDefault({
      id_inspeccion: inspeccion._id!,
      id_empleadoInformacion: '',
      fecha_inicio: new Date().toISOString().slice(0, 10),
      descripcion: '',
      piezas_usadas: []
    });
    setReparacionModalOpen(true);
  };

  const handleReparacionModalSubmit = async (data: ReparacionVehiculo) => {
    try {
      await reparacionVehiculoService.create(data);
      setReparacionModalOpen(false);
      alert('Reparación creada correctamente');
    } catch {
      alert('Error al guardar reparación');
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
            <td class="label">Fecha inspección:</td>
            <td>${inspeccion.fecha_inspeccion?.toString().slice(0, 10) ?? '—'}</td>
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

  // Datos para la tabla moderna
  const tableData = inspecciones.map(inspeccion => {
    const statusInfo = getInspectionStatus(inspeccion.resultado || '');
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
            👤
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#374151' }}>
            {getClienteNombre(inspeccion)}
          </Typography>
        </Box>
      ),
      empleado: (
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
            �‍🔧
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 'medium', color: '#374151' }}>
            {getEmpleadoNombre(inspeccion)}
          </Typography>
        </Box>
      ),
      fecha: (
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
              color: 'white'
            }}
          >
            📅
          </Box>
          <Typography variant="body2" sx={{ color: '#374151' }}>
            {inspeccion.fecha_inspeccion?.toString().slice(0, 10) || '—'}
          </Typography>
        </Box>
      ),
      comentario: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #F59E0B, #D97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            📝
          </Box>
          <Typography
            variant="body2"
            sx={{
              color: '#374151',
              maxWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={inspeccion.comentario || '—'}
          >
            {inspeccion.comentario || '—'}
          </Typography>
        </Box>
      ),
      resultado: (
        <Chip
          label={statusInfo.status}
          sx={{
            background: statusInfo.color === 'green' ? 'linear-gradient(45deg, #10B981, #34D399)' :
              statusInfo.color === 'red' ? 'linear-gradient(45deg, #EF4444, #F87171)' :
                statusInfo.color === 'yellow' ? 'linear-gradient(45deg, #F59E0B, #FBBF24)' :
                  'linear-gradient(45deg, #3B82F6, #60A5FA)',
            color: 'white',
            fontWeight: 'medium'
          }}
          size="small"
        />
      ),
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
            {piezas.slice(0, 2).map((p, idx) => (
              <div key={idx} className="text-sm" style={{ color: '#374151' }}>
                {p.nombre_pieza} (x{p.cantidad})
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
      total: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #059669, #10B981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            💰
          </Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#059669' }}>
            {total > 0 ? `$${total.toLocaleString('es-DO', { minimumFractionDigits: 2 })}` : '$0.00'}
          </Typography>
        </Box>
      ),
      acciones: (
        <Box display="flex" gap={0.5}>
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
          <IconButton
            size="small"
            onClick={() => handleCrearReparacion(inspeccion)}
            title="Crear reparación"
            sx={{
              background: 'linear-gradient(45deg, #F59E0B, #FBBF24)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #D97706, #F59E0B)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
              },
              transition: 'all 0.3s ease',
              width: 32,
              height: 32
            }}
          >
            <BuildIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handlePrint(inspeccion)}
            title="Imprimir cotización"
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
      originalData: inspeccion
    };
  });

  const columns = [
    { id: 'cliente', label: 'Cliente' },
    { id: 'empleado', label: 'Empleado' },
    { id: 'fecha', label: 'Fecha' },
    { id: 'comentario', label: 'Comentario' },
    { id: 'resultado', label: 'Estado' },
    { id: 'piezas', label: 'Piezas Sugeridas' },
    { id: 'total', label: 'Total Est.' },
    { id: 'acciones', label: 'Acciones' }
  ];

  if (!isHydrated || !isHydratedCustom) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Inspecciones de Vehículos</h1>
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


      {loading ? (
        <div className="flex justify-center items-center h-64">
          <CircularProgress size={40} />
        </div>
      ) : (
        <ModernTable
          title="Inspecciones de Vehículos"
          subtitle="Gestiona las inspecciones técnicas y genera cotizaciones de reparación"
          data={tableData}
          columns={columns}
          searchTerm=""
          onSearchChange={() => { }}
          page={0}
          rowsPerPage={10}
          onPageChange={() => { }}
          onRowsPerPageChange={() => { }}
          onCreateNew={handleCreate}
          createButtonText="Nueva Inspección"
          emptyMessage="No se encontraron inspecciones"
        />
      )}

      <InspeccionVehiculoModal
        open={modalOpen}
        defaultData={editData}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      <ReparacionVehiculoModal
        open={reparacionModalOpen}
        defaultData={reparacionDefault}
        onClose={() => setReparacionModalOpen(false)}
        onSubmit={handleReparacionModalSubmit}
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
    </div>
  );
}