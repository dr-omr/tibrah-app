// components/health-engine/steps/StepEmotional.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Emotional Step
// تصميم: مائي فاتح · زجاج فيزيائي · ناتف
// ════════════════════════════════════════════════════════════════════
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles } from 'lucide-react';
import { EMOTIONAL_CONTEXTS } from '../constants';
import { BottomCTA } from '../ui/BottomCTA';
import { haptic } from '@/lib/HapticFeedback';

/* ══════════════════════════════════════════════════════════════════
   LIGHT WATER GLASS
   ══════════════════════════════════════════════════════════════════ */
const PAGE_BG = 'linear-gradient(168deg, #EDE9FE 0%, #E0F2FE 25%, #E2F1FE 50%, #F0F9FF 78%, #F5FDFE 100%)';

const GL = {
    base:     'rgba(255,255,255,0.58)',
    border:   'rgba(255,255,255,0.85)',
    shadow:   '0 6px 24px rgba(129,140,248,0.10), 0 1.5px 6px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.92)',
    sheen:    'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.15) 45%, transparent 100%)',
};

const TXT = {
    primary:   '#0C4A6E',
    secondary: '#0369A1',
    muted:     '#7DD3FC',
    lavender:  '#818CF8',
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

export function StepEmotional({ selected, note, onToggle, onNote, onSubmit }: {
    selected: string[]; note: string;
    onToggle: (id: string) => void; onNote: (v: string) => void; onSubmit: () => void;
}) {
    const hasNone      = selected.includes('none');
    const quote        = QUOTES[new Date().getMinutes() % QUOTES.length];
    const activeColors = selected.filter(s => s !== 'none').map(s => EMOTION_COLORS[s] ?? TXT.lavender);

    return (
        <div className="relative min-h-screen" dir="rtl" style={{ background: PAGE_BG }}>
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.65, 0.4] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ position: 'absolute', top: -80, left: -50, width: 300, height: 280, borderRadius: '50%',
                        background: 'radial-gradient(ellipse, rgba(129,140,248,0.18) 0%, transparent 65%)', filter: 'blur(50px)' }} />
                <div style={{ position: 'absolute', bottom: 60, right: -40, width: 260, height: 260, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(34,211,238,0.12) 0%, transparent 65%)', filter: 'blur(48px)' }} />
            </div>

            <div className="relative z-10 px-4 pt-14 pb-36">
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 28 }} className="mb-5">
                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full mb-5"
                        style={{ background: 'rgba(129,140,248,0.08)', border: '1px solid rgba(129,140,248,0.20)', backdropFilter: 'blur(16px)' }}>
                        <Brain style={{ width: 12, height: 12, color: TXT.lavender }} />
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#5B21B6' }}>الخطوة ٤ من ٤ · البعد العاطفي</span>
                    </div>
                    <h2 style={{ fontSize: 28, fontWeight: 900, color: TXT.primary, letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 8 }}>
                        ماذا يحمل قلبك<br />
                        <span style={{ background: `linear-gradient(135deg, ${TXT.lavender}, #22D3EE)`,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>الآن؟</span>
                    </h2>
                </motion.div>

                {/* Quote */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06, type: 'spring', stiffness: 260, damping: 28 }}
                    className="relative overflow-hidden rounded-[22px] p-4 mb-5"
                    style={{ background: 'rgba(129,140,248,0.07)', border: '1.5px solid rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(22px)', boxShadow: '0 6px 24px rgba(129,140,248,0.10), inset 0 1.5px 0 rgba(255,255,255,0.92)' }}>
                    <div className="absolute inset-x-0 top-0 pointer-events-none" style={{ height: '48%', background: GL.sheen, borderRadius: '22px 22px 0 0' }} />
                    <div className="absolute top-1 left-4 font-serif select-none" style={{ fontSize: 52, lineHeight: 1, color: 'rgba(129,140,248,0.16)' }} aria-hidden>«</div>
                    <div className="flex gap-3 items-start relative z-10">
                        <div className="flex-shrink-0 mt-0.5 relative overflow-hidden flex items-center justify-center"
                            style={{ width: 40, height: 40, borderRadius: 14,
                                background: 'rgba(129,140,248,0.12)', border: '1px solid rgba(255,255,255,0.75)',
                                boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.85)' }}>
                            <div className="absolute inset-x-0 top-0" style={{ height: '46%', background: GL.sheen, borderRadius: '13px 13px 0 0' }} />
                            <Brain style={{ width: 16, height: 16, color: TXT.lavender, position: 'relative', zIndex: 1 }} />
                        </div>
                        <div>
                            <p style={{ fontSize: 12.5, color: '#4338CA', fontStyle: 'italic', lineHeight: 1.7, fontWeight: 500 }}>{quote.text}</p>
                            <p style={{ fontSize: 10, color: TXT.lavender, fontWeight: 700, marginTop: 6 }}>— {quote.src}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Emotion aura */}
                <AnimatePresence>
                    {activeColors.length > 0 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 72 }} exit={{ opacity: 0, height: 0 }}
                            className="flex items-center justify-center overflow-hidden mb-2">
                            <div className="relative w-24 h-14 flex items-center justify-center">
                                {activeColors.slice(0, 4).map((color, i) => (
                                    <motion.div key={`${color}-${i}`} className="absolute rounded-full"
                                        style={{ width: 40, height: 40, background: color, opacity: 0.16, filter: 'blur(14px)',
                                            transform: `translate(${(i % 2 === 0 ? 1 : -1) * i * 10}px, ${i > 1 ? 8 : -8}px)` }}
                                        animate={{ scale: [1, 1.25, 1] }}
                                        transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }} />
                                ))}
                                <motion.span animate={{ scale: [1, 1.12, 1] }}
                                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                                    style={{ fontSize: 24, position: 'relative', zIndex: 1 }}>💙</motion.span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <p style={{ fontSize: 10, color: TXT.muted, fontWeight: 800, marginBottom: 12, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    ما يشغل بالك الآن؟ اختر كل ما ينطبق
                </p>

                {/* Emotion chips */}
                <div className="flex flex-wrap gap-2 mb-5">
                    {EMOTIONAL_CONTEXTS.map((ctx, i) => {
                        const isSel = selected.includes(ctx.id);
                        const isNone = ctx.id === 'none';
                        const accent = EMOTION_COLORS[ctx.id] ?? TXT.lavender;
                        return (
                            <motion.button key={ctx.id}
                                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 + i * 0.025, type: 'spring', stiffness: 380, damping: 26 }}
                                whileTap={{ scale: 0.91 }}
                                onClick={() => { haptic.selection(); onToggle(ctx.id); }}
                                className="flex items-center gap-1.5 rounded-full relative overflow-hidden"
                                style={{
                                    height: 40, paddingLeft: 14, paddingRight: 14,
                                    background: isSel ? `linear-gradient(145deg, rgba(255,255,255,0.88) 0%, ${accent}14 100%)` : GL.base,
                                    border: `1.5px solid ${isSel ? 'rgba(255,255,255,0.92)' : GL.border}`,
                                    backdropFilter: 'blur(20px)', transition: 'all 200ms cubic-bezier(0.05,0.7,0.1,1)',
                                    boxShadow: isSel
                                        ? `0 4px 16px ${accent}18, inset 0 1.5px 0 rgba(255,255,255,0.95)`
                                        : 'inset 0 1.5px 0 rgba(255,255,255,0.85), 0 2px 8px rgba(0,0,0,0.04)',
                                }}>
                                {isSel && <div className="absolute inset-x-0 top-0 pointer-events-none"
                                    style={{ height: '50%', background: 'linear-gradient(180deg, rgba(255,255,255,0.55) 0%, transparent 100%)', borderRadius: '99px 99px 0 0' }} />}
                                <span style={{ fontSize: 16, position: 'relative', zIndex: 1 }}>{ctx.emoji}</span>
                                <span style={{ fontSize: 12, fontWeight: 700, position: 'relative', zIndex: 1,
                                    color: isSel ? (isNone ? '#059669' : accent) : TXT.secondary }}>{ctx.label}</span>
                            </motion.button>
                        );
                    })}
                </div>

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
            <BottomCTA label="تحليل حالتي الآن ✦" onPress={onSubmit} variant="gradient" sublabel="يشمل الأبعاد الجسدية والعاطفية معاً" />
        </div>
    );
}
