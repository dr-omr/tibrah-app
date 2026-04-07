import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Zap, Star, Shield, Clock, HeartPulse, UserCheck, Users } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';

const DOCTOR_PHOTO = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69287e726ff0e068617e81b7/9185440e5_omar.jpg';

export default function BentoHero({ onOpenCheckIn }: { onOpenCheckIn: () => void }) {
    return (
        <section className="px-4 mt-3 mb-6">
            <div className="grid grid-cols-2 gap-2.5">
                
                {/* ── Tile 1: Main Doctor Profile (Spans full width top) ── */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="col-span-2 relative overflow-hidden rounded-[28px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-white dark:border-white/[0.08] shadow-[0_8px_30px_rgba(4,47,46,0.06)] p-5"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 rounded-full blur-[60px] pointer-events-none" />
                    
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="relative">
                            <motion.div 
                                className="w-[88px] h-[88px] rounded-[24px] overflow-hidden bg-slate-100 shadow-inner border-[3px] border-white dark:border-slate-800"
                                whileHover={{ scale: 1.05, rotate: -2 }}
                            >
                                <Image src={DOCTOR_PHOTO} alt="د. عمر العماد" width={88} height={88} className="w-full h-full object-cover" priority />
                            </motion.div>
                            <div className="absolute -bottom-1 -right-1 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white dark:border-slate-900 shadow-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                متاح الآن
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                                <div>
                                    <h1 className="text-[20px] font-black text-slate-800 dark:text-white leading-none tracking-tight">د. عمر العماد</h1>
                                    <p className="text-[12px] text-teal-600 dark:text-teal-400 font-bold mt-1">الطب الوظيفي والتكاملي</p>
                                </div>
                                <div className="bg-teal-50 dark:bg-teal-500/10 p-1.5 rounded-xl border border-teal-100 dark:border-teal-500/20">
                                    <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                </div>
                            </div>
                            
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-2.5">
                                طبيب معتمد عالمياً متخصص في علاج جذور الأمراض المزمنة بدلاً من تسكين الأعراض.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* ── Tile 2: Trust Stats ── */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="col-span-1 flex flex-col justify-between rounded-[24px] bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-900/20 dark:to-slate-900 border border-indigo-100/50 dark:border-indigo-500/20 p-4 shadow-sm"
                >
                    <div className="flex items-center gap-1.5 mb-2">
                        <Users className="w-4 h-4 text-indigo-500" />
                        <span className="text-[10px] font-bold text-indigo-600/70 dark:text-indigo-400/80 uppercase">قصص النجاح</span>
                    </div>
                    <div>
                        <span className="block text-[22px] font-black text-slate-800 dark:text-white tabular-nums tracking-tight">300+</span>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">حالة تعافت تماماً</span>
                    </div>
                </motion.div>

                {/* ── Tile 3: AI Capabilities ── */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="col-span-1 flex flex-col justify-between rounded-[24px] bg-gradient-to-br from-teal-50 to-white dark:from-teal-900/20 dark:to-slate-900 border border-teal-100/50 dark:border-teal-500/20 p-4 shadow-sm"
                >
                    <div className="flex items-center gap-1.5 mb-2">
                        <Zap className="w-4 h-4 text-teal-500" />
                        <span className="text-[10px] font-bold text-teal-600/70 dark:text-teal-400/80 uppercase">ذكاء طِبرَا</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-1 mb-0.5">
                            <Star className="w-3.5 h-3.5 text-teal-500 fill-teal-500" />
                            <Star className="w-3.5 h-3.5 text-teal-500 fill-teal-500" />
                            <Star className="w-3.5 h-3.5 text-teal-500 fill-teal-500" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">تحليل طبي متقدم</span>
                    </div>
                </motion.div>

                {/* ── Tile 4: Main Action (Starts Clinical Assessment) ── */}
                <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => { haptic.success(); onOpenCheckIn(); }}
                    whileTap={{ scale: 0.97 }}
                    className="col-span-2 relative overflow-hidden rounded-[24px] bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-4 flex items-center justify-between group shadow-lg"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/20 to-teal-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-[100%] group-hover:translate-x-[100%]" />
                    
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-white/10 dark:bg-slate-900/10 flex items-center justify-center">
                            <HeartPulse className="w-5 h-5 text-teal-400 dark:text-teal-600" />
                        </div>
                        <div className="text-right">
                            <p className="text-[14px] font-extrabold leading-snug">قيّم حالتك الصحية الآن</p>
                            <p className="text-[11px] font-medium opacity-70">يأخذ دقيقتين فقط للبدء بالتشخيص</p>
                        </div>
                    </div>
                    
                    <div className="w-8 h-8 rounded-full bg-white/10 dark:bg-slate-900/10 flex items-center justify-center relative z-10">
                        <span className="text-xl leading-none -mt-1">←</span>
                    </div>
                </motion.button>
            </div>
        </section>
    );
}
