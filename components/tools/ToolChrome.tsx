// components/tools/ToolChrome.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Tool Chrome: Header, ContextBar, ContextStrip, StickyBottomBar
// ════════════════════════════════════════════════════════════════════

import React, { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { getActiveCarePlan, getProtocolDay, getProtocolProgress } from '@/lib/care-plan-store';
import { getProtocol } from '@/lib/protocol-engine';
import { DOMAIN_NAMES, TYPE_LABELS } from './tool-tokens';

/* ── Tool Header ─────────────────────────────────── */
export function ToolHeader({
    toolName, toolType, duration, color, onBack,
}: {
    toolName: string; toolType: string; duration?: number;
    color: string; onBack: () => void;
}) {
    const typeInfo = TYPE_LABELS[toolType] ?? { ar: toolType, emoji: '📌' };
    return (
        <div className="sticky top-0 z-20 px-5 pt-14 pb-4"
            style={{ background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-3">
                <button onClick={onBack}>
                    <motion.div whileTap={{ scale: 0.88 }}
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.08)' }}>
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                    </motion.div>
                </button>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color }}>
                        {typeInfo.emoji} {typeInfo.ar}
                    </p>
                    <h1 className="text-slate-800 text-[16px] font-black leading-tight truncate">{toolName}</h1>
                </div>
                {duration && (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full flex-shrink-0"
                        style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                        <Clock className="w-3 h-3" style={{ color }} />
                        <span className="text-[9px] font-black" style={{ color }}>{duration}د</span>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Protocol Context Strip ──────────────────────── */
export function ProtocolContextStrip({ subdomain, color }: { subdomain: string; color: string }) {
    const data = useMemo(() => {
        if (typeof window === 'undefined') return null;
        const plan = getActiveCarePlan();
        if (!plan || plan.routing.primary_subdomain !== subdomain) return null;
        const protocol = getProtocol(subdomain);
        if (!protocol) return null;
        const day      = getProtocolDay(plan);
        const progress = getProtocolProgress(plan, protocol);
        return { day, totalDays: protocol.totalDays, weekGoal: protocol.weekGoal, progress };
    }, [subdomain]);

    if (!data) return null;

    return (
        <div className="mx-5 mb-4 px-3 py-2.5 rounded-[14px] flex items-center gap-2"
            style={{ background: `${color}09`, border: `1px solid ${color}22` }}>
            <span className="text-[14px]">🗓️</span>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black truncate" style={{ color }}>
                    اليوم <strong>{data.day}</strong> من {data.totalDays}
                </p>
                <p className="text-[8.5px] text-slate-400 font-medium truncate">{data.weekGoal}</p>
            </div>
            <div className="text-right flex-shrink-0">
                <p className="text-[11px] font-black" style={{ color }}>{data.progress.adherencePercent}%</p>
                <p className="text-[7.5px] text-slate-400 font-medium">التزام</p>
            </div>
        </div>
    );
}

/* ── Tool Context Bar ────────────────────────────── */
export function ToolContextBar({ domainId, toolType, color }: { domainId: string; toolType: string; color: string }) {
    const plan = useMemo(() => {
        if (typeof window === 'undefined') return null;
        return getActiveCarePlan();
    }, []);

    const domainInfo = DOMAIN_NAMES[domainId] ?? { ar: domainId, emoji: '📌' };
    const typeInfo = TYPE_LABELS[toolType] ?? { ar: toolType, emoji: '📌' };

    return (
        <div className="mx-5 mb-3 flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full"
                style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                <span className="text-[11px]">{domainInfo.emoji}</span>
                <span className="text-[10px] font-black" style={{ color }}>{domainInfo.ar}</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-full"
                style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}>
                <span className="text-[10px]">{typeInfo.emoji}</span>
                <span className="text-[9px] font-bold text-slate-500">{typeInfo.ar}</span>
            </div>
            {plan && (
                <Link href="/my-plan" className="mr-auto">
                    <motion.div whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-full"
                        style={{ background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}>
                        <span className="text-[9px] font-bold text-slate-400">← خطتي</span>
                    </motion.div>
                </Link>
            )}
        </div>
    );
}

/* ── Sticky Bottom Bar ───────────────────────────── */
export function StickyBottomBar({
    color, primaryLabel, primaryAction, primaryDisabled = false,
    showSaveExit = true, onSaveExit,
}: {
    color: string; primaryLabel: string; primaryAction: () => void;
    primaryDisabled?: boolean; showSaveExit?: boolean; onSaveExit?: () => void;
}) {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-30 px-5 pb-8 pt-3"
            style={{ background: 'linear-gradient(0deg, rgba(248,250,252,1) 60%, rgba(248,250,252,0) 100%)' }}>
            <div className="flex items-center gap-3 max-w-lg mx-auto">
                {showSaveExit && onSaveExit && (
                    <motion.button whileTap={{ scale: 0.95 }} onClick={onSaveExit}
                        className="flex-shrink-0 px-4 py-3.5 rounded-[16px] text-center"
                        style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.08)' }}>
                        <span className="text-slate-500 font-bold text-[12px]">حفظ</span>
                    </motion.button>
                )}
                <motion.button whileTap={{ scale: 0.97 }}
                    onClick={primaryAction} disabled={primaryDisabled}
                    className="flex-1 py-3.5 rounded-[16px] flex items-center justify-center gap-2"
                    style={{
                        background: primaryDisabled ? 'rgba(0,0,0,0.06)' : `linear-gradient(135deg, ${color}30, ${color}18)`,
                        border: `1.5px solid ${primaryDisabled ? 'rgba(0,0,0,0.08)' : color + '45'}`,
                        opacity: primaryDisabled ? 0.5 : 1,
                        boxShadow: primaryDisabled ? 'none' : `0 8px 24px ${color}18`,
                    }}>
                    <span className="text-slate-800 font-black text-[14px]">{primaryLabel}</span>
                </motion.button>
            </div>
        </div>
    );
}
