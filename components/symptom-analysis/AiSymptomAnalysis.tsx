import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Loader2, AlertCircle, Activity } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { aiClient } from '@/components/ai/aiClient';
import MedicalDisclaimer from '@/components/common/MedicalDisclaimer';

interface AiSymptomAnalysisProps {
    searchQuery: string;
    selectedCategory: string;
}

export const AiSymptomAnalysis: React.FC<AiSymptomAnalysisProps> = ({ searchQuery, selectedCategory }) => {
    const [aiAnalysis, setAiAnalysis] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);

    const runAiAnalysis = useCallback(async () => {
        if (!searchQuery.trim()) return;
        setAiLoading(true);
        setAiError(null);
        setAiAnalysis(null);
        try {
            const result = await aiClient.analyzeSymptoms(
                [searchQuery],
                selectedCategory !== 'all' ? selectedCategory : undefined
            );
            setAiAnalysis(result);
        } catch (err: any) {
            setAiError(err.message || 'تعذر إجراء التحليل');
        } finally {
            setAiLoading(false);
        }
    }, [searchQuery, selectedCategory]);

    if (!searchQuery.trim()) return null;

    return (
        <div className="px-6 mb-6">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 rounded-2xl border border-purple-200 overflow-hidden"
            >
                <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 text-sm">التحليل السريري والشعوري المدمج (AI)</h3>
                                <p className="text-xs text-slate-500">تحليل الأعراض الجسدية وتقييم السياق النفس-جسدي</p>
                            </div>
                        </div>
                        <Button
                            onClick={runAiAnalysis}
                            disabled={aiLoading}
                            className="bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm px-4 h-9"
                        >
                            {aiLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                                    جاري التحليل...
                                </>
                            ) : (
                                <>
                                    <Brain className="w-4 h-4 ml-1" />
                                    حلل أعراضي
                                </>
                            )}
                        </Button>
                    </div>

                    {/* AI Error */}
                    {aiError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3 mt-2">
                            <p className="text-sm text-red-600">⚠️ {aiError}</p>
                        </div>
                    )}

                    {/* AI Results */}
                    <AnimatePresence>
                        {aiAnalysis && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-3 mt-3"
                            >
                                {/* Severity Badge */}
                                {aiAnalysis.severity && (
                                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${aiAnalysis.severity === 'high' ? 'bg-red-100 text-red-700' :
                                        aiAnalysis.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                                            'bg-green-100 text-green-700'
                                        }`}>
                                        {aiAnalysis.severity === 'high' ? '🔴 شدة عالية' :
                                            aiAnalysis.severity === 'medium' ? '🟡 شدة متوسطة' :
                                                '🟢 شدة منخفضة'}
                                    </div>
                                )}

                                {/* ⚠️ Emergency Escalation Banner — P0-CLIN-3 */}
                                {aiAnalysis.severity === 'high' && (
                                    <div className="bg-red-600 rounded-2xl p-4 text-white shadow-lg shadow-red-500/30 border-2 border-red-700">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <AlertCircle className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-sm mb-1">⚠️ تنبيه مهم — قد تحتاج رعاية طبية فورية</h4>
                                                <p className="text-red-100 text-xs leading-relaxed mb-3">
                                                    أعراضك تشير إلى حالة قد تتطلب تدخلاً طبياً عاجلاً. لا تعتمد على هذا التحليل وحده.
                                                </p>
                                                <div className="space-y-2">
                                                    <a
                                                        href="tel:997"
                                                        className="flex items-center gap-2 bg-white text-red-700 rounded-xl px-4 py-2.5 font-bold text-sm shadow-md active:scale-[0.97] transition-transform"
                                                    >
                                                        📞 اتصل بالإسعاف: 997
                                                    </a>
                                                    <p className="text-red-200 text-[10px] text-center">
                                                        أو توجه لأقرب مستشفى فوراً
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Summary */}
                                {aiAnalysis.summary && (
                                    <div className="bg-white/80 rounded-xl p-3 border border-purple-100">
                                        <p className="text-sm text-slate-700 leading-relaxed">{aiAnalysis.summary}</p>
                                    </div>
                                )}

                                {/* Psychosomatic Link (if returned by AI) */}
                                {(aiAnalysis.psychosomatic_link || aiAnalysis.emotional_connection) && (
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-3 border border-indigo-100">
                                        <h4 className="font-bold text-sm text-indigo-800 mb-2 flex items-center gap-1">
                                            <Brain className="w-4 h-4 text-indigo-500" /> التشخيص الشعوري للنمط الجسدي
                                        </h4>
                                        <p className="text-sm text-indigo-900/80 leading-relaxed font-semibold">
                                            {aiAnalysis.psychosomatic_link || aiAnalysis.emotional_connection}
                                        </p>
                                    </div>
                                )}

                                {/* Root Causes */}
                                {aiAnalysis.root_causes?.length > 0 && (
                                    <div className="bg-white/80 rounded-xl p-3 border border-purple-100">
                                        <h4 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-1">
                                            <Brain className="w-4 h-4 text-purple-500" /> الأسباب الجذرية
                                        </h4>
                                        <ul className="space-y-1">
                                            {aiAnalysis.root_causes.map((cause: string, i: number) => (
                                                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                                    <span className="text-purple-400 mt-1">•</span> {cause}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Recommendations */}
                                {aiAnalysis.recommendations?.length > 0 && (
                                    <div className="bg-white/80 rounded-xl p-3 border border-teal-100">
                                        <h4 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-1">
                                            <Activity className="w-4 h-4 text-teal-500" /> التوصيات
                                        </h4>
                                        <ul className="space-y-1">
                                            {aiAnalysis.recommendations.map((rec: string, i: number) => (
                                                <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                                                    <span className="text-teal-400 mt-1">✓</span> {rec}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Natural Remedies */}
                                {aiAnalysis.natural_remedies?.length > 0 && (
                                    <div className="bg-white/80 rounded-xl p-3 border border-green-100">
                                        <h4 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-1">
                                            🌿 العلاجات الطبيعية
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {aiAnalysis.natural_remedies.map((remedy: string, i: number) => (
                                                <span key={i} className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs border border-green-200">
                                                    {remedy}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Suggested Tests */}
                                {aiAnalysis.tests_suggested?.length > 0 && (
                                    <div className="bg-white/80 rounded-xl p-3 border border-blue-100">
                                        <h4 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-1">
                                            🔬 فحوصات مقترحة
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {aiAnalysis.tests_suggested.map((test: string, i: number) => (
                                                <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs border border-blue-200">
                                                    {test}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Urgency Note */}
                                {aiAnalysis.urgency_note && (
                                    <div className="bg-amber-50/80 rounded-xl p-3 border border-amber-200">
                                        <p className="text-xs text-amber-700 flex items-start gap-1">
                                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                            {aiAnalysis.urgency_note}
                                        </p>
                                    </div>
                                )}

                                {/* Direct Booking CTA */}
                                <div className="mt-4 pt-2 border-t border-purple-100">
                                    <Link href={`/book-appointment?symptom=${encodeURIComponent(searchQuery)}&emotion=${encodeURIComponent(aiAnalysis.psychosomatic_link || aiAnalysis.emotional_connection || '')}`}>
                                        <Button className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-xl h-12 shadow-lg shadow-teal-500/20 font-bold active:scale-[0.98] transition-all">
                                            <Activity className="w-5 h-5 ml-2" />
                                            مشاركة التقرير المدمج وحجز جلسة مع الطبيب
                                        </Button>
                                    </Link>
                                    <p className="text-center text-[10px] text-slate-400 mt-2">
                                        سيتم إرفاق التحليل السريري والبعد الشعوري لملفك الطبي عند الحجز
                                    </p>
                                </div>

                                {/* Disclaimer */}
                                <div className="pt-2">
                                    <MedicalDisclaimer variant="banner" />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
