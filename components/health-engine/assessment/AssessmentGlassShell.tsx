'use client';
// components/health-engine/assessment/AssessmentGlassShell.tsx
// ════════════════════════════════════════════════════════════════
// TIBRAH Clinical Glass OS — Immersive Assessment Shell
// Wraps every assessment step in a unified, calm clinical container.
// ════════════════════════════════════════════════════════════════
import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { PAGE_BG, GLASS, WATER, PALETTE, TYPE, RADIUS, BACKDROP } from '../design/clinical-glass-tokens';
import type { StepId } from '../types';

/* ── Stage metadata ───────────────────────────────────────── */
const STAGES: { id: StepId; label: string; hint: string }[] = [
    { id: 'welcome',   label: 'البداية',     hint: ''                              },
    { id: 'pathway',   label: 'الأعراض',     hint: 'كل إجابة تضيّق الاحتمالات'    },
    { id: 'clinical',  label: 'التفصيل',     hint: 'نربط الأعراض بالمسار الأقرب'  },
    { id: 'emotional', label: 'السياق',      hint: 'الصورة الكاملة أدق من الجزء'  },
    { id: 'nutrition', label: 'الغذاء',      hint: 'طبقة مساعدة — ليست إلزامية'  },
    { id: 'analyzing', label: 'التحليل',     hint: 'نبني خريطتك الآن'             },
    { id: 'result',    label: 'نتيجتك',      hint: 'خريطتك الشخصية جاهزة'         },
];

const VISIBLE_STEPS: StepId[] = ['pathway', 'clinical', 'emotional', 'nutrition', 'analyzing', 'result'];

function getProgress(stepId: StepId, nutritionShown: boolean): { current: number; total: number; percent: number } {
    const steps = nutritionShown
        ? VISIBLE_STEPS
        : VISIBLE_STEPS.filter(s => s !== 'nutrition');
    const idx = steps.indexOf(stepId);
    if (idx < 0) return { current: 0, total: steps.length, percent: 0 };
    return {
        current: idx + 1,
        total:   steps.length,
        percent: Math.round(((idx + 1) / steps.length) * 100),
    };
}

