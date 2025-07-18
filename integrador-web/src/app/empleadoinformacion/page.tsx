'use client';

import React, { useState, ChangeEvent, JSX } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, IconButton, Button, TextField,
  TablePagination, Dialog
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useCrud } from '../../hooks/useCrud';
import { useNotification } from '../../components/utils/NotificationProvider';
import type {
  IEmpleadoInformacion,
  ITipoEmpleado
} from '../types';
import EmpleadoInformacionModal from './EmpleadoInformacionModal';

export default function EmpleadoInformacionPage(): JSX.Element {
  const { notify } = useNotification();
  const empleadoCrud = useCrud<IEmpleadoInformacion>('empleadoinformaciones');
  const tipoCrud = useCrud<ITipoEmpleado>('tiposempleados');

  const { data: empleados = [], isLoading: loadingEmp, error: errEmp } = empleadoCrud.allQuery;
  const { data: tipos = [], isLoading: loadingTipo, error: errTipo } = tipoCrud.allQuery;

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<IEmpleadoInformacion | null>(null);

  if (loadingEmp || loadingTipo) return <Typography>Loading…</Typography>;
  if (errEmp) return <Typography color="error">{errEmp.message}</Typography>;
  if (errTipo) return <Typography color="error">{errTipo.message}</Typography>;

  const term = searchTerm.toLowerCase();
  const filtered = empleados.filter(e => {
    const nom = (e.nombre ?? '').toLowerCase().includes(term);
    const tipo = tipos
      .find(t => {
        const tid = typeof e.id_tipo_empleado === 'string'
          ? e.id_tipo_empleado
          : e.id_tipo_empleado._id;
        return tid === t._id;
      })
      ?.nombre_tipo_empleado.toLowerCase().includes(term) ?? false;
    return nom || tipo;
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => { setSearchTerm(e.target.value); setPage(0); };
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRows = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const openNew = () => { setEditData(null); setModalOpen(true); };
  const openEdit = (row: IEmpleadoInformacion) => { setEditData(row); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  // ← Mutations con notificaciones
  const handleSubmit = (payload: Partial<IEmpleadoInformacion>) => {
    if (editData) {
      empleadoCrud.updateM.mutate(
        { id: editData._id, data: payload },
        {
          onSuccess: () => notify('Empleado actualizado correctamente', 'success'),
          onError: () => notify('Error al actualizar empleado', 'error'),
        }
      );
    } else {
      empleadoCrud.createM.mutate(
        payload,
        {
          onSuccess: () => notify('Empleado creado correctamente', 'success'),
          onError: () => notify('Error al crear empleado', 'error'),
        }
      );
    }
    setModalOpen(false);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Gestión de Empleados
      </Typography>

      <Box display="flex" gap={1} flexWrap="wrap" justifyContent="space-between" mb={2}>
        <TextField
          label="Buscar nombre o tipo"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ flex: '1 1 200px' }}
        />
        <Button variant="contained" onClick={openNew}>
          + Nuevo Empleado
        </Button>
      </Box>

      <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: 'action.hover' }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Correo</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((e, i) => {
              const idx = page * rowsPerPage + i + 1;
              const tipoNombre = tipos
                .find(t => {
                  const tid = typeof e.id_tipo_empleado === 'string'
                    ? e.id_tipo_empleado
                    : e.id_tipo_empleado._id;
                  return tid === t._id;
                })
                ?.nombre_tipo_empleado ?? '—';
              return (
                <TableRow
                  key={e._id}
                  hover
                  sx={{ '&:hover': { backgroundColor: 'action.selected' } }}
                >
                  <TableCell>{idx}</TableCell>
                  <TableCell>{e.nombre}</TableCell>
                  <TableCell>{tipoNombre}</TableCell>
                  <TableCell>{e.telefono}</TableCell>
                  <TableCell>{e.correo}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => openEdit(e)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    {/* — Botón de eliminar eliminado */}
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

      <EmpleadoInformacionModal
        open={modalOpen}
        defaultData={editData ?? undefined}
        tipos={tipos}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      {/* — Diálogo de eliminación eliminado */}
    </Box>
  );
}
