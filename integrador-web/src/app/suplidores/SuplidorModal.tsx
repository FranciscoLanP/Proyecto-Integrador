'use client'

import React, { useState, useEffect, JSX } from 'react'
import {
  TextField,
  Button,
  Box
} from '@mui/material'
import ModernModal from '@/components/ModernModal/ModernModal'
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
  // Estilo moderno para TextFields con bordes visibles
  const textFieldStyle = {
    '& .MuiInputLabel-root': {
      zIndex: 1,
      backgroundColor: 'transparent',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'rgba(0, 0, 0, 0.23)',
        borderWidth: '2px',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(0, 0, 0, 0.6)',
        borderWidth: '2px',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1976d2',
        borderWidth: '2px',
      },
    },
  };

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
    <ModernModal
      open={open}
      onClose={onClose}
      title={defaultData ? 'Editar Suplidor' : 'Nuevo Suplidor'}
      maxWidth="sm"
    >
      <Box display="flex" flexDirection="column" gap={3}>
        {/* Sección: Información Básica */}
        <Box>
          <Box sx={{ mb: 2, pb: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
            <strong style={{ fontSize: '1.1rem' }}>Información Básica</strong>
          </Box>

          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              fullWidth
              sx={textFieldStyle}
              placeholder="Nombre del suplidor"
              helperText="Nombre completo o razón social del suplidor"
            />

            <TextField
              label="RNC"
              value={rnc}
              onChange={(e) => setRnc(e.target.value)}
              fullWidth
              sx={textFieldStyle}
              placeholder="Registro Nacional del Contribuyente"
              helperText="RNC del suplidor (opcional)"
            />
          </Box>
        </Box>

        {/* Sección: Contacto */}
        <Box>
          <Box sx={{ mb: 2, pb: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
            <strong style={{ fontSize: '1.1rem' }}>Información de Contacto</strong>
          </Box>

          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              fullWidth
              sx={textFieldStyle}
              placeholder="(809) 000-0000"
              helperText="Número de teléfono principal"
            />

            <TextField
              label="Correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              fullWidth
              sx={textFieldStyle}
              placeholder="contacto@suplidor.com"
              helperText="Dirección de correo electrónico"
            />
          </Box>
        </Box>

        {/* Sección: Ubicación */}
        <Box>
          <Box sx={{ mb: 2, pb: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
            <strong style={{ fontSize: '1.1rem' }}>Ubicación</strong>
          </Box>

          <Box display="flex" flexDirection="column" gap={2}>
            <Box>
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
              placeholder="Calle, número de casa, apartamento, etc."
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              fullWidth
              multiline
              minRows={2}
              sx={textFieldStyle}
              helperText="Información adicional sobre la dirección"
            />
          </Box>
        </Box>

        {/* Botones de acción */}
        <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: 'rgba(0,0,0,0.5)',
              color: 'rgba(0,0,0,0.7)',
              borderWidth: '1px',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.05)',
                borderColor: 'rgba(0,0,0,0.7)',
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: 'white',
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {defaultData ? 'Guardar cambios' : 'Crear Suplidor'}
          </Button>
        </Box>
      </Box>
    </ModernModal>
  )
}
