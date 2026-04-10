// components/health-engine/steps/StepWelcome.tsx
// THIE v4 — Material You / Google Pixel Health welcome
// Reference: Google Fit, Pixel Recorder, Microsoft Health & Fitness

'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Lock, Zap, Sparkles, Shield, ChevronLeft } from 'lucide-react';
import { BottomCTA } from '../ui/BottomCTA';
import { haptic } from '@/lib/HapticFeedback';

/*
 * M3 stagger animation — copied from Android 12 shared element transitions
 */
const stagger = (i: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: 0.08 + i * 0.07, type: 'spring' as const, stiffness: 280, damping: 26 },
});

/* Animated ECG pulse line */
function HeartbeatLine() {
    return (
        <svg viewBox="0 0 300 48" className="w-full" preserveAspectRatio="none" aria-hidden>
            <motion.polyline
                points="0,24 30,24 44,8 54,40 64,8 74,40 84,24 120,24 136,18 152,24 168,30 184,24 300,24"
                fill="none"
                stroke="url(#hb-grad)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.6 }}
            />
            <defs>
                <linearGradient id="hb-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0d9488" stopOpacity="0" />
                    <stop offset="45%" stopColor="#0d9488" />
                    <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
            </defs>
        </svg>
    );
}

/* M3 Tonal icon button pill */
function FeaturePill({ icon: Icon, label, color, tonalBg }: {
    icon: typeof Brain; label: string; color: string; tonalBg: string;
}) {
    return (
        <div className="flex items-center gap-2 px-3 py-2 rounded-2xl m3-state"
            style={{ background: tonalBg, border: `1px solid ${color}18` }}>
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: color + '20' }}>
                <Icon className="w-3.5 h-3.5" style={{ color }} />
            </div>
            <span className="m3-label-lg" style={{ color, textTransform: 'none', fontSize: 11.5 }}>{label}</span>
        </div>
    );
}

const PILLS = [
    { icon: Brain, label: 'ذكاء سريري', color: '#5b21b6', tonalBg: '#f5f3ff' },
    { icon: Zap, label: 'دقيقتان', color: '#b45309', tonalBg: '#fff8ed' },
    { icon: Lock, label: 'سري تماماً', color: '#0f766e', tonalBg: '#f0fdfa' },
    { icon: Sparkles, label: 'مجاناً', color: '#be185d', tonalBg: '#fdf2f8' },
];

export function StepWelcome({ onStart }: { onStart: () => void }) {
    const [ready, setReady] = useState(false);
    useEffect(() => { const t = setTimeout(() => setReady(true), 200); return () => clearTimeout(t); }, []);

    return (
        <div className="flex flex-col items-center text-center px-5">
            {/* ── Hero orb — M3 "expressive" shape ── */}
            <motion.div
                {...stagger(0)}
                className="relative mt-6 mb-6">
                {/* Tonal surface ring 1 */}
                <motion.div className="absolute inset-0 rounded-[36px]"
                    style={{ background: 'rgba(13,148,136,0.07)', transform: 'scale(1.28)' }}
                    animate={{ scale: [1.28, 1.34, 1.28] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Tonal surface ring 2 */}
                <motion.div className="absolute inset-0 rounded-[36px]"
                    style={{ background: 'rgba(99,102,241,0.05)', transform: 'scale(1.56)' }}
                    animate={{ scale: [1.56, 1.64, 1.56] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                />

                {/* Core — M3 filled container */}
                <motion.div
                    onClick={() => haptic.impact()}
                    whileTap={{ scale: 0.94 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                    className="w-[100px] h-[100px] rounded-[32px] flex items-center justify-center relative z-10 cursor-pointer"
                    style={{
                        background: 'linear-gradient(145deg, #0d9488 0%, #0a7a70 35%, #6366f1 100%)',
                        boxShadow: '0 8px 32px rgba(13,148,136,0.28), 0 2px 8px rgba(0,0,0,0.10)',
                    }}>
                    {/* Inner gloss — M3 surface tint */}
                    <div className="absolute inset-[1px] rounded-[31px]"
                        style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.2) 0%, transparent 55%)' }} />
                    <Brain className="w-[52px] h-[52px] text-white relative z-10" strokeWidth={1.4} />
                </motion.div>
            </motion.div>

            {/* ECG line */}
            <motion.div {...stagger(1)} className="w-full max-w-[260px] mb-7 opacity-80">
                {ready && <HeartbeatLine />}
            </motion.div>

            {/* ── M3 Typography — Display + Body ── */}
            <motion.div {...stagger(2)} className="mb-6 w-full">
                <p className="m3-label-sm text-teal-700 mb-3">محرك الذكاء الصحي · طِبرَا</p>

                <h1 className="m3-display-sm text-slate-900 mb-4">
                    جسدك يحكي.
                    <br />
                    <span className="text-transparent bg-clip-text"
                        style={{ backgroundImage: 'linear-gradient(135deg, #0d9488 15%, #6366f1 85%)' }}>
                        نحن نفهمه.
                    </span>
                </h1>

                <p className="m3-body-lg text-slate-500 max-w-[270px] mx-auto leading-relaxed">
                    تحليل سريري متعدد الأبعاد — جسدي، وظيفي، وعاطفي — في دقيقتين.
                </p>
            </motion.div>

            {/* Feature pills — M3 Tonal Chip Grid */}
            <motion.div {...stagger(3)} className="flex flex-wrap gap-2 justify-center mb-7">
                {PILLS.map((p, i) => (
                    <motion.div key={p.label}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={ready ? { opacity: 1, scale: 1 } : {}}
                        transition={{ delay: 0.32 + i * 0.06, type: 'spring', stiffness: 380, damping: 28 }}>
                        <FeaturePill {...p} />
                    </motion.div>
                ))}
            </motion.div>

            {/* M3 Outlined info container — warning */}
            <motion.div {...stagger(4)}
                className="w-full max-w-xs rounded-[20px] p-3.5 flex items-start gap-3 mb-4"
                style={{ background: '#fff8ed', border: '1.5px solid #fde68a' }}>
                <span className="text-[16px] flex-shrink-0 mt-0.5">⚠️</span>
                <p className="m3-body-md text-amber-800/80 text-right leading-relaxed">
                    في الحالات الطارئة التي تهدد الحياة، توجه للطوارئ فوراً.
                </p>
            </motion.div>

            {/* Doctor info — M3 Outlined chip */}
            <motion.div {...stagger(5)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-2"
                style={{ background: '#f0fdfa', border: '1px solid rgba(13,148,136,0.2)' }}>
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <p className="m3-label-lg text-teal-700" style={{ textTransform: 'none', fontSize: 11 }}>
                    بإشراف د. عمر العماد — طب وظيفي وتكاملي
                </p>
            </motion.div>

            <BottomCTA
                label="ابدأ التحليل الآن"
                onPress={onStart}
                variant="gradient"
                sublabel="آمن · سري · مجاني"
            />
        </div>
    );
}
