'use client'

import { useState } from 'react'
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
  Collapse
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import HomeIcon from '@mui/icons-material/Home'
import PaymentIcon from '@mui/icons-material/Payment'
import BuildIcon from '@mui/icons-material/Build'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import PersonIcon from '@mui/icons-material/Person'
import ExitToAppIcon from '@mui/icons-material/ExitToApp'

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, href: '/' },
  {
    text: 'Clientes',
    icon: <PeopleIcon />,
    children: [{ text: 'Clientes', href: '/clientes' }]
  },
  { text: 'Vehículos', icon: <HomeIcon />, href: '/vehiculodatos' },
  { text: 'Pagos', icon: <PaymentIcon />, href: '/facturas' },
  {
    text: 'Mantenimiento',
    icon: <BuildIcon />,
    children: [
      { text: 'Marcas de Vehículos', href: '/marcasvehiculos' },
      { text: 'Colores de Vehiculos', href: '/coloresVehiculos' },
      { text: 'Ubicaciones', href: '/ubicaciones' }
    ]
  },
  { text: 'Usuarios', icon: <CalendarTodayIcon />, href: '/usuarios' },
  { text: 'Mi Perfil', icon: <PersonIcon />, href: '/perfil' }
]

export default function Sidebar() {
  const pathname = usePathname()

  // Ahora controlamos **dos** colapsables:
  const [openClientes, setOpenClientes]       = useState(false)
  const [openMaintenance, setOpenMaintenance] = useState(false)

  return (
    <Drawer
      variant="permanent"
      sx={{ width: 240, '& .MuiDrawer-paper': { width: 240 } }}
    >
      <Toolbar />
      <List>
        {navItems.map(item => {
          // si tiene hijos, elegimos qué estado usar
          if (item.children) {
            const isClientes      = item.text === 'Clientes'
            const openState       = isClientes ? openClientes : openMaintenance
            const setOpenState    = isClientes ? setOpenClientes : setOpenMaintenance
            const selected        =
              item.children.some(c => c.href === pathname) ||
              pathname === item.href

            return (
              <div key={item.text}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => setOpenState(o => !o)}
                    selected={selected}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                    {openState ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={openState} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map(child => (
                      <ListItem key={child.text} disablePadding sx={{ pl: 4 }}>
                        <Link href={child.href} passHref style={{ width: '100%' }}>
                          <ListItemButton selected={pathname === child.href}>
                            <ListItemText primary={child.text} />
                          </ListItemButton>
                        </Link>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </div>
            )
          }

          // nodos sin hijos
          return (
            <ListItem key={item.text} disablePadding>
              <Link href={item.href!} passHref style={{ width: '100%' }}>
                <ListItemButton selected={pathname === item.href}>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </Link>
            </ListItem>
          )
        })}

        <ListItem sx={{ mt: 2 }} disablePadding>
          <ListItemButton onClick={() => {/* logout logic */}}>
            <ListItemIcon>
              <ExitToAppIcon color="error" />
            </ListItemIcon>
            <ListItemText
              primary="Cerrar Sesión"
              primaryTypographyProps={{ color: 'error' }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  )
}
