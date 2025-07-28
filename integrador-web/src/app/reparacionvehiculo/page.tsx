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
                <TableCell>ID</TableCell>
                <TableCell>Inspección</TableCell>
                <TableCell>Empleado</TableCell>
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
                  <TableCell>{rep._id}</TableCell>
                  <TableCell>{rep.id_inspeccion}</TableCell>
                  <TableCell>{rep.id_empleadoInformacion}</TableCell>
                  <TableCell>{rep.fecha_inicio?.toString().slice(0, 10)}</TableCell>
                  <TableCell>{rep.fecha_fin?.toString().slice(0, 10)}</TableCell>
                  <TableCell>{rep.descripcion}</TableCell>
                  <TableCell>
                    {(rep.piezas_usadas ?? []).map((p, idx) =>
                      <div key={idx}>{p.id_pieza} (x{p.cantidad})</div>
                    )}
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
        onClose={() => setModalOpen(false)}
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