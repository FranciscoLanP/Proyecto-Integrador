'use client'

import React, { useState, useEffect, useRef, JSX } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import CloseIcon from '@mui/icons-material/Close'

import type { IBarrio, ICliente } from '../types'

interface Props {
  open: boolean
  defaultData?: ICliente
  barrios: IBarrio[]
  onClose: () => void
  onSubmit: (data: Partial<ICliente>) => void
}

export default function ClientModal({
  open,
  defaultData,
  barrios,
  onClose,
  onSubmit
}: Props): JSX.Element {
  const [cedula, setCedula] = useState<string>('')
  const [rnc, setRnc] = useState<string>('')
  const [nombre, setNombre] = useState<string>('')
  const [telefono, setTelefono] = useState<string>('')
  const [correo, setCorreo] = useState<string>('')
  const [barrioId, setBarrioId] = useState<string>('')

  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [confirmDiscard, setConfirmDiscard] = useState<boolean>(false)
  const initialRef = useRef<Partial<ICliente>>({})

  // Format helpers (igual que antes)…
  const formatCedula = (v: string) => { /*…*/ return v }
  const formatRnc = (v: string) => { /*…*/ return v }
  const formatPhone = (v: string) => { /*…*/ return v }

  // Validaciones
  const cedulaValida = /^\d{3}-\d{7}-\d$/.test(cedula)
  const rncValido = rnc === '' || /^\d{3}-\d{6}$/.test(rnc)
  const phoneValido = /^\(\d{3}\)-\d{3}-\d{4}$/.test(telefono)
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
  const barrioValido = barrioId !== ''
  const hayErrores =
    !cedulaValida ||
    !rncValido ||
    !phoneValido ||
    !emailValido ||
    !nombre.trim() ||
    !barrioValido

  useEffect(() => {
    if (open) {
      const d: Partial<ICliente> = defaultData ?? {}
      setCedula(d.cedula ?? '')
      setRnc(d.rnc ?? '')
      setNombre(d.nombre ?? '')
      setTelefono(d.numero_telefono ?? '')
      setCorreo(d.correo ?? '')
      setBarrioId(d.id_barrio ?? '')
      initialRef.current = { ...d }
      setTouched({})
    }
  }, [open, defaultData])

  const isDirty = (): boolean => {
    const init = initialRef.current
    return (
      cedula !== init.cedula ||
      rnc !== init.rnc ||
      nombre !== init.nombre ||
      telefono !== init.numero_telefono ||
      correo !== init.correo ||
      barrioId !== init.id_barrio
    )
  }

  const tryClose = (): void => {
    if (isDirty()) setConfirmDiscard(true)
    else onClose()
  }
  const confirmAndClose = (): void => {
    setConfirmDiscard(false)
    onClose()
  }

  const handleSubmit = (): void => {
    onSubmit({
      cedula,
      rnc: rnc || undefined,
      nombre,
      numero_telefono: telefono,
      correo,
      id_barrio: barrioId
    })
  }

  const isEdit = Boolean(defaultData)

  return (
    <>
      <Dialog open={open} onClose={tryClose} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{ m: 0, p: 2, fontSize: '1rem', fontWeight: 500 }}
        >
          {isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
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
          <Box display="flex" flexDirection="column" gap={1}>
            <TextField
              size="small"
              label="Cédula"
              value={cedula}
              onChange={(e) =>
                setCedula(formatCedula(e.target.value))
              }
              onBlur={() =>
                setTouched((t) => ({ ...t, cedula: true }))
              }
              required
              error={touched.cedula === true && !cedulaValida}
              helperText={
                touched.cedula && !cedulaValida
                  ? 'Formato 000-0000000-0'
                  : ''
              }
            />
            <TextField
              size="small"
              label="RNC (opcional)"
              value={rnc}
              onChange={(e) =>
                setRnc(formatRnc(e.target.value))
              }
              onBlur={() =>
                setTouched((t) => ({ ...t, rnc: true }))
              }
              error={touched.rnc === true && !rncValido}
              helperText={
                touched.rnc && !rncValido
                  ? 'Formato 000-000000'
                  : ''
              }
            />
            <TextField
              size="small"
              label="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onBlur={() =>
                setTouched((t) => ({ ...t, nombre: true }))
              }
              required
            />
            <TextField
              size="small"
              label="Teléfono"
              value={telefono}
              onChange={(e) =>
                setTelefono(formatPhone(e.target.value))
              }
              onBlur={() =>
                setTouched((t) => ({ ...t, telefono: true }))
              }
              required
              error={touched.telefono && !phoneValido}
              helperText={
                touched.telefono && !phoneValido
                  ? 'Formato (829)-123-4567'
                  : ''
              }
            />
            <TextField
              size="small"
              label="Correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              onBlur={() =>
                setTouched((t) => ({ ...t, correo: true }))
              }
              required
              error={touched.correo && !emailValido}
              helperText={
                touched.correo && !emailValido
                  ? 'Email inválido'
                  : ''
              }
            />
            <TextField
              select
              size="small"
              label="Barrio"
              value={barrioId}
              onChange={(e) =>
                setBarrioId(e.target.value)
              }
              onBlur={() =>
                setTouched((t) => ({ ...t, barrioId: true }))
              }
              required
              error={touched.barrioId && !barrioValido}
            >
              {barrios.map((b) => (
                <MenuItem key={b._id} value={b._id}>
                  {b.nombre_barrio}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 1 }}>
          <Button size="small" onClick={tryClose}>
            Cancelar
          </Button>
          <Button
            size="small"
            variant="contained"
            disabled={hayErrores}
            onClick={handleSubmit}
          >
            {isEdit ? 'Guardar' : 'Crear Cliente'}
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
