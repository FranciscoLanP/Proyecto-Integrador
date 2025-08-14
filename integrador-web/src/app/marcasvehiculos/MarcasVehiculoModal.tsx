'use client'

import React, { useState, useRef, useEffect, JSX } from 'react'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { ModernModal } from '@/components/ModernModal'

import type { IMarcaVehiculo } from '../types'

interface Props {
  open: boolean
  defaultData?: IMarcaVehiculo
  onClose: () => void
  onSubmit: (data: { nombre_marca: string }) => void
}

export default function MarcasVehiculoModal({
  open,
  defaultData,
  onClose,
  onSubmit
}: Props): JSX.Element {
  const [value, setValue] = useState<string>('')
  const [showError, setShowError] = useState<boolean>(false)
  const initialRef = useRef<string>('')
  const [confirmDiscard, setConfirmDiscard] = useState<boolean>(false)

  useEffect(() => {
    if (open) {
      const init = defaultData?.nombre_marca ?? ''
      setValue(init)
      initialRef.current = init
      setShowError(false)
    }
  }, [open, defaultData])

  const isDirty = (): boolean =>
    value.trim() !== initialRef.current

  const tryClose = (): void => {
    if (isDirty()) setConfirmDiscard(true)
    else onClose()
  }

  const confirmAndClose = (): void => {
    setConfirmDiscard(false)
    onClose()
  }

  const handleSubmit = (): void => {
    if (!value.trim()) {
      setShowError(true)
      return
    }
    onSubmit({ nombre_marca: value.trim() })
  }

  const handleChange = (newVal: string): void => {
    setValue(newVal)
    if (showError && newVal.trim()) {
      setShowError(false)
    }
  }

  const isEdit = Boolean(defaultData)

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

  return (
    <>
      <ModernModal
        open={open}
        onClose={tryClose}
        title={isEdit ? 'Editar Marca' : 'Nueva Marca'}
      >
        <Box display="flex" flexDirection="column" gap={3}>
          {/* Información de la Marca */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2, color: 'primary.dark' }}>
              Información de la Marca
            </Typography>
            <TextField
              autoFocus
              fullWidth
              label="Nombre de la marca"
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              error={showError && !value.trim()}
              helperText={
                showError && !value.trim()
                  ? 'Este campo es obligatorio'
                  : ''
              }
              sx={textFieldStyle}
              placeholder="Ingresa el nombre de la marca..."
            />
          </Box>

          {/* Botones de Acción */}
          <Box
            display="flex"
            justifyContent="flex-end"
            gap={2}
            pt={2}
            borderTop="1px solid rgba(0,0,0,0.1)"
          >
            <Button
              onClick={tryClose}
              sx={{
                borderRadius: '25px',
                minWidth: '100px'
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                borderRadius: '25px',
                minWidth: '100px',
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                }
              }}
            >
              {isEdit ? 'Guardar' : 'Crear'}
            </Button>
          </Box>
        </Box>
      </ModernModal>

      {/* Modal de Confirmación para Descartar Cambios */}
      <ModernModal
        open={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        title="¿Descartar cambios?"
      >
        <Box display="flex" flexDirection="column" gap={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <WarningAmberIcon
              color="warning"
              sx={{ fontSize: '2rem' }}
            />
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Tienes cambios sin guardar. ¿Estás seguro de que quieres descartarlos?
            </Typography>
          </Box>

          {/* Botones de Acción */}
          <Box
            display="flex"
            justifyContent="flex-end"
            gap={2}
            pt={2}
            borderTop="1px solid rgba(0,0,0,0.1)"
          >
            <Button
              onClick={() => setConfirmDiscard(false)}
              sx={{
                borderRadius: '25px',
                minWidth: '100px'
              }}
            >
              Volver
            </Button>
            <Button
              color="error"
              variant="contained"
              onClick={confirmAndClose}
              sx={{
                borderRadius: '25px',
                minWidth: '100px',
                background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #c62828 0%, #b71c1c 100%)',
                }
              }}
            >
              Descartar
            </Button>
          </Box>
        </Box>
      </ModernModal>
    </>
  )
}
