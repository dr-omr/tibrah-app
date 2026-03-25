// components/care-hub/OverviewTab.tsx
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Calendar, FileText, Activity, Stethoscope, Video,
    Sparkles, MessageCircle, ChevronLeft, CheckCircle2, Clock, Zap, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { TodayCarePlan } from '@/components/care-hub/TodayCarePlan';
import AchievementBadges from '@/components/gamification/AchievementBadges';

const quickActions = [
    {
        href: 'MedicalFile',
        icon: FileText,
        iconGradient: 'from-blue-500 to-blue-600',
        iconGlow: 'shadow-blue-500/25',
        title: 'ملفي الطبي',
        subtitle: 'السجل والحساسيات',
        accent: 'border-blue-100 dark:border-blue-800/30',
    },
    {
        href: 'BookAppointment',
        icon: Calendar,
        iconGradient: 'from-teal-500 to-emerald-500',
        iconGlow: 'shadow-teal-500/25',
        title: 'احجز جلسة',
        subtitle: 'تشخيصية أو متابعة',
        accent: 'border-emerald-100 dark:border-emerald-800/30',
    },
    {
        href: 'SymptomAnalysis',
        icon: Stethoscope,
        iconGradient: 'from-violet-500 to-purple-600',
        iconGlow: 'shadow-violet-500/25',
        title: 'فحص الأعراض',
        subtitle: 'تحليل بالذكاء الاصطناعي',
        accent: 'border-purple-100 dark:border-purple-800/30',
    },
    {
        href: 'HealthTracker',
        icon: Activity,
        iconGradient: 'from-orange-500 to-red-500',
        iconGlow: 'shadow-orange-500/25',
        title: 'تتبع صحتي',
        subtitle: 'المزاج والطاقة والنوم',
        accent: 'border-orange-100 dark:border-orange-800/30',
    },
];

interface OverviewTabProps {
    user: any;
    upcomingAppointments: any[];
    psychosomaticProtocol: any;
}

export default function OverviewTab({ user, upcomingAppointments, psychosomaticProtocol }: OverviewTabProps) {
    return (
        <motion.div
            key="overview"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
        >
            {/* ─── NEXT APPOINTMENT — iOS grouped card ─── */}
            <div className="bg-white dark:bg-slate-800/80 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            موعدك القادم
                        </h3>
                        <Link href={createPageUrl('MyAppointments')} className="text-xs text-primary font-semibold flex items-center gap-0.5 hover:underline">
                            عرض الكل
                            <ChevronLeft className="w-3 h-3" />
                        </Link>
                    </div>

                    {upcomingAppointments.length > 0 ? (
                        <div className="bg-slate-50/80 dark:bg-slate-700/30 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-11 h-11 rounded-3xl bg-primary/10 dark:bg-primary/15 flex items-center justify-center flex-shrink-0">
                                    <Stethoscope className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">
                                        {(upcomingAppointments[0] as any).session_type || 'جلسة تشخيصية'}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 font-medium">
                                        <Calendar className="w-3 h-3" />
                                        <span>{(upcomingAppointments[0] as any).date}</span>
                                        {(upcomingAppointments[0] as any).time && <>
                                            <span className="text-slate-300 dark:text-slate-600">|</span>
                                            <Clock className="w-3 h-3" />
                                            <span>{(upcomingAppointments[0] as any).time}</span>
                                        </>}
                                    </p>
                                    {/* Status + preparation hint */}
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                                            <CheckCircle2 className="w-3 h-3" />
                                            مؤكد
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                                            <Video className="w-3 h-3" />
                                            عبر الفيديو
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* Preparation note */}
                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-600/30">
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                                    <Sparkles className="w-3 h-3 text-amber-500" />
                                    جهّز أسئلتك وأي تحاليل سابقة قبل الموعد
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Empty state — encouraging CTA */
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 text-center">
                            <div className="w-14 h-14 mx-auto mb-3 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center">
                                <Calendar className="w-7 h-7 text-slate-400" />
                            </div>
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">لا توجد مواعيد قادمة</p>
                            <p className="text-xs text-slate-400 mb-4">ابدأ رحلتك مع د. عمر بجلسة تشخيصية شاملة</p>
                            <Link href={createPageUrl('BookAppointment')} className="inline-block">
                                <Button className="h-10 rounded-full bg-primary text-white text-sm font-semibold px-6">
                                    احجز جلسة
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── TODAY'S CARE PLAN ─── */}
            <TodayCarePlan userId={user.id} psychosomaticProtocol={psychosomaticProtocol} />

            {/* ─── GAMIFICATION BADGES ─── */}
            <AchievementBadges />

            {/* ─── SESSION AGENDA ─── */}
            {psychosomaticProtocol && (
                <div className="bg-amber-50 dark:bg-amber-900/10 rounded-3xl p-5 border border-amber-100/50 dark:border-amber-800/20 relative overflow-hidden">
                    <div className="absolute -top-4 -left-4 w-16 h-16 bg-amber-400/10 rounded-full blur-xl" />
                    
                    <h3 className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-2 relative z-10">
                        <MessageCircle className="w-4 h-4" />
                        أجندة الجلسة القادمة
                    </h3>
                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-medium relative z-10">
                        سيقوم د. عمر بمناقشة مدى تحسن الارتباط بين ({psychosomaticProtocol.physical_complaint || 'الأعراض الجسدية'}) وبين محفزات ({psychosomaticProtocol.emotional_diagnostic_pattern}). يرجى تدوين أي ملاحظات أو مواقف حدثت لك هذا الأسبوع تتعلق بهذا النمط في دفتر يومياتك.
                    </p>
                </div>
            )}

            {/* ─── QUICK ACTIONS ─── */}
            <div>
                <h3 className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mb-3 px-1">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    إجراءات سريعة
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {quickActions.map((action, i) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                key={i}
                                href={createPageUrl(action.href)}
                                className="bg-white dark:bg-slate-800/80 rounded-3xl p-4 border border-slate-200/60 dark:border-slate-700/50 shadow-sm active:scale-[0.97] transition-transform"
                            >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.iconGradient} flex items-center justify-center mb-2.5`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <h4 className="text-sm font-bold text-slate-800 dark:text-white">{action.title}</h4>
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">{action.subtitle}</p>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* ─── WHATSAPP DIRECT ─── */}
            <a
                href="https://wa.me/967771447111?text=مرحباً%20د.%20عمر"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white dark:bg-slate-800/80 rounded-3xl p-4 border border-slate-200/60 dark:border-slate-700/50 shadow-sm active:scale-[0.98] transition-transform"
            >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-white">تواصل مع د. عمر</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">رسالة مباشرة عبر واتساب</p>
                </div>
                <ChevronLeft className="w-4 h-4 text-green-400 flex-shrink-0" />
            </a>

            {/* ─── MEDICAL DISCLAIMER ─── */}
            <div className="bg-amber-50/80 dark:bg-amber-900/15 rounded-xl p-3 flex gap-2.5 items-start border border-amber-100/50 dark:border-amber-800/20">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed font-medium">
                    هذه الأدوات مساعدة ولا تغني عن الاستشارة الطبية المباشرة. استشر د. عمر للتشخيص والعلاج.
                </p>
            </div>
        </motion.div>
    );
}
