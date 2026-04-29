'use client';
// components/health-engine/assessment/glass/index.tsx
// ════════════════════════════════════════════════════════════════
// TIBRAH Assessment Glass Component Library
// Unified reusable building blocks for the clinical journey.
// Every component uses the same glass / water visual language.
// ════════════════════════════════════════════════════════════════

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, AlertTriangle, Info } from 'lucide-react';

/* ── Shared Design Tokens ────────────────────────────────────── */
export const G = {
    bg:        'linear-gradient(158deg,#F8FDFF 0%,#E4FAF6 22%,#E8F1FF 48%,#F6FBFF 74%,#FFFFFF 100%)',
    glass:     'rgba(255,255,255,0.68)',
    glassStr:  'rgba(255,255,255,0.86)',
    border:    'rgba(255,255,255,0.90)',
    borderSel: 'rgba(255,255,255,0.96)',
    sheen:     'linear-gradient(180deg,rgba(255,255,255,0.72) 0%,rgba(255,255,255,0.15) 45%,transparent 100%)',
    shadow:    '0 10px 30px rgba(7,135,165,0.09),0 2px 8px rgba(0,0,0,0.035),inset 0 1.5px 0 rgba(255,255,255,0.92)',
    shadowD:   '0 16px 44px rgba(7,135,165,0.16),0 4px 12px rgba(0,0,0,0.045),inset 0 1.5px 0 rgba(255,255,255,0.96)',
    blur:      'blur(24px) saturate(165%)',
    teal:      '#0787A5',
    tealD:     '#0F6F8F',
    tealL:     '#28C7E8',
    cyan:      '#2DD4BF',
    ink:       '#073B52',
    sub:       '#0F6F8F',
    muted:     '#639CAF',
} as const;

/* ═══════════════════════════════════════════════════════════════
   StepMeaningHeader
   Shown at the top of each step — title, meaning sentence, badge.
   ═══════════════════════════════════════════════════════════════ */
interface StepMeaningHeaderProps {
    emoji?: string;
    badge?: string;
    badgeColor?: string;
    title: string;
    meaning: string;
}
export function StepMeaningHeader({ emoji, badge, badgeColor = G.teal, title, meaning }: StepMeaningHeaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 250, damping: 28 }}
            className="mb-5"
        >
            {badge && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-3"
                    style={{ background: `${badgeColor}10`, border: `1px solid ${badgeColor}22`, backdropFilter: 'blur(12px)' }}>
                    {emoji && <span style={{ fontSize: 13 }}>{emoji}</span>}
                    <span style={{ fontSize: 10, fontWeight: 900, color: badgeColor, letterSpacing: '0.08em' }}>{badge}</span>
                </div>
            )}
            <h2 style={{ fontSize: 24, fontWeight: 900, color: G.ink, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 6 }}>
                {title}
            </h2>
            <p style={{ fontSize: 12.5, color: G.sub, fontWeight: 500, lineHeight: 1.65 }}>
                {meaning}
            </p>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   ClinicalQuestionCard
   Glass collapsible card with "why we ask" microcopy.
   ═══════════════════════════════════════════════════════════════ */
