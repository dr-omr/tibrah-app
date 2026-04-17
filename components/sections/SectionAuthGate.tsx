'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import type { SectionDefinition } from './section-tokens';
import { SP, wg } from './section-shared';

/* ════════════════════════════════════════════════════
   AUTH GATE
════════════════════════════════════════════════════ */
export function SectionAuthGate({ section }: { section: SectionDefinition }) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-8 pb-28"
            style={{ background: `linear-gradient(160deg, ${section.color}10, #F0FAF9)` }}>
            <div className="fixed top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
                style={{ background: `radial-gradient(circle, ${section.color}14, transparent 70%)` }} />
            <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={SP}
                className="w-20 h-20 rounded-[28px] flex items-center justify-center"
                style={{ ...wg(section.color, section.colorAlt), border: `1.5px solid ${section.color}22` }}
            >
                <span className="text-4xl">{section.emoji}</span>
            </motion.div>
            <div className="text-center">
                <Lock className="w-5 h-5 mx-auto mb-2" style={{ color: section.color }} />
                <h2 className="text-[20px] font-black text-slate-800 mb-1">محتوى مقيّد</h2>
                <p className="text-[13px] text-slate-500">قسم {section.arabicName} للمشتركين فقط</p>
            </div>
            <Link href="/login">
                <motion.div whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2 px-6 py-3 rounded-full"
                    style={{
                        background: `linear-gradient(135deg, ${section.color}, ${section.colorAlt})`,
                        boxShadow: `0 8px 24px ${section.color}30`, color: 'white',
                    }}>
                    <span className="text-[14px] font-black">سجّل الدخول</span>
                    <ArrowRight className="w-4 h-4" />
                </motion.div>
            </Link>
        </div>
    );
}
