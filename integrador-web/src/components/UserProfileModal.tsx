'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    Avatar,
    Divider,
    IconButton,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Grid
} from '@mui/material';
import {
    Close as CloseIcon,
    Edit as EditIcon,
    Save as SaveIcon,
    ExitToApp as LogoutIcon,
    Person as PersonIcon,
    Lock as LockIcon,
    Palette as PaletteIcon
} from '@mui/icons-material';
import { useAuth } from '../app/context/AuthContext';
import { useNotification } from './utils/NotificationProvider';
import { useTheme } from '../app/context/ThemeContext';

interface UserProfileModalProps {
    open: boolean;
    onClose: () => void;
}

interface UserUpdatePayload {
    username?: string;
    password?: string;
    currentPassword: string;
}

export default function UserProfileModal({ open, onClose }: UserProfileModalProps) {
    const { auth, logout, updateAuth } = useAuth();
    const { notify } = useNotification();
    const { currentTheme, setTheme, themes } = useTheme();

    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (auth) {
            setFormData(prev => ({
                ...prev,
                username: auth.username
            }));
        }
    }, [auth]);

    const handleClose = () => {
        setEditMode(false);
        setFormData({
            username: auth?.username || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setErrors({});
        onClose();
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.currentPassword) {
            newErrors.currentPassword = 'La contraseña actual es requerida';
        }

        if (formData.username.trim().length < 3) {
            newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
        }

        if (formData.newPassword && formData.newPassword.length < 6) {
            newErrors.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres';
        }

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setLoading(true);
        try {
            const payload: any = {
                currentPassword: formData.currentPassword
            };

            // Solo incluir campos que han cambiado
            if (formData.username !== auth?.username) {
                payload.username = formData.username;
            }

            if (formData.newPassword) {
                payload.password = formData.newPassword;
            }

            // Usar la función real de actualización
            const { updateProfileRequest } = await import('../services/authService');
            const response = await updateProfileRequest(payload);

            notify('Perfil actualizado correctamente', 'success');
            setEditMode(false);

            // Reset password fields
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));

            // Si se cambió el username, actualizar el contexto
            if (payload.username) {
                updateAuth(payload.username);
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Error al actualizar el perfil';
            notify(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            notify('Sesión cerrada correctamente', 'success');
            handleClose();
        } catch (error) {
            notify('Error al cerrar sesión', 'error');
        }
    };

    const getInitials = (username: string): string => {
        const parts = username.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return username.substring(0, 2).toUpperCase();
    };

    if (!auth) return null;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                }
            }}
        >
            <DialogTitle sx={{
                pb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                m: 0
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PersonIcon />
                    <Typography variant="h6">Perfil de Usuario</Typography>
                </Box>
                <IconButton onClick={handleClose} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {/* Avatar y info básica */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                fontSize: '1.5rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                            }}
                        >
                            {getInitials(auth.username)}
                        </Avatar>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                                {auth.username}
                            </Typography>
                            <Typography variant="body1" sx={{ color: '#6b7280', textTransform: 'capitalize' }}>
                                {auth.role}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider />

                    {/* Campos de edición */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EditIcon fontSize="small" />
                            Información de la Cuenta
                        </Typography>

                        <TextField
                            label="Nombre de Usuario"
                            value={formData.username}
                            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                            disabled={!editMode}
                            error={!!errors.username}
                            helperText={errors.username}
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: editMode ? 'white' : 'rgba(0,0,0,0.05)'
                                }
                            }}
                        />

                        <TextField
                            label="Contraseña Actual"
                            type="password"
                            value={formData.currentPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            disabled={!editMode}
                            error={!!errors.currentPassword}
                            helperText={errors.currentPassword || 'Requerida para cualquier cambio'}
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: editMode ? 'white' : 'rgba(0,0,0,0.05)'
                                }
                            }}
                        />

                        {editMode && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
                                    Cambiar contraseña (opcional):
                                </Typography>

                                <TextField
                                    label="Nueva Contraseña"
                                    type="password"
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                                    error={!!errors.newPassword}
                                    helperText={errors.newPassword || 'Mínimo 6 caracteres'}
                                    fullWidth
                                    sx={{ backgroundColor: 'white' }}
                                />

                                <TextField
                                    label="Confirmar Nueva Contraseña"
                                    type="password"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    error={!!errors.confirmPassword}
                                    helperText={errors.confirmPassword}
                                    fullWidth
                                    disabled={!formData.newPassword}
                                    sx={{ backgroundColor: 'white' }}
                                />
                            </>
                        )}

                        {/* Sección de Temas */}
                        <Divider sx={{ my: 3 }} />
                        <Box sx={{ mb: 2 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    mb: 2,
                                    color: '#374151',
                                    fontWeight: 'bold'
                                }}
                            >
                                <PaletteIcon sx={{ color: currentTheme.colors.primary }} />
                                Personalización
                            </Typography>

                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel>Tema de la Aplicación</InputLabel>
                                <Select
                                    value={currentTheme.id}
                                    onChange={(e) => setTheme(e.target.value)}
                                    label="Tema de la Aplicación"
                                >
                                    {themes.map((theme) => (
                                        <MenuItem key={theme.id} value={theme.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box
                                                    sx={{
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: '50%',
                                                        background: theme.gradient,
                                                        border: '2px solid rgba(0,0,0,0.1)'
                                                    }}
                                                />
                                                {theme.name}
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Vista previa del tema actual */}
                            <Box sx={{
                                p: 2,
                                borderRadius: '12px',
                                background: currentTheme.cardGradient,
                                border: `1px solid ${currentTheme.colors.primary}20`
                            }}>
                                <Typography variant="body2" sx={{ color: '#6b7280', mb: 1 }}>
                                    Vista previa del tema:
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    <Chip
                                        label="Primario"
                                        sx={{
                                            background: currentTheme.gradient,
                                            color: 'white',
                                            fontSize: '0.7rem'
                                        }}
                                    />
                                    <Chip
                                        label="Secundario"
                                        sx={{
                                            background: currentTheme.colors.secondary,
                                            color: 'white',
                                            fontSize: '0.7rem'
                                        }}
                                    />
                                    <Chip
                                        label="Acento"
                                        sx={{
                                            background: currentTheme.colors.accent,
                                            color: 'white',
                                            fontSize: '0.7rem'
                                        }}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        {!editMode && (
                            <Alert severity="info" sx={{ mt: 1 }}>
                                Haz clic en "Editar Perfil" para modificar tu información
                            </Alert>
                        )}
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, gap: 1 }}>
                <Button
                    onClick={handleLogout}
                    startIcon={<LogoutIcon />}
                    color="error"
                    variant="outlined"
                    sx={{ mr: 'auto' }}
                >
                    Cerrar Sesión
                </Button>

                {!editMode ? (
                    <Button
                        onClick={() => setEditMode(true)}
                        startIcon={<EditIcon />}
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #5a67d8 30%, #6b46c1 90%)',
                            }
                        }}
                    >
                        Editar Perfil
                    </Button>
                ) : (
                    <>
                        <Button
                            onClick={() => setEditMode(false)}
                            variant="outlined"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleSave}
                            startIcon={loading ? <CircularProgress size={16} /> : <SaveIcon />}
                            disabled={loading}
                            variant="contained"
                            sx={{
                                background: 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #43A047 30%, #388E3C 90%)',
                                }
                            }}
                        >
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
}
