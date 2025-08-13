'use client';

import { useEffect, useLayoutEffect } from 'react';


export const useIsomorphicLayoutEffect =
    typeof window !== 'undefined' ? useLayoutEffect : useEffect;


export function useIsClient() {
    return typeof window !== 'undefined';
}
