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
  Tooltip
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  Payment as PaymentIcon,
  Work as WorkIcon,
  CarRepair as CarRepairIcon,
  Receipt as ReceiptIcon,
  Build as BuildIcon,
  ExpandLess,
  ExpandMore,
  Person as PersonIcon,
  ExitToApp as ExitToAppIcon
} from '@mui/icons-material'
import { JSX, useState } from 'react'
import { useAuth } from '@/app/context/AuthContext'

interface NavItem {
  text: string;
  icon: JSX.Element;
  href?: string;
  children?: { text: string; href: string }[];
}

const allNavItems: NavItem[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, href: '/' },
  { text: 'Clientes', icon: <PeopleIcon />, href: '/clientes' },
  { text: 'Vehículos', icon: <HomeIcon />, href: '/vehiculodatos' },
  { text: 'Empleados', icon: <WorkIcon />, href: '/empleadoinformacion' },
  { text: 'Recepciones', icon: <CarRepairIcon />, href: '/recepcionvehiculos' },
  { text: 'Recibos', icon: <ReceiptIcon />, href: '/recibosvehiculos' },
  { text: 'Suplidores', icon: <PeopleIcon />, href: '/suplidores' },
  { text: 'Almacen', icon: <BuildIcon />, href: '/inventorio' },
  { text: 'Inspecciones', icon: <BuildIcon />, href: '/inspeccionvehiculo' },
  { text: 'Reparaciones', icon: <BuildIcon />, href: '/reparacionvehiculo' },
  { text: 'Facturas', icon: <ReceiptIcon />, href: '/factura' },
  {
    text: 'Mantenimiento',
    icon: <BuildIcon />,
    children: [
      { text: 'Marcas', href: '/marcasvehiculos' },
      { text: 'Modelos', href: '/modelosdatos' },
      { text: 'Colores', href: '/coloresVehiculos' },
    ]
  },
  { text: 'Usuarios', icon: <PersonIcon />, href: '/usuarios' },
]

// Elementos que pueden ver los empleados
const empleadoNavItems: NavItem[] = [
  { text: 'Facturas', icon: <ReceiptIcon />, href: '/factura' },
]

export default function Sidebar(): JSX.Element {
  const pathname = usePathname()
  const [openMaint, setOpenMaint] = useState(false)
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false)
  const { auth, logout } = useAuth()

  // Determinar qué elementos mostrar según el rol del usuario
  const navItems = auth?.role === 'empleado' ? empleadoNavItems : allNavItems

  const handleLogoutClick = () => setOpenLogoutDialog(true)
  const handleLogoutConfirm = () => { setOpenLogoutDialog(false); logout() }
  const handleLogoutCancel = () => setOpenLogoutDialog(false)

  const buttonSx = {
    transition: 'all 0.3s',
    color: 'text.secondary',
    borderRadius: 1,
    textDecoration: 'none',
    '& .MuiListItemText-root .MuiTypography-root': {
      textDecoration: 'none'
    },
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.08)',
      color: 'text.primary'
    },
    '&.Mui-selected': {
      color: 'text.primary',
      backgroundColor: 'rgba(0, 0, 0, 0.04)'
    },
    '&.Mui-selected:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      color: 'text.primary'
    }
  }

  const textTypography = {
    fontWeight: 300,
    letterSpacing: '0.5px'
  }

  return (
    <>
      <Drawer
        variant="permanent"
        sx={{
          width: 240,
          '& .MuiDrawer-paper': {
            width: 240,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(240,240,240,0.9))',
            borderRadius: 2
          }
        }}
      >
        <Toolbar />
        <List>
          {navItems.map(item =>
            item.children ? (
              <div key={item.text}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => setOpenMaint(o => !o)}
                    selected={
                      pathname === item.href ||
                      item.children.some(c => c.href === pathname)
                    }
                    sx={buttonSx}
                  >
                    <Tooltip title={item.text} placement="right">
                      <ListItemIcon>{item.icon}</ListItemIcon>
                    </Tooltip>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={textTypography}
                    />
                    {openMaint ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={openMaint} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map(child => (
                      <ListItem key={child.text} disablePadding sx={{ pl: 4 }}>
                        <ListItemButton
                          component={Link}
                          href={child.href}
                          selected={pathname === child.href}
                          sx={buttonSx}
                        >
                          <ListItemText
                            primary={child.text}
                            primaryTypographyProps={textTypography}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </div>
            ) : item.href ? (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  selected={pathname === item.href}
                  sx={buttonSx}
                >
                  <Tooltip title={item.text} placement="right">
                    <ListItemIcon>{item.icon}</ListItemIcon>
                  </Tooltip>
                  <ListItemText
                    primary={item.text}
                    primaryTypographyProps={textTypography}
                  />
                </ListItemButton>
              </ListItem>
            ) : null
          )}

          <ListItem disablePadding sx={{ mt: 2 }}>
            <ListItemButton onClick={handleLogoutClick} sx={buttonSx}>
              <ListItemIcon>
                <ExitToAppIcon color="error" />
              </ListItemIcon>
              <ListItemText
                primary="Cerrar Sesión"
                primaryTypographyProps={{ color: 'error', ...textTypography }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>

      <Dialog
        open={openLogoutDialog}
        onClose={handleLogoutCancel}
        aria-labelledby="confirm-logout-title"
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle id="confirm-logout-title">Confirmar cierre de sesión</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas cerrar sesión?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ pb: 2, px: 3 }}>
          <Button sx={{ borderRadius: 1 }} onClick={handleLogoutCancel}>
            Cancelar
          </Button>
          <Button
            sx={{ borderRadius: 1 }}
            onClick={handleLogoutConfirm}
            color="error"
            autoFocus
          >
            Cerrar Sesión
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
