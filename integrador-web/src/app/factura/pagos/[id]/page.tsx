'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Container,
    Typography,
    Box,
    Button,
    Card,
    CardContent,
    Alert,
    Snackbar,
    CircularProgress,
    Fab,
    Breadcrumbs,
    Link,
    Divider
} from '@mui/material';
import {
    Add as AddIcon,
    ArrowBack as ArrowBackIcon,
    Receipt as ReceiptIcon
} from '@mui/icons-material';
import { usePagosFactura } from '../../../../hooks/usePagosFactura';
import { EstadoPagoResumen } from '../../../../components/EstadoPagoResumen';
import { HistorialPagosTable } from '../../../../components/HistorialPagosTable';
import { NuevoPagoModal } from '../../../../components/NuevoPagoModal';
import { ReciboPagoModal } from '../../../../components/ReciboPagoModal';
import { createCrudService } from '../../../../services/crudService';
import { PagoFactura } from '../../../../services/pagoFacturaService';

interface Factura {
    _id: string;
    id_reparacion: string;
    fecha_emision: string;
    total: number;
    estado?: string;
    tipo_factura: string;
    metodos_pago?: any[];
    detalles?: string;
    emitida?: boolean;
    descuento_porcentaje?: number;
    // Campos populados o computados
    numero_factura?: string;
    fecha_factura?: string;
    monto_total?: number;
    nombre_cliente?: string;
}

