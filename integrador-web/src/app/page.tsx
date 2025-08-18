'use client'

import React, { useState, useEffect } from 'react'
import {
  Box, Grid, Card, CardContent, Typography, Paper, Chip,
  LinearProgress
} from '@mui/material'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, LabelList
} from 'recharts'
import { useTheme } from './context/ThemeContext'
import { useHydration } from '@/hooks/useHydration'
import LoadingSpinner from '@/components/LoadingSpinner'
import RoleGuard from '@/components/RoleGuard'
import { facturaService, type Factura } from '@/services/facturaService'
import { pagoFacturaCustomService } from '@/services/pagoFacturaService'

interface FacturaConPagos extends Factura {
  totalPagado?: number;
  estadoPago?: 'Pendiente' | 'Pago Parcial' | 'Saldado' | 'Pagado';
}

const calcularEstadoPago = (factura: Factura, totalPagado: number): 'Pendiente' | 'Pago Parcial' | 'Saldado' | 'Pagado' => {
  const total = factura.total || 0;

  if (factura.tipo_factura === 'Contado') {

    return 'Pagado';
  } else {
    if (totalPagado === 0) {
      return 'Pendiente';
    } else if (totalPagado >= total) {
      return 'Saldado';
    } else {
      return 'Pago Parcial';
    }
  }
};

interface DashboardStats {
  totalFacturas: number;
  facturasPagadas: number;
  facturasPendientes: number;
  ingresosMensuales: number;
  ingresosTotales: number;
  promedioFactura: number;
}

interface IngresoMensual {
  mes: string;
  ingresos: number;
  facturas: number;
}

interface MetodoPagoStats {
  metodo: string;
  valor: number;
  porcentaje: number;
  color: string;
}

export default function DashboardPage() {
  return (
    <RoleGuard allowedRoles={['administrador']}>
      <DashboardContent />
    </RoleGuard>
  )
}

