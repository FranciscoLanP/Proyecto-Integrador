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
  TablePagination
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { useCrud } from '@/hooks/useCrud'
import { useNotification } from '@/components/utils/NotificationProvider'
import { EmpleadoConUbicacion, IEmpleadoInformacion } from '../types'
import EmpleadoInformacionModal from './EmpleadoInformacionModal'

export default function EmpleadoInformacionPage(): JSX.Element {
  const { notify } = useNotification()
  const empleadoCrud = useCrud<IEmpleadoInformacion>('empleadoinformaciones')

  const { data: empleados = [], isLoading, error } = empleadoCrud.allQuery

  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [modalOpen, setModalOpen] = useState(false)
  const [editData, setEditData] = useState<EmpleadoConUbicacion>()

  if (isLoading) return <Typography>Loading…</Typography>
  if (error) return <Typography color="error">{error.message}</Typography>

  const filtered = empleados.filter(e =>
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.tipo_empleado.toLowerCase().includes(searchTerm.toLowerCase())
  )
  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  const openNew = () => {
    setEditData(undefined)
    setModalOpen(true)
  }

  const openEdit = (row: IEmpleadoInformacion) => {
    const coords = row.location?.coordinates ?? [-69.9312, 18.4861]
    const [lng, lat] = coords as [number, number]
    setEditData({
      ...row,
      latitude: lat,
      longitude: lng,
      direccion: row.direccion,
      ubicacionLabel: row.ubicacionLabel
    })
    setModalOpen(true)
  }

  const closeModal = () => setModalOpen(false)

  const handleSubmit = (payload: EmpleadoConUbicacion) => {
    if (editData?._id) {
      empleadoCrud.updateM.mutate(
        { id: editData._id, data: payload },
        {
          onSuccess: () => notify('Empleado actualizado', 'success'),
          onError: () => notify('Error al actualizar', 'error'),
        }
      )
    } else {
      empleadoCrud.createM.mutate(
        payload,
        {
          onSuccess: () => notify('Empleado creado', 'success'),
          onError: () => notify('Error al crear', 'error'),
        }
      )
    }
    setModalOpen(false)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Gestión de Empleados
      </Typography>

      <Box display="flex" gap={1} mb={2}>
        <TextField
          label="Buscar nombre o tipo"
          size="small"
          value={searchTerm}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value)
            setPage(0)
          }}
          sx={{ flex: 1 }}
        />
        <Button variant="contained" onClick={openNew}>
          + Nuevo Empleado
        </Button>
      </Box>

      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
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
            {paginated.map((e, i) => (
              <TableRow key={e._id} hover>
                <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                <TableCell>{e.nombre}</TableCell>
                <TableCell>{e.tipo_empleado}</TableCell>
                <TableCell>{e.telefono}</TableCell>
                <TableCell>{e.correo}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => openEdit(e)}>
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
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      <EmpleadoInformacionModal
        open={modalOpen}
        defaultData={editData}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />
    </Box>
  )
}
