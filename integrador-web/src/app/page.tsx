'use client'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const stats = [
  { label: 'Total De Reparaciones Realizadas', value: 0 },
  { label: 'Pagos Pendientes', value: 0 },
  { label: 'Mantenimientos Pendientes', value: 0 },
]

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Dashboard
      </Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {stats.map((s) => (
          <Grid key={s.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2">{s.label}</Typography>
                <Typography variant="h5">{s.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
