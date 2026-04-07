// pages/quick-check-in.tsx
// Daily Health Check-in — Premium World-Class Design
// Smart vitals logging with emotional context + AI insight

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Battery, Moon, Brain, ArrowLeft, ArrowRight,
    Activity, HeartPulse, Sparkles, CheckCircle2,
    Loader2, Flame, Droplets, Zap, Heart,
    MessageCircle, TrendingUp, Shield, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { createPageUrl } from '@/utils';
import SEO from '@/components/common/SEO';
import Link from 'next/link';

/* ═══════════════════════════════
   TYPES
   ═══════════════════════════════ */
interface CheckInData {
    energy: number;
    sleep: number;
    stress: number;
    mood: number;
    waterGlasses: number;
    physicalSymptoms: string;
    emotionalContext: string;
}

type StepId = 'vitals' | 'symptoms' | 'emotional' | 'analyzing' | 'result';

/* ═══════════════════════════════
   EMOJI SCALE SELECTOR
   ═══════════════════════════════ */
const SCALES: Record<string, { emoji: string; label: string; color: string }[]> = {
    energy:  [
        { emoji: '🪫', label: 'منهك',      color: '#ef4444' },
        { emoji: '😔', label: 'ضعيف',      color: '#f97316' },
        { emoji: '🙂', label: 'مقبول',     color: '#eab308' },
        { emoji: '💪', label: 'جيد',       color: '#22c55e' },
        { emoji: '🚀', label: 'ممتاز',     color: '#10b981' },
    ],
    sleep: [
        { emoji: '😵', label: 'سيئ جداً',  color: '#ef4444' },
        { emoji: '🥱', label: 'سيئ',       color: '#f97316' },
        { emoji: '😴', label: 'مقبول',     color: '#eab308' },
        { emoji: '😌', label: 'جيد',       color: '#22c55e' },
        { emoji: '🌟', label: 'ممتاز',     color: '#10b981' },
    ],
    stress: [
        { emoji: '🧘', label: 'هادئ',      color: '#10b981' },
        { emoji: '😐', label: 'طبيعي',     color: '#22c55e' },
        { emoji: '😟', label: 'قليل',      color: '#eab308' },
        { emoji: '😰', label: 'مرتفع',     color: '#f97316' },
        { emoji: '🤯', label: 'شديد',      color: '#ef4444' },
    ],
    mood: [
        { emoji: '😢', label: 'حزين',      color: '#ef4444' },
        { emoji: '😞', label: 'متعكر',     color: '#f97316' },
        { emoji: '😐', label: 'عادي',      color: '#eab308' },
        { emoji: '😊', label: 'بخير',      color: '#22c55e' },
        { emoji: '😄', label: 'بشوش',      color: '#10b981' },
    ],
};

