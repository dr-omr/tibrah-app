// components/health-engine/steps/StepPathway.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Pathway Selection
// تصميم: مائي فاتح · زجاج فيزيائي · ملمس طبي · ناتف
// ════════════════════════════════════════════════════════════════════
'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, Stethoscope } from 'lucide-react';
import { PATHWAYS } from '../constants';
import { BottomCTA } from '../ui/BottomCTA';
import { haptic } from '@/lib/HapticFeedback';
import { trackEvent } from '@/lib/analytics';

/* ══════════════════════════════════════════════════════════════════
   LIGHT WATER GLASS — Premium Medical
   ══════════════════════════════════════════════════════════════════ */
const PAGE_BG = 'linear-gradient(168deg, #E8F8FB 0%, #D0F0F8 18%, #E2F1FE 42%, #EDF5FF 65%, #F0FAFB 88%, #F5FDFE 100%)';

const GL = {
    base:      'rgba(255,255,255,0.62)',
    selected:  'rgba(255,255,255,0.78)',
    border:    'rgba(255,255,255,0.88)',
    borderSel: 'rgba(255,255,255,0.95)',
    shadow:    '0 6px 24px rgba(8,145,178,0.08), 0 1.5px 6px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.92)',
    shadowSel: '0 8px 30px rgba(8,145,178,0.14), 0 2px 8px rgba(0,0,0,0.05), inset 0 1.5px 0 rgba(255,255,255,0.95)',
    sheen:     'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.15) 45%, transparent 100%)',
    spec:      'radial-gradient(ellipse 50% 25% at 22% 12%, rgba(255,255,255,0.55) 0%, transparent 70%)',
};

const TXT = {
    primary:   '#0C4A6E',
    secondary: '#0369A1',
    muted:     '#7DD3FC',
    accent:    '#0891B2',
};

