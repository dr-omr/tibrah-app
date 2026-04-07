/**
 * AIAnalysisSheet — Bottom Sheet لعرض تحليل Gemini الطبي
 * يُفعَّل من SmartActionHub عند ضغط زر "تحليل ذكي"
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Brain, Sparkles, HeartPulse, Stethoscope, 
    AlertTriangle, CheckCircle, Lightbulb, ArrowLeft
} from 'lucide-react';
import { apiFetch } from '@/lib/api-client';
import { haptic } from '@/lib/HapticFeedback';
import type { HealthDashboardData } from '@/hooks/useHealthDashboard';

interface AIAnalysisSheetProps {
    isOpen: boolean;
    onClose: () => void;
    dashboard: HealthDashboardData;
}

interface AIResult {
    clinical_insight?: string;
    emotional_insight?: string;
    holistic_advice?: string[];
    recommended_path?: string;
    summary?: string;
    root_causes?: string[];
    recommendations?: string[];
    overall_score?: number;
    status?: string;
    raw_response?: string;
    error?: string;
}

export default function AIAnalysisSheet({ isOpen, onClose, dashboard }: AIAnalysisSheetProps) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AIResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [analysisType, setAnalysisType] = useState<'health_data_analysis' | 'clinical_assessment'>('health_data_analysis');

    const runAnalysis = async () => {
        setLoading(true);
        setError(null);
        setResult(null);
        haptic.impact();

        try {
            const payload = {
                type: analysisType,
                data: {
                    healthScore: dashboard.healthScore,
                    streak: dashboard.streak,
                    waterToday: dashboard.waterToday,
                    waterGoal: dashboard.waterGoal,
                    hasLoggedToday: dashboard.hasLoggedToday,
                    goalsCompleted: dashboard.goalsCompleted,
                    goalsTotal: dashboard.goalsTotal,
                    journeyProgress: dashboard.journeySteps?.filter(s => s.status === 'done').length,
                },
                context: {
                    analysisDate: new Date().toLocaleDateString('ar-SA'),
                    timeOfDay: new Date().getHours() < 12 ? 'صباحاً' : new Date().getHours() < 17 ? 'ظهراً' : 'مساءً',
                }
            };

            const res = await apiFetch('/api/ai-analyze', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'تعذر الاتصال بالذكاء الاصطناعي');
            }

            const data = await res.json();
            setResult(data.data);
            haptic.success();
        } catch (e: any) {
            setError(e.message || 'حدث خطأ غير متوقع');
            haptic.error();
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onClose();
        setResult(null);
        setError(null);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 380, damping: 38 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-[32px] shadow-2xl overflow-hidden"
                        style={{ maxHeight: '88vh' }}
                    >
                        {/* Handle Bar */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                        </div>

                        <div className="overflow-y-auto" style={{ maxHeight: 'calc(88vh - 40px)' }}>
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 pb-4 border-b border-slate-100 dark:border-white/5">
                                <div>
                                    <h2 className="text-[17px] font-black text-slate-800 dark:text-white">
                                        تحليل طِبرَا الذكي 🧠
                                    </h2>
                                    <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">
                                        مدعوم بـ Gemini · تحليل سريري شخصي
                                    </p>
                                </div>
                                <button
                                    onClick={handleClose}
                                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                                >
                                    <X className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>

                            <div className="px-5 py-4 space-y-4">
                                {/* Type Selector */}
                                {!loading && !result && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setAnalysisType('health_data_analysis')}
                                            className={`flex-1 py-3 rounded-2xl text-[12px] font-bold border transition-all ${
                                                analysisType === 'health_data_analysis'
                                                    ? 'bg-teal-500 text-white border-teal-500 shadow-sm shadow-teal-500/30'
                                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700'
                                            }`}
                                        >
                                            <HeartPulse className="w-4 h-4 mx-auto mb-1" />
                                            تحليل البيانات
                                        </button>
                                        <button
                                            onClick={() => setAnalysisType('clinical_assessment')}
                                            className={`flex-1 py-3 rounded-2xl text-[12px] font-bold border transition-all ${
                                                analysisType === 'clinical_assessment'
                                                    ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm shadow-indigo-500/30'
                                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700'
                                            }`}
                                        >
                                            <Stethoscope className="w-4 h-4 mx-auto mb-1" />
                                            التقييم السريري
                                        </button>
                                    </div>
                                )}

                                {/* Loading State */}
                                {loading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex flex-col items-center justify-center py-12 gap-4"
                                    >
                                        <div className="relative w-16 h-16">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                className="absolute inset-0 rounded-full border-2 border-transparent border-t-teal-500 border-r-indigo-400"
                                            />
                                            <div className="absolute inset-2 rounded-full bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center">
                                                <Brain className="w-5 h-5 text-teal-500" />
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200">جاري التحليل...</p>
                                            <p className="text-[12px] text-slate-400 mt-0.5">Gemini يدرس بياناتك الصحية</p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Error State */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20"
                                    >
                                        <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[13px] font-bold text-red-700 dark:text-red-400">{error}</p>
                                            <p className="text-[11px] text-red-400 mt-0.5">تأكد من اتصال الإنترنت ثم حاول مجدداً</p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Results */}
                                {result && !loading && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-3"
                                    >
                                        {/* Overall Score */}
                                        {result.overall_score !== undefined && (
                                            <div className="flex items-center gap-3 p-4 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border border-teal-100 dark:border-teal-500/20">
                                                <div className="w-12 h-12 rounded-xl bg-teal-500 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white font-black text-[15px]">{result.overall_score}</span>
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">نتيجتك الصحية</p>
                                                    <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{result.status === 'good' ? 'ممتاز 🌟' : result.status === 'fair' ? 'جيد 👍' : 'يحتاج اهتمام ⚠️'}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Clinical Insight */}
                                        {result.clinical_insight && (
                                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Stethoscope className="w-4 h-4 text-indigo-500" />
                                                    <span className="text-[11px] font-extrabold text-indigo-500 uppercase tracking-wider">التقييم السريري</span>
                                                </div>
                                                <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">{result.clinical_insight}</p>
                                            </div>
                                        )}

                                        {/* Emotional Insight */}
                                        {result.emotional_insight && (
                                            <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Brain className="w-4 h-4 text-violet-500" />
                                                    <span className="text-[11px] font-extrabold text-violet-500 uppercase tracking-wider">الجانب الشعوري</span>
                                                </div>
                                                <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">{result.emotional_insight}</p>
                                            </div>
                                        )}

                                        {/* Summary */}
                                        {result.summary && (
                                            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Sparkles className="w-4 h-4 text-amber-500" />
                                                    <span className="text-[11px] font-extrabold text-amber-500 uppercase tracking-wider">الملخص</span>
                                                </div>
                                                <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">{result.summary}</p>
                                            </div>
                                        )}

                                        {/* Recommendations */}
                                        {(result.recommendations || result.holistic_advice) && (
                                            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Lightbulb className="w-4 h-4 text-emerald-500" />
                                                    <span className="text-[11px] font-extrabold text-emerald-500 uppercase tracking-wider">التوصيات</span>
                                                </div>
                                                <div className="space-y-2">
                                                    {(result.recommendations || result.holistic_advice || []).map((rec, i) => (
                                                        <div key={i} className="flex items-start gap-2">
                                                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                            <p className="text-[12px] text-slate-700 dark:text-slate-300">{rec}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Recommended Path */}
                                        {result.recommended_path && (
                                            <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 to-indigo-50 dark:from-teal-500/10 dark:to-indigo-500/10 border border-teal-100 dark:border-teal-500/20">
                                                <p className="text-[11px] font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">مسار الرعاية المقترح</p>
                                                <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{result.recommended_path}</p>
                                            </div>
                                        )}

                                        {/* Re-analyze button */}
                                        <button
                                            onClick={() => { setResult(null); setError(null); }}
                                            className="w-full py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-[13px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2"
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                            تحليل جديد
                                        </button>
                                    </motion.div>
                                )}

                                {/* CTA Button */}
                                {!loading && !result && (
                                    <motion.button
                                        whileTap={{ scale: 0.97 }}
                                        onClick={runAnalysis}
                                        className="w-full py-4 rounded-2xl bg-gradient-to-l from-teal-600 to-indigo-600 text-white font-black text-[15px] flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25"
                                    >
                                        <Brain className="w-5 h-5" />
                                        ابدأ التحليل الذكي
                                    </motion.button>
                                )}

                                {/* Disclaimer */}
                                <p className="text-center text-[10px] text-slate-300 dark:text-slate-600 pb-4">
                                    ⚕️ هذا التحليل استرشادي ولا يغني عن الاستشارة الطبية المتخصصة
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
