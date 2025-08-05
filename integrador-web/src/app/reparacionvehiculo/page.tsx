'use client';

import React, { useEffect, useState } from 'react';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ReparacionVehiculoModal from './ReparacionVehiculoModal';
import FacturaModal from '../factura/FacturaModal';
import { reparacionVehiculoService, ReparacionVehiculo } from '@/services/reparacionVehiculoService';
import { facturaService, Factura } from '@/services/facturaService';

export default function ReparacionVehiculoPage() {
  const [reparaciones, setReparaciones] = useState<ReparacionVehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<ReparacionVehiculo | undefined>(undefined);

  // Para factura
  const [facturaModalOpen, setFacturaModalOpen] = useState(false);
  const [facturaDefault, setFacturaDefault] = useState<Factura | undefined>(undefined);

  const fetchReparaciones = async () => {
    setLoading(true);
    try {
      const data = await reparacionVehiculoService.fetchAll();
      console.log('🔍 Reparaciones desde el backend:', data); // Debug
      if (data.length > 0) {
        console.log('🧩 Estructura de piezas_usadas:', data[0].piezas_usadas); // Debug
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
      setEditData(undefined); // 🔥 Resetear editData al guardar
      fetchReparaciones();
    } catch {
      alert('Error al guardar');
    }
  };

  // --- Factura ---
  const handleCrearFactura = (reparacion: ReparacionVehiculo) => {
    setFacturaDefault({
      id_reparacion: reparacion._id!,
      fecha_emision: new Date().toISOString().slice(0, 10),
      total: reparacion.costo_total ?? 0,
      metodo_pago: '',
      detalles: '',
      emitida: false
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

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Reparaciones de Vehículos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
          Nueva Reparación
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
                <TableCell>Cliente | Vehículo | Problema</TableCell>
                <TableCell>Empleado (Tipo)</TableCell>
                <TableCell>Fecha inicio</TableCell>
                <TableCell>Fecha fin</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Piezas usadas</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reparaciones.map(rep => (
                <TableRow key={rep._id}>
                  {/* <TableCell>{rep._id}</TableCell> */}
                  <TableCell>
                    {(() => {
                      const inspeccion = rep.id_inspeccion as any;
                      if (!inspeccion || typeof inspeccion === 'string') return rep.id_inspeccion;

                      const cliente = inspeccion.id_recibo?.id_recepcion?.id_vehiculo?.id_cliente;
                      const vehiculo = inspeccion.id_recibo?.id_recepcion?.id_vehiculo;
                      const recepcion = inspeccion.id_recibo?.id_recepcion;

                      const clienteInfo = cliente?.nombre || 'Cliente desconocido';
                      const vehiculoInfo = vehiculo
                        ? `${vehiculo.id_modelo?.id_marca?.nombre_marca || ''} ${vehiculo.id_modelo?.nombre_modelo || ''} ${vehiculo.anio || ''} (${vehiculo.id_color?.nombre_color || ''})`.trim()
                        : 'Vehículo desconocido';
                      const problemaInfo = recepcion?.problema_reportado || inspeccion.comentario || 'Sin comentario';

                      return `${clienteInfo} | ${vehiculoInfo} | ${problemaInfo}`;
                    })()}
                  </TableCell>
                  <TableCell>
                    {(rep.id_empleadoInformacion as any)?.nombre
                      ? `${(rep.id_empleadoInformacion as any).nombre} (${(rep.id_empleadoInformacion as any).tipo_empleado || 'N/A'})`
                      : rep.id_empleadoInformacion
                    }
                  </TableCell>
                  <TableCell>{rep.fecha_inicio?.toString().slice(0, 10)}</TableCell>
                  <TableCell>{rep.fecha_fin?.toString().slice(0, 10)}</TableCell>
                  <TableCell>{rep.descripcion}</TableCell>
                  <TableCell>
                    {(rep.piezas_usadas ?? []).map((p, idx) => (
                      <div key={idx}>
                        {(() => {
                          // Verificar si la pieza viene poblada desde el backend
                          const pieza = (p as any)?.id_pieza;
                          if (pieza && typeof pieza === 'object' && pieza.nombre_pieza) {
                            return `${pieza.nombre_pieza} (x${p.cantidad})`;
                          } else if (pieza && typeof pieza === 'string') {
                            // Si solo viene el ID, mostrar un mensaje más claro
                            return `Pieza ID: ${pieza} (x${p.cantidad})`;
                          } else {
                            return `Pieza desconocida (x${p.cantidad})`;
                          }
                        })()}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(rep)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(rep._id!)}><DeleteIcon /></IconButton>
                    <IconButton color="primary" onClick={() => handleCrearFactura(rep)} title="Crear factura">
                      <ReceiptIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {reparaciones.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">No hay reparaciones registradas.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <ReparacionVehiculoModal
        open={modalOpen}
        defaultData={editData}
        onClose={() => {
          setModalOpen(false);
          setEditData(undefined); // 🔥 Resetear editData al cerrar
        }}
        onSubmit={handleModalSubmit}
      />
      <FacturaModal
        open={facturaModalOpen}
        defaultData={facturaDefault}
        onClose={() => setFacturaModalOpen(false)}
        onSubmit={handleFacturaModalSubmit}
      />
    </Box>
  );
}