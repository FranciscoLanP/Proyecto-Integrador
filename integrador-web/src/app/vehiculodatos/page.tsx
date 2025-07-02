'use client';

import React, { useState, useEffect, ChangeEvent, ChangeEventHandler } from 'react';
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
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useCrud } from '../../hooks/useCrud';
import type {
  IVehiculoDatos,
  ICliente,
  IModelosDatos,
  IColoresDatos,
  IMarcaVehiculo
} from '../types';
import VehiculoModal from './VehiculoModal';

export default function VehiculoDatosPage() {
  // 1) Hooks de datos (useCrud) - siempre al inicio
  const vehCrud = useCrud<IVehiculoDatos>('vehiculodatos');
  const cliCrud = useCrud<ICliente>('clientes');
  const modCrud = useCrud<IModelosDatos>('modelosdatos');
  const colCrud = useCrud<IColoresDatos>('coloresdatos');
  const marCrud = useCrud<IMarcaVehiculo>('marcasvehiculos');

  // 2) Hooks de estado UI - también incondicionales
  const [searchTerm, setSearchTerm]   = useState('');
  const [page, setPage]               = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openForm, setOpenForm]       = useState(false);
  const [editData, setEditData]       = useState<IVehiculoDatos | null>(null);
  const [confirmDel, setConfirmDel]   = useState(false);
  const [toDelete, setToDelete]       = useState<IVehiculoDatos | null>(null);

  // 3) Extracción de los arrays de datos
  const vehiculos = vehCrud.allQuery.data || [];
  const clientes  = cliCrud.allQuery.data  || [];
  const modelos   = modCrud.allQuery.data  || [];
  const colores   = colCrud.allQuery.data  || [];
  const marcas    = marCrud.allQuery.data  || [];

  // 4) Manejadores de búsqueda/paginación
  const handleSearch: ChangeEventHandler<HTMLInputElement> = e => {
    setSearchTerm(e.target.value);
    setPage(0);
  };
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRows = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // 5) Condicionales de carga/errores (AHORA después de declarar todos los hooks)
  if (
    vehCrud.allQuery.isLoading ||
    cliCrud.allQuery.isLoading ||
    modCrud.allQuery.isLoading ||
    colCrud.allQuery.isLoading ||
    marCrud.allQuery.isLoading
  ) {
    return <Typography>Loading…</Typography>;
  }
  const loadError =
    vehCrud.allQuery.error ||
    cliCrud.allQuery.error ||
    modCrud.allQuery.error ||
    colCrud.allQuery.error ||
    marCrud.allQuery.error;
  if (loadError) {
    return <Typography color="error">{loadError.message}</Typography>;
  }

  // 6) Filtrado y paginación de vehículos
  const filtered  = vehiculos.filter(v =>
    v.chasis.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // 7) CRUD modals / toggles
  const openNew = () => { setEditData(null); setOpenForm(true); };
  const openEdit = (v: IVehiculoDatos) => { setEditData(v); setOpenForm(true); };
  const closeForm = () => setOpenForm(false);
  const onSubmit = (data: Partial<IVehiculoDatos>) => {
    if (editData) vehCrud.updateM.mutate({ id: editData._id, data });
    else          vehCrud.createM.mutate(data);
    closeForm();
  };

  const askDelete = (v: IVehiculoDatos) => { setToDelete(v); setConfirmDel(true); };
  const confirmDelete = () => {
    if (toDelete) vehCrud.deleteM.mutate(toDelete._id);
    setConfirmDel(false);
    setToDelete(null);
  };

  const toggleActivo = (v: IVehiculoDatos) => {
    vehCrud.updateM.mutate({ id: v._id, data: { activo: !v.activo } });
  };

  // 8) Render final
  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>Gestión de Vehículos</Typography>

      <Box display="flex" gap={1} flexWrap="wrap" justifyContent="space-between" mb={2}>
        <TextField
          label="Buscar chasis"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ flex: '1 1 200px' }}
        />
        <Button variant="contained" onClick={openNew}>+ Nuevo Vehículo</Button>
      </Box>

      <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: 'action.hover' }}>
            <TableRow>
              <TableCell>Chasis</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Marca</TableCell>
              <TableCell>Modelo</TableCell>
              <TableCell>Color</TableCell>
              <TableCell>Año</TableCell>
              <TableCell>Activo</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map(v => {
              const clienteName = typeof v.id_cliente === 'string'
                ? clientes.find(c => c._id === v.id_cliente)?.nombre
                : (v.id_cliente as ICliente)?.nombre;
              const modeloObj = typeof v.id_modelo === 'string'
                ? modelos.find(m => m._id === v.id_modelo)
                : (v.id_modelo as IModelosDatos);
              const modeloName = modeloObj?.nombre_modelo;
              const brandId    = modeloObj?.id_marca;
              const brandName  = marcas.find(mk => mk._id === brandId)?.nombre_marca;
              const colorName  = typeof v.id_color === 'string'
                ? colores.find(c => c._id === v.id_color)?.nombre_color
                : (v.id_color as IColoresDatos)?.nombre_color;

              return (
                <TableRow key={v._id} hover sx={{ '&:hover': { backgroundColor: 'action.selected' } }}>
                  <TableCell>{v.chasis}</TableCell>
                  <TableCell>{clienteName  ?? '—'}</TableCell>
                  <TableCell>{brandName    ?? '—'}</TableCell>
                  <TableCell>{modeloName   ?? '—'}</TableCell>
                  <TableCell>{colorName    ?? '—'}</TableCell>
                  <TableCell>{v.anio}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => toggleActivo(v)} color={v.activo ? 'success' : 'warning'}>
                      {v.activo ? <VisibilityIcon fontSize="small"/> : <VisibilityOffIcon fontSize="small"/>}
                    </IconButton>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(v)}><EditIcon fontSize="small"/></IconButton>
                    <IconButton size="small" color="error" onClick={() => askDelete(v)}><DeleteIcon fontSize="small"/></IconButton>
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

      <VehiculoModal
        open={openForm}
        defaultData={editData ?? undefined}
        clientes={clientes}
        marcas={marcas}
        modelos={modelos}
        colores={colores}
        onClose={closeForm}
        onSubmit={onSubmit}
      />

      <Dialog open={confirmDel} onClose={() => setConfirmDel(false)}>
        <DialogTitle sx={{ display:'flex', alignItems:'center', gap:1 }}>
          <WarningAmberIcon color="warning"/> ¿Eliminar este vehículo?
        </DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirmDel(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
