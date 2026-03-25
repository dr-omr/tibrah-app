import React, { useState } from 'react';
import Head from 'next/head';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { createPageUrl } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import {
    ArrowRight, Calendar, Clock,
    Plus, MessageCircle, Video, 
    Sparkles, ShieldCheck, Activity, Stethoscope
} from 'lucide-react';

const sessionTypeLabels: Record<string, { label: string, icon: any, color: string }> = {
    'diagnostic': { label: 'جلسة تشخيصية جذرية', icon: Activity, color: 'from-indigo-500 to-purple-600' },
    'followup': { label: 'جلسة متابعة المسار', icon: Stethoscope, color: 'from-teal-500 to-emerald-600' },
    'consultation': { label: 'استشارة سريعة الدقة', icon: Sparkles, color: 'from-amber-400 to-amber-600' },
};

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
    'pending': { bg: 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30', text: 'text-amber-700 dark:text-amber-400', label: 'قيد المراجعة' },
    'confirmed': { bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30', text: 'text-emerald-700 dark:text-emerald-400', label: 'مؤكد' },
    'completed': { bg: 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700', text: 'text-slate-600 dark:text-slate-400', label: 'مكتمل' },
    'cancelled': { bg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30', text: 'text-rose-700 dark:text-rose-400', label: 'ملغي' },
};

export default function MyAppointments() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

    const { data: appointments = [], isLoading } = useQuery({
        queryKey: ['my-appointments', user?.id],
        queryFn: () => db.entities.Appointment.listForUser(user?.id || '', '-created_date'),
        enabled: !!user?.id,
    });

    const upcomingAppointments = appointments.filter((apt: any) => apt.status === 'pending' || apt.status === 'confirmed');
    const pastAppointments = appointments.filter((apt: any) => apt.status === 'completed' || apt.status === 'cancelled');

    const primaryAppointment: any = upcomingAppointments[0];
    const otherUpcoming = upcomingAppointments.slice(1);

    const activeList = activeTab === 'upcoming' ? (primaryAppointment ? otherUpcoming : upcomingAppointments) : pastAppointments;

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#020617] text-slate-800 dark:text-slate-200 font-sans pb-28 selection:bg-teal-500/30">
            <Head>
                <title>طِبرَا | العيادة الرقمية</title>
            </Head>

            {/* ═══ Header ═══ */}
            <header className="sticky top-0 z-50 bg-white/70 dark:bg-[#020617]/70 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 py-4 px-6 flex items-center justify-between">
                <Link href={createPageUrl('Profile')} onClick={() => haptic.selection()}>
                    <button className="w-12 h-12 rounded-full border border-slate-200/80 dark:border-slate-800 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors bg-white/50 dark:bg-transparent shadow-sm">
                        <ArrowRight className="w-6 h-6 text-slate-600 dark:text-slate-400 rtl:-scale-x-100" />
                    </button>
                </Link>
                <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">العيادة الرقمية</h1>
                <Link href={createPageUrl('BookAppointment')} onClick={() => haptic.selection()}>
                    <button className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-500/20 transition-all border border-teal-100 dark:border-teal-500/20 shadow-sm hover:scale-105 active:scale-95">
                        <Plus className="w-6 h-6" />
                    </button>
                </Link>
            </header>

            <main className="px-5 pt-8 max-w-lg mx-auto relative">
                
                {/* Background glow */}
                <div className="absolute top-10 right-0 w-64 h-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
                
                {isLoading ? (
                    <div className="space-y-6">
                        <div className="w-full h-56 rounded-[40px] bg-slate-100 dark:bg-slate-800/50 animate-pulse border border-slate-200 dark:border-slate-800" />
                        <div className="flex bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-1 h-14 animate-pulse" />
                        <div className="w-full h-32 rounded-3xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
                    </div>
                ) : (
                    <>
                        {/* ═══ Ultra-Premium Hero Ticket ═══ */}
                        <AnimatePresence>
                            {primaryAppointment && activeTab === 'upcoming' && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className="mb-10 relative group"
                                >
                                    <h2 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 ml-4">الموعد القادم</h2>
                                    
                                    <div className="relative bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-[40px] p-8 overflow-hidden shadow-[0_20px_40px_rgba(79,70,229,0.15)] dark:shadow-[0_20px_40px_rgba(79,70,229,0.25)] border border-indigo-400/30 group-hover:shadow-[0_20px_60px_rgba(79,70,229,0.2)] transition-shadow">
                                        
                                        {/* Ticket Art */}
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
                                        <div className="absolute bottom-[-20%] left-[-20%] w-48 h-48 bg-purple-500/20 rounded-full blur-2xl" />
                                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />

                                        <div className="relative z-10 flex items-center justify-between mb-8 pb-8 border-b border-white/20 border-dashed">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-[20px] bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner border border-white/10">
                                                    <Video className="w-7 h-7 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-indigo-100 text-xs font-bold mb-1 tracking-wide">جلسة مرئية مؤكدة</p>
                                                    <p className="text-2xl font-black text-white leading-tight">مع د. عمر العماد</p>
                                                </div>
                                            </div>
                                            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                                                <ShieldCheck className="w-6 h-6 text-teal-200" />
                                            </div>
                                        </div>

                                        <div className="relative z-10 grid grid-cols-2 gap-8 mb-10">
                                            <div>
                                                <p className="text-xs font-bold text-indigo-200 mb-1.5 uppercase tracking-wide">التاريخ</p>
                                                <p className="text-xl font-black text-white tracking-tight">{primaryAppointment.date}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-indigo-200 mb-1.5 uppercase tracking-wide">الوقت</p>
                                                <p className="text-xl font-black text-white tracking-tight" dir="ltr">{primaryAppointment.time_slot}</p>
                                            </div>
                                        </div>

                                        <div className="relative z-10">
                                            <button 
                                                onClick={() => { haptic.success(); uiSounds.success(); }}
                                                className="w-full py-5 rounded-[20px] bg-white text-indigo-900 font-black text-base hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-white/80"
                                            >
                                                <Video className="w-5 h-5" /> دخول غرفة العيادة الافتراضية
                                            </button>
                                            <div className="text-center mt-4 text-xs text-indigo-200/80 font-bold tracking-wide flex items-center justify-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" /> متاح قبل الموعد بـ 15 دقيقة
                                            </div>
                                        </div>

                                        {/* Physical Ticket Cutouts */}
                                        <div className="absolute top-[120px] -left-6 w-12 h-12 rounded-full bg-[#FDFDFD] dark:bg-[#020617] shadow-inner border-r border-indigo-400/20" />
                                        <div className="absolute top-[120px] -right-6 w-12 h-12 rounded-full bg-[#FDFDFD] dark:bg-[#020617] shadow-inner border-l border-indigo-400/20" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ═══ Segmented Control ═══ */}
                        {(upcomingAppointments.length > 0 || pastAppointments.length > 0) && (
                            <div className="flex bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-2xl p-1 mb-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                                <button
                                    onClick={() => { haptic.selection(); setActiveTab('upcoming'); }}
                                    className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'upcoming' ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
                                >
                                    قادمة ({upcomingAppointments.length})
                                </button>
                                <button
                                    onClick={() => { haptic.selection(); setActiveTab('past'); }}
                                    className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'past' ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'}`}
                                >
                                    مكتملة ({pastAppointments.length})
                                </button>
                            </div>
                        )}

                        {/* ═══ The List ═══ */}
                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {activeList.map((apt: any, i: number) => (
                                    <AppointmentCard key={apt.id} appointment={apt} index={i} />
                                ))}
                            </AnimatePresence>

                            {activeList.length === 0 && (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="text-center py-20 bg-white/70 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 rounded-[40px] shadow-[0_10px_40px_rgb(0,0,0,0.03)] dark:shadow-none backdrop-blur-xl"
                                >
                                    <div className="w-20 h-20 rounded-[28px] bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6 border border-slate-200 dark:border-slate-700 shadow-inner">
                                        <Calendar className="w-10 h-10 text-slate-400" />
                                    </div>
                                    <h3 className="font-black text-slate-800 dark:text-white mb-2 text-xl">لا توجد مواعيد</h3>
                                    <p className="text-base font-medium text-slate-500 mb-8 max-w-[250px] mx-auto leading-relaxed">
                                        احجز جلستك الأولى وابدأ رحلة التشافي المخصصة لك.
                                    </p>
                                    <Link href={createPageUrl('BookAppointment')} onClick={() => haptic.selection()}>
                                        <button className="px-10 py-4 rounded-[20px] bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-black hover:shadow-xl hover:scale-105 transition-all shadow-teal-600/20 active:scale-95 text-base">
                                            حجز موعد جديد
                                        </button>
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}

function AppointmentCard({ appointment, index }: { appointment: any, index: number }) {
    const status = statusStyles[appointment.status] || statusStyles['pending'];
    const session = sessionTypeLabels[appointment.session_type] || sessionTypeLabels['diagnostic'];
    const Icon = session.icon;
    const isPast = appointment.status === 'completed' || appointment.status === 'cancelled';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white/90 dark:bg-[#0B1121]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-slate-700 rounded-[32px] p-6 transition-all group shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] ${isPast ? 'opacity-80 grayscale-[30%]' : 'hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_20px_40px_rgb(0,0,0,0.3)]'}`}
        >
            <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-4 w-full">
                    <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center shrink-0 border border-white/10 ${isPast ? 'bg-slate-100 dark:bg-slate-800' : `bg-gradient-to-br ${session.color} shadow-lg shadow-indigo-500/20`}`}>
                        <Icon className={`w-6 h-6 ${isPast ? 'text-slate-400' : 'text-white'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-black text-slate-800 dark:text-white text-base truncate pr-2">{session.label}</h3>
                            <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-black tracking-widest border ${status.bg} ${status.text} shrink-0 shadow-sm`}>
                                {status.label}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 font-bold">د. عمر العماد • عن بُعد</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5 bg-slate-50 dark:bg-[#050B1A] rounded-[20px] p-4 border border-slate-100/50 dark:border-slate-800/50">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                        <Calendar className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300">{appointment.date}</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                        <Clock className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300" dir="ltr">{appointment.time_slot}</span>
                </div>
            </div>

            {!isPast && appointment.status === 'confirmed' && (
                <div className="flex gap-3">
                    <button className="flex-1 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-sm font-black transition-colors border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 focus:outline-none shadow-sm">
                        <Video className="w-4 h-4 text-slate-500" /> الرابط الذكي
                    </button>
                    <a
                        href={`https://wa.me/967771447111?text=مرحباً، بخصوص موعدي بتاريخ ${appointment.date}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 flex items-center justify-center transition-colors border border-emerald-200/60 dark:border-emerald-500/20 shrink-0 focus:outline-none shadow-sm hover:scale-105 active:scale-95"
                    >
                        <MessageCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </a>
                </div>
            )}
        </motion.div>
    );
}
