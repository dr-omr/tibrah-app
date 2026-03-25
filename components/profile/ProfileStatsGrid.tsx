import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Droplets, Moon, Pill } from 'lucide-react';
import { UserStats } from '@/lib/statsService';

interface ProfileStatsGridProps {
    statsData: UserStats;
}

export const ProfileStatsGrid = ({ statsData }: ProfileStatsGridProps) => {
    // Stats with pastel colors
    const stats = [
        { label: 'الأيام النشطة', value: statsData.activeDays, icon: Activity, color: '#2D9B83', bg: 'bg-emerald-50' },
        { label: 'أكواب الماء', value: statsData.waterCups, icon: Droplets, color: '#06B6D4', bg: 'bg-cyan-50' },
        { label: 'ساعات النوم', value: statsData.sleepHours, icon: Moon, color: '#8B5CF6', bg: 'bg-violet-50' },
        { label: 'الجرعات', value: statsData.dosesTaken, icon: Pill, color: '#F43F5E', bg: 'bg-rose-50' },
    ];

    return (
        <div className="px-4 -mt-16 relative z-10">
            <motion.div
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-4"
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div className="grid grid-cols-4 gap-2">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <motion.div
                                key={index}
                                className="text-center p-2"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <motion.div
                                    className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center mx-auto mb-2`}
                                    whileTap={{ rotate: 10 }}
                                >
                                    <Icon className="w-6 h-6" style={{ color: stat.color }} strokeWidth={1.5} />
                                </motion.div>
                                <div className="text-xl font-bold text-slate-800 dark:text-white">{stat.value}</div>
                                <div className="text-xs text-slate-500">{stat.label}</div>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
        </div>
    );
};
