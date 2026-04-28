// components/my-plan/DailyChecklist.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Daily Checklist Component
// ════════════════════════════════════════════════════════════════════

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { getTodayChecklist, getStreak, type SavedCarePlan } from '@/lib/care-plan-store';
import { hasToolPage, getToolPageUrl } from '@/lib/tool-content-map';
import { TOOL_LABEL } from './plan-tokens';
import type { ToolRecommendation } from '@/components/health-engine/types';

export function DailyChecklist({
    tools, domainColor, plan, onToggle,
}: {
    tools: ToolRecommendation[];
    domainColor: string;
    plan: SavedCarePlan;
    onToggle: (toolId: string) => void;
}) {
    const checked = getTodayChecklist(plan);

    // عرض أول 3 أدوات فقط في الـ checklist
    const displayTools = tools.slice(0, 3);
    const doneCount = displayTools.filter(t => checked.includes(t.id)).length;
    const progress = Math.round((doneCount / displayTools.length) * 100);

    const dateStr = new Date().toLocaleDateString('ar-SA', { weekday: 'long', day: 'numeric', month: 'long' });
    // احسب اليوم من الخطة
    const dayNum = Math.floor((Date.now() - new Date(plan.createdAt).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const streak = getStreak(plan);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.09, type: 'spring', stiffness: 250, damping: 26 }}
        >
            <div className="relative overflow-hidden" style={{
                borderRadius: 22,
                background: 'rgba(255,255,255,0.70)',
                border: '1px solid rgba(255,255,255,0.90)',
                backdropFilter: 'blur(24px) saturate(160%)',
                boxShadow: '0 8px 32px rgba(8,145,178,0.10), 0 2px 8px rgba(0,0,0,0.04), inset 0 1.5px 0 rgba(255,255,255,0.95)',
                padding: '18px 18px 14px',
            }}>
                {/* sheen */}
                <div className="absolute inset-x-0 top-0 pointer-events-none" style={{
                    height: '45%',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.70) 0%, transparent 100%)',
                    borderRadius: '22px 22px 0 0',
                }} />

                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <p style={{ fontSize: 11, fontWeight: 900, color: domainColor, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
                                    اليوم {dayNum} من مسارك
                                </p>
                                {streak > 0 && (
                                    <span style={{
                                        fontSize: 10, fontWeight: 800, color: '#F59E0B',
                                        background: 'rgba(245,158,11,0.12)', padding: '2px 7px',
                                        borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 3
                                    }}>
                                        🔥 {streak} {streak === 1 ? 'يوم' : streak === 2 ? 'يومان' : streak > 10 ? 'يوماً' : 'أيام'}
                                    </span>
                                )}
                            </div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#0369A1' }}>{dateStr}</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 18, fontWeight: 900, color: domainColor, lineHeight: 1 }}>{doneCount}/{displayTools.length}</p>
                            <p style={{ fontSize: 9, color: '#7DD3FC', fontWeight: 700 }}>اكتمال</p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div style={{ height: 3, borderRadius: 99, background: 'rgba(0,0,0,0.06)', marginBottom: 12, overflow: 'hidden' }}>
                        <motion.div
                            style={{ height: '100%', borderRadius: 99, background: doneCount === displayTools.length ? 'rgba(0,200,140,0.8)' : domainColor }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5, ease: [0.05, 0.7, 0.1, 1] }}
                        />
                    </div>

                    {/* Tasks */}
                    <div className="space-y-2">
                        {displayTools.map((tool, i) => {
                            const isChecked = checked.includes(tool.id);
                            const toolHref = hasToolPage(tool.id)
                                ? getToolPageUrl(tool.type, tool.id)
                                : tool.href;
                            return (
                                <motion.div
                                    key={tool.id}
                                    initial={{ opacity: 0, x: 8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.12 + i * 0.05 }}
                                    className="flex items-center gap-3"
                                    style={{
                                        padding: '10px 12px', borderRadius: 14,
                                        background: isChecked ? 'rgba(0,200,140,0.06)' : 'rgba(255,255,255,0.55)',
                                        border: `1px solid ${isChecked ? 'rgba(0,200,140,0.22)' : 'rgba(255,255,255,0.82)'}`,
                                    }}
                                >
                                    {/* Checkbox */}
                                    <motion.button
                                        whileTap={{ scale: 0.80 }}
                                        onClick={() => onToggle(tool.id)}
                                        style={{
                                            width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                                            background: isChecked ? 'rgba(0,200,140,0.85)' : 'rgba(255,255,255,0.70)',
                                            border: `1.5px solid ${isChecked ? 'rgba(0,200,140,0.9)' : domainColor + '40'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            boxShadow: isChecked ? '0 2px 6px rgba(0,200,140,0.35)' : 'inset 0 1px 3px rgba(0,0,0,0.08)',
                                        }}
                                    >
                                        {isChecked && <CheckCircle2 size={13} style={{ color: '#fff' }} />}
                                    </motion.button>

                                    {/* Tool Name */}
                                    <Link href={toolHref} className="flex-1 min-w-0">
                                        <p style={{
                                            fontSize: 13, fontWeight: 700,
                                            color: isChecked ? 'rgba(0,160,110,0.75)' : '#0C4A6E',
                                            textDecoration: isChecked ? 'line-through' : 'none',
                                            lineHeight: 1.3,
                                        }}>{tool.arabicName}</p>
                                        <p style={{ fontSize: 10, color: '#7DD3FC', fontWeight: 600 }}>
                                            {TOOL_LABEL[tool.type]}{tool.durationMinutes > 0 ? ` · ${tool.durationMinutes}د` : ''}
                                        </p>
                                    </Link>

                                    <span style={{ fontSize: 18 }}>{tool.emoji}</span>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* All done message - Next Best Action */}
                    {doneCount === displayTools.length && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                marginTop: 12, padding: '12px 14px', borderRadius: 14,
                                background: 'linear-gradient(135deg, rgba(0,200,140,0.10) 0%, rgba(0,200,140,0.03) 100%)',
                                border: '1px solid rgba(0,200,140,0.22)',
                                display: 'flex', flexDirection: 'column', gap: 5
                            }}
                        >
                            <p style={{ fontSize: 13, fontWeight: 800, color: 'rgba(0,140,90,0.95)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <CheckCircle2 size={16} /> رائع! أكملت مهام اليوم.
                            </p>
                            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(0,140,90,0.80)', lineHeight: 1.5 }}>
                                الخطوة الأفضل الآن هي الاسترخاء والمحافظة على طاقتك للغد، أو استكشاف مكتبة المعرفة.
                            </p>
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
