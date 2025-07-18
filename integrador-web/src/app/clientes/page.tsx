// 📁 src/app/clientes/page.tsx
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

import DriveEtaIcon from '@mui/icons-material/DriveEta';
import EditIcon from '@mui/icons-material/Edit';

import { useCrud } from '../../hooks/useCrud';
import { useNotification } from '../../components/utils/NotificationProvider';
import type {
  ICliente,
  IBarrio,
  IDistrito,
  ISector,
  IMunicipio,
  IProvincia
} from '../types';
import ClientModal from './ClientModal';
import ClienteVehiculosModal from './ClienteVehiculosModal';

export default function ClientesPage(): JSX.Element {
  const { notify } = useNotification();

  const clienteCrud = useCrud<ICliente>('clientes');
  const provinciaCrud = useCrud<IProvincia>('provincias');
  const municipioCrud = useCrud<IMunicipio>('municipios');
  const sectorCrud = useCrud<ISector>('sectores');
  const distritoCrud = useCrud<IDistrito>('distritos');
  const barrioCrud = useCrud<IBarrio>('barrios');

  const clientes = clienteCrud.allQuery.data || [];
  const provincias = provinciaCrud.allQuery.data || [];
  const municipios = municipioCrud.allQuery.data || [];
  const sectores = sectorCrud.allQuery.data || [];
  const distritos = distritoCrud.allQuery.data || [];
  const barrios = barrioCrud.allQuery.data || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState<ICliente | null>(null);

  const [selClient, setSelClient] = useState<ICliente | null>(null);
  const [openVeh, setOpenVeh] = useState(false);

  if (clienteCrud.allQuery.isLoading)
    return <Typography>Loading…</Typography>;
  if (clienteCrud.allQuery.error)
    return <Typography color="error">{clienteCrud.allQuery.error.message}</Typography>;

  const filtered = clientes.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const buildAddress = (barrioId: string) => {
    const b = barrios.find(x => x._id === barrioId);
    if (!b) return '—';
    const d = distritos.find(x => x._id === b.id_distrito);
    const s = d && sectores.find(x => x._id === d.id_sector);
    const m = s && municipios.find(x => x._id === s.id_municipio);
    const p = m && provincias.find(x => x._id === m.id_provincia);
    return [p?.nombre_provincia, m?.nombre_municipio, s?.nombre_sector, d?.nombre_distrito, b.nombre_barrio]
      .filter(Boolean)
      .join(' / ');
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => { setSearchTerm(e.target.value); setPage(0); };
  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage);
  const handleRowsChange = (e: ChangeEvent<HTMLInputElement>) => { setRowsPerPage(+e.target.value); setPage(0); };

  const openCreate = () => { setEditData(null); setOpenForm(true); };
  const openEdit = (c: ICliente) => { setEditData(c); setOpenForm(true); };
  const closeForm = () => setOpenForm(false);

  const submitClient = (data: Partial<ICliente>) => {
    if (editData) {
      clienteCrud.updateM.mutate(
        { id: editData._id, data },
        {
          onSuccess: () => notify('Cliente actualizado correctamente', 'success'),
          onError: () => notify('Error al actualizar cliente', 'error'),
        }
      );
    } else {
      clienteCrud.createM.mutate(
        data,
        {
          onSuccess: () => notify('Cliente creado correctamente', 'success'),
          onError: () => notify('Error al crear cliente', 'error'),
        }
      );
    }
    closeForm();
  };

  const openVehModal = (c: ICliente) => {
    setSelClient(c);
    setOpenVeh(true);
  };
  const closeVehModal = () => setOpenVeh(false);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Gestión de Clientes
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          label="Buscar cliente"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ flex: '1 1 200px' }}
        />
        <Button variant="contained" onClick={openCreate} sx={{ ml: 'auto' }}>
          + Nuevo Cliente
        </Button>
      </Box>

      <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Cédula</TableCell>
              <TableCell>RNC</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Correo</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map(c => (
              <TableRow key={c._id} hover>
                <TableCell>{c.nombre}</TableCell>
                <TableCell>{c.cedula}</TableCell>
                <TableCell>{c.rnc || '—'}</TableCell>
                <TableCell>{c.numero_telefono}</TableCell>
                <TableCell>{c.correo}</TableCell>
                <TableCell>{buildAddress(c.id_barrio!)}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openVehModal(c)}>
                    <DriveEtaIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => openEdit(c)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  {/* — Botón de eliminar borrado */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsChange}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      <ClientModal
        open={openForm}
        defaultData={editData ?? undefined}
        barrios={barrios}
        onClose={closeForm}
        onSubmit={submitClient}
      />

      {selClient && (
        <ClienteVehiculosModal
          open={openVeh}
          onClose={closeVehModal}
          client={selClient}
        />
      )}
    </Box>
  );
}
