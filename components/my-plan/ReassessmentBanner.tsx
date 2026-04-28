// components/my-plan/ReassessmentBanner.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Reassessment Reminder Banner
// ════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function ReassessmentBanner({ daysSince }: { daysSince: number }) {
    const [dismissed, setDismissed] = useState(false);
    if (dismissed) return null;
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        >
            <div style={{
                borderRadius: 20, padding: '14px 16px',
                background: 'linear-gradient(145deg, rgba(245,158,11,0.10), rgba(245,158,11,0.05))',
                border: '1px solid rgba(245,158,11,0.30)',
                backdropFilter: 'blur(16px)',
            }}>
                <div className="flex items-start gap-3">
                    <div style={{ fontSize: 24, flexShrink: 0 }}>⏰</div>
                    <div className="flex-1">
                        <p style={{ fontSize: 13, fontWeight: 900, color: '#0C4A6E', marginBottom: 4 }}>
                            مرّ {daysSince} أيام على خطتك
                        </p>
                        <p style={{ fontSize: 11, color: '#0369A1', lineHeight: 1.6, marginBottom: 12 }}>
                            هل تحسّن وضعك؟ إعادة التقييم تُعطيك توجيهاً أدق بناءً على التغييرات.
                        </p>
                        <div className="flex gap-2">
                            <Link href="/symptom-checker">
                                <motion.div whileTap={{ scale: 0.94 }}
                                    style={{
                                        padding: '8px 16px', borderRadius: 12,
                                        background: 'rgba(245,158,11,0.85)',
                                        color: '#fff', fontSize: 12, fontWeight: 800,
                                    }}
                                >
                                    إعادة التقييم
                                </motion.div>
                            </Link>
                            <motion.button whileTap={{ scale: 0.94 }} onClick={() => setDismissed(true)}
                                style={{
                                    padding: '8px 14px', borderRadius: 12,
                                    background: 'rgba(255,255,255,0.50)',
                                    border: '1px solid rgba(255,255,255,0.80)',
                                    color: '#0369A1', fontSize: 12, fontWeight: 700,
                                }}
                            >
                                لاحقاً
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
