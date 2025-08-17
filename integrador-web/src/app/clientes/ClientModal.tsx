'use client'

import React, { useState, useEffect } from 'react'
import {
  TextField,
  Button,
  MenuItem,
  Box
} from '@mui/material'
import type { ICliente, ClienteTipo } from '../types'
import 'leaflet/dist/leaflet.css'
import { MapPicker } from '@/components/MapPicker'
import { ModernModal } from '@/components/ModernModal'

export type ClienteConUbicacion = Partial<ICliente> & {
  latitude: number
  longitude: number
  direccion?: string
  ubicacionLabel?: string
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
  const [cedula, setCedula] = useState<string>('')
  const [rnc, setRnc] = useState<string>('')
  const [nombre, setNombre] = useState<string>('')
  const [telefono, setTelefono] = useState<string>('')
  const [correo, setCorreo] = useState<string>('')
  const [tipoCliente, setTipoCliente] = useState<ClienteTipo | ''>('')

  const [cedulaError, setCedulaError] = useState<string>('')
  const [rncError, setRncError] = useState<string>('')
  const [correoError, setCorreoError] = useState<string>('')
  const [telefonoError, setTelefonoError] = useState<string>('')
  const [tipoClienteError, setTipoClienteError] = useState<string>('')
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false)

  const [markerLat, setMarkerLat] = useState<number>(18.4861)
  const [markerLng, setMarkerLng] = useState<number>(-69.9312)
  const [mapLabel, setMapLabel] = useState<string>('')
  const [direccionDetallada, setDireccionDetallada] = useState<string>('')

  useEffect(() => {
    if (!open) {
      setCedula(''); setRnc(''); setNombre('')
      setTelefono(''); setCorreo(''); setTipoCliente('')
      setMarkerLat(18.4861); setMarkerLng(-69.9312)
      setMapLabel(''); setDireccionDetallada('')
      setCedulaError(''); setRncError(''); setCorreoError(''); setTelefonoError('')
      setTipoClienteError(''); setFormSubmitted(false)
      return
    }
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
      if (defaultData.ubicacionLabel) {
        setMapLabel(defaultData.ubicacionLabel)
      } else {
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${defaultData.latitude}&lon=${defaultData.longitude}`
        )
          .then(r => r.json())
          .then(d => setMapLabel(d.display_name as string))
          .catch(() => setMapLabel(''))
      }
      setCedulaError(''); setRncError(''); setCorreoError(''); setTelefonoError('')
      setTipoClienteError(''); setFormSubmitted(false)
    }
  }, [open, defaultData])
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

  const handleTipoClienteChange = (value: string): void => {
    setTipoCliente(value as ClienteTipo);
    setTipoClienteError(''); // Limpiar error al seleccionar
  }

  const handleTipoClienteBlur = (): void => {
    // Solo mostrar error si el formulario ha sido enviado o el usuario salió del campo sin seleccionar
    if (formSubmitted && !tipoCliente) {
      setTipoClienteError('Debe seleccionar un tipo de cliente');
    }
  }

  const handleSave = (): void => {
    setFormSubmitted(true);

    // Validar tipo de cliente al enviar
    if (!tipoCliente) {
      setTipoClienteError('Debe seleccionar un tipo de cliente');
    }

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
        direccion: direccionDetallada.trim() || undefined,
        ubicacionLabel: mapLabel || undefined
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

  // Estilo base para los TextFields
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      '&:hover': {
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'primary.main',
          borderWidth: '2px'
        }
      },
      '&.Mui-focused': {
        '& .MuiOutlinedInput-notchedOutline': {
          borderWidth: '2px',
          boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.1)'
        }
      }
    },
    '& .MuiInputLabel-root': {
      zIndex: 10,
      '&.Mui-focused': {
        zIndex: 10
      }
    },
    '& .MuiInputLabel-shrink': {
      zIndex: 10,
      transform: 'translate(14px, -9px) scale(0.75)'
    }
  }

  const isEdit = Boolean(defaultData)

  return (
    <ModernModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
      titleIcon="👥"
      maxWidth="md"
      actions={
        <>
          <Button
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              '&:hover': { backgroundColor: 'action.hover' }
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={disabledSave}
            onClick={handleSave}
            sx={{
              background: 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)',
              boxShadow: '0 3px 10px rgba(76, 175, 80, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #45a049 30%, #388e3c 90%)',
                boxShadow: '0 5px 15px rgba(76, 175, 80, 0.4)',
                transform: 'translateY(-1px)'
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)',
                boxShadow: 'none'
              },
              transition: 'all 0.2s ease'
            }}
          >
            {isEdit ? 'Guardar cambios' : 'Crear Cliente'}
          </Button>
        </>
      }
    >
      <Box display="flex" flexDirection="column" gap={3} sx={{ paddingTop: '16px' }}>
        {/* Fila 1: Cédula y RNC */}
        <Box display="flex" gap={2}>
          <TextField
            label="Cédula"
            value={cedula}
            onChange={e => handleCedulaChange(e.target.value)}
            error={!!cedulaError}
            helperText={cedulaError}
            required
            fullWidth
            sx={textFieldStyle}
            autoComplete="off"
            name="cliente-cedula"
            id="cliente-cedula-input"
          />
          <TextField
            label="RNC (opcional)"
            value={rnc}
            onChange={e => handleRncChange(e.target.value)}
            error={!!rncError}
            helperText={rncError}
            fullWidth
            sx={textFieldStyle}
            autoComplete="off"
            name="cliente-rnc"
            id="cliente-rnc-input"
          />
        </Box>

        {/* Fila 2: Nombre completo */}
        <TextField
          label="Nombre completo"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
          fullWidth
          sx={textFieldStyle}
          autoComplete="off"
          name="cliente-nombre"
          id="cliente-nombre-input"
        />

        {/* Fila 3: Teléfono y Correo */}
        <Box display="flex" gap={2}>
          <TextField
            label="Teléfono"
            value={telefono}
            onChange={e => handleTelefonoChange(e.target.value)}
            error={!!telefonoError}
            helperText={telefonoError}
            required
            fullWidth
            sx={textFieldStyle}
            autoComplete="off"
            name="cliente-telefono"
            id="cliente-telefono-input"
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
            sx={textFieldStyle}
            autoComplete="off"
            name="cliente-correo"
            id="cliente-correo-input"
          />
        </Box>

        {/* Fila 4: Tipo de cliente */}
        <TextField
          select
          label="Tipo de cliente"
          value={tipoCliente}
          onChange={e => handleTipoClienteChange(e.target.value)}
          onBlur={handleTipoClienteBlur}
          error={!!tipoClienteError}
          helperText={tipoClienteError}
          required
          fullWidth
          sx={textFieldStyle}
        >
          {['Individual', 'Empresarial', 'Aseguradora', 'Gobierno'].map(t => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>

        {/* Mapa */}
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

        {/* Dirección detallada */}
        <TextField
          label="Dirección detallada"
          placeholder="calle/casa #"
          value={direccionDetallada}
          onChange={e => setDireccionDetallada(e.target.value)}
          fullWidth
          multiline
          rows={2}
          sx={textFieldStyle}
        />
      </Box>
    </ModernModal>
  )
}
