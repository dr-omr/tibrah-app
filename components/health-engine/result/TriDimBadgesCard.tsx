// components/health-engine/result/TriDimBadgesCard.tsx
'use client';
import { motion } from 'framer-motion';
import type { TriDimBadgeBlock } from '../types';
import { W } from './shared/design-tokens';

interface Props { block: TriDimBadgeBlock; on: boolean; delay?: number; }

export function TriDimBadgesCard({ block, on, delay = 0.74 }: Props) {
    const dims = [
        { l: 'الاعتيادي', v: `${block.conventionalScore}/10`, color: W.teal,      sub: 'طب تقليدي' },
        { l: 'الوظيفي',   v: `${block.functionalScore}/10`,  color: '#7C3AED',   sub: block.topFunctionalPatternLabel },
        { l: 'الشعوري',   v: `${block.somaticScore}/10`,     color: '#DB2777',   sub: block.topSomaticThemeLabel },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={on ? { opacity: 1, y: 0 } : {}}
            transition={{ delay }}
            className="mx-4 mb-4">
            <p style={{ fontSize: 9, fontWeight: 900, color: W.textMuted, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>
                البصمة الصحية الثلاثية
            </p>
            <div className="grid grid-cols-3 gap-2">
                {dims.map((d, i) => (
                    <motion.div key={d.l}
                        initial={{ opacity: 0, scale: 0.87 }}
                        animate={on ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: delay + i * 0.07, type: 'spring', stiffness: 300, damping: 25 }}
                        className="relative overflow-hidden rounded-[20px] p-3"
                        style={{
                            background: W.glass,
                            border: `1px solid ${W.glassBorder}`,
                            backdropFilter: 'blur(24px) saturate(160%)',
                            boxShadow: `0 16px 40px rgba(0,0,0,0.45), 0 4px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.18)`,
                        }}>
                        {/* Upper sheen */}
                        <div className="absolute inset-x-0 top-0" style={{ height: '48%', background: W.sheen, borderRadius: '20px 20px 0 0' }} />
                        {/* Accent top strip */}
                        <div className="absolute top-0 left-[15%] right-[15%] h-[2.5px] rounded-b-full"
                            style={{ background: `linear-gradient(90deg, ${d.color}40, ${d.color}, ${d.color}40)`, boxShadow: `0 0 8px ${d.color}60` }} />
                        <p style={{ fontSize: 20, fontWeight: 900, color: d.color, lineHeight: 1, marginBottom: 3, textShadow: `0 0 16px ${d.color}60` }}>{d.v}</p>
                        <p style={{ fontSize: 8.5, fontWeight: 800, color: d.color, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d.l}</p>
                        <p className="line-clamp-2" style={{ fontSize: 8, color: W.textSub, lineHeight: 1.4, fontWeight: 500 }}>{d.sub}</p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
