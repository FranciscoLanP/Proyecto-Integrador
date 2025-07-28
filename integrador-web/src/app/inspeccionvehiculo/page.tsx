'use client';

import React, { useEffect, useState } from 'react';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import BuildIcon from '@mui/icons-material/Build';
import PrintIcon from '@mui/icons-material/Print';
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

  const [cotizacionOpen, setCotizacionOpen] = useState(false);
  const [cotizacionData, setCotizacionData] = useState<{
    inspeccion: any,
    cliente: any,
    empleado: any
  } | null>(null);

  const [recibos, setRecibos] = useState<any[]>([]);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [recepciones, setRecepciones] = useState<any[]>([]);
  const [vehiculos, setVehiculos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [printHtml, setPrintHtml] = useState<string | null>(null);

  const fetchInspecciones = async () => {
    setLoading(true);
    try {
      const [inspeccionesData, recibosData, empleadosData, recepcionesData, vehiculosData, clientesData] = await Promise.all([
        inspeccionVehiculoService.fetchAll(),
        fetch('http://localhost:3001/api/recibosvehiculos').then(res => res.json()),
        fetch('http://localhost:3001/api/empleadoinformaciones').then(res => res.json()),
        fetch('http://localhost:3001/api/recepcionvehiculos').then(res => res.json()),
        fetch('http://localhost:3001/api/vehiculodatos').then(res => res.json()),
        fetch('http://localhost:3001/api/clientes').then(res => res.json())
      ]);

      setInspecciones(inspeccionesData);
      setRecibos(recibosData);
      setEmpleados(empleadosData);
      setRecepciones(recepcionesData);
      setVehiculos(vehiculosData);
      setClientes(clientesData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      alert('Error al cargar inspecciones');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInspecciones();
  }, []);

  const getClienteNombre = (reciboId: string) => {
    // Encontrar el recibo
    const recibo = recibos.find(r => r._id === reciboId);
    if (!recibo) return 'Recibo no encontrado';

    // Encontrar la recepción del recibo
    const recepcion = recepciones.find(rec => {
      const rid = typeof recibo.id_recepcion === 'string' ? recibo.id_recepcion : recibo.id_recepcion._id;
      return rid === rec._id;
    });
    if (!recepcion) return 'Recepción no encontrada';

    // Encontrar el vehículo de la recepción
    const vehiculo = vehiculos.find(veh => {
      const vid = typeof recepcion.id_vehiculo === 'string' ? recepcion.id_vehiculo : recepcion.id_vehiculo._id;
      return vid === veh._id;
    });
    if (!vehiculo) return 'Vehículo no encontrado';

    // Encontrar el cliente del vehículo
    const cliente = clientes.find(cli => {
      const cid = typeof vehiculo.id_cliente === 'string' ? vehiculo.id_cliente : vehiculo.id_cliente._id;
      return cid === cli._id;
    });

    return cliente?.nombre || 'Cliente no encontrado';
  };

  const getEmpleadoNombre = (empleadoId: string) => {
    const empleado = empleados.find(e => e._id === empleadoId);
    return empleado?.nombre || 'Empleado no encontrado';
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
    // Busca el cliente
    const reciboId = inspeccion.id_recibo;
    const recibo = recibos.find(r => r._id === reciboId);
    if (!recibo) return alert('Recibo no encontrado');

    const recepcionId = typeof recibo.id_recepcion === 'string' ? recibo.id_recepcion : recibo.id_recepcion._id;
    const recepcion = recepciones.find(r => r._id === recepcionId);
    if (!recepcion) return alert('Recepción no encontrada');

    const vehiculoId = typeof recepcion.id_vehiculo === 'string' ? recepcion.id_vehiculo : recepcion.id_vehiculo._id;
    const vehiculo = vehiculos.find(v => v._id === vehiculoId);
    if (!vehiculo) return alert('Vehículo no encontrado');

    const clienteId = typeof vehiculo.id_cliente === 'string' ? vehiculo.id_cliente : vehiculo.id_cliente._id;
    const cliente = clientes.find(c => c._id === clienteId);
    if (!cliente) return alert('Cliente no encontrado');

    const empleado = empleados.find(e => e._id === inspeccion.id_empleadoInformacion);

    const now = new Date().toLocaleString();

    // Calcular totales
    const piezas = inspeccion.piezas_sugeridas ?? [];
    const total = piezas.reduce((acc, p) => acc + (p.precio_unitario ?? 0) * p.cantidad, 0);
    const subtotal = total / 1.18;
    const itbis = total - subtotal;
    const descuento = 0; // Si tienes lógica de descuento, cámbiala aquí

    // SOLO el contenido del body y el style
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
        <Typography variant="h5">Inspecciones de Vehículos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Nueva Inspección
        </Button>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {/* Quitar columna ID */}
                <TableCell>Cliente</TableCell>
                <TableCell>Empleado</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Comentario</TableCell>
                <TableCell>Resultado</TableCell>
                <TableCell>Piezas sugeridas</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inspecciones.map(ins => (
                <TableRow key={ins._id}>
                  {/* Quitar celda ID */}
                  <TableCell>{getClienteNombre(ins.id_recibo)}</TableCell>
                  <TableCell>{getEmpleadoNombre(ins.id_empleadoInformacion)}</TableCell>
                  <TableCell>{ins.fecha_inspeccion?.toString().slice(0, 10)}</TableCell>
                  <TableCell>{ins.comentario}</TableCell>
                  <TableCell>{ins.resultado}</TableCell>
                  <TableCell>
                    {(ins.piezas_sugeridas ?? []).map((p, idx) =>
                      <div key={idx}>{p.nombre_pieza} (x{p.cantidad})</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(ins)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(ins._id!)}><DeleteIcon /></IconButton>
                    <IconButton color="primary" onClick={() => handleCrearReparacion(ins)} title="Crear reparación">
                      <BuildIcon />
                    </IconButton>
                    <IconButton color="secondary" onClick={() => handlePrint(ins)} title="Imprimir cotización">
                      <PrintIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {inspecciones.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">No hay inspecciones registradas.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
    </Box>
  );
}