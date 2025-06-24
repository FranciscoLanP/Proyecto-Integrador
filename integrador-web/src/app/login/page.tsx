
'use client'

import React, { useState, ChangeEvent } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem
} from '@mui/material'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole]         = useState<'administrador'|'empleado'>('empleado')
  const [error, setError]       = useState('')

  const handleSubmit = () => {
    // aquí deberías llamar a tu API real de login,
    // validar usuario/contraseña y devolver el rol.
    // Para demo asumimos éxito:
    if (!username || !password) {
      setError('Usuario y contraseña son obligatorios')
      return
    }
    // TODO: fetch('/api/auth/login', { ... })
    login(username, role)
  }

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}
    >
      <Paper elevation={4} sx={{ p: 4, width: 360 }}>
        <Typography variant="h5" mb={2}>Iniciar Sesión</Typography>
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Usuario"
            value={username}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            fullWidth
          />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />
          <TextField
            select
            label="Rol"
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            fullWidth
          >
            <MenuItem value="administrador">Administrador</MenuItem>
            <MenuItem value="empleado">Empleado</MenuItem>
          </TextField>
          <Button variant="contained" onClick={handleSubmit}>
            Entrar
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}
