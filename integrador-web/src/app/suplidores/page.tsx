'use client'

import React, { useState, ChangeEvent, JSX } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  TextField,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogActions
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { useCrud } from '@/hooks/useCrud'
import { useNotification } from '@/components/utils/NotificationProvider'
import type { ISuplidor } from '../types'
import SuplidorModal from './SuplidorModal'

export default function SuplidorPage(): JSX.Element {
  const { notify } = useNotification()
  const { allQuery, createM, updateM, deleteM } =
    useCrud<ISuplidor>('suplidorpiezas')
  const { data: suplidores = [], isLoading, error } = allQuery

  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState<ISuplidor>()
  const [confirmDel, setConfirmDel] = useState(false)
  const [toDelete, setToDelete] = useState<ISuplidor>()

  if (isLoading) return <Typography>Cargando…</Typography>
  if (error) return <Typography color="error">{error.message}</Typography>

  const filtered = suplidores.filter(s =>
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rnc?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  const openNew = (): void => {
    setEditData(undefined)
    setModalOpen(true)
  }

  const openEdit = (s: ISuplidor): void => {
    const coords = s.location?.coordinates ?? [-69.9312, 18.4861]
    const [lng, lat] = coords as [number, number]
    setEditData({
      ...s,
      latitude: lat,
      longitude: lng,
      direccion: s.direccion,
      ubicacionLabel: s.ubicacionLabel
    })
    setModalOpen(true)
  }

  const closeModal = (): void => setModalOpen(false)

  const handleSubmit = (payload: ISuplidor): void => {
    if (editData?._id) {
      updateM.mutate(
        { id: editData._id, data: payload },
        {
          onSuccess: () => notify('Suplidor actualizado correctamente', 'success'),
          onError: () => notify('Error al actualizar suplidor', 'error')
        }
      )
    } else {
      createM.mutate(payload, {
        onSuccess: () => notify('Suplidor creado correctamente', 'success'),
        onError: () => notify('Error al crear suplidor', 'error')
      })
    }
    setModalOpen(false)
  }

  const askDelete = (s: ISuplidor): void => {
    setToDelete(s)
    setConfirmDel(true)
  }

  const confirmDelete = (): void => {
    if (toDelete) {
      deleteM.mutate(toDelete._id!, {
        onSuccess: () => notify('Suplidor eliminado correctamente', 'success'),
        onError: () => notify('Error al eliminar suplidor', 'error')
      })
    }
    setConfirmDel(false)
    setToDelete(undefined)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ fontWeight: 500, mb: 1 }}>
        Suplidores Registrados
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
          label="Buscar por nombre, cédula o RNC"
          size="small"
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value)
            setPage(0)
          }}
          sx={{ flex: '1 1 300px' }}
        />
        <Button variant="contained" onClick={openNew}>
          + Nuevo Suplidor
        </Button>
      </Box>

      <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: 'action.hover' }}>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>RNC</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Correo</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((s, i) => (
              <TableRow key={s._id} hover>
                <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                <TableCell>{s.nombre}</TableCell>
                <TableCell>{s.rnc}</TableCell>
                <TableCell>{s.numero_telefono}</TableCell>
                <TableCell>{s.correo}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(s)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => askDelete(s)}
                  >
                    <DeleteIcon fontSize="small" />
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
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      <SuplidorModal
        open={modalOpen}
        defaultData={editData}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <Dialog open={confirmDel} onClose={() => setConfirmDel(false)}>
        <DialogTitle
          sx={{ display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.9rem' }}
        >
          <WarningAmberIcon color="warning" />
          ¿Confirmas eliminar este suplidor?
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
