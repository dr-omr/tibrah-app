// components/care-hub/SOSRescueView.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, HeartPulse, Activity, Bell, Droplet, ArrowRight, X } from 'lucide-react';
import { CrisisState, toggleDemoCrisisMode } from '@/lib/crisisEngine';
import BreathingExercise from '@/components/therapy/BreathingExercise';
import { Button } from '@/components/ui/button';
import { haptic } from '@/lib/HapticFeedback';

interface SOSRescueViewProps {
    crisisState: CrisisState;
    onDismiss?: () => void;
}

export default function SOSRescueView({ crisisState, onDismiss }: SOSRescueViewProps) {
    const [activeTask, setActiveTask] = useState<'intro' | 'breathing' | 'frequency' | 'supplement'>('intro');

    const handleTaskClick = (task: 'breathing' | 'frequency' | 'supplement') => {
        haptic.selection();
        setActiveTask(task);
    };

    const isSevere = crisisState.level === 'CRISIS';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            className={`w-full min-h-[85vh] rounded-[40px] overflow-hidden relative shadow-[0_30px_60px_rgba(0,0,0,0.15)] flex flex-col ${
                isSevere 
                    ? 'bg-gradient-to-b from-[#0F172A] to-[#020617] text-white border border-slate-800' 
                    : 'bg-gradient-to-b from-indigo-50 to-[#FDFDFD] dark:from-[#0F172A] dark:to-[#020617] border border-indigo-100 dark:border-indigo-900/50'
            }`}
        >
            {/* Extremely calming atmospheric glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[radial-gradient(circle,_rgba(56,189,248,0.1)_0%,_transparent_60%)] blur-[60px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(129,140,248,0.1)_0%,_transparent_60%)] blur-[80px] pointer-events-none" />
            
            {/* Starry noise overlay */}
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 p-6 sm:p-8 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center shadow-inner ${
                        isSevere 
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                            : 'bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 border border-indigo-500/30'
                    }`}>
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className={`font-black tracking-tight ${isSevere ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                            بروتوكول الإنقاذ العاجل
                        </h2>
                        <p className={`text-xs font-bold uppercase tracking-widest ${isSevere ? 'text-rose-400' : 'text-indigo-500 dark:text-indigo-400'}`}>
                            {isSevere ? 'مستوى 🔴 أزمة حادة' : 'مستوى 🟡 توتر عالي'}
                        </p>
                    </div>
                </div>
                {onDismiss && (
                    <button 
                        onClick={() => { haptic.selection(); onDismiss(); }}
                        className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-md"
                    >
                        <X className={`w-5 h-5 ${isSevere ? 'text-white/70' : 'text-slate-500'}`} />
                    </button>
                )}
            </div>

            {/* Main Content Area */}
            <div className="relative z-10 flex-1 px-6 sm:px-8 pb-8 flex flex-col justify-center">
                
                <AnimatePresence mode="wait">
                    {/* INTRO VIEW */}
                    {activeTask === 'intro' && (
                        <motion.div 
                            key="intro"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex flex-col items-center text-center max-w-sm mx-auto my-auto"
                        >
                            <div className="w-24 h-24 bg-white/5 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-2xl flex items-center justify-center mb-8 relative">
                                <HeartPulse className={`w-12 h-12 ${isSevere ? 'text-rose-400' : 'text-indigo-500'} animate-pulse`} />
                                <div className={`absolute inset-0 border-2 rounded-[32px] animate-ping opacity-20 ${isSevere ? 'border-rose-400' : 'border-indigo-400'}`} />
                            </div>

                            <h3 className={`text-2xl font-black mb-4 leading-tight ${isSevere ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                                أرجوك توقف لحظة...
                            </h3>
                            <p className={`text-base font-medium leading-relaxed mb-10 ${isSevere ? 'text-slate-300' : 'text-slate-600 dark:text-slate-300'}`}>
                                {crisisState.message}
                            </p>

                            <div className="w-full space-y-3">
                                {crisisState.tasks.breathing && (
                                    <button 
                                        onClick={() => handleTaskClick('breathing')}
                                        className="w-full p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md flex items-center justify-between transition-all group active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                                                <Activity className="w-5 h-5" />
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-black ${isSevere ? 'text-white' : 'text-slate-900 dark:text-white'}`}>تمرين التنفس 4-7-8</p>
                                                <p className="text-xs font-bold text-teal-400/80">يخفض الكورتيزول بـ 90 ثانية</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-white rtl:-scale-x-100 transition-colors" />
                                    </button>
                                )}

                                {crisisState.tasks.frequency && (
                                    <button 
                                        onClick={() => handleTaskClick('frequency')}
                                        className="w-full p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md flex items-center justify-between transition-all group active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                                <Bell className="w-5 h-5" />
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-black ${isSevere ? 'text-white' : 'text-slate-900 dark:text-white'}`}>تردد 528Hz الشفائي</p>
                                                <p className="text-xs font-bold text-indigo-400/80">إعادة ضبط الجهاز العصبي</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-white rtl:-scale-x-100 transition-colors" />
                                    </button>
                                )}

                                {crisisState.tasks.supplement && (
                                    <button 
                                        onClick={() => handleTaskClick('supplement')}
                                        className="w-full p-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-md flex items-center justify-between transition-all group active:scale-[0.98]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                                                <Droplet className="w-5 h-5" />
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-black ${isSevere ? 'text-white' : 'text-slate-900 dark:text-white'}`}>تدخل كيميائي سريع</p>
                                                <p className="text-xs font-bold text-amber-400/80">مكمل أو وصفة عشبية</p>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-white/50 group-hover:text-white rtl:-scale-x-100 transition-colors" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* BREATHING VIEW */}
                    {activeTask === 'breathing' && (
                        <motion.div 
                            key="breathing"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col h-full mt-4"
                        >
                            <button 
                                onClick={() => setActiveTask('intro')}
                                className="mb-6 text-sm font-bold text-teal-400 flex items-center gap-1 w-fit"
                            >
                                <ArrowRight className="w-4 h-4 rtl:-scale-x-100" /> عودة للبروتوكول
                            </button>
                            <BreathingExercise onComplete={() => setActiveTask('intro')} />
                        </motion.div>
                    )}

                    {/* FREQUENCY VIEW (MOCK) */}
                    {activeTask === 'frequency' && (
                        <motion.div 
                            key="frequency"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col h-full mt-4"
                        >
                            <button 
                                onClick={() => setActiveTask('intro')}
                                className="mb-6 text-sm font-bold text-indigo-400 flex items-center gap-1 w-fit"
                            >
                                <ArrowRight className="w-4 h-4 rtl:-scale-x-100" /> عودة للبروتوكول
                            </button>
                            
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white/5 backdrop-blur-xl rounded-[40px] border border-white/10">
                                <div className="w-32 h-32 rounded-full bg-indigo-500/20 flex items-center justify-center mb-8 relative">
                                    <Bell className="w-12 h-12 text-indigo-400" />
                                    <div className="absolute inset-0 border border-indigo-500/50 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
                                    <div className="absolute inset-[-20px] border border-indigo-500/20 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }} />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">تردد 528Hz يعمل الآن</h3>
                                <p className="text-slate-400 text-sm font-medium">أغمض عينيك وركز على التردد لمدة 3 دقائق.</p>
                            </div>
                        </motion.div>
                    )}

                    {/* SUPPLEMENT VIEW */}
                    {activeTask === 'supplement' && (
                        <motion.div 
                            key="supplement"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col h-full mt-4"
                        >
                            <button 
                                onClick={() => setActiveTask('intro')}
                                className="mb-6 text-sm font-bold text-amber-400 flex items-center gap-1 w-fit"
                            >
                                <ArrowRight className="w-4 h-4 rtl:-scale-x-100" /> عودة للبروتوكول
                            </button>
                            
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-white/5 backdrop-blur-xl rounded-[40px] border border-white/10">
                                <div className="w-24 h-24 rounded-3xl bg-amber-500/20 flex items-center justify-center mb-6">
                                    <Droplet className="w-12 h-12 text-amber-400" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-4">التدخل المقترح</h3>
                                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 w-full">
                                    <p className="text-lg font-bold text-amber-200">
                                        {crisisState.tasks.supplement}
                                    </p>
                                </div>
                                <p className="text-slate-400 text-sm font-medium mt-6 leading-relaxed">
                                    هذا التدخل السريع مصمم لإيقاف حلقة التوتر الكيميائية في الجسم. قم بالتحضير الفوري.
                                </p>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* Development / Testing Tool - Hidden in production */}
            <div className="absolute bottom-2 left-2 opacity-10 hover:opacity-100 transition-opacity flex gap-2">
                <button 
                    onClick={() => {toggleDemoCrisisMode(); window.location.reload();}} 
                    className="text-[10px] bg-red-500/20 font-mono text-red-200 px-2 py-1 rounded"
                >
                    TOGGLE CRISIS LOGIC
                </button>
            </div>

        </motion.div>
    );
}
