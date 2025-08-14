'use client'

import React, { useState, useEffect } from 'react'
import {
  TextField,
  Button,
  MenuItem,
  Box
} from '@mui/material'
import 'leaflet/dist/leaflet.css'
import { MapPicker } from '@/components/MapPicker'
import { ModernModal } from '@/components/ModernModal'
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

  const isEdit = Boolean(defaultData)

  return (
    <ModernModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Empleado' : 'Nuevo Empleado'}
      titleIcon="👤"
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
            onClick={handleSave}
            disabled={!tipo || !nombre.trim()}
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
            {isEdit ? 'Guardar cambios' : 'Crear Empleado'}
          </Button>
        </>
      }
    >
      <Box display="flex" flexDirection="column" gap={3} sx={{ paddingTop: '16px' }}>
        <Box display="flex" gap={2}>
          <TextField
            select
            label="Tipo de Empleado"
            value={tipo}
            onChange={e => setTipo(e.target.value as any)}
            required
            fullWidth
            sx={{
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
            }}
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
            sx={{
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
            }}
          />
        </Box>

        <Box display="flex" gap={2}>
          <TextField
            label="Teléfono"
            value={telefono}
            onChange={e => setTelefono(e.target.value)}
            fullWidth
            sx={{
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
            }}
          />

          <TextField
            label="Correo electrónico"
            value={correo}
            onChange={e => setCorreo(e.target.value)}
            fullWidth
            sx={{
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
            }}
          />
        </Box>

        <Box>
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
          multiline
          rows={2}
          sx={{
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
          }}
        />
      </Box>
    </ModernModal>
  )
}