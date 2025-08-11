'use client';

import { useEffect, useLayoutEffect } from 'react';

/**
 * Hook que usa useLayoutEffect en el cliente y useEffect en el servidor
 * para evitar warnings de hidratación
 */
export const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Hook para verificar si estamos en el cliente
 */
export function useIsClient() {
    return typeof window !== 'undefined';
}
