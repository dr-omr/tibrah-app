import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { 
    CalendarCheck, Sparkles, Stethoscope, 
    Pill, FileText, ChevronDown, Activity, ActivitySquare, ShieldAlert, Heart, Brain, Clock, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function CareTimelineSection() {
    const { user } = useAuth();
    const userId = user?.id;
    const [expandedItem, setExpandedItem] = useState<string | null>(null);

    const { data: timelineItems = [], isLoading } = useQuery({
        queryKey: ['integrated-timeline', userId],
        queryFn: async () => {
             const allLogs = await db.entities.DailyLog.listForUser(userId || '');
             const allRecords = await db.entities.TriageRecord.listForUser(userId || '');
             
             const merged = [
                 ...allLogs.map(l => ({ ...l, _model: 'DailyLog' })),
                 ...allRecords.map(r => ({ ...r, _model: 'TriageRecord' }))
             ];
             
             return merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15);
        },
        enabled: !!userId,
    });

    const getIconForType = (item: any) => {
        if (item._model === 'TriageRecord' && item.emotional_diagnostic) return <Brain className="w-5 h-5 text-purple-500" />;
        if (item._model === 'TriageRecord') return <Stethoscope className="w-5 h-5 text-indigo-500" />;
        
        switch(item.type) {
            case 'appointment': return <CalendarCheck className="w-5 h-5 text-teal-500" />;
            case 'prescription': return <Pill className="w-5 h-5 text-rose-500" />;
            case 'lab_result': return <ActivitySquare className="w-5 h-5 text-blue-500" />;
            default: return <Activity className="w-5 h-5 text-slate-400" />;
        }
    };

    const getBgForType = (item: any) => {
        if (item._model === 'TriageRecord' && item.emotional_diagnostic) return 'bg-purple-50 border-purple-100';
        if (item._model === 'TriageRecord') return 'bg-indigo-50 border-indigo-100';
        
        switch(item.type) {
            case 'appointment': return 'bg-teal-50 border-teal-100';
            case 'prescription': return 'bg-rose-50 border-rose-100';
            case 'lab_result': return 'bg-blue-50 border-blue-100';
            default: return 'bg-slate-50 border-slate-100';
        }
    };

    const getTitleForType = (item: any) => {
        if (item._model === 'TriageRecord' && item.emotional_diagnostic) return 'تشخيص نفس-جسدي متكامل';
        if (item._model === 'TriageRecord') return 'تقييم سريري ذكي';
        
        switch(item.type) {
            case 'appointment': return 'استشارة طبية';
            case 'prescription': return 'وصفة علاجية جديدة';
            case 'lab_result': return 'نتائج تحاليل مخبرية';
            default: return 'سجل يوميات مفصل';
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800/90 rounded-[24px] p-5 border border-slate-100 dark:border-slate-700/60 shadow-sm mt-4 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                        <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-slate-800 dark:text-white text-base">السجل الطبي التفاعلي</h3>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold tracking-wide">الربط الزمني بين الأعراض العضوية والأنماط الشعورية</p>
                    </div>
                </div>
            </div>

            <div className="relative pl-3 rtl:pr-3 rtl:pl-0">
                {/* Timeline vertical line */}
                <div className="absolute top-4 bottom-4 right-[23px] w-[2px] bg-gradient-to-b from-indigo-100 via-slate-100 to-transparent dark:from-indigo-900/40 dark:via-slate-800 dark:to-transparent rounded-full" />

                <div className="space-y-6">
                    {isLoading ? (
                        <div className="text-center text-sm text-slate-400 py-8 animate-pulse font-medium">جاري تحميل السجل التكاملي...</div>
                    ) : timelineItems.length === 0 ? (
                        <div className="text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 p-8">
                            <Activity className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm font-bold text-slate-500">خَطُّﻚ الزمني نظيف، لا توجد أحداث صحية مسجلة بعد.</p>
                            <p className="text-xs text-slate-400 mt-1">بادر بإجراء أول تقييم ذكي لتبدأ رحلتك</p>
                        </div>
                    ) : (
                        timelineItems.map((item: any, i: number) => {
                            const isTriage = item._model === 'TriageRecord';
                            const hasPsycho = isTriage && item.emotional_diagnostic;
                            const isExpanded = expandedItem === item.id;
                            
                            let notePreview = '';
                            let highestTriage = '';
                            
                            if (isTriage) {
                                notePreview = hasPsycho 
                                    ? item.emotional_diagnostic.physical_complaint 
                                    : (item.chiefComplaintCategories?.[0] || 'تقييم عام');
                                highestTriage = item.triageLevel?.level || '';
                            } else {
                                notePreview = item.notes || 'سجل صحي روتيني';
                            }

                            return (
                                <motion.div 
                                    key={item.id || i}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1, type: 'spring', stiffness: 300, damping: 25 }}
                                    className="relative pr-12 group"
                                >
                                    {/* Timeline Node */}
                                    <div className={`absolute top-0 right-0 w-[46px] h-[46px] rounded-2xl border-4 border-white dark:border-slate-800 flex items-center justify-center shadow-sm z-10 transition-transform duration-300 group-hover:scale-110 ${getBgForType(item)}`}>
                                        {getIconForType(item)}
                                    </div>

                                    {/* Content Card */}
                                    <div 
                                        onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                                        className={`bg-white dark:bg-slate-900 border transition-all duration-300 rounded-2xl p-4 cursor-pointer shadow-sm
                                            ${isExpanded ? 'border-indigo-200 dark:border-indigo-700/50 shadow-md ring-1 ring-indigo-500/10' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 hover:shadow-md'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1.5">
                                            <div>
                                                <h4 className={`font-extrabold text-sm transition-colors pt-0.5 ${hasPsycho ? 'text-purple-700 dark:text-purple-400' : 'text-slate-800 dark:text-slate-100'}`}>
                                                    {getTitleForType(item)}
                                                </h4>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                    <span className="text-[10px] text-slate-500 font-bold tracking-wide">
                                                        {format(new Date(item.date), 'dd MMMM yyyy - hh:mm a', { locale: ar })}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            {highestTriage && (
                                                <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold shadow-sm flex-shrink-0 ${
                                                    highestTriage === 'emergency' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 
                                                    highestTriage === 'urgent_sameday' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                                    'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                }`}>
                                                    {highestTriage === 'emergency' ? 'طوارئ' : highestTriage === 'urgent_sameday' ? 'عاجل' : 'يومي'}
                                                </span>
                                            )}
                                        </div>
                                        
                                        {!isExpanded && (
                                            <div className="mt-3 flex items-center gap-2 px-1">
                                                {hasPsycho && <Heart className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />}
                                                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate w-full">
                                                    {notePreview}
                                                </p>
                                            </div>
                                        )}

                                        {/* Expanded Integrated Details (Psychosomatic + Triage) */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                                                        {/* Action indicator */}
                                                        <div className="absolute left-6 top-5">
                                                            <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                                                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                                            </div>
                                                        </div>

                                                        {/* Physical symptom block */}
                                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-3 border border-slate-100 dark:border-slate-700/50">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">الأعراض الظاهرية</span>
                                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
                                                                {notePreview}
                                                            </p>
                                                        </div>

                                                        {/* Emotional diagnostic block */}
                                                        {hasPsycho && (
                                                            <div className="space-y-3">
                                                                <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-xl p-3 border border-purple-100 dark:border-purple-800/30">
                                                                    <div className="flex items-center gap-1.5 mb-1.5">
                                                                        <Brain className="w-3.5 h-3.5 text-purple-500" />
                                                                        <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">التشخيص الشعوري المرجعي</span>
                                                                    </div>
                                                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-relaxed">
                                                                        {item.emotional_diagnostic.emotional_diagnostic_pattern}
                                                                    </p>
                                                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                                                                        {item.emotional_diagnostic.psychosomatic_dimension}
                                                                    </p>
                                                                </div>

                                                                {item.emotional_diagnostic.repeated_pattern_flag && (
                                                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-200 dark:border-amber-800/30 flex items-start gap-2 mt-3">
                                                                        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                                                                        <div>
                                                                            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-500 block mb-0.5">تنبيه نمط متكرر</span>
                                                                            <p className="text-[10px] font-medium text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                                                                                يلاحظ تكرار هذا العرض الجسدي بشكل دوري استجابةً للنمط الشعوري. يجب نقاش المسببات.
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        
                                        {!isExpanded && (
                                            <div className="absolute left-6 top-5">
                                                <div className="w-6 h-6 rounded-full bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                                                    <ChevronDown className="w-3 h-3 text-slate-400" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )
                        })
                    )}
                </div>
            </div>
            
            {timelineItems.length > 0 && (
                <button className="w-full mt-8 py-3.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors flex justify-center items-center gap-2 group shadow-sm">
                    تحميل المزيد من السجلات
                    <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5 text-slate-400" />
                </button>
            )}
        </div>
    );
}
