import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Box,
    Typography,
    Divider,
    Paper,
    Button,
    Chip
} from '@mui/material';
import {
    Close as CloseIcon,
    Print as PrintIcon,
    Receipt as ReceiptIcon
} from '@mui/icons-material';
import { PagoFactura } from '../services/pagoFacturaService';

interface ReciboPagoModalProps {
    open: boolean;
    pago: PagoFactura | null;
    facturaInfo?: {
        numero?: string;
        cliente?: string;
        total?: number;
        totalPagado?: number;
        vehiculo?: string;
        chasis?: string;
        fechaEmision?: string;
    };
    onClose: () => void;
}

const formatCurrency = (amount: number): string => {
    return `RD$${amount.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (dateString: string): string => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return '-';
    }

    return date.toLocaleDateString('es-DO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export const ReciboPagoModal: React.FC<ReciboPagoModalProps> = ({
    open,
    pago,
    facturaInfo,
    onClose
}) => {
    if (!pago) return null;

    const handlePrint = () => {
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
                        <div class="recibo-num">Recibo N° ${pago._id?.slice(-8).toUpperCase()}</div>
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
                        <div class="info-value">${facturaInfo?.cliente || '—'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Factura:</div>
                        <div class="info-value">#${facturaInfo?.numero || '—'}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Fecha Pago:</div>
                        <div class="info-value">${formatDate(pago.fechaPago)}</div>
                    </div>
                </div>

                <div class="pago-destacado">
                    <div class="pago-title">PAGO RECIBIDO</div>
                    <div class="pago-monto">${formatCurrency(pago.monto)}</div>
                    <div class="pago-metodo">
                        Método: <strong>${pago.metodoPago}</strong>
                        ${pago.referenciaMetodo ? ` | Referencia: <strong>${pago.referenciaMetodo}</strong>` : ''}
                    </div>
                </div>

                <div class="totales-section">
                    <div class="totales-table">
                        <div class="total-row">
                            <span class="total-label">TOTAL FACTURA:</span>
                            <span class="total-value">${formatCurrency(facturaInfo?.total || 0)}</span>
                        </div>
                        <div class="total-row">
                            <span class="total-label">TOTAL PAGADO:</span>
                            <span class="total-value">${formatCurrency(facturaInfo?.totalPagado || 0)}</span>
                        </div>
                        <div class="total-row">
                            <span class="total-label">ESTE PAGO:</span>
                            <span class="total-value color-success">${formatCurrency(pago.monto)}</span>
                        </div>
                        <div class="total-row">
                            <span class="total-label">SALDO PENDIENTE:</span>
                            <span class="total-value ${((facturaInfo?.total || 0) - (facturaInfo?.totalPagado || 0)) > 0 ? 'saldo-pendiente' : 'saldo-completo'}">
                                ${formatCurrency((facturaInfo?.total || 0) - (facturaInfo?.totalPagado || 0))}
                            </span>
                        </div>
                    </div>
                </div>

                ${pago.observaciones ? `
                <div class="observaciones">
                    <div class="observaciones-title">Observaciones</div>
                    <div class="observaciones-content">${pago.observaciones}</div>
                </div>
                ` : ''}

                <div class="firmas-section">
                    <div class="firmas-title">FIRMAS</div>
                    <div class="firmas-container">
                        <div class="firma-box">
                            <div class="firma-line"></div>
                            <div class="firma-label">FIRMA DEL CLIENTE</div>
                            <div class="firma-sublabel">${facturaInfo?.cliente || 'Cliente'}</div>
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
                    
                    ${((facturaInfo?.total || 0) - (facturaInfo?.totalPagado || 0)) > 0 ? `
                    <div class="status-alert status-warning">
                        ⚠️ PAGO PARCIAL - Saldo pendiente: ${formatCurrency((facturaInfo?.total || 0) - (facturaInfo?.totalPagado || 0))}
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
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: {
                    minHeight: '70vh'
                }
            }}
        >
            <DialogTitle
                sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReceiptIcon />
                    <Typography variant="h6">Recibo de Pago</Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 4 }}>
                <Box sx={{
                    border: '1px solid #ddd',
                    borderRadius: 2,
                    p: 3,
                    backgroundColor: '#fafafa'
                }}>
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '2px solid',
                        borderColor: 'primary.main',
                        pb: 2,
                        mb: 3
                    }}>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                JHS AutoServicios
                            </Typography>
                            <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold', mt: 0.5 }}>
                                RECIBO DE PAGO
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                                Recibo N° {pago._id?.slice(-8).toUpperCase()}
                            </Typography>
                            <Chip
                                label="PAGADO"
                                color="success"
                                sx={{ mt: 1, fontWeight: 'bold' }}
                                size="small"
                            />
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                Taller Mecánico
                            </Typography>
                            <Typography variant="body2">RNC: 123-45678-9</Typography>
                            <Typography variant="body2">Dirección: Calle Ficticia 123</Typography>
                            <Typography variant="body2">Tel: 555-123-4567</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, mb: 3 }}>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                Cliente:
                            </Typography>
                            <Typography variant="body2">{facturaInfo?.cliente || '—'}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                Factura:
                            </Typography>
                            <Typography variant="body2">#{facturaInfo?.numero || '—'}</Typography>
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                Fecha Pago:
                            </Typography>
                            <Typography variant="body2">{formatDate(pago.fechaPago)}</Typography>
                        </Box>
                    </Box>

                    <Paper sx={{
                        p: 1.5,
                        textAlign: 'center',
                        background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
                        borderLeft: '5px solid #4caf50',
                        mb: 2
                    }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#2e7d32', mb: 0.5 }}>
                            PAGO RECIBIDO
                        </Typography>
                        <Typography variant="h4" sx={{
                            fontWeight: 'bold',
                            color: 'primary.main',
                            my: 1
                        }}>
                            {formatCurrency(pago.monto)}
                        </Typography>
                        <Typography variant="body1">
                            Método: <strong>{pago.metodoPago}</strong>
                            {pago.referenciaMetodo && (
                                <> | Referencia: <strong>{pago.referenciaMetodo}</strong></>
                            )}
                        </Typography>
                    </Paper>

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                        <Paper sx={{ p: 1.5, minWidth: 350 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    TOTAL FACTURA:
                                </Typography>
                                <Typography variant="body2">{formatCurrency(facturaInfo?.total || 0)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    TOTAL PAGADO:
                                </Typography>
                                <Typography variant="body2">{formatCurrency(facturaInfo?.totalPagado || 0)}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    ESTE PAGO:
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                    {formatCurrency(pago.monto)}
                                </Typography>
                            </Box>
                            <Divider sx={{ my: 0.5 }} />
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                py: 0.5,
                                backgroundColor: '#e3f2fd',
                                px: 1,
                                borderRadius: 1
                            }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                    SALDO PENDIENTE:
                                </Typography>
                                <Typography variant="body2" sx={{
                                    fontWeight: 'bold',
                                    color: ((facturaInfo?.total || 0) - (facturaInfo?.totalPagado || 0)) > 0 ? '#f57c00' : '#4caf50'
                                }}>
                                    {formatCurrency((facturaInfo?.total || 0) - (facturaInfo?.totalPagado || 0))}
                                </Typography>
                            </Box>
                        </Paper>
                    </Box>

                    {pago.observaciones && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                                Observaciones
                            </Typography>
                            <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                                <Typography>{pago.observaciones}</Typography>
                            </Paper>
                        </Box>
                    )}

                    <Box sx={{
                        mb: 2,
                        p: 1.5,
                        border: '1px solid #ddd',
                        borderRadius: 2,
                        bgcolor: '#fafafa'
                    }}>
                        <Typography variant="subtitle1" sx={{
                            fontWeight: 'bold',
                            color: 'primary.main',
                            mb: 1,
                            textAlign: 'center',
                            borderBottom: '1px solid #eee',
                            pb: 0.5
                        }}>
                            FIRMAS
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 3
                        }}>
                            <Box sx={{ flex: 1, textAlign: 'center' }}>
                                <Box sx={{
                                    borderBottom: '2px solid #333',
                                    height: '35px',
                                    mb: 0.5
                                }} />
                                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                    FIRMA DEL CLIENTE
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                    {facturaInfo?.cliente || 'Cliente'}
                                </Typography>
                            </Box>
                            <Box sx={{ flex: 1, textAlign: 'center' }}>
                                <Box sx={{
                                    borderBottom: '2px solid #333',
                                    height: '35px',
                                    mb: 0.5
                                }} />
                                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                    FIRMA DEL EMPLEADO
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                    JHS AutoServicios
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ textAlign: 'center', color: 'text.secondary', borderTop: '1px solid #ddd', pt: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, color: 'primary.main' }}>
                            ¡Gracias por su pago!
                        </Typography>
                        <Typography variant="caption" sx={{ mb: 0.5, display: 'block' }}>
                            * Este recibo es válido como comprobante de pago.
                        </Typography>
                        <Typography variant="caption" sx={{ mb: 1, display: 'block' }}>
                            * Conserve este documento para sus registros.
                        </Typography>

                        {((facturaInfo?.total || 0) - (facturaInfo?.totalPagado || 0)) > 0 ? (
                            <Paper sx={{
                                p: 1,
                                bgcolor: '#fff3e0',
                                border: '1px solid #f57c00',
                                mb: 1
                            }}>
                                <Typography variant="caption" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                                    ⚠️ PAGO PARCIAL - Saldo pendiente: {formatCurrency((facturaInfo?.total || 0) - (facturaInfo?.totalPagado || 0))}
                                </Typography>
                            </Paper>
                        ) : (
                            <Paper sx={{
                                p: 1,
                                bgcolor: '#e8f5e8',
                                border: '1px solid #4caf50',
                                mb: 1
                            }}>
                                <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                    ✅ FACTURA COMPLETAMENTE PAGADA
                                </Typography>
                            </Paper>
                        )}

                        <Typography variant="caption" sx={{ display: 'block' }}>
                            Para consultas: info@jhsautoservicios.com
                        </Typography>
                        <Typography variant="caption">
                            Generado el {new Date().toLocaleString()}
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3, gap: 1 }}>
                <Button
                    variant="outlined"
                    startIcon={<PrintIcon />}
                    onClick={handlePrint}
                >
                    Imprimir
                </Button>
                <Button
                    variant="contained"
                    onClick={onClose}
                >
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReciboPagoModal;
