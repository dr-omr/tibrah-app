// components/care-hub/AppointmentsTab.tsx
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, Stethoscope, Clock, Heart, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

interface AppointmentsTabProps {
    appointments: any[];
}

export default function AppointmentsTab({ appointments }: AppointmentsTabProps) {
    return (
        <motion.div
            key="appointments"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
        >
            <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800 dark:text-white">المواعيد</h3>
                <Link href={createPageUrl('BookAppointment')}>
                    <Button size="sm" className="h-9 rounded-full bg-primary text-white text-xs font-semibold">
                        <Plus className="w-3.5 h-3.5 ml-1" />
                        حجز جديد
                    </Button>
                </Link>
            </div>

            {appointments.length > 0 ? (
                <div className="space-y-3">
                    {appointments.map((apt: any) => (
                        <div key={apt.id} className="bg-white dark:bg-slate-800/80 rounded-3xl p-4 border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center flex-shrink-0">
                                    <Stethoscope className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                                        {apt.session_type === 'consultation' ? 'استشارة طب وظيفي' : apt.session_type === 'therapy' ? 'علاج بالترددات' : 'متابعة دورية'}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 font-medium">
                                        <Clock className="w-3 h-3" />
                                        {apt.date} — {apt.time}
                                    </p>
                                    {/* DISPLAY DUAL DIMENSION */}
                                    {(apt.health_concern || apt.emotional_diagnostic || apt.emotional_context) && (
                                        <div className="mt-3 space-y-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 text-[11px]">
                                            {apt.health_concern && (
                                                <div>
                                                    <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">الشكوى الجسدية:</span>
                                                    <p className="text-slate-500 line-clamp-2">{apt.health_concern}</p>
                                                </div>
                                            )}
                                            {(apt.emotional_diagnostic || apt.emotional_context) && (
                                                <div className={apt.health_concern ? 'pt-2 border-t border-slate-200 dark:border-slate-700/50' : ''}>
                                                    <span className="font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1 mb-0.5">
                                                        <Heart className="w-3 h-3" />
                                                        النمط التشخيصي الشعوري:
                                                    </span>
                                                    <p className="text-slate-500 line-clamp-2">
                                                        {apt.emotional_diagnostic ? apt.emotional_diagnostic.emotional_diagnostic_pattern : ''}
                                                        {apt.emotional_diagnostic?.psychosomatic_dimension ? ` — ${apt.emotional_diagnostic.psychosomatic_dimension}` : (!apt.emotional_diagnostic && apt.emotional_context ? apt.emotional_context : '')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${apt.status === 'confirmed'
                                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                                    : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                                    }`}>
                                    {apt.status === 'confirmed' ? 'مؤكد' : 'معلّق'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm font-semibold mb-1">لا توجد مواعيد بعد</p>
                    <p className="text-slate-400 text-xs mb-4">احجز جلستك الأولى مع د. عمر</p>
                    <Link href={createPageUrl('BookAppointment')}>
                        <Button className="h-10 rounded-full bg-primary text-white text-sm font-semibold px-6">
                            <Plus className="w-4 h-4 ml-1" />
                            احجز الآن
                        </Button>
                    </Link>
                </div>
            )}
        </motion.div>
    );
}
