import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    LinearProgress,
    Chip,
    Grid,
    Divider
} from '@mui/material';
import {
    AccountBalance as MoneyIcon,
    Payment as PaymentIcon,
    Schedule as PendingIcon,
    CheckCircle as CompletedIcon
} from '@mui/icons-material';

interface EstadoPagoResumenProps {
    montoTotal: number;
    montoPagado: number;
    cantidadPagos: number;
    ultimoPago?: {
        fecha: string;
        monto: number;
        metodo: string;
    };
}

const formatCurrency = (amount: number | undefined): string => {
    if (amount === undefined || amount === null || isNaN(amount)) {
        return 'RD$0.00';
    }
    return `RD$${amount.toFixed(2)}`;
};

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-DO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export const EstadoPagoResumen: React.FC<EstadoPagoResumenProps> = ({
    montoTotal,
    montoPagado,
    cantidadPagos,
    ultimoPago
}) => {
    const saldoPendiente = montoTotal - montoPagado;
    const porcentajePagado = montoTotal > 0 ? (montoPagado / montoTotal) * 100 : 0;
    const estaCompletamentePagada = saldoPendiente <= 0;

    const getEstadoChip = () => {
        if (estaCompletamentePagada) {
            return (
                <Chip
                    icon={<CompletedIcon />}
                    label="PAGADA"
                    color="success"
                    variant="filled"
                    sx={{ fontWeight: 'bold' }}
                />
            );
        } else if (montoPagado > 0) {
            return (
                <Chip
                    icon={<PendingIcon />}
                    label="PAGO PARCIAL"
                    color="warning"
                    variant="filled"
                    sx={{ fontWeight: 'bold' }}
                />
            );
        } else {
            return (
                <Chip
                    icon={<PendingIcon />}
                    label="PENDIENTE"
                    color="error"
                    variant="filled"
                    sx={{ fontWeight: 'bold' }}
                />
            );
        }
    };

    return (
        <Card elevation={3}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <MoneyIcon color="primary" />
                        Estado de Pago
                    </Typography>
                    {getEstadoChip()}
                </Box>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Monto Total de la Factura
                            </Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                {formatCurrency(montoTotal)}
                            </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Total Pagado
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                {formatCurrency(montoPagado)}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Saldo Pendiente
                            </Typography>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 'bold',
                                    color: estaCompletamentePagada ? 'success.main' : 'error.main'
                                }}
                            >
                                {formatCurrency(saldoPendiente)}
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2" color="textSecondary">
                                    Progreso de Pago
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    {porcentajePagado.toFixed(1)}%
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={Math.min(porcentajePagado, 100)}
                                sx={{
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: 'grey.200',
                                    '& .MuiLinearProgress-bar': {
                                        backgroundColor: estaCompletamentePagada ? 'success.main' : 'primary.main'
                                    }
                                }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <PaymentIcon color="action" fontSize="small" />
                            <Typography variant="body2" color="textSecondary">
                                Cantidad de Pagos Realizados:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {cantidadPagos}
                            </Typography>
                        </Box>

                        {ultimoPago && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                                    Último Pago Registrado
                                </Typography>
                                <Box sx={{ pl: 1 }}>
                                    <Typography variant="body2">
                                        <strong>Fecha:</strong> {formatDate(ultimoPago.fecha)}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Monto:</strong> {formatCurrency(ultimoPago.monto)}
                                    </Typography>
                                    <Typography variant="body2">
                                        <strong>Método:</strong> {ultimoPago.metodo}
                                    </Typography>
                                </Box>
                            </>
                        )}
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};
