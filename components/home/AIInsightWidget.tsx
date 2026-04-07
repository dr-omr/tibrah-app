import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, HeartPulse, Droplets, Flame, ArrowLeft, Activity } from 'lucide-react';
import { type HealthDashboardData } from '@/hooks/useHealthDashboard';
import { haptic } from '@/lib/HapticFeedback';

export default function AIInsightWidget({ dashboard }: { dashboard: HealthDashboardData }) {
    const [aiInsights, setAiInsights] = useState<{ title: string; text: string; icon: any; color: string; bg: string }[]>([]);

    // 1. Fetch Real AI Insights in the background
    useEffect(() => {
        const fetchRealAi = async () => {
            try {
                const payload = {
                    type: 'health_data_analysis',
                    data: {
                        healthScore: dashboard.healthScore,
                        streak: dashboard.streak,
                        hasLoggedToday: dashboard.hasLoggedToday,
                        waterToday: dashboard.waterToday,
                    }
                };
                const res = await fetch('/api/ai-analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });
                
                if (res.ok) {
                    const json = await res.json();
                    if (json.success && json.data) {
                        const newInsights = [];
                        
                        // Parse Trends
                        if (json.data.trends && json.data.trends.length > 0) {
                            newInsights.push({
                                title: 'مؤشر ذكي',
                                text: json.data.trends[0].detail || `لاحظنا نمطاً مهماً بخصوص ${json.data.trends[0].metric}.`,
                                icon: Brain, color: '#8b5cf6', bg: 'from-violet-500/10 to-violet-500/5'
                            });
                        }
                        
                        // Parse Patterns
                        if (json.data.patterns && json.data.patterns.length > 0) {
                            newInsights.push({
                                title: 'نمط اكتشفناه',
                                text: json.data.patterns[0],
                                icon: Sparkles, color: '#ea580c', bg: 'from-orange-500/10 to-orange-500/5'
                            });
                        }

                        // Parse Recommendations
                        if (json.data.recommendations && json.data.recommendations.length > 0) {
                            newInsights.push({
                                title: 'نصيحة طِبرَا',
                                text: json.data.recommendations[0],
                                icon: Activity, color: '#0ea5e9', bg: 'from-sky-500/10 to-sky-500/5'
                            });
                        }
                        
                        if (newInsights.length > 0) {
                            setAiInsights(newInsights);
                        }
                    }
                }
            } catch (e) {
                // Silently fail and use local metrics
                console.error('AI Insight fetch failed', e);
            }
        };

        // Fetch once on mount
        fetchRealAi();
    }, [dashboard.hasLoggedToday, dashboard.healthScore, dashboard.streak, dashboard.waterToday]);

    // 2. Compute the final displayed insights list (Local fallback + Real AI)
    const insights = useMemo(() => {
        const list: { title: string; text: string; icon: any; color: string; bg: string }[] = [];
        
        // Always include basic local milestones
        if (dashboard.healthScore >= 80) {
            list.push({ 
                title: 'صحة ممتازة', 
                text: `مؤشراتك الحيوية بـ ${dashboard.healthScoreAr} اليوم. أنت في أفضل حالاتك، استمر!`, 
                icon: HeartPulse, color: '#059669', bg: 'from-emerald-500/10 to-emerald-500/5' 
            });
        }
        
        if (dashboard.streak > 2) {
            list.push({ 
                title: 'استمرارية رائعة', 
                text: `سلسلتك ${dashboard.streakAr} أيام. الانضباط هو سر نجاح رحلتك العلاجية.`, 
                icon: Flame, color: '#ea580c', bg: 'from-orange-500/10 to-orange-500/5' 
            });
        }
        
        // Missing log reminder
        if (!dashboard.hasLoggedToday) {
            list.push({ 
                title: 'تدوين مفقود', 
                text: 'لم تسجل بياناتك الحيوية اليوم. الذكاء الاصطناعي يحتاج لبياناتك لخدمتك.', 
                icon: Activity, color: '#7c3aed', bg: 'from-violet-500/10 to-violet-500/5' 
            });
        } else if (aiInsights.length === 0) {
            list.push({ 
                title: 'طِبرَا يفكر معك', 
                text: 'جاري تحليل بياناتك الصحية بشكل مستمر لتوفير أفضل رعاية تكاملية لك...', 
                icon: Brain, color: '#4f46e5', bg: 'from-indigo-500/10 to-indigo-500/5' 
            });
        }

        // Merge AI insights at the top priority
        const finalMerged = [...aiInsights, ...list];
        
        if (finalMerged.length === 0) finalMerged.push({ 
            title: 'طِبرَا', 
            text: 'يتم تحليل بياناتك الآن', 
            icon: Brain, color: '#4f46e5', bg: 'from-indigo-500/10 to-indigo-500/5' 
        });
        
        return finalMerged.slice(0, 4); // Keep maximum 4 cards to prevent rotation fatigue
    }, [dashboard, aiInsights]);

    const [activeIndex, setActiveIndex] = useState(0);
    
    useEffect(() => {
        if (insights.length <= 1) return;
        const t = setInterval(() => {
            setActiveIndex(i => (i + 1) % insights.length);
        }, 6000);
        return () => clearInterval(t);
    }, [insights.length]);

    const activeInsight = insights[activeIndex];
    const Icon = activeInsight.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 relative overflow-hidden rounded-[26px] bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white dark:border-white/[0.08] shadow-[0_8px_32px_rgba(16,24,34,0.06)]"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${activeInsight.bg} transition-colors duration-1000`} />
            
            {/* Pulsing Brain Graphic */}
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full border-[20px] border-white/50 dark:border-slate-800/50 mix-blend-overlay opacity-30 animate-pulse-soft" />
            
            <div className="p-5 flex gap-4 relative z-10">
                <div className="relative">
                    <div className="w-12 h-12 rounded-[18px] bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700">
                        <Icon className="w-6 h-6" style={{ color: activeInsight.color }} />
                    </div>
                    <motion.div 
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-teal-500 flex items-center justify-center border-2 border-white dark:border-slate-800"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Sparkles className="w-2.5 h-2.5 text-white" />
                    </motion.div>
                </div>

                <div className="flex-1 min-w-0 flex justify-between items-center pr-2">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={activeIndex}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <span className="text-[11px] font-black uppercase tracking-widest block mb-1" style={{ color: activeInsight.color }}>
                                {activeInsight.title} ✦
                            </span>
                            <p className="text-[13.5px] font-bold text-slate-700 dark:text-slate-200 leading-snug">
                                {activeInsight.text}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Pagination Lines */}
            {insights.length > 1 && (
                <div className="absolute bottom-3 left-6 right-6 flex gap-1.5 h-1">
                    {insights.map((_, i) => (
                        <div key={i} className="flex-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            {i === activeIndex && (
                                <motion.div 
                                    className="h-full rounded-full"
                                    style={{ backgroundColor: activeInsight.color }}
                                    initial={{ width: 0 }}
                                    animate={{ width: '100%' }}
                                    transition={{ duration: 6, ease: "linear" }}
                                />
                            )}
                            {i < activeIndex && (
                                <div className="h-full w-full rounded-full" style={{ backgroundColor: activeInsight.color, opacity: 0.4 }} />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
