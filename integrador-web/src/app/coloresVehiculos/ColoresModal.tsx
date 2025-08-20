'use client'

import React, { useState, useRef, useEffect, JSX } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import { ModernModal } from '../../components/ModernModal'

import type { IColoresDatos } from '../types'

interface Props {
  open: boolean
  defaultData?: IColoresDatos
  existingColores?: IColoresDatos[]
  onClose: () => void
  onSubmit: (data: { nombre_color: string }) => void
}

export default function ColoresDatosModal({
  open,
  defaultData,
  existingColores = [],
  onClose,
  onSubmit
}: Props): JSX.Element {
  const [value, setValue] = useState<string>('')
  const [showError, setShowError] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const initialRef = useRef<string>('')
  const [confirmDiscard, setConfirmDiscard] = useState<boolean>(false)

  useEffect(() => {
    if (open) {
      const init = defaultData?.nombre_color ?? ''
      setValue(init)
      initialRef.current = init
      setShowError(false)
      setErrorMessage('')
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
    const trimmedValue = value.trim()

    if (!trimmedValue) {
      setShowError(true)
      setErrorMessage('Este campo es obligatorio')
      return
    }

    const isDuplicate = existingColores.some(color =>
      color.nombre_color.toLowerCase() === trimmedValue.toLowerCase() &&
      color._id !== defaultData?._id
    )

    if (isDuplicate) {
      setShowError(true)
      setErrorMessage('Ya existe un color con este nombre')
      return
    }

    onSubmit({ nombre_color: trimmedValue })
  }

  const handleChange = (newVal: string): void => {
    setValue(newVal)
    if (showError && newVal.trim()) {
      setShowError(false)
      setErrorMessage('')
    }
  }

  const isEdit = Boolean(defaultData)

  return (
    <>
      <ModernModal
        open={open}
        onClose={tryClose}
        title={isEdit ? 'Editar Color' : 'Nuevo Color'}
        titleIcon="🎨"
        maxWidth="xs"
        actions={
          <>
            <Button
              size="small"
              onClick={tryClose}
              sx={{
                color: 'text.secondary',
                '&:hover': { backgroundColor: 'action.hover' }
              }}
            >
              Cancelar
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleSubmit}
              sx={{
                background: 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)',
                boxShadow: '0 3px 10px rgba(76, 175, 80, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #45a049 30%, #388e3c 90%)',
                  boxShadow: '0 5px 15px rgba(76, 175, 80, 0.4)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              {isEdit ? 'Guardar' : 'Crear'}
            </Button>
          </>
        }
      >
        <TextField
          autoFocus
          fullWidth
          size="small"
          label="Nombre del color"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          error={showError}
          helperText={showError ? errorMessage : ''}
          sx={{
            marginTop: '8px',
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
      </ModernModal>

      <Dialog
        open={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
          }
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: '0.9rem',
            background: 'linear-gradient(135deg, #fff3e0 0%, #ffcc02 100%)',
            color: '#e65100'
          }}
        >
          <WarningAmberIcon color="warning" fontSize="small" />
          ¿Descartar cambios?
        </DialogTitle>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            size="small"
            onClick={() => setConfirmDiscard(false)}
            sx={{ color: 'text.secondary' }}
          >
            Volver
          </Button>
          <Button
            size="small"
            color="error"
            variant="contained"
            onClick={confirmAndClose}
            sx={{
              background: 'linear-gradient(45deg, #f44336 30%, #d32f2f 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #d32f2f 30%, #c62828 90%)',
                transform: 'translateY(-1px)'
              }
            }}
          >
            Descartar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
