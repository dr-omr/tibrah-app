import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ChevronRight, Flame, CheckCircle2, Sparkles, Lock } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import HealthChart from '@/components/health/HealthChart';

interface CompletedSummaryProps {
    streak: number;
    showConfetti: boolean;
    moodData: any;
    energyData: any;
    sleepData: any;
    sleepHours: number;
    selectedSymptoms: string[];
    commonSymptoms: any[];
    notes: string;
    gratitude: string;
    recentLogs: any[];
    aiInsightLoading: boolean;
    aiInsight: { focus_text: string, suggestions: string[] } | null;
    isAuthenticated: boolean;
    isChecking: boolean;
    isAvailable: boolean;
    authenticate: () => void;
    router: any;
}

const ConfettiEffect = ({ show }: { show: boolean }) => {
    // A placeholder for the original ConfettiEffect in the file
    // Assumes it either renders null or the actual effect
    if (!show) return null;
    return (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
             <div className="text-4xl animate-bounce">🎊 🎉 ✨</div>
        </div>
    );
};

export const CompletedSummary: React.FC<CompletedSummaryProps> = ({
    streak,
    showConfetti,
    moodData,
    energyData,
    sleepData,
    sleepHours,
    selectedSymptoms,
    commonSymptoms,
    notes,
    gratitude,
    recentLogs,
    aiInsightLoading,
    aiInsight,
    isAuthenticated,
    isChecking,
    isAvailable,
    authenticate,
    router
}) => {
    if (!isAuthenticated && !isChecking) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)' }}>
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                >
                    <div className="w-20 h-20 mx-auto rounded-[24px] flex items-center justify-center mb-6" style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
                        <Lock className="w-8 h-8 text-blue-400" />
                    </div>
                    <h2 className="text-xl font-black text-white mb-2">سجلك الصحي مقفل</h2>
                    <p className="text-sm text-white/50 font-semibold mb-8 max-w-[260px] mx-auto">
                        الرجاء تأكيد هويتك للوصول إلى بياناتك الصحية الحساسة والإحصائيات.
                    </p>

                    <button
                        onClick={() => authenticate()}
                        className="w-full py-4 px-8 rounded-2xl text-[15px] font-black text-white active:scale-[0.97] transition-all flex items-center justify-center gap-3"
                        style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', boxShadow: '0 6px 24px rgba(59,130,246,0.35)' }}
                    >
                        <Lock className="w-4 h-4" />
                        {isAvailable ? 'استخدام البصمة / FaceID' : 'الوصول للبيانات'}
                    </button>

                    <button onClick={() => router.back()} className="mt-6 text-sm text-white/40 font-bold hover:text-white transition-colors">
                        العودة للرئيسية
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)' }}>
            <ConfettiEffect show={showConfetti} />

            {/* Header */}
            <div className="sticky top-0 z-30 px-4 pt-4 pb-3" style={{ background: 'rgba(15,23,42,0.9)', backdropFilter: 'blur(16px)' }}>
                <div className="flex items-center justify-between">
                    <Link href="/">
                        <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
                            <ChevronRight className="w-5 h-5 text-white/70" />
                        </button>
                    </Link>
                    <h1 className="text-[17px] font-black text-white">تسجيل يومي</h1>
                    <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: 'rgba(249,115,22,0.15)' }}>
                        <Flame className="w-3.5 h-3.5 text-orange-400" />
                        <span className="text-[12px] font-black text-orange-400">{streak + 1}</span>
                    </div>
                </div>
            </div>

            {/* Success card */}
            <div className="px-4 pt-8">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="text-center mb-8"
                >
                    <motion.div
                        className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-4"
                        style={{ background: 'linear-gradient(135deg, #0d9488, #10b981)', boxShadow: '0 8px 32px rgba(13,148,136,0.4)' }}
                        animate={{ rotate: showConfetti ? [0, -5, 5, 0] : 0 }}
                    >
                        <CheckCircle2 className="w-10 h-10 text-white" />
                    </motion.div>
                    <h2 className="text-2xl font-black text-white mb-1">تم التسجيل! 🎉</h2>
                    <p className="text-sm text-white/50 font-semibold">حالتك الصحية اليوم مسجلة بنجاح</p>
                </motion.div>

                {/* Summary cards */}
                <div className="grid grid-cols-3 gap-2.5 mb-6">
                    {moodData && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-2xl p-3.5 text-center"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <span className="text-2xl">{moodData.emoji}</span>
                            <p className="text-[10px] text-white/40 font-bold mt-1">المزاج</p>
                            <p className="text-[11px] text-white font-black mt-0.5">{moodData.label}</p>
                        </motion.div>
                    )}
                    {energyData && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-2xl p-3.5 text-center"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <span className="text-2xl">{energyData.emoji}</span>
                            <p className="text-[10px] text-white/40 font-bold mt-1">الطاقة</p>
                            <p className="text-[11px] text-white font-black mt-0.5">{energyData.label}</p>
                        </motion.div>
                    )}
                    {sleepData && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-2xl p-3.5 text-center"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                            <span className="text-2xl">{sleepData.emoji}</span>
                            <p className="text-[10px] text-white/40 font-bold mt-1">النوم</p>
                            <p className="text-[11px] text-white font-black mt-0.5">{sleepHours}h • {sleepData.label}</p>
                        </motion.div>
                    )}
                </div>

                {/* Symptoms summary */}
                {selectedSymptoms.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="rounded-2xl p-4 mb-4"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <p className="text-[11px] text-white/40 font-bold mb-2">الأعراض المسجلة</p>
                        <div className="flex flex-wrap gap-1.5">
                            {selectedSymptoms.map(id => {
                                const symptom = commonSymptoms.find(s => s.id === id);
                                return symptom ? (
                                    <span key={id} className="text-xs px-2.5 py-1 rounded-full font-bold text-white/80" style={{ background: 'rgba(239,68,68,0.15)' }}>
                                        {symptom.emoji} {symptom.label}
                                    </span>
                                ) : null;
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Notes summary */}
                {(notes || gratitude) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="rounded-2xl p-4 mb-6"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        {notes && (
                            <div className="mb-2">
                                <p className="text-[11px] text-white/40 font-bold mb-1">📝 ملاحظات</p>
                                <p className="text-[13px] text-white/70 font-semibold">{notes}</p>
                            </div>
                        )}
                        {gratitude && (
                            <div>
                                <p className="text-[11px] text-white/40 font-bold mb-1">🙏 ممتن لـ</p>
                                <p className="text-[13px] text-white/70 font-semibold">{gratitude}</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Historical Health Chart */}
                <div className="mb-6">
                    <HealthChart data={recentLogs} />
                </div>

                {/* AI Smart Insight */}
                {aiInsightLoading ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl p-5 mb-6 text-center"
                        style={{ background: 'linear-gradient(135deg, rgba(13,148,136,0.1), rgba(16,185,129,0.05))', border: '1px solid rgba(13,148,136,0.15)' }}
                    >
                        <Sparkles className="w-6 h-6 text-teal-400 animate-pulse mx-auto mb-2" />
                        <p className="text-sm text-teal-300/80 font-bold">جاري استنتاج نصيحة لك...</p>
                    </motion.div>
                ) : aiInsight ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: 'spring' }}
                        className="rounded-2xl p-5 mb-6"
                        style={{ background: 'linear-gradient(135deg, rgba(13,148,136,0.15), rgba(16,185,129,0.05))', border: '1px solid rgba(13,148,136,0.15)' }}
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-5 h-5 text-teal-400" />
                            <h3 className="text-[14px] font-black text-teal-300">نصيحة طِبرَا الذكية</h3>
                        </div>
                        <p className="text-[13px] text-teal-50 font-semibold leading-relaxed mb-3">
                            {aiInsight.focus_text}
                        </p>
                        {aiInsight.suggestions && aiInsight.suggestions.length > 0 && (
                            <ul className="space-y-1.5 mt-2">
                                {aiInsight.suggestions.map((s, i) => (
                                    <li key={i} className="text-[12px] text-teal-100/80 flex items-start gap-2">
                                        <span className="text-teal-400 mt-0.5">•</span>
                                        {s.replace(/^- /, '').replace(/^\* /, '')}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </motion.div>
                ) : null}

                {/* Streak banner */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="rounded-2xl p-4 flex items-center gap-3 mb-6"
                    style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.15), rgba(239,68,68,0.1))', border: '1px solid rgba(249,115,22,0.15)' }}
                >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(249,115,22,0.2)' }}>
                        <Flame className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                        <p className="text-[15px] font-black text-orange-300">{streak + 1} يوم متتالي 🔥</p>
                        <p className="text-[11px] text-white/40 font-semibold">استمر! كل يوم يقربك من صحة أفضل</p>
                    </div>
                </motion.div>

                {/* Return button */}
                <Link href="/">
                    <button
                        className="w-full py-4 rounded-2xl text-[15px] font-black text-white active:scale-[0.97] transition-transform mb-8"
                        style={{ background: 'linear-gradient(135deg, #0d9488, #10b981)', boxShadow: '0 6px 24px rgba(13,148,136,0.35)' }}
                    >
                        العودة للرئيسية ←
                    </button>
                </Link>
            </div>
        </div>
    );
};
