'use client';
// components/health-engine/steps/StepPathway.tsx
// ════════════════════════════════════════════════════════════════
// TIBRAH Clinical Glass OS — Native Premium Pathway Selector
// iOS-native feel: deep glass, tactile selection, floating groups.
// ════════════════════════════════════════════════════════════════

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Check, HeartPulse, Leaf, Moon, Move3D, Search, Shield, Sparkles, Waves, X } from 'lucide-react';
import { PATHWAYS } from '../constants';
import { BottomCTA } from '../ui/BottomCTA';
import { haptic } from '@/lib/HapticFeedback';
import { trackEvent } from '@/lib/analytics';

type PathwayItem = typeof PATHWAYS[number];
const GENERAL_UNCERTAIN_PATHWAY_ID = 'general_uncertain';

const C = {
    bg:     '#EBF6FA',
    ink:    '#073B52',
    sub:    '#0F6F8F',
    muted:  '#64B5C9',
    teal:   '#0787A5',
    tealL:  '#28C7E8',
};

const GROUPS = [
    { id: 'body_energy',    title: 'الجسد والطاقة',   icon: HeartPulse, color: '#0787A5', grad: ['#E0F6FD', '#BAE6FD'] },
    { id: 'digestion_food', title: 'الهضم والغذاء',   icon: Leaf,        color: '#059669', grad: ['#D1FAE5', '#A7F3D0'] },
    { id: 'sleep_rhythm',   title: 'النوم والإيقاع',  icon: Moon,        color: '#6366F1', grad: ['#EDE9FE', '#DDD6FE'] },
    { id: 'stress_mind',    title: 'النفس والضغط',    icon: Waves,       color: '#D97706', grad: ['#FEF3C7', '#FDE68A'] },
    { id: 'pain_movement',  title: 'الألم والحركة',   icon: Move3D,      color: '#DC2626', grad: ['#FEE2E2', '#FECACA'] },
    { id: 'skin_immune',    title: 'الجلد والمناعة',  icon: Shield,      color: '#0D9488', grad: ['#CCFBF1', '#99F6E4'] },
    { id: 'other',          title: 'أخرى',            icon: Sparkles,    color: '#64748B', grad: ['#F1F5F9', '#E2E8F0'] },
] as const;

const PATHWAY_GROUP: Record<string, typeof GROUPS[number]['id']> = {
    fatigue:          'body_energy',
    headache:         'body_energy',
    hormonal:         'body_energy',
    digestion:        'digestion_food',
    digestive:        'digestion_food',
    sleep:            'sleep_rhythm',
    circadian:        'sleep_rhythm',
    anxiety:          'stress_mind',
    stress:           'stress_mind',
    pain:             'pain_movement',
    joint:            'pain_movement',
    back:             'pain_movement',
    immune:           'skin_immune',
    skin:             'skin_immune',
    allergy:          'skin_immune',
    general_uncertain:'other',
};

const EXAMPLES: Record<string, string> = {
    fatigue:  'خمول، هبوط بعد الأكل، إرهاق صباحي، ضعف تركيز',
    headache: 'صداع نابض، ضغط الرأس، شقيقة، حساسية للضوء',
    hormonal: 'دورة مضطربة، درقية، تغير وزن، تساقط شعر',
    digestion:'غازات، حموضة، إمساك، إسهال، ثقل بعد الأكل',
    sleep:    'أرق، نوم متقطع، استيقاظ متعب، وجبات متأخرة',
    anxiety:  'توتر، خفقان، خوف صحي، تفكير زائد، شد عضلي',
    pain:     'ظهر، رقبة، مفاصل، ألم منتشر، تيبس صباحي',
    immune:   'حساسية، عدوى متكررة، التهاب، تعب بعد المرض',
};

