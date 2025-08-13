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

            const total = response.reduce((sum, pago) => sum + pago.monto, 0);
            setTotalPagado(total);
            setCantidadPagos(response.length);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar pagos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (facturaId) {
            loadPagosByFactura(facturaId);
        }
    }, [facturaId, loadPagosByFactura]);

    return {
        pagos,
        totalPagado,
        cantidadPagos,
        loading,
        error,

        loadPagosByFactura,
        createPago,
        loadPagosWithFilters,

        clearError: () => setError(null),
        refreshPagos: facturaId ? () => loadPagosByFactura(facturaId) : () => { }
    };
};
