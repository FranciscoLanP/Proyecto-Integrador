'use client'

import React, { useEffect, useState } from 'react'
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, IconButton, MenuItem, Box
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { IUsuario, Role } from '../types'

interface Props {
  open: boolean
  defaultData?: IUsuario | null
  onClose: () => void
  onSubmit: (data: Partial<IUsuario>) => void
}

export default function UsuarioModal({
  open, defaultData, onClose, onSubmit
}: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('empleado')
  const [activo, setActivo] = useState(true)

  useEffect(() => {
    if (!open) return
    if (defaultData) {
      setUsername(defaultData.username)
      setPassword('')
      setRole(defaultData.role)
      setActivo(defaultData.activo)
    } else {
      setUsername(''); setPassword(''); setRole('empleado'); setActivo(true)
    }
  }, [open, defaultData])

  const handleSave = () => {
    onSubmit({
      username,
      ...(password && { password }),
      role,
      activo
    })
  }

  const disabled = !username.trim() || (!defaultData && !password)

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ position: 'relative', pr: 6 }}>
        {defaultData ? 'Editar Usuario' : 'Nuevo Usuario'}
        <IconButton onClick={onClose} size="small" sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Usuario"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required fullWidth size="small"
          />

          <TextField
            label={defaultData ? 'Nueva contraseña (opcional)' : 'Contraseña'}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required={!defaultData}
            fullWidth size="small"
          />

          <TextField
            select
            label="Rol"
            value={role}
            onChange={e => setRole(e.target.value as Role)}
            fullWidth size="small"
          >
            {['administrador', 'empleado'].map(r => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Activo"
            value={activo ? 'true' : 'false'}
            onChange={e => setActivo(e.target.value === 'true')}
            fullWidth size="small"
          >
            <MenuItem value="true">Activo</MenuItem>
            <MenuItem value="false">Inactivo</MenuItem>
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={disabled} onClick={handleSave}>
          {defaultData ? 'Guardar cambios' : 'Crear Usuario'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
