// components/care-hub/CareJourney.tsx
// "مسيرة رعايتي" — Care Journey Timeline
// Inspired by:
//   - Practo (India): care journey stages
//   - Healow (USA): treatment milestone tracker  
//   - Kry/Livi (Sweden): recovery progress visualization
//
// Shows the full care arc: Intake → Diagnosis → Protocol → Recovery → Maintenance
// Each stage has a visual indicator and completion state.

import React from 'react';
import { motion } from 'framer-motion';
import {
    ClipboardList, Stethoscope, Pill, TrendingUp,
    ShieldCheck, ChevronLeft, CheckCircle2, Circle,
} from 'lucide-react';
import { CT } from './care-tokens';
import { SPRING_BOUNCY } from '@/lib/tibrah-motion';
import Link from 'next/link';
import { createPageUrl } from '@/utils';

interface JourneyStage {
    id:       string;
    label:    string;
    sub:      string;
    icon:     React.ElementType;
    status:   'done' | 'active' | 'upcoming';
    href?:    string;
    date?:    string;
}

const DEFAULT_STAGES: JourneyStage[] = [
    { id: 'intake',    label: 'التقييم الأولي',     sub: 'استبيان الحالة الأساسية',  icon: ClipboardList, status: 'done',     href: '/intake',          date: 'مكتمل' },
    { id: 'diag',      label: 'التشخيص الشامل',     sub: 'الجلسة التشخيصية',         icon: Stethoscope,   status: 'done',     href: '/book-appointment',date: 'مكتمل' },
    { id: 'protocol',  label: 'البروتوكول العلاجي', sub: 'المسار المزدوج (جسد+شعور)',icon: Pill,          status: 'active',   href: '/my-care',         date: 'جارٍ' },
    { id: 'track',     label: 'المتابعة الدورية',   sub: 'تتبع المؤشرات والتقدم',    icon: TrendingUp,    status: 'upcoming', href: '/health-tracker' },
    { id: 'wellness',  label: 'الصحة المستدامة',    sub: 'خطة الحياة الشمولية',      icon: ShieldCheck,   status: 'upcoming' },
];

const STATUS_STYLE = {
    done:     { dot: CT.green.c,  line: CT.green.c,  label: 'مكتمل', badge: 'rgba(22,163,74,0.12)' },
    active:   { dot: CT.teal.c,   line: CT.teal.c,   label: 'جارٍ',  badge: `${CT.teal.c}15` },
    upcoming: { dot: '#cbd5e1',   line: '#e2e8f0',   label: 'قادم',  badge: 'rgba(0,0,0,0.04)' },
};

function JourneyStageRow({ stage, isLast }: { stage: JourneyStage; isLast: boolean }) {
    const s = STATUS_STYLE[stage.status];
    const Icon = stage.icon;

    const content = (
        <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={SPRING_BOUNCY}
            className="flex items-start gap-3">
            {/* Left timeline column */}
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: 36 }}>
                <motion.div
                    animate={stage.status === 'active' ? {
                        boxShadow: [`0 0 0 0px ${CT.teal.c}30`, `0 0 0 8px ${CT.teal.c}00`],
                    } : {}}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    className="w-9 h-9 rounded-[12px] flex items-center justify-center"
                    style={{
                        background: stage.status === 'done'
                            ? `linear-gradient(135deg, ${CT.green.c}, ${CT.green.light})`
                            : stage.status === 'active'
                            ? `linear-gradient(135deg, ${CT.teal.dark}, ${CT.teal.c})`
                            : 'rgba(0,0,0,0.05)',
                    }}>
                    {stage.status === 'done'
                        ? <CheckCircle2 className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
                        : <Icon className="w-4 h-4" style={{ color: stage.status === 'upcoming' ? '#94a3b8' : 'white' }} />
                    }
                </motion.div>
                {/* Connector line */}
                {!isLast && (
                    <div className="w-0.5 flex-1 mt-1 min-h-[24px] rounded-full"
                        style={{ background: stage.status === 'done' ? CT.green.c : '#e2e8f0' }} />
                )}
            </div>

            {/* Right content */}
            <div className="flex-1 pb-4 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-[13px] font-black text-slate-800"
                                style={{ color: stage.status === 'upcoming' ? '#94a3b8' : '#1e293b' }}>
                                {stage.label}
                            </p>
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                                style={{ background: s.badge, color: s.dot }}>
                                {s.label}
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">{stage.sub}</p>
                    </div>
                    {stage.href && stage.status !== 'upcoming' && (
                        <ChevronLeft className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" />
                    )}
                </div>
            </div>
        </motion.div>
    );

    if (stage.href && stage.status !== 'upcoming') {
        return <Link href={stage.href}>{content}</Link>;
    }
    return content;
}

interface CareJourneyProps {
    stages?: JourneyStage[];
    hasDiagnosis?: boolean;
    hasProtocol?:  boolean;
}

export function CareJourney({ stages, hasDiagnosis = true, hasProtocol = false }: CareJourneyProps) {
    const resolvedStages = stages ?? DEFAULT_STAGES.map(s => ({
        ...s,
        status: s.id === 'diag' && !hasDiagnosis ? 'upcoming'
              : s.id === 'protocol' && !hasProtocol ? 'upcoming'
              : s.status,
    })) as JourneyStage[];

    const activeIdx = resolvedStages.findIndex(s => s.status === 'active');
    const pct = Math.round((activeIdx / (resolvedStages.length - 1)) * 100);

    return (
        <div className="rounded-[24px] overflow-hidden"
            style={{
                background: CT.card.bg,
                backdropFilter: CT.card.blur,
                border: `1.5px solid ${CT.card.border}`,
                boxShadow: CT.card.shadow,
            }}>
            <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-[13px] font-black text-slate-800">مسيرة رعايتي</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">المرحلة {activeIdx + 1} من {resolvedStages.length}</p>
                    </div>
                    {/* Overall progress pill */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                        style={{ background: `${CT.teal.c}10`, border: `1.5px solid ${CT.teal.c}22` }}>
                        <div className="h-1.5 w-16 rounded-full bg-slate-100 overflow-hidden">
                            <motion.div className="h-full rounded-full"
                                style={{ background: CT.teal.c }}
                                initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, delay: 0.3 }} />
                        </div>
                        <span className="text-[11px] font-black" style={{ color: CT.teal.c }}>{pct}%</span>
                    </div>
                </div>

                {/* Stages */}
                <div>
                    {resolvedStages.map((stage, i) => (
                        <JourneyStageRow key={stage.id} stage={stage} isLast={i === resolvedStages.length - 1} />
                    ))}
                </div>
            </div>
        </div>
    );
}
