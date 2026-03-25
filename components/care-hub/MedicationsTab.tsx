// components/care-hub/MedicationsTab.tsx
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Brain, Heart, Pill, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

interface MedicationsTabProps {
    medications: any[];
    psychosomaticProtocol: any;
}

export default function MedicationsTab({ medications, psychosomaticProtocol }: MedicationsTabProps) {
    return (
        <motion.div
            key="medications"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
        >
            {/* ─── Treatment Status (Dual-Dimension) ─── */}
            {medications.length > 0 || psychosomaticProtocol ? (
                <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-5 text-white shadow-lg shadow-violet-500/30 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-1.5 opacity-90 bg-black/20 px-2.5 py-1 rounded-full w-fit mb-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold">البروتوكول العلاجي المزدوج</span>
                        </div>
                        <h2 className="text-[18px] font-black leading-tight mb-2 text-white">الخطة المدمجة (جسدية ونفس-جسدية)</h2>
                        <p className="text-[12px] text-violet-100 leading-relaxed max-w-[90%]">
                            تتضمن خطتك مسارين متوازيين لضمان التشافي الجذري: المسار العضوي (المكملات) والمسار الشعوري (التنظيم العصبي).
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800/80 rounded-3xl p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-violet-400" />
                    </div>
                    <h3 className="text-[15px] font-bold text-slate-800 dark:text-white mb-1">لم يتم تحديد بروتوكول علاجي بعد</h3>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed mb-4 max-w-[280px] mx-auto">
                        احجز جلسة تشخيصية مع د. عمر لوضع خطة علاجية مخصصة لحالتك.
                    </p>
                    <Link href={createPageUrl('BookAppointment')}>
                        <Button className="h-10 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-6 shadow-sm">
                            احجز جلسة تشخيصية
                        </Button>
                    </Link>
                </div>
            )}

            {/* ─── Psychosomatic Track ─── */}
            {psychosomaticProtocol && (
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-3xl p-5 border border-indigo-100 dark:border-indigo-800/30">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                            <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-[15px] font-bold text-indigo-900 dark:text-indigo-100">المسار النفس-جسدي والشعوري</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-2 mb-2">
                                <Heart className="w-4 h-4 text-rose-500" />
                                <h4 className="font-bold text-sm text-slate-800 dark:text-white">التركيز العلاجي الحالي</h4>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                                {psychosomaticProtocol.emotional_diagnostic_pattern}
                            </p>
                        </div>

                        {psychosomaticProtocol.behavioral_contributors && psychosomaticProtocol.behavioral_contributors.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                                <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-2">أهداف المراقبة الذاتية (Somatic Tracking)</h4>
                                <ul className="space-y-2">
                                    {psychosomaticProtocol.behavioral_contributors.map((bc: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                                            <div className="min-w-[4px] h-[4px] disabled rounded-full bg-indigo-400 mt-1.5" />
                                            {bc}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-3 border border-amber-100/50 dark:border-amber-800/20 flex flex-col gap-1.5">
                            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">أجندة الجلسة القادمة — نقاش مقترح مع د.عمر</span>
                            <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                                ما مدى تحسن الارتباط بين ({psychosomaticProtocol.physical_complaint}) والمؤثر الشعوري الذي تم تشخيصه؟
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Prescriptions tailored for this phase ─── */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[15px] font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Pill className="w-5 h-5 text-violet-500" />
                        المسار العضوي (المكملات)
                    </h3>
                    {medications.length > 0 && (
                        <Link href={createPageUrl('Shop')}>
                            <Button size="sm" variant="ghost" className="h-8 text-violet-600 hover:text-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/30 text-[11px] font-bold px-2">
                                تسوق البدائل
                            </Button>
                        </Link>
                    )}
                </div>

                {medications.length > 0 ? (
                    <div className="space-y-3">
                        {/* Clinical Insight */}
                        <div className="bg-emerald-50/80 rounded-2xl p-3.5 border border-emerald-100/50 flex items-start gap-2.5">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            <p className="text-[11px] text-emerald-800 leading-relaxed font-semibold mt-0.5">
                                هذه المكملات تم تحديدها بناءً على جلستك التشخيصية. الالتزام بالجرعات اليومية ضروري لتحقيق أفضل النتائج.
                            </p>
                        </div>

                        {medications.map((med: any) => (
                            <div key={med.id} className="bg-white dark:bg-slate-800/80 rounded-3xl p-4 border border-slate-200/60 dark:border-slate-700/50 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-violet-400 to-purple-500" />
                                <div className="flex items-start gap-3 pl-2">
                                    <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100 transition-colors">
                                        <Pill className="w-6 h-6 text-violet-500" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <p className="text-[14px] font-bold text-slate-800 dark:text-white leading-tight">{med.name}</p>
                                            <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full border border-emerald-100">متوفر بالصيدلية</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-semibold mb-1">{med.dosage} — {med.frequency}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-700/50 border-dashed">
                        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                            <Pill className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-sm font-bold mb-1">لا توجد مكملات محددة</p>
                        <p className="text-slate-400 text-[11px] mb-4 max-w-[200px] mx-auto leading-relaxed">لم يتم إدراج مكملات خاصة بهذه المرحلة بعد.</p>
                        <Link href={createPageUrl('BookAppointment')}>
                            <Button className="h-9 rounded-full bg-slate-800 text-white text-xs font-bold px-5 shadow-sm">
                                احجز جلسة للتقييم
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
