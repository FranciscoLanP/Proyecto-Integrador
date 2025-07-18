
'use client';

import React, { useState, ChangeEvent, JSX } from 'react';
import {
  Box, Typography, Paper, Table, TableHead, TableRow,
  TableCell, TableBody, IconButton, Button, TextField,
  TablePagination, Dialog, DialogTitle, DialogActions
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { useCrud } from '../../hooks/useCrud';
import { useNotification } from '../../components/utils/NotificationProvider';
import type {
  IRecepcionVehiculo,
  ICliente,
  IEmpleadoInformacion,
  IVehiculoDatos
} from '../types';
import RecepcionVehiculoModal from './RecepcionVehiculoModal';

export default function RecepcionVehiculosPage(): JSX.Element {
  const { notify } = useNotification();

  const recepCrud = useCrud<IRecepcionVehiculo>('recepcionvehiculos');
  const cliCrud = useCrud<ICliente>('clientes');
  const empCrud = useCrud<IEmpleadoInformacion>('empleadoinformaciones');
  const vehCrud = useCrud<IVehiculoDatos>('vehiculodatos');

  const { data: recepciones = [], isLoading: loadRec, error: errRec } = recepCrud.allQuery;
  const { data: clientes = [], isLoading: loadCli, error: errCli } = cliCrud.allQuery;
  const { data: empleados = [], isLoading: loadEmp, error: errEmp } = empCrud.allQuery;
  const { data: vehiculos = [], isLoading: loadVeh, error: errVeh } = vehCrud.allQuery;

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<IRecepcionVehiculo | null>(null);

  const [confirmDel, setConfirmDel] = useState(false);
  const [toDelete, setToDelete] = useState<IRecepcionVehiculo | null>(null);

  if (loadRec || loadCli || loadEmp || loadVeh) return <Typography>Loading…</Typography>;
  if (errRec) return <Typography color="error">{errRec.message}</Typography>;
  if (errCli) return <Typography color="error">{errCli.message}</Typography>;
  if (errEmp) return <Typography color="error">{errEmp.message}</Typography>;
  if (errVeh) return <Typography color="error">{errVeh.message}</Typography>;

  const term = searchTerm.toLowerCase();
  const filtered = recepciones.filter(r => {
    const fecha = new Date(r.fecha).toLocaleString().toLowerCase();
    const empleado = empleados.find(e => {
      const eid = typeof r.id_empleadoInformacion === 'string'
        ? r.id_empleadoInformacion
        : r.id_empleadoInformacion._id;
      return eid === e._id;
    })?.nombre.toLowerCase() ?? '';
    const veh = vehiculos.find(v => {
      const vid = typeof r.id_vehiculo === 'string'
        ? r.id_vehiculo
        : r.id_vehiculo._id;
      return vid === v._id;
    })?.chasis.toLowerCase() ?? '';
    const prob = (r.problema_reportado ?? '').toLowerCase();
    return fecha.includes(term) || empleado.includes(term) || veh.includes(term) || prob.includes(term);
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => { setSearchTerm(e.target.value); setPage(0); };
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRows = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const openNew = () => { setEditData(null); setModalOpen(true); };
  const openEdit = (row: IRecepcionVehiculo) => { setEditData(row); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (payload: Partial<IRecepcionVehiculo>) => {
    try {
      if (editData) {
        await recepCrud.updateM.mutateAsync({ id: editData._id, data: payload });
        notify('Recepción actualizada correctamente', 'success');
      } else {
        await recepCrud.createM.mutateAsync(payload);
        notify('Recepción creada correctamente', 'success');
      }
      await recepCrud.allQuery.refetch();
    } catch {
      notify('Error al guardar recepción', 'error');
    } finally {
      setModalOpen(false);
    }
  };

  const askDelete = (row: IRecepcionVehiculo) => { setToDelete(row); setConfirmDel(true); };
  const confirmDelete = () => {
    if (toDelete) {
      recepCrud.deleteM.mutate(
        toDelete._id,
        {
          onSuccess: () => notify('Recepción eliminada correctamente', 'success'),
          onError: () => notify('Error al eliminar recepción', 'error'),
        }
      );
    }
    setConfirmDel(false);
    setToDelete(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Recepción de Vehículos
      </Typography>

      <Box display="flex" gap={1} mb={2} alignItems="center">
        <TextField
          label="Buscar fecha, empleado, chasis o problema"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ flex: '1 1 300px' }}
        />
        <Button variant="contained" onClick={openNew}>
          + Nueva Recepción
        </Button>
      </Box>

      <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: 'action.hover' }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Empleado</TableCell>
              <TableCell>Chasis</TableCell>
              <TableCell>Problema</TableCell>
              <TableCell>Comentario</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((r, i) => {
              const idx = page * rowsPerPage + i + 1;
              const fecha = new Date(r.fecha).toLocaleString();
              const empleado = empleados.find(e => {
                const eid = typeof r.id_empleadoInformacion === 'string'
                  ? r.id_empleadoInformacion
                  : r.id_empleadoInformacion._id;
                return eid === e._id;
              })?.nombre ?? '—';
              const chasis = vehiculos.find(v => {
                const vid = typeof r.id_vehiculo === 'string'
                  ? r.id_vehiculo
                  : r.id_vehiculo._id;
                return vid === v._id;
              })?.chasis ?? '—';

              return (
                <TableRow key={r._id} hover>
                  <TableCell>{idx}</TableCell>
                  <TableCell>{fecha}</TableCell>
                  <TableCell>{empleado}</TableCell>
                  <TableCell>{chasis}</TableCell>
                  <TableCell>{r.problema_reportado ?? '—'}</TableCell>
                  <TableCell>{r.comentario ?? '—'}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(r)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => askDelete(r)}>
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
          onRowsPerPageChange={handleChangeRows}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Ver"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      <RecepcionVehiculoModal
        open={modalOpen}
        defaultData={editData ?? undefined}
        clientes={clientes}
        empleados={empleados}
        vehiculos={vehiculos}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <Dialog open={confirmDel} onClose={() => setConfirmDel(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="warning" /> ¿Eliminar esta recepción?
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
