'use client'
import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  IconButton,
  Box,
  Typography
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useCrud } from '../../hooks/useCrud'
import type {
  IVehiculoDatos,
  IModelosDatos,
  IColoresDatos,
  ICliente
} from '../types'

interface Props {
  open: boolean
  onClose: () => void
  client: ICliente
  modelos: IModelosDatos[]
  colores: IColoresDatos[]
}

export default function ClienteVehiculosModal({
  open,
  onClose,
  client,
  modelos,
  colores
}: Props) {
  const { allQuery: vehQuery } = useCrud<IVehiculoDatos>('vehiculodatos')
  const vehiculos = vehQuery.data || []

  const listado = vehiculos.filter(
    v => v.id_cliente === client._id && v.activo !== false
  )

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ position: 'relative', pr: 6 }}>
        Vehículos de {client.nombre}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {listado.length === 0 ? (
          <Typography>No hay vehículos activos registrados.</Typography>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: 'action.hover' }}>
                <TableRow>
                  <TableCell>Chasis</TableCell>
                  <TableCell>Modelo</TableCell>
                  <TableCell>Color</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {listado.map(v => {
                  const mod =
                    modelos.find(m => m._id === v.id_modelo)
                      ?.nombre_modelo ?? '—'
                  const col =
                    colores.find(c => c._id === v.id_color)
                      ?.nombre_color ?? '—'
                  return (
                    <TableRow key={v._id} hover>
                      <TableCell>{v.chasis}</TableCell>
                      <TableCell>{mod}</TableCell>
                      <TableCell>{col}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 1 }}>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  )
}
