// pages/admin/analytics.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Analytics Dashboard (Dev-only)
// تصميم: بحر عميق · زجاج فيزيائي · ناتف
// ════════════════════════════════════════════════════════════════════
import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import {
    ChevronLeft, BarChart3, Users, Zap, AlertTriangle,
    TrendingUp, Activity, Clock, Trash2, RefreshCw,
} from 'lucide-react';
import SEO from '@/components/common/SEO';

/* ═══════════════════════════════════════════════════════════
   DESIGN TOKENS — Light Water Glass
   ═══════════════════════════════════════════════════════════ */
const PAGE_BG = 'linear-gradient(168deg, #E8F8FB 0%, #D0F0F8 18%, #E2F1FE 42%, #EDF5FF 65%, #F0FAFB 88%, #F5FDFE 100%)';

const GL = {
    base:     'rgba(255,255,255,0.58)',
    border:   'rgba(255,255,255,0.85)',
    shadow:   '0 8px 32px rgba(8,145,178,0.10), 0 2px 8px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.92)',
    sheen:    'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, rgba(255,255,255,0.15) 45%, transparent 100%)',
};

const TXT = {
    primary:   '#0C4A6E',
    secondary: '#0369A1',
    muted:     '#7DD3FC',
    accent:    '#0891B2',
};

const DOMAIN_COLORS: Record<string, string> = {
    jasadi: '#0891B2',
    nafsi:  '#818CF8',
    fikri:  '#F59E0B',
    ruhi:   '#06B6D4',
};

interface AnalyticsEvent {
    name: string;
    properties?: Record<string, string | number | boolean | null>;
    timestamp: string;
}

/* ═══════════════════════════════════════════════════════════
   GlassCard Component
   ═══════════════════════════════════════════════════════════ */
