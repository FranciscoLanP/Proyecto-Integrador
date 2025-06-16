'use client'

import React, { useState, useRef, useEffect, JSX } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import CloseIcon from '@mui/icons-material/Close'

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

  return (
    <>
      <Dialog open={open} onClose={tryClose} fullWidth maxWidth="xs">
        <DialogTitle
          sx={{ m: 0, p: 2, fontSize: '1rem', fontWeight: 500 }}
        >
          {isEdit ? 'Editar Marca' : 'Nueva Marca'}
          <IconButton
            aria-label="close"
            onClick={tryClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
            size="small"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2 }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Nombre de la marca"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            error={showError && !value.trim()}
            helperText={
              showError && !value.trim()
                ? 'Este campo es obligatorio'
                : ''
            }
          />
        </DialogContent>
        <DialogActions sx={{ p: 1 }}>
          <Button size="small" onClick={tryClose}>
            Cancelar
          </Button>
          <Button size="small" variant="contained" onClick={handleSubmit}>
            {isEdit ? 'Guardar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmDiscard}
        onClose={() => setConfirmDiscard(false)}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            fontSize: '0.9rem'
          }}
        >
          <WarningAmberIcon color="warning" fontSize="small" />
          ¿Descartar cambios?
        </DialogTitle>
        <DialogActions sx={{ p: 1 }}>
          <Button size="small" onClick={() => setConfirmDiscard(false)}>
            Volver
          </Button>
          <Button size="small" color="error" onClick={confirmAndClose}>
            Descartar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
