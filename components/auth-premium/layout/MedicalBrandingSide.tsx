import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Users } from 'lucide-react';
import OrbBackdrop from '../visuals/OrbBackdrop';
import GlassRingWidget from '../visuals/GlassRingWidget';
import GlassPulseWidget from '../visuals/GlassPulseWidget';
import GlassStatWidget from '../visuals/GlassStatWidget';

const stagger = (i: number) => ({ delay: 0.15 + i * 0.1 });

export default function MedicalBrandingSide() {
    const stats = useMemo(() => [
        { v: '٢٤K+', l: 'يثقون بنا', icon: Users },
        { v: '٩٩.٩٪', l: 'دقة التحليل', icon: Zap },
        { v: '٣٤٠+', l: 'بروتوكول طبي', icon: Shield },
    ], []);

    const features = useMemo(() => [
        'تحليل ذكي مبني على بياناتك الحقيقية',
        'بروتوكولات مخصصة لكل حالة',
        'متابعة مستمرة ٢٤/٧ بإذن الله',
    ], []);

    return (
        <div className="hidden lg:flex lg:w-[48%] xl:w-[52%] relative overflow-hidden"
             style={{ borderLeft: '1px solid rgba(43,154,137,0.06)' }}>
            {/* Ambient background */}
            <OrbBackdrop />

            {/* Giant watermark letter */}
            <div className="absolute -bottom-16 -right-8 z-0 select-none pointer-events-none" style={{ opacity: 0.02 }}>
                <span className="text-[280px] font-black leading-none" style={{ color: '#101822' }}>ط</span>
            </div>

            {/* Gradient vignette at edges for depth */}
            <div className="absolute inset-0 z-[1] pointer-events-none"
                 style={{
                     background: 'linear-gradient(to right, rgba(251,253,253,0.6) 0%, transparent 20%, transparent 80%, rgba(251,253,253,0.4) 100%)',
                 }} />

            {/* Main content */}
            <div className="relative z-10 w-full h-full flex items-center justify-center p-10 xl:p-14">
                <div className="relative w-full max-w-[540px] h-[650px]">

                    {/* ─── BRAND STATEMENT ─── */}
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="relative z-20"
                    >
                        {/* Eyebrow */}
                        <div className="flex items-center gap-2 mb-4">
                            <motion.div
                                animate={{ width: [20, 30, 20] }}
                                transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                                className="h-[2px] rounded-full"
                                style={{ backgroundColor: '#2B9A89' }}
                            />
                            <span className="text-[8px] font-extrabold uppercase tracking-[0.4em]"
                                  style={{ color: '#2B9A89' }}>
                                Functional Medicine · AI Powered
                            </span>
                        </div>

                        {/* Logo name */}
                        <h1 className="text-[52px] xl:text-[62px] font-black leading-[0.95] tracking-tighter"
                            style={{ color: '#101822' }}>
                            طِبرَا
                        </h1>

                        {/* Tagline */}
                        <p className="mt-5 text-[14px] font-medium leading-[1.95] max-w-[280px]"
                           style={{ color: '#64748B' }}>
                            مش مجرد تطبيق صحي —
                            <br />
                            شريكك اللي يفهم جسمك
                            <br />
                            ويوصل لِما لم يوصل له غيره.
                        </p>

                        {/* Philosophy quote */}
                        <div className="mt-6 flex items-start gap-2.5">
                            <div className="w-[3px] h-10 rounded-full mt-0.5" style={{ backgroundColor: 'rgba(43,154,137,0.3)' }} />
                            <p className="text-[12px] font-medium leading-[1.8] italic"
                               style={{ color: '#94a3b8' }}>
                                "نعالج الجذور، مش الأعراض.
                                <br />
                                لأن صحتك مش رفاهية — حقّك."
                            </p>
                        </div>

                        {/* ─── FEATURE LIST ─── */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={stagger(4)}
                            className="mt-7 space-y-2.5"
                        >
                            {features.map((f, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={stagger(5 + i)}
                                    className="flex items-center gap-2.5"
                                >
                                    <div className="w-[5px] h-[5px] rounded-full flex-shrink-0"
                                         style={{ backgroundColor: '#2B9A89' }} />
                                    <span className="text-[12px] font-medium" style={{ color: '#64748B' }}>
                                        {f}
                                    </span>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>

                    {/* ─── FLOATING GLASS WIDGETS ─── */}
                    <motion.div
                        className="absolute top-[32%] left-[5%] z-10"
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
                    >
                        <GlassStatWidget title="دقة التحليل" targetValue={99.9} subtitle="خوارزمية ذكية" />
                    </motion.div>

                    <motion.div
                        className="absolute bottom-[16%] left-0 z-30"
                        animate={{ y: [0, -12, 0] }}
                        transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut', delay: 1.2 }}
                    >
                        <GlassRingWidget />
                    </motion.div>

                    <motion.div
                        className="absolute top-[44%] right-0 z-20"
                        animate={{ y: [0, 8, 0], rotate: [0, 0.3, 0] }}
                        transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut', delay: 0.6 }}
                    >
                        <GlassPulseWidget />
                    </motion.div>

                    {/* ─── SVG CONNECTION LINES ─── */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" fill="none" style={{ opacity: 0.08 }}>
                        {/* Curved connection */}
                        <path d="M 70 230 C 140 320, 250 360, 430 270" stroke="#2B9A89" strokeWidth="0.8" strokeDasharray="4 6" />
                        {/* Straight connection */}
                        <path d="M 100 460 L 380 220" stroke="#101822" strokeWidth="0.5" strokeDasharray="3 8" />
                        {/* Nodes */}
                        <circle cx="70" cy="230" r="3" fill="#2B9A89" />
                        <circle cx="430" cy="270" r="3" fill="#2B9A89" />
                        <circle cx="100" cy="460" r="2" fill="#101822" opacity="0.5" />
                        <circle cx="380" cy="220" r="2" fill="#101822" opacity="0.5" />
                        {/* Additional subtle grid dots */}
                        {[180, 260, 340].map(x => [250, 350, 450].map(y => (
                            <circle key={`${x}-${y}`} cx={x} cy={y} r="1" fill="#2B9A89" opacity="0.15" />
                        )))}
                    </svg>

                    {/* ─── BOTTOM STATS WITH ICONS ─── */}
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="absolute bottom-0 left-0 right-0 flex gap-6 z-10"
                    >
                        {stats.map((s, i) => (
                            <motion.div
                                key={s.l}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.1 + i * 0.15 }}
                                className="flex items-center gap-2.5"
                            >
                                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                                     style={{ backgroundColor: 'rgba(43,154,137,0.06)' }}>
                                    <s.icon className="w-3.5 h-3.5" style={{ color: '#2B9A89' }} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[16px] font-black leading-none" style={{ color: '#101822' }}>
                                        {s.v}
                                    </span>
                                    <span className="text-[8px] font-bold uppercase tracking-[0.15em] mt-0.5"
                                          style={{ color: '#2B9A89' }}>
                                        {s.l}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
