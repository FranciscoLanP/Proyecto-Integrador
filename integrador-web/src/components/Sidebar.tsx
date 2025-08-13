'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Collapse,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tooltip,
  Box,
  Typography,
  Avatar,
  Chip,
  Divider
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  DirectionsCar as DirectionsCarIcon,
  Payment as PaymentIcon,
  Work as WorkIcon,
  CarRepair as CarRepairIcon,
  Receipt as ReceiptIcon,
  Build as BuildIcon,
  ExpandLess,
  ExpandMore,
  Person as PersonIcon,
  ExitToApp as ExitToAppIcon,
  Inventory as InventoryIcon,
  Search as SearchIcon,
  Construction as ConstructionIcon,
  LocalShipping as LocalShippingIcon
} from '@mui/icons-material'
import { JSX, useState } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { useTheme } from '@/app/context/ThemeContext'

interface NavItem {
  text: string;
  icon: JSX.Element;
  href?: string;
  emoji?: string;
  children?: { text: string; href: string; emoji?: string }[];
}

const allNavItems: NavItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, href: '/', emoji: '📊' },
  {
    text: 'Clientes',
    icon: <PeopleIcon />,
    href: '/clientes',
    emoji: '👥',
    children: [
      { text: 'Clientes', href: '/clientes', emoji: '👥' },
      { text: 'Vehículos', href: '/vehiculodatos', emoji: '🚗' },
      { text: 'Marcas', href: '/marcasvehiculos', emoji: '🏷️' },
      { text: 'Modelos', href: '/modelosdatos', emoji: '�' },
      { text: 'Colores', href: '/coloresVehiculos', emoji: '🎨' },
    ]
  },
  { text: 'Empleados', icon: <WorkIcon />, href: '/empleadoinformacion', emoji: '👨‍💼' },
  {
    text: 'Almacén',
    icon: <InventoryIcon />,
    emoji: '📦',
    children: [
      { text: 'Suplidores', href: '/suplidores', emoji: '🚛' },
      { text: 'Inventario', href: '/inventorio', emoji: '📦' },
    ]
  },
  { text: 'Recepciones', icon: <CarRepairIcon />, href: '/recepcionvehiculos', emoji: '🔧' },
  { text: 'Recibos', icon: <ReceiptIcon />, href: '/recibosvehiculos', emoji: '🧾' },
  { text: 'Inspecciones', icon: <SearchIcon />, href: '/inspeccionvehiculo', emoji: '🔍' },
  { text: 'Reparaciones', icon: <ConstructionIcon />, href: '/reparacionvehiculo', emoji: '🔨' },
  { text: 'Facturas', icon: <ReceiptIcon />, href: '/factura', emoji: '💰' },
  { text: 'Usuarios', icon: <PersonIcon />, href: '/usuarios', emoji: '👤' },
]

const empleadoNavItems: NavItem[] = [
  { text: 'Facturas', icon: <ReceiptIcon />, href: '/factura', emoji: '💰' },
]