/* ── Progress Rail ────────────────────────────────────────── */
function ProgressRail({
    stepId,
    nutritionShown,
}: {
    stepId: StepId;
    nutritionShown: boolean;
}) {
    const stage = STAGES.find(s => s.id === stepId);
    const prog  = getProgress(stepId, nutritionShown);
    if (stepId === 'welcome') return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1,  y: 0  }}
            transition={{ duration: 0.35 }}
            className="w-full px-4 pt-4 pb-2"
        >
            {/* Stage label row */}
            <div className="flex items-center justify-between mb-2">
                <span style={{
                    fontSize: 10, fontWeight: 900,
                    color: PALETTE.teal,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                }}>
                    {stage?.label ?? ''}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: PALETTE.textMuted }}>
                    {prog.current} / {prog.total}
                </span>
            </div>

            {/* Rail track */}
            <div
                className="w-full rounded-full overflow-hidden"
                style={{ height: 3, background: 'rgba(8,145,178,0.10)' }}
            >
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${prog.percent}%` }}
                    transition={{ duration: 0.5, ease: [0.05, 0.7, 0.1, 1] }}
                    className="h-full rounded-full"
                    style={{
                        background: `linear-gradient(90deg, ${PALETTE.teal}, ${PALETTE.tealLight} 80%, ${PALETTE.cyan})`,
                    }}
                />
            </div>

            {/* Adaptive hint */}
            {stage?.hint && (
                <motion.p
                    key={stage.hint}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{ ...TYPE.microcopy, color: PALETTE.textMuted, marginTop: 6 }}
                >
                    {stage.hint}
                </motion.p>
            )}
        </motion.div>
    );
}

/* ── Back Button ──────────────────────────────────────────── */
function BackButton({ onBack }: { onBack: () => void }) {
    return (
        <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileTap={{ scale: 0.88 }}
            onClick={onBack}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full"
            style={{
                background: 'rgba(8,145,178,0.08)',
                border: '1px solid rgba(8,145,178,0.16)',
                backdropFilter: BACKDROP,
            }}
        >
            <ChevronRight style={{ width: 13, height: 13, color: PALETTE.teal }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: PALETTE.tealDeep }}>رجوع</span>
        </motion.button>
    );
}

/* ── Ambient Background Orbs ─────────────────────────────── */
function AmbientOrbs({ stepId }: { stepId: StepId }) {
    const isUrgent = false; // Passed from parent if needed
    return (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
            <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.65, 0.45] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                    position: 'absolute', top: -120, right: -80,
                    width: 380, height: 340, borderRadius: '50%',
                    background: stepId === 'analyzing'
                        ? 'radial-gradient(ellipse, rgba(129,140,248,0.22) 0%, transparent 65%)'
                        : 'radial-gradient(ellipse, rgba(34,211,238,0.20) 0%, transparent 65%)',
                    filter: 'blur(55px)',
                }}
            />
            <div style={{
                position: 'absolute', top: 200, left: -80,
                width: 300, height: 280, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(52,211,153,0.14) 0%, transparent 65%)',
                filter: 'blur(50px)',
            }} />
            <div style={{
                position: 'absolute', bottom: 60, right: -40,
                width: 260, height: 240, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(129,140,248,0.12) 0%, transparent 65%)',
                filter: 'blur(48px)',
            }} />
        </div>
    );
}

/* ── Adaptive Intelligence Banner ────────────────────────── */
export function AdaptiveBanner({ message }: { message: string }) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-2 px-3.5 py-2.5 rounded-[14px] mx-4 mb-3"
                style={{
                    background: 'rgba(8,145,178,0.07)',
                    border: '1px solid rgba(8,145,178,0.16)',
                    backdropFilter: 'blur(12px)',
                }}
            >
                <span style={{ fontSize: 12, flexShrink: 0 }}>🧠</span>
                <p style={{ ...TYPE.microcopy, color: PALETTE.tealDeep, lineHeight: 1.55 }}>
                    {message}
                </p>
            </motion.div>
        </AnimatePresence>
    );
}

/* ── Main Shell ───────────────────────────────────────────── */
interface AssessmentGlassShellProps {
    children: ReactNode;
    stepId: StepId;
    nutritionShown?: boolean;
    onBack?: () => void;
    adaptiveMessage?: string | null;
}

export function AssessmentGlassShell({
    children,
    stepId,
    nutritionShown = false,
    onBack,
    adaptiveMessage,
}: AssessmentGlassShellProps) {
    const showBack = stepId !== 'welcome' && stepId !== 'analyzing' && stepId !== 'result' && !!onBack;

    return (
        <div
            className="relative min-h-screen flex flex-col overflow-x-hidden"
            dir="rtl"
            style={{ background: PAGE_BG }}
        >
            {/* ── Ambient ── */}
            <AmbientOrbs stepId={stepId} />

            {/* ── Top bar ── */}
            <div className="relative z-20 flex items-center justify-between px-4 pt-safe-top"
                style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)' }}
            >
                {/* Back */}
                <div style={{ minWidth: 72 }}>
                    {showBack && <BackButton onBack={onBack!} />}
                </div>

                {/* Brand mark */}
                <span style={{
                    fontSize: 9,
                    fontWeight: 900,
                    color: PALETTE.teal,
                    letterSpacing: '0.20em',
                    textTransform: 'uppercase',
                }}>
                    طِبرا · تقييم ذكي
                </span>

                {/* Spacer */}
                <div style={{ minWidth: 72 }} />
            </div>

            {/* ── Progress rail ── */}
            <div className="relative z-20">
                <ProgressRail stepId={stepId} nutritionShown={nutritionShown} />
            </div>

            {/* ── Adaptive intelligence banner ── */}
            {adaptiveMessage && (
                <div className="relative z-20">
                    <AdaptiveBanner message={adaptiveMessage} />
                </div>
            )}

            {/* ── Main content ── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={stepId}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0  }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: [0.05, 0.7, 0.1, 1] }}
                    className="relative z-10 flex-1 flex flex-col"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
