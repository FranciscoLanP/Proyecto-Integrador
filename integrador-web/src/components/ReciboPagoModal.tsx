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
    onPrint?: (pago: PagoFactura) => void;
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
    onClose,
    onPrint
}) => {
    if (!pago) return null;

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
                {onPrint && (
                    <Button
                        variant="outlined"
                        startIcon={<PrintIcon />}
                        onClick={() => onPrint(pago)}
                    >
                        Imprimir
                    </Button>
                )}
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
