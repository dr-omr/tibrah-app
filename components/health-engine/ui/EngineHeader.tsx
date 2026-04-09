// components/health-engine/ui/EngineHeader.tsx
// THIE — Premium sticky header with animated progress

'use client';
import { motion } from 'framer-motion';
import { ChevronRight, Shield } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import type { StepId } from '../types';

const STEP_LABELS: Record<StepId, string> = {
    welcome:   'الترحيب',
    pathway:   'اختر شكواك',
    redflags:  'علامات التحذير',
    clinical:  'وصف الحالة',
    emotional: 'السياق العاطفي',
    analyzing: 'التحليل',
    result:    'النتيجة',
};

const VISIBLE_STEPS: StepId[] = ['pathway', 'redflags', 'clinical', 'emotional'];

interface Props {
    step: StepId;
    onBack: () => void;
    canGoBack: boolean;
}

export function EngineHeader({ step, onBack, canGoBack }: Props) {
    const idx = VISIBLE_STEPS.indexOf(step);
    const progress = idx === -1 ? 0 : ((idx + 1) / VISIBLE_STEPS.length) * 100;
    const isVisible = idx !== -1;

    return (
        <div className="fixed top-0 inset-x-0 z-40"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}>
            {/* Glass bar */}
            <div className="flex items-center justify-between h-14 px-4"
                style={{
                    background: 'rgba(2,6,23,0.80)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                {/* Back button */}
                {canGoBack ? (
                    <motion.button
                        whileTap={{ scale: 0.85 }}
                        onClick={() => { haptic.selection(); onBack(); }}
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <ChevronRight className="w-4 h-4 text-white" />
                    </motion.button>
                ) : <div className="w-8" />}

                {/* Title */}
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg,#0d9488,#6366f1)' }}>
                        <Shield className="w-2.5 h-2.5 text-white" />
                    </div>
                    <span className="text-[13px] font-black text-white">
                        {STEP_LABELS[step] ?? 'مدقق الأعراض'}
                    </span>
                </div>

                {/* Step counter */}
                {isVisible ? (
                    <span className="text-[10px] font-bold text-slate-400">
                        {idx + 1}/{VISIBLE_STEPS.length}
                    </span>
                ) : <div className="w-8" />}
            </div>

            {/* Progress bar */}
            {isVisible && (
                <div className="h-0.5 bg-white/5">
                    <motion.div
                        className="h-full"
                        style={{ background: 'linear-gradient(90deg, #0d9488, #6366f1)' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                </div>
            )}
        </div>
    );
}
