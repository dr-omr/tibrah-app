// components/admin-v2/modules/protocols/ProtocolObservabilityPage.tsx
// ═══════════════════════════════════════════════════════════════════
// TIBRAH Admin — Protocol Observability Dashboard (Sprint 6)
// ═══════════════════════════════════════════════════════════════════
//
// يقرأ من localStorage ويعرض:
//   - البروتوكولات المبدوءة + عدد المستخدمين (محلياً)
//   - معدّل الإكمال (7 أيام / 4-6 / 1-3)
//   - نقاط الـ Abandonment
//   - حالات الـ Handoff
//   - أكثر الـ Subdomains استخداماً
//
// ملاحظة: هذه اللوحة تعرض بيانات محلية خاصة بهذه الجلسة/المتصفح
// للاختبار الحالي.
// ═══════════════════════════════════════════════════════════════════

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ActivitySquare, TrendingUp, AlertCircle, Calendar, ArrowUpRight } from 'lucide-react';
import { getAllRegisteredIds, getRegisteredProtocol } from '@/lib/protocol-registry';
import { getProtocol } from '@/lib/protocol-engine';

/* ── Types ──────────────────────────────────────────────────── */
interface ProtocolStat {
    subdomainId: string;
    arabicTitle: string;
    started: number;
    completed: number;
    abandonedAt: Record<number, number>; // day -> count
    handoffs: Record<string, number>;
    avgAdherence: number | null;
}

/* ── Read all plan data from localStorage ──────────────────── */
function readProtocolStats(): ProtocolStat[] {
    if (typeof window === 'undefined') return [];

    const ids = getAllRegisteredIds();
    // Also include Wave 1 from protocol-engine
    const allIds = Array.from(new Set([
        ...ids,
        'sleep', 'anxiety_arousal', 'energy_fatigue',
    ]));

    const stats: ProtocolStat[] = [];

    for (const sid of allIds) {
        const proto = getRegisteredProtocol(sid) ?? getProtocol(sid);
        if (!proto) continue;

        let started      = 0;
        let completed    = 0;
        const abandonedAt: Record<number, number>  = {};
        const handoffs: Record<string, number>     = {};
        let totalAdherence = 0;
        let adherenceCount = 0;

        // Scan localStorage keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i) ?? '';

            // Plan keys: tibrah_care_plan_* (active plan)
            if (key === 'tibrah_active_care_plan') {
                try {
                    const plan = JSON.parse(localStorage.getItem(key) ?? '{}');
                    if (plan?.routing?.primary_subdomain === sid) {
                        started++;
                        // Check progress
                        const dayKey = `tibrah_protocol_day_${plan.createdAt}`;
                        const day = parseInt(localStorage.getItem(dayKey) ?? '1');
                        const totalDays = proto.totalDays ?? 7;
                        if (day >= totalDays) completed++;
                        else if (day > 1) {
                            abandonedAt[day] = (abandonedAt[day] ?? 0) + 1;
                        }
                    }
                } catch { /* ignore */ }
            }

            // Outcome keys: tibrah_day_outcome_*
            if (key.startsWith('tibrah_day_outcome_') && key.includes(sid)) {
                try {
                    const o = JSON.parse(localStorage.getItem(key) ?? '{}');
                    if (o.adherenceCompleted !== undefined) {
                        totalAdherence += o.adherenceCompleted ? 100 : 0;
                        adherenceCount++;
                    }
                } catch { /* ignore */ }
            }

            // Handoff events: tibrah_handoff_*
            if (key.startsWith('tibrah_handoff_') && key.includes(sid)) {
                try {
                    const h = localStorage.getItem(key) ?? '';
                    handoffs[h] = (handoffs[h] ?? 0) + 1;
                } catch { /* ignore */ }
            }
        }

        stats.push({
            subdomainId:  sid,
            arabicTitle:  proto.arabicTitle,
            started,
            completed,
            abandonedAt,
            handoffs,
            avgAdherence: adherenceCount > 0 ? Math.round(totalAdherence / adherenceCount) : null,
        });
    }

    // Sort by most started
    return stats.sort((a, b) => b.started - a.started);
}

/* ── Mini bar component ─────────────────────────────────────── */
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div className="flex items-center gap-2 flex-1">
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="h-full rounded-full"
                    style={{ background: color }}
                />
            </div>
            <span className="text-[10px] font-bold text-white/40 w-6 text-left">{value}</span>
        </div>
    );
}

