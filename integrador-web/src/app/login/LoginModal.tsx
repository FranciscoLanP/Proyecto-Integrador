'use client';

import React, { useState, ChangeEvent } from 'react';
import { Box, Paper, Typography, TextField, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { loginRequest } from '../../services/authService';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!username || !password) {
      setError('Usuario y contraseña son obligatorios');
      return;
    }
    try {
      const { token, usuario } = await loginRequest({ username, password });
      login(usuario.username, usuario.role, token);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  };

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
        <Typography variant="h5" mb={2}>
          Iniciar Sesión
        </Typography>
        {error && (
          <Typography color="error" mb={2}>
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
            onChange={e => setPassword(e.target.value)}
            fullWidth
          />
          <Button variant="contained" onClick={handleSubmit}>
            Entrar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
