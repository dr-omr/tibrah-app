// components/home/visitor/VisitorFloatingCTA.tsx
// Persistent glass pill — appears after 180px scroll
// Inspired by: iOS Dynamic Island · Vercel toolbar · Linear command bar
// Fades in with spring physics. Pulses green dot = doctor online.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { haptic } from '@/lib/HapticFeedback';

const SPRING = { type: 'spring' as const, stiffness: 500, damping: 38 };

export default function VisitorFloatingCTA() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 180);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 80, scale: 0.90 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 60, scale: 0.93 }}
                    transition={SPRING}
                    className="fixed bottom-[76px] left-1/2 -translate-x-1/2 z-50 pointer-events-none"
                    style={{ width: 'calc(100% - 32px)', maxWidth: 400 }}>

                    <Link href={createPageUrl('BookAppointment')}
                        onClick={() => haptic.impact()}
                        className="pointer-events-auto">
                        <motion.div
                            whileTap={{ scale: 0.964, transition: SPRING }}
                            className="relative flex items-center gap-3 px-5 py-3.5 rounded-full overflow-hidden"
                            style={{
                                background: 'rgba(255,255,255,0.88)',
                                backdropFilter: 'blur(28px) saturate(200%)',
                                WebkitBackdropFilter: 'blur(28px) saturate(200%)',
                                border: '1px solid rgba(255,255,255,0.90)',
                                boxShadow: '0 1px 0 rgba(255,255,255,1) inset, 0 12px 40px rgba(15,23,42,0.18), 0 4px 12px rgba(15,23,42,0.10)',
                            }}>

                            {/* Top edge reflection */}
                            <div className="absolute top-0 left-6 right-6 h-px rounded-full"
                                style={{ background: 'rgba(255,255,255,1)' }} />

                            {/* Live green dot */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                <motion.div className="w-2 h-2 rounded-full"
                                    style={{ background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.60)' }}
                                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }} />
                                <span className="text-[9px] font-bold" style={{ color: '#16A34A' }}>متاح</span>
                            </div>

                            {/* Divider */}
                            <div className="w-px h-4 rounded-full bg-slate-200 flex-shrink-0" />

                            {/* Label */}
                            <div className="flex-1 text-center">
                                <span className="text-[13.5px] font-black" style={{ color: '#0F172A' }}>
                                    احجز مع د. عمر الآن
                                </span>
                            </div>

                            {/* Icon pill */}
                            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: '#0D9488', boxShadow: '0 3px 10px rgba(13,148,136,0.40)' }}>
                                <Calendar className="w-3.5 h-3.5 text-white" />
                            </div>
                        </motion.div>
                    </Link>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
