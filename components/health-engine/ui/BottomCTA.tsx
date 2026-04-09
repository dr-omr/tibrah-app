// components/health-engine/ui/BottomCTA.tsx
// THIE — Fixed bottom call-to-action with spring animation

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

const GRADIENTS = {
    teal: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #6366f1 100%)',
    red: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
};
const SHADOWS = {
    teal: '0 16px 40px rgba(13,148,136,0.35)',
    gradient: '0 16px 40px rgba(99,102,241,0.30)',
    red: '0 16px 40px rgba(220,38,38,0.40)',
};

export function BottomCTA({ label, onPress, disabled, loading, variant = 'teal', sublabel }: Props) {
    return (
        <div className="fixed bottom-0 inset-x-0 z-30 px-5"
            style={{
                paddingBottom: 'max(env(safe-area-inset-bottom), 24px)',
                background: 'linear-gradient(to top, rgba(2,6,23,1) 50%, rgba(2,6,23,0) 100%)',
            }}>
            {sublabel && (
                <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-[10.5px] text-slate-500 font-medium mb-2">
                    {sublabel}
                </motion.p>
            )}
            <motion.button
                whileTap={disabled || loading ? {} : { scale: 0.97 }}
                onClick={() => {
                    if (disabled || loading) return;
                    haptic.impact();
                    onPress();
                }}
                className="w-full h-[54px] rounded-[18px] flex items-center justify-between px-6 relative overflow-hidden"
                style={{
                    background: GRADIENTS[variant],
                    boxShadow: disabled ? 'none' : SHADOWS[variant],
                    opacity: disabled ? 0.35 : 1,
                }}>
                {/* Shimmer */}
                {!disabled && !loading && (
                    <motion.div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)' }}
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                    />
                )}
                <span className="text-white font-black text-[15px] relative z-10">{label}</span>
                {loading
                    ? <Loader2 className="w-5 h-5 text-white/80 animate-spin relative z-10" />
                    : <ArrowLeft className="w-5 h-5 text-white/80 relative z-10" />
                }
            </motion.button>
        </div>
    );
}
