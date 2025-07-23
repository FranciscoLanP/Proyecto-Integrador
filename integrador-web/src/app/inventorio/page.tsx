'use client';

import React, { useState, ChangeEvent, JSX } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  TextField,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCrud } from '@/hooks/useCrud';
import { useNotification } from '@/components/utils/NotificationProvider';
import type { IPiezaInventario } from '@/app/types';
import RegistroCompraModal from './RegistroCompraModal';

export default function PiezasPage(): JSX.Element {
  const { notify } = useNotification();
  const { allQuery, createM, updateM, deleteM } =
    useCrud<IPiezaInventario>('piezasinventario');
  const { data: piezas = [], isLoading, error, refetch } = allQuery;

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<IPiezaInventario | undefined>(undefined);
  const [confirmDel, setConfirmDel] = useState(false);
  const [toDelete, setToDelete] = useState<IPiezaInventario | null>(null);

  if (isLoading) return <Typography>Loading…</Typography>;
  if (error) return <Typography color="error">{error.message}</Typography>;

  const filtered = piezas.filter(p =>
    p.nombre_pieza.toLowerCase().includes(search.toLowerCase())
  );
  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const openNew = () => {
    setEditData(undefined);
    setModalOpen(true);
  };
  const openEdit = (p: IPiezaInventario) => {
    setEditData(p);
    setModalOpen(true);
  };
  const closeModal = () => setModalOpen(false);

  const handleSaved = () => {
    refetch();
  };

  const askDelete = (p: IPiezaInventario) => {
    setToDelete(p);
    setConfirmDel(true);
  };
  const confirmDelete = () => {
    if (toDelete) {
      deleteM.mutate(toDelete._id, {
        onSuccess: () => {
          notify('Pieza eliminada correctamente', 'success');
          refetch();
        },
        onError: () => notify('Error al eliminar pieza', 'error')
      });
    }
    setConfirmDel(false);
    setToDelete(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={1}>
        Gestión de Piezas
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          label="Buscar pieza"
          size="small"
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          sx={{ flex: 1 }}
        />
        <Button variant="contained" onClick={openNew}>
          + Nueva Pieza
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: 'action.hover' }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Serial</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Costo Prom.</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((p, i) => (
              <TableRow key={p._id} hover>
                <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                <TableCell>{p.nombre_pieza}</TableCell>
                <TableCell>{p.serial}</TableCell>
                <TableCell>{p.cantidad_disponible}</TableCell>
                <TableCell>{p.costo_promedio.toFixed(2)}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(p)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => askDelete(p)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, v) => setPage(v)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={e => {
            setRowsPerPage(+e.target.value);
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      <RegistroCompraModal
        piezaToEdit={editData}
        open={modalOpen}
        onClose={closeModal}
        onSaved={handleSaved}
      />

      <Dialog open={confirmDel} onClose={() => setConfirmDel(false)}>
        <DialogTitle>¿Eliminar esta pieza?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmDel(false)}>Cancelar</Button>
          <Button color="error" onClick={confirmDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
