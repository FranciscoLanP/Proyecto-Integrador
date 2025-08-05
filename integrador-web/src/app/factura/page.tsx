'use client';

import React, { useEffect, useState } from 'react';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import FacturaModal from './FacturaModal';
import { facturaService, Factura } from '@/services/facturaService';

export default function FacturaPage() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Factura | undefined>(undefined);
  const [printHtml, setPrintHtml] = useState<string | null>(null);

  const fetchFacturas = async () => {
    setLoading(true);
    try {
      const data = await facturaService.fetchAll();
      console.log('💰 Facturas desde el backend:', data); 
      setFacturas(data);
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
      const reparacion = (factura as any).id_reparacion;

      if (!reparacion || typeof reparacion === 'string') {
        return alert('Datos de la reparación no disponibles para la impresión');
      }

      const inspeccion = reparacion.id_inspeccion;
      if (!inspeccion || typeof inspeccion === 'string') {
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

      // Piezas usadas en la reparación
      const piezasUsadas = reparacion.piezas_usadas || [];

      // Calcular totales correctamente
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

      // Información del vehículo
      const vehiculoInfo = vehiculo
        ? `${vehiculo.id_modelo?.id_marca?.nombre_marca || ''} ${vehiculo.id_modelo?.nombre_modelo || ''} ${vehiculo.anio || ''} (${vehiculo.id_color?.nombre_color || ''})`.trim()
        : 'Vehículo no especificado';

      // Información completa del empleado
      const empleadoInfo = empleadoReparacion
        ? `${empleadoReparacion.nombre || ''} ${empleadoReparacion.apellido || ''}`.trim()
        : empleadoReparacion?.nombre || '—';

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
          .section-title { font-weight:bold; margin-top:24px; color:#1976d2; }
          .info-table td { border:none; padding:2px 8px; }
          .totals-table { width: 350px; float: right; margin-top: 24px; }
          .totals-table td { border: none; text-align: right; font-size: 1.05em; }
          .totals-table .label { color: #1976d2; font-weight: bold; }
          .totals-table .total-row td { font-weight: bold; font-size: 1.2em; background:#e3f2fd; }
          .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; color: white; font-size: 0.9em; font-weight: bold; }
          .status-emitida { background-color: #4caf50; }
          .status-pendiente { background-color: #ff9800; }
        </style>
        <div class="container">
          <header>
            <div>
              <div class="brand">JHS AutoServicios</div>
              <div class="subtitle">FACTURA</div>
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
          <hr />
          
          <div class="footer">
            <strong>¡Gracias por confiar en JHS AutoServicios!</strong><br>
            * Esta factura es válida como comprobante de pago.<br>
            * Garantizamos nuestros servicios por 90 días.<br>
            Para consultas: info@jhsautoservicios.com
          </div>
        </div>
      `;

      setPrintHtml(html);
    } catch (error) {
      console.error('Error al generar la factura:', error);
      alert('Error al generar la factura para impresión');
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

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Facturas</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Nueva Factura
        </Button>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {/* <TableCell>ID</TableCell> */}
                <TableCell>Cliente | Vehículo</TableCell>
                <TableCell>Fecha emisión</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Descuento (%)</TableCell>
                <TableCell>Método de pago</TableCell>
                <TableCell>Detalles</TableCell>
                <TableCell>Emitida</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {facturas.map(fac => (
                <TableRow key={fac._id}>
                  {/* <TableCell>{fac._id}</TableCell> */}
                  <TableCell>
                    {(() => {
                      try {
                        const reparacion = (fac as any).id_reparacion;
                        if (reparacion && typeof reparacion === 'object') {
                          const inspeccion = reparacion.id_inspeccion;
                          if (inspeccion && typeof inspeccion === 'object') {
                            const cliente = inspeccion.id_recibo?.id_recepcion?.id_vehiculo?.id_cliente;
                            const vehiculo = inspeccion.id_recibo?.id_recepcion?.id_vehiculo;

                            if (cliente && vehiculo) {
                              const clienteNombre = cliente.nombre || 'Cliente';
                              const vehiculoInfo = vehiculo.id_modelo?.nombre_modelo || 'Vehículo';
                              return `${clienteNombre} | ${vehiculoInfo}`;
                            }
                          }
                        }
                        return `Reparación ${fac.id_reparacion}`;
                      } catch (error) {
                        return `Reparación ${fac.id_reparacion}`;
                      }
                    })()}
                  </TableCell>
                  <TableCell>{fac.fecha_emision?.toString().slice(0, 10)}</TableCell>
                  <TableCell>{fac.total}</TableCell>
                  <TableCell>{fac.descuento_porcentaje || 0}%</TableCell>
                  <TableCell>{fac.metodo_pago}</TableCell>
                  <TableCell>{fac.detalles}</TableCell>
                  <TableCell>{fac.emitida ? 'Sí' : 'No'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(fac)} disabled={fac.emitida}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(fac._id!)} disabled={fac.emitida}><DeleteIcon /></IconButton>
                    <IconButton color="primary" onClick={() => handlePrint(fac)} title="Imprimir factura">
                      <PrintIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {facturas.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">No hay facturas registradas.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <FacturaModal
        open={modalOpen}
        defaultData={editData}
        onClose={() => {
          setModalOpen(false);
          setEditData(undefined); // Resetear editData al cerrar
        }}
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
    </Box>
  );
}