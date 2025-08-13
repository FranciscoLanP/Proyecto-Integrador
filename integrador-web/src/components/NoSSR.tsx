'use client';

import React, { useState, useEffect } from 'react';

interface NoSSRProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Componente que evita el renderizado en el servidor (SSR) para prevenir
 * problemas de hidratación cuando el contenido depende del estado del cliente
 */
export default function NoSSR({ children, fallback = null }: NoSSRProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
