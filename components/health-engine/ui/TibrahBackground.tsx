// components/health-engine/ui/TibrahBackground.tsx
// THIE — Tibrah's signature light ambient background
// Matches the established brand identity: clean white + teal glows

'use client';
import { motion } from 'framer-motion';

export function TibrahBackground() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden>
            {/* Base white */}
            <div className="absolute inset-0" style={{ background: '#F7FAFA' }} />

            {/* Primary teal orb — top */}
            <div className="absolute top-0 inset-x-0 h-72"
                style={{ background: 'radial-gradient(ellipse 80% 70% at 50% -5%, rgba(13,148,136,0.12) 0%, transparent 100%)' }} />

            {/* Indigo orb — bottom right */}
            <div className="absolute bottom-0 right-0 w-[55vw] h-[35vh]"
                style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 70%)' }} />

            {/* Subtle floating orbs */}
            {[
                { x: '-5%', y: '25%', color: 'rgba(13,148,136,0.06)', size: 300 },
                { x: '75%', y: '55%', color: 'rgba(99,102,241,0.05)', size: 240 },
            ].map((orb, i) => (
                <motion.div key={i}
                    className="absolute rounded-full"
                    style={{
                        left: orb.x, top: orb.y,
                        width: orb.size, height: orb.size,
                        background: orb.color,
                        filter: 'blur(60px)',
                    }}
                    animate={{ scale: [1, 1.12, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 8 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
                />
            ))}
        </div>
    );
}
