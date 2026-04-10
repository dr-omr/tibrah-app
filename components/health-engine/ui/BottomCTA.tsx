// components/health-engine/ui/BottomCTA.tsx
// THIE v4 — Material Design 3 / Google large FAB-style CTA
// CRITICAL FIX: proper safe-area + Android navigation bar clearance

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
    teal: { bg: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)', shadow: 'rgba(13,148,136,0.32)' },
    gradient: { bg: 'linear-gradient(135deg, #0d9488 0%, #6366f1 100%)', shadow: 'rgba(99,102,241,0.28)' },
    red: { bg: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)', shadow: 'rgba(220,38,38,0.32)' },
};

export function BottomCTA({ label, onPress, disabled, loading, variant = 'teal', sublabel }: Props) {
    const cfg = VARIANTS[variant];

    return (
        /* 
         * SAFE AREA SOLUTION:
         * padding-bottom = max(env(safe-area-inset-bottom), 20px) handles:
         *   - iPhone notch/Dynamic Island devices
         *   - Android gesture navigation (inset reported by OS)
         *   - Capacitor native wrapping
         * The gradient fade ensures content is readable above this panel.
         */
        <div
            className="fixed bottom-0 inset-x-0 z-50 px-4"
            style={{
                paddingBottom: 'max(env(safe-area-inset-bottom), 20px)',
                /* Tall fade so last card is never fully hidden */
                background: 'linear-gradient(to top, #F7FAFA 68%, rgba(247,250,250,0.96) 85%, transparent 100%)',
                /* Extra top padding means gradient starts higher & content isn't hidden */
                paddingTop: 16,
            }}>
            <AnimatePresence>
                {sublabel && (
                    <motion.p
                        key="sub"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="m3-label-lg text-center text-slate-400 mb-2">
                        {sublabel}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* M3 Large Button — 56px height, 28px radius */}
            <motion.button
                whileTap={disabled || loading ? {} : { scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                onClick={() => {
                    if (disabled || loading) return;
                    haptic.impact();
                    onPress();
                }}
                className="m3-state w-full rounded-[28px] flex items-center relative overflow-hidden"
                style={{
                    height: 56,
                    background: disabled ? '#E2E8F0' : cfg.bg,
                    boxShadow: disabled ? 'none' : `0 4px 24px ${cfg.shadow}, 0 1px 4px rgba(0,0,0,0.1)`,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    paddingLeft: 24,
                    paddingRight: 24,
                }}>
                {/* Shimmer only when active */}
                {!disabled && !loading && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.14) 50%, transparent 65%)',
                        }}
                        animate={{ x: ['-120%', '150%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    />
                )}

                <span
                    className="m3-title-lg relative z-10 flex-1 text-right"
                    style={{ color: disabled ? '#94A3B8' : '#ffffff' }}>
                    {label}
                </span>

                <div className="relative z-10 mr-3">
                    {loading
                        ? <Loader2 className="w-5 h-5 animate-spin" style={{ color: disabled ? '#94A3B8' : '#ffffffb3' }} />
                        : <ArrowLeft className="w-5 h-5" style={{ color: disabled ? '#94A3B8' : '#ffffffb3' }} />
                    }
                </div>
            </motion.button>
        </div>
    );
}
