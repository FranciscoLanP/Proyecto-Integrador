import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Typography,
    Box,
    IconButton,
    Tooltip
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Receipt as ReceiptIcon } from '@mui/icons-material';
import { PagoFactura } from '../services/pagoFacturaService';

interface HistorialPagosTableProps {
    pagos: PagoFactura[];
    loading?: boolean;
    onEdit?: (pago: PagoFactura) => void;
    onDelete?: (pagoId: string) => void;
    onViewReceipt?: (pago: PagoFactura) => void;
    showActions?: boolean;
}

const formatCurrency = (amount: number): string => {
    return `RD$${amount.toFixed(2)}`;
};

const formatDate = (dateString: string): string => {
    if (!dateString) return '-';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        return '-';
    }

    return date.toLocaleDateString('es-DO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const getMetodoPagoColor = (metodo: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (metodo) {
        case 'Efectivo':
            return 'success';
        case 'Tarjeta':
            return 'primary';
        case 'Transferencia':
            return 'info';
        case 'Cheque':
            return 'warning';
        default:
            return 'default';
    }
};

export const HistorialPagosTable: React.FC<HistorialPagosTableProps> = ({
    pagos,
    loading = false,
    onEdit,
    onDelete,
    onViewReceipt,
    showActions = false
}) => {
    if (loading) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>Cargando historial de pagos...</Typography>
            </Box>
        );
    }

    if (pagos.length === 0) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="textSecondary">
                    No se han registrado pagos para esta factura.
                </Typography>
            </Box>
        );
    }

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell><strong>Fecha</strong></TableCell>
                        <TableCell align="right"><strong>Monto</strong></TableCell>
                        <TableCell><strong>Método</strong></TableCell>
                        <TableCell><strong>Referencia</strong></TableCell>
                        <TableCell><strong>Observaciones</strong></TableCell>
                        {showActions && <TableCell align="center"><strong>Acciones</strong></TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {pagos.map((pago) => (
                        <TableRow key={pago._id} hover>
                            <TableCell>
                                <Typography variant="body2">
                                    {formatDate(pago.fechaPago)}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    {pago.createdAt && formatDate(pago.createdAt)}
                                </Typography>
                            </TableCell>

                            <TableCell align="right">
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                    {formatCurrency(pago.monto)}
                                </Typography>
                            </TableCell>

                            <TableCell>
                                <Chip
                                    label={pago.metodoPago}
                                    color={getMetodoPagoColor(pago.metodoPago)}
                                    size="small"
                                />
                            </TableCell>

                            <TableCell>
                                <Typography variant="body2">
                                    {pago.referenciaMetodo || '-'}
                                </Typography>
                            </TableCell>

                            <TableCell>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        maxWidth: 200,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                    title={pago.observaciones}
                                >
                                    {pago.observaciones || '-'}
                                </Typography>
                            </TableCell>

                            {showActions && (
                                <TableCell align="center">
                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                        {onViewReceipt && (
                                            <Tooltip title="Ver recibo de pago">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onViewReceipt(pago)}
                                                    color="info"
                                                >
                                                    <ReceiptIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {onEdit && (
                                            <Tooltip title="Editar pago">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onEdit(pago)}
                                                    color="primary"
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        {onDelete && (
                                            <Tooltip title="Eliminar pago">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onDelete(pago._id!)}
                                                    color="error"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
