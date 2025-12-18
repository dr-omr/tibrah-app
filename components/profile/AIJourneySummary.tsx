import React, { useEffect, useState } from 'react';
import { useAI } from '@/components/ai/useAI';
import { AI_DISCLAIMER } from '@/components/ai/aiClient';
import { Scroll, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function AIJourneySummary({ user, healthData }) {
    const { summarize, loading, error, isEnabled } = useAI();
    const [summary, setSummary] = useState(null);

    const generateSummary = async () => {
        if (!isEnabled() || !user) return;

        const contextText = `
      المستخدم: ${user.full_name || 'مستخدم'}
      نقاط الحيوية: ${healthData?.vitality_score || 0}
      المرحلة: ${healthData?.journey_stage || 'البداية'}
      التقدم: ${healthData?.progress_percentage || 0}%
    `;

        const result = await summarize(contextText, "health_journey");
        if (result) setSummary(result);
    };

    useEffect(() => {
        generateSummary();
    }, [user, healthData]);

    if (!isEnabled()) return null;

    return (
        <div className="glass rounded-2xl p-5 border border-purple-100">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <Scroll className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-bold text-slate-800">ملخص رحلتك العلاجية</h3>
            </div>

            {loading && !summary && (
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                </div>
            )}

            {/* Error handled via fallback in aiClient, but keep retry just in case of network failure */}
            {error && !summary && (
                <div className="text-center py-4 bg-red-50 rounded-xl">
                    <p className="text-xs text-red-500 mb-2">تعذر تحميل الملخص</p>
                    <Button variant="outline" size="sm" onClick={generateSummary} className="text-slate-600 border-slate-200">
                        <RefreshCw className="w-3 h-3 ml-2" />
                        حاول مرة أخرى
                    </Button>
                </div>
            )}

            {!loading && summary && (
                <div className="animate-in fade-in duration-500">
                    <p className="text-sm text-slate-600 leading-relaxed text-justify">
                        {typeof summary === 'string' ? summary.replace(/"/g, '') : summary}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-3 text-left">{AI_DISCLAIMER}</p>
                </div>
            )}
        </div>
    );
}