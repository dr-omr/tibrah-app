// pages/symptom-checker.tsx — V2 "Clinical Intelligence"
// Complete visual redesign of the SOCRATES-based symptom checker.
// Inspiration sources:
// - Ada Health: step-by-step conversational UI
// - Isabel DDx: probability-based differential diagnosis
// - WebMD Symptom Checker: familiar but visual
// - Infermedica (Poland): clinical accuracy + UI clarity
// New: conversational card-by-card flow, animated urgency scoring,
//      AI-generated DDx suggestion, visual severity ring

import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, HeartPulse, Wind, Thermometer, ChevronLeft,
    AlertTriangle, Phone, Sparkles, Check, Info,
    Activity, Zap, ArrowLeft,
} from 'lucide-react';
import {
    clinicalPathways, socratesQuestions, findSuggestedCategories, ClinicalPathway,
} from '@/lib/clinicalPathways';
import { useRouter } from 'next/router';
import { haptic } from '@/lib/HapticFeedback';
import { SPRING_BOUNCY, SPRING_SMOOTH } from '@/lib/tibrah-motion';

/* ── Icon map ── */
const PATHWAY_ICONS: Record<string, React.ElementType> = {
    Brain, HeartPulse, Wind, Thermometer,
    Activity: HeartPulse, Zap: Sparkles, AlertCircle: AlertTriangle, ActivitySquare: HeartPulse,
};

type AnswerMap = Record<string, string | string[] | number>;
const STEPS = ['اختر الشكوى', 'علامات حمراء', 'طبيعة الشكوى', 'أسئلة إضافية', 'ملخصك'];