function GlassCard({ children, className = '', style = {} }: {
    children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) {
    return (
        <div
            className={`relative overflow-hidden ${className}`}
            style={{
                borderRadius: 22,
                background: GL.base,
                border: `1px solid ${GL.border}`,
                backdropFilter: 'blur(20px) saturate(150%)',
                boxShadow: GL.shadow,
                ...style,
            }}
        >
            <div className="absolute inset-x-0 top-0 pointer-events-none"
                style={{ height: '48%', background: GL.sheen, borderRadius: '22px 22px 0 0' }} />
            <div className="relative z-10">{children}</div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MetricCard — بطاقة رقم واحد
   ═══════════════════════════════════════════════════════════ */
function MetricCard({ icon: Icon, label, value, color, delay = 0 }: {
    icon: typeof BarChart3; label: string; value: number | string;
    color: string; delay?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: 'spring', stiffness: 260, damping: 26 }}
        >
            <GlassCard style={{ padding: '16px' }}>
                <div className="flex items-center gap-3">
                    <div style={{
                        width: 40, height: 40,
                        borderRadius: 14,
                        background: `${color}18`,
                        border: `1px solid ${color}28`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: 'inset 0 1.5px 0 rgba(255,255,255,0.85), 0 3px 10px rgba(0,0,0,0.04)',
                    }}>
                        <Icon style={{ width: 18, height: 18, color }} />
                    </div>
                    <div className="flex-1">
                        <p style={{ fontSize: 9, fontWeight: 800, color: TXT.muted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>
                            {label}
                        </p>
                        <p style={{ fontSize: 22, fontWeight: 900, color: TXT.primary, letterSpacing: '-0.03em', textShadow: `0 0 16px ${color}40` }}>
                            {value}
                        </p>
                    </div>
                </div>
            </GlassCard>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════
   BarRow — صف بار أفقي
   ═══════════════════════════════════════════════════════════ */
function BarRow({ label, value, maxValue, color, delay = 0 }: {
    label: string; value: number; maxValue: number; color: string; delay?: number;
}) {
    const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
        <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, type: 'spring', stiffness: 260, damping: 28 }}
        >
            <span style={{ fontSize: 11, fontWeight: 700, color: TXT.secondary, width: 70, textAlign: 'right', flexShrink: 0 }}>
                {label}
            </span>
            <div className="flex-1" style={{
                height: 7, borderRadius: 99,
                background: 'rgba(8,145,178,0.06)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
                overflow: 'hidden',
            }}>
                <motion.div
                    style={{
                        height: '100%', borderRadius: 99,
                        background: `linear-gradient(90deg, ${color}80, ${color})`,
                        boxShadow: `0 0 8px ${color}50`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: [0.05, 0.7, 0.1, 1], delay: delay + 0.1 }}
                />
            </div>
            <span style={{ fontSize: 12, fontWeight: 900, color, width: 28, textAlign: 'left' }}>{value}</span>
        </motion.div>
    );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
export default function AnalyticsDashboard() {
    const router = useRouter();
    const [events, setEvents] = useState<AnalyticsEvent[]>([]);

    const loadEvents = () => {
        if (typeof window === 'undefined') return;
        try {
            const raw = localStorage.getItem('tibrah_analytics');
            if (raw) setEvents(JSON.parse(raw));
        } catch { setEvents([]); }
    };

    useEffect(() => { loadEvents(); }, []);

    // ── Computed metrics ──
    const stats = useMemo(() => {
        const count = (name: string) => events.filter(e => e.name === name).length;

        // Top primary domains
        const domainCounts: Record<string, number> = {};
        events.filter(e => e.name === 'assessment_completed').forEach(e => {
            const d = e.properties?.primary_domain;
            if (typeof d === 'string') domainCounts[d] = (domainCounts[d] || 0) + 1;
        });

        // Top opened tools
        const toolCounts: Record<string, number> = {};
        events.filter(e => e.name === 'routing_tool_opened').forEach(e => {
            const t = e.properties?.tool_id;
            if (typeof t === 'string') toolCounts[t] = (toolCounts[t] || 0) + 1;
        });

        // Escalation count
        const escalated = events.filter(e =>
            e.name === 'assessment_completed' && e.properties?.escalation_needed === true
        ).length;

        // Triage level distribution
        const triageCounts: Record<string, number> = {};
        events.filter(e => e.name === 'assessment_completed').forEach(e => {
            const lvl = e.properties?.triage_level;
            if (typeof lvl === 'string') triageCounts[lvl] = (triageCounts[lvl] || 0) + 1;
        });

        // Booking from routing
        const bookingsFromRouting = count('booking_from_routing');

        // Time range
        const timestamps = events.map(e => new Date(e.timestamp).getTime());
        const oldest = timestamps.length > 0 ? new Date(Math.min(...timestamps)) : null;
        const newest = timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null;

        return {
            total:       events.length,
            started:     count('assessment_started'),
            completed:   count('assessment_completed'),
            escalated,
            resultViewed: count('routing_result_viewed'),
            toolOpened:  count('routing_tool_opened'),
            escalationShown: count('routing_escalation_shown'),
            bookingsFromRouting,
            planViewed:  events.filter(e =>
                e.name === 'page_view' && e.properties?.page_name === 'my_plan'
            ).length,
            domainCounts,
            toolCounts,
            triageCounts,
            oldest,
            newest,
        };
    }, [events]);

    const sortedDomains = Object.entries(stats.domainCounts).sort(([, a], [, b]) => b - a);
    const maxDomainCount = sortedDomains.length > 0 ? sortedDomains[0][1] : 1;

    const sortedTools = Object.entries(stats.toolCounts).sort(([, a], [, b]) => b - a).slice(0, 8);
    const maxToolCount = sortedTools.length > 0 ? sortedTools[0][1] : 1;

    const sortedTriage = Object.entries(stats.triageCounts).sort(([, a], [, b]) => b - a);
    const maxTriageCount = sortedTriage.length > 0 ? sortedTriage[0][1] : 1;

    const TRIAGE_COLORS: Record<string, string> = {
        emergency: '#FF5555', urgent: '#F59E0B', needs_doctor: '#06B6D4',
        review: '#22D3EE', manageable: '#34D399',
    };

    const DOMAIN_LABELS: Record<string, string> = {
        jasadi: 'جسدي', nafsi: 'نفسي', fikri: 'فكري', ruhi: 'روحي',
    };

    const handleClear = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('tibrah_analytics');
            setEvents([]);
        }
    };

    const completionRate = stats.started > 0
        ? Math.round((stats.completed / stats.started) * 100)
        : 0;

    return (
        <div dir="rtl" className="min-h-screen pb-20" style={{ background: PAGE_BG }}>
            <SEO title="تحليلات — طِبرَا" description="لوحة التحليلات الداخلية" noIndex={true} />

            {/* Water caustics */}
            <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
                <div className="absolute inset-0" style={{
                    background: 'radial-gradient(ellipse 60% 40% at 75% 20%, rgba(0,183,235,0.14) 0%, transparent 65%)',
                }} />
                <div className="absolute inset-0" style={{
                    background: 'radial-gradient(ellipse 50% 50% at 20% 75%, rgba(6,148,162,0.10) 0%, transparent 55%)',
                }} />
            </div>

            <div className="relative z-10">

                {/* ═══ HEADER ═══ */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 pt-14 pb-4"
                    style={{
                        background: 'rgba(232,248,251,0.80)',
                        backdropFilter: 'blur(24px)',
                        borderBottom: `1px solid ${GL.border}`,
                    }}
                >
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileTap={{ scale: 0.88 }}
                            onClick={() => router.back()}
                            style={{
                                width: 36, height: 36, borderRadius: '50%',
                                background: GL.base, border: `1px solid ${GL.border}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <ChevronLeft style={{ width: 16, height: 16, color: TXT.secondary, transform: 'rotate(180deg)' }} />
                        </motion.button>

                        <div className="flex-1">
                            <p style={{ fontSize: 10, fontWeight: 700, color: TXT.accent, letterSpacing: '0.08em', marginBottom: 1 }}>
                                DEV ONLY
                            </p>
                            <h1 style={{ fontSize: 18, fontWeight: 900, color: TXT.primary, letterSpacing: '-0.02em' }}>
                                تحليلات المحرك
                            </h1>
                        </div>

                        <div className="flex items-center gap-2">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={loadEvents}
                                style={{
                                    width: 34, height: 34, borderRadius: 12,
                                    background: GL.base, border: `1px solid ${GL.border}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <RefreshCw style={{ width: 14, height: 14, color: TXT.muted }} />
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleClear}
                                style={{
                                    width: 34, height: 34, borderRadius: 12,
                                    background: 'rgba(220,50,50,0.12)', border: '1px solid rgba(220,50,50,0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}
                            >
                                <Trash2 style={{ width: 14, height: 14, color: 'rgba(255,100,100,0.8)' }} />
                            </motion.button>
                        </div>
                    </div>

                    {/* Time range */}
                    {stats.oldest && stats.newest && (
                        <div className="flex items-center gap-1.5 mt-2">
                            <Clock style={{ width: 10, height: 10, color: TXT.muted }} />
                            <span style={{ fontSize: 9.5, color: TXT.muted, fontWeight: 600 }}>
                                {stats.oldest.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                                {' — '}
                                {stats.newest.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                                {' · '}
                                {stats.total} حدث
                            </span>
                        </div>
                    )}
                </motion.div>

                <div className="px-4 pt-4 space-y-3">

                    {/* ═══ KEY METRICS ═══ */}
                    <div className="grid grid-cols-2 gap-2.5">
                        <MetricCard icon={Users} label="بدأ التقييم" value={stats.started} color="#22D3EE" delay={0.05} />
                        <MetricCard icon={Activity} label="أكمل" value={stats.completed} color="#34D399" delay={0.1} />
                        <MetricCard icon={AlertTriangle} label="تصعيد" value={stats.escalated} color="#F59E0B" delay={0.15} />
                        <MetricCard icon={TrendingUp} label="معدل الإكمال" value={`${completionRate}%`} color="#8B5CF6" delay={0.2} />
                    </div>

                    {/* ═══ FUNNEL ═══ */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                    >
                        <GlassCard style={{ padding: '16px 18px' }}>
                            <p style={{ fontSize: 9, fontWeight: 900, color: TXT.muted, letterSpacing: '0.13em', textTransform: 'uppercase', marginBottom: 14 }}>
                                قمع التحويل
                            </p>
                            <div className="space-y-3">
                                {[
                                    { label: 'بدأ التقييم', value: stats.started, color: '#22D3EE' },
                                    { label: 'أكمل التقييم', value: stats.completed, color: '#34D399' },
                                    { label: 'شاهد النتيجة', value: stats.resultViewed, color: '#06B6D4' },
                                    { label: 'فتح أداة', value: stats.toolOpened, color: '#8B5CF6' },
                                    { label: 'شاهد خطتي', value: stats.planViewed, color: '#A78BFA' },
                                    { label: 'حجز من التوجيه', value: stats.bookingsFromRouting, color: '#F59E0B' },
                                ].map((item, i) => (
                                    <BarRow
                                        key={item.label}
                                        label={item.label}
                                        value={item.value}
                                        maxValue={Math.max(stats.started, 1)}
                                        color={item.color}
                                        delay={0.28 + i * 0.04}
                                    />
                                ))}
                            </div>
                        </GlassCard>
                    </motion.div>

                    {/* ═══ TOP DOMAINS ═══ */}
                    {sortedDomains.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <GlassCard style={{ padding: '16px 18px' }}>
                                <p style={{ fontSize: 9, fontWeight: 900, color: TXT.muted, letterSpacing: '0.13em', textTransform: 'uppercase', marginBottom: 14 }}>
                                    الأقسام الرئيسية
                                </p>
                                <div className="space-y-3">
                                    {sortedDomains.map(([domId, count], i) => (
                                        <BarRow
                                            key={domId}
                                            label={DOMAIN_LABELS[domId] || domId}
                                            value={count}
                                            maxValue={maxDomainCount}
                                            color={DOMAIN_COLORS[domId] || '#22D3EE'}
                                            delay={0.42 + i * 0.04}
                                        />
                                    ))}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}

                    {/* ═══ TRIAGE DISTRIBUTION ═══ */}
                    {sortedTriage.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.48 }}
                        >
                            <GlassCard style={{ padding: '16px 18px' }}>
                                <p style={{ fontSize: 9, fontWeight: 900, color: TXT.muted, letterSpacing: '0.13em', textTransform: 'uppercase', marginBottom: 14 }}>
                                    توزيع مستويات الفرز
                                </p>
                                <div className="space-y-3">
                                    {sortedTriage.map(([level, count], i) => (
                                        <BarRow
                                            key={level}
                                            label={level}
                                            value={count}
                                            maxValue={maxTriageCount}
                                            color={TRIAGE_COLORS[level] || '#22D3EE'}
                                            delay={0.50 + i * 0.04}
                                        />
                                    ))}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}

                    {/* ═══ TOP TOOLS ═══ */}
                    {sortedTools.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.55 }}
                        >
                            <GlassCard style={{ padding: '16px 18px' }}>
                                <p style={{ fontSize: 9, fontWeight: 900, color: TXT.muted, letterSpacing: '0.13em', textTransform: 'uppercase', marginBottom: 14 }}>
                                    أكثر الأدوات فتحاً
                                </p>
                                <div className="space-y-3">
                                    {sortedTools.map(([toolId, count], i) => (
                                        <BarRow
                                            key={toolId}
                                            label={toolId.replace(/_/g, ' ').slice(0, 20)}
                                            value={count}
                                            maxValue={maxToolCount}
                                            color="#8B5CF6"
                                            delay={0.57 + i * 0.04}
                                        />
                                    ))}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}

                    {/* ═══ RECENT EVENTS ═══ */}
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.62 }}
                    >
                        <GlassCard style={{ padding: '16px 18px' }}>
                            <p style={{ fontSize: 9, fontWeight: 900, color: TXT.muted, letterSpacing: '0.13em', textTransform: 'uppercase', marginBottom: 14 }}>
                                آخر 15 حدث
                            </p>
                            <div className="space-y-1.5">
                                {events.slice(-15).reverse().map((ev, i) => (
                                    <div key={i} className="flex items-center gap-2 py-1.5" style={{
                                        borderBottom: i < 14 ? '1px solid rgba(8,145,178,0.06)' : 'none',
                                    }}>
                                        <div style={{
                                            width: 6, height: 6, borderRadius: 99, flexShrink: 0,
                                            background: ev.name.includes('escalation') ? '#F59E0B'
                                                : ev.name.includes('completed') ? '#34D399'
                                                : ev.name.includes('started') ? '#22D3EE'
                                                : ev.name.includes('tool') ? '#8B5CF6'
                                                : 'rgba(255,255,255,0.25)',
                                        }} />
                                        <span style={{ fontSize: 10.5, fontWeight: 700, color: TXT.secondary, flex: 1,  direction: 'ltr', textAlign: 'left' }}>
                                            {ev.name}
                                        </span>
                                        <span style={{ fontSize: 9, color: TXT.muted, fontWeight: 600 }}>
                                            {new Date(ev.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}
                                {events.length === 0 && (
                                    <p style={{ fontSize: 12, color: TXT.muted, textAlign: 'center', padding: '20px 0' }}>
                                        لا توجد أحداث بعد. أكمل تقييماً لرؤية البيانات.
                                    </p>
                                )}
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