interface ClinicalQuestionCardProps {
    title: string;
    whyWeAsk: string;
    accent?: string;
    badge?: string;
    defaultOpen?: boolean;
    priority?: boolean;          // renders as safety priority card
    children: ReactNode;
    delay?: number;
}
export function ClinicalQuestionCard({
    title, whyWeAsk, accent = G.teal, badge, defaultOpen = true,
    priority = false, children, delay = 0,
}: ClinicalQuestionCardProps) {
    const [open, setOpen] = useState(defaultOpen);
    const bg   = priority ? 'rgba(254,242,242,0.80)' : G.glass;
    const bord = priority ? 'rgba(220,38,38,0.22)' : G.border;
    const col  = priority ? '#DC2626' : accent;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: 'spring', stiffness: 260, damping: 28 }}
            className="relative overflow-hidden rounded-[22px] mb-3"
            style={{ background: bg, border: `1.5px solid ${bord}`, backdropFilter: G.blur, boxShadow: G.shadow }}
        >
            {/* Top sheen */}
            <div className="absolute inset-x-0 top-0 pointer-events-none"
                style={{ height: '46%', background: G.sheen, borderRadius: '22px 22px 0 0' }} />
            {/* Accent strip */}
            <div className="absolute top-0 left-[20%] right-[20%] h-[2.5px] rounded-b-full"
                style={{ background: `linear-gradient(90deg,${col}30,${col},${col}30)`, opacity: open ? 1 : 0.3 }} />

            {/* Header */}
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-start gap-3 px-4 py-3.5 text-right"
                style={{ position: 'relative', zIndex: 1 }}
            >
                {/* Left bar */}
                <div className="w-[3px] h-6 rounded-full flex-shrink-0 mt-0.5"
                    style={{ background: open ? `linear-gradient(to bottom,${col},${col}55)` : 'rgba(8,145,178,0.12)' }} />

                <div className="flex-1">
                    {priority && (
                        <div className="flex items-center gap-1 mb-1">
                            <AlertTriangle style={{ width: 10, height: 10, color: '#DC2626' }} />
                            <span style={{ fontSize: 9, fontWeight: 900, color: '#DC2626', letterSpacing: '0.10em', textTransform: 'uppercase' }}>
                                سؤال أولوية
                            </span>
                        </div>
                    )}
                    <p style={{ fontSize: 14, fontWeight: 800, color: G.ink, textAlign: 'right', lineHeight: 1.4 }}>{title}</p>
                    {open && whyWeAsk && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            style={{ fontSize: 10.5, color: G.muted, marginTop: 3, fontWeight: 500, textAlign: 'right' }}
                        >
                            💡 {whyWeAsk}
                        </motion.p>
                    )}
                </div>

                {badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5"
                        style={{ background: `${col}14`, color: col, border: `1px solid ${col}22` }}>
                        {badge}
                    </span>
                )}

                <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0 mt-0.5">
                    <ChevronDown style={{ width: 16, height: 16, color: G.muted }} />
                </motion.div>
            </button>

            {/* Body */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22, ease: [0.05, 0.7, 0.1, 1] }}
                        className="overflow-hidden"
                        style={{ position: 'relative', zIndex: 1 }}
                    >
                        {priority && (
                            <div className="mx-4 mb-2 px-3 py-2 rounded-[12px]"
                                style={{ background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.14)' }}>
                                <p style={{ fontSize: 10.5, color: '#B91C1C', lineHeight: 1.6, fontWeight: 500 }}>
                                    هذا يساعدنا نعرف إن كانت الحالة تحتاج تعامل أسرع.
                                </p>
                            </div>
                        )}
                        <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(8,145,178,0.07)' }}>
                            <div className="pt-3">{children}</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   OptionGlassChip
   Premium tactile chip — selected = scale + refraction border
   ═══════════════════════════════════════════════════════════════ */
interface OptionGlassChipProps {
    label: string;
    selected: boolean;
    color?: string;
    onToggle: () => void;
    subtext?: string;
    emoji?: string;
}
export function OptionGlassChip({ label, selected, color = G.teal, onToggle, subtext, emoji }: OptionGlassChipProps) {
    return (
        <motion.button
            type="button"
            whileTap={{ scale: 0.93 }}
            transition={{ type: 'spring', stiffness: 500, damping: 26 }}
            onClick={onToggle}
            className="relative overflow-hidden text-right"
            style={{
                borderRadius: subtext ? 16 : 99,
                padding: subtext ? '10px 14px' : '8px 14px',
                width: subtext ? '100%' : undefined,
                background: selected
                    ? `linear-gradient(155deg,rgba(255,255,255,0.88) 0%,${color}12 70%,${color}07 100%)`
                    : G.glass,
                border: `1.5px solid ${selected ? G.borderSel : G.border}`,
                backdropFilter: G.blur,
                boxShadow: selected
                    ? `${G.shadowD},0 0 18px ${color}14`
                    : G.shadow,
                transition: 'all 180ms cubic-bezier(0.05,0.7,0.1,1)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
            }}
        >
            {/* Sheen */}
            <div className="absolute inset-x-0 top-0 pointer-events-none"
                style={{ height: '48%', background: G.sheen, borderRadius: subtext ? '14px 14px 0 0' : '99px 99px 0 0' }} />

            {emoji && <span style={{ fontSize: 15, flexShrink: 0, position: 'relative', zIndex: 1 }}>{emoji}</span>}

            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                <span style={{ fontSize: 12.5, fontWeight: selected ? 800 : 600, color: selected ? G.ink : G.sub }}>
                    {label}
                </span>
                {subtext && (
                    <p style={{ fontSize: 10, color: G.muted, fontWeight: 500, marginTop: 1, lineHeight: 1.5 }}>{subtext}</p>
                )}
            </div>

            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: color, position: 'relative', zIndex: 1 }}
                    >
                        <Check style={{ width: 11, height: 11, color: '#fff', strokeWidth: 3 }} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}