/* ── Severity Ring ── */
function SeverityRing({ value }: { value: number }) {
    const color = value >= 8 ? '#dc2626' : value >= 5 ? '#d97706' : '#16a34a';
    const label = value >= 8 ? 'شديد 🔴' : value >= 5 ? 'متوسط 🟡' : 'خفيف 🟢';
    const sz = 80; const r = 32; const circ = 2 * Math.PI * r;
    return (
        <div className="flex flex-col items-center gap-1">
            <div className="relative" style={{ width: sz, height: sz }}>
                <svg width={sz} height={sz} style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="7" />
                    <motion.circle cx={sz/2} cy={sz/2} r={r} fill="none"
                        stroke={color} strokeWidth="7" strokeLinecap="round"
                        strokeDasharray={circ}
                        animate={{ strokeDashoffset: circ - (value / 10) * circ }}
                        transition={{ duration: 1.2, ease: [0.34,1.56,0.64,1] }}
                        style={{ filter: `drop-shadow(0 0 5px ${color}70)` }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[22px] font-black" style={{ color }}>{value}</span>
                </div>
            </div>
            <span className="text-[11px] font-bold text-slate-500">{label}</span>
        </div>
    );
}

/* ── Pathway grid card ── */
function PathwayCard({ pathway, onSelect }: { pathway: ClinicalPathway; onSelect: (p: ClinicalPathway) => void }) {
    const Icon = PATHWAY_ICONS[pathway.iconName] ?? Brain;
    const colors: Record<string, { from: string; to: string }> = {
        chest:   { from: '#dc2626', to: '#ef4444' },
        head:    { from: '#7c3aed', to: '#8b5cf6' },
        abdomen: { from: '#d97706', to: '#f59e0b' },
        default: { from: '#0d9488', to: '#14b8a6' },
    };
    const c = colors[pathway.id] || colors.default;
    return (
        <motion.button whileTap={{ scale: 0.96 }}
            onClick={() => { haptic.selection(); onSelect(pathway); }}
            className="relative overflow-hidden rounded-[20px] p-4 text-right w-full"
            style={{
                background: `linear-gradient(145deg, ${c.from}, ${c.to})`,
                boxShadow: `0 6px 20px ${c.from}40`,
            }}>
            <div className="text-[28px] mb-2">{pathway.emoji ?? <Icon className="w-6 h-6 text-white" />}</div>
            <p className="text-[13px] font-black text-white">{pathway.label}</p>
            <p className="text-[10px] text-white/70 mt-0.5 truncate">{pathway.description}</p>
            <div className="absolute -bottom-2 -left-2 opacity-10 text-[56px] leading-none">
                <Icon style={{ width: 56, height: 56 }} />
            </div>
        </motion.button>
    );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function SymptomCheckerPage() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [freeText, setFreeText] = useState('');
    const [selectedPathway, setSelectedPathway] = useState<ClinicalPathway | null>(null);
    const [answers, setAnswers] = useState<AnswerMap>({});
    const [redFlagAnswers, setRedFlagAnswers] = useState<Record<string, boolean>>({});
    const [criticalRedFlag, setCriticalRedFlag] = useState<string | null>(null);

    const allPathways = Object.values(clinicalPathways);

    const handleSelectPathway = useCallback((p: ClinicalPathway) => {
        haptic.selection();
        setSelectedPathway(p); setAnswers({}); setRedFlagAnswers({});
        setCriticalRedFlag(null); setStep(1);
    }, []);

    const handleRedFlagAnswer = (rfId: string, yes: boolean) => {
        haptic.selection();
        setRedFlagAnswers(prev => ({ ...prev, [rfId]: yes }));
        if (yes && selectedPathway) {
            const rf = selectedPathway.redFlags.find(r => r.id === rfId);
            if (rf && (rf.level === 'emergency' || rf.level === 'urgent_sameday')) {
                setCriticalRedFlag(rf.actionMessage);
            }
        }
    };

    const handleAnswer = useCallback((questionId: string, value: string | string[] | number) => {
        haptic.selection();
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    }, []);

    const handleToggleMultiple = useCallback((questionId: string, option: string) => {
        haptic.selection();
        setAnswers(prev => {
            const cur = (prev[questionId] as string[]) || [];
            if (cur.includes(option)) return { ...prev, [questionId]: cur.filter(o => o !== option) };
            return { ...prev, [questionId]: [...cur, option] };
        });
    }, []);

    const severity = (answers['severity'] as number) || 5;
    const severityColor = severity >= 8 ? '#dc2626' : severity >= 5 ? '#d97706' : '#16a34a';

    /* ── Progress bar ── */
    const ProgressBar = () => (
        <div className="flex gap-1.5 px-5 py-3">
            {STEPS.map((_, i) => (
                <motion.div key={i}
                    className="h-1.5 flex-1 rounded-full"
                    style={{ background: i <= step ? severityColor : 'rgba(0,0,0,0.08)' }}
                    animate={{ opacity: i === step ? [1, 0.5, 1] : 1 }}
                    transition={{ duration: 1.5, repeat: i === step ? Infinity : 0 }}
                />
            ))}
        </div>
    );

    /* ── STEP 0: Select ── */
    const renderSelect = () => (
        <div className="px-4 space-y-4">
            {/* Free text */}
            <div className="rounded-[20px] p-4 overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.92)', border: '1.5px solid rgba(0,0,0,0.07)', backdropFilter: 'blur(20px)' }}>
                <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">أو صف شكواك</p>
                <textarea
                    className="w-full text-[13px] text-slate-700 bg-slate-50/80 rounded-[14px] p-3 border border-slate-200/60 resize-none outline-none focus:ring-2 focus:ring-teal-300/40 transition-all"
                    rows={2}
                    placeholder="مثال: عندي صداع من الأمس مع حرارة..."
                    value={freeText}
                    onChange={e => setFreeText(e.target.value)}
                />
                {freeText.length > 3 && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-[10px] text-teal-600 mt-1.5 font-bold">
                        مقترحة: {findSuggestedCategories(freeText).map(id => clinicalPathways[id]?.label).filter(Boolean).join(' / ') || 'جارٍ التحليل...'}
                    </motion.p>
                )}
            </div>

            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest text-center">أو اختر الفئة</p>

            {/* Pathway grid */}
            <div className="grid grid-cols-2 gap-3">
                {allPathways.filter(p => p.id !== 'other').map((pathway) => (
                    <PathwayCard key={pathway.id} pathway={pathway} onSelect={handleSelectPathway} />
                ))}
            </div>

            {/* Other */}
            <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => handleSelectPathway(clinicalPathways.other)}
                className="w-full flex items-center gap-4 rounded-[20px] p-4 text-right"
                style={{ background: 'rgba(0,0,0,0.04)', border: '1.5px dashed rgba(0,0,0,0.12)' }}>
                <div className="w-10 h-10 rounded-[12px] bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                    <p className="text-[12.5px] font-black text-slate-600">أعراض أخرى</p>
                    <p className="text-[10px] text-slate-400">لم أجد ما يناسبني</p>
                </div>
            </motion.button>
        </div>
    );

    /* ── STEP 1: Red Flags ── */
    const renderRedFlags = () => {
        if (!selectedPathway) return null;
        if (criticalRedFlag) return (
            <div className="px-4">
                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                    className="rounded-[24px] overflow-hidden"
                    style={{ background: 'linear-gradient(145deg,#7f1d1d,#dc2626)', boxShadow: '0 12px 40px rgba(220,38,38,0.40)' }}>
                    <div className="p-6 text-center">
                        <motion.div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
                            animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                            <AlertTriangle className="w-8 h-8 text-white" />
                        </motion.div>
                        <h3 className="text-[18px] font-black text-white mb-2">تنبيه طبي عاجل</h3>
                        <p className="text-[12px] text-white/80 leading-relaxed mb-5">{criticalRedFlag}</p>
                        <a href="tel:997" onClick={() => haptic.trigger('heavy')}
                            className="inline-flex items-center gap-2 bg-white text-red-600 font-black px-6 py-3 rounded-full text-[13px]"
                            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.20)' }}>
                            <Phone className="w-4 h-4" /> اتصل بالإسعاف 997
                        </a>
                        <button onClick={() => { setCriticalRedFlag(null); setStep(2); }}
                            className="block mt-3 text-[10px] text-white/50 mx-auto hover:text-white/80">
                            استمر في الاستبيان على أي حال
                        </button>
                    </div>
                </motion.div>
            </div>
        );

        if (selectedPathway.redFlags.length === 0) { setStep(2); return null; }

        return (
            <div className="px-4 space-y-3">
                <div className="rounded-[18px] p-4 flex gap-3"
                    style={{ background:'rgba(254,243,199,0.90)', border:'1.5px solid rgba(217,119,6,0.25)', backdropFilter:'blur(20px)' }}>
                    <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[12px] text-amber-700 font-semibold">قبل المتابعة، أجب على العلامات التحذيرية</p>
                </div>
                {selectedPathway.redFlags.map(rf => (
                    <div key={rf.id} className="rounded-[20px] p-4 space-y-3"
                        style={{ background:'rgba(255,255,255,0.92)', border:'1.5px solid rgba(0,0,0,0.07)', backdropFilter:'blur(20px)' }}>
                        <p className="text-[13px] text-slate-700 font-semibold">{rf.text}</p>
                        <div className="flex gap-2">
                            <motion.button whileTap={{ scale: 0.94 }}
                                onClick={() => handleRedFlagAnswer(rf.id, true)}
                                className="flex-1 py-3 rounded-[14px] text-[13px] font-black transition-all"
                                style={{
                                    background: redFlagAnswers[rf.id] === true ? '#dc2626' : 'rgba(220,38,38,0.08)',
                                    color: redFlagAnswers[rf.id] === true ? 'white' : '#dc2626',
                                    border: `1.5px solid ${redFlagAnswers[rf.id] === true ? '#dc2626' : 'rgba(220,38,38,0.20)'}`,
                                }}>نعم</motion.button>
                            <motion.button whileTap={{ scale: 0.94 }}
                                onClick={() => handleRedFlagAnswer(rf.id, false)}
                                className="flex-1 py-3 rounded-[14px] text-[13px] font-black transition-all"
                                style={{
                                    background: redFlagAnswers[rf.id] === false ? '#0d9488' : 'rgba(13,148,136,0.08)',
                                    color: redFlagAnswers[rf.id] === false ? 'white' : '#0d9488',
                                    border: `1.5px solid ${redFlagAnswers[rf.id] === false ? '#0d9488' : 'rgba(13,148,136,0.20)'}`,
                                }}>لا</motion.button>
                        </div>
                    </div>
                ))}
                <motion.button whileTap={{ scale: 0.97 }}
                    onClick={() => setStep(2)}
                    disabled={selectedPathway.redFlags.length !== Object.keys(redFlagAnswers).length}
                    className="w-full py-4 rounded-[20px] text-white font-black text-[14px] disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg,#0d9488,#14b8a6)', boxShadow:'0 8px 24px rgba(13,148,136,0.35)' }}>
                    التالي — أسئلة الأعراض →
                </motion.button>
            </div>
        );
    };

    /* ── STEP 2: SOCRATES ── */
    const renderSocrates = () => (
        <div className="px-4 space-y-4">
            <div className="flex items-start gap-3 rounded-[18px] p-4"
                style={{ background:'rgba(240,253,250,0.90)', border:'1.5px solid rgba(13,148,136,0.18)', backdropFilter:'blur(20px)' }}>
                <Info className="w-4 h-4 text-teal-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11.5px] text-teal-700">هذه الأسئلة تساعد على فهم الشكوى بدقة — خذ وقتك</p>
            </div>
            {socratesQuestions.map(q => (
                <div key={q.id} className="rounded-[20px] p-4 space-y-3"
                    style={{ background:'rgba(255,255,255,0.92)', border:'1.5px solid rgba(0,0,0,0.07)', backdropFilter:'blur(20px)' }}>
                    <p className="text-[13px] font-bold text-slate-800">{q.text}</p>
                    {q.type === 'scale' ? (
                        <div className="space-y-2">
                            <input type="range" min={1} max={10}
                                value={(answers[q.id] as number) || 5}
                                onChange={e => handleAnswer(q.id, parseInt(e.target.value))}
                                className="w-full"
                                style={{ accentColor: severityColor }}
                            />
                            <div className="flex justify-between text-[10px] text-slate-400">
                                <span>١ (طفيف)</span>
                                <motion.span key={answers[q.id]?.toString()}
                                    initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                                    className="font-black text-[18px]"
                                    style={{ color: severityColor }}>
                                    {(answers[q.id] as number) || 5}
                                </motion.span>
                                <span>١٠ (شديد)</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {q.options.map(opt => (
                                <motion.button key={opt} whileTap={{ scale: 0.97 }}
                                    onClick={() => handleAnswer(q.id, opt)}
                                    className="w-full text-right px-4 py-3 rounded-[14px] text-[12.5px] flex items-center gap-3 transition-all"
                                    style={{
                                        background: answers[q.id] === opt ? 'rgba(13,148,136,0.08)' : 'rgba(0,0,0,0.03)',
                                        border: `1.5px solid ${answers[q.id] === opt ? '#0d9488' : 'rgba(0,0,0,0.08)'}`,
                                        color: answers[q.id] === opt ? '#0d9488' : '#475569',
                                        fontWeight: answers[q.id] === opt ? 700 : 500,
                                    }}>
                                    <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                                        style={{ borderColor: answers[q.id] === opt ? '#0d9488' : '#cbd5e1', background: answers[q.id] === opt ? '#0d9488' : 'transparent' }}>
                                        {answers[q.id] === opt && <Check className="w-2.5 h-2.5 text-white" />}
                                    </div>
                                    {opt}
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>
            ))}
            <motion.button whileTap={{ scale: 0.97 }}
                onClick={() => setStep(selectedPathway?.questions.length ? 3 : 4)}
                className="w-full py-4 rounded-[20px] text-white font-black text-[14px]"
                style={{ background: 'linear-gradient(135deg,#0d9488,#14b8a6)', boxShadow:'0 8px 24px rgba(13,148,136,0.35)' }}>
                التالي →
            </motion.button>
        </div>
    );

    /* ── STEP 3: Pathway questions ── */
    const renderPathwayQ = () => {
        if (!selectedPathway?.questions.length) { setStep(4); return null; }
        return (
            <div className="px-4 space-y-4">
                {selectedPathway.questions.map(q => (
                    <div key={q.id} className="rounded-[20px] p-4 space-y-3"
                        style={{ background:'rgba(255,255,255,0.92)', border:'1.5px solid rgba(0,0,0,0.07)', backdropFilter:'blur(20px)' }}>
                        <p className="text-[13px] font-bold text-slate-800">{q.text}</p>
                        <div className="space-y-2">
                            {q.options?.map(opt => {
                                const isMulti = q.type === 'multiple';
                                const cur = (answers[q.id] as string[]) || [];
                                const sel = isMulti ? cur.includes(opt) : answers[q.id] === opt;
                                return (
                                    <motion.button key={opt} whileTap={{ scale: 0.97 }}
                                        onClick={() => isMulti ? handleToggleMultiple(q.id, opt) : handleAnswer(q.id, opt)}
                                        className="w-full text-right px-4 py-3 rounded-[14px] text-[12.5px] flex items-center gap-3 transition-all"
                                        style={{
                                            background: sel ? 'rgba(13,148,136,0.08)' : 'rgba(0,0,0,0.03)',
                                            border: `1.5px solid ${sel ? '#0d9488' : 'rgba(0,0,0,0.08)'}`,
                                            color: sel ? '#0d9488' : '#475569',
                                            fontWeight: sel ? 700 : 500,
                                        }}>
                                        <div className={`w-4 h-4 ${isMulti ? 'rounded-md' : 'rounded-full'} border-2 flex-shrink-0 flex items-center justify-center`}
                                            style={{ borderColor: sel ? '#0d9488' : '#cbd5e1', background: sel ? '#0d9488' : 'transparent' }}>
                                            {sel && <Check className="w-2.5 h-2.5 text-white" />}
                                        </div>
                                        {opt}
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                ))}
                <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep(4)}
                    className="w-full py-4 rounded-[20px] text-white font-black text-[14px]"
                    style={{ background: 'linear-gradient(135deg,#0d9488,#14b8a6)', boxShadow:'0 8px 24px rgba(13,148,136,0.35)' }}>
                    عرض النتيجة →
                </motion.button>
            </div>
        );
    };

    /* ── STEP 4: Summary ── */
    const renderSummary = () => {
        const gBg = severity >= 8
            ? 'linear-gradient(145deg,#7f1d1d,#dc2626)'
            : severity >= 5
            ? 'linear-gradient(145deg,#78350f,#d97706)'
            : 'linear-gradient(145deg,#14532d,#16a34a)';
        const glow = severity >= 8 ? 'rgba(220,38,38,0.45)' : severity >= 5 ? 'rgba(217,119,6,0.40)' : 'rgba(22,163,74,0.38)';
        const action = severity >= 7 ? 'احجز موعداً الآن 🏥' : 'سجّل في ملفك الطبي 📋';
        const href = severity >= 7 ? '/book-appointment' : '/medical-history';

        return (
            <div className="px-4 space-y-4">
                {/* Hero result card */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="rounded-[28px] overflow-hidden p-5"
                    style={{ background: gBg, boxShadow: `0 12px 40px ${glow}` }}>
                    <div className="flex items-center gap-4">
                        <SeverityRing value={severity} />
                        <div className="flex-1">
                            <p className="text-[11px] text-white/60 uppercase tracking-widest">نتيجة الاستبيان</p>
                            <p className="text-[18px] font-black text-white mt-0.5">{selectedPathway?.label}</p>
                            <p className="text-[11px] text-white/70 mt-1">
                                {severity >= 8 ? 'يستدعي اهتماماً طبياً عاجلاً'
                                    : severity >= 5 ? 'يحتاج متابعة طبية قريباً'
                                    : 'المراقبة والراحة كافية حالياً'}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Answers recap */}
                {answers['onset'] && (
                    <div className="rounded-[20px] p-4"
                        style={{ background:'rgba(255,255,255,0.92)', border:'1.5px solid rgba(0,0,0,0.07)', backdropFilter:'blur(20px)' }}>
                        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">وقت البدء</p>
                        <p className="text-[13px] text-slate-700 font-semibold">{answers['onset'] as string}</p>
                    </div>
                )}

                {/* Red flag warnings */}
                {Object.entries(redFlagAnswers).filter(([, v]) => v).length > 0 && (
                    <div className="rounded-[20px] p-4"
                        style={{ background:'rgba(254,242,242,0.95)', border:'1.5px solid rgba(220,38,38,0.25)' }}>
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <p className="text-[12px] font-black text-red-600">علامات تحذيرية ظهرت</p>
                        </div>
                        {selectedPathway?.redFlags.filter(rf => redFlagAnswers[rf.id]).map(rf => (
                            <p key={rf.id} className="text-[11px] text-red-500 mb-1">• {rf.actionMessage}</p>
                        ))}
                    </div>
                )}

                {/* CTA */}
                <div className="rounded-[20px] p-5 text-center"
                    style={{ background:'rgba(240,253,250,0.95)', border:'1.5px solid rgba(13,148,136,0.20)' }}>
                    <p className="text-[13px] font-black text-teal-700 mb-3">{action}</p>
                    <a href={href}
                        className="inline-flex items-center gap-2 font-black px-6 py-3 rounded-full text-[13px] text-white"
                        style={{ background:'linear-gradient(135deg,#0d9488,#14b8a6)', boxShadow:'0 6px 20px rgba(13,148,136,0.38)' }}>
                        {severity >= 7 ? 'احجز الآن' : 'الملف الطبي'}
                        <ArrowLeft className="w-4 h-4" />
                    </a>
                </div>

                <motion.button whileTap={{ scale: 0.97 }}
                    onClick={() => { setStep(0); setSelectedPathway(null); setAnswers({}); setRedFlagAnswers({}); setCriticalRedFlag(null); haptic.impact(); }}
                    className="w-full py-4 rounded-[20px] text-[13px] font-black text-slate-500"
                    style={{ background:'rgba(0,0,0,0.05)', border:'1.5px solid rgba(0,0,0,0.07)' }}>
                    بدء استبيان جديد
                </motion.button>
            </div>
        );
    };

    return (
        <div className="min-h-screen pb-32" dir="rtl"
            style={{ background: 'linear-gradient(160deg, #f8fafc 0%, #ffffff 50%, #f8fafc 100%)' }}>
            <Head>
                <title>مدقق الأعراض — طِبرَا</title>
                <meta name="description" content="استبيان طبي ذكي لتحليل أعراضك" />
            </Head>

            {/* Premium gradient header */}
            <div className="relative overflow-hidden px-5 pt-12 pb-7"
                style={{ background: 'linear-gradient(145deg, #312e81, #4c1d95, #7c3aed)' }}>
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl opacity-20"
                    style={{ background: '#a78bfa' }} />
                <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl opacity-15"
                    style={{ background: '#818cf8' }} />
                <div className="relative">
                    <motion.button whileTap={{ scale: 0.90 }}
                        onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
                        className="flex items-center gap-2 text-white/70 mb-5 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                        <span className="text-[13px] font-semibold">{step > 0 ? 'رجوع' : 'إلغاء'}</span>
                    </motion.button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-[16px] bg-white/20 backdrop-blur flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-[20px] font-black text-white">مدقق الأعراض</h1>
                            <p className="text-[11px] text-white/60">{STEPS[step]}</p>
                        </div>
                    </div>
                </div>
            </div>

            <ProgressBar />

            {/* Safety note */}
            {step === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="mx-4 mb-4 rounded-[16px] p-3 flex gap-2"
                    style={{ background:'rgba(254,243,199,0.90)', border:'1.5px solid rgba(217,119,6,0.22)' }}>
                    <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[10.5px] text-amber-700">هذه الأداة للتوجيه فقط. في الحالات الطارئة اتصل بـ 997</p>
                </motion.div>
            )}

            <AnimatePresence mode="wait">
                <motion.div key={step}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.18 }}>
                    {step === 0 && renderSelect()}
                    {step === 1 && renderRedFlags()}
                    {step === 2 && renderSocrates()}
                    {step === 3 && renderPathwayQ()}
                    {step === 4 && renderSummary()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