export function StepPathway({ selectedId, onSelect, onNext }: {
    selectedId: string; onSelect: (id: string) => void; onNext: () => void;
}) {
    const [expanded, setExpanded] = useState<string | null>(null);
    const chosen = PATHWAYS.find(p => p.id === selectedId);
    const tracked = useRef(false);

    useEffect(() => {
        if (!tracked.current) {
            tracked.current = true;
            trackEvent('assessment_started', {});
        }
    }, []);

    return (
        <div className="relative min-h-screen" dir="rtl"
            style={{ background: PAGE_BG }}>

            {/* ── طبقة الأمواج ── */}
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                <motion.div
                    animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.7, 0.45] }}
                    transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute', top: -100, right: -60,
                        width: 340, height: 300, borderRadius: '50%',
                        background: 'radial-gradient(ellipse, rgba(34,211,238,0.18) 0%, transparent 65%)',
                        filter: 'blur(50px)',
                    }}
                />
                <div style={{
                    position: 'absolute', bottom: 40, left: -60,
                    width: 280, height: 260, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(129,140,248,0.12) 0%, transparent 65%)',
                    filter: 'blur(48px)',
                }} />
                {/* Caustic light shimmer */}
                <div className="absolute inset-0" style={{
                    background: 'radial-gradient(ellipse 45% 30% at 70% 80%, rgba(52,211,153,0.08) 0%, transparent 60%)',
                }} />
            </div>

            <div className="relative z-10 px-4 pt-14 pb-36">

                {/* ══ HEADER ══ */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                    className="mb-6"
                >
                    {/* Step chip */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full mb-5"
                        style={{
                            background: 'rgba(8,145,178,0.08)',
                            border: '1px solid rgba(8,145,178,0.18)',
                            backdropFilter: 'blur(16px)',
                        }}>
                        <div className="relative">
                            <div className="w-2 h-2 rounded-full" style={{ background: '#0891B2' }} />
                            <motion.div
                                className="absolute inset-0 rounded-full"
                                style={{ background: '#0891B2' }}
                                animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2.5, repeat: Infinity }}
                            />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#0E7490', letterSpacing: '0.04em' }}>
                            الخطوة ١ من ٤
                        </span>
                    </div>

                    {/* Medical icon */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                        className="mb-4 relative overflow-hidden flex items-center justify-center"
                        style={{
                            width: 48, height: 48, borderRadius: 16,
                            background: 'linear-gradient(150deg, rgba(255,255,255,0.85) 0%, rgba(186,230,253,0.60) 60%, rgba(8,145,178,0.25) 100%)',
                            border: '1.5px solid rgba(255,255,255,0.90)',
                            boxShadow: '0 6px 20px rgba(8,145,178,0.15), inset 0 1.5px 0 rgba(255,255,255,0.95)',
                        }}
                    >
                        <div className="absolute inset-x-0 top-0" style={{ height: '48%', background: GL.sheen, borderRadius: '15px 15px 0 0' }} />
                        <Stethoscope style={{ width: 22, height: 22, color: '#0E7490', position: 'relative', zIndex: 1 }} />
                    </motion.div>

                    <h2 style={{
                        fontSize: 28, fontWeight: 900, color: TXT.primary,
                        letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 8,
                    }}>
                        ما أكثر شيء
                        <br />
                        <span style={{
                            background: 'linear-gradient(135deg, #0891B2, #22D3EE 50%, #818CF8)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}>
                            يزعجك الآن؟
                        </span>
                    </h2>
                    <p style={{ fontSize: 13, color: TXT.secondary, fontWeight: 500, lineHeight: 1.5 }}>
                        اختر الأقرب لما تشعر به — يمكن التوسع لاحقاً
                    </p>
                </motion.div>

                {/* ══ PATHWAY CARDS ══ */}
                <div className="space-y-2.5">
                    {PATHWAYS.map((p, i) => {
                        const isSel = p.id === selectedId;
                        const isExp = expanded === p.id;

                        return (
                            <motion.div key={p.id}
                                initial={{ opacity: 0, y: 18, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ delay: 0.08 + i * 0.04, type: 'spring', stiffness: 280, damping: 28 }}>
                                <div className="relative overflow-hidden"
                                    style={{
                                        borderRadius: 22,
                                        background: isSel
                                            ? `linear-gradient(155deg, rgba(255,255,255,0.82) 0%, ${p.color}10 70%, ${p.color}06 100%)`
                                            : GL.base,
                                        border: `1.5px solid ${isSel ? GL.borderSel : GL.border}`,
                                        backdropFilter: 'blur(22px) saturate(130%)',
                                        WebkitBackdropFilter: 'blur(22px) saturate(130%)',
                                        boxShadow: isSel
                                            ? `${GL.shadowSel}, 0 0 20px ${p.color}12`
                                            : GL.shadow,
                                        transition: 'all 280ms cubic-bezier(0.05,0.7,0.1,1)',
                                    }}>
                                    {/* Sheen */}
                                    <div className="absolute inset-x-0 top-0 pointer-events-none"
                                        style={{ height: '50%', background: GL.sheen, borderRadius: '22px 22px 0 0' }} />
                                    {/* Specular */}
                                    <div className="absolute inset-0 pointer-events-none"
                                        style={{ background: GL.spec, borderRadius: 22 }} />

                                    {/* Selected accent bar — right side */}
                                    {isSel && (
                                        <div className="absolute right-0 top-3 bottom-3 pointer-events-none"
                                            style={{
                                                width: 3, borderRadius: 99,
                                                background: `linear-gradient(to bottom, ${p.color}, ${p.color}50)`,
                                                boxShadow: `0 0 8px ${p.color}35`,
                                            }} />
                                    )}
                                    {/* Selected glow — bottom */}
                                    {isSel && (
                                        <div className="absolute bottom-0 inset-x-0 pointer-events-none"
                                            style={{ height: 36, background: `linear-gradient(0deg, ${p.color}0A 0%, transparent 100%)`, borderRadius: '0 0 22px 22px' }} />
                                    )}

                                    {/* Main row */}
                                    <button className="w-full flex items-center gap-3.5 px-4 py-4 text-right cursor-pointer"
                                        style={{ position: 'relative', zIndex: 1 }}
                                        onClick={() => {
                                            haptic.impact(); onSelect(p.id); setExpanded(null);
                                            trackEvent('assessment_pathway_selected', { pathway_id: p.id, pathway_label: p.label });
                                        }}>

                                        {/* Icon orb */}
                                        <motion.div
                                            animate={isSel ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                                            transition={{ duration: 0.35 }}
                                            className="flex-shrink-0 relative overflow-hidden flex items-center justify-center"
                                            style={{
                                                width: 52, height: 52, borderRadius: 18,
                                                background: isSel
                                                    ? `linear-gradient(150deg, rgba(255,255,255,0.90) 0%, ${p.color}18 100%)`
                                                    : 'rgba(255,255,255,0.60)',
                                                border: `1.5px solid ${isSel ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.78)'}`,
                                                boxShadow: isSel
                                                    ? `0 4px 16px ${p.color}22, inset 0 1.5px 0 rgba(255,255,255,0.95)`
                                                    : 'inset 0 1.5px 0 rgba(255,255,255,0.85), 0 3px 10px rgba(0,0,0,0.04)',
                                            }}>
                                            <div className="absolute inset-x-0 top-0"
                                                style={{ height: '48%', background: 'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, transparent 100%)', borderRadius: '17px 17px 0 0' }} />
                                            <span style={{ fontSize: 26, position: 'relative', zIndex: 1 }}>{p.emoji}</span>
                                        </motion.div>

                                        {/* Text */}
                                        <div className="flex-1 min-w-0 text-right">
                                            <p style={{ fontSize: 15, fontWeight: 800, color: isSel ? TXT.primary : TXT.secondary, lineHeight: 1.3 }}>
                                                {p.label}
                                            </p>
                                            <p className="truncate" style={{ fontSize: 11, fontWeight: 500, color: TXT.muted, marginTop: 3 }}>
                                                {p.description}
                                            </p>
                                        </div>

                                        {/* Trailing */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <AnimatePresence>
                                                {isSel && (
                                                    <motion.div
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0, opacity: 0 }}
                                                        transition={{ type: 'spring', stiffness: 500, damping: 26 }}
                                                        className="flex items-center justify-center relative overflow-hidden"
                                                        style={{
                                                            width: 28, height: 28, borderRadius: 99,
                                                            background: p.color,
                                                            boxShadow: `0 3px 12px ${p.color}40, inset 0 1px 0 rgba(255,255,255,0.40)`,
                                                        }}>
                                                        <div className="absolute inset-x-0 top-0"
                                                            style={{ height: '45%', background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, transparent 100%)', borderRadius: '99px 99px 0 0' }} />
                                                        <Check className="text-white relative" style={{ width: 14, height: 14, position: 'relative', zIndex: 1 }} strokeWidth={3} />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <motion.button
                                                whileTap={{ scale: 0.82 }}
                                                className="flex items-center justify-center"
                                                style={{
                                                    width: 34, height: 34, borderRadius: 12,
                                                    background: 'rgba(8,145,178,0.06)',
                                                    border: '1px solid rgba(255,255,255,0.65)',
                                                    color: TXT.muted,
                                                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.80)',
                                                }}
                                                onClick={e => { e.stopPropagation(); haptic.selection(); setExpanded(isExp ? null : p.id); }}>
                                                <motion.div animate={{ rotate: isExp ? 180 : 0 }} transition={{ duration: 0.25 }}>
                                                    <ChevronDown className="w-4 h-4" />
                                                </motion.div>
                                            </motion.button>
                                        </div>
                                    </button>

                                    {/* Expandable */}
                                    <AnimatePresence>
                                        {isExp && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.28, ease: [0.05, 0.7, 0.1, 1] }}
                                                className="overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
                                                <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(8,145,178,0.08)' }}>
                                                    <p style={{ fontSize: 10, color: TXT.muted, fontWeight: 800, marginTop: 12, marginBottom: 10, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                                                        يشمل هذا المسار:
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {p.clinicalQuestions.map(q => (
                                                            <span key={q.id} className="text-[10px] font-bold px-2.5 py-1.5 rounded-xl"
                                                                style={{ background: `${p.color}0C`, color: p.color, border: `1px solid ${p.color}1E` }}>
                                                                {q.text.length > 24 ? q.text.slice(0, 24) + '…' : q.text}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <BottomCTA label={selectedId ? `متابعة — ${chosen?.label}` : 'اختر أولاً'} onPress={onNext} disabled={!selectedId} variant="teal" />
        </div>
    );
}
