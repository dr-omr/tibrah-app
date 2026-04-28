// components/health-engine/ui/BottomCTA.tsx
// ════════════════════════════════════════════════════════════════
// TIBRAH — Light Water Glass Bottom CTA
// زجاج مائي فاتح · ملمس ناتف
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

const VARIANTS = {
    teal: {
        bg:     'linear-gradient(150deg, rgba(255,255,255,0.92) 0%, rgba(186,230,253,0.80) 35%, rgba(8,145,178,0.75) 100%)',
        shadow: 'rgba(8,145,178,0.28)',
        text:   '#0C4A6E',
        icon:   '#0E7490',
    },
    gradient: {
        bg:     'linear-gradient(150deg, rgba(255,255,255,0.90) 0%, rgba(186,230,253,0.75) 30%, rgba(8,145,178,0.65) 65%, rgba(129,140,248,0.70) 100%)',
        shadow: 'rgba(8,145,178,0.24)',
        text:   '#0C4A6E',
        icon:   '#0E7490',
    },
    red: {
        bg:     'linear-gradient(150deg, rgba(255,255,255,0.90) 0%, rgba(254,202,202,0.80) 40%, rgba(220,38,38,0.65) 100%)',
        shadow: 'rgba(220,38,38,0.22)',
        text:   '#7F1D1D',
        icon:   '#991B1B',
    },
};

export function BottomCTA({ label, onPress, disabled, loading, variant = 'teal', sublabel }: Props) {
    const cfg = VARIANTS[variant];

    return (
        <div className="fixed bottom-0 inset-x-0 z-[900] px-4"
            style={{
                paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))',
                background: 'linear-gradient(0deg, rgba(232,248,251,0.97) 0%, rgba(224,241,254,0.90) 60%, transparent 100%)',
                backdropFilter: 'blur(8px)',
                paddingTop: 18,
            }}>

            <AnimatePresence>
                {sublabel && (
                    <motion.p key="sub" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        style={{ fontSize: 11, textAlign: 'center', color: '#7DD3FC', fontWeight: 600, marginBottom: 8 }}>
                        {sublabel}
                    </motion.p>
                )}
            </AnimatePresence>

            <motion.button
                whileTap={disabled || loading ? {} : { scale: 0.97, y: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                onClick={() => { if (disabled || loading) return; haptic.impact(); onPress(); }}
                className="w-full relative overflow-hidden flex items-center"
                style={{
                    height: 58, borderRadius: 28,
                    background: disabled ? 'rgba(255,255,255,0.50)' : cfg.bg,
                    border: `1.5px solid ${disabled ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.92)'}`,
                    backdropFilter: 'blur(24px)',
                    boxShadow: disabled ? 'none' : `0 8px 32px ${cfg.shadow}, inset 0 1.5px 0 rgba(255,255,255,0.95)`,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    paddingLeft: 24, paddingRight: 24,
                }}>

                {/* Glass sheen */}
                <div className="absolute inset-x-0 top-0 pointer-events-none"
                    style={{ height: '50%', background: disabled ? 'none' : 'linear-gradient(180deg, rgba(255,255,255,0.60) 0%, rgba(255,255,255,0.10) 50%, transparent 100%)', borderRadius: '28px 28px 0 0' }} />
                {/* Specular point */}
                {!disabled && <div className="absolute top-2.5 right-16 w-7 h-3.5 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.50)', filter: 'blur(3px)' }} />}
                {/* Shimmer */}
                {!disabled && !loading && (
                    <motion.div className="absolute inset-0 pointer-events-none"
                        style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)' }}
                        animate={{ x: ['-130%', '180%'] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'linear', delay: 1.5 }} />
                )}

                <span className="flex-1 text-right relative"
                    style={{ fontSize: 16, fontWeight: 900, zIndex: 1, color: disabled ? '#7DD3FC' : cfg.text, letterSpacing: '-0.01em' }}>
                    {label}
                </span>

                <div className="relative mr-3" style={{ zIndex: 1 }}>
                    {loading
                        ? <Loader2 style={{ width: 20, height: 20, color: disabled ? '#7DD3FC' : cfg.icon }} className="animate-spin" />
                        : <div style={{
                            width: 32, height: 32, borderRadius: 99,
                            background: 'rgba(255,255,255,0.45)',
                            border: '1px solid rgba(255,255,255,0.70)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.80)',
                        }}>
                            <ArrowLeft style={{ width: 14, height: 14, color: disabled ? '#7DD3FC' : cfg.icon }} />
                        </div>
                    }
                </div>
            </motion.button>
        </div>
    );
}
