import { AppBar, Toolbar, Typography, Box, Avatar } from '@mui/material'

export default function Header() {
  return (
    <AppBar position="fixed" sx={{ left: 240, width: `calc(100% - 240px)` }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          JHS Auto Servicios
        </Typography>
        <Box display="flex" alignItems="center">
          <Typography variant="body1" sx={{ mr: 2 }}>Francisco Lanigua</Typography>
          <Avatar>FL</Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
