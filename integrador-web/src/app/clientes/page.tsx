// 📁 src/app/clientes/page.tsx
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
import { alpha } from '@mui/material/styles';
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

// Cargamos el modal de cliente sin SSR para evitar errores de Leaflet en el servidor
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
        {/* Efecto glassmorphism de fondo */}
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
        {/* Header moderno */}
        <Box sx={{
          mb: 4,
          textAlign: 'center',
          background: currentTheme.headerGradient,
          borderRadius: '20px',
          p: 3,
          color: 'white',
          boxShadow: `0 8px 32px ${currentTheme.colors.primary}37`,
          position: 'relative',
          zIndex: 1
        }}
          className={`${styles.fadeIn} ${styles.pulseGlow}`}>
          <Typography variant="h4" sx={{
            fontWeight: 'bold',
            mb: 1,
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}
            className={styles.gradientText}>
            🎯 Gestión de Clientes
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Administra tu base de clientes de forma eficiente
          </Typography>
        </Box>

        {/* Barra de búsqueda moderna */}
        <Paper sx={{
          p: 2,
          mb: 3,
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
          position: 'relative',
          zIndex: 1
        }}
          className={`${styles.slideIn} ${styles.hoverFloat}`}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="🔍 Buscar cliente"
              size="small"
              value={searchTerm}
              onChange={handleSearch}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  }
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
                borderRadius: '12px',
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

        {/* Tabla con diseño moderno */}
        <Paper sx={{
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          zIndex: 1
        }}
          className={`${styles.fadeIn} ${styles.shimmer}`}>
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
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.95rem',
                      py: 2
                    }}>
                      👤 Cliente
                    </TableCell>
                    <TableCell sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.95rem'
                    }}>
                      📄 Identificación
                    </TableCell>
                    <TableCell sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.95rem'
                    }}>
                      📞 Contacto
                    </TableCell>
                    <TableCell sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.95rem'
                    }}>
                      ✉️ Correo
                    </TableCell>
                    <TableCell align="right" sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                        '&:hover': {
                          background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                          transform: 'scale(1.01)',
                          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        },
                        '&:nth-of-type(even)': {
                          backgroundColor: 'rgba(248, 250, 252, 0.8)',
                        },
                        transition: 'all 0.2s ease-in-out',
                        cursor: 'pointer'
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{
                            background: `linear-gradient(135deg, ${index % 4 === 0 ? '#FF6B6B, #4ECDC4' :
                              index % 4 === 1 ? '#4ECDC4, #45B7D1' :
                                index % 4 === 2 ? '#FFA07A, #FFE4B5' :
                                  '#DDA0DD, #98FB98'
                              })`,
                            width: 40,
                            height: 40,
                            fontSize: '1.2rem'
                          }}>
                            {['Individual', 'Gobierno'].includes(c.tipo_cliente) ? <PersonIcon /> : <BusinessIcon />}
                          </Avatar>
                          <Box>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
                              {c.nombre}
                            </Typography>
                            <Chip
                              size="small"
                              label={c.tipo_cliente}
                              sx={{
                                background: ['Individual', 'Gobierno'].includes(c.tipo_cliente)
                                  ? 'linear-gradient(45deg, #4CAF50, #8BC34A)'
                                  : 'linear-gradient(45deg, #2196F3, #03DAC6)',
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
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4a5568' }}>
                            {c.cedula}
                          </Typography>
                          {c.rnc && (
                            <Typography variant="caption" sx={{ color: '#718096' }}>
                              RNC: {c.rnc}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon sx={{ color: '#4CAF50', fontSize: '1rem' }} />
                          <Typography variant="body2" sx={{ color: '#4a5568' }}>
                            {c.numero_telefono}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#4a5568' }}>
                          {c.correo}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <IconButton
                            size="small"
                            onClick={() => openVehModal(c)}
                            sx={{
                              background: 'linear-gradient(45deg, #FF9800, #FFC107)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #F57C00, #FF9800)',
                                transform: 'rotate(10deg) scale(1.1)',
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
                              background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(45deg, #1976D2, #2196F3)',
                                transform: 'rotate(-10deg) scale(1.1)',
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
                          <Typography variant="h6" sx={{ mb: 1, color: '#718096' }}>
                            🔍 No hay clientes para mostrar
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#a0aec0' }}>
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

          {/* Paginación moderna */}
          <Box sx={{
            borderTop: '1px solid rgba(0, 0, 0, 0.1)',
            background: 'rgba(248, 250, 252, 0.8)',
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
                  borderRadius: '8px',
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
