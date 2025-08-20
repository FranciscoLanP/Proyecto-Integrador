'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, IconButton, Chip, TextField, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import PaymentIcon from '@mui/icons-material/Payment';
import FacturaModal from './FacturaModal';
import { facturaService, Factura } from '@/services/facturaService';
import { pagoFacturaCustomService } from '@/services/pagoFacturaService';
import ModernTable from '@/components/ModernTable/ModernTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useHydration } from '@/hooks/useHydration';
import { useClientTheme } from '@/hooks/useClientTheme';
import { useJwtDecode } from '@/hooks/useJwtDecode';

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
  const [fechaCreacion, setFechaCreacion] = useState<dayjs.Dayjs | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [showPrintWarning, setShowPrintWarning] = useState(false);
  const [facturaToprint, setFacturaToPrint] = useState<Factura | null>(null);

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

  const handleDelete = async (id: string) => {
    // Función deshabilitada - Las facturas no pueden eliminarse
    return;
  };

  const proceedWithDelete = async () => {
    // Función deshabilitada - Las facturas no pueden eliminarse
    return;
  };

  const handleModalSubmit = async (data: Factura) => {
    try {
      // Solo permitir crear nuevas facturas, no editar
      await facturaService.create(data);
      setModalOpen(false);
      setEditData(undefined);
      fetchFacturas();
    } catch {
      alert('Error al guardar');
    }
  };

  const handlePrint = (factura: Factura) => {
    setFacturaToPrint(factura);
    setShowPrintWarning(true);
  };

  const proceedWithPrint = () => {
    if (!facturaToprint) return;

    setShowPrintWarning(false);

    try {
      console.log('🖨️ Iniciando proceso de impresión para factura:', facturaToprint._id);

      const reparacion = (facturaToprint as any).id_reparacion;

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
        factura: facturaToprint,
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
      const fechaEmision = new Date(facturaToprint.createdAt || new Date()).toLocaleDateString('es-DO');

      const piezasUsadas = reparacion.piezas_usadas || [];

      const costoManoObra = inspeccion.costo_mano_obra || 0;
      const totalPiezas = piezasUsadas.reduce((sum: number, p: any) => {
        const precio = p.precio_unitario || p.id_pieza?.costo_promedio || 0;
        return sum + (precio * (p.cantidad || 0));
      }, 0);

      const totalConItbisIncluido = costoManoObra + totalPiezas;
      const descuentoPorcentaje = facturaToprint.descuento_porcentaje || 0;

      console.log('Datos de factura para descuento:', {
        descuento_porcentaje: facturaToprint.descuento_porcentaje,
        descuentoPorcentaje,
        totalConItbisIncluido
      });

      const montoDescuento = totalConItbisIncluido * (descuentoPorcentaje / 100);
      const totalConDescuento = totalConItbisIncluido - montoDescuento;


      const subtotalSinImpuestos = totalConDescuento / 1.18;
      const itbis = totalConDescuento - subtotalSinImpuestos;
      const totalConItbis = totalConDescuento;

      const vehiculoInfo = vehiculo
        ? `${vehiculo.id_modelo?.id_marca?.nombre_marca || ''} ${vehiculo.id_modelo?.nombre_modelo || ''} ${vehiculo.anio || ''} (${vehiculo.id_color?.nombre_color || ''})`.trim()
        : 'Vehículo no especificado';

      const metodosPagoInfo = (() => {
        if (facturaToprint.metodos_pago && facturaToprint.metodos_pago.length > 0) {
          return facturaToprint.metodos_pago.map((mp: any) => ({
            tipo: mp.tipo,
            monto: mp.monto,
            referencia: mp.referencia
          }));
        }
        return [{
          tipo: facturaToprint.metodo_pago || 'Efectivo',
          monto: totalConItbis,
          referencia: null
        }];
      })();

      const tipoFactura = facturaToprint.tipo_factura || 'Contado';

      const html = `
        <html>
          <head>
            <title>Factura - JHS AutoServicios</title>
            <style>
              @page { size: A5; margin: 8mm; }
              * { box-sizing: border-box; }
              body { 
                font-family: Arial, sans-serif; 
                margin: 0; 
                padding: 8px; 
                color: #333; 
                font-size: 10px;
                line-height: 1.2;
                height: 100vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
              }
              
              /* Contenido principal que crece */
              .contenido-principal {
                flex: 1;
                display: flex;
                flex-direction: column;
                overflow: hidden;
              }
              
              /* Contenedor de tablas con scroll */
              .tablas-container {
                flex: 1;
                overflow-y: auto;
                margin-bottom: 8px;
                padding-bottom: 100px; /* Espacio para la sección fija */
              }
              
              /* Sección de totales fija al pie */
              .seccion-pie {
                margin-top: 0;
                padding-top: 12px;
                border-top: 2px solid #1976d2;
                position: fixed;
                bottom: 8px;
                left: 8px;
                right: 8px;
                background: white;
                z-index: 100;
                min-height: 80px;
                box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
              }
              
              /* Header compacto como el recibo */
              .header { 
                text-align: center; 
                border-bottom: 2px solid #1976d2; 
                padding-bottom: 6px; 
                margin-bottom: 8px; 
              }
              .header h1 { 
                margin: 0; 
                color: #1976d2; 
                font-size: 16px; 
                font-weight: bold; 
              }
              .header .subtitle { 
                margin: 2px 0 0; 
                color: #1976d2; 
                font-size: 11px; 
                font-weight: bold; 
              }
              
              /* Info de factura compacta */
              .factura-info {
                display: flex; 
                justify-content: space-between; 
                align-items: center; 
                margin-bottom: 8px; 
                padding: 4px; 
                background: #f8f9fa; 
                border-radius: 3px;
                font-size: 8px;
              }
              .factura-num { 
                font-weight: bold; 
                color: #1976d2; 
                font-size: 11px; 
              }
              .fecha-info { 
                font-size: 8px; 
                color: #666; 
                text-align: right;
                line-height: 1.3;
              }
              .status-badge { 
                display: inline-block; 
                padding: 2px 6px; 
                border-radius: 8px; 
                color: white; 
                font-size: 7px; 
                font-weight: bold;
                margin-left: 8px;
              }
              .status-emitida { background-color: #4caf50; }
              .status-pendiente { background-color: #ff9800; }
              
              /* Grid de información como el recibo */
              .cliente-info {
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
                color: #1976d2;
                font-size: 8px;
                margin-bottom: 1px;
              }
              .info-value {
                color: #333;
                font-size: 9px;
                word-break: break-word;
              }
              .full-width { grid-column: 1 / -1; }
              
              /* Tabla de servicios compacta */
              .servicios-table {
                width: 100%;
                border-collapse: collapse;
                margin: 6px 0;
                font-size: 8px;
              }
              .servicios-table th {
                background: #1976d2;
                color: white;
                padding: 3px 2px;
                text-align: left;
                font-weight: bold;
                font-size: 7px;
              }
              .servicios-table td {
                padding: 2px;
                border-bottom: 0.5px solid #eee;
                vertical-align: top;
                font-size: 8px;
              }
              .servicios-table tr:nth-child(even) {
                background: #f9f9f9;
              }
              
              /* Totales en caja flotante arriba de la línea */
              .totales-section {
                position: absolute;
                top: -70px;
                right: 0;
                z-index: 10;
              }
              .totales-table {
                border-collapse: collapse;
                font-size: 9px;
                min-width: 160px;
                background: white;
                border: 2px solid #1976d2;
                border-radius: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              }
              .totales-table td {
                padding: 4px 8px;
                text-align: right;
              }
              .totales-table .label {
                color: #1976d2;
                font-weight: bold;
                text-align: left;
              }
              .totales-table .total-row {
                background: #e3f2fd;
                font-weight: bold;
                border-top: 2px solid #1976d2;
              }
              
              /* Métodos de pago compactos */
              .pagos-section {
                margin: 12px 0 8px 0;
                font-size: 8px;
                padding-top: 8px;
              }
              .pagos-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                gap: 4px;
                margin-top: 4px;
              }
              .pago-item {
                padding: 3px;
                background: #f0f8ff;
                border-radius: 2px;
                border: 1px solid #1976d2;
              }
              .pago-tipo {
                font-weight: bold;
                color: #1976d2;
                font-size: 7px;
              }
              .pago-monto {
                font-size: 8px;
                color: #333;
              }
              
              /* Footer centrado con texto más grande */
              .footer {
                text-align: center;
                font-size: 9px;
                color: #666;
                padding-top: 12px;
                line-height: 1.4;
                margin: 8px auto 0 auto;
                width: 100%;
                display: block;
              }
              .footer strong {
                font-size: 11px;
                color: #333;
                display: block;
                margin-bottom: 4px;
              }
              .footer .status-pago {
                font-size: 10px;
                font-weight: bold;
                margin-top: 6px;
                display: block;
              }
              .footer .status-credito {
                color: #f57c00;
              }
              .footer .status-completo {
                color: #4caf50;
              }
              
              /* Responsive para muchas piezas */
              .piezas-resumen {
                display: none;
              }
              @media print {
                body { 
                  font-size: 9px; 
                  height: auto !important;
                  overflow: visible !important;
                }
                .header h1 { font-size: 14px; }
                .factura-num { font-size: 10px; }
                .contenido-principal {
                  overflow: visible !important;
                }
                .tablas-container {
                  overflow: visible !important;
                  height: auto !important;
                }
                .seccion-pie {
                  page-break-inside: avoid;
                  position: relative !important;
                  bottom: auto !important;
                  left: auto !important;
                  right: auto !important;
                  box-shadow: none !important;
                  margin-top: auto;
                }
                .totales-section {
                  page-break-inside: avoid;
                }
              }
              
              /* Cuando hay muchas piezas, mostrar resumen */
              ${piezasUsadas.length > 8 ? `
                .piezas-detalladas { display: none; }
                .piezas-resumen { display: table-row; }
              ` : ''}
            </style>
          </head>
          <body>
            <div class="contenido-principal">
              <div class="header">
                <h1>JHS AutoServicios</h1>
                <div class="subtitle">FACTURA ${tipoFactura.toUpperCase()}</div>
              </div>
              
              <div class="factura-info">
                <span class="factura-num">Factura #${(facturaToprint._id || '').slice(-8).toUpperCase()}
                  <span class="status-badge ${facturaToprint.emitida ? 'status-emitida' : 'status-pendiente'}">
                    ${facturaToprint.emitida ? 'EMITIDA' : 'PENDIENTE'}
                  </span>
                </span>
                <div class="fecha-info">
                  <div>Fecha: ${fechaEmision}</div>
                  <div>RNC: 123-45678-9</div>
                  <div>Tel: 555-123-4567</div>
                </div>
              </div>
              
              <div class="cliente-info">
                <div class="info-item">
                  <div class="info-label">Cliente</div>
                  <div class="info-value">${cliente.nombre || '—'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Vehículo</div>
                  <div class="info-value">${vehiculoInfo}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Chasis</div>
                  <div class="info-value">${vehiculo?.chasis || '—'}</div>
                </div>
                <div class="info-item">
                  <div class="info-label">Empleado</div>
                  <div class="info-value">${empleadoReparacion?.nombre || '—'}</div>
                </div>
                ${reparacion.descripcion ? `
                <div class="info-item full-width">
                  <div class="info-label">Descripción del Trabajo</div>
                  <div class="info-value">${reparacion.descripcion}</div>
                </div>
                ` : ''}
              </div>
              
              <div class="tablas-container">
                <table class="servicios-table">
                <thead>
                  <tr>
                    <th style="width: 45%;">Descripción</th>
                    <th style="width: 15%;">Cant.</th>
                    <th style="width: 20%;">P. Unit.</th>
                    <th style="width: 20%;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Mano de Obra</strong></td>
                    <td>1</td>
                    <td>$${(inspeccion.costo_mano_obra || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                    <td>$${(inspeccion.costo_mano_obra || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  ${piezasUsadas.length <= 8 ?
          piezasUsadas.map((p: any) => `
                      <tr class="piezas-detalladas">
                        <td>${(p.id_pieza?.nombre_pieza || 'Pieza').substring(0, 30)}${p.id_pieza?.nombre_pieza?.length > 30 ? '...' : ''}</td>
                        <td>${p.cantidad}</td>
                        <td>$${((p.precio_unitario || p.id_pieza?.costo_promedio || 0)).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                        <td>$${((p.precio_unitario || p.id_pieza?.costo_promedio || 0) * p.cantidad).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    `).join('')
          :
          `<tr class="piezas-resumen">
                      <td><strong>Piezas y Repuestos (${piezasUsadas.length} items)</strong></td>
                      <td>${piezasUsadas.reduce((sum: number, p: any) => sum + (p.cantidad || 0), 0)}</td>
                      <td>—</td>
                      <td>$${totalPiezas.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                    </tr>`
        }
                </tbody>
              </table>
            </div>
            
            <div class="seccion-pie">
              <div class="totales-section">
                <table class="totales-table">
                  <tr>
                    <td class="label">SUBTOTAL (Sin ITBIS):</td>
                    <td>$${subtotalSinImpuestos.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  ${(descuentoPorcentaje > 0 || montoDescuento > 0) ? `
                  <tr>
                    <td class="label">DESCUENTO (${descuentoPorcentaje > 0 ? descuentoPorcentaje + '%' : 'Aplicado'}):</td>
                    <td style="color: #ff6b35;">-$${montoDescuento.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td class="label">ITBIS (18%):</td>
                    <td>$${itbis.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                  </tr>
                  <tr class="total-row">
                    <td class="label">TOTAL:</td>
                    <td>$${totalConItbis.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
              
              <div class="pagos-section">
                <div style="font-weight: bold; color: #1976d2; margin-bottom: 3px;">Métodos de Pago:</div>
                <div class="pagos-grid">
                  ${metodosPagoInfo.map(mp => `
                    <div class="pago-item">
                      <div class="pago-tipo">${mp.tipo}</div>
                      <div class="pago-monto">$${mp.monto.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</div>
                      ${mp.referencia ? `<div style="font-size: 6px; color: #666;">Ref: ${mp.referencia}</div>` : ''}
                    </div>
                  `).join('')}
                </div>
              </div>
              
              <div class="footer">
                <strong>¡Gracias por confiar en JHS AutoServicios!</strong>
                <div>Garantía de 90 días • info@jhsautoservicios.com</div>
                <div class="status-pago ${tipoFactura === 'Credito' ? 'status-credito' : 'status-completo'}">
                  ${tipoFactura === 'Credito' ?
          `⚠️ FACTURA A CRÉDITO` :
          `✅ PAGO COMPLETO`
        }
                </div>
              </div>
            </div>
            
            ${piezasUsadas.length > 8 ? `
            <div style="page-break-before: always;">
              <div class="contenido-principal">
                <div class="header">
                  <h1>JHS AutoServicios</h1>
                  <div class="subtitle">DETALLE DE PIEZAS</div>
                </div>
                
                <div class="factura-info">
                  <span class="factura-num">Factura #${(facturaToprint._id || '').slice(-8).toUpperCase()}</span>
                  <div class="fecha-info">
                    <div>Cliente: ${cliente.nombre || '—'}</div>
                  </div>
                </div>
                
                <table class="servicios-table">
                  <thead>
                    <tr>
                      <th style="width: 45%;">Pieza/Repuesto</th>
                      <th style="width: 15%;">Cant.</th>
                      <th style="width: 20%;">P. Unit.</th>
                      <th style="width: 20%;">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${piezasUsadas.map((p: any) => `
                      <tr>
                        <td>
                          <div style="font-weight: bold;">${p.id_pieza?.nombre_pieza || 'Pieza'}</div>
                          ${p.id_pieza?.serial ? `<div style="font-size: 7px; color: #666;">Serial: ${p.id_pieza.serial}</div>` : ''}
                        </td>
                        <td>${p.cantidad}</td>
                        <td>$${((p.precio_unitario || p.id_pieza?.costo_promedio || 0)).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                        <td>$${((p.precio_unitario || p.id_pieza?.costo_promedio || 0) * p.cantidad).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              
              <div class="seccion-pie">
                <table class="totales-table" style="margin: 0 auto;">
                  <tr style="background: #e3f2fd; font-weight: bold;">
                    <td class="label">TOTAL PIEZAS:</td>
                    <td>$${totalPiezas.toLocaleString('es-DO', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </table>
                
                <div class="footer">
                  <strong>Página 2 - Detalle de Piezas y Repuestos</strong>
                  <div>JHS AutoServicios • info@jhsautoservicios.com</div>
                </div>
              </div>
            </div>
            ` : ''}
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

      const w = window.open('', 'factura_print', 'width=600,height=700,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no');
      if (!w) {
        alert('Por favor permite las ventanas emergentes para imprimir la factura');
        return;
      }
      w.document.write(html);
      w.document.close();
      w.focus();
      w.onafterprint = () => w.close();
      w.print();

      setFacturaToPrint(null);
    } catch (error) {
      console.error('❌ Error al generar la factura:', error);
      alert('Error al generar la factura para impresión: ' + (error as Error).message);
      setFacturaToPrint(null);
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

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
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

  const facturasFiltradas = React.useMemo(() => {
    let filtered = facturas;

    if (tipoFilter) {
      filtered = filtered.filter(factura => factura.tipo_factura === tipoFilter);
    }

    if (searchTerm.trim()) {
      filtered = filtered.filter(factura => {
        const clienteInfo = getClienteVehiculoInfo(factura);
        return clienteInfo.cliente.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (fechaCreacion) {
      filtered = filtered.filter(factura => {
        const fechaFactura = factura.createdAt?.toString().slice(0, 10) || '';
        const fechaSeleccionada = fechaCreacion.format('YYYY-MM-DD');
        return fechaFactura === fechaSeleccionada;
      });
    }

    return filtered;
  }, [facturas, tipoFilter, searchTerm, fechaCreacion]); const tableData = facturasFiltradas.map(factura => {
    const clienteVehiculo = getClienteVehiculoInfo(factura);
    const fechaCreacion = factura.createdAt ? new Date(factura.createdAt).toLocaleDateString('es-ES') : '—';
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
              disabled={true}
              title="Editar (Deshabilitado - Las facturas no pueden modificarse)"
              sx={{
                background: 'linear-gradient(45deg, #9CA3AF, #D1D5DB)',
                color: 'white',
                opacity: 0.6,
                cursor: 'not-allowed',
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
              disabled={true}
              title="Eliminar (Deshabilitado - Las facturas no pueden eliminarse)"
              sx={{
                background: 'linear-gradient(45deg, #9CA3AF, #D1D5DB)',
                color: 'white',
                opacity: 0.6,
                cursor: 'not-allowed',
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
      fechaCreacion: new Date((factura as any).createdAt || new Date()).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }),
      originalData: factura
    };
  });

  const columns = [
    { id: 'clienteVehiculo', label: 'Cliente | Vehículo' },
    { id: 'fechaCreacion', label: 'Fecha Creación' },
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
          <LoadingSpinner
            variant="minimal"
            message="Inicializando aplicación..."
            size={40}
          />
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
          <LoadingSpinner
            variant="default"
            message="Cargando facturas del taller..."
            size={50}
          />
        ) : (
          <ModernTable
            title="Facturas del Taller"
            subtitle="Administra las facturas del taller y controla los pagos"
            data={tableData}
            columns={columns}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            onCreateNew={handleCreate}
            createButtonText="📋 Crear Nueva Factura"
            emptyMessage="No se encontraron facturas"
            searchPlaceholder="Buscar por nombre del cliente..."
            filterComponent={
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <DatePicker
                    label="📅 Fecha de creación"
                    value={fechaCreacion}
                    onChange={(newValue) => setFechaCreacion(newValue)}
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

        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: showPrintWarning ? 'flex' : 'none',
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
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{
              color: '#1976d2',
              marginBottom: '16px',
              fontSize: '1.5rem'
            }}>
              Importante - Impresión de Factura
            </h2>
            <p style={{
              color: '#666',
              marginBottom: '24px',
              fontSize: '1.1rem',
              lineHeight: 1.5
            }}>
              <strong>Recuerde cerrar la pestaña de impresión si no la utilizará.</strong>
              <br /><br />
              Dejar pestañas de impresión abiertas puede causar problemas de rendimiento en la aplicación.
            </p>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowPrintWarning(false);
                  setFacturaToPrint(null);
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
                onClick={proceedWithPrint}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1565c0'}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1976d2'}
              >
                🖨️ Continuar con Impresión
              </button>
            </Box>
          </Box>
        </Box>
      </div>
    </div>
  );
}