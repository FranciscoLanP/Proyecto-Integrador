import { createCrudService } from './crudService';

export interface PagoFactura {
    _id?: string;
    factura: string; // Cambiar de id_factura a factura para coincidir con backend
    fechaPago: string; // Cambiar de fecha_pago a fechaPago para coincidir con backend
    monto: number; // Cambiar de monto_pagado a monto para coincidir con backend
    metodoPago: 'efectivo' | 'tarjeta' | 'transferencia' | 'cheque'; // Cambiar de metodo_pago a metodoPago
    referenciaMetodo?: string; // Cambiar de referencia a referenciaMetodo
    observaciones?: string;
    createdAt?: string; // Cambiar de created_at a createdAt para coincidir con backend
    updatedAt?: string; // Cambiar de updated_at a updatedAt para coincidir con backend
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

// Crear servicio CRUD básico
export const pagoFacturaService = createCrudService<PagoFactura>('pagos-facturas');

// Servicios específicos para pagos
export const pagoFacturaCustomService = {
    // Obtener pagos por factura
    getPagosByFactura: async (facturaId: string): Promise<PagoFacturaResponse> => {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_BASE}/pagos-facturas/factura/${facturaId}`);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al obtener pagos de la factura: ${errorText}`);
        }
        return response.json();
    },

    // Crear nuevo pago con respuesta extendida
    createPago: async (pagoData: {
        facturaId: string;
        monto: number;
        metodoPago: string;
        fechaPago: string;
        referenciaMetodo?: string;
        observaciones?: string;
    }): Promise<CreatePagoResponse> => {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

        // Convertir fechaPago a fecha_pago para el backend
        const backendData = {
            ...pagoData,
            fecha_pago: pagoData.fechaPago
        };
        // Eliminar fechaPago del objeto que se envía al backend
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

    // Obtener resumen de pagos con filtros
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
