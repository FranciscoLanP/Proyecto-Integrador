// 📁 src/app/clientes/page.tsx
'use client';

import React, { useState, ChangeEvent, JSX } from 'react';
import dynamic from 'next/dynamic';
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

} from '../types';

// Cargamos el modal de cliente sin SSR para evitar errores de Leaflet en el servidor
const ClientModal = dynamic(() => import('./ClientModal'), { ssr: false });
import ClienteVehiculosModal from './ClienteVehiculosModal';

export default function ClientesPage(): JSX.Element {
  const { notify } = useNotification();

  const clienteCrud = useCrud<ICliente>('clientes');


  const clientes = clienteCrud.allQuery.data || [];

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
  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );



  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };
  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage);
  const handleRowsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  const openCreate = () => {
    setEditData(null);
    setOpenForm(true);
  };
  const openEdit = (c: ICliente) => {
    setEditData(c);
    setOpenForm(true);
  };
  const closeForm = () => setOpenForm(false);

  const submitClient = (data: Partial<ICliente> & {
    latitude: number;
    longitude: number;
    direccion?: string;
  }) => {
    if (editData) {
      clienteCrud.updateM.mutate(
        { id: editData._id, data },
        {
          onSuccess: () => notify('Cliente actualizado correctamente', 'success'),
          onError: () => notify('Error al actualizar cliente', 'error'),
        }
      );
    } else {
      clienteCrud.createM.mutate(data, {
        onSuccess: () => notify('Cliente creado correctamente', 'success'),
        onError: () => notify('Error al crear cliente', 'error'),
      });
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
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openVehModal(c)}>
                    <DriveEtaIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => openEdit(c)}>
                    <EditIcon fontSize="small" />
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
          onPageChange={handlePageChange}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleRowsChange}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      <ClientModal
        open={openForm}
        defaultData={
          editData
            ? {
              ...editData,
              latitude: (editData as any).location?.coordinates[1] ?? 0,
              longitude: (editData as any).location?.coordinates[0] ?? 0,
              direccion: (editData as any).direccion,
            }
            : undefined
        }
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
