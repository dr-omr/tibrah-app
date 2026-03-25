import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Video, MapPin, Phone, CalendarDays, Timer } from 'lucide-react';

/* ── Types ── */
export type SessionMode = 'video' | 'in-person' | 'whatsapp' | 'phone';

export interface SessionData {
    id: string;
    date: string;      // ISO date e.g. "2026-03-25"
    time: string;       // e.g. "04:00"
    duration: number;   // minutes
    type: string;       // e.g. "followup", "initial"
    mode: SessionMode;
    status: 'confirmed' | 'pending' | 'completed' | 'missed' | 'cancelled';
    meetingUrl?: string;
    notes?: string;
}

/* ── Helpers ── */
const MODE_CONFIG: Record<SessionMode, { icon: React.ElementType; label: string; color: string }> = {
    video:      { icon: Video,  label: 'تطبيق زووم',    color: '#6366f1' },
    'in-person':{ icon: MapPin,  label: 'حضوري بالعيادة', color: '#0d9488' },
    whatsapp:   { icon: Phone,   label: 'واتساب',        color: '#25d366' },
    phone:      { icon: Phone,   label: 'مكالمة هاتفية',  color: '#0ea5e9' },
};

const SESSION_TYPE_LABELS: Record<string, string> = {
    followup: 'متابعة طبية',
    initial:  'استشارة أولية',
    review:   'مراجعة نتائج',
};

/* ── Smart Countdown Hook ── */
function useCountdown(targetDateStr: string) {
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const target = useMemo(() => new Date(targetDateStr), [targetDateStr]);
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isImminent: true, isPast: true, totalMs: diff };

    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    const isImminent = diff < 15 * 60 * 1000; // < 15 min

    return { days, hours, minutes, seconds, isImminent, isPast: false, totalMs: diff };
}

/* ── Countdown Block ── */
function CountdownUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center min-w-[46px]">
            <motion.div
                key={value}
                initial={{ y: -4, opacity: 0.6 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="w-full text-center bg-white dark:bg-slate-700 rounded-xl py-2.5 px-1 shadow-sm border border-slate-200/60 dark:border-slate-600"
            >
                <span className="text-[20px] font-black text-slate-800 dark:text-white tabular-nums leading-none block">
                    {value.toString().padStart(2, '0')}
                </span>
            </motion.div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1.5">{label}</span>
        </div>
    );
}

/* ── Main Component ── */
interface SessionStatusBoardProps {
    session: SessionData;
    hubState: 'scheduled' | 'imminent' | 'completed' | 'missed';
}

export function SessionStatusBoard({ session, hubState }: SessionStatusBoardProps) {
    const targetDateStr = `${session.date}T${session.time || '00:00'}`;
    const countdown = useCountdown(targetDateStr);
    const modeInfo = MODE_CONFIG[session.mode] || MODE_CONFIG.video;
    const ModeIcon = modeInfo.icon;
    const typeLabel = SESSION_TYPE_LABELS[session.type] || session.type || 'استشارة';
    const dateObj = new Date(session.date);

    return (
        <div className="px-4 py-4">
            {/* Status Badge */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black text-teal-700 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1.5 bg-teal-50/80 dark:bg-teal-900/40 border border-teal-100 dark:border-teal-800/50 px-3 py-1.5 rounded-full">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
                    </span>
                    موعدك القادم
                </span>
            </div>

            {/* Session Info Row */}
            <div className="flex items-start gap-3.5 mb-5">
                {/* Calendar mini-card */}
                <div className="w-[56px] h-[64px] rounded-[16px] bg-gradient-to-b from-slate-50 to-white dark:from-slate-700 dark:to-slate-800 flex flex-col items-center justify-center shadow-sm border border-slate-200/60 dark:border-slate-600 overflow-hidden flex-shrink-0 relative">
                    <div className="absolute top-0 inset-x-0 h-[18px] bg-teal-500 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white uppercase leading-none">
                            {dateObj.toLocaleDateString('ar-EG', { month: 'short' })}
                        </span>
                    </div>
                    <span className="text-[22px] font-black text-slate-800 dark:text-white leading-none mt-3">
                        {dateObj.getDate()}
                    </span>
                </div>

                {/* Details */}
                <div className="flex-1 pt-0.5 min-w-0">
                    <h3 className="text-[16px] font-black text-slate-800 dark:text-white leading-tight mb-2">
                        {typeLabel}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <Clock className="w-3.5 h-3.5 text-teal-500" />
                            <span className="text-[12px] font-semibold">{session.time} م • {session.duration} دقيقة</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <ModeIcon className="w-3.5 h-3.5" style={{ color: modeInfo.color }} />
                            <span className="text-[12px] font-semibold">{modeInfo.label}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Countdown Timer */}
            {(hubState === 'scheduled' || hubState === 'imminent') && (
                <div className={`rounded-2xl p-3.5 border transition-colors duration-500 ${
                    countdown.isImminent
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/50'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50'
                }`}>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5 font-bold text-slate-500 dark:text-slate-400 text-[11px]">
                            <Timer className="w-3.5 h-3.5" />
                            <span>{countdown.isImminent ? 'تبدأ قريبًا!' : 'يبدأ خلال'}</span>
                        </div>
                        <div className="flex items-center gap-1.5" dir="ltr">
                            {countdown.days > 0 && (
                                <>
                                    <CountdownUnit value={countdown.days} label="أيام" />
                                    <span className="text-slate-300 dark:text-slate-600 font-bold text-lg -translate-y-2">:</span>
                                </>
                            )}
                            <CountdownUnit value={countdown.hours} label="ساعة" />
                            <span className="text-slate-300 dark:text-slate-600 font-bold text-lg -translate-y-2">:</span>
                            <CountdownUnit value={countdown.minutes} label="دقيقة" />
                            {countdown.isImminent && (
                                <>
                                    <span className="text-emerald-300 dark:text-emerald-600 font-bold text-lg -translate-y-2">:</span>
                                    <CountdownUnit value={countdown.seconds} label="ثانية" />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
