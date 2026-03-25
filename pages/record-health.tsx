// pages/record-health.tsx
// Premium 5-step daily health check-in — سجّل حالتك
// Full-page experience with dark premium UI, streak tracking, and visual summary

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    ChevronRight, Sparkles, Zap, Moon, Stethoscope, FileText,
    CheckCircle2, Flame, ArrowLeft, Heart, X, Sun, CloudSun, Sunset,
    Frown, Meh, Smile, SmilePlus, PartyPopper
} from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { toast } from 'sonner';
import SEO from '@/components/common/SEO';
import Link from 'next/link';
import { aiClient } from '@/components/ai/aiClient';
import HealthChart from '@/components/health/HealthChart';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { Lock } from 'lucide-react';
import { CompletedSummary } from '@/components/record-health/CompletedSummary';
import { MoodStep, EnergyStep, SleepStep, SymptomsStep, NotesStep } from '@/components/record-health/CheckInSteps';

// ─── Data Constants ───

const moods = [
    { value: 1, emoji: '😞', label: 'سيء جداً', color: '#ef4444', gradient: 'linear-gradient(135deg, #ef4444, #dc2626)' },
    { value: 2, emoji: '😐', label: 'ليس جيداً', color: '#f97316', gradient: 'linear-gradient(135deg, #f97316, #ea580c)' },
    { value: 3, emoji: '🙂', label: 'عادي', color: '#eab308', gradient: 'linear-gradient(135deg, #eab308, #ca8a04)' },
    { value: 4, emoji: '😊', label: 'جيد', color: '#22c55e', gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' },
    { value: 5, emoji: '🤩', label: 'ممتاز!', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' },
];

const energyLevels = [
    { value: 1, label: 'منخفض جداً', pct: 20, color: '#ef4444', emoji: '🪫' },
    { value: 2, label: 'ضعيف', pct: 40, color: '#f97316', emoji: '😴' },
    { value: 3, label: 'متوسط', pct: 60, color: '#eab308', emoji: '⚡' },
    { value: 4, label: 'جيد', pct: 80, color: '#22c55e', emoji: '💪' },
    { value: 5, label: 'عالي جداً!', pct: 100, color: '#0d9488', emoji: '🚀' },
];

const sleepQualities = [
    { value: 1, label: 'سيء جداً', emoji: '😵', color: '#ef4444' },
    { value: 2, label: 'مضطرب', emoji: '😟', color: '#f97316' },
    { value: 3, label: 'عادي', emoji: '😐', color: '#eab308' },
    { value: 4, label: 'مريح', emoji: '😌', color: '#22c55e' },
    { value: 5, label: 'ممتاز', emoji: '😇', color: '#8b5cf6' },
];

const commonSymptoms = [
    { id: 'headache', label: 'صداع', emoji: '🤕' },
    { id: 'fatigue', label: 'إرهاق', emoji: '😩' },
    { id: 'stomach', label: 'ألم بطن', emoji: '🤢' },
    { id: 'back_pain', label: 'ألم ظهر', emoji: '🔥' },
    { id: 'anxiety', label: 'قلق', emoji: '😰' },
    { id: 'insomnia', label: 'أرق', emoji: '🌙' },
    { id: 'joint_pain', label: 'ألم مفاصل', emoji: '🦴' },
    { id: 'bloating', label: 'انتفاخ', emoji: '🫧' },
    { id: 'brain_fog', label: 'تشوش ذهني', emoji: '🌫️' },
    { id: 'muscle_pain', label: 'ألم عضلات', emoji: '💪' },
    { id: 'nausea', label: 'غثيان', emoji: '🤮' },
    { id: 'dizziness', label: 'دوخة', emoji: '💫' },
];

const steps = [
    { id: 'mood', title: 'المزاج', icon: Sparkles, color: '#8b5cf6' },
    { id: 'energy', title: 'الطاقة', icon: Zap, color: '#f59e0b' },
    { id: 'sleep', title: 'النوم', icon: Moon, color: '#6366f1' },
    { id: 'symptoms', title: 'الأعراض', icon: Stethoscope, color: '#ef4444' },
    { id: 'notes', title: 'ملاحظات', icon: FileText, color: '#0d9488' },
];

// ─── Main Page Component ───

export default function RecordHealth() {
    const router = useRouter();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { isAvailable, isAuthenticated, isChecking, authenticate } = useBiometricAuth();

    const [currentStep, setCurrentStep] = useState(0);
    const [mood, setMood] = useState<number | null>(null);
    const [energy, setEnergy] = useState<number | null>(null);
    const [sleepQuality, setSleepQuality] = useState<number | null>(null);
    const [sleepHours, setSleepHours] = useState<number>(7);
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [gratitude, setGratitude] = useState('');
    const [completed, setCompleted] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [streak, setStreak] = useState(0);

    const [aiInsight, setAiInsight] = useState<{ focus_text: string, suggestions: string[] } | null>(null);
    const [aiInsightLoading, setAiInsightLoading] = useState(false);

    const todayKey = new Date().toISOString().split('T')[0];

    // Check if already logged today
    const { data: todayLog } = useQuery({
        queryKey: ['daily-checkin', todayKey, user?.id],
        queryFn: async () => {
            const logs = await db.entities.DailyLog.filter({ date: todayKey, user_id: user?.id });
            return logs.length > 0 ? logs[0] : null;
        },
        enabled: !!user?.id,
    });

    // Calculate streak
    const { data: recentLogs = [] } = useQuery({
        queryKey: ['recent-logs-streak', user?.id],
        queryFn: async () => {
            const logs = await db.entities.DailyLog.listForUser(user?.id || '', '-date', 60);
            return logs;
        },
        enabled: !!user?.id,
    });

    useEffect(() => {
        if (recentLogs.length > 0) {
            let count = 0;
            const today = new Date();
            for (let i = 0; i < 60; i++) {
                const checkDate = new Date(today);
                checkDate.setDate(today.getDate() - i);
                const dateStr = checkDate.toISOString().split('T')[0];
                const hasLog = recentLogs.some((log: any) => log.date === dateStr && log.mood);
                if (hasLog || (i === 0 && !hasLog)) {
                    if (hasLog) count++;
                    else if (i === 0) continue; // today not yet logged, that's ok
                } else {
                    break;
                }
            }
            setStreak(count);
        }
    }, [recentLogs]);

    // If already completed today, show summary
    useEffect(() => {
        if (todayLog && (todayLog as any).mood) {
            setCompleted(true);
            setMood((todayLog as any).mood);
            setEnergy((todayLog as any).energy_level || null);
            setSleepQuality((todayLog as any).sleep_quality || null);
            setSleepHours((todayLog as any).sleep_hours || 7);
            setSelectedSymptoms((todayLog as any).symptoms || []);
            setNotes((todayLog as any).notes || '');
            setGratitude((todayLog as any).gratitude || '');
        }
    }, [todayLog]);

    // Fetch AI Insight when completed
    useEffect(() => {
        if (completed && mood !== null && !aiInsight && !aiInsightLoading) {
            const fetchInsight = async () => {
                setAiInsightLoading(true);
                const insight = await aiClient.generateSuggestions({
                    mood,
                    energy,
                    sleepHours,
                    symptoms: selectedSymptoms.join(', ')
                });
                setAiInsight(insight);
                setAiInsightLoading(false);
            };
            fetchInsight();
        }
    }, [completed, mood, energy, sleepHours, selectedSymptoms, aiInsightLoading, aiInsight]);

    // Save mutation
    const saveMutation = useMutation({
        mutationFn: async () => {
            const data: any = {
                date: todayKey,
                mood,
                energy_level: energy,
                sleep_quality: sleepQuality,
                sleep_hours: sleepHours,
                symptoms: selectedSymptoms,
                notes,
                gratitude,
                type: 'daily_checkin',
            };

            if (todayLog && (todayLog as any).id) {
                return db.entities.DailyLog.update((todayLog as any).id, data);
            }
            return db.entities.DailyLog.createForUser(user?.id || '', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['daily-checkin'] });
            queryClient.invalidateQueries({ queryKey: ['dailyLogs'] });
            queryClient.invalidateQueries({ queryKey: ['recent-logs-streak'] });
            setCompleted(true);
            setShowConfetti(true);
            haptic.success();
            toast.success('تم تسجيل حالتك الصحية! 🎉');
            setTimeout(() => setShowConfetti(false), 2000);
        },
    });

    const canProceed = () => {
        switch (currentStep) {
            case 0: return mood !== null;
            case 1: return energy !== null;
            case 2: return sleepQuality !== null;
            case 3: return true; // symptoms optional
            case 4: return true; // notes optional
            default: return false;
        }
    };

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
            haptic.selection();
        } else {
            // Final step — save
            saveMutation.mutate();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
            haptic.selection();
        }
    };

    const toggleSymptom = (id: string) => {
        setSelectedSymptoms(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
        haptic.selection();
    };

    const progressPct = ((currentStep + 1) / steps.length) * 100;

    // ─── Completed Summary ───
    if (completed) {
        return (
            <CompletedSummary
                streak={streak}
                showConfetti={showConfetti}
                moodData={moods.find(m => m.value === mood)}
                energyData={energyLevels.find(e => e.value === energy)}
                sleepData={sleepQualities.find(s => s.value === sleepQuality)}
                sleepHours={sleepHours}
                selectedSymptoms={selectedSymptoms}
                commonSymptoms={commonSymptoms}
                notes={notes}
                gratitude={gratitude}
                recentLogs={recentLogs}
                aiInsightLoading={aiInsightLoading}
                aiInsight={aiInsight}
                isAuthenticated={isAuthenticated}
                isChecking={isChecking}
                isAvailable={isAvailable}
                authenticate={authenticate}
                router={router}
            />
        );
    }

    // ─── Active Check-In Flow ───
    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)' }}>
            <SEO title="سجّل حالتك — طِبرَا" description="تسجيل الحالة الصحية اليومية" />

            {/* Sticky Header */}
            <div className="sticky top-0 z-30" style={{ background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(16px)' }}>
                <div className="px-4 pt-4 pb-2">
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={() => router.back()}
                            className="w-9 h-9 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.08)' }}
                        >
                            <ChevronRight className="w-5 h-5 text-white/70" />
                        </button>
                        <h1 className="text-[17px] font-black text-white">سجّل حالتك</h1>
                        <button
                            onClick={() => router.back()}
                            className="w-9 h-9 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.08)' }}
                        >
                            <X className="w-4 h-4 text-white/50" />
                        </button>
                    </div>

                    {/* Step indicator */}
                    <div className="flex items-center gap-1.5 mb-2">
                        {steps.map((step, i) => {
                            const StepIcon = step.icon;
                            const isActive = i === currentStep;
                            const isDone = i < currentStep;
                            return (
                                <div key={step.id} className="flex-1 flex flex-col items-center gap-1">
                                    <div
                                        className="w-full h-1.5 rounded-full transition-all duration-500"
                                        style={{
                                            background: isDone
                                                ? 'linear-gradient(135deg, #0d9488, #10b981)'
                                                : isActive
                                                    ? `linear-gradient(135deg, ${step.color}, ${step.color}88)`
                                                    : 'rgba(255,255,255,0.06)',
                                        }}
                                    />
                                    <span className={`text-[9px] font-bold transition-all ${isActive ? 'text-white' : isDone ? 'text-emerald-400' : 'text-white/25'}`}>
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Step Content */}
            <div className="px-4 pt-6 pb-32">
                <AnimatePresence mode="wait">
                    {/* ── STEP 1: MOOD ── */}
                    {currentStep === 0 && <MoodStep mood={mood} setMood={setMood} moods={moods} />}

                    {/* ── STEP 2: ENERGY ── */}
                    {currentStep === 1 && <EnergyStep energy={energy} setEnergy={setEnergy} energyLevels={energyLevels} />}

                    {/* ── STEP 3: SLEEP ── */}
                    {currentStep === 2 && (
                        <SleepStep
                            sleepQuality={sleepQuality}
                            setSleepQuality={setSleepQuality}
                            sleepHours={sleepHours}
                            setSleepHours={setSleepHours}
                            sleepQualities={sleepQualities}
                        />
                    )}

                    {/* ── STEP 4: SYMPTOMS ── */}
                    {currentStep === 3 && (
                        <SymptomsStep
                            selectedSymptoms={selectedSymptoms}
                            toggleSymptom={toggleSymptom}
                            commonSymptoms={commonSymptoms}
                        />
                    )}

                    {/* ── STEP 5: NOTES ── */}
                    {currentStep === 4 && (
                        <NotesStep
                            notes={notes}
                            setNotes={setNotes}
                            gratitude={gratitude}
                            setGratitude={setGratitude}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom action bar */}
            <div className="fixed bottom-0 left-0 right-0 z-40" style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="px-4 py-4 pb-[max(16px,env(safe-area-inset-bottom))]">
                    <div className="flex gap-2.5">
                        {currentStep > 0 && (
                            <button
                                onClick={handleBack}
                                className="w-14 h-14 rounded-2xl flex items-center justify-center active:scale-95 transition-transform"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                                <ArrowLeft className="w-5 h-5 text-white/60 rotate-180" />
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            disabled={!canProceed() || saveMutation.isPending}
                            className="flex-1 h-14 rounded-2xl text-[15px] font-black text-white active:scale-[0.97] transition-all disabled:opacity-40"
                            style={{
                                background: canProceed() ? 'linear-gradient(135deg, #0d9488, #10b981)' : 'rgba(255,255,255,0.06)',
                                boxShadow: canProceed() ? '0 6px 24px rgba(13,148,136,0.35)' : 'none',
                            }}
                        >
                            {saveMutation.isPending ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Sparkles className="w-5 h-5 animate-spin" />
                                    جاري الحفظ...
                                </span>
                            ) : currentStep === 4 ? (
                                <span className="flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-5 h-5" />
                                    حفظ التسجيل
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    التالي
                                    <ArrowLeft className="w-4 h-4" />
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Confetti Effect ───
function ConfettiEffect({ show }: { show: boolean }) {
    if (!show) return null;
    const particles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 300,
        y: -(Math.random() * 200 + 80),
        rotate: Math.random() * 360,
        color: ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#0d9488'][i % 7],
        size: 5 + Math.random() * 5,
    }));

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
            {particles.map(p => (
                <motion.div
                    key={p.id}
                    className="absolute rounded-sm"
                    style={{
                        width: p.size,
                        height: p.size,
                        backgroundColor: p.color,
                        left: '50%',
                        top: '40%',
                    }}
                    initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
                    animate={{
                        x: p.x,
                        y: p.y,
                        scale: [0, 1.5, 0.8],
                        rotate: p.rotate,
                        opacity: [1, 1, 0],
                    }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                />
            ))}
        </div>
    );
}
