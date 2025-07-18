// src/components/ClientModal.tsx
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
import type { ICliente, ClienteTipo } from '../types'
import 'leaflet/dist/leaflet.css'
import { MapPicker } from '@/components/MapPicker'

/** Datos que envía el formulario, con ubicación opcional */
export type ClienteConUbicacion = Partial<ICliente> & {
  latitude: number
  longitude: number
  direccion?: string    // aquí guardamos solo la dirección detallada
}

interface Props {
  open: boolean
  onClose: () => void
  onSubmit: (data: ClienteConUbicacion) => void
  defaultData?: ClienteConUbicacion
}

export default function ClientModal({
  open,
  onClose,
  onSubmit,
  defaultData,
}: Props) {
  // Campos básicos
  const [cedula, setCedula] = useState<string>('')
  const [rnc, setRnc] = useState<string>('')
  const [nombre, setNombre] = useState<string>('')
  const [telefono, setTelefono] = useState<string>('')
  const [correo, setCorreo] = useState<string>('')
  const [tipoCliente, setTipoCliente] = useState<ClienteTipo | ''>('')

  // Errores de validación
  const [cedulaError, setCedulaError] = useState<string>('')
  const [rncError, setRncError] = useState<string>('')
  const [correoError, setCorreoError] = useState<string>('')
  const [telefonoError, setTelefonoError] = useState<string>('')

  // Estados de ubicación
  const [markerLat, setMarkerLat] = useState<number>(18.4861)
  const [markerLng, setMarkerLng] = useState<number>(-69.9312)
  // Esta etiqueta la usaremos solo para inicializar el MapPicker
  const [mapLabel, setMapLabel] = useState<string>('')
  // Este es el campo "Dirección detallada" que rellena el cliente manualmente
  const [direccionDetallada, setDireccionDetallada] = useState<string>('')

  // Al abrir en modo editar, cargamos una sola vez:
  useEffect(() => {
    if (!open) {
      // resetear todo al cerrar
      setCedula('')
      setRnc('')
      setNombre('')
      setTelefono('')
      setCorreo('')
      setTipoCliente('')
      setMarkerLat(18.4861)
      setMarkerLng(-69.9312)
      setMapLabel('')
      setDireccionDetallada('')
      setCedulaError('')
      setRncError('')
      setCorreoError('')
      setTelefonoError('')
      return
    }

    // Si hay datos por defecto, los ponemos
    if (defaultData) {
      setCedula(defaultData.cedula ?? '')
      setRnc(defaultData.rnc ?? '')
      setNombre(defaultData.nombre ?? '')
      setTelefono(defaultData.numero_telefono ?? '')
      setCorreo(defaultData.correo ?? '')
      setTipoCliente(defaultData.tipo_cliente ?? '')

      setMarkerLat(defaultData.latitude)
      setMarkerLng(defaultData.longitude)
      setDireccionDetallada(defaultData.direccion ?? '')

      // Hacemos reverse-geocode UNA vez para llenar mapLabel
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${defaultData.latitude}&lon=${defaultData.longitude}`
      )
        .then(res => res.json())
        .then(data => {
          setMapLabel(data.display_name as string)
        })
        .catch(() => {
          setMapLabel('')
        })
    }
  }, [open, defaultData])

  // Formateadores y validaciones (igual que antes)
  const cedulaRegex = /^\d{3}-\d{7}-\d{1}$/
  const rncRegex = /^\d{3}-\d{6,7}$/
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRegex = /^\(\d{3}\)-\d{3}-\d{4}$/

  const formatCedulaInput = (v: string): string => {
    const d = v.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 3) return d
    if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3)}`
    return `${d.slice(0, 3)}-${d.slice(3, 10)}-${d.slice(10)}`
  }
  const formatRncInput = (v: string): string => {
    const d = v.replace(/\D/g, '').slice(0, 9)
    if (d.length <= 3) return d
    return `${d.slice(0, 3)}-${d.slice(3)}`
  }
  const formatPhoneInput = (v: string): string => {
    const d = v.replace(/\D/g, '').slice(0, 10)
    if (d.length <= 3) return `(${d}`
    if (d.length <= 6) return `(${d.slice(0, 3)})-${d.slice(3)}`
    return `(${d.slice(0, 3)})-${d.slice(3, 6)}-${d.slice(6)}`
  }

  const handleCedulaChange = (v: string): void => {
    const f = formatCedulaInput(v)
    setCedula(f)
    setCedulaError(cedulaRegex.test(f) ? '' : 'Debe ser XXX-XXXXXXX-X')
  }
  const handleRncChange = (v: string): void => {
    const f = formatRncInput(v)
    setRnc(f)
    setRncError(f === '' || rncRegex.test(f) ? '' : 'Debe ser XXX-XXXXXXX')
  }
  const handleCorreoChange = (v: string): void => {
    setCorreo(v)
    setCorreoError(emailRegex.test(v) ? '' : 'Correo inválido')
  }
  const handleTelefonoChange = (v: string): void => {
    const f = formatPhoneInput(v)
    setTelefono(f)
    setTelefonoError(phoneRegex.test(f) ? '' : 'Debe ser (XXX)-XXX-XXXX')
  }

  const handleSave = (): void => {
    if (
      !cedulaError &&
      !rncError &&
      !correoError &&
      !telefonoError &&
      tipoCliente
    ) {
      onSubmit({
        cedula,
        rnc: rnc || undefined,
        nombre,
        numero_telefono: telefono,
        correo,
        tipo_cliente: tipoCliente,
        latitude: markerLat,
        longitude: markerLng,
        direccion: direccionDetallada.trim() || undefined
      })
    }
  }

  const disabledSave =
    !cedula.trim() ||
    !nombre.trim() ||
    !telefono.trim() ||
    !correo.trim() ||
    !tipoCliente ||
    !!cedulaError ||
    !!rncError ||
    !!correoError ||
    !!telefonoError

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ position: 'relative', pr: 6 }}>
        {defaultData ? 'Editar Cliente' : 'Nuevo Cliente'}
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
          {/* Campos básicos */}
          <TextField
            label="Cédula"
            value={cedula}
            onChange={e => handleCedulaChange(e.target.value)}
            error={!!cedulaError}
            helperText={cedulaError}
            required
            fullWidth
          />
          <TextField
            label="RNC (opcional)"
            value={rnc}
            onChange={e => handleRncChange(e.target.value)}
            error={!!rncError}
            helperText={rncError}
            fullWidth
          />
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
            onChange={e => handleTelefonoChange(e.target.value)}
            error={!!telefonoError}
            helperText={telefonoError}
            required
            fullWidth
          />
          <TextField
            label="Correo electrónico"
            type="email"
            value={correo}
            onChange={e => handleCorreoChange(e.target.value)}
            error={!!correoError}
            helperText={correoError}
            required
            fullWidth
          />
          <TextField
            select
            label="Tipo de cliente"
            value={tipoCliente}
            onChange={e => setTipoCliente(e.target.value as ClienteTipo)}
            error={!tipoCliente}
            helperText={!tipoCliente ? 'Seleccione un tipo' : ''}
            required
            fullWidth
          >
            {['Individual', 'Empresarial', 'Aseguradora', 'Gobierno'].map(t => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>

          {/* Mapa para seleccionar ubicación */}
          <Box mt={2}>
            <MapPicker
              initialPosition={[markerLat, markerLng]}
              initialSearch={mapLabel}
              onChange={(lat, lng, label) => {
                setMarkerLat(lat)
                setMarkerLng(lng)
                if (label) setMapLabel(label)
              }}
            />
          </Box>

          {/* Campo de dirección detallada */}
          <TextField
            label="Dirección detallada"
            value={direccionDetallada}
            onChange={e => setDireccionDetallada(e.target.value)}
            fullWidth
            margin="normal"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2, py: 1 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={disabledSave}
          onClick={handleSave}
        >
          {defaultData ? 'Guardar cambios' : 'Crear Cliente'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
