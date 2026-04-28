// components/my-plan/StartTodayBar.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Start Today Bar (today's priority tool)
// ════════════════════════════════════════════════════════════════════

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { hasToolPage, getToolPageUrl } from '@/lib/tool-content-map';
import type { ToolRecommendation, ToolType } from '@/components/health-engine/types';

export function StartTodayBar({
    tools, domainColor, openedIds, completedIds, onTap,
}: {
    tools: ToolRecommendation[];
    domainColor: string;
    openedIds: string[];
    completedIds: string[];
    onTap: (tool: ToolRecommendation) => void;
}) {
    // اختار أداة اليوم: practice أولاً، ثم test، ثم tracker
    const todayIndex = (new Date().getDate()) % tools.length;
    const priority = ['practice', 'test', 'tracker', 'workshop', 'protocol'] as ToolType[];
    const pending = tools.filter(t => !completedIds.includes(t.id));
    const todayTool = pending.find(t => t.type === 'practice')
        ?? pending.find(t => t.type === 'test')
        ?? pending.find(t => t.type === 'tracker')
        ?? pending[0]
        ?? tools[todayIndex];

    if (!todayTool) return null;
    const isComplete = completedIds.includes(todayTool.id);
    const toolHref = hasToolPage(todayTool.id)
        ? getToolPageUrl(todayTool.type, todayTool.id)
        : todayTool.href;

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.04 }}
        >
            <Link href={toolHref} onClick={() => onTap(todayTool)}>
                <motion.div
                    whileTap={{ scale: 0.97, y: 1 }}
                    className="relative overflow-hidden"
                    style={{
                        borderRadius: 22,
                        background: isComplete
                            ? 'rgba(0,200,140,0.10)'
                            : `linear-gradient(145deg, rgba(255,255,255,0.88) 0%, ${domainColor}22 100%)`,
                        border: `1.5px solid ${isComplete ? 'rgba(0,200,140,0.40)' : domainColor + '45'}`,
                        boxShadow: `0 12px 36px ${domainColor}22, 0 4px 12px rgba(0,0,0,0.08), inset 0 1.5px 0 rgba(255,255,255,0.95)`,
                        padding: '16px 18px',
                    }}
                >
                    {/* شريط ضوء علوي */}
                    <div className="absolute inset-x-0 top-0 pointer-events-none" style={{
                        height: '50%',
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, transparent 100%)',
                        borderRadius: '22px 22px 0 0',
                    }} />

                    <div className="relative z-10 flex items-center gap-3">
                        {/* الأيقونة */}
                        <div style={{
                            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                            background: isComplete ? 'rgba(0,200,140,0.12)' : `${domainColor}18`,
                            border: `1px solid ${isComplete ? 'rgba(0,200,140,0.30)' : domainColor + '30'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            position: 'relative', overflow: 'hidden',
                        }}>
                            <span style={{ fontSize: 24 }}>{todayTool.emoji}</span>
                            {isComplete && (
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: 'rgba(0,200,140,0.20)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <CheckCircle2 size={20} style={{ color: 'rgba(0,200,140,0.9)' }} />
                                </div>
                            )}
                        </div>

                        {/* النص */}
                        <div className="flex-1 min-w-0">
                            <p style={{
                                fontSize: 10, fontWeight: 900,
                                color: isComplete ? 'rgba(0,180,120,0.8)' : domainColor,
                                letterSpacing: '0.10em', textTransform: 'uppercase', marginBottom: 3,
                            }}>
                                {isComplete ? '✓ مكتمل' : '⚡ اليوم'}
                            </p>
                            <p style={{
                                fontSize: 15, fontWeight: 900, color: '#0C4A6E',
                                letterSpacing: '-0.01em', lineHeight: 1.3,
                            }}>{todayTool.arabicName}</p>
                            {todayTool.durationMinutes > 0 && (
                                <p style={{ fontSize: 11, color: '#0369A1', fontWeight: 500, marginTop: 2 }}>
                                    {todayTool.durationMinutes} دقيقة
                                </p>
                            )}
                        </div>

                        {/* السهم */}
                        <div style={{
                            width: 34, height: 34, borderRadius: 99, flexShrink: 0,
                            background: `linear-gradient(135deg, ${domainColor}, ${domainColor}CC)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 4px 12px ${domainColor}40`,
                        }}>
                            <ArrowLeft style={{ width: 14, height: 14, color: '#fff', transform: 'rotate(180deg)' }} />
                        </div>
                    </div>
                </motion.div>
            </Link>
        </motion.div>
    );
}