/* ── Native search box ──────────────────────────────────────── */
function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div className="relative rounded-[20px] overflow-hidden mb-5"
            style={{
                background: 'rgba(255,255,255,0.78)',
                border: '1px solid rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 2px 12px rgba(8,145,178,0.08), inset 0 1px 0 rgba(255,255,255,0.95)',
            }}
        >
            <div className="flex items-center gap-3 px-4 py-3.5">
                <Search style={{ width: 16, height: 16, color: C.muted, flexShrink: 0 }} />
                <input
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder="ابحث عن وصف الأعراض..."
                    className="flex-1 bg-transparent outline-none text-right"
                    style={{ fontSize: 14, fontWeight: 500, color: C.ink, caretColor: C.teal }}
                />
                <AnimatePresence>
                    {value && (
                        <motion.button
                            type="button"
                            initial={{ opacity: 0, scale: 0.6 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.6 }}
                            onClick={() => onChange('')}
                            className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(8,145,178,0.12)' }}
                        >
                            <X style={{ width: 11, height: 11, color: C.teal }} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

/* ── Native pathway card — deep glass with icon orb ────────── */
function PathwayCard({ item, selected, index, onSelect }: {
    item: PathwayItem; selected: boolean; index: number; onSelect: () => void;
}) {
    const examples = EXAMPLES[item.id] ?? item.subtitle;
    const isDigestion = item.id === 'digestion';

    return (
        <motion.button
            type="button"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.045, type: 'spring', stiffness: 280, damping: 26 }}
            whileTap={{ scale: 0.97, y: 1 }}
            onClick={() => { haptic.impact(); onSelect(); trackEvent('assessment_pathway_selected', { pathway_id: item.id }); }}
            className="w-full text-right relative overflow-hidden"
            style={{
                borderRadius: 22,
                background: selected
                    ? 'rgba(255,255,255,0.97)'
                    : 'rgba(255,255,255,0.72)',
                border: selected
                    ? `1.5px solid ${item.color}30`
                    : '1px solid rgba(255,255,255,0.90)',
                boxShadow: selected
                    ? `0 12px 36px ${item.color}18, 0 4px 14px rgba(0,0,0,0.06), inset 0 1.5px 0 rgba(255,255,255,0.98)`
                    : '0 2px 10px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.90)',
                backdropFilter: 'blur(20px) saturate(140%)',
                transition: 'all 200ms cubic-bezier(0.05,0.7,0.1,1)',
                padding: '14px 16px',
            }}
        >
            {/* Top shine line */}
            <div className="absolute inset-x-0 top-0 h-px pointer-events-none"
                style={{ background: 'rgba(255,255,255,0.95)' }} />
            {/* Selected accent top strip */}
            {selected && (
                <motion.div
                    initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute top-0 left-[15%] right-[15%] h-[2px] rounded-b-full pointer-events-none"
                    style={{ background: `linear-gradient(90deg, transparent, ${item.color}, transparent)`, transformOrigin: 'center' }}
                />
            )}
            {/* Selected left bar */}
            {selected && (
                <motion.div
                    initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 top-3 bottom-3 w-[3px] rounded-l-full pointer-events-none"
                    style={{ background: `linear-gradient(to bottom, ${item.color}80, ${item.color}, ${item.color}80)`, transformOrigin: 'top' }}
                />
            )}

            <div className="relative z-10 flex items-center gap-3.5">
                {/* Icon orb — bigger, deeper */}
                <div className="relative shrink-0" style={{ width: 54, height: 54 }}>
                    {/* Glow ring when selected */}
                    {selected && (
                        <motion.div
                            className="absolute rounded-[18px] pointer-events-none"
                            animate={{ opacity: [0.2, 0.45, 0.2], scale: [1, 1.06, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ inset: -4, border: `2px solid ${item.color}30`, borderRadius: 22 }}
                        />
                    )}
                    <div className="w-full h-full rounded-[18px] flex items-center justify-center relative overflow-hidden"
                        style={{
                            background: selected
                                ? `linear-gradient(145deg, rgba(255,255,255,0.95), ${item.color}20)`
                                : `linear-gradient(145deg, rgba(255,255,255,0.80), ${item.color}10)`,
                            border: `1.5px solid ${selected ? `${item.color}28` : 'rgba(255,255,255,0.90)'}`,
                            boxShadow: selected
                                ? `0 8px 20px ${item.color}18, inset 0 1.5px 0 rgba(255,255,255,0.95)`
                                : '0 2px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.80)',
                        }}>
                        {/* Inner sheen */}
                        <div className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
                            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.70), transparent)', borderRadius: '18px 18px 0 0' }} />
                        <motion.span
                            animate={selected ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ fontSize: 24, position: 'relative', zIndex: 1 }}>
                            {item.emoji}
                        </motion.span>
                    </div>
                </div>

                {/* Text content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h3 style={{ fontSize: 15.5, fontWeight: 900, color: selected ? item.color : C.ink, lineHeight: 1.2, transition: 'color 0.2s' }}>
                            {item.label}
                        </h3>
                        {/* Check badge */}
                        <AnimatePresence>
                            {selected && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 600, damping: 24 }}
                                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                                    style={{ background: item.color, boxShadow: `0 4px 12px ${item.color}40` }}
                                >
                                    <Check style={{ width: 12, height: 12, color: '#fff', strokeWidth: 3 }} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <p style={{ fontSize: 11.5, fontWeight: 700, color: item.color, marginBottom: 4, opacity: 0.85 }}>
                        {item.description}
                    </p>
                    <p style={{ fontSize: 11, lineHeight: 1.6, color: C.muted, fontWeight: 500 }}>
                        {examples}
                    </p>
                    {isDigestion && (
                        <div className="flex items-center gap-1 mt-2">
                            <span style={{ fontSize: 9.5, fontWeight: 900, color: '#059669', background: 'rgba(5,150,105,0.10)', border: '1px solid rgba(5,150,105,0.20)', borderRadius: 20, padding: '2px 8px' }}>
                                🥗 يشمل أسئلة الغذاء والإيقاع
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </motion.button>
    );
}

