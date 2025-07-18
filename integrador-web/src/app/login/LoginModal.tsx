'use client';

import React, { useState, ChangeEvent, FormEvent, JSX } from 'react';
import { Box, Paper, Typography, TextField, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { loginRequest } from '../../services/authService';
import { useNotification } from '../../components/utils/NotificationProvider';

export default function LoginPage(): JSX.Element {
  const { login } = useAuth();
  const { notify } = useNotification();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Usuario y contraseña son obligatorios');
      return;
    }
    try {
      const { token, usuario } = await loginRequest({ username, password });
      login(usuario.username, usuario.role, token);
      notify('Sesión iniciada correctamente', 'success');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
      notify('Error al iniciar sesión', 'error');
    }
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      {/* Decorativos */}
      <Box
        sx={{
          position: 'absolute',
          top: -60,
          left: -60,
          width: 200,
          height: 200,
          bgcolor: 'primary.main',
          borderRadius: '50%',
          opacity: 0.15,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: -80,
          right: -80,
          width: 240,
          height: 240,
          bgcolor: 'secondary.main',
          borderRadius: '50%',
          opacity: 0.15,
        }}
      />

      {/* Formulario */}
      <Paper
        elevation={8}
        sx={{
          position: 'relative',
          zIndex: 1,
          p: 4,
          width: 360,
          borderRadius: 3,
          boxShadow: theme => theme.shadows[12],
        }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Bienvenido
        </Typography>
        {error && (
          <Typography color="error" mb={2} align="center">
            {error}
          </Typography>
        )}
        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Usuario"
            value={username}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            fullWidth
          />
          <Button type="submit" variant="contained" size="large" sx={{ borderRadius: 2, mt: 1 }}>
            Entrar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
