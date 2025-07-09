'use client';

import React, { useState, ChangeEvent, JSX } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import TablePagination from '@mui/material/TablePagination';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCrud } from '../../hooks/useCrud';
import type { IModelosDatos, IMarcaVehiculo } from '../types';
import ModelosDatosModal from './ModelosDatosModal';

export default function ModelosDatosPage(): JSX.Element {
  const marcaCrud = useCrud<IMarcaVehiculo>('marcasvehiculos');
  const modelosCrud = useCrud<IModelosDatos>('modelosdatos');
  const { data: marcas = [], isLoading: loadingMarcas, error: errMarcas } = marcaCrud.allQuery;
  const { data: modelos = [], isLoading: loadingModelos, error: errModelos } = modelosCrud.allQuery;

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<IModelosDatos | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [toDelete, setToDelete] = useState<IModelosDatos | null>(null);

  if (loadingMarcas || loadingModelos) return <Typography>Loading…</Typography>;
  if (errMarcas) return <Typography color="error">{errMarcas.message}</Typography>;
  if (errModelos) return <Typography color="error">{errModelos.message}</Typography>;

  const filtered = modelos.filter(m =>
    m.nombre_modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    marcas.find(mk => mk._id === m.id_marca)?.nombre_marca.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => { setSearchTerm(e.target.value); setPage(0); };
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRows = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const openNew = () => { setEditData(null); setModalOpen(true); };
  const openEdit = (m: IModelosDatos) => { setEditData(m); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);
  const handleSubmit = (payload: Partial<IModelosDatos>) => {
    if (editData) modelosCrud.updateM.mutate({ id: editData._id, data: payload });
    else modelosCrud.createM.mutate(payload);
    setModalOpen(false);
  };

  const askDelete = (m: IModelosDatos) => { setToDelete(m); setConfirmDel(true); };
  const confirmDelete = () => {
    if (toDelete) modelosCrud.deleteM.mutate(toDelete._id);
    setConfirmDel(false);
    setToDelete(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Modelos de Vehículo</Typography>

      <Box display="flex" gap={1} flexWrap="wrap" justifyContent="space-between" mb={2}>
        <TextField
          label="Buscar modelo o marca"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ flex: '1 1 200px' }}
        />
        <Button variant="contained" onClick={openNew}>+ Nuevo Modelo</Button>
      </Box>

      <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: 'action.hover' }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Modelo</TableCell>
              <TableCell>Marca</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((m, i) => {
              const idx = page * rowsPerPage + i + 1;
              const marca = marcas.find(mk => mk._id === m.id_marca)?.nombre_marca ?? '—';
              return (
                <TableRow key={m._id} hover sx={{ '&:hover': { backgroundColor: 'action.selected' } }}>
                  <TableCell>{idx}</TableCell>
                  <TableCell>{m.nombre_modelo}</TableCell>
                  <TableCell>{marca}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(m)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => askDelete(m)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRows}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Ver"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          sx={{ '& .MuiTablePagination-toolbar': { py: 0, minHeight: 36 } }}
        />
      </Paper>

      <ModelosDatosModal
        open={modalOpen}
        defaultData={editData ?? undefined}
        marcas={marcas}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <Dialog open={confirmDel} onClose={() => setConfirmDel(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="warning" /> ¿Eliminar este modelo?
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmDel(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
