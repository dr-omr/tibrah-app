// components/health-tracker/TrackerTimeline.tsx
// Health Tracker — Day Timeline
// A visual 6am→midnight timeline showing what the user did.
// Each metric has its own row of colored dots/blocks.

import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Moon, Activity, Pill, Smile } from 'lucide-react';
import { METRIC, TC } from './tracker-tokens';
import { STAGGER_ITEM } from '@/lib/tibrah-motion';

interface TimelineEvent {
    hour: number;       // 0–23
    type: 'water' | 'sleep' | 'activity' | 'meds' | 'mood';
    label?: string;
    value?: string;
}

interface TrackerTimelineProps {
    events?: TimelineEvent[];
    sleepStart?: number;  // hour e.g. 23
    sleepEnd?:   number;  // hour e.g. 6
}

const HOURS = [6, 8, 10, 12, 14, 16, 18, 20, 22, 0];
const HOUR_LABELS: Record<number, string> = {
    6: '٦ص', 8: '٨ص', 10: '١٠ص', 12: '١٢م',
    14: '٢م', 16: '٤م', 18: '٦م', 20: '٨م', 22: '١٠م', 0: '١٢ل',
};

// Metric rows config
const ROWS = [
    { type: 'sleep'    as const, icon: Moon,     label: 'نوم'   },
    { type: 'activity' as const, icon: Activity, label: 'نشاط'  },
    { type: 'water'    as const, icon: Droplets, label: 'ماء'   },
    { type: 'meds'     as const, icon: Pill,     label: 'دواء'  },
    { type: 'mood'     as const, icon: Smile,    label: 'مزاج'  },
] as const;

// Map hour to column index (0–9)
function hourToCol(h: number): number {
    return HOURS.indexOf(h >= 0 && h <= 5 ? 0 : h - ((h % 2)));
}

export function TrackerTimeline({ events = [], sleepStart = 23, sleepEnd = 6 }: TrackerTimelineProps) {
    const now = new Date().getHours();

    // Default demo events if none provided
    const displayEvents: TimelineEvent[] = events.length > 0 ? events : [
        { hour: 7,  type: 'water',    value: '٢ك'  },
        { hour: 8,  type: 'meds',     label: 'فيتامين د' },
        { hour: 9,  type: 'activity', value: '١٥د' },
        { hour: 11, type: 'water',    value: '١ك'  },
        { hour: 14, type: 'water',    value: '١ك'  },
        { hour: 15, type: 'mood',     value: '٧/١٠' },
        { hour: 17, type: 'activity', value: '٢٠د' },
        { hour: 20, type: 'water',    value: '١ك'  },
    ];

    return (
        <motion.div variants={STAGGER_ITEM} className="px-4">
            <div className="rounded-[22px] overflow-hidden"
                style={{
                    background: TC.card.bg,
                    backdropFilter: TC.card.blur,
                    border: `1.5px solid ${TC.card.border}`,
                    boxShadow: TC.card.shadow,
                }}>

                {/* Header */}
                <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-slate-100/80">
                    <div className="w-2 h-2 rounded-full bg-teal-400" />
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">جدول يومك</span>
                    <span className="mr-auto text-[10px] text-slate-400 font-medium">
                        {new Date().toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </span>
                </div>

                <div className="px-3 py-3">
                    {/* Hour labels */}
                    <div className="flex mb-2 pr-10">
                        {HOURS.map(h => (
                            <div key={h} className="flex-1 text-center">
                                <span className="text-[8.5px] font-bold text-slate-300">{HOUR_LABELS[h]}</span>
                            </div>
                        ))}
                    </div>

                    {/* Rows */}
                    {ROWS.map(row => {
                        const m    = METRIC[row.type];
                        const Icon = row.icon;
                        const rowEvents = displayEvents.filter(e => e.type === row.type);

                        return (
                            <div key={row.type} className="flex items-center mb-2 last:mb-0 gap-1">
                                {/* Label */}
                                <div className="w-9 flex-shrink-0 flex items-center gap-1">
                                    <Icon className="w-3 h-3 flex-shrink-0" style={{ color: m.color }} />
                                    <span className="text-[8px] font-bold text-slate-400">{row.label}</span>
                                </div>

                                {/* Grid */}
                                <div className="flex flex-1 relative">
                                    {/* Background track */}
                                    <div className="absolute inset-y-0 inset-x-0 flex">
                                        {HOURS.map(h => {
                                            const isFuture = h > now && h !== 0;
                                            const isSleepCol = row.type === 'sleep' && (h >= sleepStart || h <= sleepEnd);
                                            return (
                                                <div key={h} className="flex-1 h-6 border-r border-slate-100/60 last:border-r-0"
                                                    style={{
                                                        background: isFuture ? 'rgba(0,0,0,0.015)' :
                                                                    isSleepCol ? `${m.color}18` : 'transparent',
                                                    }} />
                                            );
                                        })}
                                    </div>

                                    {/* Event dots */}
                                    <div className="relative flex flex-1">
                                        {HOURS.map((h, i) => {
                                            const ev = rowEvents.find(e => {
                                                const normalH = e.hour <= 5 ? 0 : e.hour - (e.hour % 2);
                                                return normalH === h;
                                            });
                                            return (
                                                <div key={h} className="flex-1 h-6 flex items-center justify-center">
                                                    {ev ? (
                                                        <motion.div
                                                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                                                            transition={{ delay: i * 0.05, type: 'spring', stiffness: 400, damping: 20 }}
                                                            className="w-4 h-4 rounded-full flex items-center justify-center"
                                                            style={{ background: m.color, boxShadow: `0 0 6px ${m.color}60` }}
                                                            title={ev.label || ev.value}>
                                                            <Icon className="w-2.5 h-2.5 text-white" style={{ width: 8, height: 8 }} />
                                                        </motion.div>
                                                    ) : (
                                                        <div className="w-1 h-1 rounded-full bg-slate-100" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {/* Now indicator */}
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100/70">
                        <motion.div className="w-1.5 h-1.5 rounded-full bg-teal-400"
                            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
                        <span className="text-[9.5px] font-bold text-teal-500">الآن</span>
                        <span className="text-[9px] text-slate-400">
                            — {displayEvents.length} تسجيل اليوم
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