export default function Sidebar(): JSX.Element {
  const pathname = usePathname()
  const [openClientes, setOpenClientes] = useState(false)
  const [openAlmacen, setOpenAlmacen] = useState(false)
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false)
  const { auth, logout } = useAuth()
  const { currentTheme } = useTheme()

  const navItems = auth?.role === 'empleado' ? empleadoNavItems : allNavItems

  const handleLogoutClick = () => setOpenLogoutDialog(true)
  const handleLogoutConfirm = () => { setOpenLogoutDialog(false); logout() }
  const handleLogoutCancel = () => setOpenLogoutDialog(false)

  const getInitials = (username: string): string => {
    if (!username) return 'U';
    const parts = username.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return username.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          '& .MuiDrawer-paper': {
            width: 240,
            background: `linear-gradient(135deg, ${currentTheme.colors.background} 0%, ${currentTheme.colors.primary}08 100%)`,
            backdropFilter: 'blur(10px)',
            border: 'none',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
            borderRadius: '0 20px 20px 0'
          }
        }}
      >
        <Toolbar />

        <Box sx={{
          p: 2,
          mb: 2,
          background: currentTheme.headerGradient,
          borderRadius: '16px',
          mx: 2,
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Avatar sx={{
              width: 40,
              height: 40,
              background: currentTheme.gradient,
              fontWeight: 'bold',
              fontSize: '1rem'
            }}>
              {auth ? getInitials(auth.username) : 'U'}
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'white' }}>
                {auth?.username || 'Usuario'}
              </Typography>
              <Chip
                size="small"
                label={auth?.role || 'Usuario'}
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontSize: '0.7rem',
                  height: '18px'
                }}
              />
            </Box>
          </Box>
        </Box>

        <List sx={{ px: 1 }}>
          {navItems.map(item =>
            item.children ? (
              <Box key={item.text} sx={{ mb: 0.5 }}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      if (item.text === 'Clientes') {
                        setOpenClientes(o => !o)
                      } else if (item.text === 'Almacén') {
                        setOpenAlmacen(o => !o)
                      }
                    }}
                    selected={
                      pathname === item.href ||
                      item.children.some(c => c.href === pathname)
                    }
                    sx={{
                      borderRadius: '12px',
                      mx: 1,
                      mb: 0.5,
                      transition: 'all 0.3s ease',
                      background: (pathname === item.href || item.children.some(c => c.href === pathname))
                        ? currentTheme.gradient
                        : 'transparent',
                      color: (pathname === item.href || item.children.some(c => c.href === pathname))
                        ? 'white'
                        : currentTheme.colors.text,
                      '&:hover': {
                        background: (pathname === item.href || item.children.some(c => c.href === pathname))
                          ? currentTheme.gradient
                          : `${currentTheme.colors.primary}15`,
                        transform: 'translateX(4px)',
                        boxShadow: `0 4px 12px ${currentTheme.colors.primary}25`
                      }
                    }}
                  >
                    <ListItemIcon sx={{
                      color: 'inherit',
                      minWidth: '40px',
                      fontSize: '1.2rem'
                    }}>
                      {item.emoji || item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: 500,
                        fontSize: '0.9rem'
                      }}
                    />
                    {(item.text === 'Clientes' ? openClientes : openAlmacen) ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={item.text === 'Clientes' ? openClientes : openAlmacen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map(child => (
                      <ListItem key={child.text} disablePadding>
                        <ListItemButton
                          component={Link}
                          href={child.href}
                          selected={pathname === child.href}
                          sx={{
                            borderRadius: '12px',
                            mx: 2,
                            ml: 4,
                            mb: 0.3,
                            transition: 'all 0.3s ease',
                            background: pathname === child.href
                              ? currentTheme.buttonGradient
                              : 'transparent',
                            color: pathname === child.href
                              ? 'white'
                              : currentTheme.colors.text,
                            '&:hover': {
                              background: pathname === child.href
                                ? currentTheme.buttonGradient
                                : `${currentTheme.colors.secondary}15`,
                              transform: 'translateX(4px)',
                              boxShadow: `0 2px 8px ${currentTheme.colors.secondary}25`
                            }
                          }}
                        >
                          <ListItemIcon sx={{
                            color: 'inherit',
                            minWidth: '32px',
                            fontSize: '1rem'
                          }}>
                            {child.emoji}
                          </ListItemIcon>
                          <ListItemText
                            primary={child.text}
                            primaryTypographyProps={{
                              fontWeight: 400,
                              fontSize: '0.85rem'
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </Box>
            ) : item.href ? (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  selected={pathname === item.href}
                  sx={{
                    borderRadius: '12px',
                    mx: 1,
                    transition: 'all 0.3s ease',
                    background: pathname === item.href
                      ? currentTheme.gradient
                      : 'transparent',
                    color: pathname === item.href
                      ? 'white'
                      : currentTheme.colors.text,
                    '&:hover': {
                      background: pathname === item.href
                        ? currentTheme.gradient
                        : `${currentTheme.colors.primary}15`,
                      transform: 'translateX(4px)',
                      boxShadow: `0 4px 12px ${currentTheme.colors.primary}25`
                    }
                  }}
                >
                  <ListItemIcon sx={{
                    color: 'inherit',
                    minWidth: '40px',
                    fontSize: '1.2rem'
                  }}>
                    {item.emoji || item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      fontSize: '0.9rem'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ) : null
          )}

          <Divider sx={{ my: 2, mx: 2, borderColor: `${currentTheme.colors.primary}20` }} />

          <ListItem disablePadding>
            <ListItemButton
              onClick={handleLogoutClick}
              sx={{
                borderRadius: '12px',
                mx: 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FF6B6B, #FF8E8E)',
                  color: 'white',
                  transform: 'translateX(4px)',
                  boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)'
                }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: '40px' }}>
                🚪
              </ListItemIcon>
              <ListItemText
                primary="Cerrar Sesión"
                primaryTypographyProps={{
                  fontWeight: 500,
                  fontSize: '0.9rem'
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Dialog
        open={openLogoutDialog}
        onClose={handleLogoutCancel}
        aria-labelledby="confirm-logout-title"
        PaperProps={{
          sx: {
            borderRadius: '16px',
            background: currentTheme.colors.background,
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <DialogTitle
          id="confirm-logout-title"
          sx={{
            color: currentTheme.colors.text,
            fontWeight: 'bold'
          }}
        >
          🚪 Confirmar cierre de sesión
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: currentTheme.colors.text }}>
            ¿Estás seguro de que deseas cerrar sesión?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3, gap: 1 }}>
          <Button
            onClick={handleLogoutCancel}
            sx={{
              borderRadius: '8px',
              background: `${currentTheme.colors.primary}15`,
              color: currentTheme.colors.text,
              '&:hover': {
                background: `${currentTheme.colors.primary}25`
              }
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleLogoutConfirm}
            sx={{
              borderRadius: '8px',
              background: 'linear-gradient(45deg, #FF6B6B, #FF8E8E)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(45deg, #FF5252, #FF6B6B)'
              }
            }}
            autoFocus
          >
            Cerrar Sesión
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
