'use client';

import React from 'react';

interface HydrationWrapperProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function HydrationWrapper({
    children,
    fallback
}: HydrationWrapperProps) {
    // Simplemente pasamos los children directamente
    // La hidratación se maneja a nivel superior con NoSSR
    return <>{children}</>;
}
