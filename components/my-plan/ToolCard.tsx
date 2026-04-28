// components/my-plan/ToolCard.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Tool Card (with sequence badges + completion state)
// ════════════════════════════════════════════════════════════════════

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, CheckCircle2, Clock } from 'lucide-react';
import { hasToolPage, getToolPageUrl } from '@/lib/tool-content-map';
import { GLASS, TXT, TOOL_ICON, TOOL_LABEL } from './plan-tokens';
import type { ToolBadge } from '@/lib/recommendation-sequencer';
import type { ToolRecommendation } from '@/components/health-engine/types';

export function ToolCard({
    tool, index, isOpened, domainColor, onTap, badge, badgeAr, isCompleted,
}: {
    tool: ToolRecommendation;
    index: number;
    isOpened: boolean;
    domainColor: string;
    onTap: () => void;
    badge?: ToolBadge;
    badgeAr?: string;
    isCompleted?: boolean;
}) {
    const Icon = TOOL_ICON[tool.type] ?? BookOpen;
    const done = isCompleted ?? false;

    // توجيه لصفحة الأداة الحقيقية إذا وُجدت
    const toolHref = hasToolPage(tool.id)
        ? getToolPageUrl(tool.type, tool.id)
        : tool.href;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.08, type: 'spring', stiffness: 240, damping: 24 }}
        >
            <Link href={toolHref} onClick={onTap}>
                <motion.div
                    whileTap={{ scale: 0.965, y: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="relative overflow-hidden"
                    style={{
                        borderRadius: 20,
                        marginBottom: 10,
                        background: isOpened
                            ? 'rgba(0,255,180,0.07)'
                            : GLASS.base,
                        border: `1px solid ${isOpened
                            ? 'rgba(0,255,180,0.25)'
                            : GLASS.border}`,
                        backdropFilter: 'blur(20px)',
                        boxShadow: isOpened
                            ? `${GLASS.shadowSm}, 0 0 24px rgba(0,255,180,0.12)`
                            : GLASS.shadowSm,
                    }}
                >
                    {/* شريط اللون الجانبي */}
                    <div
                        className="absolute right-0 top-3 bottom-3"
                        style={{
                            width: 3.5,
                            borderRadius: 99,
                            background: isOpened
                                ? `linear-gradient(to bottom, rgba(0,255,180,0.9), rgba(0,255,180,0.4))`
                                : `linear-gradient(to bottom, ${domainColor}, ${domainColor}44)`,
                            boxShadow: `0 0 8px ${isOpened ? 'rgba(0,255,180,0.5)' : `${domainColor}50`}`,
                        }}
                    />
                    {/* وميض علوي */}
                    <div
                        className="absolute inset-x-0 top-0 pointer-events-none"
                        style={{
                            height: '45%',
                            background: GLASS.sheen,
                            borderRadius: '20px 20px 0 0',
                        }}
                    />

                    <div className="flex items-center gap-3 px-4 py-3.5 pr-6">
                        {/* أيقونة الأداة */}
                        <div
                            className="relative flex-shrink-0 flex items-center justify-center overflow-hidden"
                            style={{
                                width: 50, height: 50, borderRadius: 16,
                                background: isOpened ? 'rgba(0,255,180,0.12)' : `${domainColor}18`,
                                border: `1px solid ${isOpened ? 'rgba(0,255,180,0.30)' : `${domainColor}28`}`,
                                boxShadow: isOpened
                                    ? '0 4px 12px rgba(0,255,180,0.15), inset 0 1px 0 rgba(255,255,255,0.15)'
                                    : 'inset 0 1px 0 rgba(255,255,255,0.12), 0 4px 10px rgba(0,0,0,0.25)',
                            }}
                        >
                            <div className="absolute inset-x-0 top-0" style={{
                                height: '50%',
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.20) 0%, transparent 100%)',
                                borderRadius: '15px 15px 0 0',
                            }} />
                            <span style={{ fontSize: 22, position: 'relative', zIndex: 1 }}>{tool.emoji}</span>
                            {isOpened && (
                                <div className="absolute -bottom-0.5 -left-0.5 flex items-center justify-center" style={{
                                    width: 18, height: 18, borderRadius: 99,
                                    background: 'rgba(0,200,140,0.95)',
                                    border: '1.5px solid rgba(255,255,255,0.9)',
                                    boxShadow: '0 2px 6px rgba(0,200,140,0.5)',
                                }}>
                                    <CheckCircle2 style={{ width: 9, height: 9, color: '#fff' }} />
                                </div>
                            )}
                        </div>

                        {/* محتوى */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                                <span style={{
                                    fontSize: 9, fontWeight: 900,
                                    color: isOpened ? 'rgba(0,255,180,0.85)' : domainColor,
                                    textTransform: 'uppercase', letterSpacing: '0.12em',
                                }}>{TOOL_LABEL[tool.type]}</span>
                                {badgeAr && !done && (
                                    <span style={{
                                        fontSize: 8, fontWeight: 800,
                                        background: `${domainColor}15`, color: domainColor,
                                        padding: '1px 6px', borderRadius: 99,
                                        border: `1px solid ${domainColor}25`,
                                    }}>{badgeAr}</span>
                                )}
                                {done && (
                                    <span style={{
                                        fontSize: 8, fontWeight: 800,
                                        background: 'rgba(0,200,140,0.15)', color: 'rgba(0,200,140,0.9)',
                                        padding: '1px 6px', borderRadius: 99,
                                        border: '1px solid rgba(0,200,140,0.25)',
                                    }}>✓ مكتمل</span>
                                )}
                                {!done && isOpened && (
                                    <span style={{
                                        fontSize: 8, fontWeight: 800,
                                        background: 'rgba(0,200,140,0.15)', color: 'rgba(0,200,140,0.9)',
                                        padding: '1px 6px', borderRadius: 99,
                                        border: '1px solid rgba(0,200,140,0.25)',
                                    }}>✓ مفتوح</span>
                                )}
                                {!tool.isFree && (
                                    <span style={{
                                        fontSize: 8, fontWeight: 900,
                                        background: 'rgba(245,158,11,0.18)', color: '#F59E0B',
                                        padding: '1px 6px', borderRadius: 99,
                                        border: '1px solid rgba(245,158,11,0.30)',
                                    }}>PRO</span>
                                )}
                            </div>
                            <p style={{
                                fontSize: 14, fontWeight: 800, color: TXT.primary,
                                lineHeight: 1.3, marginBottom: 3, letterSpacing: '-0.01em',
                            }}>{tool.arabicName}</p>
                            <p className="line-clamp-1" style={{
                                fontSize: 11, color: TXT.secondary,
                                fontWeight: 500, lineHeight: 1.4,
                            }}>{tool.description}</p>
                        </div>

                        {/* Meta + arrow */}
                        <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                            {tool.durationMinutes > 0 && (
                                <div className="flex items-center gap-1">
                                    <Clock style={{ width: 9, height: 9, color: TXT.muted }} />
                                    <span style={{ fontSize: 9, fontWeight: 700, color: TXT.muted }}>
                                        {tool.durationMinutes}د
                                    </span>
                                </div>
                            )}
                            <div style={{
                                width: 26, height: 26, borderRadius: 99,
                                background: `${domainColor}18`,
                                border: `1px solid ${domainColor}28`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <ArrowLeft style={{ width: 11, height: 11, color: domainColor, opacity: 0.8, transform: 'rotate(180deg)' }} />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </Link>
        </motion.div>
    );
}
