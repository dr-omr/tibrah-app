/**
 * DailyHealthSummary — Homepage widget showing today's health snapshot
 * Displays: health score, challenges, streak, water, sleep, quick actions
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Droplets, Moon, Flame, Trophy, FileText, Bell,
    ChevronLeft, Sparkles, TrendingUp
} from 'lucide-react';
import { getChallengeStats } from '@/lib/dailyChallenges';
import { generateHealthReport, collectReportData } from '@/lib/healthReport';

interface DailySummary {
    waterCups: number;
    sleepHours: number;
    streak: number;
    challengesCompleted: number;
    totalBadges: number;
    healthScore: number;
}

function calculateQuickScore(data: DailySummary): number {
    let score = 40;
    if (data.waterCups >= 8) score += 15;
    else score += (data.waterCups / 8) * 15;
    if (data.sleepHours >= 7) score += 15;
    else score += (data.sleepHours / 7) * 15;
    if (data.streak > 0) score += Math.min(15, data.streak * 2);
    if (data.challengesCompleted > 0) score += Math.min(15, data.challengesCompleted * 5);
    return Math.min(100, Math.round(score));
}

export default function DailyHealthSummary() {
    const [summary, setSummary] = useState<DailySummary>({
        waterCups: 0, sleepHours: 0, streak: 0,
        challengesCompleted: 0, totalBadges: 0, healthScore: 0
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Collect data from localStorage
        const stats = getChallengeStats();

        let waterCups = 0;
        let sleepHours = 0;

        try {
            const today = new Date().toISOString().split('T')[0];
            const waterLogs = JSON.parse(localStorage.getItem('tibrah_water_logs') || '[]');
            const todayWater = waterLogs.find((l: any) => l.date === today);
            waterCups = todayWater?.cups || todayWater?.amount || 0;
        } catch { }

        try {
            const sleepLogs = JSON.parse(localStorage.getItem('tibrah_sleep_logs') || '[]');
            if (sleepLogs.length > 0) {
                sleepHours = sleepLogs[sleepLogs.length - 1]?.hours || 0;
            }
        } catch { }

        const data: DailySummary = {
            waterCups,
            sleepHours,
            streak: stats.streak.current,
            challengesCompleted: stats.completedToday,
            totalBadges: stats.badges.length,
            healthScore: 0,
        };
        data.healthScore = calculateQuickScore(data);

        setSummary(data);
    }, []);

    const scoreColor = summary.healthScore >= 80 ? '#22C55E' :
        summary.healthScore >= 60 ? '#F59E0B' :
            summary.healthScore >= 40 ? '#F97316' : '#EF4444';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 mb-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-teal-500" />
                    ملخصك الصحي اليوم
                </h3>
                <button
                    onClick={() => generateHealthReport()}
                    className="text-xs text-teal-600 dark:text-teal-400 flex items-center gap-1 hover:underline"
                >
                    <FileText className="w-3.5 h-3.5" />
                    تقرير PDF
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                {/* Score Row */}
                <div className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-700">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: scoreColor + '15' }}
                    >
                        <span className="text-2xl font-bold" style={{ color: scoreColor }}>
                            {summary.healthScore}
                        </span>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800 dark:text-white">
                            {summary.healthScore >= 80 ? '🌟 صحتك ممتازة اليوم!' :
                                summary.healthScore >= 60 ? '💪 أداء جيد — واصل!' :
                                    summary.healthScore >= 40 ? '🔄 يمكنك تحسين يومك' : '⚡ ابدأ الآن!'}
                        </p>
                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mt-2">
                            <motion.div
                                className="h-2 rounded-full"
                                style={{ backgroundColor: scoreColor }}
                                initial={{ width: 0 }}
                                animate={{ width: `${summary.healthScore}%` }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 divide-x divide-slate-100 dark:divide-slate-700 rtl:divide-x-reverse">
                    <Link href="/health-tracker" className="p-3 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-slate-800 dark:text-white">{summary.waterCups}</p>
                        <p className="text-[10px] text-slate-500">كوب ماء</p>
                    </Link>
                    <Link href="/health-tracker" className="p-3 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <Moon className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-slate-800 dark:text-white">{summary.sleepHours || '-'}</p>
                        <p className="text-[10px] text-slate-500">ساعة نوم</p>
                    </Link>
                    <Link href="/rewards" className="p-3 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-slate-800 dark:text-white">{summary.streak}</p>
                        <p className="text-[10px] text-slate-500">سلسلة</p>
                    </Link>
                    <Link href="/rewards" className="p-3 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                        <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                        <p className="text-lg font-bold text-slate-800 dark:text-white">{summary.totalBadges}</p>
                        <p className="text-[10px] text-slate-500">شارة</p>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}