function EmojiScale({
    field, value, label, icon: Icon, color,
    onChange,
}: {
    field: keyof typeof SCALES; value: number; label: string;
    icon: React.FC<{ className?: string }>; color: string;
    onChange: (v: number) => void;
}) {
    const scale = SCALES[field];
    const selected = scale[value - 1];

    return (
        <div className="bg-white dark:bg-slate-800/60 rounded-[22px] p-4 border border-slate-100 dark:border-slate-700/60 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                        <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{label}</span>
                </div>
                {selected && (
                    <motion.span key={value} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${selected.color}18`, color: selected.color }}>
                        {selected.label}
                    </motion.span>
                )}
            </div>
            <div className="flex gap-1.5">
                {scale.map((item, i) => {
                    const v = i + 1;
                    const isSelected = value === v;
                    return (
                        <motion.button
                            key={v}
                            whileTap={{ scale: 0.85 }}
                            onClick={() => { haptic.selection(); uiSounds.select(); onChange(v); }}
                            className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all"
                            style={isSelected
                                ? { borderColor: item.color, backgroundColor: `${item.color}12` }
                                : { borderColor: 'transparent', backgroundColor: '#f8fafc' }}
                        >
                            <span className="text-[22px] leading-none">{item.emoji}</span>
                            <span className="text-[8.5px] font-bold" style={{ color: isSelected ? item.color : '#94a3b8' }}>{v}</span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

/* ═══════════════════════════════
   WATER TRACKER
   ═══════════════════════════════ */
function WaterTracker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    return (
        <div className="bg-white dark:bg-slate-800/60 rounded-[22px] p-4 border border-slate-100 dark:border-slate-700/60 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(59,130,246,0.12)' }}>
                        <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                    <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">شرب الماء اليوم</span>
                </div>
                <span className="text-[13px] font-black text-blue-600">{value} كأس</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
                {Array.from({ length: 8 }, (_, i) => i + 1).map(cup => (
                    <motion.button
                        key={cup}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => { haptic.selection(); onChange(cup === value ? 0 : cup); }}
                        className="w-[calc(12.5%-4px)] aspect-square rounded-lg flex items-center justify-center transition-all"
                        style={cup <= value
                            ? { backgroundColor: 'rgba(59,130,246,0.15)', border: '1.5px solid rgba(59,130,246,0.3)' }
                            : { backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0' }}
                    >
                        <span className="text-[16px]">{cup <= value ? '💧' : '🔘'}</span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

/* ═══════════════════════════════
   ANALYZING SCREEN
   ═══════════════════════════════ */
function AnalyzingScreen() {
    const messages = [
        'تحليل مؤشراتك الحيوية...',
        'مقارنة بسجلاتك السابقة...',
        'استخراج الأنماط الصحية...',
        'توليد رؤية مخصصة...',
    ];
    const [msgIdx, setMsgIdx] = useState(0);

    useEffect(() => {
        const t = setInterval(() => setMsgIdx(i => (i + 1) % messages.length), 700);
        return () => clearInterval(t);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="relative mb-8">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-[-8px] rounded-full border-2 border-dashed border-teal-200 dark:border-teal-800" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-2 border-transparent border-t-teal-500 border-l-indigo-500" />
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(13,148,136,0.15), rgba(99,102,241,0.15))' }}>
                    <Heart className="w-9 h-9 text-teal-600" />
                </div>
            </div>
            <AnimatePresence mode="wait">
                <motion.p key={msgIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="text-[15px] font-bold text-slate-600 dark:text-slate-300 mb-2">{messages[msgIdx]}</motion.p>
            </AnimatePresence>
            <p className="text-[12px] text-slate-400 font-medium">ذكاء طِبرَا يعمل على تحليلك</p>
        </div>
    );
}

/* ═══════════════════════════════
   RESULT SCREEN
   ═══════════════════════════════ */
function ResultScreen({ data }: { data: CheckInData }) {
    // Simple analysis
    const totalVitals = data.energy + data.sleep + (6 - data.stress) + data.mood;
    const avgScore = Math.round((totalVitals / 16) * 100);

    const getOverallStatus = () => {
        if (avgScore >= 75) return { label: 'ممتاز', color: '#10b981', emoji: '🌟', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' };
        if (avgScore >= 55) return { label: 'جيد', color: '#22c55e', emoji: '✅', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' };
        if (avgScore >= 35) return { label: 'يحتاج انتباه', color: '#f59e0b', emoji: '⚠️', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' };
        return { label: 'يحتاج رعاية', color: '#ef4444', emoji: '❤️‍🩹', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' };
    };

    const status = getOverallStatus();

    const insights = [
        data.sleep <= 2 && { icon: '😴', text: 'نومك يحتاج تحسيناً — جرّب تقنية التنفس قبل النوم' },
        data.stress >= 4 && { icon: '🧠', text: 'مستوى توترك مرتفع — خصّص ١٠ دقائق للتأمل اليوم' },
        data.energy <= 2 && { icon: '⚡', text: 'طاقتك منخفضة — تأكد من وجبة متوازنة وشرب الماء' },
        data.waterGlasses < 4 && { icon: '💧', text: 'شرب الماء أقل من الموصى به (٨ أكواس يومياً)' },
    ].filter(Boolean) as Array<{ icon: string; text: string }>;

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="space-y-4">
            {/* Main result */}
            <div className="rounded-[24px] overflow-hidden" style={{ backgroundColor: status.bg, border: `1.5px solid ${status.border}` }}>
                <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">تقييم اليوم</p>
                            <h2 className="text-[20px] font-black text-slate-800 dark:text-white">{status.emoji} {status.label}</h2>
                        </div>
                        <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center"
                            style={{ background: `${status.color}20`, border: `2px solid ${status.color}30` }}>
                            <span className="text-[20px] font-black" style={{ color: status.color }}>{avgScore}</span>
                            <span className="text-[9px] font-bold text-slate-400">من ١٠٠</span>
                        </div>
                    </div>

                    {/* Mini bars */}
                    {[
                        { l: 'الطاقة', v: data.energy, max: 5, color: '#f59e0b' },
                        { l: 'النوم', v: data.sleep, max: 5, color: '#6366f1' },
                        { l: 'التوتر', v: 6 - data.stress, max: 5, color: '#ef4444' },
                        { l: 'المزاج', v: data.mood, max: 5, color: '#10b981' },
                    ].map(bar => (
                        <div key={bar.l} className="flex items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-bold text-slate-400 w-10">{bar.l}</span>
                            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${(bar.v / bar.max) * 100}%` }}
                                    transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                                    className="h-full rounded-full" style={{ backgroundColor: bar.color }} />
                            </div>
                            <span className="text-[10px] font-black w-4" style={{ color: bar.color }}>{bar.v}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Insights */}
            {insights.length > 0 && (
                <div className="bg-white dark:bg-slate-800/60 rounded-[22px] p-4 border border-slate-100 dark:border-slate-700/60 shadow-sm">
                    <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" /> رؤى ذكاء طِبرَا
                    </p>
                    <div className="space-y-2.5">
                        {insights.map((ins, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}
                                className="flex items-start gap-2.5">
                                <span className="text-[18px] flex-shrink-0">{ins.icon}</span>
                                <p className="text-[12px] font-medium text-slate-600 dark:text-slate-300 leading-relaxed">{ins.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="space-y-2.5">
                <Link href={createPageUrl('MyCare')}>
                    <motion.div whileTap={{ scale: 0.97 }}
                        className="w-full h-[50px] rounded-2xl flex items-center justify-between px-5 cursor-pointer"
                        style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', boxShadow: '0 6px 20px rgba(13,148,136,0.25)' }}>
                        <div className="flex items-center gap-2">
                            <HeartPulse className="w-4.5 h-4.5 text-white" />
                            <span className="text-[13.5px] font-black text-white">لوحة رعايتي</span>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-white/80" />
                    </motion.div>
                </Link>

                <div className="grid grid-cols-2 gap-2">
                    <Link href={createPageUrl('DailyLog')}>
                        <div className="h-[42px] rounded-xl border border-slate-100 dark:border-slate-700/60 flex items-center justify-center gap-1.5 text-[11.5px] font-bold text-slate-500 dark:text-slate-400 cursor-pointer">
                            <Activity className="w-3.5 h-3.5" />
                            سجلاتي اليومية
                        </div>
                    </Link>
                    <Link href={createPageUrl('BookAppointment')}>
                        <div className="h-[42px] rounded-xl border border-teal-100 dark:border-teal-800/30 bg-teal-50/50 dark:bg-teal-900/10 flex items-center justify-center gap-1.5 text-[11.5px] font-bold text-teal-600 dark:text-teal-400 cursor-pointer">
                            <MessageCircle className="w-3.5 h-3.5" />
                            تحدث مع الطبيب
                        </div>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════
   STEP INDICATOR
   ═══════════════════════════════ */
function StepBar({ step }: { step: StepId }) {
    const steps: StepId[] = ['vitals', 'symptoms', 'emotional'];
    const idx = steps.indexOf(step);
    if (idx === -1) return null;

    return (
        <div className="flex items-center justify-center gap-2 py-3">
            {steps.map((s, i) => (
                <motion.div key={s}
                    animate={{ width: i === idx ? 24 : 8, opacity: i <= idx ? 1 : 0.3 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="h-[5px] rounded-full bg-teal-500"
                />
            ))}
        </div>
    );
}

/* ═══════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════ */
export default function QuickCheckIn() {
    const router = useRouter();
    const { user } = useAuth();
    const [step, setStep] = useState<StepId>('vitals');
    const [saving, setSaving] = useState(false);

    const [data, setData] = useState<CheckInData>({
        energy: 3,
        sleep: 3,
        stress: 3,
        mood: 3,
        waterGlasses: 0,
        physicalSymptoms: '',
        emotionalContext: '',
    });

    const update = (field: keyof CheckInData) => (val: any) =>
        setData(d => ({ ...d, [field]: val }));

    const goTo = (s: StepId) => { haptic.selection(); setStep(s); };

    const canGoBack = step === 'symptoms' || step === 'emotional';

    const handleBack = () => {
        if (step === 'symptoms') goTo('vitals');
        else if (step === 'emotional') goTo('symptoms');
    };

    const handleAnalyze = async () => {
        goTo('analyzing');
        setSaving(true);
        try {
            if (user?.id) {
                await db.entities.DailyLog.createForUser(user.id, {
                    date: new Date().toISOString(),
                    energy_level: data.energy,
                    sleep_quality: data.sleep,
                    stress_level: data.stress,
                    notes: data.physicalSymptoms,
                    emotional_diagnostic: {
                        body_region: 'غير محدد',
                        physical_complaint: data.physicalSymptoms,
                        emotional_diagnostic_pattern: 'قيد التحليل',
                        psychosomatic_dimension: data.emotionalContext,
                        stress_context: data.stress >= 4 ? 'عالي' : data.stress >= 3 ? 'متوسط' : 'منخفض',
                        behavioral_contributors: [],
                        repeated_pattern_flag: false,
                        clinician_summary: '',
                        patient_summary: '',
                    }
                });

                // Award points
                try {
                    await fetch('/api/rewards/award', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ userId: user.id, action: 'daily_checkin' })
                    });
                } catch { }

                toast.success('تم حفظ تقييمك اليومي ✓', { duration: 2000 });
            }
        } catch (e) {
            console.error('[CheckIn]', e);
            toast.error('حدث خطأ في الحفظ');
        } finally {
            setSaving(false);
        }

        await new Promise(r => setTimeout(r, 2800));
        goTo('result');
    };

    return (
        <div className="min-h-screen bg-[#F7FAFA] dark:bg-[#080D13] font-sans">
            <SEO title="تقييمي اليومي | طِبرَا" />

            {/* Background orbs */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-8%] left-[-5%] w-64 h-64 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)', filter: 'blur(45px)' }} />
                <div className="absolute bottom-[20%] right-[-8%] w-52 h-52 rounded-full"
                    style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)', filter: 'blur(40px)' }} />
            </div>

            {/* Header */}
            <div className="sticky top-0 z-30 px-4 pt-safe">
                <div className="flex items-center justify-between h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-b-2xl px-4 shadow-sm border-b border-slate-100 dark:border-slate-800/60">
                    {canGoBack ? (
                        <motion.button whileTap={{ scale: 0.9 }} onClick={handleBack}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                            <ArrowRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        </motion.button>
                    ) : (
                        <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()}
                            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                            <ArrowRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                        </motion.button>
                    )}

                    <div className="flex items-center gap-1.5">
                        <HeartPulse className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <span className="text-[13px] font-black text-slate-700 dark:text-slate-200">تقييمي اليومي</span>
                    </div>

                    {/* Today's date */}
                    <span className="text-[10px] font-bold text-slate-400">
                        {new Date().toLocaleDateString('ar-SA', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                </div>
                <StepBar step={step} />
            </div>

            {/* Content */}
            <div className="relative z-10 px-4 pb-28 max-w-md mx-auto">
                <AnimatePresence mode="wait">

                    {/* STEP 1: VITALS */}
                    {step === 'vitals' && (
                        <motion.div key="vitals"
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="pt-4 space-y-3">
                            <div className="mb-4">
                                <p className="text-[11.5px] font-bold text-teal-600 dark:text-teal-400 mb-0.5">الخطوة ١ من ٣</p>
                                <h1 className="text-[20px] font-black text-slate-800 dark:text-white">مؤشراتك الحيوية</h1>
                                <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">كيف تشعر اليوم؟</p>
                            </div>

                            <EmojiScale field="energy" value={data.energy} label="مستوى الطاقة" icon={Battery} color="#f59e0b" onChange={update('energy')} />
                            <EmojiScale field="sleep" value={data.sleep} label="جودة النوم الليلة الماضية" icon={Moon} color="#6366f1" onChange={update('sleep')} />
                            <EmojiScale field="stress" value={data.stress} label="مستوى التوتر" icon={Brain} color="#ef4444" onChange={update('stress')} />
                            <EmojiScale field="mood" value={data.mood} label="المزاج العام" icon={Heart} color="#10b981" onChange={update('mood')} />
                            <WaterTracker value={data.waterGlasses} onChange={update('waterGlasses')} />

                            <motion.button whileTap={{ scale: 0.97 }}
                                onClick={() => goTo('symptoms')}
                                className="w-full h-[52px] rounded-2xl text-white text-[14px] font-black flex items-center justify-between px-5 mt-2"
                                style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', boxShadow: '0 6px 20px rgba(13,148,136,0.25)' }}>
                                <span>متابعة — الأعراض</span>
                                <ArrowLeft className="w-5 h-5 text-white/80" />
                            </motion.button>
                        </motion.div>
                    )}

                    {/* STEP 2: SYMPTOMS */}
                    {step === 'symptoms' && (
                        <motion.div key="symptoms"
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="pt-4">
                            <div className="mb-5">
                                <p className="text-[11.5px] font-bold text-teal-600 dark:text-teal-400 mb-0.5">الخطوة ٢ من ٣</p>
                                <h1 className="text-[20px] font-black text-slate-800 dark:text-white">الأعراض الجسدية</h1>
                                <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">ما الذي تشعر به جسدياً اليوم؟</p>
                            </div>

                            {/* Quick symptom chips */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {['صداع', 'إرهاق', 'ألم في الظهر', 'آلام في المعدة', 'ألم في المفاصل', 'دوخة', 'لا أعراض'].map(s => {
                                    const selected = data.physicalSymptoms.includes(s);
                                    return (
                                        <motion.button key={s} whileTap={{ scale: 0.92 }}
                                            onClick={() => {
                                                haptic.selection();
                                                if (s === 'لا أعراض') {
                                                    update('physicalSymptoms')('لا أعراض اليوم');
                                                } else {
                                                    const current = data.physicalSymptoms.replace('لا أعراض اليوم', '').trim();
                                                    const arr = current ? current.split('، ').filter(Boolean) : [];
                                                    if (selected) {
                                                        update('physicalSymptoms')(arr.filter(x => x !== s).join('، '));
                                                    } else {
                                                        update('physicalSymptoms')([...arr, s].join('، '));
                                                    }
                                                }
                                            }}
                                            className="px-3 py-1.5 rounded-xl border-2 text-[11.5px] font-bold transition-all"
                                            style={selected
                                                ? { borderColor: '#0d9488', backgroundColor: 'rgba(13,148,136,0.1)', color: '#0d9488' }
                                                : { borderColor: '#e2e8f0', backgroundColor: '#f8fafc', color: '#64748b' }}>
                                            {s}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            {/* Text field */}
                            <div className="bg-white dark:bg-slate-800/60 rounded-[22px] p-4 border border-slate-100 dark:border-slate-700/60 shadow-sm mb-5">
                                <p className="text-[11.5px] font-bold text-slate-500 dark:text-slate-400 mb-2">أو اكتب بنفسك (اختياري)</p>
                                <textarea
                                    value={data.physicalSymptoms}
                                    onChange={e => update('physicalSymptoms')(e.target.value)}
                                    placeholder="صف ما تشعر به..."
                                    rows={3}
                                    className="w-full text-[13px] font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/60 resize-none focus:outline-none focus:border-teal-300 placeholder-slate-300 dark:placeholder-slate-600"
                                />
                            </div>

                            <motion.button whileTap={{ scale: 0.97 }}
                                onClick={() => goTo('emotional')}
                                className="w-full h-[52px] rounded-2xl text-white text-[14px] font-black flex items-center justify-between px-5"
                                style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', boxShadow: '0 6px 20px rgba(13,148,136,0.25)' }}>
                                <span>متابعة — الجانب العاطفي</span>
                                <ArrowLeft className="w-5 h-5 text-white/80" />
                            </motion.button>
                        </motion.div>
                    )}

                    {/* STEP 3: EMOTIONAL */}
                    {step === 'emotional' && (
                        <motion.div key="emotional"
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="pt-4">
                            <div className="mb-5">
                                <p className="text-[11.5px] font-bold text-teal-600 dark:text-teal-400 mb-0.5">الخطوة ٣ من ٣</p>
                                <h1 className="text-[20px] font-black text-slate-800 dark:text-white">البعد العاطفي</h1>
                            </div>

                            {/* Philosophy card */}
                            <div className="p-4 rounded-2xl mb-4 border border-indigo-100 dark:border-indigo-800/20"
                                style={{ backgroundColor: 'rgba(99,102,241,0.05)' }}>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <Brain className="w-4 h-4 text-indigo-500" />
                                    <p className="text-[12px] font-bold text-indigo-700 dark:text-indigo-300">الجسد يتحدث بصوت المشاعر</p>
                                </div>
                                <p className="text-[11px] text-indigo-600/80 dark:text-indigo-300/70 font-medium leading-relaxed">
                                    في طِبرَا ندرك أن كثيراً من الأعراض الجسدية ترتبط بالجانب النفسي والشعوري.
                                </p>
                            </div>

                            {/* Emotional context chips */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {['ضغط العمل', 'قلق مستمر', 'مشاكل عائلية', 'وحدة', 'إرهاق عاطفي', 'أمور مالية', 'لا شيء'].map(ctx => {
                                    const selected = data.emotionalContext.includes(ctx);
                                    return (
                                        <motion.button key={ctx} whileTap={{ scale: 0.92 }}
                                            onClick={() => {
                                                haptic.selection();
                                                if (ctx === 'لا شيء') {
                                                    update('emotionalContext')('');
                                                } else {
                                                    const arr = data.emotionalContext ? data.emotionalContext.split('، ').filter(x => x && x !== 'لا شيء') : [];
                                                    if (selected) update('emotionalContext')(arr.filter(x => x !== ctx).join('، '));
                                                    else update('emotionalContext')([...arr, ctx].join('، '));
                                                }
                                            }}
                                            className="px-3 py-1.5 rounded-xl border-2 text-[11.5px] font-bold transition-all"
                                            style={selected
                                                ? { borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', color: '#6366f1' }
                                                : { borderColor: '#e2e8f0', backgroundColor: '#f8fafc', color: '#64748b' }}>
                                            {ctx}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            <div className="bg-white dark:bg-slate-800/60 rounded-[22px] p-4 border border-slate-100 dark:border-slate-700/60 shadow-sm mb-5">
                                <textarea
                                    value={data.emotionalContext}
                                    onChange={e => update('emotionalContext')(e.target.value)}
                                    placeholder="شيء تودّ إضافته عن حالتك العاطفية اليوم (اختياري)"
                                    rows={3}
                                    className="w-full text-[13px] font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/60 resize-none focus:outline-none focus:border-indigo-300 placeholder-slate-300 dark:placeholder-slate-600"
                                />
                            </div>

                            <motion.button whileTap={{ scale: 0.97 }}
                                onClick={handleAnalyze}
                                disabled={saving}
                                className="w-full h-[54px] rounded-2xl text-white text-[14px] font-black flex items-center justify-between px-5 relative overflow-hidden"
                                style={{ background: 'linear-gradient(135deg, #0d9488, #6366f1)', boxShadow: '0 8px 24px rgba(13,148,136,0.28)', opacity: saving ? 0.7 : 1 }}>
                                {saving ? (
                                    <><Loader2 className="w-5 h-5 text-white animate-spin" /><span>جاري الحفظ...</span></>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-white" />
                                            <span>تحليل يومياتي الصحية</span>
                                        </div>
                                        <ArrowLeft className="w-5 h-5 text-white/80" />
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    )}

                    {/* ANALYZING */}
                    {step === 'analyzing' && (
                        <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-8">
                            <AnalyzingScreen />
                        </motion.div>
                    )}

                    {/* RESULT */}
                    {step === 'result' && (
                        <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <CheckCircle2 className="w-5 h-5 text-teal-500" />
                                    <h2 className="text-[18px] font-black text-slate-800 dark:text-white">تقريرك الصحي اليومي</h2>
                                </div>
                                <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">تم الحفظ والتحليل بنجاح ✓</p>
                            </div>
                            <ResultScreen data={data} />
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
