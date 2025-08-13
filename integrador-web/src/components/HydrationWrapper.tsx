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
    return <>{children}</>;
}
