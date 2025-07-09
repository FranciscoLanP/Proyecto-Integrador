'use client';

import React, { useState, ChangeEvent, JSX } from 'react';
import {
  Box, Typography, Paper, Table, TableHead,
  TableRow, TableCell, TableBody, IconButton,
  Button, TextField, TablePagination,
  Dialog, DialogTitle, DialogActions
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useCrud } from '../../hooks/useCrud';
import type {
  IReciboVehiculo,
  IRecepcionVehiculo,
  IEmpleadoInformacion,
  ICliente
} from '../types';
import type { IVehiculoDatos } from '../types';
import ReciboVehiculoModal from './ReciboVehiculoModal';

export default function RecibosVehiculosPage(): JSX.Element {
  const reciboCrud = useCrud<IReciboVehiculo>('recibosvehiculos');
  const recepCrud = useCrud<IRecepcionVehiculo>('recepcionvehiculos');
  const empCrud = useCrud<IEmpleadoInformacion>('empleadoinformaciones');
  const vehCrud = useCrud<IVehiculoDatos>('vehiculodatos');
  const cliCrud = useCrud<ICliente>('clientes');

  const { data: recibos = [], isLoading: loadRec, error: errRec } = reciboCrud.allQuery;
  const { data: recepciones = [], isLoading: loadRep, error: errRep } = recepCrud.allQuery;
  const { data: empleados = [], isLoading: loadEmp, error: errEmp } = empCrud.allQuery;
  const { data: vehiculos = [], isLoading: loadVeh, error: errVeh } = vehCrud.allQuery;
  const { data: clientes = [], isLoading: loadCli, error: errCli } = cliCrud.allQuery;

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState<IReciboVehiculo | null>(null);

  const [confirmDel, setConfirmDel] = useState(false);
  const [toDelete, setToDelete] = useState<IReciboVehiculo | null>(null);

  if (loadRec || loadRep || loadEmp || loadVeh || loadCli) return <Typography>Loading…</Typography>;
  if (errRec) return <Typography color="error">{errRec.message}</Typography>;
  if (errRep) return <Typography color="error">{errRep.message}</Typography>;
  if (errEmp) return <Typography color="error">{errEmp.message}</Typography>;
  if (errVeh) return <Typography color="error">{errVeh.message}</Typography>;
  if (errCli) return <Typography color="error">{errCli.message}</Typography>;

  // Filtrado por cliente, chasis u observaciones
  const term = searchTerm.toLowerCase();
  const filtered = recibos.filter(r => {
    const rec = recepciones.find(rep => {
      const rid = typeof r.id_recepcion === 'string'
        ? r.id_recepcion
        : r.id_recepcion._id;
      return rid === rep._id;
    });
    if (!rec) return false;
    const veh = vehiculos.find(v => {
      const vid = typeof rec.id_vehiculo === 'string'
        ? rec.id_vehiculo
        : rec.id_vehiculo._id;
      return vid === v._id;
    });
    const cli = veh
      ? clientes.find(c => {
        const cid = typeof veh.id_cliente === 'string'
          ? veh.id_cliente
          : veh.id_cliente._id;
        return cid === c._id;
      })
      : null;
    return (
      (cli?.nombre.toLowerCase() ?? '').includes(term) ||
      (veh?.chasis.toLowerCase() ?? '').includes(term) ||
      (r.observaciones ?? '').toLowerCase().includes(term)
    );
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => { setSearchTerm(e.target.value); setPage(0); };
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRows = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const openNew = () => { setEditData(null); setModalOpen(true); };
  const openEdit = (row: IReciboVehiculo) => { setEditData(row); setModalOpen(true); };
  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (payload: Partial<IReciboVehiculo>) => {
    if (editData) await reciboCrud.updateM.mutateAsync({ id: editData._id, data: payload });
    else await reciboCrud.createM.mutateAsync(payload);
    await reciboCrud.allQuery.refetch();
    setModalOpen(false);
  };

  const askDelete = (row: IReciboVehiculo) => { setToDelete(row); setConfirmDel(true); };
  const confirmDelete = () => {
    if (toDelete) reciboCrud.deleteM.mutate(toDelete._id);
    setConfirmDel(false);
    setToDelete(null);
  };

  // Template de impresión con hora actual
  const handlePrint = (r: IReciboVehiculo) => {
    const rec = recepciones.find(rep => {
      const rid = typeof r.id_recepcion === 'string'
        ? r.id_recepcion
        : r.id_recepcion._id;
      return rid === rep._id;
    });
    if (!rec) return alert('Recepción no encontrada');

    const veh = vehiculos.find(v => {
      const vid = typeof rec.id_vehiculo === 'string'
        ? rec.id_vehiculo
        : rec.id_vehiculo._id;
      return vid === v._id;
    });
    const cli = veh
      ? clientes.find(c => {
        const cid = typeof veh.id_cliente === 'string'
          ? veh.id_cliente
          : veh.id_cliente._id;
        return cid === c._id;
      })
      : null;
    const empleado = empleados.find(e => {
      const eid = typeof rec.id_empleadoInformacion === 'string'
        ? rec.id_empleadoInformacion
        : rec.id_empleadoInformacion._id;
      return eid === e._id;
    })?.nombre ?? '—';

    const now = new Date().toLocaleString();
    const html = `
      <html>
        <head>
          <title>Recibo - JHS AutoServicios</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, sans-serif; margin:0; padding:20px; color:#333; }
            header { text-align:center; margin-bottom:20px; }
            h1 { margin:0; color:#005B96; }
            .subtitle { margin:5px 0 20px; color:#007ACC; }
            table { width:100%; border-collapse:collapse; margin-top:20px; }
            td { padding:8px; border-bottom:1px solid #ddd; }
            .label { font-weight:bold; width:30%; color:#005B96; }
            footer { text-align:center; margin-top:30px; font-size:0.85em; color:#666; }
          </style>
        </head>
        <body>
          <header>
            <h1>JHS AutoServicios</h1>
            <div class="subtitle">Recibo de Servicio de Vehículo</div>
          </header>
          <table>
            <tr><td class="label">Cliente</td><td>${cli?.nombre ?? '—'}</td></tr>
            <tr><td class="label">Chasis</td><td>${veh?.chasis ?? '—'}</td></tr>
            <tr><td class="label">Empleado</td><td>${empleado}</td></tr>
            <tr><td class="label">Fecha Impresión</td><td>${now}</td></tr>
            <tr><td class="label">Problema</td><td>${rec.problema_reportado ?? '—'}</td></tr>
            <tr><td class="label">Comentario</td><td>${rec.comentario ?? '—'}</td></tr>
            <tr><td class="label">Observaciones</td><td>${r.observaciones ?? '—'}</td></tr>
          </table>
          <footer>Gracias por preferir JHS AutoServicios</footer>
        </body>
      </html>
    `;

    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.onafterprint = () => w.close();
    w.print();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Recibos de Vehículo</Typography>
      <Box display="flex" gap={1} mb={2} alignItems="center">
        <TextField
          label="Buscar cliente, chasis u observaciones"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ flex: '1 1 300px' }}
        />
        <Button variant="contained" onClick={openNew}>+ Nuevo Recibo</Button>
      </Box>

      <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: 'action.hover' }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Chasis</TableCell>
              <TableCell>Observaciones</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((r, i) => {
              const idx = page * rowsPerPage + i + 1;
              const rec = recepciones.find(rep => {
                const rid = typeof r.id_recepcion === 'string'
                  ? r.id_recepcion
                  : r.id_recepcion._id;
                return rid === rep._id;
              });
              const veh = rec
                ? vehiculos.find(v => {
                  const vid = typeof rec.id_vehiculo === 'string'
                    ? rec.id_vehiculo
                    : rec.id_vehiculo._id;
                  return vid === v._id;
                })
                : null;
              const cli = veh
                ? clientes.find(c => {
                  const cid = typeof veh.id_cliente === 'string'
                    ? veh.id_cliente
                    : veh.id_cliente._id;
                  return cid === c._id;
                })
                : null;
              return (
                <TableRow key={r._id} hover>
                  <TableCell>{idx}</TableCell>
                  <TableCell>{cli?.nombre ?? '—'}</TableCell>
                  <TableCell>{veh?.chasis ?? '—'}</TableCell>
                  <TableCell>{r.observaciones ?? '—'}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handlePrint(r)}>
                      <PrintIcon fontSize="small" />
                    </IconButton>
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

      <ReciboVehiculoModal
        open={modalOpen}
        defaultData={editData ?? undefined}
        recepciones={recepciones}
        vehiculos={vehiculos}
        clientes={clientes}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <Dialog open={confirmDel} onClose={() => setConfirmDel(false)}>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="warning" /> ¿Eliminar este recibo?
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
