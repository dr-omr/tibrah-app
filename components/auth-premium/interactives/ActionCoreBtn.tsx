import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Haptics } from '../utils/haptics';

interface ActionCoreBtnProps {
    loading: boolean;
    disabled?: boolean;
    label: string | React.ReactNode;
    type?: 'submit' | 'button';
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
    variant?: 'primary' | 'secondary';
}

export default function ActionCoreBtn({
    loading, disabled = false, label,
    type = 'button', onClick, className = '', variant = 'primary',
}: ActionCoreBtnProps) {
    const isDisabled = loading || disabled;
    const btnRef = useRef<HTMLButtonElement>(null);

    // Mouse-follow spotlight effect (primary only)
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);
    const spotlightX = useTransform(mouseX, [0, 1], ['0%', '100%']);
    const spotlightY = useTransform(mouseY, [0, 1], ['0%', '100%']);

    useEffect(() => {
        const el = btnRef.current;
        if (!el || variant !== 'primary') return;

        const handler = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            mouseX.set((e.clientX - rect.left) / rect.width);
            mouseY.set((e.clientY - rect.top) / rect.height);
        };
        el.addEventListener('mousemove', handler);
        return () => el.removeEventListener('mousemove', handler);
    }, [variant, mouseX, mouseY]);

    return (
        <motion.button
            ref={btnRef}
            whileHover={!isDisabled ? { scale: 1.012, y: -1 } : {}}
            whileTap={!isDisabled ? { scale: 0.96 } : {}}
            onTapStart={() => !isDisabled && Haptics.selection()}
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            className={`relative w-full h-[60px] rounded-2xl font-bold text-[14px] flex items-center justify-center overflow-hidden transition-opacity group ${className}`}
            style={{
                opacity: isDisabled ? 0.4 : 1,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                ...(variant === 'primary' ? {
                    background: 'linear-gradient(160deg, #1E2A38 0%, #101822 100%)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.06)',
                    boxShadow: '0 12px 30px rgba(16,24,34,0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
                } : {
                    background: 'rgba(251,253,253,0.7)',
                    color: '#101822',
                    border: '1px solid rgba(16,24,34,0.08)',
                    boxShadow: '0 2px 8px rgba(16,24,34,0.04)',
                    backdropFilter: 'blur(16px)',
                })
            }}
        >
            {/* Mouse-follow spotlight (primary) */}
            {variant === 'primary' && !isDisabled && (
                <motion.div
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                        background: `radial-gradient(circle 80px at ${spotlightX.get()} ${spotlightY.get()}, rgba(43,154,137,0.12) 0%, transparent 100%)`,
                    }}
                />
            )}

            {/* Shimmer wipe (primary) */}
            {variant === 'primary' && !isDisabled && (
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)',
                        backgroundSize: '200% 100%',
                    }}
                    animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: 'linear', repeatDelay: 1.5 }}
                />
            )}

            {/* Top edge highlight */}
            {variant === 'primary' && (
                <div className="absolute top-0 left-[10%] right-[10%] h-px pointer-events-none"
                     style={{ background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)' }} />
            )}

            {/* Teal glow dot (primary only) */}
            {variant === 'primary' && !isDisabled && (
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute top-3 right-4 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: '#2B9A89', boxShadow: '0 0 8px rgba(43,154,137,0.8)' }}
                />
            )}

            {/* Secondary hover teal underline */}
            {variant === 'secondary' && !isDisabled && (
                <div className="absolute bottom-0 left-[15%] right-[15%] h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                     style={{ backgroundColor: 'rgba(43,154,137,0.15)' }} />
            )}

            {/* Content */}
            <AnimatePresence mode="wait">
                {loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex items-center gap-2.5"
                    >
                        <Loader2 className="w-4 h-4 animate-spin" style={{ color: variant === 'primary' ? '#2B9A89' : '#64748B' }} />
                        <span className="text-[11px] uppercase tracking-widest opacity-70">جاري التحقق...</span>
                    </motion.div>
                ) : (
                    <motion.div
                        key="label"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                    >
                        {label}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}
