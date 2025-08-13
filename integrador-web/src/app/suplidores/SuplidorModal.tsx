'use client'

import React, { useState, useEffect, JSX } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Box
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import 'leaflet/dist/leaflet.css'
import { MapPicker } from '@/components/MapPicker'
import type { ISuplidor } from '../types'

interface Props {
  open: boolean
  defaultData?: ISuplidor
  onClose: () => void
  onSubmit: (data: ISuplidor) => void
}

export default function SuplidorModal({
  open,
  defaultData,
  onClose,
  onSubmit
}: Props): JSX.Element {
  const [nombre, setNombre] = useState('')
  const [rnc, setRnc] = useState('')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [markerLat, setMarkerLat] = useState(18.4861)
  const [markerLng, setMarkerLng] = useState(-69.9312)
  const [mapLabel, setMapLabel] = useState('')
  const [direccion, setDireccion] = useState('')

  useEffect(() => {
    if (!open) {
      setNombre('')
      setRnc('')
      setTelefono('')
      setCorreo('')
      setMarkerLat(18.4861)
      setMarkerLng(-69.9312)
      setMapLabel('')
      setDireccion('')
      return
    }

    if (defaultData) {
      setNombre(defaultData.nombre ?? '')
      setRnc(defaultData.rnc ?? '')
      setTelefono(defaultData.numero_telefono ?? '')
      setCorreo(defaultData.correo ?? '')
      setMarkerLat(defaultData.latitude)
      setMarkerLng(defaultData.longitude)
      setMapLabel(defaultData.ubicacionLabel ?? '')
      setDireccion(defaultData.direccion ?? '')
    }
  }, [open, defaultData])

  const handleSave = (): void => {
    const payload: any = {
      nombre: nombre.trim(),
      rnc: rnc.trim() || undefined,
      numero_telefono: telefono.trim(),
      correo: correo.trim(),
      location: {
        type: 'Point',
        coordinates: [markerLng, markerLat]
      },
      direccion: direccion.trim() || undefined,
      ubicacionLabel: mapLabel || undefined,
      latitude: markerLat,
      longitude: markerLng
    };

    if (defaultData?._id) {
      payload._id = defaultData._id;
    }

    onSubmit(payload);
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ position: 'relative', pr: 6 }}>
        {defaultData ? 'Editar Suplidor' : 'Nuevo Suplidor'}
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
            label="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="RNC"
            value={rnc}
            onChange={(e) => setRnc(e.target.value)}
            fullWidth
          />
          <TextField
            label="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            fullWidth
          />
          <TextField
            label="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            fullWidth
          />

          <Box mt={2}>
            <MapPicker
              initialPosition={[markerLat, markerLng]}
              initialSearch={mapLabel}
              skipInitial={!defaultData}
              onChange={(lat, lng, label) => {
                setMarkerLat(lat)
                setMarkerLng(lng)
                if (label) setMapLabel(label)
              }}
            />
          </Box>

          <TextField
            label="Dirección detallada"
            placeholder="calle/casa #"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            fullWidth
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave}>
          {defaultData ? 'Guardar cambios' : 'Crear Suplidor'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