export default function PagosFacturaPage() {
    const params = useParams();
    const router = useRouter();
    const facturaId = params?.id as string;
    const crudService = createCrudService<Factura>('facturas');

    const [factura, setFactura] = useState<Factura | null>(null);
    const [loadingFactura, setLoadingFactura] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [reciboModalOpen, setReciboModalOpen] = useState(false);
    const [selectedPago, setSelectedPago] = useState<PagoFactura | null>(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error' | 'info' | 'warning'
    });

    const {
        pagos,
        totalPagado,
        cantidadPagos,
        loading,
        error,
        createPago,
        refreshPagos
    } = usePagosFactura({ facturaId });

    // Cargar información de la factura
    useEffect(() => {
        const loadFactura = async () => {
            if (!facturaId) return;

            try {
                setLoadingFactura(true);
                const facturaData = await crudService.fetchById!(facturaId);
                console.log('🔍 Datos de factura recibidos:', facturaData);
                console.log('🔍 Tipo de factura:', facturaData.tipo_factura);
                console.log('🔍 Campos disponibles:', Object.keys(facturaData));
                setFactura(facturaData);
            } catch (err) {
                setSnackbar({
                    open: true,
                    message: 'Error al cargar la información de la factura',
                    severity: 'error'
                });
            } finally {
                setLoadingFactura(false);
            }
        };

        loadFactura();
    }, [facturaId]);

    const handleCreatePago = async (pagoData: any) => {
        const response = await createPago(pagoData);

        if (response) {
            setSnackbar({
                open: true,
                message: 'Pago registrado exitosamente',
                severity: 'success'
            });

            setModalOpen(false);
        }
    };

    const handleViewReceipt = (pago: PagoFactura) => {
        setSelectedPago(pago);
        setReciboModalOpen(true);
    };

    const ultimoPago = pagos.length > 0 ? {
        fecha: pagos[0].fechaPago,
        monto: pagos[0].monto,
        metodo: pagos[0].metodoPago
    } : undefined;

    if (loadingFactura) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (!factura) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">
                    No se pudo cargar la información de la factura.
                </Alert>
            </Container>
        );
    }

    // Solo mostrar si es factura a crédito
    if (factura.tipo_factura !== 'Credito') {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="info">
                    Esta factura no requiere seguimiento de pagos ya que fue pagada de contado.
                </Alert>
                <Box sx={{ mt: 2 }}>
                    <Button
                        startIcon={<ArrowBackIcon />}
                        onClick={() => router.back()}
                    >
                        Volver
                    </Button>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Breadcrumbs */}
            <Breadcrumbs sx={{ mb: 3 }}>
                <Link
                    component="button"
                    variant="body1"
                    onClick={() => router.push('/factura')}
                    sx={{ textDecoration: 'none' }}
                >
                    Facturas
                </Link>
                <Typography color="text.primary">
                    Pagos - {factura.numero_factura}
                </Typography>
            </Breadcrumbs>

            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom>
                        <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Gestión de Pagos
                    </Typography>
                    <Typography variant="h6" color="textSecondary">
                        Factura: {factura._id} - {factura.nombre_cliente || 'Cliente N/A'}
                    </Typography>
                </Box>

                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.back()}
                    variant="outlined"
                >
                    Volver
                </Button>
            </Box>

            {/* Información de la factura */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Información de la Factura
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                        <Box>
                            <Typography variant="body2" color="textSecondary">Número</Typography>
                            <Typography variant="body1">{factura._id}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="body2" color="textSecondary">Cliente</Typography>
                            <Typography variant="body1">{factura.nombre_cliente || 'N/A'}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="body2" color="textSecondary">Fecha</Typography>
                            <Typography variant="body1">
                                {new Date(factura.fecha_emision || factura.fecha_factura || '').toLocaleDateString('es-DO')}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="body2" color="textSecondary">Estado</Typography>
                            <Typography variant="body1">{factura.estado || 'Pendiente'}</Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Resumen del estado de pago */}
            <Box sx={{ mb: 3 }}>
                <EstadoPagoResumen
                    montoTotal={factura.total || factura.monto_total || 0}
                    montoPagado={totalPagado}
                    cantidadPagos={cantidadPagos}
                    ultimoPago={ultimoPago}
                />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Historial de pagos */}
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            Historial de Pagos ({cantidadPagos})
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setModalOpen(true)}
                            disabled={totalPagado >= (factura.total || factura.monto_total || 0)}
                        >
                            Registrar Pago
                        </Button>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <HistorialPagosTable
                        pagos={pagos}
                        loading={loading}
                        showActions={true}
                        onViewReceipt={handleViewReceipt}
                    />
                </CardContent>
            </Card>

            {/* Floating Action Button para móviles */}
            <Fab
                color="primary"
                aria-label="registrar pago"
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    display: { xs: 'flex', md: 'none' }
                }}
                onClick={() => setModalOpen(true)}
                disabled={totalPagado >= (factura.total || factura.monto_total || 0)}
            >
                <AddIcon />
            </Fab>

            {/* Modal para nuevo pago */}
            <NuevoPagoModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleCreatePago}
                facturaId={facturaId}
                montoFactura={factura.total || factura.monto_total || 0}
                montoPagado={totalPagado}
                loading={loading}
            />

            {/* Snackbar para notificaciones */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Modal de recibo de pago */}
            <ReciboPagoModal
                open={reciboModalOpen}
                pago={selectedPago}
                facturaInfo={{
                    numero: factura?.numero_factura || factura?._id?.slice(-8),
                    cliente: factura?.nombre_cliente,
                    total: factura?.total || factura?.monto_total || 0,
                    totalPagado: totalPagado,
                    vehiculo: `${(factura as any)?.id_reparacion?.id_inspeccion?.id_recibo?.id_recepcion?.id_vehiculo?.id_modelo?.id_marca?.nombre_marca || ''} ${(factura as any)?.id_reparacion?.id_inspeccion?.id_recibo?.id_recepcion?.id_vehiculo?.id_modelo?.nombre_modelo || ''} ${(factura as any)?.id_reparacion?.id_inspeccion?.id_recibo?.id_recepcion?.id_vehiculo?.anio || ''}`.trim() || undefined,
                    chasis: (factura as any)?.id_reparacion?.id_inspeccion?.id_recibo?.id_recepcion?.id_vehiculo?.chasis,
                    fechaEmision: factura?.fecha_emision
                }}
                onClose={() => {
                    setReciboModalOpen(false);
                    setSelectedPago(null);
                }}
            />
        </Container>
    );
}
