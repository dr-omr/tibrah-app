'use client';
/**
 * AppointmentBanner.tsx — طِبرَا Appointment Water Glass Strip
 * ──────────────────────────────────────────────────────────────
 * تذكير الموعد القادم — مائي زجاجي × نبضة حية × عمق حقيقي
 */

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HeartPulse, Calendar, ChevronLeft, Clock } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { STAGGER_ITEM } from '@/lib/tibrah-motion';

const ACCENT = '#0D9488';

export default function AppointmentBanner() {
    // TODO: استبدل بـ useAppointments() hook حقيقي
    const appt = {
        doctorName: 'د. عمر',
        dayAr:      'الثلاثاء ١٥ أبريل',
        time:       '٣:٣٠ مساءً',
        confirmed:  true,
        hoursLeft:  14,
    };

    return (
        <motion.div variants={STAGGER_ITEM} className="mx-4">
            <Link href="/my-appointments" onClick={() => haptic.selection()}>
                <motion.div
                    whileTap={{ scale: 0.968 }}
                    className="relative overflow-hidden flex items-center gap-3.5 px-4 py-3.5 rounded-[22px]"
                    style={{
                        /* ── Water glass ── */
                        background: [
                            'linear-gradient(150deg,',
                            `  ${ACCENT}13 0%,`,
                            '  rgba(255,255,255,0.86) 35%,',
                            '  rgba(255,255,255,0.72) 68%,',
                            '  rgba(5,150,105,0.07) 100%',
                            ')',
                        ].join(''),
                        backdropFilter: 'blur(36px) saturate(1.8) brightness(1.04)',
                        WebkitBackdropFilter: 'blur(36px) saturate(1.8) brightness(1.04)',
                        border: '1px solid rgba(255,255,255,0.72)',
                        borderTop: '1px solid rgba(255,255,255,0.92)',
                        boxShadow: [
                            '0 2px 0 rgba(255,255,255,0.96) inset',
                            `0 -1px 0 ${ACCENT}08 inset`,
                            `0 10px 32px ${ACCENT}12`,
                            `0 3px 12px ${ACCENT}08`,
                            '0 2px 8px rgba(0,0,0,0.05)',
                        ].join(', '),
                    }}
                >
                    {/* ── Liquid shimmer ── */}
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'linear-gradient(110deg, transparent 28%, rgba(255,255,255,0.28) 46%, rgba(255,255,255,0.08) 54%, transparent 72%)',
                        }}
                        animate={{ x: ['-130%', '130%'] }}
                        transition={{ duration: 4.5, repeat: Infinity, repeatDelay: 5, ease: 'easeInOut' }}
                    />

                    {/* ── Bubble highlights ── */}
                    <div className="absolute top-2 right-4 w-2 h-2 rounded-full pointer-events-none"
                        style={{ background: 'rgba(255,255,255,0.55)', filter: 'blur(1px)' }} />
                    <div className="absolute top-3.5 right-7 w-1 h-1 rounded-full pointer-events-none"
                        style={{ background: 'rgba(255,255,255,0.40)' }} />

                    {/* ── Subtle left accent glow (no harsh line) ── */}
                    <div className="absolute top-2 bottom-2 right-0 w-[2.5px] rounded-full pointer-events-none"
                        style={{ background: `linear-gradient(to bottom, ${ACCENT}50, rgba(5,150,105,0.25), transparent 88%)` }} />


                    {/* ── Right ambient pool ── */}
                    <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full pointer-events-none"
                        style={{ background: `radial-gradient(circle, ${ACCENT}16, transparent 70%)`, filter: 'blur(10px)' }} />

                    {/* ── ICON: animated pulse ring ── */}
                    <div className="relative flex-shrink-0">
                        {/* Pulse ring */}
                        <motion.div
                            className="absolute inset-[-5px] rounded-[14px]"
                            style={{ border: `1.5px solid ${ACCENT}30` }}
                            animate={{ scale: [1, 1.15, 1], opacity: [0.7, 0.2, 0.7] }}
                            transition={{ duration: 2.6, repeat: Infinity }}
                        />
                        <div
                            className="relative w-10 h-10 rounded-[13px] flex items-center justify-center"
                            style={{
                                background: `linear-gradient(135deg, ${ACCENT}18, rgba(5,150,105,0.10))`,
                                border: `1.5px solid ${ACCENT}20`,
                                boxShadow: `0 0 16px ${ACCENT}18, 0 1px 0 rgba(255,255,255,0.90) inset`,
                            }}
                        >
                            <HeartPulse style={{ width: 18, height: 18, color: ACCENT }} />
                        </div>
                    </div>

                    {/* ── TEXT ── */}
                    <div className="flex-1 min-w-0 relative z-10">
                        {/* Title */}
                        <p className="text-[13px] font-black text-slate-800 leading-tight truncate">
                            موعدك مع {appt.doctorName}
                        </p>
                        {/* Date + time row */}
                        <div className="flex items-center gap-2 mt-[3px]">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-2.5 h-2.5" style={{ color: ACCENT, opacity: 0.6 }} />
                                <span className="text-[10px] text-slate-400 font-medium">{appt.dayAr}</span>
                            </div>
                            <span className="text-slate-200">·</span>
                            <div className="flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" style={{ color: ACCENT, opacity: 0.6 }} />
                                <span className="text-[10px] text-slate-400 font-medium">{appt.time}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── STATUS + ARROW ── */}
                    <div className="flex items-center gap-2 flex-shrink-0 relative z-10">
                        {appt.confirmed && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                                style={{
                                    background: `${ACCENT}10`,
                                    border: `1px solid ${ACCENT}20`,
                                }}>
                                <motion.div
                                    className="w-1.5 h-1.5 rounded-full"
                                    style={{ background: ACCENT }}
                                    animate={{ opacity: [1, 0.3, 1], scale: [1, 1.3, 1] }}
                                    transition={{ duration: 2.2, repeat: Infinity }}
                                />
                                <span className="text-[9.5px] font-black" style={{ color: ACCENT }}>مؤكد</span>
                            </div>
                        )}
                        <div className="w-6 h-6 rounded-full flex items-center justify-center"
                            style={{ background: `${ACCENT}10` }}>
                            <ChevronLeft className="w-3 h-3" style={{ color: ACCENT, opacity: 0.55 }} />
                        </div>
                    </div>
                </motion.div>
            </Link>
        </motion.div>
    );
}
