// src/components/Sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Toolbar, Collapse, IconButton
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
import { useState } from 'react'

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, href: '/' },
  { text: 'Clientes', icon: <PeopleIcon />, href: '/clientes' },
  { text: 'Vehículos', icon: <HomeIcon />, href: '/vehiculodatos' },
  { text: 'Pagos', icon: <PaymentIcon />, href: '/facturas' },
  {
    text: 'Mantenimiento',
    icon: <BuildIcon />,
    children: [
      { text: 'Marcas', href: '/marcasvehiculos' },
      { text: 'Colores', href: '/coloresVehiculos' },
      { text: 'Ubicaciones', href: '/ubicaciones' }
    ]
  },
  { text: 'Usuarios', icon: <PersonIcon />, href: '/usuarios' },
  { text: 'Mi Perfil', icon: <PersonIcon />, href: '/perfil' }
]

export default function Sidebar() {
  const pathname = usePathname()
  const [openMaint, setOpenMaint] = useState(false)
  const [openClientes, setOpenCli] = useState(false)

  return (
    <Drawer
      variant="permanent"
      sx={{ width: 240, '& .MuiDrawer-paper': { width: 240 } }}
    >
      <Toolbar />
      <List>
        {navItems.map(item => {
          if (item.children) {
            // distinguir mantenimiento vs clientes
            const isMaint = item.text === 'Mantenimiento'
            const open = isMaint ? openMaint : openClientes
            const setOpen = isMaint ? setOpenMaint : setOpenCli
            const selected =
              item.children.some(c => c.href === pathname) ||
              pathname === item.href

            return (
              <div key={item.text}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => setOpen(o => !o)} selected={selected}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                    {open ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={open} timeout="auto" unmountOnExit>
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

        <ListItem disablePadding sx={{ mt: 2 }}>
          <ListItemButton onClick={() => {/* logout */ }}>
            <ListItemIcon><ExitToAppIcon color="error" /></ListItemIcon>
            <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ color: 'error' }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  )
}
