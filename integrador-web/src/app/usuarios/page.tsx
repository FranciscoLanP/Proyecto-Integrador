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
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { useCrud } from '../../hooks/useCrud';
import { useNotification } from '../../components/utils/NotificationProvider';
import type { IUsuario } from '../types';
import UsuarioModal from './UsuarioModal';

export default function UsuariosPage(): JSX.Element {
  const { notify } = useNotification();

  const { allQuery, createM, updateM, deleteM } = useCrud<IUsuario>('usuarios');
  const usuarios = allQuery.data || [];

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  const [openForm, setOpenForm] = useState<boolean>(false);
  const [editData, setEditData] = useState<IUsuario | null>(null);
  const [confirmDel, setConfirmDel] = useState<boolean>(false);
  const [toDelete, setToDelete] = useState<IUsuario | null>(null);

  if (allQuery.isLoading) return <Typography>Loading…</Typography>;
  if (allQuery.error) return <Typography color="error">{allQuery.error.message}</Typography>;

  const filtered = usuarios.filter(u =>
    (u.username ?? '').toLowerCase().includes(searchTerm.toLowerCase())
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
  const handleChangeRows = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const openNew = () => { setEditData(null); setOpenForm(true); };
  const openEdit = (u: IUsuario) => { setEditData(u); setOpenForm(true); };
  const closeForm = () => setOpenForm(false);

  const onSubmit = (data: Partial<IUsuario> & { password?: string }) => {
    if (editData) {
      updateM.mutate(
        { id: editData._id, data },
        {
          onSuccess: () => notify('Usuario actualizado correctamente', 'success'),
          onError: () => notify('Error al actualizar usuario', 'error'),
        }
      );
    } else {
      createM.mutate(
        data as any,
        {
          onSuccess: () => notify('Usuario creado correctamente', 'success'),
          onError: () => notify('Error al crear usuario', 'error'),
        }
      );
    }
    closeForm();
  };

  const askDelete = (u: IUsuario) => {
    setToDelete(u);
    setConfirmDel(true);
  };
  const confirmDelete = () => {
    if (toDelete) {
      deleteM.mutate(
        toDelete._id,
        {
          onSuccess: () => notify('Usuario eliminado correctamente', 'success'),
          onError: () => notify('Error al eliminar usuario', 'error'),
        }
      );
    }
    setConfirmDel(false);
    setToDelete(null);
  };

  const toggleActivo = (u: IUsuario) => {
    updateM.mutate(
      { id: u._id, data: { activo: !u.activo } },
      {
        onSuccess: () =>
          notify(
            `Usuario ${u.activo ? 'desactivado' : 'activado'} correctamente`,
            'success'
          ),
        onError: () => notify('Error al cambiar estado del usuario', 'error'),
      }
    );
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Gestión de Usuarios
      </Typography>

      <Box display="flex" gap={1} flexWrap="wrap" justifyContent="space-between" mb={2}>
        <TextField
          label="Buscar usuario"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ flex: '1 1 200px' }}
        />
        <Button variant="contained" onClick={openNew}>
          + Nuevo Usuario
        </Button>
      </Box>

      <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: 'action.hover' }}>
            <TableRow>
              <TableCell>Usuario</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell align="right">Activo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map(u => (
              <TableRow
                key={u._id}
                hover
                sx={{ '&:hover': { backgroundColor: 'action.selected' } }}
              >
                <TableCell>{u.username}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    color={u.activo ? 'success' : 'warning'}
                    onClick={() => toggleActivo(u)}
                  >
                    {u.activo
                      ? <VisibilityIcon fontSize="small" />
                      : <VisibilityOffIcon fontSize="small" />}
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
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRows}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Ver"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          sx={{
            '& .MuiTablePagination-toolbar': { py: 0, minHeight: 36 }
          }}
        />
      </Paper>

      <UsuarioModal
        open={openForm}
        defaultData={editData ?? undefined}
        onClose={closeForm}
        onSubmit={onSubmit}
      />

      <Dialog open={confirmDel} onClose={() => setConfirmDel(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="warning" fontSize="small" />
          ¿Confirma eliminar este usuario?
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmDel(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