/* ═══════════════════════════════════════════════════════════════
   AdaptiveBanner
   Shows when the engine added/skipped questions adaptively.
   ═══════════════════════════════════════════════════════════════ */
interface AdaptiveBannerProps {
    message: string;
    color?: string;
    icon?: string;
}
export function AdaptiveBanner({ message, color = G.teal, icon = '🧠' }: AdaptiveBannerProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            className="flex items-start gap-2.5 px-4 py-3 rounded-[16px] mb-3"
            style={{ background: `${color}08`, border: `1px solid ${color}18`, backdropFilter: 'blur(12px)' }}
        >
            <span style={{ fontSize: 13, flexShrink: 0 }}>{icon}</span>
            <p style={{ fontSize: 11, color: G.sub, lineHeight: 1.6, fontWeight: 600 }}>{message}</p>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   SectionDivider
   Elegant divider with label for adaptive/deep sections.
   ═══════════════════════════════════════════════════════════════ */
export function SectionDivider({ label, color = '#059669' }: { label: string; color?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 my-4"
        >
            <div style={{ flex: 1, height: 1, background: `${color}18` }} />
            <div style={{
                background: `${color}10`, border: `1px solid ${color}22`,
                borderRadius: 99, padding: '2px 10px',
                fontSize: 9, fontWeight: 900, color, letterSpacing: '0.07em',
            }}>
                {label}
            </div>
            <div style={{ flex: 1, height: 1, background: `${color}18` }} />
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   PathwayGroupSection
   Groups pathways visually by domain with header.
   ═══════════════════════════════════════════════════════════════ */
interface PathwayGroupSectionProps {
    title: string;
    meaning: string;
    icon: React.ComponentType<{ style?: React.CSSProperties }>;
    color: string;
    children: ReactNode;
    delay?: number;
}
export function PathwayGroupSection({ title, meaning, icon: Icon, color, children, delay = 0 }: PathwayGroupSectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: 'spring', stiffness: 250, damping: 28 }}
            className="mb-5"
        >
            {/* Group header */}
            <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-7 h-7 rounded-[10px] flex items-center justify-center"
                    style={{ background: `${color}12`, border: `1px solid ${color}22` }}>
                    <Icon style={{ width: 14, height: 14, color }} />
                </div>
                <div>
                    <p style={{ fontSize: 11, fontWeight: 900, color, letterSpacing: '0.04em' }}>{title}</p>
                    <p style={{ fontSize: 9.5, color: G.muted, fontWeight: 500, lineHeight: 1.4 }}>{meaning}</p>
                </div>
            </div>
            {/* Cards */}
            <div className="space-y-2">{children}</div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   EmotionalContextCard
   Respectful, non-blaming emotional option card.
   ═══════════════════════════════════════════════════════════════ */
interface EmotionalContextCardProps {
    emoji: string;
    label: string;
    explanation: string;
    selected: boolean;
    color: string;
    onToggle: () => void;
    delay?: number;
}
export function EmotionalContextCard({ emoji, label, explanation, selected, color, onToggle, delay = 0 }: EmotionalContextCardProps) {
    return (
        <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.93 }}
            transition={{ delay, type: 'spring', stiffness: 380, damping: 26 }}
            onClick={onToggle}
            className="w-full relative overflow-hidden rounded-[18px] p-3.5 text-right flex items-center gap-3"
            style={{
                background: selected
                    ? `linear-gradient(155deg,rgba(255,255,255,0.88) 0%,${color}10 70%)`
                    : G.glass,
                border: `1.5px solid ${selected ? G.borderSel : G.border}`,
                backdropFilter: G.blur,
                boxShadow: selected ? `${G.shadowD},0 0 16px ${color}14` : G.shadow,
                transition: 'all 180ms cubic-bezier(0.05,0.7,0.1,1)',
            }}
        >
            <div className="absolute inset-x-0 top-0 pointer-events-none"
                style={{ height: '46%', background: G.sheen, borderRadius: '16px 16px 0 0' }} />

            <span style={{ fontSize: 20, flexShrink: 0, position: 'relative', zIndex: 1 }}>{emoji}</span>

            <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: selected ? 800 : 600, color: selected ? color : G.ink, lineHeight: 1.3 }}>
                    {label}
                </p>
                <p style={{ fontSize: 10.5, color: G.muted, fontWeight: 500, marginTop: 2, lineHeight: 1.5 }}>
                    {explanation}
                </p>
            </div>

            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 24 }}
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: color, position: 'relative', zIndex: 1 }}
                    >
                        <Check style={{ width: 11, height: 11, color: '#fff', strokeWidth: 3 }} />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}

