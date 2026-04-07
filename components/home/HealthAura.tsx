import React from 'react';
import { motion } from 'framer-motion';

interface HealthAuraProps {
    healthScore: number; // 0 to 100
    isPatient: boolean;
}

export default function HealthAura({ healthScore, isPatient }: HealthAuraProps) {
    // تحديد لون الهالة بناءً على حالة المريض
    const getAuraColor = () => {
        if (!isPatient) return { primary: '#0d9488', secondary: '#4f46e5', tertiary: '#059669' }; // Visitor default (Teal/Indigo/Emerald)
        
        if (healthScore >= 80) return { primary: '#059669', secondary: '#10b981', tertiary: '#047857' }; // Excellent (Emerald variants)
        if (healthScore >= 50) return { primary: '#f59e0b', secondary: '#d97706', tertiary: '#fbbf24' }; // Warning (Amber variants)
        return { primary: '#dc2626', secondary: '#ef4444', tertiary: '#b91c1c' }; // Critical (Red variants)
    };

    const colors = getAuraColor();

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1]">
            <motion.div 
                className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]"
                style={{ 
                    backgroundImage: `linear-gradient(${colors.primary} 1px, transparent 1px), linear-gradient(90deg, ${colors.primary} 1px, transparent 1px)`,
                    backgroundSize: '32px 32px'
                }}
                animate={{ backgroundPosition: ['0px 0px', '32px 32px'] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />

            {/* Main Center Aura */}
            <motion.div
                className="absolute top-[10%] left-[20%] w-[60vw] h-[60vw] rounded-full mix-blend-screen dark:mix-blend-color-dodge filter blur-[80px] opacity-30 dark:opacity-20"
                style={{ background: `radial-gradient(circle, ${colors.primary} 0%, transparent 70%)` }}
                animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.35, 0.2],
                    x: [0, 20, -20, 0],
                    y: [0, -30, 10, 0]
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Secondary Pulse */}
            <motion.div
                className="absolute -top-[10%] right-[10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen dark:mix-blend-color-dodge filter blur-[70px] opacity-20"
                style={{ background: `radial-gradient(circle, ${colors.secondary} 0%, transparent 70%)` }}
                animate={{ 
                    scale: [1.2, 1, 1.2],
                    opacity: [0.15, 0.25, 0.15],
                    x: [0, -30, 20, 0]
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            />

            {/* Bottom Support Aura */}
            <motion.div
                className="absolute bottom-[0%] left-[10%] w-[70vw] h-[40vw] rounded-full mix-blend-screen dark:mix-blend-color-dodge filter blur-[90px] opacity-20"
                style={{ background: `radial-gradient(circle, ${colors.tertiary} 0%, transparent 60%)` }}
                animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.1, 0.2, 0.1],
                    y: [0, -40, 0]
                }}
                transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 5 }}
            />
            
            {/* Dark mode deep shadow layer */}
            <div className="hidden dark:block absolute inset-0 bg-gradient-to-b from-[#020617]/80 via-[#020617]/90 to-[#020617] z-[-1]" />
            <div className="dark:hidden absolute inset-0 bg-gradient-to-b from-[#F8FAFC]/60 via-[#F8FAFC]/80 to-[#F1F5F9] z-[-1]" />
        </div>
    );
}
