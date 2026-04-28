// components/health-engine/steps/StepEmotional.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH v9 — Emotional Context Step — Redesigned
// ════════════════════════════════════════════════════════════════════
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, Info } from 'lucide-react';
import { useState } from 'react';
import { EMOTIONAL_CONTEXTS } from '../constants';
import { BottomCTA } from '../ui/BottomCTA';
import { haptic } from '@/lib/HapticFeedback';

/* ══════════════════════════════════════════════════════ */
/* DESIGN TOKENS                                          */
/* ══════════════════════════════════════════════════════ */
const PAGE_BG = 'linear-gradient(168deg, #EDE9FE 0%, #E0F2FE 25%, #E2F1FE 50%, #F0F9FF 78%, #F5FDFE 100%)';

const GL = {
    base: 'rgba(255,255,255,0.58)',
    border: 'rgba(255,255,255,0.85)',
    shadow: '0 6px 24px rgba(129,140,248,0.10), 0 1.5px 6px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.92)',
    sheen: 'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.15) 45%, transparent 100%)',
};

const TXT = {
    primary: '#0C4A6E',
    secondary: '#0369A1',
    muted: '#7DD3FC',
    lavender: '#818CF8',
};

const EMOTION_COLORS: Record<string, string> = {
    work_stress: '#D97706', family: '#7C3AED', loneliness: '#4F46E5',
    grief: '#6B7280', financial: '#DC2626', identity: '#EA580C',
    anger: '#B91C1C', fear: '#6D28D9', burnout: '#0891B2',
    trauma: '#7C3AED', shame: '#BE185D', disconnected: '#0284C7', none: '#059669',
};

const QUOTES = [
    { text: '«كثير من الآلام الجسدية هي رسائل لم تُستمع بعد.»', src: 'الطب الوظيفي' },
    { text: '«الجسد يحتفظ بالحساب — مهما حاولنا الإغفال.»', src: 'van der Kolk' },
    { text: '«الأمراض المزمنة كثيراً ما تبدأ بصراع عاطفي مكبوت.»', src: 'فلسفة طِبرَا' },
];

// Intensity levels for each selected emotion
const INTENSITY_LABELS = ['خفيف', 'متوسط', 'قوي'];

/* ══════════════════════════════════════════════════════ */
/* EMOTION ENERGY MAP — visual orb cluster               */
/* ══════════════════════════════════════════════════════ */
function EmotionEnergyMap({ selected, colors }: { selected: string[]; colors: string[] }) {
    if (selected.length === 0 || (selected.length === 1 && selected[0] === 'none')) return null;

    const active = selected.filter(s => s !== 'none');
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="relative flex items-center justify-center mb-4"
            style={{ height: 80 }}>
            <div className="relative w-full flex items-center justify-center">
                {/* Central glow */}
                <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        width: 50, height: 50, borderRadius: '50%',
                        background: `radial-gradient(circle, ${colors[0] ?? '#818CF8'}30, transparent 70%)`,
                        filter: 'blur(8px)',
                        position: 'absolute',
                    }}
                />
                {/* Orbiting orbs */}
                {active.slice(0, 5).map((id, i) => {
                    const angle = (i / Math.min(active.length, 5)) * 2 * Math.PI;
                    const radius = 28 + (i % 2) * 8;
                    const x = Math.cos(angle - Math.PI / 2) * radius;
                    const y = Math.sin(angle - Math.PI / 2) * radius;
                    const color = EMOTION_COLORS[id] ?? '#818CF8';
                    const ctx = EMOTIONAL_CONTEXTS.find(e => e.id === id);
                    return (
                        <motion.div key={id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1, x, y }}
                            transition={{ delay: i * 0.08, type: 'spring', stiffness: 350, damping: 24 }}
                            style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: `linear-gradient(145deg, rgba(255,255,255,0.85) 0%, ${color}22 100%)`,
                                border: `1.5px solid ${color}33`,
                                backdropFilter: 'blur(8px)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: `0 4px 14px ${color}28`,
                                position: 'absolute',
                            }}>
                            <span style={{ fontSize: 17 }}>{ctx?.emoji ?? '💙'}</span>
                        </motion.div>
                    );
                })}
                {/* Count badge */}
                {active.length > 5 && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                        style={{
                            position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                            background: 'rgba(129,140,248,0.15)', border: '1px solid rgba(129,140,248,0.3)',
                            borderRadius: 99, padding: '2px 8px',
                            fontSize: 9, fontWeight: 900, color: '#4338CA',
                        }}>
                        +{active.length - 5} أخرى
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}

