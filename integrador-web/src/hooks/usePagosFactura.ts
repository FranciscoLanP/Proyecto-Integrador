import { useState, useCallback, useEffect } from 'react';
import {
    PagoFactura,
    PagoFacturaResponse,
    CreatePagoResponse,
    pagoFacturaCustomService
} from '../services/pagoFacturaService';

export interface UsePagosFacturaProps {
    facturaId?: string;
}

export const usePagosFactura = ({ facturaId }: UsePagosFacturaProps = {}) => {
    const [pagos, setPagos] = useState<PagoFactura[]>([]);
    const [totalPagado, setTotalPagado] = useState<number>(0);
    const [cantidadPagos, setCantidadPagos] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Cargar pagos por factura
    const loadPagosByFactura = useCallback(async (idFactura: string) => {
        try {
            setLoading(true);
            setError(null);

            const response: PagoFacturaResponse = await pagoFacturaCustomService.getPagosByFactura(idFactura);

            setPagos(response.pagos);
            setTotalPagado(response.resumen.totalPagado);
            setCantidadPagos(response.pagos.length);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar pagos');
        } finally {
            setLoading(false);
        }
    }, []);

    // Crear nuevo pago
    const createPago = useCallback(async (pagoData: {
        facturaId: string;
        monto: number;
        metodoPago: string;
        fechaPago: string;
        referenciaMetodo?: string;
        observaciones?: string;
    }): Promise<CreatePagoResponse | null> => {
        try {
            setLoading(true);
            setError(null);

            const response = await pagoFacturaCustomService.createPago(pagoData);

            // Recargar pagos si estamos viendo una factura específica
            if (facturaId === pagoData.facturaId) {
                await loadPagosByFactura(facturaId);
            }

            return response;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al crear el pago');
            return null;
        } finally {
            setLoading(false);
        }
    }, [facturaId, loadPagosByFactura]);

    // Cargar pagos con filtros
    const loadPagosWithFilters = useCallback(async (filters: {
        factura?: string;
        metodoPago?: string;
        fecha_desde?: string;
        fecha_hasta?: string;
    }) => {
        try {
            setLoading(true);
            setError(null);

            const response = await pagoFacturaCustomService.getPagosWithFilters(filters);
            setPagos(response);

            // Calcular totales localmente
            const total = response.reduce((sum, pago) => sum + pago.monto, 0);
            setTotalPagado(total);
            setCantidadPagos(response.length);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar pagos');
        } finally {
            setLoading(false);
        }
    }, []);

    // Efecto para cargar pagos automáticamente cuando se proporciona facturaId
    useEffect(() => {
        if (facturaId) {
            loadPagosByFactura(facturaId);
        }
    }, [facturaId, loadPagosByFactura]);

    return {
        // Estado
        pagos,
        totalPagado,
        cantidadPagos,
        loading,
        error,

        // Acciones
        loadPagosByFactura,
        createPago,
        loadPagosWithFilters,

        // Utilidades
        clearError: () => setError(null),
        refreshPagos: facturaId ? () => loadPagosByFactura(facturaId) : () => { }
    };
};
