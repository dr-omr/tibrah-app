// components/tools/CompletionScreen.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Tool Completion Screen with check-in CTA + next-tool handoff
// ════════════════════════════════════════════════════════════════════

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, FileBarChart } from 'lucide-react';
import { trackEvent } from '@/lib/analytics';
import { hasCompletedSession } from '@/lib/assessment-session-store';

export function CompletionScreen({
    toolName, color, colorAlt, hasCheckinToday, toolId,
}: {
    toolName: string; color: string; colorAlt: string;
    hasCheckinToday: boolean; toolId: string;
}) {
    useEffect(() => {
        trackEvent('completion_screen_viewed', { tool_id: toolId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center"
        >
            <motion.div
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-[72px] mb-5"
            >🎉</motion.div>

            <h2 className="text-white text-[22px] font-black mb-2 leading-tight">
                أكملت {toolName}
            </h2>
            <p className="text-white/50 text-[13px] font-medium mb-8 max-w-[240px] leading-relaxed">
                كل إكمال يُقرّبك من التحسن الحقيقي. استمر.
            </p>

            {/* Primary: check-in if not done */}
            {!hasCheckinToday ? (
                <Link href="/protocol-checkin" className="w-full max-w-xs mb-3"
                    onClick={() => trackEvent('checkin_clicked_from_completion', { tool_id: toolId })}>
                    <motion.div whileTap={{ scale: 0.97 }}
                        className="py-4 rounded-[18px] flex items-center justify-center gap-2"
                        style={{
                            background: `linear-gradient(135deg, ${color}35, ${colorAlt}22)`,
                            border: `1.5px solid ${color}55`,
                            boxShadow: `0 10px 28px ${color}28`,
                        }}>
                        <span className="text-[16px]">📋</span>
                        <span className="text-white font-black text-[14px]">سجّل حالتك الآن</span>
                    </motion.div>
                </Link>
            ) : (
                <div className="w-full max-w-xs mb-3 py-3 px-4 rounded-[16px] flex items-center gap-2 justify-center"
                    style={{ background: 'rgba(0,200,140,0.10)', border: '1px solid rgba(0,200,140,0.22)' }}>
                    <span className="text-[14px]">✅</span>
                    <span className="text-[12px] font-black" style={{ color: 'rgba(0,140,90,0.9)' }}>
                        سجّلت اليوم بالفعل
                    </span>
                </div>
            )}

            {/* Secondary: back to plan */}
            <Link href="/my-plan" className="w-full max-w-xs"
                onClick={() => trackEvent('returned_to_my_plan', { source: 'completion_screen', tool_id: toolId })}>
                <motion.div whileTap={{ scale: 0.97 }}
                    className="py-3.5 rounded-[16px] flex items-center justify-center gap-2"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                    <span className="text-white/70 font-bold text-[13px]">عُد لخطّتي</span>
                    <ArrowLeft className="w-3.5 h-3.5 text-white/40" />
                </motion.div>
            </Link>

            {/* Return to assessment result */}
            {hasCompletedSession() && (
                <Link href="/assessment-result" className="w-full max-w-xs mt-2"
                    onClick={() => trackEvent('result_return_clicked', { from: 'completion_screen', tool_id: toolId })}>
                    <motion.div whileTap={{ scale: 0.97 }}
                        className="py-3 rounded-[14px] flex items-center justify-center gap-2"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <FileBarChart className="w-3 h-3 text-white/30" />
                        <span className="text-white/40 font-semibold text-[12px]">العودة إلى نتيجة التحليل</span>
                    </motion.div>
                </Link>
            )}
        </motion.div>
    );
}
