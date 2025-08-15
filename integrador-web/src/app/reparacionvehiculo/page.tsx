'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, IconButton, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ModernTable from '@/components/ModernTable/ModernTable';
import { useHydration } from '@/hooks/useHydration';
import { useTheme } from '@/app/context/ThemeContext';
import ReparacionVehiculoModal from './ReparacionVehiculoModal';
import FacturaModal from '../factura/FacturaModal';
import { reparacionVehiculoService, ReparacionVehiculo } from '@/services/reparacionVehiculoService';
import { facturaService, Factura } from '@/services/facturaService';

export default function ReparacionVehiculoPage() {
  const [reparaciones, setReparaciones] = useState<ReparacionVehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<ReparacionVehiculo | undefined>(undefined);
  const [facturaModalOpen, setFacturaModalOpen] = useState(false);
  const [facturaDefault, setFacturaDefault] = useState<Factura | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

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
    if (confirm('¿Seguro que deseas eliminar esta reparación?')) {
      try {
        await reparacionVehiculoService.remove(id);
        fetchReparaciones();
      } catch {
        alert('Error al eliminar');
      }
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

  const handleCrearFactura = (reparacion: ReparacionVehiculo) => {
    setFacturaDefault({
      id_reparacion: reparacion._id!,
      fecha_emision: new Date().toISOString().slice(0, 10),
      total: reparacion.costo_total ?? 0,
      metodo_pago: '',
      detalles: '',
      emitida: false,
      tipo_factura: 'Contado',
      metodos_pago: [{ tipo: 'Efectivo', monto: reparacion.costo_total ?? 0 }],
      descuento_porcentaje: 0
    });
    setFacturaModalOpen(true);
  };

  const handleFacturaModalSubmit = async (data: Factura) => {
    try {
      await facturaService.create(data);
      setFacturaModalOpen(false);
      alert('Factura creada correctamente');
    } catch {
      alert('Error al guardar factura');
    }
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
    return (reparacion.piezas_usadas ?? []).map((p) => {
      const pieza = (p as any)?.id_pieza;
      if (pieza && typeof pieza === 'object' && pieza.nombre_pieza) {
        return {
          nombre: pieza.nombre_pieza,
          cantidad: p.cantidad,
          precio: pieza.precio_venta || 0
        };
      }
      return {
        nombre: 'Pieza desconocida',
        cantidad: p.cantidad,
        precio: 0
      };
    });
  };

  // Filtrar reparaciones por cliente
  const reparacionesFiltradas = reparaciones.filter(reparacion => {
    if (!searchTerm.trim()) return true;

    const clienteInfo = getClienteVehiculoInfo(reparacion);
    return clienteInfo.cliente.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const tableData = reparacionesFiltradas.map(reparacion => {
    const clienteVehiculo = getClienteVehiculoInfo(reparacion);
    const empleados = getEmpleadosInfo(reparacion);
    const piezas = getPiezasInfo(reparacion);
    const costoTotal = reparacion.costo_total || 0;

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
      costo: (
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
            {costoTotal > 0 ? `$${costoTotal.toLocaleString('es-DO', { minimumFractionDigits: 2 })}` : '$0.00'}
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
          <IconButton
            size="small"
            onClick={() => handleCrearFactura(reparacion)}
            title="Crear factura"
            sx={{
              background: 'linear-gradient(45deg, #10B981, #34D399)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #059669, #10B981)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)'
              },
              transition: 'all 0.3s ease',
              width: 32,
              height: 32
            }}
          >
            <ReceiptIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
      originalData: reparacion
    };
  }); const columns = [
    { id: 'clienteVehiculo', label: 'Cliente | Vehículo' },
    { id: 'empleados', label: 'Empleados' },
    { id: 'descripcion', label: 'Descripción' },
    { id: 'piezas', label: 'Piezas Usadas' },
    { id: 'costo', label: 'Costo Total' },
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
  const totalCostos = reparaciones.reduce((sum, r) => sum + (r.costo_total || 0), 0);

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
            page={0}
            rowsPerPage={10}
            onPageChange={() => { }}
            onRowsPerPageChange={() => { }}
            onCreateNew={handleCreate}
            createButtonText="Nueva Reparación"
            emptyMessage="No se encontraron reparaciones"
            searchPlaceholder="Buscar por cliente..."
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

        <FacturaModal
          open={facturaModalOpen}
          defaultData={facturaDefault}
          onClose={() => setFacturaModalOpen(false)}
          onSubmit={handleFacturaModalSubmit}
        />
      </div>
    </div>
  );
}