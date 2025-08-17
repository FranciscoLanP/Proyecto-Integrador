'use client';

import React, { useState, ChangeEvent, JSX } from 'react';
import dynamic from 'next/dynamic';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import TablePagination from '@mui/material/TablePagination';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import { useTheme } from '../context/ThemeContext';
import { useHydration, defaultTheme } from '@/hooks/useHydration';
import ThemeSafePage from '@/components/ThemeSafePage';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import PhoneIcon from '@mui/icons-material/Phone';
import SearchIcon from '@mui/icons-material/Search';
import styles from './ClientesPage.module.css';

import { useCrud } from '../../hooks/useCrud';
import { useNotification } from '../../components/utils/NotificationProvider';
import type {
  ICliente,

} from '../types';

const ClientModal = dynamic(() => import('./ClientModal'), { ssr: false });
import ClienteVehiculosModal from './ClienteVehiculosModal';

export default function ClientesPage(): JSX.Element {
  const { notify } = useNotification();
  const isHydrated = useHydration();
  const { currentTheme } = useTheme();

  const clienteCrud = useCrud<ICliente>('clientes');


  const clientes = clienteCrud.allQuery.data || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openForm, setOpenForm] = useState(false);
  const [editData, setEditData] = useState<ICliente | null>(null);

  const [selClient, setSelClient] = useState<ICliente | null>(null);
  const [openVeh, setOpenVeh] = useState(false);

  if (clienteCrud.allQuery.isLoading)
    return <Typography>Loading…</Typography>;
  if (clienteCrud.allQuery.error)
    return <Typography color="error">{clienteCrud.allQuery.error.message}</Typography>;

  const filtered = clientes.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginated = filtered.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );



  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };
  const handlePageChange = (_: unknown, newPage: number) => setPage(newPage);
  const handleRowsChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };

  const openCreate = () => {
    setEditData(null);
    setOpenForm(true);
  };
  const openEdit = (c: ICliente) => {
    setEditData(c);
    setOpenForm(true);
  };
  const closeForm = () => setOpenForm(false);

  const submitClient = (data: Partial<ICliente> & {
    latitude: number;
    longitude: number;
    direccion?: string;
  }) => {
    if (editData) {
      clienteCrud.updateM.mutate(
        { id: editData._id, data },
        {
          onSuccess: () => notify('Cliente actualizado correctamente', 'success'),
          onError: () => notify('Error al actualizar cliente', 'error'),
        }
      );
    } else {
      clienteCrud.createM.mutate(data, {
        onSuccess: () => notify('Cliente creado correctamente', 'success'),
        onError: () => notify('Error al crear cliente', 'error'),
      });
    }
    closeForm();
  };

  const openVehModal = (c: ICliente) => {
    setSelClient(c);
    setOpenVeh(true);
  };
  const closeVehModal = () => setOpenVeh(false);

  return (
    <ThemeSafePage title="Clientes">
      <Box sx={{
        p: 3,
        background: currentTheme.colors.background,
        minHeight: '100vh',
        position: 'relative'
      }}
        className={styles.fadeIn}>
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
          radial-gradient(600px circle at 0% 0%, ${currentTheme.colors.primary}15 0%, transparent 40%),
          radial-gradient(800px circle at 100% 100%, ${currentTheme.colors.secondary}15 0%, transparent 40%)
        `,
          pointerEvents: 'none',
          zIndex: 0
        }} />
        <Box sx={{
          mb: 4,
          textAlign: 'center',
          background: currentTheme.headerGradient,
          borderRadius: '8px',
          p: 3,
          color: 'white',
          boxShadow: `0 8px 32px ${currentTheme.colors.primary}37`,
          position: 'relative',
          zIndex: 10,
          isolation: 'isolate'
        }}>
          <Typography variant="h4" sx={{
            fontWeight: 'bold',
            mb: 1,
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            color: 'white',
            zIndex: 11,
            position: 'relative'
          }}>
            🎯 Gestión de Clientes
          </Typography>
          <Typography variant="subtitle1" sx={{
            opacity: 0.9,
            color: 'white',
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>
            Administra tu base de clientes de forma eficiente
          </Typography>
        </Box>
        <Paper sx={{
          p: 2,
          mb: 3,
          borderRadius: '6px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
          position: 'relative',
          zIndex: 1
        }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="🔍 Buscar cliente"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                }
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <Button
              variant="contained"
              onClick={openCreate}
              sx={{
                borderRadius: '4px',
                px: 3,
                py: 1.5,
                background: currentTheme.buttonGradient,
                boxShadow: `0 3px 5px 2px ${currentTheme.colors.primary}30`,
                '&:hover': {
                  background: currentTheme.buttonGradient,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 20px 2px ${currentTheme.colors.primary}40`,
                },
                transition: 'all 0.3s ease-in-out'
              }}
            >
              ✨ Nuevo Cliente
            </Button>
          </Box>
        </Paper>

        <Paper sx={{
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          zIndex: 1
        }}>
          <Box sx={{
            height: 400,
            overflow: 'auto'
          }}
            className={styles.customScrollbar}>
            <Box sx={{ minWidth: 900, overflowX: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{
                      background: currentTheme.headerGradient,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.95rem',
                      py: 2
                    }}>
                      👤 Cliente
                    </TableCell>
                    <TableCell sx={{
                      background: currentTheme.headerGradient,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.95rem'
                    }}>
                      📄 Identificación
                    </TableCell>
                    <TableCell sx={{
                      background: currentTheme.headerGradient,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.95rem'
                    }}>
                      📞 Contacto
                    </TableCell>
                    <TableCell sx={{
                      background: currentTheme.headerGradient,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.95rem'
                    }}>
                      ✉️ Correo
                    </TableCell>
                    <TableCell sx={{
                      background: currentTheme.headerGradient,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.95rem'
                    }}>
                      📅 Fecha Creación
                    </TableCell>
                    <TableCell align="right" sx={{
                      background: currentTheme.headerGradient,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.95rem'
                    }}>
                      ⚙️ Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginated.map((c, index) => (
                    <TableRow
                      key={c._id}
                      sx={{
                        '&:nth-of-type(even)': {
                          backgroundColor: currentTheme.colors.background === '#ffffff' ? 'rgba(248, 250, 252, 0.8)' : 'rgba(255, 255, 255, 0.05)',
                        },
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{
                            background: currentTheme.gradient,
                            width: 40,
                            height: 40,
                            fontSize: '1.2rem'
                          }}>
                            {['Individual', 'Gobierno'].includes(c.tipo_cliente) ? <PersonIcon /> : <BusinessIcon />}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: currentTheme.colors.text }}>
                              {c.nombre}
                            </Typography>
                            <Chip
                              size="small"
                              label={c.tipo_cliente}
                              sx={{
                                background: currentTheme.gradient,
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                              }}
                            />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: currentTheme.colors.text }}>
                            {c.cedula}
                          </Typography>
                          {c.rnc && (
                            <Typography variant="caption" sx={{ color: currentTheme.colors.text, opacity: 0.7 }}>
                              RNC: {c.rnc}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon sx={{ color: currentTheme.colors.primary, fontSize: '1rem' }} />
                          <Typography variant="body2" sx={{ color: currentTheme.colors.text }}>
                            {c.numero_telefono}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: currentTheme.colors.text }}>
                          {c.correo}
                        </Typography>
                      </TableCell>
                      <TableCell>
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
                          <Typography variant="body2" sx={{ color: currentTheme.colors.text, fontSize: '0.85rem' }}>
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            }) : 'N/A'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <IconButton
                            size="small"
                            onClick={() => openVehModal(c)}
                            sx={{
                              background: currentTheme.buttonGradient,
                              color: 'white',
                              '&:hover': {
                                background: currentTheme.buttonGradient,
                                transform: 'rotate(10deg) scale(1.1)',
                                filter: 'brightness(1.1)'
                              },
                              transition: 'all 0.2s ease-in-out',
                              width: 36,
                              height: 36
                            }}
                          >
                            <DriveEtaIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => openEdit(c)}
                            sx={{
                              background: currentTheme.gradient,
                              color: 'white',
                              '&:hover': {
                                background: currentTheme.gradient,
                                transform: 'rotate(-10deg) scale(1.1)',
                                filter: 'brightness(1.1)'
                              },
                              transition: 'all 0.2s ease-in-out',
                              width: 36,
                              height: 36
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginated.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                        <Box sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          opacity: 0.6
                        }}>
                          <Typography variant="h6" sx={{ mb: 1, color: currentTheme.colors.text, opacity: 0.8 }}>
                            🔍 No hay clientes para mostrar
                          </Typography>
                          <Typography variant="body2" sx={{ color: currentTheme.colors.text, opacity: 0.6 }}>
                            {searchTerm ? 'Intenta con otro término de búsqueda' : 'Comienza agregando tu primer cliente'}
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Box>

          <Box sx={{
            borderTop: `1px solid ${currentTheme.colors.primary}30`,
            background: currentTheme.colors.background === '#ffffff' ? 'rgba(248, 250, 252, 0.8)' : 'rgba(255, 255, 255, 0.05)',
            px: 2
          }}>
            <TablePagination
              component="div"
              count={filtered.length}
              page={page}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleRowsChange}
              rowsPerPageOptions={[5, 10, 25]}
              sx={{
                '& .MuiTablePagination-toolbar': {
                  minHeight: 64,
                },
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontWeight: 'bold',
                  color: '#4a5568'
                },
                '& .MuiTablePagination-select': {
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.8)',
                },
                '& .MuiIconButton-root': {
                  background: 'rgba(102, 126, 234, 0.1)',
                  margin: '0 2px',
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.2)',
                    transform: 'scale(1.1)',
                  },
                  '&.Mui-disabled': {
                    background: 'rgba(0, 0, 0, 0.1)',
                  }
                }
              }}
            />
          </Box>
        </Paper>

        <ClientModal
          open={openForm}
          defaultData={
            editData
              ? {
                ...editData,
                latitude: (editData as any).location?.coordinates[1] ?? 0,
                longitude: (editData as any).location?.coordinates[0] ?? 0,
                direccion: (editData as any).direccion,
              }
              : undefined
          }
          onClose={closeForm}
          onSubmit={submitClient}
        />

        {selClient && (
          <ClienteVehiculosModal
            open={openVeh}
            onClose={closeVehModal}
            client={selClient}
          />
        )}
      </Box>
    </ThemeSafePage>
  );
}
