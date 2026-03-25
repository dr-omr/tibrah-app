import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Upload, FileText, Pill, MessageSquare, ChevronDown } from 'lucide-react';

/* ── Types ── */
export interface ChecklistItem {
    id: string;
    label: string;
    description?: string;
    icon: 'upload' | 'file' | 'pill' | 'question' | 'general';
    completed: boolean;
    actionType?: 'check' | 'upload' | 'text-input';
}

interface ReadinessManagerProps {
    items: ChecklistItem[];
    onToggle?: (id: string) => void;
}

/* ── Icon Map ── */
const ICON_MAP: Record<string, React.ElementType> = {
    upload:   Upload,
    file:     FileText,
    pill:     Pill,
    question: MessageSquare,
    general:  Circle,
};

/* ── Main Component ── */
export function ReadinessManager({ items, onToggle }: ReadinessManagerProps) {
    const completedCount = items.filter(i => i.completed).length;
    const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;
    const allDone = progress === 100;

    return (
        <div className="px-4 pb-4">
            <div className={`rounded-2xl p-4 border transition-all duration-500 ${
                allDone
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/50'
                    : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200/60 dark:border-amber-800/30'
            }`}>
                {/* Header with Progress */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                            allDone ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-amber-100 dark:bg-amber-900/40'
                        }`}>
                            {allDone
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                : <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            }
                        </div>
                        <h4 className={`text-[13px] font-bold ${
                            allDone ? 'text-emerald-800 dark:text-emerald-300' : 'text-amber-800 dark:text-amber-300'
                        }`}>
                            {allDone ? 'جاهز للجلسة ✓' : 'تجهيزات قبل الموعد'}
                        </h4>
                    </div>
                    <span className={`text-[11px] font-black tabular-nums ${
                        allDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                    }`}>
                        {completedCount}/{items.length}
                    </span>
                </div>

                {/* Progress Bar */}
                <div className="h-[6px] bg-white/60 dark:bg-slate-700/60 rounded-full overflow-hidden mb-4 shadow-inner">
                    <motion.div
                        className={`h-full rounded-full ${
                            allDone
                                ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                : 'bg-gradient-to-r from-amber-400 to-amber-500'
                        }`}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                    />
                </div>

                {/* Checklist Items */}
                <div className="space-y-2">
                    {items.map((item, i) => {
                        const ItemIcon = ICON_MAP[item.icon] || ICON_MAP.general;
                        return (
                            <motion.label
                                key={item.id}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`flex items-center gap-3 cursor-pointer group rounded-xl px-3 py-2.5 transition-all ${
                                    item.completed
                                        ? 'bg-white/40 dark:bg-slate-800/40'
                                        : 'bg-white/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 shadow-sm'
                                }`}
                                onClick={() => onToggle?.(item.id)}
                            >
                                {/* Checkbox */}
                                <div className="flex-shrink-0">
                                    {item.completed ? (
                                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                        </div>
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-amber-300 dark:border-amber-600 group-hover:border-amber-400" />
                                    )}
                                </div>

                                {/* Icon */}
                                <ItemIcon className={`w-4 h-4 flex-shrink-0 ${
                                    item.completed ? 'text-emerald-400' : 'text-amber-500/70'
                                }`} />

                                {/* Label */}
                                <span className={`text-[12px] font-medium flex-1 transition-colors ${
                                    item.completed
                                        ? 'text-slate-400 dark:text-slate-500 line-through'
                                        : 'text-slate-700 dark:text-slate-300'
                                }`}>
                                    {item.label}
                                </span>
                            </motion.label>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
