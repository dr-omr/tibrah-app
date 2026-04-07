'use client';

import React, { useEffect, useState } from 'react';

/**
 * Aurora Background Engine
 * Injects a highly sophisticated, slowly breathing mesh gradient behind all liquid glass panels.
 * Features built-in system theme detection.
 */
export function AuroraBackground() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Only render fluid animation if component has mounted to prevent hydration errors on SSR.
    if (!mounted) {
        return <div className="fixed inset-0 bg-gray-50 dark:bg-[#0f1115] -z-50" />;
    }

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden bg-[#fafafa] dark:bg-[#0f1115] transition-colors duration-1000">
            {/* Pure, absolute high-fidelity static mesh gradient. Unbelievably smooth and artifact-free. */}
            <div 
                className="absolute inset-0 opacity-[0.6] dark:opacity-[0.25]"
                style={{
                    background: `
                        radial-gradient(circle at 15% 50%, rgba(20, 184, 166, 0.08), transparent 50%),
                        radial-gradient(circle at 85% 30%, rgba(139, 92, 246, 0.08), transparent 50%),
                        radial-gradient(circle at 50% 80%, rgba(14, 165, 233, 0.06), transparent 50%)
                    `,
                    filter: 'blur(60px)',
                    transform: 'translateZ(0)',
                }}
            />
            {/* Ambient Base Tone */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 via-transparent to-purple-50/20 dark:from-teal-900/10 dark:to-purple-900/10" />
        </div>
    );
}
