'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, IconButton, CircularProgress, Chip, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import PaymentIcon from '@mui/icons-material/Payment';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FacturaModal from './FacturaModal';
import { facturaService, Factura } from '@/services/facturaService';
import { pagoFacturaCustomService } from '@/services/pagoFacturaService';
import ModernTable from '@/components/ModernTable/ModernTable';
import { useHydration } from '@/hooks/useHydration';
import { useClientTheme } from '@/hooks/useClientTheme';
import { useJwtDecode } from '@/hooks/useJwtDecode';

// Configurar dayjs en español
dayjs.locale('es');

interface FacturaConPagos extends Factura {
  totalPagado?: number;
  estadoPago?: 'Pendiente' | 'Pago Parcial' | 'Saldado' | 'Pagado';
}

const calcularEstadoPago = (factura: Factura, totalPagado: number): 'Pendiente' | 'Pago Parcial' | 'Saldado' | 'Pagado' => {
  const total = factura.total || 0;

  console.log(`🧮 Calculando estado para factura ${factura._id}:`, {
    tipo: factura.tipo_factura,
    total,
    totalPagado,
    emitida: factura.emitida
  });

  if (factura.tipo_factura === 'Contado') {
    return 'Pagado';
  } else {
    if (totalPagado === 0) {
      return 'Pendiente';
    } else if (totalPagado >= total) {
      return 'Saldado';
    } else {
      return 'Pago Parcial';
    }
  }
};

const getColorEstado = (estado: string) => {
  switch (estado) {
    case 'Pagado':
    case 'Saldado':
      return 'linear-gradient(45deg, #10B981, #34D399)';
    case 'Pago Parcial':
      return 'linear-gradient(45deg, #F59E0B, #FBBF24)';
    case 'Pendiente':
      return 'linear-gradient(45deg, #EF4444, #F87171)';
    default:
      return 'linear-gradient(45deg, #6B7280, #9CA3AF)';
  }
};

