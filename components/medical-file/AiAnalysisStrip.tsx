import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AiAnalysisStripProps {
    aiAnalysis: any;
    aiLoading: boolean;
    runAiAnalysis: () => void;
}

export default function AiAnalysisStrip({ aiAnalysis, aiLoading, runAiAnalysis }: AiAnalysisStripProps) {
    return (
        <div className="px-4 mb-5">
            <motion.div
                className="relative overflow-hidden bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/15 rounded-2xl p-4 border border-purple-200/60 dark:border-purple-800/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                {/* Decorative orb */}
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-purple-400/10 rounded-full blur-2xl" />

                <div className="relative flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
                            <Brain className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-slate-800 dark:text-white text-sm">تحليل ذكي</span>
                            <p className="text-xs text-slate-400 font-medium">تحليل ملفك بالمساعد الذكي</p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        className="bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-xl h-9 text-xs font-bold shadow-md shadow-violet-500/20"
                        disabled={aiLoading}
                        onClick={runAiAnalysis}
                    >
                        {aiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 ml-1" />}
                        {aiLoading ? 'جاري...' : 'حلل ملفي'}
                    </Button>
                </div>

                {/* AI Results */}
                {aiAnalysis && (
                    <div className="space-y-3 mt-3 pt-3 border-t border-purple-200/40 dark:border-purple-700/30">
                        {aiAnalysis.health_overview && (
                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{aiAnalysis.health_overview}</p>
                        )}
                        {aiAnalysis.risk_factors?.length > 0 && (
                            <div className="bg-red-50/50 dark:bg-red-900/10 rounded-xl p-3 border border-red-100/50 dark:border-red-800/20">
                                <p className="text-xs font-bold text-red-600 dark:text-red-400 mb-1.5">⚠️ عوامل خطر:</p>
                                {aiAnalysis.risk_factors.map((r: string, i: number) => (
                                    <p key={i} className="text-xs text-slate-600 dark:text-slate-400 mr-2 leading-relaxed">• {r}</p>
                                ))}
                            </div>
                        )}
                        {aiAnalysis.lifestyle_recommendations?.length > 0 && (
                            <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-3 border border-green-100/50 dark:border-green-800/20">
                                <p className="text-xs font-bold text-green-600 dark:text-green-400 mb-1.5">💚 نصائح:</p>
                                {aiAnalysis.lifestyle_recommendations.map((r: string, i: number) => (
                                    <p key={i} className="text-xs text-slate-600 dark:text-slate-400 mr-2 leading-relaxed">• {r}</p>
                                ))}
                            </div>
                        )}
                        {aiAnalysis.tests_due?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {aiAnalysis.tests_due.map((t: string, i: number) => (
                                    <span key={i} className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-lg border border-blue-200/60 dark:border-blue-800/30 font-medium">🔬 {t}</span>
                                ))}
                            </div>
                        )}
                        {aiAnalysis.positive_indicators?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {aiAnalysis.positive_indicators.map((p: string, i: number) => (
                                    <span key={i} className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-2.5 py-1 rounded-lg border border-green-200/60 dark:border-green-800/30 font-medium">✓ {p}</span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
}