/* ── Stat card ──────────────────────────────────────────────── */
function StatCard({ title, value, sub, color, icon: Icon }: {
    title: string;
    value: string | number;
    sub?: string;
    color: string;
    icon: React.ElementType;
}) {
    return (
        <div className="rounded-[16px] p-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${color}15` }}>
                    <Icon style={{ width: 14, height: 14, color }} />
                </div>
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{title}</span>
            </div>
            <p className="text-[26px] font-black text-white leading-none">{value}</p>
            {sub && <p className="text-[10px] text-white/30 font-medium mt-1">{sub}</p>}
        </div>
    );
}

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════ */
export default function ProtocolObservabilityPage() {
    const stats = useMemo(() => readProtocolStats(), []);

    const totalStarted   = stats.reduce((s, p) => s + p.started, 0);
    const totalCompleted = stats.reduce((s, p) => s + p.completed, 0);
    const completionRate = totalStarted > 0 ? Math.round((totalCompleted / totalStarted) * 100) : 0;

    const allHandoffs: Record<string, number> = {};
    for (const s of stats) {
        for (const [k, v] of Object.entries(s.handoffs)) {
            allHandoffs[k] = (allHandoffs[k] ?? 0) + v;
        }
    }

    const maxStarted = Math.max(...stats.map(s => s.started), 1);

    return (
        <div dir="rtl" className="p-6 space-y-6 min-h-screen"
            style={{ background: '#080D13' }}>

            {/* ── Header ── */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-[22px] font-black text-white">مراقبة البروتوكولات</h1>
                    <p className="text-[12px] text-white/40 font-medium mt-1">
                        رؤية شاملة: البداية · الإكمال · التخلي · الإحالة
                    </p>
                </div>
                {/* Local data note — هادئة جداً */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
                    <span className="text-[8.5px] text-white/25 font-medium">
                        بيانات محلية — جلسة المتصفح الحالية
                    </span>
                </div>
            </div>

            {/* ── Summary stats ── */}
            <div className="grid grid-cols-2 gap-3">
                <StatCard title="بروتوكولات مبدوءة" value={totalStarted}
                    sub={`${stats.filter(s => s.started > 0).length} أنواع مختلفة`}
                    color="#00B7EB" icon={ActivitySquare} />
                <StatCard title="معدّل الإكمال" value={`${completionRate}%`}
                    sub={`${totalCompleted} مكتملة من ${totalStarted}`}
                    color="#00C88C" icon={TrendingUp} />
            </div>

            {/* ── Protocol breakdown ── */}
            <div>
                <h2 className="text-[11px] font-black text-white/50 uppercase tracking-widest mb-3">
                    توزيع البروتوكولات
                </h2>
                <div className="space-y-2">
                    {stats.map((s, i) => (
                        <motion.div
                            key={s.subdomainId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-[12px]"
                            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-white/80 truncate">{s.arabicTitle}</p>
                                <p className="text-[9px] text-white/30 font-medium">{s.subdomainId}</p>
                            </div>
                            <MiniBar value={s.started} max={maxStarted} color="#00B7EB" />
                            {s.completed > 0 && (
                                <span className="text-[9px] font-bold text-emerald-400/60 flex-shrink-0">
                                    ✓{s.completed}
                                </span>
                            )}
                        </motion.div>
                    ))}
                    {stats.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-[13px] text-white/25 font-medium">
                                لا بيانات بعد في هذا المتصفح
                            </p>
                            <p className="text-[11px] text-white/15 mt-1">
                                ابدأ تقييماً وخطة لترى البيانات هنا
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Abandonment points ── */}
            {stats.some(s => Object.keys(s.abandonedAt).length > 0) && (
                <div>
                    <h2 className="text-[11px] font-black text-white/50 uppercase tracking-widest mb-3">
                        نقاط التوقف
                    </h2>
                    <div className="space-y-2">
                        {stats
                            .filter(s => Object.keys(s.abandonedAt).length > 0)
                            .map(s => (
                                Object.entries(s.abandonedAt).map(([day, count]) => (
                                    <div key={`${s.subdomainId}-${day}`}
                                        className="flex items-center gap-3 px-3 py-2 rounded-[10px]"
                                        style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.10)' }}>
                                        <AlertCircle style={{ width: 13, height: 13, color: '#EF4444', opacity: 0.6 }} />
                                        <p className="text-[10.5px] text-white/60 flex-1">
                                            {s.arabicTitle} — توقف عند اليوم {day}
                                        </p>
                                        <span className="text-[10px] font-black text-red-400/70">{count}×</span>
                                    </div>
                                ))
                            ))
                        }
                    </div>
                </div>
            )}

            {/* ── Handoff states ── */}
            {Object.keys(allHandoffs).length > 0 && (
                <div>
                    <h2 className="text-[11px] font-black text-white/50 uppercase tracking-widest mb-3">
                        حالات الإحالة
                    </h2>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(allHandoffs).sort(([,a],[,b]) => b - a).map(([state, count]) => {
                            const labels: Record<string, { arabic: string; color: string; emoji: string }> = {
                                continue:            { arabic: 'استمرار', color: '#00C88C', emoji: '📈' },
                                repeat_today_gently: { arabic: 'إعادة بلطف', color: '#F59E0B', emoji: '🔄' },
                                reassess_now:        { arabic: 'إعادة تقييم', color: '#6366F1', emoji: '🔍' },
                                book_session:        { arabic: 'حجز جلسة', color: '#EF4444', emoji: '📅' },
                            };
                            const info = labels[state] ?? { arabic: state, color: '#64748B', emoji: '•' };
                            return (
                                <div key={state}
                                    className="px-3 py-2.5 rounded-[12px] flex items-center gap-2"
                                    style={{ background: `${info.color}08`, border: `1px solid ${info.color}18` }}>
                                    <span className="text-[14px]">{info.emoji}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-white/70">{info.arabic}</p>
                                    </div>
                                    <span className="text-[14px] font-black"
                                        style={{ color: info.color }}>{count}×</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Top subdomains ── */}
            <div>
                <h2 className="text-[11px] font-black text-white/50 uppercase tracking-widest mb-3">
                    أكثر الحالات استخداماً
                </h2>
                <div className="space-y-1.5">
                    {stats.slice(0, 5).map((s, i) => (
                        <div key={s.subdomainId}
                            className="flex items-center gap-3 px-3 py-2 rounded-[10px]"
                            style={{ background: 'rgba(255,255,255,0.025)' }}>
                            <span className="text-[10px] font-black text-white/20 w-4">#{i + 1}</span>
                            <p className="text-[11px] font-medium text-white/60 flex-1">{s.arabicTitle}</p>
                            <span className="text-[10px] font-bold text-white/30">{s.started} بداية</span>
                        </div>
                    ))}
                    {stats.length === 0 && (
                        <p className="text-[11px] text-white/20 text-center py-4">—</p>
                    )}
                </div>
            </div>

        </div>
    );
}
