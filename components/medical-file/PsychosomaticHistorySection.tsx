import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { Brain, Activity, Heart, ChevronDown, ChevronUp, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function PsychosomaticHistorySection() {
    const { user } = useAuth();
    const userId = user?.id;
    const [isExpanded, setIsExpanded] = useState(true);

    const { data: records = [], isLoading } = useQuery({
        queryKey: ['psychosomatic-history', userId],
        queryFn: async () => {
             const allRecords = await db.entities.TriageRecord.listForUser(userId || '', '-date', 50);
             // Filter only those that have emotional_diagnostic
             return allRecords.filter((r: any) => r.emotional_diagnostic);
        },
        enabled: !!userId,
    });

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm animate-pulse h-32" />
        );
    }

    if (records.length === 0) return null;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm mt-4">
            <div 
                className="flex items-center justify-between cursor-pointer group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center group-hover:bg-indigo-100 transition-colors border border-indigo-100 dark:border-indigo-800/50">
                        <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800 dark:text-white text-base">سجل الأنماط النفس-جسدية</h3>
                        <p className="text-xs text-slate-500 font-medium">الأبعاد الشعورية المرتبطة بالأعراض الجسدية</p>
                    </div>
                </div>
                <button className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-5 space-y-4">
                            {records.map((record: any, index: number) => {
                                const ed = record.emotional_diagnostic;
                                if (!ed) return null;
                                
                                return (
                                    <div key={record.id || index} className="bg-indigo-50/40 dark:bg-slate-900/50 border border-indigo-100 dark:border-slate-700/50 rounded-2xl p-4">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <Heart className="w-4 h-4 text-rose-500" />
                                                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                                                    {ed.physical_complaint}
                                                </h4>
                                            </div>
                                            <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(record.date), 'dd MMMM yyyy', { locale: ar })}
                                            </span>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 block mb-1">بؤرة تركيز مقترحة للمتابعة:</span>
                                                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-white/60 dark:bg-slate-800/60 p-2.5 rounded-xl border border-white dark:border-slate-700">
                                                    {ed.emotional_diagnostic_pattern}
                                                </p>
                                            </div>
                                            
                                            {ed.psychosomatic_dimension && (
                                                <div>
                                                    <span className="text-[11px] font-bold text-slate-500 block mb-1">السياق المرجعي (البعد الشعوري):</span>
                                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                                        "{ed.psychosomatic_dimension}"
                                                    </p>
                                                </div>
                                            )}

                                            {ed.behavioral_contributors && ed.behavioral_contributors.length > 0 && (
                                                <div className="mt-2">
                                                    <span className="text-[11px] font-bold text-slate-500 block mb-1">أهداف المراقبة الذاتية:</span>
                                                    <ul className="space-y-1">
                                                        {ed.behavioral_contributors.map((bc: string, i: number) => (
                                                            <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                                                                <div className="min-w-[4px] h-[4px] disabled rounded-full bg-indigo-400 mt-1.5" />
                                                                {bc}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {ed.repeated_pattern_flag && (
                                                <div className="mt-3 flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/30">
                                                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                                    <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400 leading-relaxed">
                                                        نمط متكرر مقترح للمتابعة: يلاحظ تكرار هذا العرض الجسدي بشكل دوري استجابةً للنمط الشعوري. <span className="font-extrabold underline decoration-amber-300 dark:decoration-amber-700 underline-offset-2">نقطة نقاش هامة للجلسة القادمة</span> بخصوص المحفزات.
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
