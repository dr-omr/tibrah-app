// components/health-engine/ui/BottomCTA.tsx
// ════════════════════════════════════════════════════════════════
// TIBRAH — Water Glass Bottom CTA
// يرتفع فوق الـ bottom nav (64px) · زجاجي مائي شفاف
// ════════════════════════════════════════════════════════════════
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';

interface Props {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    variant?: 'teal' | 'gradient' | 'red';
    sublabel?: string;
}

// كل variant زجاجي مائي شفاف — لا لون صلب
const VARIANTS = {
    teal: {
        glass:    'linear-gradient(150deg, rgba(255,255,255,0.82) 0%, rgba(186,230,253,0.72) 40%, rgba(8,145,178,0.58) 100%)',
        border:   'rgba(255,255,255,0.92)',
        shadow:   'rgba(8,145,178,0.26)',
        text:     '#073B52',
        iconBg:   'rgba(255,255,255,0.40)',
        iconBorder:'rgba(255,255,255,0.72)',
        iconColor: '#0F6F8F',
    },
    gradient: {
        glass:    'linear-gradient(150deg, rgba(255,255,255,0.82) 0%, rgba(186,230,253,0.66) 36%, rgba(8,145,178,0.52) 65%, rgba(129,140,248,0.58) 100%)',
        border:   'rgba(255,255,255,0.92)',
        shadow:   'rgba(8,145,178,0.22)',
        text:     '#073B52',
        iconBg:   'rgba(255,255,255,0.38)',
        iconBorder:'rgba(255,255,255,0.70)',
        iconColor: '#0F6F8F',
    },
    red: {
        glass:    'linear-gradient(150deg, rgba(255,255,255,0.82) 0%, rgba(254,202,202,0.72) 40%, rgba(220,38,38,0.55) 100%)',
        border:   'rgba(255,255,255,0.90)',
        shadow:   'rgba(220,38,38,0.20)',
        text:     '#7F1D1D',
        iconBg:   'rgba(255,255,255,0.38)',
        iconBorder:'rgba(255,255,255,0.68)',
        iconColor: '#991B1B',
    },
};

export function BottomCTA({ label, onPress, disabled, loading, variant = 'teal', sublabel }: Props) {
    const cfg = VARIANTS[variant];

    return (
        <div
            className="fixed inset-x-0 z-[900]"
            style={{
                // ارتفاع الـ bottom nav = 64px + safe area
                bottom: 64,
                background: 'linear-gradient(to top, rgba(235,246,250,0.96) 0%, rgba(235,246,250,0.88) 55%, rgba(235,246,250,0) 100%)',
                backdropFilter: 'blur(10px)',
                paddingBottom: 10,
                paddingTop: 12,
                paddingLeft: 16,
                paddingRight: 16,
            }}
        >
            {/* Sub-label */}
            <AnimatePresence>
                {sublabel && (
                    <motion.p
                        key="sub"
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                            fontSize: 10.5,
                            textAlign: 'center',
                            color: '#639CAF',
                            fontWeight: 600,
                            marginBottom: 7,
                            lineHeight: 1.5,
                        }}
                    >
                        {sublabel}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* CTA button — water glass */}
            <motion.button
                whileTap={disabled || loading ? {} : { scale: 0.974, y: 1 }}
                transition={{ type: 'spring', stiffness: 440, damping: 28 }}
                onClick={() => { if (disabled || loading) return; haptic.impact(); onPress(); }}
                className="w-full relative overflow-hidden flex items-center justify-between"
                style={{
                    height: 54,
                    borderRadius: 26,
                    background: disabled
                        ? 'rgba(255,255,255,0.48)'
                        : cfg.glass,
                    border: `1.5px solid ${disabled ? 'rgba(255,255,255,0.65)' : cfg.border}`,
                    backdropFilter: 'blur(28px) saturate(155%)',
                    WebkitBackdropFilter: 'blur(28px) saturate(155%)',
                    boxShadow: disabled
                        ? 'none'
                        : `0 10px 32px ${cfg.shadow}, 0 2px 8px rgba(0,0,0,0.05), inset 0 1.5px 0 rgba(255,255,255,0.94)`,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    paddingLeft: 22,
                    paddingRight: 18,
                }}
            >
                {/* Top glass sheen */}
                {!disabled && (
                    <div className="absolute inset-x-0 top-0 h-[55%] pointer-events-none rounded-t-[25px]"
                        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.68) 0%, rgba(255,255,255,0.08) 100%)' }} />
                )}
                {/* Specular highlight */}
                {!disabled && (
                    <div className="absolute top-2.5 right-16 w-8 h-3 rounded-full pointer-events-none"
                        style={{ background: 'rgba(255,255,255,0.48)', filter: 'blur(3px)' }} />
                )}

                {/* Shimmer sweep */}
                {!disabled && !loading && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.28) 50%, transparent 70%)' }}
                        animate={{ x: ['-130%', '180%'] }}
                        transition={{ duration: 3.8, repeat: Infinity, ease: 'linear', delay: 1.8 }}
                    />
                )}

                {/* Label */}
                <span style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: disabled ? '#9CD0E0' : cfg.text,
                    letterSpacing: '-0.01em',
                    position: 'relative',
                    zIndex: 1,
                }}>
                    {label}
                </span>

                {/* Arrow pill */}
                <div className="relative shrink-0" style={{ zIndex: 1 }}>
                    {loading ? (
                        <Loader2 style={{ width: 20, height: 20, color: disabled ? '#9CD0E0' : cfg.iconColor }} className="animate-spin" />
                    ) : (
                        <div style={{
                            width: 34, height: 34, borderRadius: 99,
                            background: disabled ? 'rgba(255,255,255,0.38)' : cfg.iconBg,
                            border: `1px solid ${cfg.iconBorder}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.80)',
                        }}>
                            <ArrowLeft style={{ width: 15, height: 15, color: disabled ? '#9CD0E0' : cfg.iconColor }} />
                        </div>
                    )}
                </div>
            </motion.button>
        </div>
    );
}
