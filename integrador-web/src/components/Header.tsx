'use client';

import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Person as PersonIcon
} from '@mui/icons-material';
import { useAuth } from '../app/context/AuthContext';
import { useTheme } from '../app/context/ThemeContext';
import UserProfileModal from './UserProfileModal';

export default function Header() {
  const { auth } = useAuth();
  const { currentTheme } = useTheme();
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const getInitials = (username: string): string => {
    if (!username) return 'U';

    const parts = username.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  const handleAvatarClick = () => {
    setProfileModalOpen(true);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          left: 240,
          width: `calc(100% - 240px)`,
          background: currentTheme.headerGradient,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 'bold',
              letterSpacing: '0.5px'
            }}
          >
            JHS Auto Servicios
          </Typography>

          <Box display="flex" alignItems="center" gap={2}>
            {/* Avatar del usuario */}
            <Tooltip title="Ver perfil">
              <IconButton
                onClick={handleAvatarClick}
                sx={{
                  p: 0,
                  '&:hover': {
                    '& .MuiAvatar-root': {
                      transform: 'scale(1.1)',
                      boxShadow: '0 0 15px rgba(255,255,255,0.3)'
                    }
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    background: currentTheme.gradient,
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    border: '2px solid rgba(255,255,255,0.2)',
                    cursor: 'pointer'
                  }}
                >
                  {auth ? getInitials(auth.username) : 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>

            {/* Información del usuario (opcional, se puede quitar si quieres solo las iniciales) */}
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  textTransform: 'capitalize',
                  fontSize: '0.8rem'
                }}
              >
                {auth?.role || 'Usuario'}
              </Typography>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Modal de perfil de usuario */}
      <UserProfileModal
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
}
