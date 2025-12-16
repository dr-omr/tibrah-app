import React, { useEffect, useState } from 'react';
import { useAI } from '@/components/ai/useAI';
import { AI_DISCLAIMER } from '@/components/ai/aiClient';
import { Sparkles, Lightbulb, RefreshCw, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function AIAssistantToday() {
    const { generateSuggestions, loading, error, isEnabled } = useAI();
    const [insights, setInsights] = useState(null);

    const fetchInsights = async () => {
        if (!isEnabled) return;

        // Gather some context (mocked or real)
        try {
            // Try to get recent logs or use a default context
            const recentLogs = await base44.entities.DailyLog.list('-date', 3).catch(() => []);
            const context = {
                recentLogs: recentLogs,
                timeOfDay: new Date().getHours() < 12 ? 'morning' : 'evening',
                dayOfWeek: new Date().toLocaleDateString('ar-SA', { weekday: 'long' })
            };

            const result = await generateSuggestions(context);
            if (result) setInsights(result);
        } catch (e) {
            console.error("Failed to fetch context for AI", e);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, []); // Run once on mount

    if (!isEnabled) return null;

    return (
        <div className="glass rounded-2xl p-5 relative overflow-hidden border border-[#2D9B83]/20">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2D9B83] to-[#D4AF37]" />

            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#2D9B83]/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#2D9B83]" />
                </div>
                <h3 className="font-bold text-slate-800">مساعدك الذكي اليوم</h3>
            </div>

            {loading && !insights && (
                <div className="space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-20 w-full rounded-xl" />
                </div>
            )}

            {error && (
                <div className="text-center py-4">
                    <p className="text-sm text-slate-500 mb-2">تعذّر الاتصال بالمساعد الذكي حالياً</p>
                    <Button variant="outline" size="sm" onClick={fetchInsights}>
                        <RefreshCw className="w-3 h-3 mr-2" />
                        حاول مرة أخرى
                    </Button>
                </div>
            )}

            {!loading && insights && (
                <div className="animate-in fade-in duration-500">
                    <p className="text-slate-700 mb-4 leading-relaxed font-medium">
                        {insights.focus_text}
                    </p>

                    <div className="space-y-3">
                        {insights.suggestions?.map((suggestion, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-white/60 p-3 rounded-xl">
                                <Lightbulb className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-slate-600">{suggestion}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-[10px] text-slate-400">
                        <AlertCircle className="w-3 h-3" />
                        <span>{AI_DISCLAIMER}</span>
                    </div>
                </div>
            )}
        </div>
    );
}