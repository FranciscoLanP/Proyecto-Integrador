'use client'

import React, { useState, ChangeEvent, JSX } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import TablePagination from '@mui/material/TablePagination'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useCrud } from '../../hooks/useCrud'
import type { ICliente, IBarrio } from '../types'
import ClientModal from './ClientModal'

export default function ClientesPage(): JSX.Element {
  const clienteCrud = useCrud<ICliente>('clientes')
  const barrioCrud = useCrud<IBarrio>('barrios')
  const clientes = clienteCrud.allQuery.data || []
  const barrios = barrioCrud.allQuery.data || []
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [page, setPage] = useState<number>(0)
  const [rowsPerPage, setRowsPerPage] = useState<number>(5)

  const [openForm, setOpenForm] = useState<boolean>(false)
  const [editData, setEditData] = useState<ICliente | null>(null)
  const [confirmDel, setConfirmDel] = useState<boolean>(false)
  const [toDelete, setToDelete] = useState<ICliente | null>(null)

  if (clienteCrud.allQuery.isLoading)
    return <Typography>Loading…</Typography>
  if (clienteCrud.allQuery.error)
    return (
      <Typography color="error">
        {clienteCrud.allQuery.error.message}
      </Typography>
    )
  if (clientes.length === 0)
    return <Typography>No hay clientes aún.</Typography>

  const filtered = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setPage(0)
  }
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage)
  }
  const handleChangeRowsPerPage = (
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(e.target.value, 10))
    setPage(0)
  }

  const openNew = (): void => {
    setEditData(null)
    setOpenForm(true)
  }
  const openEdit = (c: ICliente): void => {
    setEditData(c)
    setOpenForm(true)
  }
  const closeForm = (): void => setOpenForm(false)
  const onSubmit = (payload: Partial<ICliente>): void => {
    if (editData) {
      clienteCrud.updateM.mutate({ id: editData._id, data: payload })
    } else {
      clienteCrud.createM.mutate(payload)
    }
    closeForm()
  }

  const askDelete = (c: ICliente): void => {
    setToDelete(c)
    setConfirmDel(true)
  }
  const confirmDelete = (): void => {
    if (toDelete) clienteCrud.deleteM.mutate(toDelete._id)
    setConfirmDel(false)
    setToDelete(null)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 500, mb: 0.5 }}>
        Gestión de Clientes
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" mb={2}>
        Administra los clientes de tu sistema
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
          label="Buscar cliente"
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
          + Nuevo Cliente
        </Button>
      </Box>

      <Paper
        elevation={1}
        sx={{ borderRadius: 2, overflow: 'hidden' }}
      >
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
            Clientes del Sistema
          </Typography>
        </Box>

        <Table size="small" sx={{ minWidth: 600 }}>
          <TableHead sx={{ backgroundColor: 'action.hover' }}>
            <TableRow>
              <TableCell sx={{ fontSize: '0.85rem' }}>Cédula</TableCell>
              <TableCell sx={{ fontSize: '0.85rem' }}>RNC</TableCell>
              <TableCell sx={{ fontSize: '0.85rem' }}>Nombre</TableCell>
              <TableCell sx={{ fontSize: '0.85rem' }}>Teléfono</TableCell>
              <TableCell sx={{ fontSize: '0.85rem' }}>Correo</TableCell>
              <TableCell sx={{ fontSize: '0.85rem' }}>Barrio</TableCell>
              <TableCell
                align="right"
                sx={{ fontSize: '0.85rem' }}
              >
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginated.map((c, i) => {
              const barrioNombre =
                barrios.find((b) => b._id === c.id_barrio)
                  ?.nombre_barrio ?? '—'
              return (
                <TableRow
                  key={c._id}
                  hover
                  sx={{
                    '&:hover': {
                      backgroundColor: 'action.selected'
                    }
                  }}
                >
                  <TableCell sx={{ fontSize: '0.8rem', px: 1 }}>
                    {c.cedula}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', px: 1 }}>
                    {c.rnc || '—'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', px: 1 }}>
                    {c.nombre}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', px: 1 }}>
                    {c.numero_telefono}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', px: 1 }}>
                    {c.correo}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', px: 1 }}>
                    {barrioNombre}
                  </TableCell>
                  <TableCell align="right" sx={{ px: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => openEdit(c)}
                    >
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
              )
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
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} de ${count}`
          }
          sx={{
            '& .MuiTablePagination-toolbar': {
              minHeight: 36,
              py: 0
            },
            '& .MuiTablePagination-actions button': {
              padding: '4px'
            },
            '& .MuiTablePagination-selectLabel, & .MuiTablePagination-input':
              {
                fontSize: '0.8rem'
              }
          }}
        />
      </Paper>

      <ClientModal
        open={openForm}
        defaultData={editData ?? undefined}
        barrios={barrios}
        onClose={closeForm}
        onSubmit={onSubmit}
      />

      <Dialog
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: '0.9rem'
          }}
        >
          <WarningAmberIcon color="warning" fontSize="small" />
          ¿Confirma eliminar este cliente?
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
  )
}
