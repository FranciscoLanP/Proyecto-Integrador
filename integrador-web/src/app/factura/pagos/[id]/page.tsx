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


    const [showPrintWarning, setShowPrintWarning] = useState(false);
    const [pagoToPrint, setPagoToPrint] = useState<PagoFactura | null>(null);

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
        setPagoToPrint(pago);
        setShowPrintWarning(true);
    };

    const proceedWithPrint = () => {
        if (!pagoToPrint) return;

        setShowPrintWarning(false);

        const formatCurrency = (amount: number): string => {
            return `RD$${amount.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        };

        const formatDate = (dateString: string): string => {
            if (!dateString) return '-';
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '-';
            return date.toLocaleDateString('es-DO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        };

        const reciboHTML = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Recibo de Pago - JHS AutoServicios</title>
                <style>
                    @page {
                        size: A4;
                        margin: 15mm;
                    }
                    
                    body {
                        font-family: "Segoe UI", Tahoma, sans-serif;
                        font-size: 12px;
                        line-height: 1.4;
                        margin: 0;
                        padding: 20px;
                        color: #222;
                        background: white;
                    }
                    
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 20px;
                        border-bottom: 2px solid #1976d2;
                        padding-bottom: 15px;
                    }
                    
                    .logo-section h1 {
                        font-size: 28px;
                        color: #1976d2;
                        margin: 0;
                        font-weight: bold;
                    }
                    
                    .logo-section h2 {
                        font-size: 20px;
                        color: #1976d2;
                        margin: 5px 0;
                        font-weight: bold;
                    }
                    
                    .logo-section .recibo-num {
                        font-size: 11px;
                        color: #666;
                        margin: 5px 0;
                    }
                    
                    .status-chip {
                        background: #4caf50;
                        color: white;
                        padding: 4px 12px;
                        border-radius: 15px;
                        font-size: 11px;
                        font-weight: bold;
                        display: inline-block;
                        margin-top: 8px;
                    }
                    
                    .company-info {
                        text-align: right;
                        font-size: 11px;
                    }
                    
                    .company-info .title {
                        font-size: 13px;
                        font-weight: bold;
                        color: #1976d2;
                        margin-bottom: 5px;
                    }
                    
                    .info-grid {
                        display: flex;
                        gap: 30px;
                        margin: 20px 0;
                        flex-wrap: wrap;
                    }
                    
                    .info-item {
                        flex: 1;
                        min-width: 150px;
                    }
                    
                    .info-label {
                        font-weight: bold;
                        color: #1976d2;
                        font-size: 11px;
                        margin-bottom: 3px;
                    }
                    
                    .info-value {
                        font-size: 11px;
                        color: #333;
                    }
                    
                    .pago-destacado {
                        background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%);
                        border-left: 5px solid #4caf50;
                        padding: 12px;
                        text-align: center;
                        margin: 15px 0;
                        border-radius: 8px;
                    }
                    
                    .pago-title {
                        font-size: 14px;
                        color: #2e7d32;
                        font-weight: bold;
                        margin-bottom: 6px;
                    }
                    
                    .pago-monto {
                        font-size: 24px;
                        color: #1976d2;
                        font-weight: bold;
                        margin: 8px 0;
                    }
                    
                    .pago-metodo {
                        font-size: 12px;
                        color: #333;
                        margin-top: 6px;
                    }
                    
                    .totales-section {
                        display: flex;
                        justify-content: flex-end;
                        margin: 15px 0;
                    }
                    
                    .totales-table {
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        padding: 12px;
                        background: #fafafa;
                        min-width: 350px;
                    }
                    
                    .total-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 5px 0;
                        border-bottom: 1px solid #eee;
                        font-size: 11px;
                    }
                    
                    .total-row:last-child {
                        border-bottom: none;
                        background: #e3f2fd;
                        margin: 6px -8px -8px -8px;
                        padding: 8px;
                        border-radius: 0 0 6px 6px;
                    }
                    
                    .total-label {
                        font-weight: bold;
                        color: #1976d2;
                    }
                    
                    .total-value {
                        font-weight: bold;
                    }
                    
                    .saldo-pendiente {
                        color: #f57c00;
                    }
                    
                    .saldo-completo {
                        color: #4caf50;
                    }
                    
                    .observaciones {
                        margin: 20px 0;
                    }
                    
                    .observaciones-title {
                        font-size: 14px;
                        color: #1976d2;
                        font-weight: bold;
                        margin-bottom: 8px;
                    }
                    
                    .observaciones-content {
                        background: #f8f9fa;
                        padding: 15px;
                        border-radius: 6px;
                        border: 1px solid #e9ecef;
                        font-size: 11px;
                    }
                    
                    .firmas-section {
                        margin: 15px 0 10px 0;
                        padding: 12px;
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        background: #fafafa;
                    }
                    
                    .firmas-title {
                        font-size: 12px;
                        color: #1976d2;
                        font-weight: bold;
                        margin-bottom: 10px;
                        text-align: center;
                        border-bottom: 1px solid #eee;
                        padding-bottom: 6px;
                    }
                    
                    .firmas-container {
                        display: flex;
                        justify-content: space-between;
                        gap: 20px;
                    }
                    
                    .firma-box {
                        flex: 1;
                        text-align: center;
                    }
                    
                    .firma-line {
                        border-bottom: 2px solid #333;
                        height: 35px;
                        margin-bottom: 6px;
                        position: relative;
                    }
                    
                    .firma-label {
                        font-size: 10px;
                        color: #333;
                        font-weight: bold;
                        margin-top: 3px;
                    }
                    
                    .firma-sublabel {
                        font-size: 9px;
                        color: #666;
                        margin-top: 2px;
                    }
                    
                    .footer {
                        text-align: center;
                        margin-top: 15px;
                        padding-top: 10px;
                        border-top: 1px solid #ddd;
                        font-size: 11px;
                        color: #666;
                    }
                    
                    .footer-title {
                        font-size: 14px;
                        color: #1976d2;
                        font-weight: bold;
                        margin-bottom: 6px;
                    }
                    
                    .status-alert {
                        padding: 15px;
                        border-radius: 6px;
                        margin: 15px 0;
                        text-align: center;
                        font-weight: bold;
                        font-size: 12px;
                    }
                    
                    .status-warning {
                        background: #fff3e0;
                        border: 1px solid #f57c00;
                        color: #f57c00;
                    }
                    
                    .status-success {
                        background: #e8f5e8;
                        border: 1px solid #4caf50;
                        color: #4caf50;
                    }
                    
                    @media print {
                        body { font-size: 11px; }
                        .header { margin-bottom: 15px; padding-bottom: 10px; }
                        .pago-destacado { margin: 15px 0; padding: 20px; }
                        .totales-section { margin: 15px 0; }
                        .footer { margin-top: 20px; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo-section">
                        <h1>JHS AutoServicios</h1>
                        <h2>RECIBO DE PAGO</h2>
                        <div class="recibo-num">Recibo N° ${pagoToPrint._id?.slice(-8).toUpperCase()}</div>
                        <span class="status-chip">PAGADO</span>
                    </div>
                    <div class="company-info">
                        <div class="title">Taller Mecánico</div>
                        <div>RNC: 123-45678-9</div>
                        <div>Dirección: Calle Ficticia 123</div>
                        <div>Tel: 555-123-4567</div>
                    </div>
                </div>

                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Cliente:</div>
                        <div class="info-value">${factura?.nombre_cliente || '—'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Factura:</div>
                        <div class="info-value">#${factura?.numero_factura || factura?._id?.slice(-8) || '—'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Fecha Pago:</div>
                        <div class="info-value">${formatDate(pagoToPrint.fechaPago)}</div>
                    </div>
                </div>

                <div class="pago-destacado">
                    <div class="pago-title">PAGO RECIBIDO</div>
                    <div class="pago-monto">${formatCurrency(pagoToPrint.monto)}</div>
                    <div class="pago-metodo">
                        Método: <strong>${pagoToPrint.metodoPago}</strong>
                        ${pagoToPrint.referenciaMetodo ? ` | Referencia: <strong>${pagoToPrint.referenciaMetodo}</strong>` : ''}
                    </div>
                </div>

                <div class="totales-section">
                    <div class="totales-table">
                        <div class="total-row">
                            <span class="total-label">TOTAL FACTURA:</span>
                            <span class="total-value">${formatCurrency(factura?.total || factura?.monto_total || 0)}</span>
                        </div>
                        <div class="total-row">
                            <span class="total-label">TOTAL PAGADO:</span>
                            <span class="total-value">${formatCurrency(totalPagado)}</span>
                        </div>
                        <div class="total-row">
                            <span class="total-label">ESTE PAGO:</span>
                            <span class="total-value color-success">${formatCurrency(pagoToPrint.monto)}</span>
                        </div>
                        <div class="total-row">
                            <span class="total-label">SALDO PENDIENTE:</span>
                            <span class="total-value ${((factura?.total || factura?.monto_total || 0) - totalPagado) > 0 ? 'saldo-pendiente' : 'saldo-completo'}">
                                ${formatCurrency((factura?.total || factura?.monto_total || 0) - totalPagado)}
                            </span>
                        </div>
                    </div>
                </div>

                ${pagoToPrint.observaciones ? `
                <div class="observaciones">
                    <div class="observaciones-title">Observaciones</div>
                    <div class="observaciones-content">${pagoToPrint.observaciones}</div>
                </div>
                ` : ''}

                <div class="firmas-section">
                    <div class="firmas-title">FIRMAS</div>
                    <div class="firmas-container">
                        <div class="firma-box">
                            <div class="firma-line"></div>
                            <div class="firma-label">FIRMA DEL CLIENTE</div>
                            <div class="firma-sublabel">${factura?.nombre_cliente || 'Cliente'}</div>
                        </div>
                        <div class="firma-box">
                            <div class="firma-line"></div>
                            <div class="firma-label">FIRMA DEL EMPLEADO</div>
                            <div class="firma-sublabel">JHS AutoServicios</div>
                        </div>
                    </div>
                </div>

                <div class="footer">
                    <div class="footer-title">¡Gracias por su pago!</div>
                    <div>* Este recibo es válido como comprobante de pago.</div>
                    <div>* Conserve este documento para sus registros.</div>
                    
                    ${((factura?.total || factura?.monto_total || 0) - totalPagado) > 0 ? `
                    <div class="status-alert status-warning">
                        ⚠️ PAGO PARCIAL - Saldo pendiente: ${formatCurrency((factura?.total || factura?.monto_total || 0) - totalPagado)}
                    </div>
                    ` : `
                    <div class="status-alert status-success">
                        ✅ FACTURA COMPLETAMENTE PAGADA
                    </div>
                    `}
                    
                    <div style="margin-top: 15px;">
                        <div>Para consultas: info@jhsautoservicios.com</div>
                        <div>Generado el ${new Date().toLocaleString()}</div>
                    </div>
                </div>

                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() {
                            window.close();
                        }
                    }
                </script>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (printWindow) {
            printWindow.document.write(reciboHTML);
            printWindow.document.close();
        }

        // Limpiar la selección
        setPagoToPrint(null);
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

            <Box sx={{ mb: 3 }}>
                <EstadoPagoResumen
                    montoTotal={factura.total || factura.monto_total || 0}
                    montoPagado={totalPagado}
                    cantidadPagos={cantidadPagos}
                    ultimoPago={ultimoPago}
                />
            </Box>

            <Divider sx={{ my: 3 }} />

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

            <NuevoPagoModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleCreatePago}
                facturaId={facturaId}
                montoFactura={factura.total || factura.monto_total || 0}
                montoPagado={totalPagado}
                loading={loading}
            />

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

            {/* Modal de advertencia de impresión */}
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    display: showPrintWarning ? 'flex' : 'none',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999
                }}
            >
                <Box
                    sx={{
                        backgroundColor: 'white',
                        borderRadius: 3,
                        padding: 4,
                        maxWidth: 500,
                        width: '90%',
                        textAlign: 'center',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                    }}
                >
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
                    <h2 style={{
                        color: '#1976d2',
                        marginBottom: '16px',
                        fontSize: '1.5rem'
                    }}>
                        Importante - Impresión de Recibo
                    </h2>
                    <p style={{
                        color: '#666',
                        marginBottom: '24px',
                        fontSize: '1.1rem',
                        lineHeight: 1.5
                    }}>
                        <strong>Recuerde cerrar la pestaña de impresión si no la utilizará.</strong>
                        <br /><br />
                        Dejar pestañas de impresión abiertas puede causar problemas de rendimiento en la aplicación.
                    </p>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <button
                            onClick={() => {
                                setShowPrintWarning(false);
                                setPagoToPrint(null);
                            }}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#666',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#555'}
                            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#666'}
                        >
                            ❌ Cancelar
                        </button>

                        <button
                            onClick={proceedWithPrint}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: '#1976d2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1565c0'}
                            onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#1976d2'}
                        >
                            🧾 Continuar con Impresión
                        </button>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
}
