// components/health-engine/ui/EngineHeader.tsx
// ════════════════════════════════════════════════════════════════
// TIBRAH — Light Water Glass Engine Header
// ════════════════════════════════════════════════════════════════
'use client';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import type { StepId } from '../types';

const LABELS: Record<StepId, string> = {
    welcome:   'طِبرَا',
    personalHistory: 'معلومات عنك',
    chiefComplaint: 'إيش يضايقك؟',
    hopi: 'تفاصيل العرض',
    pathway:   'اختر شكواك',
    redflags:  'فحص السلامة',
    clinical:  'تفاصيل الحالة',
    relatedSymptoms: 'أعراض مرافقة',
    lifestyle: 'الأكل والنوم',
    emotional: 'البعد العاطفي',
    nutrition: 'نظام الطيبات',
    review:    'مراجعة الخريطة',
    analyzing: 'جاري التحليل',
    result:    'نتيجة تحليلك',
};

const PROGRESS_STEPS: StepId[] = ['personalHistory', 'chiefComplaint', 'hopi', 'redflags', 'relatedSymptoms', 'lifestyle', 'emotional', 'nutrition', 'review'];

const STEP_COLOR: Partial<Record<StepId, string>> = {
    personalHistory: '#0EA5E9',
    chiefComplaint: '#0787A5',
    hopi: '#D97706',
    pathway:   '#0787A5',
    redflags:  '#DC2626',
    clinical:  '#D97706',
    relatedSymptoms: '#059669',
    lifestyle: '#0EA5E9',
    emotional: '#818CF8',
    nutrition: '#059669',
    review:    '#0787A5',
};

export function EngineHeader({ step, onBack, canGoBack }: {
    step: StepId; onBack: () => void; canGoBack: boolean;
}) {
    const idx         = PROGRESS_STEPS.indexOf(step);
    const showProgress = idx !== -1;
    const pct         = showProgress ? ((idx + 1) / PROGRESS_STEPS.length) * 100 : 0;
    const accent      = STEP_COLOR[step] ?? '#0787A5';

    return (
        <div className="fixed top-0 inset-x-0 z-40 flex flex-col"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}>

            {/* Glass header bar */}
            <div className="relative overflow-hidden flex items-center px-4"
                style={{
                    height: 64,
                    background: 'rgba(232,248,251,0.78)',
                    backdropFilter: 'blur(28px) saturate(140%)',
                    WebkitBackdropFilter: 'blur(28px) saturate(140%)',
                    borderBottom: '1px solid rgba(255,255,255,0.75)',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.90), 0 4px 20px rgba(8,145,178,0.06)',
                }}>

                {/* Sheen */}
                <div className="absolute inset-x-0 top-0 pointer-events-none"
                    style={{ height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)' }} />
                {/* Specular */}
                <div className="absolute top-0 left-0 w-[35%] h-full pointer-events-none"
                    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.28) 0%, transparent 70%)' }} />

                {/* Back button or logo */}
                {canGoBack ? (
                    <motion.button
                        whileTap={{ scale: 0.85 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                        onClick={() => { haptic.selection(); onBack(); }}
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                        style={{
                            background: 'rgba(255,255,255,0.60)',
                            border: '1px solid rgba(255,255,255,0.85)',
                            backdropFilter: 'blur(12px)',
                            color: '#0F6F8F',
                            boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.90), 0 3px 10px rgba(0,0,0,0.04)',
                        }}
                        aria-label="رجوع">
                        <div className="absolute inset-x-0 top-0" style={{ height: '48%', background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)', borderRadius: 99 }} />
                        <ArrowRight style={{ width: 18, height: 18, position: 'relative', zIndex: 1 }} />
                    </motion.button>
                ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                        style={{
                            background: 'linear-gradient(150deg, rgba(255,255,255,0.92) 0%, rgba(186,230,253,0.80) 40%, rgba(8,145,178,0.70) 100%)',
                            border: '1.5px solid rgba(255,255,255,0.90)',
                            boxShadow: '0 3px 12px rgba(8,145,178,0.22), inset 0 1.5px 0 rgba(255,255,255,0.95)',
                        }}>
                        <div className="absolute inset-x-0 top-0" style={{ height: '45%', background: 'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, transparent 100%)', borderRadius: 99 }} />
                        <span style={{ fontSize: 14, fontWeight: 900, color: '#0F6F8F', position: 'relative', zIndex: 1 }}>ط</span>
                    </div>
                )}

                {/* Title */}
                <div className="flex-1 flex justify-center">
                    <motion.span
                        key={step}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        style={{ fontSize: 15.5, fontWeight: 900, color: '#073B52', letterSpacing: '-0.01em' }}>
                        {LABELS[step]}
                    </motion.span>
                </div>

                {/* Step counter */}
                {showProgress ? (
                    <div className="w-10 flex items-center justify-center">
                        <div className="px-2 py-0.5 rounded-full"
                            style={{ background: `${accent}12`, border: `1px solid ${accent}20` }}>
                            <span style={{ fontSize: 10, fontWeight: 900, color: accent, fontVariantNumeric: 'tabular-nums' }}>
                                {idx + 1}/{PROGRESS_STEPS.length}
                            </span>
                        </div>
                    </div>
                ) : <div className="w-10" />}
            </div>

            {/* Progress bar */}
            {showProgress && (
                <div className="h-[3px] relative overflow-hidden" style={{ background: `${accent}12` }}>
                    <motion.div
                        className="h-full absolute top-0 left-0"
                        style={{
                            background: `linear-gradient(90deg, ${accent}, rgba(255,255,255,0.60) 80%, ${accent}80)`,
                            borderRadius: '0 3px 3px 0',
                        }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.45, ease: [0.05, 0.7, 0.1, 1.0] }}
                    />
                    <motion.div
                        className="absolute top-0 h-full w-12"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)' }}
                        animate={{ left: ['-48px', '120%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: 0.5 }}
                    />
                </div>
            )}
        </div>
    );
}
