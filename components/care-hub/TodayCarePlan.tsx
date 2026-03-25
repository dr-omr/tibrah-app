import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { CheckCircle2, Circle, Droplets, Smile, Pill, Wind, Sparkles, ArrowLeft, Heart, Music } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface TodayCarePlanProps {
    userId: string;
    psychosomaticProtocol?: any;
}

export function TodayCarePlan({ userId, psychosomaticProtocol }: TodayCarePlanProps) {
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // Fetch today's DailyLog
    const { data: dailyLogs = [] } = useQuery({
        queryKey: ['dailyLogs', userId, todayStr],
        queryFn: () => db.entities.DailyLog.listForUser(userId),
        enabled: !!userId,
    });
    const todayLog = dailyLogs.find((l: any) => l.date === todayStr);

    // Fetch Meds
    const { data: medications = [] } = useQuery({
        queryKey: ['medications', userId],
        queryFn: () => db.entities.Medication.listForUser(userId),
        enabled: !!userId,
    });

    const hasMeds = medications.length > 0;
    const waterCups = (todayLog?.water_cups as number) || 0;
    const waterGoal = 8;
    const isWaterDone = waterCups >= waterGoal;
    const isMoodDone = !!todayLog?.mood;
    const isMedsDone = todayLog?.notes?.includes('تم أخذ الأدوية') || false; // Simple workaround for now

    const tasks = [
        {
            id: 'water',
            icon: Droplets,
            title: 'شرب الماء',
            subtitle: `${waterCups} من ${waterGoal} أكواب`,
            isDone: isWaterDone,
            href: '/health-tracker?tab=water',
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/20'
        },
        {
            id: 'mood',
            icon: Smile,
            title: 'تسجيل المزاج',
            subtitle: isMoodDone ? 'تم التسجيل' : 'كيف تشعر اليوم؟',
            isDone: isMoodDone,
            href: '/health-tracker?tab=mood',
            color: 'text-purple-500',
            bg: 'bg-purple-50 dark:bg-purple-900/20'
        }
    ];

    if (hasMeds) {
        tasks.push({
            id: 'meds',
            icon: Pill,
            title: 'المكملات والأدوية',
            subtitle: isMedsDone ? 'تم أخذ جرعة اليوم' : 'تذكير بالجرعة',
            isDone: isMedsDone,
            href: '/health-tracker?tab=meds',
            color: 'text-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-900/20'
        });
    }

    if (psychosomaticProtocol) {
        tasks.push({
            id: 'frequency',
            icon: Music,
            title: 'ترددات تشافية',
            subtitle: 'استمع لتردد مخصص لخطتك',
            isDone: false, // Could track this in DB later
            href: '/frequencies',
            color: 'text-violet-500',
            bg: 'bg-violet-50 dark:bg-violet-900/20'
        });
        tasks.push({
            id: 'breathe',
            icon: Wind,
            title: 'جلسة تنفس',
            subtitle: 'لتهدئة الجهاز العصبي',
            isDone: false,
            href: '/breathe',
            color: 'text-teal-500',
            bg: 'bg-teal-50 dark:bg-teal-900/20'
        });
    }

    const completedTasks = tasks.filter(t => t.isDone).length;
    const progressPercent = Math.round((completedTasks / tasks.length) * 100) || 0;

    return (
        <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        خطة اليوم
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{format(new Date(), 'EEEE, d MMM')} — {tasks.length} مهام</p>
                </div>
                
                {/* Micro Progress Indicator */}
                <div className="relative flex items-center justify-center w-12 h-12">
                    <svg className="w-12 h-12 transform -rotate-90">
                        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100 dark:text-slate-700" />
                        <circle
                            cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent"
                            strokeDasharray={2 * Math.PI * 20}
                            strokeDashoffset={2 * Math.PI * 20 - (progressPercent / 100) * 2 * Math.PI * 20}
                            className="text-emerald-500 transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <span className="absolute text-[10px] font-bold text-slate-700 dark:text-slate-300">{progressPercent}%</span>
                </div>
            </div>

            <div className="p-2 space-y-1">
                {tasks.map((task, i) => (
                    <Link key={i} href={task.href} className="block">
                        <motion.div 
                            whileTap={{ scale: 0.98 }}
                            className={`flex items-center justify-between p-3 rounded-2xl transition-colors ${task.isDone ? 'bg-slate-50 dark:bg-slate-800/50' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${task.isDone ? 'bg-slate-100 dark:bg-slate-700 text-slate-400' : task.bg} ${task.isDone ? '' : task.color}`}>
                                    <task.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className={`text-sm font-bold ${task.isDone ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-700 dark:text-white'}`}>{task.title}</h4>
                                    <p className={`text-[11px] font-medium mt-0.5 ${task.isDone ? 'text-slate-400/70' : 'text-slate-500 dark:text-slate-400'}`}>{task.subtitle}</p>
                                </div>
                            </div>
                            
                            {task.isDone ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                                <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                            )}
                        </motion.div>
                    </Link>
                ))}
            </div>
            
            {psychosomaticProtocol && (
                <div className="px-4 pb-4 pt-1">
                    <div className="bg-indigo-50/80 dark:bg-indigo-900/20 rounded-xl p-3 border border-indigo-100/50 dark:border-indigo-800/30 flex items-start gap-2">
                        <Heart className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300">النية العلاجية لليوم</p>
                            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 leading-relaxed font-medium mt-0.5">
                                "{psychosomaticProtocol.healing_affirmation || 'أنا أسمح لجسدي بالتشافي بأمان.'}"
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

