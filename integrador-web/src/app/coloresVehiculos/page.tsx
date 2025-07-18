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
import { useNotification } from '../../components/utils/NotificationProvider';
import type { IColoresDatos } from '../types';
import ColoresDatosModal from './ColoresModal';

export default function ColoresDatosPage(): JSX.Element {
  const { notify } = useNotification();

  const { allQuery, createM, updateM, deleteM } =
    useCrud<IColoresDatos>('coloresdatos');
  const { data: colores = [], isLoading, error } = allQuery;

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editData, setEditData] = useState<IColoresDatos | null>(null);
  const [confirmDel, setConfirmDel] = useState<boolean>(false);
  const [toDelete, setToDelete] = useState<IColoresDatos | null>(null);

  if (isLoading) return <Typography>Loading…</Typography>;
  if (error) return <Typography color="error">{error.message}</Typography>;

  const filtered = colores.filter(c =>
    c.nombre_color.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const openNew = (): void => {
    setEditData(null);
    setModalOpen(true);
  };
  const openEdit = (c: IColoresDatos): void => {
    setEditData(c);
    setModalOpen(true);
  };
  const closeModal = (): void => setModalOpen(false);

  const handleSubmit = (payload: { nombre_color: string }): void => {
    if (editData) {
      updateM.mutate(
        { id: editData._id, data: { nombre_color: payload.nombre_color } },
        {
          onSuccess: () => {
            notify('Color actualizado correctamente', 'success');
          },
          onError: () => {
            notify('Error al actualizar color', 'error');
          }
        }
      );
    } else {
      createM.mutate(
        { nombre_color: payload.nombre_color },
        {
          onSuccess: () => {
            notify('Color creado correctamente', 'success');
          },
          onError: () => {
            notify('Error al crear color', 'error');
          }
        }
      );
    }
    setModalOpen(false);
  };

  const askDelete = (c: IColoresDatos): void => {
    setToDelete(c);
    setConfirmDel(true);
  };
  const confirmDelete = (): void => {
    if (toDelete) {
      deleteM.mutate(
        toDelete._id,
        {
          onSuccess: () => {
            notify('Color eliminado correctamente', 'success');
          },
          onError: () => {
            notify('Error al eliminar color', 'error');
          }
        }
      );
    }
    setConfirmDel(false);
    setToDelete(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 500, mb: 0.5 }}>
        Colores de Datos
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" mb={2}>
        Administra los colores de datos de tu sistema
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          justifyContent: 'space-between',
          mb: 2
        }}
      >
        <TextField
          label="Buscar color"
          size="small"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ flex: '1 1 200px' }}
        />
        <Button
          variant="contained"
          size="medium"
          onClick={openNew}
          sx={{ ml: 'auto' }}
        >
          + Nuevo Color
        </Button>
      </Box>

      <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Colores del Sistema
          </Typography>
        </Box>

        <Table size="small" sx={{ minWidth: 360 }}>
          <TableHead sx={{ backgroundColor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontSize: '0.85rem' }}>#</TableCell>
              <TableCell sx={{ fontSize: '0.85rem' }}>Nombre Color</TableCell>
              <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((c, i) => {
              const idx = page * rowsPerPage + i + 1;
              return (
                <TableRow
                  key={c._id}
                  hover
                  sx={{ '&:hover': { backgroundColor: 'action.selected' } }}
                >
                  <TableCell sx={{ fontSize: '0.8rem', px: 1 }}>{idx}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', px: 1 }}>{c.nombre_color}</TableCell>
                  <TableCell align="right" sx={{ px: 1 }}>
                    <IconButton size="small" onClick={() => openEdit(c)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => askDelete(c)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
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
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 15, 25]}
          labelRowsPerPage="Ver"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          sx={{
            '& .MuiTablePagination-toolbar': { minHeight: 36, py: 0 },
            '& .MuiTablePagination-actions button': { padding: '4px' },
            '& .MuiTablePagination-selectLabel, .MuiTablePagination-input': {
              fontSize: '0.8rem'
            }
          }}
        />
      </Paper>

      <ColoresDatosModal
        open={modalOpen}
        defaultData={editData ?? undefined}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <Dialog open={confirmDel} onClose={() => setConfirmDel(false)}>
        <DialogTitle
          sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.9rem' }}
        >
          <WarningAmberIcon color="warning" />
          ¿Confirma eliminar este color?
        </DialogTitle>
        <DialogActions sx={{ p: 1 }}>
          <Button size="small" onClick={() => setConfirmDel(false)}>
            Cancelar
          </Button>
          <Button
            size="small"
            color="error"
            variant="contained"
            onClick={confirmDelete}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
