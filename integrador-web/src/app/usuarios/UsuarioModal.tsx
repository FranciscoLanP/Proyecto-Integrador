'use client'

import React, { useEffect, useState } from 'react'
import {
  TextField, Button, MenuItem, Box, Typography
} from '@mui/material'
import ModernModal from '@/components/ModernModal/ModernModal'
import { IUsuario, Role } from '../types'
import { useJwtDecode } from '@/hooks/useJwtDecode'

interface Props {
  open: boolean
  defaultData?: IUsuario | null
  onClose: () => void
  onSubmit: (data: Partial<IUsuario>) => void
  currentUserId?: string | null
}

export default function UsuarioModal({
  open, defaultData, onClose, onSubmit, currentUserId
}: Props) {
  const { userId } = useJwtDecode(); // Obtener el ID del usuario actual

  // Determinar si estamos editando a otro usuario
  const isEditingOtherUser = defaultData && defaultData._id !== (currentUserId || userId);
  // Estilo moderno para TextFields con bordes visibles
  const textFieldStyle = {
    '& .MuiInputLabel-root': {
      zIndex: 1,
      backgroundColor: 'transparent',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'rgba(0, 0, 0, 0.23)',
        borderWidth: '2px',
      },
      '&:hover fieldset': {
        borderColor: 'rgba(0, 0, 0, 0.6)',
        borderWidth: '2px',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#1976d2',
        borderWidth: '2px',
      },
    },
  };

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
    // Si estamos editando otro usuario, solo enviamos rol y estado
    if (isEditingOtherUser) {
      onSubmit({
        role,
        activo
      });
    } else {
      // Si es el propio usuario o es un nuevo usuario, enviamos todo
      onSubmit({
        username,
        ...(password && { password }),
        role,
        activo
      });
    }
  }

  const disabled = isEditingOtherUser
    ? false // Para otros usuarios, solo necesitamos que el modal esté abierto
    : (!username.trim() || (!defaultData && !password)); // Para el propio usuario o nuevo usuario

  const getModalTitle = () => {
    if (!defaultData) return 'Nuevo Usuario';
    if (isEditingOtherUser) return `Editar Usuario: ${defaultData.username}`;
    return 'Editar Mi Perfil';
  };

  return (
    <ModernModal
      open={open}
      onClose={onClose}
      title={getModalTitle()}
      maxWidth="sm"
    >
      <Box display="flex" flexDirection="column" gap={3}>
        {/* Mostrar información de restricción si estamos editando otro usuario */}
        {isEditingOtherUser && (
          <Box
            sx={{
              p: 2,
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '8px',
              mb: 1
            }}
          >
            <Typography variant="body2" sx={{ color: '#856404', fontWeight: 'medium' }}>
              ⚠️ <strong>Editando otro usuario:</strong> Solo puedes cambiar el rol y estado.
              Las credenciales (usuario y contraseña) no pueden ser modificadas.
            </Typography>
          </Box>
        )}

        {/* Sección: Credenciales - Solo visible si NO estamos editando otro usuario */}
        {!isEditingOtherUser && (
          <Box>
            <Box sx={{ mb: 2, pb: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              <strong style={{ fontSize: '1.1rem' }}>Credenciales de Acceso</strong>
            </Box>

            <Box display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Usuario"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                fullWidth
                sx={textFieldStyle}
                placeholder="Nombre de usuario único"
                helperText="Nombre de usuario para iniciar sesión"
              />

              <TextField
                label={defaultData ? 'Nueva contraseña (opcional)' : 'Contraseña'}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required={!defaultData}
                fullWidth
                sx={textFieldStyle}
                placeholder="••••••••"
                helperText={defaultData ? "Deja en blanco para mantener la contraseña actual" : "Contraseña para el nuevo usuario"}
              />
            </Box>
          </Box>
        )}

        {/* Información del usuario si estamos editando otro usuario */}
        {isEditingOtherUser && (
          <Box>
            <Box sx={{ mb: 2, pb: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
              <strong style={{ fontSize: '1.1rem' }}>Información del Usuario</strong>
            </Box>
            <Box
              sx={{
                p: 2,
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}
            >
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Usuario:</strong> {defaultData?.username}
              </Typography>
              <Typography variant="body2" sx={{ color: '#6c757d', fontSize: '0.85rem' }}>
                No puedes modificar el nombre de usuario ni la contraseña de otros usuarios.
              </Typography>
            </Box>
          </Box>
        )}

        {/* Sección: Configuración */}
        <Box>
          <Box sx={{ mb: 2, pb: 1, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
            <strong style={{ fontSize: '1.1rem' }}>Configuración del Usuario</strong>
          </Box>

          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              select
              label="Rol"
              value={role}
              onChange={e => setRole(e.target.value as Role)}
              fullWidth
              sx={textFieldStyle}
              helperText="Nivel de acceso del usuario"
            >
              {['administrador', 'empleado'].map(r => (
                <MenuItem key={r} value={r}>
                  {r === 'administrador' ? '👑 Administrador' : '👤 Empleado'}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Estado"
              value={activo ? 'true' : 'false'}
              onChange={e => setActivo(e.target.value === 'true')}
              fullWidth
              sx={textFieldStyle}
              helperText="Estado actual del usuario"
            >
              <MenuItem value="true">✅ Activo</MenuItem>
              <MenuItem value="false">❌ Inactivo</MenuItem>
            </TextField>
          </Box>
        </Box>

        {/* Botones de acción */}
        <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderColor: 'rgba(0,0,0,0.5)',
              color: 'rgba(0,0,0,0.7)',
              borderWidth: '1px',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.05)',
                borderColor: 'rgba(0,0,0,0.7)',
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={disabled}
            onClick={handleSave}
            sx={{
              background: disabled
                ? 'rgba(0,0,0,0.12)'
                : 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              color: disabled ? 'rgba(0,0,0,0.26)' : 'white',
              fontWeight: 'bold',
              '&:hover': !disabled ? {
                background: 'linear-gradient(45deg, #1976D2 30%, #0288D1 90%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)',
              } : {},
              transition: 'all 0.2s ease-in-out',
            }}
          >
            {!defaultData
              ? 'Crear Usuario'
              : isEditingOtherUser
                ? 'Actualizar Permisos'
                : 'Guardar cambios'
            }
          </Button>
        </Box>
      </Box>
    </ModernModal>
  )
}
