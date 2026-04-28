// components/health-engine/steps/StepPathway.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH v9 — Pathway Selection — Redesigned
// ════════════════════════════════════════════════════════════════════
'use client';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronDown, TrendingUp, Users, Clock } from 'lucide-react';
import { PATHWAYS } from '../constants';
import { BottomCTA } from '../ui/BottomCTA';
import { haptic } from '@/lib/HapticFeedback';
import { trackEvent } from '@/lib/analytics';

/* ══════════════════════════════════════════════════════ */
/* DESIGN TOKENS                                          */
/* ══════════════════════════════════════════════════════ */
const PAGE_BG = 'linear-gradient(168deg, #E8F8FB 0%, #D0F0F8 18%, #E2F1FE 42%, #EDF5FF 65%, #F0FAFB 88%, #F5FDFE 100%)';

const GL = {
    base:      'rgba(255,255,255,0.62)',
    selected:  'rgba(255,255,255,0.82)',
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

// Metadata for each pathway — prevalence and analysis time
const PATHWAY_META: Record<string, { prevalence: number; time: string; severity: 'low' | 'medium' | 'high' }> = {
    fatigue:     { prevalence: 78, time: '٣ د',  severity: 'medium' },
    sleep:       { prevalence: 65, time: '٢ د',  severity: 'medium' },
    digestion:   { prevalence: 52, time: '٣ د',  severity: 'medium' },
    stress:      { prevalence: 71, time: '٢ د',  severity: 'medium' },
    hormonal:    { prevalence: 44, time: '٤ د',  severity: 'high'   },
    immunity:    { prevalence: 38, time: '٣ د',  severity: 'medium' },
    pain:        { prevalence: 56, time: '٣ د',  severity: 'high'   },
    cognitive:   { prevalence: 33, time: '٣ د',  severity: 'low'    },
    nutrition:   { prevalence: 61, time: '٢ د',  severity: 'low'    },
    weight:      { prevalence: 49, time: '٣ د',  severity: 'medium' },
};

const SEVERITY_LABEL: Record<string, string> = {
    low: 'شكوى شائعة', medium: 'تحتاج متابعة', high: 'أولوية عالية',
};
const SEVERITY_COLOR: Record<string, string> = {
    low: '#059669', medium: '#D97706', high: '#DC2626',
};

/* ══════════════════════════════════════════════════════ */
/* SEARCH BAR                                             */
/* ══════════════════════════════════════════════════════ */
function SearchBar({ query, onChange }: { query: string; onChange: (v: string) => void }) {
    return (
        <div className="relative rounded-[16px] mb-4 overflow-hidden"
            style={{
                background: GL.base,
                border: `1.5px solid ${GL.border}`,
                backdropFilter: 'blur(20px)',
                boxShadow: GL.shadow,
            }}>
            <div className="absolute inset-x-0 top-0 h-[48%] pointer-events-none"
                style={{ background: GL.sheen, borderRadius: '16px 16px 0 0' }} />
            <div className="flex items-center px-3.5 py-3 gap-2.5 relative z-10">
                <span style={{ fontSize: 16 }}>🔍</span>
                <input
                    value={query}
                    onChange={e => onChange(e.target.value)}
                    placeholder="ابحث عن شكواك..."
                    className="flex-1 bg-transparent outline-none text-right"
                    style={{ fontSize: 13, fontWeight: 600, color: TXT.primary, caretColor: TXT.accent }}
                />
                <AnimatePresence>
                    {query.length > 0 && (
                        <motion.button initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                            onClick={() => onChange('')}
                            style={{ width: 20, height: 20, borderRadius: 99, background: 'rgba(8,145,178,0.12)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: 10, color: TXT.accent, lineHeight: 1 }}>✕</span>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

/* ══════════════════════════════════════════════════════ */
/* PATHWAY CARD                                           */
/* ══════════════════════════════════════════════════════ */
function PathwayCard({ p, index, selectedId, expanded, onSelect, onExpand }: {
    p: typeof PATHWAYS[0];
    index: number;
    selectedId: string;
    expanded: boolean;
    onSelect: () => void;
    onExpand: () => void;
}) {
    const isSel = p.id === selectedId;
    const meta = PATHWAY_META[p.id] ?? { prevalence: 50, time: '٣ د', severity: 'medium' };

    return (
        <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.06 + index * 0.035, type: 'spring', stiffness: 280, damping: 28 }}>
            <motion.div
                layout
                className="relative overflow-hidden"
                style={{
                    borderRadius: 22,
                    background: isSel
                        ? `linear-gradient(155deg, rgba(255,255,255,0.86) 0%, ${p.color}12 70%, ${p.color}07 100%)`
                        : GL.base,
                    border: `1.5px solid ${isSel ? GL.borderSel : GL.border}`,
                    backdropFilter: 'blur(22px) saturate(130%)',
                    WebkitBackdropFilter: 'blur(22px) saturate(130%)',
                    boxShadow: isSel ? `${GL.shadowSel}, 0 0 22px ${p.color}14` : GL.shadow,
                    transition: 'all 280ms cubic-bezier(0.05,0.7,0.1,1)',
                }}>
                {/* Glass sheen */}
                <div className="absolute inset-x-0 top-0 pointer-events-none"
                    style={{ height: '50%', background: GL.sheen, borderRadius: '22px 22px 0 0' }} />
                <div className="absolute inset-0 pointer-events-none"
                    style={{ background: GL.spec, borderRadius: 22 }} />

                {/* Selected accent bar */}
                {isSel && (
                    <div className="absolute right-0 top-3 bottom-3 pointer-events-none"
                        style={{ width: 3, borderRadius: 99, background: `linear-gradient(to bottom, ${p.color}, ${p.color}50)`, boxShadow: `0 0 8px ${p.color}35` }} />
                )}
                {/* Selected glow */}
                {isSel && (
                    <div className="absolute bottom-0 inset-x-0 pointer-events-none"
                        style={{ height: 36, background: `linear-gradient(0deg, ${p.color}0A 0%, transparent 100%)`, borderRadius: '0 0 22px 22px' }} />
                )}

                {/* Main row */}
                <button className="w-full flex items-center gap-3.5 px-4 py-4 text-right cursor-pointer"
                    style={{ position: 'relative', zIndex: 1 }}
                    onClick={() => { haptic.impact(); onSelect(); trackEvent('assessment_pathway_selected', { pathway_id: p.id }); }}>

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

                    {/* Text block */}
                    <div className="flex-1 min-w-0 text-right">
                        <div className="flex items-center gap-2 justify-end mb-0.5">
                            <p style={{ fontSize: 15, fontWeight: 800, color: isSel ? TXT.primary : TXT.secondary }}>
                                {p.label}
                            </p>
                            {isSel && (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="text-[8px] font-bold px-1.5 py-0.5 rounded-full"
                                    style={{ background: `${p.color}15`, color: p.color, border: `1px solid ${p.color}25` }}>
                                    محدد
                                </motion.span>
                            )}
                        </div>
                        <p className="truncate" style={{ fontSize: 11, fontWeight: 500, color: TXT.muted, marginBottom: 5 }}>
                            {p.description}
                        </p>
                        {/* Meta row */}
                        <div className="flex items-center gap-2 justify-end">
                            <span className="flex items-center gap-1">
                                <Users style={{ width: 9, height: 9, color: TXT.muted }} />
                                <span style={{ fontSize: 9, fontWeight: 700, color: TXT.muted }}>{meta.prevalence}% من المراجعين</span>
                            </span>
                            <span style={{ width: 2, height: 2, borderRadius: '50%', background: TXT.muted, display: 'inline-block' }} />
                            <span className="flex items-center gap-1">
                                <Clock style={{ width: 9, height: 9, color: TXT.muted }} />
                                <span style={{ fontSize: 9, fontWeight: 700, color: TXT.muted }}>{meta.time}</span>
                            </span>
                            <span style={{ width: 2, height: 2, borderRadius: '50%', background: TXT.muted, display: 'inline-block' }} />
                            <span style={{ fontSize: 9, fontWeight: 800, color: SEVERITY_COLOR[meta.severity] }}>
                                {SEVERITY_LABEL[meta.severity]}
                            </span>
                        </div>
                    </div>

                    {/* Trailing controls */}
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
                                background: expanded ? `${p.color}12` : 'rgba(8,145,178,0.06)',
                                border: `1px solid ${expanded ? `${p.color}22` : 'rgba(255,255,255,0.65)'}`,
                                color: TXT.muted,
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.80)',
                            }}
                            onClick={e => { e.stopPropagation(); haptic.selection(); onExpand(); }}>
                            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
                                <ChevronDown className="w-4 h-4" />
                            </motion.div>
                        </motion.button>
                    </div>
                </button>

                {/* Expandable detail */}
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.05, 0.7, 0.1, 1] }}
                            className="overflow-hidden" style={{ position: 'relative', zIndex: 1 }}>
                            <div className="px-4 pb-4" style={{ borderTop: `1px solid ${p.color}14` }}>
                                {/* Prevalence bar */}
                                <div className="mt-3 mb-3">
                                    <div className="flex justify-between mb-1.5">
                                        <span style={{ fontSize: 9, fontWeight: 900, color: TXT.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                            شيوع الشكوى
                                        </span>
                                        <span style={{ fontSize: 9, fontWeight: 900, color: p.color }}>{meta.prevalence}%</span>
                                    </div>
                                    <div className="rounded-full overflow-hidden" style={{ height: 4, background: `${p.color}14` }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${meta.prevalence}%` }}
                                            transition={{ duration: 0.6, ease: [0.05, 0.7, 0.1, 1] }}
                                            className="h-full rounded-full"
                                            style={{ background: `linear-gradient(90deg, ${p.color}, ${p.color}90)` }}
                                        />
                                    </div>
                                </div>

                                {/* Clinical questions preview */}
                                <p style={{ fontSize: 9.5, fontWeight: 900, color: TXT.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                                    يشمل هذا المسار:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {p.clinicalQuestions.slice(0, 5).map(q => (
                                        <span key={q.id} className="text-[10px] font-bold px-2.5 py-1.5 rounded-xl"
                                            style={{ background: `${p.color}0C`, color: p.color, border: `1px solid ${p.color}1E` }}>
                                            {q.text.length > 20 ? q.text.slice(0, 20) + '…' : q.text}
                                        </span>
                                    ))}
                                    {p.clinicalQuestions.length > 5 && (
                                        <span className="text-[10px] font-bold px-2.5 py-1.5 rounded-xl"
                                            style={{ background: `rgba(8,145,178,0.06)`, color: TXT.muted, border: `1px solid rgba(8,145,178,0.12)` }}>
                                            +{p.clinicalQuestions.length - 5} أسئلة
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════ */
/* MAIN                                                   */
/* ══════════════════════════════════════════════════════ */
export function StepPathway({ selectedId, onSelect, onNext }: {
    selectedId: string; onSelect: (id: string) => void; onNext: () => void;
}) {
    const [expanded, setExpanded] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const chosen = PATHWAYS.find(p => p.id === selectedId);
    const tracked = useRef(false);

    useEffect(() => {
        if (!tracked.current) {
            tracked.current = true;
            trackEvent('assessment_started', {});
        }
    }, []);

    const filteredPathways = PATHWAYS.filter(p =>
        searchQuery === '' ||
        p.label.includes(searchQuery) ||
        p.description.includes(searchQuery)
    );

    return (
        <div className="relative min-h-screen" dir="rtl" style={{ background: PAGE_BG }}>

            {/* Ambient glows */}
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                <motion.div
                    animate={{ scale: [1, 1.08, 1], opacity: [0.45, 0.70, 0.45] }}
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
            </div>

            <div className="relative z-10 px-4 pt-14 pb-44">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                    className="mb-5">

                    {/* Step chip */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full mb-4"
                        style={{ background: 'rgba(8,145,178,0.08)', border: '1px solid rgba(8,145,178,0.18)', backdropFilter: 'blur(16px)' }}>
                        <div className="relative">
                            <div className="w-2 h-2 rounded-full" style={{ background: '#0891B2' }} />
                            <motion.div className="absolute inset-0 rounded-full" style={{ background: '#0891B2' }}
                                animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                                transition={{ duration: 2.5, repeat: Infinity }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#0E7490', letterSpacing: '0.04em' }}>
                            الخطوة ١ من ٤ · اختر شكواك
                        </span>
                    </div>

                    <h2 style={{ fontSize: 26, fontWeight: 900, color: TXT.primary, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 6 }}>
                        ما أكثر شيء
                        <br />
                        <span style={{
                            background: 'linear-gradient(135deg, #0891B2, #22D3EE 50%, #818CF8)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}>
                            يزعجك الآن؟
                        </span>
                    </h2>
                    <p style={{ fontSize: 12.5, color: TXT.secondary, fontWeight: 500, lineHeight: 1.5 }}>
                        اختر الأقرب لما تشعر به — يمكن التوسع بالضغط على ▼
                    </p>
                </motion.div>

                {/* Search */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <SearchBar query={searchQuery} onChange={setSearchQuery} />
                </motion.div>

                {/* Results count */}
                <AnimatePresence>
                    {searchQuery && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            style={{ fontSize: 11, color: TXT.muted, fontWeight: 600, marginBottom: 10, textAlign: 'center' }}>
                            {filteredPathways.length === 0 ? 'لا نتائج — جرّب كلمة أخرى' : `${filteredPathways.length} نتيجة`}
                        </motion.p>
                    )}
                </AnimatePresence>

                {/* Pathway cards */}
                <div className="space-y-2.5">
                    <AnimatePresence mode="popLayout">
                        {filteredPathways.map((p, i) => (
                            <PathwayCard
                                key={p.id}
                                p={p}
                                index={i}
                                selectedId={selectedId}
                                expanded={expanded === p.id}
                                onSelect={() => { onSelect(p.id); setExpanded(null); }}
                                onExpand={() => setExpanded(expanded === p.id ? null : p.id)}
                            />
                        ))}
                    </AnimatePresence>
                </div>

                {/* No results */}
                <AnimatePresence>
                    {filteredPathways.length === 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-12 text-center">
                            <span style={{ fontSize: 40, marginBottom: 12 }}>🔍</span>
                            <p style={{ fontSize: 15, fontWeight: 800, color: TXT.primary, marginBottom: 6 }}>لم نجد ما تبحث عنه</p>
                            <p style={{ fontSize: 12, color: TXT.muted }}>جرّب كلمات مختلفة أو اختر من القائمة</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tip note */}
                {selectedId && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-[14px]"
                        style={{ background: `${chosen?.color ?? '#0891B2'}0A`, border: `1px solid ${chosen?.color ?? '#0891B2'}18` }}>
                        <TrendingUp style={{ width: 12, height: 12, color: chosen?.color ?? '#0891B2', flexShrink: 0 }} />
                        <p style={{ fontSize: 10.5, color: TXT.secondary, fontWeight: 600 }}>
                            اخترت: <strong style={{ color: chosen?.color ?? '#0891B2' }}>{chosen?.label}</strong> — اضغط التالي للمتابعة
                        </p>
                    </motion.div>
                )}
            </div>

            <BottomCTA
                label={selectedId ? `متابعة — ${chosen?.label}` : 'اختر شكواك أولاً'}
                onPress={onNext}
                disabled={!selectedId}
                variant="teal"
            />
        </div>
    );
}