/* ═══════════════════════════════════════════════════════════════
   AnalysisPhaseOrb
   A single phase orb for StepAnalyzing — 3-phase design.
   ═══════════════════════════════════════════════════════════════ */
interface AnalysisPhaseOrbProps {
    phase: number;       // 1 | 2 | 3
    label: string;
    icon: string;
    status: 'waiting' | 'active' | 'done';
    color: string;
}
export function AnalysisPhaseOrb({ phase, label, icon, status, color }: AnalysisPhaseOrbProps) {
    const isActive = status === 'active';
    const isDone   = status === 'done';
    return (
        <div className="flex items-center gap-4">
            {/* Orb */}
            <div className="relative flex-shrink-0" style={{ width: 48, height: 48 }}>
                <motion.div
                    className="w-12 h-12 rounded-full flex items-center justify-center relative overflow-hidden"
                    animate={isActive
                        ? { scale: [1, 1.1, 1], boxShadow: [`0 0 0 transparent`, `0 0 20px ${color}40`, `0 0 0 transparent`] }
                        : { scale: 1 }}
                    transition={{ duration: 1.5, repeat: isActive ? Infinity : 0, ease: 'easeInOut' }}
                    style={{
                        background: isDone
                            ? `linear-gradient(145deg,rgba(255,255,255,0.9),${color}40)`
                            : isActive
                            ? `linear-gradient(145deg,rgba(255,255,255,0.85),${color}25)`
                            : 'rgba(255,255,255,0.45)',
                        border: `1.5px solid ${isDone || isActive ? G.borderSel : G.border}`,
                        backdropFilter: G.blur,
                        boxShadow: isDone ? `0 4px 16px ${color}30` : G.shadow,
                    }}
                >
                    <div className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
                        style={{ background: G.sheen, borderRadius: '50% 50% 0 0' }} />
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={isDone ? 'done' : icon}
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                            style={{ fontSize: isDone ? 16 : 18, position: 'relative', zIndex: 1 }}
                        >
                            {isDone ? '✅' : icon}
                        </motion.span>
                    </AnimatePresence>
                </motion.div>

                {/* Phase number badge */}
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: isDone || isActive ? color : G.muted, fontSize: 8, fontWeight: 900, color: '#fff' }}>
                    {phase}
                </div>
            </div>

            {/* Label + sweep bar */}
            <div className="flex-1">
                <p style={{
                    fontSize: 13, fontWeight: isDone ? 700 : isActive ? 800 : 500,
                    color: isDone ? G.tealD : isActive ? G.ink : G.muted,
                    transition: 'color 0.3s ease',
                }}>
                    {label}
                </p>
                {isActive && (
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1.8, ease: 'linear' }}
                        className="h-[2px] rounded-full mt-1"
                        style={{ background: `linear-gradient(90deg,${color},${G.tealL})` }}
                    />
                )}
                {isDone && (
                    <p style={{ fontSize: 10, color: G.teal, fontWeight: 600, marginTop: 2 }}>مكتمل ✓</p>
                )}
            </div>
        </div>
    );
}
