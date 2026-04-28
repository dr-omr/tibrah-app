// components/health-engine/result/TodayActionCard.tsx
// ════════════════════════════════════════════════════════════════
// TIBRAH v9 — Today Action Card — Redesigned
// ════════════════════════════════════════════════════════════════
'use client';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import type { ResultActionBlock } from '../types';
import { W } from './shared/design-tokens';
import { GlassCard } from './shared/GlassCard';

interface Props { block: ResultActionBlock; on: boolean; }

const GREEN = '#059669';
const GREEN_LIGHT = '#34D399';

export function TodayActionCard({ block, on }: Props) {
    return (
        <GlassCard delay={0.58} on={on} className="mx-4 mb-4">
            {/* Top accent gradient strip */}
            <div className="absolute top-0 left-[10%] right-[10%] h-[3px] rounded-b-full pointer-events-none"
                style={{ background: `linear-gradient(90deg, ${GREEN}50, ${GREEN}, ${GREEN_LIGHT}, ${GREEN}50)` }} />
            {/* Right side glow */}
            <div className="absolute top-0 bottom-0 right-0 w-1 rounded-l-full pointer-events-none"
                style={{ background: `linear-gradient(to bottom, ${GREEN}, ${GREEN}40)` }} />
            {/* Ambient bottom glow */}
            <div className="absolute bottom-0 inset-x-0 pointer-events-none"
                style={{ height: '40%', background: `linear-gradient(0deg, ${GREEN}08 0%, transparent 100%)`, borderRadius: '0 0 26px 26px' }} />

            <div className="flex items-start gap-3.5 p-4 relative z-10">
                {/* Icon */}
                <motion.div
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex-shrink-0 relative overflow-hidden flex items-center justify-center"
                    style={{
                        width: 44, height: 44, borderRadius: 16,
                        background: `linear-gradient(145deg, rgba(255,255,255,0.88) 0%, ${GREEN}20 100%)`,
                        border: `1.5px solid rgba(255,255,255,0.88)`,
                        boxShadow: `0 6px 20px ${GREEN}20, inset 0 1.5px 0 rgba(255,255,255,0.95)`,
                    }}>
                    <div className="absolute inset-x-0 top-0 h-[48%]"
                        style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, transparent 100%)', borderRadius: '15px 15px 0 0' }} />
                    <Zap style={{ width: 18, height: 18, color: GREEN, position: 'relative', zIndex: 1 }} />
                </motion.div>

                <div className="flex-1">
                    <p style={{ fontSize: 8.5, fontWeight: 900, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 4 }}>
                        {block.sectionLabel}
                    </p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: W.textPrimary, lineHeight: 1.75 }}>
                        {block.body}
                    </p>
                </div>
            </div>
        </GlassCard>
    );
}
