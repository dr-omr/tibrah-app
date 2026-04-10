// components/health-engine/ui/EngineHeader.tsx
// THIE v4 — M3 Top App Bar (Medium size)
// Reference: Material Design 3 Top app bars

'use client';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import type { StepId } from '../types';

const LABELS: Record<StepId, string> = {
    welcome:   'طِبرَا',
    pathway:   'اختر شكواك',
    clinical:  'تفاصيل الحالة',
    emotional: 'البعد العاطفي',
    analyzing: 'جاري التحليل',
    result:    'نتيجة تحليلك',
};

const PROGRESS_STEPS: StepId[] = ['pathway', 'clinical', 'emotional'];

export function EngineHeader({ step, onBack, canGoBack }: {
    step: StepId; onBack: () => void; canGoBack: boolean;
}) {
    const idx = PROGRESS_STEPS.indexOf(step);
    const showProgress = idx !== -1;
    const pct = showProgress ? ((idx + 1) / PROGRESS_STEPS.length) * 100 : 0;

    return (
        <div
            className="fixed top-0 inset-x-0 z-40 flex flex-col"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}>

            {/*
             * M3 Top App Bar — Small variant
             * Height: 64px (M3 spec)
             * Surface: white with subtle elevation shadow
             */}
            <div className="flex items-center px-4"
                style={{
                    height: 64,
                    background: 'rgba(247,250,250,0.92)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
                }}>

                {/* M3 Navigation icon button — back */}
                {canGoBack ? (
                    <motion.button
                        whileTap={{ scale: 0.85 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                        onClick={() => { haptic.selection(); onBack(); }}
                        className="w-10 h-10 rounded-full flex items-center justify-center m3-state flex-shrink-0"
                        style={{ color: '#0f766e' }}
                        aria-label="رجوع">
                        <ArrowRight className="w-5 h-5" />
                    </motion.button>
                ) : (
                    /* Tibrah logo chip when on first step */
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg,#0d9488,#6366f1)' }}>
                        <span className="text-white text-[12px] font-black">ط</span>
                    </div>
                )}

                {/* M3 Headline text — centered */}
                <div className="flex-1 flex justify-center">
                    <motion.span
                        key={step}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="m3-title-lg text-slate-900">
                        {LABELS[step]}
                    </motion.span>
                </div>

                {/* Step counter — trailing */}
                {showProgress ? (
                    <div className="w-10 flex items-center justify-center">
                        <span className="m3-label-sm text-slate-400 tabular-nums"
                            style={{ textTransform: 'none', fontSize: 11 }}>
                            {idx + 1}/{PROGRESS_STEPS.length}
                        </span>
                    </div>
                ) : <div className="w-10" />}
            </div>

            {/*
             * M3 Linear progress indicator
             * Only visible during guided steps
             * Teal → indigo gradient = Tibrah brand
             */}
            {showProgress && (
                <div className="h-[3px]" style={{ background: 'rgba(13,148,136,0.08)' }}>
                    <motion.div
                        className="h-full"
                        style={{
                            background: 'linear-gradient(90deg, #0d9488, #6366f1)',
                            borderRadius: '0 2px 2px 0',
                        }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.45, ease: [0.05, 0.7, 0.1, 1.0] }}
                    />
                </div>
            )}
        </div>
    );
}
