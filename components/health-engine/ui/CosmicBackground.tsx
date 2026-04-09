// components/health-engine/ui/CosmicBackground.tsx
// Deep dark space ambient background — premium and immersive

'use client';
import { motion } from 'framer-motion';

export function CosmicBackground() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
            {/* Deep void */}
            <div className="absolute inset-0" style={{ background: '#020617' }} />

            {/* Primary teal nebula (top) */}
            <div className="absolute top-0 inset-x-0 h-[50vh]"
                style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(13,148,136,0.18) 0%, transparent 70%)' }} />

            {/* Secondary indigo nebula (bottom-left) */}
            <div className="absolute bottom-0 left-0 w-[60vw] h-[40vh]"
                style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.10) 0%, transparent 70%)' }} />

            {/* Floating particles */}
            {[...Array(16)].map((_, i) => (
                <motion.div key={i}
                    className="absolute rounded-full bg-white"
                    style={{
                        width: Math.random() * 1.5 + 0.5,
                        height: Math.random() * 1.5 + 0.5,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        opacity: Math.random() * 0.4 + 0.05,
                    }}
                    animate={{ y: [0, -(Math.random() * 40 + 15)], opacity: [null, 0] }}
                    transition={{
                        duration: Math.random() * 12 + 10,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: Math.random() * 10,
                    }}
                />
            ))}
        </div>
    );
}
