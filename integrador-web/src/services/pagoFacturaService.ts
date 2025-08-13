import { createCrudService } from './crudService';

export interface PagoFactura {
    _id?: string;
    factura: string; 
    fechaPago: string; 
    monto: number; 
    metodoPago: 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque'; 
    referenciaMetodo?: string; 
    observaciones?: string;
    createdAt?: string; 
    updatedAt?: string; 
}

export interface PagoFacturaResponse {
    pagos: PagoFactura[];
    totalPagado: number;
    cantidadPagos: number;
    resumen: {
        totalPagado: number;
        saldoPendiente: number;
        porcentajePagado: number;
    };
}

export interface CreatePagoResponse {
    message: string;
    data: PagoFactura;
}

export const pagoFacturaService = createCrudService<PagoFactura>('pagos-facturas');

export const pagoFacturaCustomService = {
    getPagosByFactura: async (facturaId: string): Promise<PagoFacturaResponse> => {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_BASE}/pagos-facturas/factura/${facturaId}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al obtener pagos de la factura: ${errorText}`);
        }
        return response.json();
    },

    createPago: async (pagoData: {
        facturaId: string;
        monto: number;
        metodoPago: string;
        fechaPago: string;
        referenciaMetodo?: string;
        observaciones?: string;
    }): Promise<CreatePagoResponse> => {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

        const backendData = {
            ...pagoData,
            fecha_pago: pagoData.fechaPago
        };
        delete (backendData as any).fechaPago;

        const response = await fetch(`${API_BASE}/pagos-facturas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(backendData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al crear el pago');
        }

        return response.json();
    },

    getPagosWithFilters: async (filters: {
        factura?: string;
        metodoPago?: string;
        fecha_desde?: string;
        fecha_hasta?: string;
    }): Promise<PagoFactura[]> => {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const queryParams = new URLSearchParams();

        Object.entries(filters).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
        });

        const response = await fetch(`${API_BASE}/pagos-facturas?${queryParams}`);
        if (!response.ok) {
            throw new Error('Error al obtener pagos');
        }
        return response.json();
    }
};
