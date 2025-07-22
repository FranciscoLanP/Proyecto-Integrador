'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  IconButton,
  Box
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import 'leaflet/dist/leaflet.css'
import { MapPicker } from '@/components/MapPicker'
import type { EmpleadoConUbicacion } from '../types'

const tipoOptions = [
  'Empleado Asalariado',
  'Empleado por Trabajo'
] as const

interface Props {
  open: boolean
  defaultData?: EmpleadoConUbicacion
  onClose: () => void
  onSubmit: (data: EmpleadoConUbicacion) => void
}

export default function EmpleadoInformacionModal({
  open,
  defaultData,
  onClose,
  onSubmit
}: Props) {
  const [tipo, setTipo] = useState<typeof tipoOptions[number] | ''>('')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [markerLat, setMarkerLat] = useState(18.4861)
  const [markerLng, setMarkerLng] = useState(-69.9312)
  const [mapLabel, setMapLabel] = useState('')
  const [direccion, setDireccion] = useState('')

  useEffect(() => {
    if (!open) {
      setTipo(''); setNombre(''); setTelefono(''); setCorreo('')
      setMarkerLat(18.4861); setMarkerLng(-69.9312)
      setMapLabel(''); setDireccion('')
      return
    }
    if (defaultData) {
      setTipo(defaultData.tipo_empleado ?? '')
      setNombre(defaultData.nombre ?? '')
      setTelefono(defaultData.telefono ?? '')
      setCorreo(defaultData.correo ?? '')
      setMarkerLat(defaultData.latitude)
      setMarkerLng(defaultData.longitude)
      setMapLabel(defaultData.ubicacionLabel ?? '')
      setDireccion(defaultData.direccion ?? '')
    }
  }, [open, defaultData])

  const handleSave = (): void => {
    onSubmit({
      tipo_empleado: tipo as typeof tipoOptions[number],
      nombre: nombre.trim(),
      telefono: telefono.trim(),
      correo: correo.trim(),
      latitude: markerLat,
      longitude: markerLng,
      direccion: direccion.trim() || undefined,
      ubicacionLabel: mapLabel || undefined
    })
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ position: 'relative', pr: 6 }}>
        {defaultData ? 'Editar Empleado' : 'Nuevo Empleado'}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            select
            label="Tipo de Empleado"
            value={tipo}
            onChange={e => setTipo(e.target.value as any)}
            required
            fullWidth
          >
            {tipoOptions.map(t => (
              <MenuItem key={t} value={t}>{t}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Nombre completo"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Teléfono"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            fullWidth
          />
          <TextField
            label="Correo electrónico"
            value={correo}
            onChange={e => setCorreo(e.target.value)}
            fullWidth
          />
          <Box mt={2}>
            <MapPicker
              initialPosition={[markerLat, markerLng]}
              initialSearch={mapLabel}
              skipInitial={!defaultData}
              onChange={(lat, lng, label) => {
                setMarkerLat(lat);
                setMarkerLng(lng);
                if (label) setMapLabel(label);
              }}
            />
          </Box>
          <TextField
            label="Dirección detallada"
            placeholder="calle/casa #"
            value={direccion}
            onChange={e => setDireccion(e.target.value)}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave}>
          {defaultData ? 'Guardar cambios' : 'Crear Empleado'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}