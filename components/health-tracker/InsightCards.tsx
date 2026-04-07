import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getMetricTrend, TrendAnalysis } from '@/lib/analytics/healthTrends';

interface InsightCardsProps {
    metricsToAnalyze?: string[];
}

export default function InsightCards({ metricsToAnalyze = ['heart_rate', 'sleep_quality'] }: InsightCardsProps) {
    const { user } = useAuth();
    const [insights, setInsights] = useState<TrendAnalysis[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const analyzeTrends = async () => {
            if (!user?.id) return;
            setLoading(true);
            try {
                const results = await Promise.all(
                    metricsToAnalyze.map(metric => getMetricTrend(user.id, metric))
                );
                
                // Filter out nulls and only show interesting metrics (anomalies or >5% change)
                const validInsights = results.filter((r): r is TrendAnalysis => 
                    r !== null && (r.isAnomaly || Math.abs(r.changePercent) > 5)
                );
                
                setInsights(validInsights);
            } catch (error) {
                console.error('Failed to load health insights:', error);
            } finally {
                setLoading(false);
            }
        };

        analyzeTrends();
    }, [user?.id, metricsToAnalyze]);

    const getInsightText = (insight: TrendAnalysis) => {
        const nameMap: Record<string, string> = {
            'heart_rate': 'معدل نبضات القلب',
            'sleep_quality': 'جودة النوم',
            'weight': 'الوزن',
            'blood_pressure_sys': 'ضغط الدم الانقباضي',
            'blood_glucose': 'سكر الدم'
        };
        
        const name = nameMap[insight.metricType] || insight.metricType;

        if (insight.isAnomaly) {
            return `تم رصد قراءة غير معتادة في ${name} (${insight.currentValue}) مقارنة بمعدلك الطبيعي.`;
        }

        if (insight.trendDirection === 'up') {
            return `ارتفع متوسط ${name} بنسبة ${insight.changePercent.toFixed(0)}% هذا الأسبوع.`;
        }
        
        return `انخفض متوسط ${name} بنسبة ${Math.abs(insight.changePercent).toFixed(0)}% هذا الأسبوع.`;
    };

    const getInsightColor = (insight: TrendAnalysis) => {
        if (insight.isAnomaly) return 'from-amber-500 to-orange-600';
        if (insight.trendDirection === 'up' && insight.metricType === 'heart_rate') return 'from-rose-500 to-red-600';
        if (insight.trendDirection === 'up') return 'from-emerald-500 to-teal-600';
        return 'from-blue-500 to-indigo-600';
    };

    const getInsightIcon = (insight: TrendAnalysis) => {
        if (insight.isAnomaly) return <AlertCircle className="w-4 h-4 text-white" />;
        if (insight.trendDirection === 'up') return <TrendingUp className="w-4 h-4 text-white" />;
        return <TrendingDown className="w-4 h-4 text-white" />;
    };

    if (loading) {
        return (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-5">
                {[1, 2].map(i => (
                    <div key={i} className="min-w-[280px] h-[120px] rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse flex-shrink-0" />
                ))}
            </div>
        );
    }

    if (insights.length === 0) {
        // Fallback generic motivation if no significant trends found
        return (
            <div className="px-5">
                <motion.div 
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-4 shadow-lg"
                >
                    <div className="relative z-10 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1">مؤشراتك مستقرة</p>
                            <p className="text-[13px] text-white font-bold leading-relaxed">
                                قراءاتك الحيوية هذا الأسبوع مستقرة وضمن معدلاتك الطبيعية. استمر في الحفاظ على نمط حياتك الصحي!
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-5">
            {insights.map((insight, idx) => (
                <motion.div
                    key={insight.metricType}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative min-w-[280px] flex-shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br ${getInsightColor(insight)} p-4 shadow-lg`}
                >
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl bg-white/10 pointer-events-none" />
                    
                    <div className="relative z-10 flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-sm shadow-inner">
                            {getInsightIcon(insight)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1.5">
                                <p className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
                                    {insight.isAnomaly ? 'قراءة غير معتادة' : 'تغير ملحوظ'}
                                </p>
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-white/20 text-white backdrop-blur-md">
                                    {insight.changePercent > 0 ? '+' : ''}{insight.changePercent.toFixed(1)}%
                                </span>
                            </div>
                            <p className="text-[12px] text-white font-bold leading-relaxed">
                                {getInsightText(insight)}
                            </p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
