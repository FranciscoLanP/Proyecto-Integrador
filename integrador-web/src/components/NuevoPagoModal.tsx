import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    Alert,
    InputAdornment
} from '@mui/material';

interface NuevoPagoModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (pago: {
        facturaId: string;
        monto: number;
        metodoPago: string;
        fechaPago: string;
        referenciaMetodo?: string;
        observaciones?: string;
    }) => Promise<void>;
    facturaId: string;
    montoFactura: number;
    montoPagado: number;
    loading?: boolean;
}

const metodosPago = [
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'tarjeta', label: 'Tarjeta de Crédito/Débito' },
    { value: 'transferencia', label: 'Transferencia Bancaria' },
    { value: 'cheque', label: 'Cheque' }
];

export const NuevoPagoModal: React.FC<NuevoPagoModalProps> = ({
    open,
    onClose,
    onSubmit,
    facturaId,
    montoFactura,
    montoPagado,
    loading = false
}) => {
    const [formData, setFormData] = useState({
        monto: '',
        metodoPago: '',
        referenciaMetodo: '',
        observaciones: '',
        fechaPago: new Date().toISOString().slice(0, 10) 
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const saldoPendiente = montoFactura - montoPagado;
    const montoNumerico = parseFloat(formData.monto) || 0;

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.monto || montoNumerico <= 0) {
            newErrors.monto = 'El monto debe ser mayor a 0';
        } else if (montoNumerico > saldoPendiente) {
            newErrors.monto = `El monto no puede ser mayor al saldo pendiente (RD$${saldoPendiente.toFixed(2)})`;
        }

        if (!formData.metodoPago) {
            newErrors.metodoPago = 'El método de pago es requerido';
        }

        if (['tarjeta', 'transferencia', 'cheque'].includes(formData.metodoPago) && !formData.referenciaMetodo) {
            newErrors.referenciaMetodo = 'La referencia es requerida para este método de pago';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const fechaPago = new Date(formData.fechaPago).toISOString();

            await onSubmit({
                facturaId,
                monto: montoNumerico,
                metodoPago: formData.metodoPago,
                fechaPago: fechaPago,
                referenciaMetodo: formData.referenciaMetodo || undefined,
                observaciones: formData.observaciones || undefined
            });

            setFormData({
                monto: '',
                metodoPago: '',
                referenciaMetodo: '',
                observaciones: '',
                fechaPago: new Date().toISOString().slice(0, 10) 
            });
            setErrors({});
            onClose();
        } catch (error) {
            console.error('Error al crear pago:', error);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Registrar Nuevo Pago</DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                            Monto Total de la Factura: <strong>RD${montoFactura.toFixed(2)}</strong>
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Total Pagado: <strong>RD${montoPagado.toFixed(2)}</strong>
                        </Typography>
                        <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                            Saldo Pendiente: RD${saldoPendiente.toFixed(2)}
                        </Typography>
                    </Box>

                    {saldoPendiente <= 0 && (
                        <Alert severity="info" sx={{ mb: 2 }}>
                            Esta factura ya está completamente pagada.
                        </Alert>
                    )}

                    <TextField
                        fullWidth
                        label="Monto a Pagar"
                        type="number"
                        value={formData.monto}
                        onChange={(e) => handleInputChange('monto', e.target.value)}
                        error={!!errors.monto}
                        helperText={errors.monto}
                        sx={{ mb: 2 }}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">RD$</InputAdornment>,
                            inputProps: {
                                min: 0,
                                max: saldoPendiente,
                                step: 0.01
                            }
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Fecha de Pago"
                        type="date"
                        value={formData.fechaPago}
                        onChange={(e) => handleInputChange('fechaPago', e.target.value)}
                        sx={{ mb: 2 }}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        helperText="Fecha en que se realizó el pago"
                    />

                    <FormControl fullWidth sx={{ mb: 2 }} error={!!errors.metodoPago}>
                        <InputLabel>Método de Pago</InputLabel>
                        <Select
                            value={formData.metodoPago}
                            onChange={(e) => handleInputChange('metodoPago', e.target.value)}
                            label="Método de Pago"
                        >
                            {metodosPago.map((metodo) => (
                                <MenuItem key={metodo.value} value={metodo.value}>
                                    {metodo.label}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.metodoPago && (
                            <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 0.5 }}>
                                {errors.metodoPago}
                            </Typography>
                        )}
                    </FormControl>

                    {['tarjeta', 'transferencia', 'cheque'].includes(formData.metodoPago) && (
                        <TextField
                            fullWidth
                            label={
                                formData.metodoPago === 'tarjeta' ? 'Número de Autorización' :
                                    formData.metodoPago === 'transferencia' ? 'Número de Referencia' :
                                        'Número de Cheque'
                            }
                            value={formData.referenciaMetodo}
                            onChange={(e) => handleInputChange('referenciaMetodo', e.target.value)}
                            error={!!errors.referenciaMetodo}
                            helperText={errors.referenciaMetodo}
                            sx={{ mb: 2 }}
                        />
                    )}

                    <TextField
                        fullWidth
                        label="Observaciones (Opcional)"
                        multiline
                        rows={3}
                        value={formData.observaciones}
                        onChange={(e) => handleInputChange('observaciones', e.target.value)}
                        placeholder="Notas adicionales sobre el pago..."
                    />
                </DialogContent>

                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || saldoPendiente <= 0}
                    >
                        {loading ? 'Procesando...' : 'Registrar Pago'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};
