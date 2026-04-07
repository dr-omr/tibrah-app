import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, MessageCircle, ArrowLeft, Heart, Brain, HeartPulse, Sparkles } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';

/* ═══════════════════════════════════════
   SCROLL REVEAL
   ═══════════════════════════════════════ */
export function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ type: 'spring' as const, stiffness: 350, damping: 25, delay }}
        >
            {children}
        </motion.div>
    );
}

/* ═══════════════════════════════════════
   ZONE DIVIDER
   ═══════════════════════════════════════ */
export function ZoneDivider({ label, icon: Icon }: { label?: string; icon?: LucideIcon } = {}) {
    return (
        <div className="px-5 my-4">
            <div className="relative">
                <div className="h-[1px] bg-gradient-to-r from-transparent via-slate-200/60 dark:via-slate-700/60 to-transparent" />
                {label && (
                    <span className="absolute left-1/2 -translate-x-1/2 -top-[9px] bg-[#F7FAFA] dark:bg-[#080D13] px-3 py-0.5 rounded-full text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase tracking-widest flex items-center gap-1.5">
                        {Icon && <Icon className="w-2.5 h-2.5" />}
                        {label}
                    </span>
                )}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════
   SKELETON CARD — حالة loading راقية
   ═══════════════════════════════════════════════ */
export function SkeletonCard({ h = 120, noMargin = false }: { h?: number; noMargin?: boolean }) {
    return (
        <div
            className={`rounded-[24px] overflow-hidden ${noMargin ? '' : 'mx-4'}`}
            style={{ height: h, background: 'rgba(0,0,0,0.04)' }}
        >
            <motion.div
                className="h-full w-full"
                style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
            />
        </div>
    );
}

/* ═══════════════════════════════════════════════
   STATS ROW — للزوار: أرقام حية تبني الثقة
   ═══════════════════════════════════════════════ */
export function AnimatedStat({ value, label, color, delay }: {
    value: string; label: string; color: string; delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay, type: 'spring', stiffness: 400, damping: 24 }}
            className="flex flex-col items-center gap-1 flex-1"
        >
            <span className="text-[22px] font-black tracking-tight leading-none" style={{ color }}>{value}</span>
            <span className="text-[11px] font-bold text-slate-400 text-center leading-tight">{label}</span>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════
   WHATSAPP CTA BADGE — بديل حقيقي لـ LiveAvailability
   ═══════════════════════════════════════════════ */
export function LiveAvailabilityBadge() {
    const WA_URL = "https://wa.me/967771447111?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%AF.%20%D8%B9%D9%85%D8%B1%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1";

    return (
        <motion.a
            href={WA_URL}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            whileTap={{ scale: 0.97 }}
            className="mx-4 block"
            onClick={() => { haptic.impact(); uiSounds.navigate(); }}
        >
            <div className="flex items-center justify-between px-4 py-3.5 rounded-[18px] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/80 dark:border-emerald-500/20">
                <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0 w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center shadow-sm shadow-green-500/20">
                        <MessageCircle className="w-4.5 h-4.5 text-white" />
                        <motion.div
                            className="absolute inset-0 rounded-xl border-2 border-green-400"
                            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ duration: 2.2, repeat: Infinity }}
                        />
                    </div>
                    <div>
                        <p className="text-[13px] font-bold text-emerald-700 dark:text-emerald-400">اسأل الدكتور مباشرة الآن</p>
                        <p className="text-[11px] text-emerald-600/70 dark:text-emerald-500/70">رد خلال دقيقتين عبر واتساب ✓</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5">
                    <motion.div
                        className="w-2 h-2 rounded-full bg-emerald-500"
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.8, repeat: Infinity }}
                    />
                    <ArrowLeft className="w-4 h-4 text-emerald-500" />
                </div>
            </div>
        </motion.a>
    );
}

/* ═══════════════════════════════════════
   SECTION HEADER
   ═══════════════════════════════════════ */
export function SectionHeader({ title, subtitle, Icon, accentColor, count }: { title: string; subtitle?: string; Icon?: LucideIcon; accentColor?: string; count?: number }) {
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ type: 'spring', stiffness: 350, damping: 25 }} className="px-5 mb-3">
            <div className="flex items-center gap-2.5">
                {Icon && (
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-sm" style={{ background: `${accentColor || 'var(--primary)'}15` }}>
                        <Icon className="w-4.5 h-4.5" style={{ color: accentColor || 'var(--primary)' }} />
                    </div>
                )}
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-[16px] font-extrabold text-slate-800 dark:text-white">{title}</h2>
                        {count !== undefined && <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400">{count}</span>}
                    </div>
                    {subtitle && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-semibold">{subtitle}</p>}
                </div>
            </div>
        </motion.div>
    );
}

/* ═══════════════════════════════════════
   DAILY MOTIVATION
   ═══════════════════════════════════════ */
export function DailyMotivation() {
    const tips = [
        { text: 'كل خطوة صغيرة نحو صحتك تصنع فرق كبير على المدى البعيد', icon: Sparkles, gradient: 'from-violet-500 to-indigo-600' },
        { text: 'جسمك يقدر يتعافى — بس يحتاج منك الالتزام والصبر', icon: Heart, gradient: 'from-rose-500 to-pink-600' },
        { text: 'الطب الوظيفي يعالج السبب الحقيقي، مش بس الأعراض', icon: Brain, gradient: 'from-teal-500 to-emerald-600' },
        { text: 'صحتك النفسية والجسدية مرتبطين — اهتم بالاثنين', icon: HeartPulse, gradient: 'from-amber-500 to-orange-600' },
    ];
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const tip = tips[dayOfYear % tips.length];
    const TipIcon = tip.icon;

    return (
        <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="px-5">
            <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${tip.gradient} p-4 shadow-lg`}>
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl bg-white/10" />
                <div className="absolute bottom-0 left-0 w-20 h-20 rounded-full blur-2xl bg-white/5" />
                <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
                <div className="relative z-10 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                        <TipIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1.5">إلهام اليوم</p>
                        <p className="text-[13px] text-white font-bold leading-relaxed">{tip.text}</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