/* ── Floating group pill header ────────────────────────────── */
function GroupPill({ group, delay }: { group: typeof GROUPS[number]; delay: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, type: 'spring', stiffness: 280, damping: 28 }}
            className="flex items-center gap-2 mb-3 mr-1"
        >
            {/* Colored pill */}
            <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{
                    background: `linear-gradient(135deg, ${group.grad[0]}, ${group.grad[1]})`,
                    border: `1px solid ${group.color}22`,
                    boxShadow: `0 2px 8px ${group.color}14`,
                }}>
                <group.icon style={{ width: 12, height: 12, color: group.color }} />
                <span style={{ fontSize: 11.5, fontWeight: 900, color: group.color, letterSpacing: '0.02em' }}>
                    {group.title}
                </span>
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN
   ═══════════════════════════════════════════════════════════════ */
export function StepPathway({ selectedId, onSelect, onUnsure, onNext }: {
    selectedId: string;
    onSelect: (id: string) => void;
    onUnsure?: () => void;
    onNext: () => void;
}) {
    const [query, setQuery] = useState('');
    const tracked = useRef(false);

    useEffect(() => {
        if (!tracked.current) { tracked.current = true; trackEvent('assessment_started', {}); }
    }, []);

    const normalized = query.trim();
    const visible = useMemo(() => PATHWAYS.filter(p => p.id !== GENERAL_UNCERTAIN_PATHWAY_ID).filter(p => {
        if (!normalized) return true;
        return [p.label, p.description, p.subtitle, EXAMPLES[p.id] ?? ''].some(t => t.includes(normalized));
    }), [normalized]);

    const selected = PATHWAYS.find(p => p.id === selectedId);
    const unsureSelected = selectedId === GENERAL_UNCERTAIN_PATHWAY_ID;
    const selectedLabel = unsureSelected ? 'لست متأكدًا — سنبدأ من الأعراض العامة' : selected?.label;
    let groupDelay = 0;

    return (
        <div className="relative min-h-screen overflow-x-hidden" dir="rtl" style={{ background: C.bg }}>
            {/* Ambient gradient orbs */}
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                <div style={{
                    position: 'absolute', top: -120, right: -80, width: 420, height: 380, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(34,211,238,0.18) 0%, transparent 62%)',
                    filter: 'blur(60px)',
                }} />
                <div style={{
                    position: 'absolute', bottom: 60, left: -100, width: 350, height: 320, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 62%)',
                    filter: 'blur(55px)',
                }} />
                <div style={{
                    position: 'absolute', top: '40%', right: -60, width: 260, height: 240, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 62%)',
                    filter: 'blur(48px)',
                }} />
            </div>

            <div className="relative z-10 px-4 pt-4" style={{ paddingBottom: 200 }}>

                {/* ── Page header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 240, damping: 28 }}
                    className="mb-5"
                >
                    <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 mb-3"
                        style={{ background: 'rgba(8,145,178,0.09)', border: '1px solid rgba(8,145,178,0.16)' }}>
                        <Activity style={{ width: 11, height: 11, color: C.teal }} />
                        <span style={{ fontSize: 10, fontWeight: 900, color: C.teal, letterSpacing: '0.08em' }}>المسار الأقرب</span>
                    </div>
                    <h2 style={{ fontSize: 28, fontWeight: 950, lineHeight: 1.15, color: C.ink, letterSpacing: '-0.02em', marginBottom: 10 }}>
                        ما أقرب وصف لما تشعر به؟
                    </h2>
                    <p style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.7, fontWeight: 500 }}>
                        اختر الأقرب لك — <strong style={{ fontWeight: 800, color: C.ink }}>لا تحتاج دقة 100٪</strong>، سنضيّق الاحتمالات بالأسئلة التالية.
                    </p>
                </motion.div>

                {/* ── Search ── */}
                <SearchBox value={query} onChange={setQuery} />

                {/* ── "Not sure" card — native prominent ── */}
                {!query && (
                    <motion.button
                        type="button"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05, type: 'spring', stiffness: 260, damping: 26 }}
                        whileTap={{ scale: 0.97, y: 1 }}
                        onClick={() => { haptic.impact(); onUnsure?.(); }}
                        className="w-full text-right relative overflow-hidden mb-6"
                        style={{
                            borderRadius: 22,
                            background: unsureSelected
                                ? 'linear-gradient(155deg, rgba(255,255,255,0.97), rgba(8,145,178,0.08))'
                                : 'linear-gradient(155deg, rgba(255,255,255,0.82), rgba(255,255,255,0.60))',
                            border: `1.5px solid ${unsureSelected ? 'rgba(8,145,178,0.28)' : 'rgba(255,255,255,0.92)'}`,
                            backdropFilter: 'blur(20px)',
                            boxShadow: unsureSelected
                                ? '0 12px 36px rgba(8,145,178,0.14), inset 0 1.5px 0 rgba(255,255,255,0.98)'
                                : '0 2px 10px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.90)',
                            padding: '14px 16px',
                        }}
                    >
                        {/* Top shine */}
                        <div className="absolute inset-x-0 top-0 h-px" style={{ background: 'rgba(255,255,255,0.95)' }} />
                        {unsureSelected && (
                            <motion.div
                                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                                className="absolute top-0 left-[15%] right-[15%] h-[2px] rounded-b-full pointer-events-none"
                                style={{ background: 'linear-gradient(90deg, transparent, rgba(8,145,178,0.8), transparent)', transformOrigin: 'center' }}
                            />
                        )}
                        <div className="relative z-10 flex items-center gap-3.5">
                            {/* "?" orb */}
                            <div className="relative shrink-0" style={{ width: 54, height: 54 }}>
                                <div className="w-full h-full rounded-[18px] flex items-center justify-center relative overflow-hidden"
                                    style={{
                                        background: unsureSelected
                                            ? 'linear-gradient(145deg, rgba(255,255,255,0.92), rgba(8,145,178,0.16))'
                                            : 'rgba(255,255,255,0.70)',
                                        border: `1.5px solid ${unsureSelected ? 'rgba(8,145,178,0.24)' : 'rgba(255,255,255,0.90)'}`,
                                        boxShadow: '0 3px 10px rgba(0,0,0,0.05)',
                                    }}>
                                    <div className="absolute inset-x-0 top-0 h-1/2" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.65), transparent)', borderRadius: '16px 16px 0 0' }} />
                                    <span style={{ fontSize: 24, position: 'relative', zIndex: 1, color: C.sub, fontWeight: 900 }}>؟</span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <p style={{ fontSize: 15.5, fontWeight: 900, color: unsureSelected ? C.teal : C.ink }}>لست متأكدًا من المسار</p>
                                    <AnimatePresence>
                                        {unsureSelected && (
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                                transition={{ type: 'spring', stiffness: 600, damping: 24 }}
                                                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                                                style={{ background: C.teal, boxShadow: `0 4px 12px ${C.teal}40` }}>
                                                <Check style={{ width: 12, height: 12, color: '#fff', strokeWidth: 3 }} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                <p style={{ fontSize: 11.5, lineHeight: 1.6, color: C.sub, fontWeight: 600 }}>
                                    نبدأ بمدخل عام ثم نعدّل الاتجاه تلقائياً
                                </p>
                                <p style={{ fontSize: 10.5, lineHeight: 1.5, color: C.muted, fontWeight: 500, marginTop: 3 }}>
                                    مناسب إذا كانت الأعراض متداخلة أو لا تعرف من أين تبدأ.
                                </p>
                            </div>
                        </div>
                    </motion.button>
                )}

                {/* ── Grouped pathway sections ── */}
                <div className="space-y-7">
                    {GROUPS.map(group => {
                        const items = visible.filter(p => (PATHWAY_GROUP[p.id] ?? 'other') === group.id);
                        if (items.length === 0) return null;
                        const sectionDelay = groupDelay;
                        groupDelay += 0.05;
                        return (
                            <section key={group.id}>
                                <GroupPill group={group} delay={sectionDelay} />
                                <div className="space-y-2.5">
                                    {items.map((item, i) => (
                                        <PathwayCard
                                            key={item.id}
                                            item={item}
                                            index={i}
                                            selected={item.id === selectedId}
                                            onSelect={() => onSelect(item.id)}
                                        />
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>

                {/* Empty search state */}
                {visible.length === 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="rounded-[20px] p-5 text-center mt-4"
                        style={{ background: 'rgba(255,255,255,0.70)', border: '1px solid rgba(255,255,255,0.90)', backdropFilter: 'blur(16px)' }}>
                        <span style={{ fontSize: 30, display: 'block', marginBottom: 8 }}>🔍</span>
                        <p style={{ color: C.sub, fontWeight: 750, fontSize: 13, lineHeight: 1.65 }}>
                            لم نجد وصفاً مطابقاً. جرّب كلمة أبسط أو اختر أقرب مسار.
                        </p>
                    </motion.div>
                )}
            </div>

            <BottomCTA
                label="التالي — قراءة الإشارات"
                onPress={onNext}
                disabled={!selectedId}
                variant="teal"
                sublabel={selectedLabel
                    ? `اخترت: ${selectedLabel} · كل إجابة تضيّق الاحتمالات`
                    : 'اختر المسار الأقرب حتى نبدأ من المكان الصحيح.'}
            />
        </div>
    );
}
