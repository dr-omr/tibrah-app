'use client';
/**
 * EscalationCard.tsx — بطاقة التصعيد الهادئة
 * ─────────────────────────────────────────────
 * Calm, low-profile card placed at the bottom of section pages.
 * Not dramatic — professional and action-oriented.
 */

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';

interface EscalationCardProps {
    color: string;
    /** CTA link */
    bookingHref?: string;
    /** Section-specific hints */
    hints?: string[];
}

const DEFAULT_HINTS = [
    'الأعراض لم تتحسن بعد ٧ أيام',
    'ظهرت أعراض جديدة مقلقة',
    'تكررت الأعراض بشكل ملحوظ',
    'تحتاج رأي طبي متخصص',
];

export function EscalationCard({
    color,
    bookingHref = '/book-appointment',
    hints = DEFAULT_HINTS,
}: EscalationCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30, delay: 0.2 }}
            className="mx-4 mb-6 rounded-[18px] p-4 relative overflow-hidden"
            style={{
                background: 'rgba(248,250,252,0.8)',
                border: '1px solid rgba(226,232,240,0.5)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
            }}
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <p className="text-[11px] font-black text-slate-600">متى تحتاج تقييمًا مباشرًا؟</p>
            </div>

            {/* Hints */}
            <ul className="mb-3 space-y-1.5">
                {hints.map((hint, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0"
                            style={{ background: `${color}40` }} />
                        <span className="text-[9.5px] text-slate-500 leading-relaxed">{hint}</span>
                    </li>
                ))}
            </ul>

            {/* CTA */}
            <Link href={bookingHref}>
                <motion.div
                    whileTap={{ scale: 0.96 }}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-[12px]"
                    style={{
                        background: `${color}10`,
                        border: `1px solid ${color}22`,
                    }}
                >
                    <span className="text-[10px] font-black" style={{ color }}>احجز موعدًا</span>
                    <ArrowLeft className="w-3 h-3" style={{ color, opacity: 0.6 }} />
                </motion.div>
            </Link>
        </motion.div>
    );
}
