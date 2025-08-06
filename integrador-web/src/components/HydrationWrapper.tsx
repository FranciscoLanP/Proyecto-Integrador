'use client';

import React, { useState, useEffect } from 'react';

interface HydrationWrapperProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function HydrationWrapper({
    children,
    fallback
}: HydrationWrapperProps) {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    if (!isHydrated) {
        return (
            <div>
                {fallback || (
                    <div
                        style={{
                            height: '100vh',
                            width: '100vw',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f0f9ff',
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            zIndex: 9999
                        }}
                    >
                        <div
                            style={{
                                width: '40px',
                                height: '40px',
                                border: '4px solid #e5e7eb',
                                borderTop: '4px solid #0ea5e9',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }}
                        />
                    </div>
                )}
            </div>
        );
    }

    return <>{children}</>;
}