function DashboardContent() {
  const { currentTheme, isHydrated } = useTheme()
  const isHydratedCustom = useHydration()
  const [facturas, setFacturas] = useState<FacturaConPagos[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalFacturas: 0,
    facturasPagadas: 0,
    facturasPendientes: 0,
    ingresosMensuales: 0,
    ingresosTotales: 0,
    promedioFactura: 0
  })
  const [ingresosMensuales, setIngresosMensuales] = useState<IngresoMensual[]>([])
  const [metodosPago, setMetodosPago] = useState<MetodoPagoStats[]>([])

  const fetchData = async () => {
    try {
      setLoading(true)
      const facturasData = await facturaService.fetchAll()

      const facturasConPagos: FacturaConPagos[] = await Promise.all(
        facturasData.map(async (factura) => {
          try {
            const pagosInfo = await pagoFacturaCustomService.getPagosByFactura(factura._id!);
            const totalPagado = pagosInfo.resumen?.totalPagado || 0;
            const estadoPago = calcularEstadoPago(factura, totalPagado);

            return {
              ...factura,
              totalPagado,
              estadoPago
            };
          } catch (error) {
            console.warn(`⚠️ Error obteniendo pagos para factura ${factura._id}:`, error);
            const estadoPago = calcularEstadoPago(factura, 0);
            return {
              ...factura,
              totalPagado: 0,
              estadoPago
            };
          }
        })
      );

      setFacturas(facturasConPagos)

      const facturasPagadas = facturasConPagos.filter(f =>
        f.estadoPago === 'Pagado' || f.estadoPago === 'Saldado'
      )
      const facturasPendientes = facturasConPagos.filter(f =>
        f.estadoPago === 'Pendiente' || f.estadoPago === 'Pago Parcial'
      )

      const ingresosTotales = facturasPagadas.reduce((sum, f) => {
        if (f.tipo_factura === 'Contado') {
          return sum + (f.total || 0)
        } else {
          return sum + (f.totalPagado || 0)
        }
      }, 0)

      const mesActual = new Date().getMonth()
      const añoActual = new Date().getFullYear()

      const facturasMesActual = facturasPagadas.filter(f => {
        const fechaFactura = new Date(f.createdAt || new Date())
        return fechaFactura.getMonth() === mesActual && fechaFactura.getFullYear() === añoActual
      })

      const ingresosMesActual = facturasMesActual.reduce((sum, f) => {
        if (f.tipo_factura === 'Contado') {
          return sum + (f.total || 0)
        } else {
          return sum + (f.totalPagado || 0)
        }
      }, 0)

      setStats({
        totalFacturas: facturasConPagos.length,
        facturasPagadas: facturasPagadas.length,
        facturasPendientes: facturasPendientes.length,
        ingresosMensuales: ingresosMesActual,
        ingresosTotales,
        promedioFactura: facturasPagadas.length > 0 ? ingresosTotales / facturasPagadas.length : 0
      })

      const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dec']
      const ingresosPorMes: IngresoMensual[] = []

      for (let i = 5; i >= 0; i--) {
        const fecha = new Date(añoActual, mesActual - i, 1)
        const mesIndex = fecha.getMonth()
        const añoMes = fecha.getFullYear()

        const facturasDelMes = facturasPagadas.filter(f => {
          const fechaFactura = new Date(f.createdAt || new Date())
          return fechaFactura.getMonth() === mesIndex && fechaFactura.getFullYear() === añoMes
        })

        const ingresos = facturasDelMes.reduce((sum, f) => {
          if (f.tipo_factura === 'Contado') {
            return sum + (f.total || 0)
          } else {
            return sum + (f.totalPagado || 0)
          }
        }, 0)

        ingresosPorMes.push({
          mes: meses[mesIndex],
          ingresos,
          facturas: facturasDelMes.length
        })
      }

      setIngresosMensuales(ingresosPorMes)

      const metodosPagoMap = new Map<string, number>()

      facturasPagadas.forEach(factura => {
        if (factura.metodos_pago && factura.metodos_pago.length > 0) {
          factura.metodos_pago.forEach(metodo => {
            const tipo = metodo.tipo
            metodosPagoMap.set(tipo, (metodosPagoMap.get(tipo) || 0) + metodo.monto)
          })
        } else if (factura.metodo_pago) {
          metodosPagoMap.set(factura.metodo_pago, (metodosPagoMap.get(factura.metodo_pago) || 0) + (factura.total || 0))
        }
      })

      const coloresMetodos = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
      const metodosArray = Array.from(metodosPagoMap.entries()).map(([metodo, valor], index) => ({
        metodo,
        valor,
        porcentaje: (valor / ingresosTotales) * 100,
        color: coloresMetodos[index % coloresMetodos.length]
      }))

      setMetodosPago(metodosArray)

    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (!isHydrated || !isHydratedCustom) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: '#f8fafc' }}>
        <LoadingSpinner
          variant="minimal"
          message="Inicializando dashboard..."
          size={40}
          fullScreen
        />
      </div>
    )
  }

  if (loading) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" mb={3}>Dashboard</Typography>
        <LoadingSpinner
          variant="detailed"
          message="Cargando datos del dashboard..."
          size={50}
        />
      </Box>
    )
  }

  const statsCards = [
    {
      label: 'Total de Facturas',
      value: stats.totalFacturas,
      icon: '📄',
      color: 'linear-gradient(45deg, #3B82F6, #60A5FA)',
      change: '+12% vs mes anterior'
    },
    {
      label: 'Facturas Pagadas',
      value: stats.facturasPagadas,
      icon: '💰',
      color: 'linear-gradient(45deg, #10B981, #34D399)',
      change: `${stats.totalFacturas > 0 ? Math.round((stats.facturasPagadas / stats.totalFacturas) * 100) : 0}% del total`
    },
    {
      label: 'Facturas Pendientes',
      value: stats.facturasPendientes,
      icon: '⏳',
      color: 'linear-gradient(45deg, #F59E0B, #FBBF24)',
      change: `${stats.totalFacturas > 0 ? Math.round((stats.facturasPendientes / stats.totalFacturas) * 100) : 0}% del total`
    },
    {
      label: 'Ingresos Mes Actual',
      value: `$${stats.ingresosMensuales.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`,
      icon: '📊',
      color: 'linear-gradient(45deg, #8B5CF6, #A78BFA)',
      change: 'Facturas contado'
    }
  ]

  return (
    <div
      className="min-h-screen p-6 transition-colors duration-300"
      style={{ background: currentTheme.colors.background }}
    >
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1, color: '#1F2937' }}>
          📊 Dashboard Ejecutivo
        </Typography>
        <Typography variant="subtitle1" sx={{ color: '#6B7280' }}>
          Resumen de facturas e ingresos del taller
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((card, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              sx={{
                height: '100%',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                border: '1px solid #E5E7EB',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      background: card.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '1.5rem',
                      mr: 2
                    }}
                  >
                    {card.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                      {card.label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1F2937' }}>
                      {card.value}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" sx={{ color: '#059669' }}>
                  {card.change}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: '16px',
              background: 'white',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#1F2937' }}>
              📈 Ingresos Mensuales (Últimos 6 meses)
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ingresosMensuales}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="mes" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip
                    formatter={(value: any) => [`$${value.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`, 'Ingresos']}
                    labelStyle={{ color: '#1F2937' }}
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="ingresos"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorIngresos)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: '16px',
              background: 'white',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
              height: 'fit-content'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#1F2937' }}>
              💳 Métodos de Pago
            </Typography>
            {metodosPago.length > 0 ? (
              <>
                <Box sx={{ height: 200, mb: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={metodosPago}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="valor"
                        label={(entry: any) => `${entry.porcentaje.toFixed(1)}%`}
                      >
                        {metodosPago.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: any) => [`$${value.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`, 'Monto']}
                        contentStyle={{
                          background: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box>
                  {metodosPago.map((metodo, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          backgroundColor: metodo.color,
                          borderRadius: '50%',
                          mr: 1
                        }}
                      />
                      <Typography variant="caption" sx={{ flex: 1, color: '#6B7280' }}>
                        {metodo.metodo}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#1F2937' }}>
                        {metodo.porcentaje.toFixed(1)}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            ) : (
              <Typography variant="body2" sx={{ color: '#6B7280', textAlign: 'center' }}>
                No hay datos de métodos de pago
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: '16px',
              background: 'white',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold', color: '#1F2937' }}>
              💼 Resumen Financiero
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#10B981', mb: 1 }}>
                    ${stats.ingresosTotales.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    Ingresos Totales
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={100}
                    sx={{ mt: 1, backgroundColor: '#E5E7EB', '& .MuiLinearProgress-bar': { backgroundColor: '#10B981' } }}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#3B82F6', mb: 1 }}>
                    ${stats.promedioFactura.toLocaleString('es-DO', { minimumFractionDigits: 2 })}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    Promedio por Factura
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={75}
                    sx={{ mt: 1, backgroundColor: '#E5E7EB', '& .MuiLinearProgress-bar': { backgroundColor: '#3B82F6' } }}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#F59E0B', mb: 1 }}>
                    {stats.facturasPendientes}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    Facturas por Cobrar
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={stats.totalFacturas > 0 ? (stats.facturasPendientes / stats.totalFacturas) * 100 : 0}
                    sx={{ mt: 1, backgroundColor: '#E5E7EB', '& .MuiLinearProgress-bar': { backgroundColor: '#F59E0B' } }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </div>
  )
}
