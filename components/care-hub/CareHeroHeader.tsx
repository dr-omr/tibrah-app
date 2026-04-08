// components/care-hub/CareHeroHeader.tsx — V2 "Premium Care Command"
// Stunning hero with animated particles, multi-ring score,
// next-appointment countdown, and doctor presence card.

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, Bell, MessageCircle, Clock } from 'lucide-react';
import { CT, SESSION_LABELS } from './care-tokens';
import { SPRING_BOUNCY } from '@/lib/tibrah-motion';

interface CareHeroHeaderProps {
    user:             any;
    careScore:        number;
    nextAppointment?: any;
    missedMeds?:      number;
    onBellPress?:     () => void;
}

/* ─── Triple ring system ─────────────────────────────────────── */
function CareScoreRings({ score }: { score: number }) {
    const rings = [
        { r: 34, stroke: 6,   color: 'rgba(255,255,255,0.90)', pct: score / 100 },
        { r: 25, stroke: 4.5, color: 'rgba(255,255,255,0.45)', pct: Math.min((score + 15) / 100, 1) },
        { r: 16, stroke: 3.5, color: 'rgba(255,255,255,0.25)', pct: Math.min((score + 30) / 100, 1) },
    ];
    const sz = 84;

    return (
        <div className="relative flex-shrink-0" style={{ width: sz, height: sz }}>
            <svg width={sz} height={sz} style={{ transform: 'rotate(-90deg)' }}>
                {rings.map(({ r, stroke, color, pct }, i) => {
                    const circ = 2 * Math.PI * r;
                    return (
                        <React.Fragment key={i}>
                            <circle cx={sz / 2} cy={sz / 2} r={r} fill="none"
                                stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} />
                            <motion.circle cx={sz / 2} cy={sz / 2} r={r} fill="none"
                                stroke={color} strokeWidth={stroke} strokeLinecap="round"
                                strokeDasharray={circ}
                                initial={{ strokeDashoffset: circ }}
                                animate={{ strokeDashoffset: circ - pct * circ }}
                                transition={{ duration: 1.2 + i * 0.15, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.1 }}
                                style={{ filter: i === 0 ? 'drop-shadow(0 0 5px rgba(255,255,255,0.50))' : 'none' }}
                            />
                        </React.Fragment>
                    );
                })}
            </svg>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0">
                <motion.span
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, ...SPRING_BOUNCY }}
                    className="text-[22px] font-black text-white leading-none">{score}</motion.span>
                <span className="text-[8px] text-white/60 font-bold">نقطة</span>
            </div>
        </div>
    );
}

/* ─── Appointment countdown strip ───────────────────────────── */
function NextAptStrip({ apt }: { apt: any }) {
    const days = useMemo(() => {
        if (!apt?.date) return null;
        return Math.ceil((new Date(apt.date).getTime() - Date.now()) / 86400000);
    }, [apt]);

    if (!apt || days === null || days < 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="mt-3 flex items-center gap-3 rounded-[16px] p-2.5"
            style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.22)' }}>
            <div className="w-8 h-8 rounded-[10px] bg-white/20 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[9px] text-white/55 font-bold uppercase tracking-widest">موعدك القادم</p>
                <p className="text-[11.5px] font-black text-white truncate mt-0.5">
                    {SESSION_LABELS[apt.session_type] || SESSION_LABELS.default}
                </p>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center">
                <span className="text-[22px] font-black text-white leading-none">{days}</span>
                <span className="text-[8px] text-white/55">يوم</span>
            </div>
        </motion.div>
    );
}

/* ─── Doctor presence card ───────────────────────────────────── */
function DoctorPresence() {
    return (
        <motion.a
            href="https://wa.me/967771447111"
            target="_blank" rel="noopener noreferrer"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-2 flex items-center gap-2 rounded-[12px] px-3 py-2"
            style={{ background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.16)' }}>
            <div className="relative">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-[14px]">👨‍⚕️</span>
                </div>
                <motion.div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white/40"
                    style={{ background: '#22c55e' }}
                    animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-white truncate">د. عمر العماد</p>
                <p className="text-[8.5px] text-white/55">متاح • ردّ خلال ساعات</p>
            </div>
            <MessageCircle className="w-3.5 h-3.5 text-white/50 flex-shrink-0" />
        </motion.a>
    );
}

/* ════════════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════════════ */
export function CareHeroHeader({ user, careScore, nextAppointment, missedMeds = 0, onBellPress }: CareHeroHeaderProps) {
    const hour     = new Date().getHours();
    const greeting = hour < 12 ? 'صباح النور' : hour < 17 ? 'أهلاً بك' : 'مساء الخير';
    const name     = user?.name?.split(' ')[0] || 'صديقي';

    const label    = careScore >= 80 ? 'ممتاز 🌟' : careScore >= 60 ? 'جيد 👍' : 'في التطوّر 📈';

    return (
        <div className="relative mx-4 overflow-hidden rounded-[28px]"
            style={{
                background: `linear-gradient(145deg, ${CT.teal.dark}, ${CT.teal.c} 55%, ${CT.teal.light})`,
                boxShadow: `0 20px 60px ${CT.teal.glow}`,
                minHeight: 190,
            }}>

            {/* Animated background orbs */}
            {[
                { w: 160, h: 160, x: '80%', y: '-30%', color: 'white',     opacity: 0.08 },
                { w: 100, h: 100, x: '-10%', y: '60%', color: CT.soul.c,  opacity: 0.18 },
                { w:  80, h:  80, x: '40%', y: '80%',  color: CT.warm.c,  opacity: 0.10 },
            ].map((orb, i) => (
                <motion.div key={i}
                    className="absolute rounded-full blur-3xl pointer-events-none"
                    style={{
                        width: orb.w, height: orb.h,
                        left: orb.x, top: orb.y,
                        background: orb.color,
                        opacity: orb.opacity,
                    }}
                    animate={{ x: [0, 10, -5, 0], y: [0, -8, 4, 0] }}
                    transition={{ duration: 6 + i * 2, repeat: Infinity, ease: 'easeInOut', delay: i }}
                />
            ))}

            <div className="relative p-5">
                {/* Top: greeting + bell + rings */}
                <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                        <motion.p initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            className="text-[10px] text-white/55 font-semibold">{greeting}</motion.p>
                        <motion.h1 initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.07 }}
                            className="text-[24px] font-black text-white leading-tight mt-0.5">{name} 👋</motion.h1>
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                            className="inline-block text-[10px] font-bold text-white/65 mt-1 px-2.5 py-1 rounded-full"
                            style={{ background: 'rgba(255,255,255,0.14)' }}>
                            {label}
                        </motion.span>
                    </div>

                    {/* Bell + Rings column */}
                    <div className="flex flex-col items-center gap-2">
                        <motion.button whileTap={{ scale: 0.86 }} onClick={onBellPress}
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.18)' }}>
                            <div className="relative">
                                <Bell className="w-3.5 h-3.5 text-white" />
                                {missedMeds > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full text-[7px] font-black text-white flex items-center justify-center">
                                        {missedMeds}
                                    </span>
                                )}
                            </div>
                        </motion.button>
                        <CareScoreRings score={careScore} />
                    </div>
                </div>

                {/* Next appointment + doctor card */}
                <NextAptStrip apt={nextAppointment} />
                <DoctorPresence />
            </div>
        </div>
    );
}