/* ══════════════════════════════════════════════════════ */
/* INTENSITY PICKER — for selected emotions               */
/* ══════════════════════════════════════════════════════ */
function IntensityPicker({ id, intensity, color, onSet }: {
    id: string; intensity: number; color: string; onSet: (v: number) => void;
}) {
    return (
        <div className="flex gap-1.5 mt-2">
            {INTENSITY_LABELS.map((label, i) => (
                <motion.button key={label}
                    whileTap={{ scale: 0.9 }}
                    onClick={e => { e.stopPropagation(); haptic.selection(); onSet(i + 1); }}
                    className="flex-1 py-1 rounded-[8px] text-center"
                    style={{
                        background: intensity === i + 1 ? `${color}18` : 'rgba(255,255,255,0.4)',
                        border: `1px solid ${intensity === i + 1 ? `${color}30` : 'rgba(255,255,255,0.6)'}`,
                        fontSize: 8.5, fontWeight: intensity === i + 1 ? 800 : 500,
                        color: intensity === i + 1 ? color : TXT.muted,
                        transition: 'all 150ms ease',
                    }}>
                    {label}
                </motion.button>
            ))}
        </div>
    );
}

/* ══════════════════════════════════════════════════════ */
/* MAIN                                                   */
/* ══════════════════════════════════════════════════════ */
export function StepEmotional({ selected, note, onToggle, onNote, onSubmit }: {
    selected: string[]; note: string;
    onToggle: (id: string) => void; onNote: (v: string) => void; onSubmit: () => void;
}) {
    const [intensities, setIntensities] = useState<Record<string, number>>({});
    const [showTip, setShowTip] = useState(false);

    const hasNone = selected.includes('none');
    const quote = QUOTES[new Date().getMinutes() % QUOTES.length];
    const activeColors = selected.filter(s => s !== 'none').map(s => EMOTION_COLORS[s] ?? TXT.lavender);
    const activeCount = selected.filter(s => s !== 'none').length;

    const setIntensity = (id: string, val: number) => {
        setIntensities(prev => ({ ...prev, [id]: val }));
    };

    return (
        <div className="relative min-h-screen" dir="rtl" style={{ background: PAGE_BG }}>
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.65, 0.4] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                        position: 'absolute', top: -80, left: -50, width: 300, height: 280, borderRadius: '50%',
                        background: 'radial-gradient(ellipse, rgba(129,140,248,0.18) 0%, transparent 65%)', filter: 'blur(50px)'
                    }} />
                <div style={{
                    position: 'absolute', bottom: 60, right: -40, width: 260, height: 260, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 65%)', filter: 'blur(48px)'
                }} />
            </div>

            <div className="relative z-10 px-4 pt-14 pb-44">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 28 }} className="mb-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full"
                            style={{ background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.20)', backdropFilter: 'blur(16px)' }}>
                            <Brain style={{ width: 12, height: 12, color: TXT.lavender }} />
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#5B21B6' }}>الخطوة ٤ من ٤ · البعد العاطفي</span>
                        </div>

                        {activeCount > 0 && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                                style={{ background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(129,140,248,0.25)' }}>
                                <span style={{ fontSize: 10, fontWeight: 900, color: '#4338CA' }}>{activeCount} محدد</span>
                            </motion.div>
                        )}
                    </div>

                    <h2 style={{ fontSize: 26, fontWeight: 900, color: TXT.primary, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 8 }}>
                        ماذا يحمل قلبك
                        <br />
                        <span style={{
                            background: `linear-gradient(135deg, ${TXT.lavender}, #22D3EE)`,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}>الآن؟</span>
                    </h2>
                    <p style={{ fontSize: 12, color: TXT.secondary, fontWeight: 500, lineHeight: 1.6 }}>
                        السياق العاطفي يرفع دقة التحليل بشكل كبير
                    </p>
                </motion.div>

                {/* Quote */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06, type: 'spring', stiffness: 260, damping: 28 }}
                    className="relative overflow-hidden rounded-[22px] p-4 mb-4"
                    style={{
                        background: 'rgba(129,140,248,0.07)', border: '1.5px solid rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(22px)', boxShadow: '0 6px 24px rgba(129,140,248,0.10), inset 0 1.5px 0 rgba(255,255,255,0.92)'
                    }}>
                    <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: '48%', background: GL.sheen, borderRadius: '22px 22px 0 0' }} />
                    <div className="absolute top-1 left-4 font-serif select-none" style={{ fontSize: 52, lineHeight: 1, color: 'rgba(129,140,248,0.16)' }} aria-hidden>«</div>
                    <div className="flex gap-3 items-start relative z-10">
                        <div className="flex-shrink-0 mt-0.5 relative overflow-hidden flex items-center justify-center"
                            style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(255,255,255,0.75)', boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.85)' }}>
                            <div className="absolute inset-x-0 top-0" style={{ height: '46%', background: GL.sheen, borderRadius: '11px 11px 0 0' }} />
                            <Brain style={{ width: 14, height: 14, color: TXT.lavender, position: 'relative', zIndex: 1 }} />
                        </div>
                        <div>
                            <p style={{ fontSize: 12, color: '#4338CA', fontStyle: 'italic', lineHeight: 1.7, fontWeight: 500 }}>{quote.text}</p>
                            <p style={{ fontSize: 10, color: TXT.lavender, fontWeight: 700, marginTop: 5 }}>— {quote.src}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Energy map */}
                <AnimatePresence>
                    {activeColors.length > 0 && (
                        <EmotionEnergyMap selected={selected} colors={activeColors} />
                    )}
                </AnimatePresence>

                {/* Section label with tip */}
                <div className="flex items-center justify-between mb-3">
                    <button onClick={() => setShowTip(!showTip)} className="flex items-center gap-1">
                        <Info style={{ width: 12, height: 12, color: TXT.muted }} />
                        <span style={{ fontSize: 10, color: TXT.muted, fontWeight: 600 }}>لماذا؟</span>
                    </button>
                    <p style={{ fontSize: 10, color: TXT.muted, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        ما يشغل بالك الآن
                    </p>
                </div>

                {/* Tip tooltip */}
                <AnimatePresence>
                    {showTip && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            className="mb-3 overflow-hidden">
                            <div className="rounded-[14px] p-3"
                                style={{ background: 'rgba(129,140,248,0.07)', border: '1px solid rgba(129,140,248,0.18)' }}>
                                <p style={{ fontSize: 11, color: '#4338CA', lineHeight: 1.7, fontWeight: 500 }}>
                                    🧠 الأبحاث تثبت أن 70% من الأعراض الجسدية المزمنة مرتبطة بضغوط عاطفية غير محلولة. اختيارك هنا يرفع دقة خطة العلاج.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Emotion chips */}
                <div className="flex flex-wrap gap-2 mb-5">
                    {EMOTIONAL_CONTEXTS.map((ctx, i) => {
                        const isSel = selected.includes(ctx.id);
                        const isNone = ctx.id === 'none';
                        const accent = EMOTION_COLORS[ctx.id] ?? TXT.lavender;
                        return (
                            <motion.div key={ctx.id}
                                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.08 + i * 0.022, type: 'spring', stiffness: 380, damping: 26 }}
                                className="relative">
                                <motion.button
                                    whileTap={{ scale: 0.91 }}
                                    onClick={() => { haptic.selection(); onToggle(ctx.id); }}
                                    className="flex items-center gap-1.5 rounded-full relative overflow-hidden"
                                    style={{
                                        height: 40, paddingLeft: 14, paddingRight: 14,
                                        background: isSel ? `linear-gradient(145deg, rgba(255,255,255,0.88) 0%, ${accent}14 100%)` : GL.base,
                                        border: `1.5px solid ${isSel ? 'rgba(255,255,255,0.92)' : GL.border}`,
                                        backdropFilter: 'blur(20px)',
                                        transition: 'all 200ms cubic-bezier(0.05,0.7,0.1,1)',
                                        boxShadow: isSel
                                            ? `0 4px 16px ${accent}18, inset 0 1.5px 0 rgba(255,255,255,0.95)`
                                            : 'inset 0 1.5px 0 rgba(255,255,255,0.85), 0 2px 8px rgba(0,0,0,0.04)',
                                    }}>
                                    {isSel && <div className="absolute inset-x-0 top-0 pointer-events-none"
                                        style={{ height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)', borderRadius: '99px 99px 0 0' }} />}
                                    <span style={{ fontSize: 16, position: 'relative', zIndex: 1 }}>{ctx.emoji}</span>
                                    <span style={{
                                        fontSize: 12, fontWeight: 700, position: 'relative', zIndex: 1,
                                        color: isSel ? (isNone ? '#059669' : accent) : TXT.secondary
                                    }}>{ctx.label}</span>

                                    {isSel && !isNone && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                            style={{ background: accent, position: 'relative', zIndex: 1 }} />
                                    )}
                                </motion.button>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Intensity section for selected emotions */}
                <AnimatePresence>
                    {selected.filter(s => s !== 'none').length > 0 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }} className="mb-4 overflow-hidden">
                            <div className="rounded-[20px] p-4 relative overflow-hidden"
                                style={{ background: GL.base, border: `1.5px solid ${GL.border}`, backdropFilter: 'blur(20px)', boxShadow: GL.shadow }}>
                                <div className="absolute inset-x-0 top-0 pointer-events-none h-[45%]"
                                    style={{ background: GL.sheen, borderRadius: '20px 20px 0 0' }} />
                                <p style={{ fontSize: 10, fontWeight: 900, color: TXT.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
                                    <Sparkles style={{ width: 10, height: 10, display: 'inline', marginLeft: 4 }} />
                                    حدّد شدة كل شعور
                                </p>
                                <div className="space-y-3 relative z-10">
                                    {selected.filter(s => s !== 'none').map(id => {
                                        const ctx = EMOTIONAL_CONTEXTS.find(e => e.id === id);
                                        const accent = EMOTION_COLORS[id] ?? TXT.lavender;
                                        return ctx ? (
                                            <div key={id}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span style={{ fontSize: 14 }}>{ctx.emoji}</span>
                                                    <span style={{ fontSize: 11, fontWeight: 700, color: accent }}>{ctx.label}</span>
                                                </div>
                                                <IntensityPicker
                                                    id={id}
                                                    intensity={intensities[id] ?? 0}
                                                    color={accent}
                                                    onSet={v => setIntensity(id, v)}
                                                />
                                            </div>
                                        ) : null;
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Note */}
                <AnimatePresence>
                    {!hasNone && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: [0.05, 0.7, 0.1, 1] }}>
                            <div className="mb-2 flex items-center gap-1.5">
                                <Sparkles style={{ width: 11, height: 11, color: '#0891B2' }} />
                                <p style={{ fontSize: 10.5, color: TXT.secondary, fontWeight: 700 }}>ملاحظة للطبيب (اختياري)</p>
                            </div>
                            <div className="relative overflow-hidden rounded-[18px]"
                                style={{ background: GL.base, border: `1.5px solid ${GL.border}`, backdropFilter: 'blur(22px)', boxShadow: GL.shadow }}>
                                <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: '40%', background: GL.sheen, borderRadius: '18px 18px 0 0' }} />
                                <div className="absolute top-0 left-[15%] right-[15%] h-[3px] rounded-b-full"
                                    style={{ background: 'linear-gradient(90deg, rgba(8,145,178,0.2), #818CF8, rgba(8,145,178,0.2))' }} />
                                <textarea value={note} onChange={e => onNote(e.target.value)} placeholder="ما تشعر أنه يؤثر على صحتك..."
                                    rows={3} className="w-full px-4 py-3.5 pt-5 resize-none focus:outline-none bg-transparent relative"
                                    style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.6, color: TXT.primary, caretColor: '#0891B2', zIndex: 1, position: 'relative' }} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <BottomCTA
                label="تحليل حالتي الآن ✦"
                onPress={onSubmit}
                variant="gradient"
                sublabel={selected.length === 0 ? 'اختر ما ينطبق أو اضغط «لا شيء»' : `${activeCount > 0 ? `${activeCount} مشاعر محددة · ` : ''}يشمل الأبعاد الجسدية والعاطفية`}
            />
        </div>
    );
}
