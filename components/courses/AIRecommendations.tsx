import React from 'react';
import { Brain, Sparkles, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface AIRecommendationsProps {
    aiRecs: any;
    aiLoading: boolean;
    getRecommendations: () => void;
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
    aiRecs,
    aiLoading,
    getRecommendations
}) => {
    return (
        <div className="px-4 pt-4 pb-6">
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-700/50 p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-100/80 dark:bg-purple-900/20 flex items-center justify-center">
                            <Brain className="w-4 h-4 text-purple-500" />
                        </div>
                        <div>
                            <span className="font-bold text-slate-800 dark:text-white text-sm">توصيات ذكية</span>
                            <p className="text-xs text-slate-400">مُخصصة لاهتماماتك</p>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        className="rounded-full bg-primary text-white h-8 text-xs px-3"
                        disabled={aiLoading}
                        onClick={getRecommendations}
                    >
                        {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 ml-1" />}
                        {aiLoading ? 'جاري...' : 'اقترح لي'}
                    </Button>
                </div>

                {aiRecs ? (
                    <div className="space-y-2">
                        {aiRecs.recommendations?.map((rec: any, i: number) => (
                            <div key={i} className="bg-slate-50/80 dark:bg-slate-700/30 rounded-xl p-3 border border-slate-100/50 dark:border-slate-600/30">
                                <p className="text-sm font-bold text-slate-800 dark:text-white mb-0.5">{rec.title || rec.course}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{rec.reason}</p>
                            </div>
                        ))}
                        {aiRecs.learning_path && (
                            <p className="text-xs text-primary font-medium text-center pt-1">
                                📚 مسار التعلم: {aiRecs.learning_path}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-3">
                        <p className="text-xs text-slate-400 leading-relaxed">
                            اضغط "اقترح لي" للحصول على توصيات مخصصة بناءً على اهتماماتك ومستواك
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
