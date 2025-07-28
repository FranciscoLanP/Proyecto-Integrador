'use client';

import React, { useEffect, useState } from 'react';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FacturaModal from './FacturaModal';
import { facturaService, Factura } from '@/services/facturaService';

export default function FacturaPage() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<Factura | undefined>(undefined);

  const fetchFacturas = async () => {
    setLoading(true);
    try {
      const data = await facturaService.fetchAll();
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
      fetchFacturas();
    } catch {
      alert('Error al guardar');
    }
  };

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
                <TableCell>ID</TableCell>
                <TableCell>Reparación</TableCell>
                <TableCell>Fecha emisión</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Método de pago</TableCell>
                <TableCell>Detalles</TableCell>
                <TableCell>Emitida</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {facturas.map(fac => (
                <TableRow key={fac._id}>
                  <TableCell>{fac._id}</TableCell>
                  <TableCell>{fac.id_reparacion}</TableCell>
                  <TableCell>{fac.fecha_emision?.toString().slice(0, 10)}</TableCell>
                  <TableCell>{fac.total}</TableCell>
                  <TableCell>{fac.metodo_pago}</TableCell>
                  <TableCell>{fac.detalles}</TableCell>
                  <TableCell>{fac.emitida ? 'Sí' : 'No'}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(fac)} disabled={fac.emitida}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => handleDelete(fac._id!)} disabled={fac.emitida}><DeleteIcon /></IconButton>
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
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </Box>
  );
}