'use client';

import React, { useState, JSX } from 'react';
import {
  Box, IconButton, CircularProgress, Chip, Dialog, DialogTitle, DialogActions, Button
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import { useCrud } from '../../hooks/useCrud';
import { useNotification } from '../../components/utils/NotificationProvider';
import type { IUsuario } from '../types';
import UsuarioModal from './UsuarioModal';
import RoleGuard from '@/components/RoleGuard';
import ModernTable from '@/components/ModernTable/ModernTable';
import { useModernTable } from '@/components/ModernTable/useModernTable';
import { useHydration } from '@/hooks/useHydration';
import { useClientTheme } from '@/hooks/useClientTheme';
import { useJwtDecode } from '@/hooks/useJwtDecode';

export default function UsuariosPage(): JSX.Element {
  return (
    <RoleGuard allowedRoles={['administrador']}>
      <UsuariosPageContent />
    </RoleGuard>
  );
}

function UsuariosPageContent(): JSX.Element {
  const { notify } = useNotification();
  const { currentTheme, isHydrated } = useClientTheme();
  const isHydratedCustom = useHydration();
  const { userId } = useJwtDecode(); 

  const { allQuery, createM, updateM, deleteM } = useCrud<IUsuario>('usuarios');
  const usuarios = allQuery.data || [];

  const [openForm, setOpenForm] = useState<boolean>(false);
  const [editData, setEditData] = useState<IUsuario | null>(null);
  const [confirmDel, setConfirmDel] = useState<boolean>(false);
  const [toDelete, setToDelete] = useState<IUsuario | null>(null);

  const {
    filteredData,
    paginatedData,
    searchQuery,
    page,
    rowsPerPage,
    handleSearchChange,
    handlePageChange,
    handleRowsPerPageChange
  } = useModernTable({
    data: usuarios,
    searchFields: ['username', 'role'], 
    initialRowsPerPage: 10
  });

  const onSearchChange = (value: string) => {
    handleSearchChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>);
  };

  const onPageChange = (newPage: number) => {
    handlePageChange(null, newPage);
  };

  const onRowsPerPageChange = (newRowsPerPage: number) => {
    handleRowsPerPageChange({ target: { value: newRowsPerPage.toString() } } as React.ChangeEvent<HTMLInputElement>);
  };

  if (allQuery.isLoading) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <CircularProgress size={40} />
          </div>
        </div>
      </div>
    );
  }

  if (allQuery.error) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="text-red-500">{allQuery.error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  const openNew = () => { setEditData(null); setOpenForm(true); };
  const openEdit = (u: IUsuario) => { setEditData(u); setOpenForm(true); };
  const closeForm = () => setOpenForm(false);

  const onSubmit = (data: Partial<IUsuario> & { password?: string }) => {
    if (editData) {
      updateM.mutate(
        { id: editData._id, data },
        {
          onSuccess: () => notify('Usuario actualizado correctamente', 'success'),
          onError: () => notify('Error al actualizar usuario', 'error'),
        }
      );
    } else {
      createM.mutate(
        data as any,
        {
          onSuccess: () => notify('Usuario creado correctamente', 'success'),
          onError: () => notify('Error al crear usuario', 'error'),
        }
      );
    }
    closeForm();
  };

  const askDelete = (u: IUsuario) => {
    setToDelete(u);
    setConfirmDel(true);
  };

  const confirmDelete = () => {
    if (toDelete) {
      deleteM.mutate(
        toDelete._id,
        {
          onSuccess: () => notify('Usuario eliminado correctamente', 'success'),
          onError: () => notify('Error al eliminar usuario', 'error'),
        }
      );
    }
    setConfirmDel(false);
    setToDelete(null);
  };

  const toggleActivo = (u: IUsuario) => {
    updateM.mutate(
      { id: u._id, data: { activo: !u.activo } },
      {
        onSuccess: () =>
          notify(
            `Usuario ${u.activo ? 'desactivado' : 'activado'} correctamente`,
            'success'
          ),
        onError: () => notify('Error al cambiar estado del usuario', 'error'),
      }
    );
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'administrador':
        return 'error' as const;
      case 'empleado':
        return 'primary' as const;
      case 'mecanico':
        return 'success' as const;
      default:
        return 'default' as const;
    }
  };

  const tableData = paginatedData.map(usuario => {
    const isCurrentUser = usuario._id === userId; 

    return {
      id: usuario._id,
      usuario: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 45,
              height: 45,
              borderRadius: '12px',
              background: isCurrentUser
                ? 'linear-gradient(45deg, #8B5CF6, #A78BFA)' 
                : currentTheme.buttonGradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              boxShadow: `0 4px 12px ${currentTheme.colors.primary}30`,
              border: isCurrentUser ? '2px solid #8B5CF6' : 'none'
            }}
          >
            {usuario.role?.toLowerCase() === 'administrador' ? '👨‍💼' :
              usuario.role?.toLowerCase() === 'mecanico' ? '👨‍🔧' : '👤'}
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <div className="font-medium" style={{ color: '#374151' }}>
                {usuario.username}
              </div>
              {isCurrentUser && (
                <Chip
                  size="small"
                  label="Tú"
                  sx={{
                    background: 'linear-gradient(45deg, #8B5CF6, #A78BFA)',
                    color: 'white',
                    fontSize: '0.65rem',
                    height: '20px'
                  }}
                />
              )}
            </Box>
            <Chip
              size="small"
              label={`ID: ${usuario._id.slice(-8)}`}
              sx={{
                background: 'linear-gradient(45deg, #6B7280, #9CA3AF)',
                color: 'white',
                fontSize: '0.7rem',
                mt: 0.5
              }}
            />
          </Box>
        </Box>
      ),
      rol: (
        <Chip
          label={usuario.role || 'Sin rol'}
          color={getRoleColor(usuario.role)}
          size="small"
          sx={{
            background: usuario.role?.toLowerCase() === 'administrador'
              ? 'linear-gradient(45deg, #EF4444, #F87171)'
              : usuario.role?.toLowerCase() === 'empleado'
                ? 'linear-gradient(45deg, #3B82F6, #60A5FA)'
                : usuario.role?.toLowerCase() === 'mecanico'
                  ? 'linear-gradient(45deg, #10B981, #34D399)'
                  : 'linear-gradient(45deg, #6B7280, #9CA3AF)',
            color: 'white',
            fontWeight: 'medium'
          }}
        />
      ),
      estado: (
        <Chip
          label={usuario.activo ? 'Activo' : 'Inactivo'}
          sx={{
            background: usuario.activo
              ? 'linear-gradient(45deg, #10B981, #34D399)'
              : 'linear-gradient(45deg, #F59E0B, #FBBF24)',
            color: 'white',
            fontWeight: 'medium'
          }}
          size="small"
        />
      ),
      acciones: (
        <Box display="flex" gap={0.5}>
          <IconButton
            size="small"
            onClick={() => openEdit(usuario)}
            title="Editar usuario"
            sx={{
              background: 'linear-gradient(45deg, #3B82F6, #60A5FA)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #2563EB, #3B82F6)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
              },
              transition: 'all 0.3s ease',
              width: 32,
              height: 32
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => toggleActivo(usuario)}
            title={usuario.activo ? 'Desactivar' : 'Activar'}
            sx={{
              background: usuario.activo
                ? 'linear-gradient(45deg, #F59E0B, #FBBF24)'
                : 'linear-gradient(45deg, #10B981, #34D399)',
              color: 'white',
              '&:hover': {
                background: usuario.activo
                  ? 'linear-gradient(45deg, #D97706, #F59E0B)'
                  : 'linear-gradient(45deg, #059669, #10B981)',
                transform: 'translateY(-1px)',
                boxShadow: usuario.activo
                  ? '0 4px 12px rgba(245, 158, 11, 0.4)'
                  : '0 4px 12px rgba(16, 185, 129, 0.4)'
              },
              transition: 'all 0.3s ease',
              width: 32,
              height: 32
            }}
          >
            {usuario.activo
              ? <VisibilityOffIcon fontSize="small" />
              : <VisibilityIcon fontSize="small" />
            }
          </IconButton>
          <IconButton
            size="small"
            onClick={() => askDelete(usuario)}
            title="Eliminar usuario"
            sx={{
              background: 'linear-gradient(45deg, #EF4444, #F87171)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #DC2626, #EF4444)',
                transform: 'translateY(-1px)',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
              },
              transition: 'all 0.3s ease',
              width: 32,
              height: 32
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
      fechaCreacion: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.9rem'
            }}
          >
            📅
          </Box>
          <Box>
            <div style={{ color: '#374151', fontSize: '0.85rem' }}>
              {usuario.createdAt ? new Date(usuario.createdAt).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }) : 'N/A'}
            </div>
          </Box>
        </Box>
      ),
      originalData: usuario
    }
  });

  const columns = [
    { id: 'usuario', label: 'Usuario' },
    { id: 'rol', label: 'Rol' },
    { id: 'estado', label: 'Estado' },
    { id: 'fechaCreacion', label: 'Fecha Creación' },
    { id: 'acciones', label: 'Acciones' }
  ];

  if (!isHydrated || !isHydratedCustom) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#f8fafc' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          </div>
          <div className="flex justify-center items-center h-64">
            <CircularProgress size={40} />
          </div>
        </div>
      </div>
    );
  }

  const totalUsuarios = usuarios.length;
  const usuariosActivos = usuarios.filter(u => u.activo).length;
  const administradores = usuarios.filter(u => u.role?.toLowerCase() === 'administrador').length;
  const empleados = usuarios.filter(u => u.role?.toLowerCase() === 'empleado').length;

  return (
    <div
      className="min-h-screen p-6 transition-colors duration-300"
      style={{
        background: currentTheme.colors.background
      }}
    >
      <div className="max-w-7xl mx-auto">


        <ModernTable
          title="Usuarios del Sistema"
          subtitle="Administra los usuarios y permisos del sistema"
          data={tableData}
          columns={columns}
          searchTerm={searchQuery}
          onSearchChange={onSearchChange}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          onCreateNew={openNew}
          createButtonText="Nuevo Usuario"
          emptyMessage="No se encontraron usuarios"
          searchPlaceholder="Buscar por usuario..."
        />

        <UsuarioModal
          open={openForm}
          defaultData={editData ?? undefined}
          onClose={closeForm}
          onSubmit={onSubmit}
          currentUserId={userId}
        />

        <Dialog
          open={confirmDel}
          onClose={() => setConfirmDel(false)}
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: '16px',
              background: currentTheme.colors.surface,
              backdropFilter: 'blur(10px)',
              boxShadow: `0 20px 40px ${currentTheme.colors.primary}20`
            }
          }}
        >
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: '1.1rem',
              color: currentTheme.colors.text,
              background: `linear-gradient(135deg, ${currentTheme.colors.primary}10, ${currentTheme.colors.secondary}10)`,
              borderRadius: '16px 16px 0 0'
            }}
          >
            <WarningAmberIcon sx={{ color: currentTheme.colors.warning }} />
            ¿Confirma eliminar este usuario?
          </DialogTitle>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              onClick={() => setConfirmDel(false)}
              sx={{
                borderRadius: '8px',
                color: currentTheme.colors.text,
                '&:hover': {
                  background: `${currentTheme.colors.primary}10`
                }
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={confirmDelete}
              sx={{
                borderRadius: '8px',
                background: 'linear-gradient(45deg, #EF4444, #F87171)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #DC2626, #EF4444)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Eliminar
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
