import React, { useMemo, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function OrbBackdrop() {
    // Mouse tracking for reactive ambient
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);

    // Smooth springs for the mouse position to avoid jerky movements
    const springX = useSpring(mouseX, { stiffness: 40, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 40, damping: 20 });

    // Calculate parallax offsets (subtle shift based on mouse)
    const offsetX1 = useTransform(springX, [0, 1], [-30, 30]);
    const offsetY1 = useTransform(springY, [0, 1], [-30, 30]);

    const offsetX2 = useTransform(springX, [0, 1], [40, -40]);
    const offsetY2 = useTransform(springY, [0, 1], [40, -40]);

    const offsetX3 = useTransform(springX, [0, 1], [-15, 15]);
    const offsetY3 = useTransform(springY, [0, 1], [-15, 15]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX / window.innerWidth);
            mouseY.set(e.clientY / window.innerHeight);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {/* Canvas base — Alabaster */}
            <div className="absolute inset-0" style={{ backgroundColor: '#FBFDFD' }} />

            {/* Teal Intelligence (Reacts strongly, inversely) */}
            <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 18, ease: 'easeInOut' }}
                className="absolute -top-[20%] -right-[10%] w-[650px] h-[650px] rounded-full pointer-events-none"
                style={{
                    x: offsetX2, y: offsetY2,
                    background: 'radial-gradient(circle, rgba(43,154,137,0.18) 0%, rgba(43,154,137,0) 70%)',
                    filter: 'blur(60px)',
                }}
            />

            {/* Azure Oxygen (Reacts normally) */}
            <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 22, ease: 'easeInOut', delay: 4 }}
                className="absolute -bottom-[25%] -left-[15%] w-[700px] h-[700px] rounded-full pointer-events-none"
                style={{
                    x: offsetX1, y: offsetY1,
                    background: 'radial-gradient(circle, rgba(59,130,246,0.10) 0%, rgba(59,130,246,0) 70%)',
                    filter: 'blur(80px)',
                }}
            />

            {/* Rose Warmth (Reacts slightly) */}
            <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ repeat: Infinity, duration: 14, ease: 'easeInOut', delay: 8 }}
                className="absolute top-[30%] left-[15%] w-[500px] h-[500px] rounded-full pointer-events-none"
                style={{
                    x: offsetX3, y: offsetY3,
                    background: 'radial-gradient(circle, rgba(244,63,94,0.06) 0%, rgba(244,63,94,0) 70%)',
                    filter: 'blur(100px)',
                }}
            />

            {/* Gold Vitality (Static ambient) */}
            <motion.div
                animate={{ scale: [1, 1.04, 1], x: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 20, ease: 'easeInOut', delay: 12 }}
                className="absolute top-[60%] right-[20%] w-[350px] h-[350px] rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(251,191,36,0.04) 0%, rgba(251,191,36,0) 70%)',
                    filter: 'blur(90px)',
                }}
            />

            {/* Violet Calm (Static ambient) */}
            <motion.div
                animate={{ scale: [1, 1.03, 1], y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 25, ease: 'easeInOut', delay: 6 }}
                className="absolute -top-[5%] left-[30%] w-[400px] h-[400px] rounded-full pointer-events-none"
                style={{
                    background: 'radial-gradient(circle, rgba(139,92,246,0.03) 0%, rgba(139,92,246,0) 70%)',
                    filter: 'blur(110px)',
                }}
            />

            {/* Mouse-following interaction glow */}
            <motion.div
                className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
                style={{
                    x: useTransform(springX, v => (typeof window !== 'undefined' ? v * window.innerWidth : v * 1000) - 200),
                    y: useTransform(springY, v => (typeof window !== 'undefined' ? v * window.innerHeight : v * 1000) - 200),
                    background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 60%)',
                    mixBlendMode: 'overlay',
                }}
            />

            {/* Noise texture overlay for organic feel */}
            <div
                className="absolute inset-0 mix-blend-soft-light pointer-events-none"
                style={{
                    opacity: 0.015,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat',
                }}
            />

            {/* Top-edge specular highlight */}
            <div
                className="absolute top-0 left-0 right-0 h-[200px] pointer-events-none"
                style={{
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, transparent 100%)',
                }}
            />

            {/* Very subtle radial vignette */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 50%, rgba(16,24,34,0.015) 100%)',
                }}
            />
        </div>
    );
}