export default function FacturaPage() {
  const router = useRouter();
  const [facturas, setFacturas] = useState<FacturaConPagos[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Factura | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [fechaEmision, setFechaEmision] = useState<dayjs.Dayjs | null>(null);

  const { currentTheme, isHydrated } = useClientTheme();
  const isHydratedCustom = useHydration();
  const { role: userRole } = useJwtDecode();

  const fetchFacturas = async () => {
    setLoading(true);
    try {
      const data = await facturaService.fetchAll();
      console.log('💰 Facturas desde el backend:', data);

      const facturasConPagos: FacturaConPagos[] = await Promise.all(
        data.map(async (factura) => {
          try {
            console.log(`🔍 Obteniendo pagos para factura ${factura._id}:`, {
              id: factura._id,
              tipo: factura.tipo_factura,
              total: factura.total,
              emitida: factura.emitida
            });

            const pagosInfo = await pagoFacturaCustomService.getPagosByFactura(factura._id!);
            const totalPagado = pagosInfo.resumen?.totalPagado || 0;
            const estadoPago = calcularEstadoPago(factura, totalPagado);

            console.log(`💰 Factura ${factura._id}:`, {
              tipo: factura.tipo_factura,
              total: factura.total,
              emitida: factura.emitida,
              totalPagado,
              resumenCompleto: pagosInfo.resumen,
              estadoCalculado: estadoPago
            });

            return {
              ...factura,
              totalPagado,
              estadoPago
            };
          } catch (error) {
            console.warn(`⚠️ Error obteniendo pagos para factura ${factura._id}:`, error);
            const estadoPago = calcularEstadoPago(factura, 0);
            return {
              ...factura,
              totalPagado: 0,
              estadoPago
            };
          }
        })
      );

      setFacturas(facturasConPagos);
    } catch (err) {
      alert('Error al cargar facturas');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFacturas();
  }, []);

  const handleCreate = () => {
    setEditData(undefined);
    setModalOpen(true);
  };

  const handleEdit = (data: Factura) => {
    setEditData(data);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    const factura = facturas.find(f => f._id === id);
    if (factura?.emitida) {
      alert('No se puede eliminar una factura emitida.');
      return;
    }
    if (confirm('¿Seguro que deseas eliminar esta factura?')) {
      try {
        await facturaService.remove(id);
        fetchFacturas();
      } catch {
        alert('Error al eliminar');
      }
    }
  };

  const handleModalSubmit = async (data: Factura) => {
    try {
      if (editData && editData._id) {
        await facturaService.update(editData._id, data);
      } else {
        await facturaService.create(data);
      }
      setModalOpen(false);
      setEditData(undefined);
      fetchFacturas();
    } catch {
      alert('Error al guardar');
    }
  };

  const handlePrint = (factura: Factura) => {
    try {
      console.log('🖨️ Iniciando proceso de impresión para factura:', factura._id);

      const reparacion = (factura as any).id_reparacion;

      if (!reparacion || typeof reparacion === 'string') {
        console.error('❌ Datos de reparación no disponibles:', reparacion);
        return alert('Datos de la reparación no disponibles para la impresión');
      }

      const inspeccion = reparacion.id_inspeccion;
      if (!inspeccion || typeof inspeccion === 'string') {
        console.error('❌ Datos de inspección no disponibles:', inspeccion);
        return alert('Datos de la inspección no disponibles');
      }

      const cliente = inspeccion.id_recibo?.id_recepcion?.id_vehiculo?.id_cliente;
      const vehiculo = inspeccion.id_recibo?.id_recepcion?.id_vehiculo;
      const empleadoReparacion = reparacion.id_empleadoInformacion;

      console.log('🔍 Datos para impresión:', {
        factura: factura,
        reparacion: reparacion,
        inspeccion: inspeccion,
        cliente: cliente,
        vehiculo: vehiculo,
        empleadoReparacion: empleadoReparacion,
        piezasUsadas: reparacion.piezas_usadas,
        costoManoObraInspeccion: inspeccion.costo_mano_obra,
        costoAproximado: inspeccion.costo_aproximado,
        tiempoEstimado: inspeccion.tiempo_estimado
      });

      if (!cliente) {
        return alert('Datos del cliente no disponibles');
      }

      const now = new Date().toLocaleString();
      const fechaEmision = new Date(factura.fecha_emision).toLocaleDateString('es-DO');

      const piezasUsadas = reparacion.piezas_usadas || [];

      const costoManoObra = inspeccion.costo_mano_obra || 0;
      const totalPiezas = piezasUsadas.reduce((sum: number, p: any) => {
        const precio = p.precio_unitario || p.id_pieza?.costo_promedio || 0;
        return sum + (precio * (p.cantidad || 0));
      }, 0);

      const subtotalSinImpuestos = costoManoObra + totalPiezas;
      const descuentoPorcentaje = factura.descuento_porcentaje || 0;
      const montoDescuento = subtotalSinImpuestos * (descuentoPorcentaje / 100);
      const subtotalConDescuento = subtotalSinImpuestos - montoDescuento;
      const itbis = subtotalConDescuento * 0.18;
      const totalConItbis = subtotalConDescuento + itbis;

      const vehiculoInfo = vehiculo
        ? `${vehiculo.id_modelo?.id_marca?.nombre_marca || ''} ${vehiculo.id_modelo?.nombre_modelo || ''} ${vehiculo.anio || ''} (${vehiculo.id_color?.nombre_color || ''})`.trim()
        : 'Vehículo no especificado';

      const metodosPagoInfo = (() => {
        if (factura.metodos_pago && factura.metodos_pago.length > 0) {
          return factura.metodos_pago.map((mp: any) => ({
            tipo: mp.tipo,
            monto: mp.monto,
            referencia: mp.referencia
          }));
        }
        return [{
          tipo: factura.metodo_pago || 'Efectivo',
          monto: totalConItbis,
          referencia: null
        }];
      })();

      const tipoFactura = factura.tipo_factura || 'Contado';

      const html = `
        <html>
          <head>
            <title>Factura - JHS AutoServicios</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, sans-serif; margin:0; padding:20px; color:#222; background:#fff; }
              .container { max-width: 800px; margin: 0 auto; padding: 40px; }
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
              .section-title { font-weight:bold; margin-top:24px; color:#1976d2; }
              .info-table td { border:none; padding:2px 8px; }
              .totals-table { width: 350px; float: right; margin-top: 24px; }
              .totals-table td { border: none; text-align: right; font-size: 0.9em; }
              .totals-table .label { color: #1976d2; font-weight: bold; }
              .totals-table .total-row td { font-weight: bold; font-size: 1.0em; background:#e3f2fd; }
              .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; color: white; font-size: 0.9em; font-weight: bold; }
              .status-emitida { background-color: #4caf50; }
              .status-pendiente { background-color: #ff9800; }
            </style>
          </head>
          <body>
            <div class="container">
              <header>
                <div>
                  <div class="brand">JHS AutoServicios</div>
                  <div class="subtitle">FACTURA ${tipoFactura.toUpperCase()}</div>
                  <div style="font-size:0.95em;color:#888;">N° ${factura._id}</div>
                  <span class="status-badge ${factura.emitida ? 'status-emitida' : 'status-pendiente'}">
                    ${factura.emitida ? 'EMITIDA' : 'PENDIENTE'}
                  </span>
                </div>
                <div class="right">
                  <div class="brand-sub">Taller Mecánico</div>
                  <div style="font-size:0.95em;">RNC: 123-45678-9</div>
                  <div style="font-size:0.95em;">Dirección: Calle Ficticia 123</div>
                  <div style="font-size:0.95em;">Tel: 555-123-4567</div>
                </div>
              </header>
              <hr />
              <table class="info-table" style="margin-bottom: 0; margin-top: 10px;">
                <tr>
                  <td class="label">Cliente:</td>
                  <td>${cliente.nombre || '—'}</td>
                  <td class="label">Vehículo:</td>
                  <td>${vehiculoInfo}</td>
                  <td class="label">Chasis:</td>
                  <td>${vehiculo?.chasis || '—'}</td>
                </tr>
              </table>
          
              <div class="section-title">Servicios y Piezas</div>
              <table>
                <tr>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Precio Unitario</th>
                  <th>Subtotal</th>
                </tr>
                <tr>
                  <td>Mano de Obra - ${reparacion.descripcion || 'Reparación'}</td>
                  <td>1</td>
                  <td>$${(inspeccion.costo_mano_obra || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                  <td>$${(inspeccion.costo_mano_obra || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                </tr>
                ${piezasUsadas.map((p: any) => `
                  <tr>
                    <td>${p.id_pieza?.nombre_pieza || 'Pieza'} ${p.id_pieza?.serial ? `(Serial: ${p.id_pieza.serial})` : ''}</td>
                    <td>${p.cantidad}</td>
                    <td>$${((p.precio_unitario || p.id_pieza?.costo_promedio || 0)).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                    <td>$${((p.precio_unitario || p.id_pieza?.costo_promedio || 0) * p.cantidad).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `).join('')}
              </table>
              
              <table class="totals-table">
                <tr>
                  <td class="label">SUBTOTAL:</td>
                  <td>$${subtotalSinImpuestos.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td class="label">DESCUENTO (${descuentoPorcentaje}%):</td>
                  <td>$${montoDescuento.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr>
                  <td class="label">ITBIS (18%):</td>
                  <td>$${itbis.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
                <tr class="total-row">
                  <td class="label">TOTAL A PAGAR:</td>
                  <td>$${totalConItbis.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              </table>
              
              <div style="clear:both"></div>
              
              <table style="width: 350px; float: right;">
                ${metodosPagoInfo.map(mp => `
                  <tr>
                    <td class="label">${mp.tipo}:</td>
                    <td style="text-align: right;">$${mp.monto.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  </tr>
                  ${mp.referencia ? `
                    <tr>
                      <td style="font-size: 0.9em; color: #666;">Ref: ${mp.referencia}</td>
                      <td></td>
                    </tr>
                  ` : ''}
                `).join('')}
                <tr style="border-top: 1px solid #eee;">
                  <td class="label" style="font-weight: bold;">TOTAL PAGADO:</td>
                  <td style="text-align: right; font-weight: bold;">$${metodosPagoInfo.reduce((sum, mp) => sum + mp.monto, 0).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              </table>
              
              <div style="clear:both"></div>
              <hr />
              
              <div class="footer">
                <strong>¡Gracias por confiar en JHS AutoServicios!</strong><br>
                * Esta factura es válida como comprobante de pago.<br>
                * Garantizamos nuestros servicios por 90 días.<br>
                ${tipoFactura === 'Credito' ?
          `<div style="color: #f57c00; font-weight: bold; margin-top: 10px;">
                    ⚠️ FACTURA A CRÉDITO - Pendiente de pago completo
                  </div>` :
          `<div style="color: #4caf50; font-weight: bold; margin-top: 10px;">
                    ✅ FACTURA AL CONTADO - Pago completo recibido
                  </div>`
        }
                Para consultas: info@jhsautoservicios.com
              </div>
            </div>
          </body>
        </html>
      `;

      console.log('✅ HTML de factura generado exitosamente', {
        htmlLength: html.length,
        hasCliente: !!cliente?.nombre,
        hasVehiculo: !!vehiculoInfo,
        hasPiezas: piezasUsadas.length,
        totalCalculado: totalConItbis
      });

      // Abrir ventana flotante para impresión
      const w = window.open('', 'factura_print', 'width=800,height=900,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no');
      if (!w) {
        alert('Por favor permite las ventanas emergentes para imprimir la factura');
        return;
      }
      w.document.write(html);
      w.document.close();
      w.focus();
      w.onafterprint = () => w.close();
      w.print();
    } catch (error) {
      console.error('❌ Error al generar la factura:', error);
      alert('Error al generar la factura para impresión: ' + (error as Error).message);
    }
  };

  const getClienteVehiculoInfo = (factura: Factura): { cliente: string; vehiculo: string } => {
    try {
      const reparacion = (factura as any).id_reparacion;
      if (reparacion && typeof reparacion === 'object') {
        const inspeccion = reparacion.id_inspeccion;
        if (inspeccion && typeof inspeccion === 'object') {
          const cliente = inspeccion.id_recibo?.id_recepcion?.id_vehiculo?.id_cliente;
          const vehiculo = inspeccion.id_recibo?.id_recepcion?.id_vehiculo;

          if (cliente && vehiculo) {
            const clienteNombre = cliente.nombre || 'Cliente';
            const vehiculoInfo = vehiculo.id_modelo?.nombre_modelo || 'Vehículo';
            return { cliente: clienteNombre, vehiculo: vehiculoInfo };
          }
        }
      }
      return { cliente: 'Cliente desconocido', vehiculo: `Reparación ${factura.id_reparacion}` };
    } catch (error) {
      return { cliente: 'Cliente desconocido', vehiculo: `Reparación ${factura.id_reparacion}` };
    }
  };

  const handleGestionarPagos = (factura: Factura) => {
    router.push(`/factura/pagos/${factura._id}`);
  };

  const getMetodosPagoInfo = (factura: Factura) => {
    if (factura.metodos_pago && factura.metodos_pago.length > 0) {
      return factura.metodos_pago.map((mp: any, idx: number) => (
        <div key={idx} style={{ fontSize: '0.875rem', marginBottom: '2px' }}>
          <strong>{mp.tipo}:</strong> ${mp.monto}
          {mp.referencia && <small> ({mp.referencia})</small>}
        </div>
      ));
    }
    return factura.metodo_pago || '—';
  };

  // Filtrar facturas basado en búsqueda, tipo y fecha de emisión
  const facturasFiltradas = React.useMemo(() => {
    let filtered = facturas;

    // Filtrar por tipo de factura
    if (tipoFilter) {
      filtered = filtered.filter(factura => factura.tipo_factura === tipoFilter);
    }

    // Filtrar por término de búsqueda (solo nombre del cliente)
    if (searchTerm.trim()) {
      filtered = filtered.filter(factura => {
        const clienteInfo = getClienteVehiculoInfo(factura);
        return clienteInfo.cliente.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (fechaEmision) {
      filtered = filtered.filter(factura => {
        const fechaFactura = factura.fecha_emision?.toString().slice(0, 10) || '';
        const fechaSeleccionada = fechaEmision.format('YYYY-MM-DD');
        return fechaFactura === fechaSeleccionada;
      });
    }

    return filtered;
  }, [facturas, tipoFilter, searchTerm, fechaEmision]); const tableData = facturasFiltradas.map(factura => {
    const clienteVehiculo = getClienteVehiculoInfo(factura);
    const fechaEmision = factura.fecha_emision?.toString().slice(0, 10) || '—';
    const total = factura.total || 0;
    const descuento = factura.descuento_porcentaje || 0;
    const tipoFactura = factura.tipo_factura || 'Contado';
    const metodosPago = getMetodosPagoInfo(factura);

    return {
      id: factura._id || '',
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
            📄
          </Box>
          <Box>
            <div className="font-medium" style={{ color: '#374151' }}>
              {clienteVehiculo.cliente}
            </div>
            <div className="text-sm text-gray-500">{clienteVehiculo.vehiculo}</div>
          </Box>
        </Box>
      ),
      fechaEmision: fechaEmision,
      total: `$${total.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`,
      descuento: `${descuento}%`,
      tipo: (
        <Chip
          label={tipoFactura}
          sx={{
            background: tipoFactura === 'Credito'
              ? 'linear-gradient(45deg, #F59E0B, #FBBF24)'
              : 'linear-gradient(45deg, #10B981, #34D399)',
            color: 'white',
            fontWeight: 'medium'
          }}
          size="small"
        />
      ),
      metodosPago: metodosPago,
      detalles: factura.detalles || '—',
      estado: (
        <Chip
          label={factura.estadoPago || 'Pendiente'}
          sx={{
            background: getColorEstado(factura.estadoPago || 'Pendiente'),
            color: 'white',
            fontWeight: 'medium'
          }}
          size="small"
        />
      ),
      acciones: (
        <Box display="flex" gap={0.5}>
          {userRole === 'administrador' && (
            <IconButton
              size="small"
              onClick={() => handleEdit(factura)}
              disabled={factura.emitida}
              title="Editar"
              sx={{
                background: factura.emitida
                  ? 'linear-gradient(45deg, #9CA3AF, #D1D5DB)'
                  : 'linear-gradient(45deg, #3B82F6, #60A5FA)',
                color: 'white',
                '&:hover': factura.emitida ? {} : {
                  background: 'linear-gradient(45deg, #2563EB, #3B82F6)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                },
                '&:disabled': {
                  background: 'linear-gradient(45deg, #9CA3AF, #D1D5DB)',
                  color: 'white',
                  opacity: 0.6
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
              onClick={() => handleDelete(factura._id!)}
              disabled={factura.emitida}
              title="Eliminar"
              sx={{
                background: factura.emitida
                  ? 'linear-gradient(45deg, #9CA3AF, #D1D5DB)'
                  : 'linear-gradient(45deg, #EF4444, #F87171)',
                color: 'white',
                '&:hover': factura.emitida ? {} : {
                  background: 'linear-gradient(45deg, #DC2626, #EF4444)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                },
                '&:disabled': {
                  background: 'linear-gradient(45deg, #9CA3AF, #D1D5DB)',
                  color: 'white',
                  opacity: 0.6
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
            onClick={() => handlePrint(factura)}
            title="Imprimir factura"
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

          {factura.tipo_factura === 'Credito' && (
            <IconButton
              size="small"
              onClick={() => handleGestionarPagos(factura)}
              title="Gestionar pagos"
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
              <PaymentIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
      originalData: factura
    };
  });

  const columns = [
    { id: 'clienteVehiculo', label: 'Cliente | Vehículo' },
    { id: 'fechaEmision', label: 'Fecha Emisión' },
    { id: 'total', label: 'Total' },
    { id: 'descuento', label: 'Descuento' },
    { id: 'tipo', label: 'Tipo' },
    { id: 'metodosPago', label: 'Métodos de Pago' },
    { id: 'detalles', label: 'Detalles' },
    { id: 'estado', label: 'Estado' },
    { id: 'acciones', label: 'Acciones' }
  ];

  if (!isHydrated || !isHydratedCustom) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Facturas</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <CircularProgress size={40} />
          </div>
        </div>
      </div>
    );
  }

  const emitidas = facturas.filter(f => f.emitida).length;
  const pendientes = facturas.filter(f => !f.emitida).length;
  const totalIngresos = facturas.filter(f => f.emitida).reduce((sum, f) => sum + (f.total || 0), 0);
  const credito = facturas.filter(f => f.tipo_factura === 'Credito').length;

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
            title="Facturas del Taller"
            subtitle="Administra las facturas del taller y controla los pagos"
            data={tableData}
            columns={columns}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            page={0}
            rowsPerPage={10}
            onPageChange={() => { }}
            onRowsPerPageChange={() => { }}
            onCreateNew={handleCreate}
            createButtonText="Nueva Factura"
            emptyMessage="No se encontraron facturas"
            searchPlaceholder="Buscar por nombre del cliente..."
            filterComponent={
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  {/* Filtro de fecha de emisión */}
                  <DatePicker
                    label="📅 Fecha de emisión"
                    value={fechaEmision}
                    onChange={(newValue) => setFechaEmision(newValue)}
                    format="DD/MM/YYYY"
                    slotProps={{
                      textField: {
                        size: 'small',
                        placeholder: "Seleccione fecha",

                        sx: {
                          minWidth: 220,
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
                            '& .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(100, 149, 237, 0.3)',
                              borderRadius: '12px',
                              borderWidth: '1.5px'
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'rgba(100, 149, 237, 0.5)',
                              borderWidth: '2px'
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: 'primary.main',
                              borderWidth: '2px',
                              boxShadow: '0 0 10px rgba(100, 149, 237, 0.3)'
                            }
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(0, 0, 0, 0.7)',
                            fontWeight: 500,
                            '&.Mui-focused': {
                              color: 'primary.main'
                            }
                          },
                          '& .MuiFormHelperText-root': {
                            color: 'rgba(0, 0, 0, 0.6)',
                            fontSize: '0.75rem',
                            fontWeight: 400
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
                  {fechaEmision && (
                    <IconButton
                      size="small"
                      onClick={() => setFechaEmision(null)}
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

                  {/* Select de tipo de factura */}
                  <FormControl size="small" sx={{ minWidth: 170 }}>
                    <InputLabel
                      sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                        '&.Mui-focused': {
                          color: 'primary.main'
                        }
                      }}
                    >
                      Tipo de Factura
                    </InputLabel>
                    <Select
                      value={tipoFilter}
                      onChange={(e) => setTipoFilter(e.target.value)}
                      label="Tipo de Factura"
                      sx={{
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
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(100, 149, 237, 0.3)',
                          borderRadius: '12px',
                          borderWidth: '1.5px'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(100, 149, 237, 0.5)',
                          borderWidth: '2px'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'primary.main',
                          borderWidth: '2px',
                          boxShadow: '0 0 10px rgba(100, 149, 237, 0.3)'
                        }
                      }}
                    >
                      <MenuItem value="">🗂️ Todos</MenuItem>
                      <MenuItem value="Contado">💵 Contado</MenuItem>
                      <MenuItem value="Credito">💳 Crédito</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </LocalizationProvider>
            }
          />
        )}

        <FacturaModal
          open={modalOpen}
          defaultData={editData}
          onClose={() => {
            setModalOpen(false);
            setEditData(undefined);
          }}
          onSubmit={handleModalSubmit}
        />
      </div>
    </div>
  );
}