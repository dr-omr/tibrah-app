'use client';
/**
 * HeaderMenu V4 Final — "App Library Ultra"
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Sprint G: Refactored — data + sub-components extracted
 */

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import {
    X, LogIn, LogOut, Crown, HeartPulse, Search,
    Droplets, Moon, Flame, Star, ChevronLeft,
} from 'lucide-react';
import { useHealthDashboard } from '@/hooks/useHealthDashboard';

// Extracted data + sub-components
import { ALL, QUICK, SECTIONS_ORDER, TODAY_GRADIENTS, type AppItem } from './header-menu-data';
import { HealthRing, Section, useTimeCtx } from './HeaderMenuParts';

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════ */
interface Props { isOpen: boolean; onClose: () => void; }

export default function HeaderMenu({ isOpen, onClose }: Props) {
    const { user, signOut } = useAuth();
    const d = useHealthDashboard();
    const [q, setQ] = useState('');
    const tc = useTimeCtx();

    /* Scroll lock */
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    /* Escape */
    useEffect(() => {
        const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', fn);
        return () => window.removeEventListener('keydown', fn);
    }, [onClose]);

    /* Filtered sections */
    const filtered = useMemo(() => {
        const map: Record<string, AppItem[]> = {};
        SECTIONS_ORDER.forEach(s => {
            const hits = q.trim()
                ? ALL.filter(i => i.section === s && (i.label.includes(q) || i.sub.includes(q)))
                : ALL.filter(i => i.section === s);
            if (hits.length) map[s] = hits;
        });
        return map;
    }, [q]);

    const totalHits  = Object.values(filtered).flat().length;
    const totalSecs  = Object.keys(filtered).length;
    const hasResults = totalHits > 0;

    /* Today cards */
    const todayItems = useMemo(() => ALL.filter(i => tc.hrefs.includes(i.href)), [tc]);

    /* Glass card style */
    const glass = {
        background: 'rgba(255,255,255,0.82)',
        border: '1.5px solid rgba(255,255,255,0.92)',
        boxShadow: '0 2px 0 rgba(255,255,255,1) inset, 0 8px 28px rgba(15,23,42,0.06)',
        borderRadius: 20,
        overflow: 'hidden' as const,
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="fixed inset-0 z-[60]"
                        style={{ background: 'rgba(15,23,42,0.38)', backdropFilter: 'blur(14px)' }}
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 360, damping: 38 }}
                        className="fixed top-0 right-0 bottom-0 w-[88vw] max-w-[390px] z-[70] flex flex-col"
                        style={{
                            background: 'rgba(238,249,246,0.97)',
                            backdropFilter: 'blur(56px) saturate(240%)',
                            WebkitBackdropFilter: 'blur(56px) saturate(240%)',
                            borderLeft: '1.5px solid rgba(255,255,255,0.95)',
                            boxShadow: '-28px 0 80px rgba(15,23,42,0.14), inset 1px 0 0 rgba(255,255,255,1)',
                        }}>

                        {/* ── Sticky header */}
                        <div className="flex-shrink-0 pt-5 px-4 pb-3"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.72)', boxShadow: '0 1px 0 rgba(255,255,255,0.96)' }}>
                            <div className="flex items-start justify-between mb-3.5">
                                <div>
                                    <h2 className="text-[20px] font-black text-slate-900 leading-tight">دليل طِبرَا</h2>
                                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                        {SECTIONS_ORDER.length} أقسام · {ALL.length} خدمة طبية
                                    </p>
                                </div>
                                <motion.button whileTap={{ scale: 0.84 }}
                                    onClick={() => { haptic.tap(); onClose(); }}
                                    className="w-9 h-9 rounded-[13px] flex items-center justify-center"
                                    style={{
                                        background: 'rgba(255,255,255,0.80)',
                                        border: '1.5px solid rgba(255,255,255,0.96)',
                                        boxShadow: '0 2px 0 rgba(255,255,255,1) inset, 0 3px 12px rgba(15,23,42,0.08)',
                                    }}>
                                    <X className="w-4 h-4 text-slate-500" />
                                </motion.button>
                            </div>

                            {/* Search */}
                            <div className="flex items-center gap-2.5 px-3.5 h-[40px] rounded-[13px]"
                                style={{
                                    background: 'rgba(255,255,255,0.78)',
                                    border: '1.5px solid rgba(255,255,255,0.94)',
                                    boxShadow: '0 2px 0 rgba(255,255,255,1) inset',
                                }}>
                                <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <input type="text" dir="rtl"
                                    placeholder={`ابحث في ${ALL.length} خدمة...`}
                                    value={q} onChange={e => setQ(e.target.value)}
                                    className="flex-1 text-[12.5px] font-semibold text-slate-700 placeholder-slate-300 bg-transparent outline-none text-right"
                                />
                                <AnimatePresence>
                                    {q && (
                                        <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                            onClick={() => setQ('')}
                                            className="w-4 h-4 rounded-full flex items-center justify-center bg-slate-100 flex-shrink-0">
                                            <X className="w-2.5 h-2.5 text-slate-400" />
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Result count */}
                            <AnimatePresence>
                                {q && (
                                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        className="text-[10px] text-slate-400 font-semibold mt-2 text-right">
                                        {hasResults ? `${totalHits} نتيجة في ${totalSecs} قسم` : `لا توجد نتائج لـ "${q}"`}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ── Scrollable body */}
                        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                            <div className="px-3 pb-16">

                                {/* ════ PROFILE CARD ════ */}
                                {!q && (
                                    <div className="mt-4">
                                        {user ? (
                                            <Link href="/profile" onClick={() => { haptic.tap(); onClose(); }}>
                                                <motion.div whileTap={{ scale: 0.975 }}
                                                    className="relative overflow-hidden rounded-[24px] p-4"
                                                    style={{
                                                        background: 'linear-gradient(145deg,rgba(255,255,255,0.96),rgba(240,252,250,0.92))',
                                                        border: '1.5px solid rgba(255,255,255,0.96)',
                                                        boxShadow: '0 2px 0 rgba(255,255,255,1) inset, 0 12px 40px rgba(13,148,136,0.10)',
                                                    }}>
                                                    <div className="absolute top-px left-6 right-6 h-px" style={{ background: 'rgba(255,255,255,1)' }} />
                                                    <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full pointer-events-none"
                                                        style={{ background: 'radial-gradient(circle,rgba(13,148,136,0.07),transparent 70%)' }} />
                                                    <div className="relative flex items-center gap-4">
                                                        <div className="relative flex-shrink-0" style={{ width: 64, height: 64 }}>
                                                            <HealthRing score={d.healthScore} scoreAr={d.healthScoreAr} size={64} showChip />
                                                            <div className="absolute rounded-full overflow-hidden" style={{ inset: 7, boxShadow: '0 0 0 1px rgba(13,148,136,0.15)' }}>
                                                                {user.photoURL ? (
                                                                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center"
                                                                        style={{ background: 'linear-gradient(135deg,#0D9488,#059669)' }}>
                                                                        <span className="text-white font-black text-lg">{user.name?.charAt(0) || user.email?.charAt(0) || '?'}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <motion.div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white"
                                                                style={{ background: '#22C55E' }}
                                                                animate={{ scale: [1, 1.25, 1] }}
                                                                transition={{ duration: 2.5, repeat: Infinity }} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2">
                                                                <p className="text-[15px] font-black text-slate-900 truncate leading-tight">{user.name || 'المستخدم'}</p>
                                                                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full flex-shrink-0"
                                                                    style={{ background: 'rgba(217,119,6,0.10)', border: '1px solid rgba(217,119,6,0.18)' }}>
                                                                    <Star style={{ width: 9, height: 9, color: '#D97706' }} />
                                                                    <span className="text-[9px] font-black" style={{ color: '#D97706' }}>{d.rewardPoints.toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{user.email}</p>
                                                            <div className="flex items-center gap-1.5 mt-2">
                                                                <span className="text-[8.5px] text-slate-400 font-semibold flex-shrink-0">أهداف</span>
                                                                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
                                                                    <motion.div className="h-full rounded-full"
                                                                        style={{ background: 'linear-gradient(to left,#10B981,#0D9488)' }}
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${d.goalsTotal > 0 ? (d.goalsCompleted / d.goalsTotal) * 100 : 0}%` }}
                                                                        transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }} />
                                                                </div>
                                                                <span className="text-[9px] font-black text-teal-600 flex-shrink-0">{d.goalsAr}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 mt-1.5">
                                                                {[
                                                                    { icon: Flame, val: d.streakAr, color: '#EA580C' },
                                                                    { icon: Droplets, val: d.waterAr, color: '#0891B2' },
                                                                    { icon: Moon, val: d.sleepHoursLabel, color: '#7C3AED' },
                                                                ].map(({ icon: MI, val, color }) => (
                                                                    <div key={color} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-[7px] flex-1"
                                                                        style={{ background: `${color}0C`, border: `1px solid ${color}14` }}>
                                                                        <MI style={{ width: 9, height: 9, color, flexShrink: 0 }} />
                                                                        <span className="text-[8.5px] font-black truncate" style={{ color }}>{val}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 mt-2">
                                                                <span className="text-[8px] text-slate-400 font-semibold flex-shrink-0">رحلتك</span>
                                                                <div className="flex items-center gap-1 flex-0">
                                                                    {d.journeySteps.map((step, i) => (
                                                                        <motion.div key={i} className="rounded-full"
                                                                            initial={{ opacity: 0, scale: 0.5 }}
                                                                            animate={{ opacity: 1, scale: 1 }}
                                                                            transition={{ delay: 0.6 + i * 0.08, type: 'spring', stiffness: 400 }}
                                                                            style={{
                                                                                width: step.status === 'done' ? 16 : step.status === 'current' ? 10 : 6,
                                                                                height: 6, flexShrink: 0,
                                                                                background: step.status === 'done' ? '#0D9488' : step.status === 'current' ? '#34D399' : 'rgba(0,0,0,0.07)',
                                                                            }} />
                                                                    ))}
                                                                </div>
                                                                {d.hasLoggedToday && (
                                                                    <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                                                                        transition={{ delay: 1.1 }}
                                                                        className="mr-auto text-[8px] font-black px-1.5 py-[2px] rounded-full flex-shrink-0"
                                                                        style={{ background: 'rgba(34,197,94,0.12)', color: '#16A34A' }}>
                                                                        ✓ سجّلت اليوم
                                                                    </motion.span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <ChevronLeft className="w-4 h-4 text-slate-300 flex-shrink-0 self-start mt-1" />
                                                    </div>
                                                </motion.div>
                                            </Link>
                                        ) : (
                                            <div className="relative overflow-hidden rounded-[24px] p-5"
                                                style={{ background: 'linear-gradient(135deg,rgba(13,148,136,0.10),rgba(5,150,105,0.06))', border: '1.5px solid rgba(13,148,136,0.18)', boxShadow: '0 2px 0 rgba(255,255,255,0.8) inset' }}>
                                                <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
                                                    style={{ background: 'radial-gradient(circle,rgba(13,148,136,0.10),transparent 70%)', transform: 'translate(40%,-40%)' }} />
                                                <p className="text-[16px] font-black text-slate-900 mb-1">أهلاً بك في طِبرَا 👋</p>
                                                <p className="text-[11px] text-slate-500 mb-4">سجّل دخولك للوصول لكل الخدمات الطبية</p>
                                                <Link href="/login" onClick={() => { haptic.impact(); onClose(); }}>
                                                    <div className="flex items-center justify-center gap-2 py-3 rounded-[14px] font-bold text-[13px] text-white"
                                                        style={{ background: 'linear-gradient(135deg,#0D9488,#059669)', boxShadow: '0 4px 16px rgba(13,148,136,0.28)' }}>
                                                        <LogIn className="w-4 h-4" /> تسجيل الدخول الآن
                                                    </div>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ════ QUICK ACTIONS ════ */}
                                {!q && (
                                    <div className="mt-5">
                                        <p className="text-[10px] font-black text-slate-500 mb-2.5 px-0.5 tracking-wide">⚡ وصول سريع</p>
                                        <div className="grid grid-cols-6 gap-1.5">
                                            {QUICK.map(qa => {
                                                const Icon = qa.icon;
                                                return (
                                                    <Link key={qa.href} href={qa.href}
                                                        onClick={() => { haptic.impact(); uiSounds.tap(); onClose(); }}>
                                                        <motion.div whileTap={{ scale: 0.86 }} className="flex flex-col items-center gap-1.5">
                                                            <div className="w-11 h-11 rounded-[14px] flex items-center justify-center relative overflow-hidden"
                                                                style={{ background: qa.glow, border: `1.5px solid ${qa.color}20`, boxShadow: '0 2px 0 rgba(255,255,255,0.8) inset' }}>
                                                                <div className="absolute top-0 left-1 right-1 h-px" style={{ background: 'rgba(255,255,255,0.75)' }} />
                                                                <Icon style={{ width: 18, height: 18, color: qa.color }} />
                                                            </div>
                                                            <span className="text-[8.5px] font-bold text-slate-500 text-center leading-none">{qa.label}</span>
                                                        </motion.div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* ════ TODAY SUGGESTIONS ════ */}
                                {!q && todayItems.length > 0 && (
                                    <div className="mt-5">
                                        <p className="text-[10px] font-black text-slate-500 mb-2.5 px-0.5 tracking-wide">{tc.label} — مقترحات لك</p>
                                        <div className="flex gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                                            {todayItems.map((item, i) => {
                                                const Icon = item.icon;
                                                return (
                                                    <Link key={item.href} href={item.href} onClick={() => { haptic.tap(); onClose(); }} className="flex-shrink-0">
                                                        <motion.div whileTap={{ scale: 0.94 }}
                                                            className="relative overflow-hidden rounded-[18px] p-3.5"
                                                            style={{ width: 132, background: TODAY_GRADIENTS[i % 3], boxShadow: '0 6px 20px rgba(0,0,0,0.12)' }}>
                                                            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'rgba(255,255,255,0.30)' }} />
                                                            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center mb-2.5"
                                                                style={{ background: 'rgba(255,255,255,0.18)' }}>
                                                                <Icon style={{ width: 16, height: 16, color: 'white' }} />
                                                            </div>
                                                            <p className="text-[12px] font-black text-white leading-tight">{item.label}</p>
                                                            <p className="text-[9px] text-white/60 mt-0.5">{item.sub}</p>
                                                        </motion.div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* ════ PREMIUM BANNER ════ */}
                                {!q && user && (
                                    <Link href="/premium" onClick={() => { haptic.impact(); onClose(); }}>
                                        <motion.div whileTap={{ scale: 0.97 }}
                                            className="mt-5 relative overflow-hidden rounded-[20px] p-4"
                                            style={{ background: 'linear-gradient(135deg,#4F46E5,#7C3AED)', boxShadow: '0 8px 28px rgba(79,70,229,0.25)' }}>
                                            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'rgba(255,255,255,0.25)' }} />
                                            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full"
                                                style={{ background: 'rgba(255,255,255,0.06)', filter: 'blur(20px)' }} />
                                            <div className="relative flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                                                    style={{ background: 'rgba(255,255,255,0.18)' }}>
                                                    <Crown className="w-5 h-5 text-yellow-300" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[13px] font-black text-white leading-tight">طِبرَا+ المميز</p>
                                                    <p className="text-[10px] text-white/60 mt-0.5">اشتراك VIP · برامج حصرية · بدون إعلانات</p>
                                                </div>
                                                <div className="px-3 py-1.5 rounded-[10px] text-[10px] font-black text-indigo-900"
                                                    style={{ background: 'rgba(255,255,255,0.92)' }}>ترقية</div>
                                            </div>
                                        </motion.div>
                                    </Link>
                                )}

                                {/* ════ ALL SECTIONS ════ */}
                                {!hasResults && q ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-16 flex flex-col items-center gap-3">
                                        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.60)' }}>
                                            <Search className="w-7 h-7 text-slate-300" />
                                        </div>
                                        <p className="text-[13px] text-slate-400 font-bold">لا توجد نتائج</p>
                                        <p className="text-[11px] text-slate-300">جرّب كلمة مختلفة</p>
                                    </motion.div>
                                ) : (
                                    SECTIONS_ORDER.map(sk =>
                                        filtered[sk]?.length ? (
                                            <Section key={sk} sk={sk} items={filtered[sk]} onClose={onClose} hl={q || undefined} />
                                        ) : null
                                    )
                                )}

                                {/* ════ SIGN OUT ════ */}
                                {user && !q && (
                                    <motion.button whileTap={{ scale: 0.97 }}
                                        onClick={() => { signOut(); haptic.impact(); onClose(); }}
                                        className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 rounded-[18px] font-bold text-[13px] text-rose-500"
                                        style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(244,63,94,0.14)' }}>
                                        <LogOut className="w-4 h-4" /> تسجيل الخروج
                                    </motion.button>
                                )}

                                {/* ════ FOOTER ════ */}
                                {!q && (
                                    <div className="mt-10 pb-4 text-center">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                                            style={{ background: 'rgba(13,148,136,0.07)', border: '1px solid rgba(13,148,136,0.12)' }}>
                                            <HeartPulse className="w-3.5 h-3.5 text-teal-500" />
                                            <span className="text-[10px] font-bold text-teal-700">طِبرَا — العيادة الرقمية للطب الوظيفي</span>
                                        </div>
                                        <p className="text-[8.5px] text-slate-300 mt-2.5">{ALL.length} خدمة · {SECTIONS_ORDER.length} أقسام · الإصدار ١.٠.٠</p>
                                        <p className="text-[8px] text-slate-200 mt-1">صحتك أولويتنا اليوم وكل يوم ❤️</p>
                                    </div>
                                )}

                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
