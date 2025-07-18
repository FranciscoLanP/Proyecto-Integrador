// 📁 src/app/vehiculodatos/page.tsx
'use client';

import React, { useState, ChangeEvent, ChangeEventHandler, JSX } from 'react';
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
import { useNotification } from '../../components/utils/NotificationProvider';
import type {
  IVehiculoDatos,
  ICliente,
  IModelosDatos,
  IColoresDatos,
  IMarcaVehiculo
} from '../types';
import VehiculoModal from './VehiculoModal';

export default function VehiculoDatosPage(): JSX.Element {
  const { notify } = useNotification();

  const vehCrud = useCrud<IVehiculoDatos>('vehiculodatos');
  const cliCrud = useCrud<ICliente>('clientes');
  const modCrud = useCrud<IModelosDatos>('modelosdatos');
  const colCrud = useCrud<IColoresDatos>('coloresdatos');
  const marCrud = useCrud<IMarcaVehiculo>('marcasvehiculos');

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [openForm, setOpenForm] = useState<boolean>(false);
  const [editData, setEditData] = useState<IVehiculoDatos | null>(null);
  const [confirmDel, setConfirmDel] = useState<boolean>(false);
  const [toDelete, setToDelete] = useState<IVehiculoDatos | null>(null);

  const vehiculos = vehCrud.allQuery.data || [];
  const clientes = cliCrud.allQuery.data || [];
  const modelos = modCrud.allQuery.data || [];
  const colores = colCrud.allQuery.data || [];
  const marcas = marCrud.allQuery.data || [];

  const handleSearch: ChangeEventHandler<HTMLInputElement> = e => {
    setSearchTerm(e.target.value);
    setPage(0);
  };
  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRows = (e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

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

  const filtered = vehiculos.filter(v =>
    v.chasis.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const openNew = (): void => { setEditData(null); setOpenForm(true); };
  const openEdit = (v: IVehiculoDatos): void => { setEditData(v); setOpenForm(true); };
  const closeForm = (): void => setOpenForm(false);

  const onSubmit = (data: Partial<IVehiculoDatos>): void => {
    if (editData) {
      vehCrud.updateM.mutate(
        { id: editData._id, data },
        {
          onSuccess: () => notify('Vehículo actualizado correctamente', 'success'),
          onError: () => notify('Error al actualizar vehículo', 'error'),
        }
      );
    } else {
      vehCrud.createM.mutate(
        data,
        {
          onSuccess: () => notify('Vehículo creado correctamente', 'success'),
          onError: () => notify('Error al crear vehículo', 'error'),
        }
      );
    }
    closeForm();
  };

  const askDelete = (v: IVehiculoDatos): void => { setToDelete(v); setConfirmDel(true); };
  const confirmDelete = (): void => {
    if (toDelete) {
      vehCrud.deleteM.mutate(
        toDelete._id,
        {
          onSuccess: () => notify('Vehículo eliminado correctamente', 'success'),
          onError: () => notify('Error al eliminar vehículo', 'error'),
        }
      );
    }
    setConfirmDel(false);
    setToDelete(null);
  };

  const toggleActivo = (v: IVehiculoDatos): void => {
    vehCrud.updateM.mutate(
      { id: v._id, data: { activo: !v.activo } },
      {
        onSuccess: () =>
          notify(
            `Vehículo ${v.activo ? 'desactivado' : 'activado'} correctamente`,
            'success'
          ),
        onError: () => notify('Error al cambiar estado del vehículo', 'error'),
      }
    );
  };

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Gestión de Vehículos
      </Typography>

      <Box display="flex" gap={1} flexWrap="wrap" justifyContent="space-between" mb={2}>
        <TextField
          label="Buscar chasis"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ flex: '1 1 200px' }}
        />
        <Button variant="contained" onClick={openNew}>
          + Nuevo Vehículo
        </Button>
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
              const brandId = modeloObj?.id_marca;
              const brandName = marcas.find(mk => mk._id === brandId)?.nombre_marca;
              const colorName = typeof v.id_color === 'string'
                ? colores.find(c => c._id === v.id_color)?.nombre_color
                : (v.id_color as IColoresDatos)?.nombre_color;

              return (
                <TableRow
                  key={v._id}
                  hover
                  sx={{ '&:hover': { backgroundColor: 'action.selected' } }}
                >
                  <TableCell>{v.chasis}</TableCell>
                  <TableCell>{clienteName ?? '—'}</TableCell>
                  <TableCell>{brandName ?? '—'}</TableCell>
                  <TableCell>{modeloName ?? '—'}</TableCell>
                  <TableCell>{colorName ?? '—'}</TableCell>
                  <TableCell>{v.anio}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => toggleActivo(v)}
                      color={v.activo ? 'success' : 'warning'}
                    >
                      {v.activo ? (
                        <VisibilityIcon fontSize="small" />
                      ) : (
                        <VisibilityOffIcon fontSize="small" />
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => openEdit(v)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => askDelete(v)}>
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
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon color="warning" /> ¿Eliminar este vehículo?
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
