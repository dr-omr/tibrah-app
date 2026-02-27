// components/common/PullToRefresh.tsx
// Visual Pull-to-Refresh indicator component

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowDown } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
    className?: string;
}

export default function PullToRefresh({ onRefresh, children, className = '' }: PullToRefreshProps) {
    const { containerRef, pullDistance, refreshing, progress } = usePullToRefresh({
        onRefresh,
        threshold: 80,
        maxPull: 120,
    });

    return (
        <div ref={containerRef} className={`relative overflow-y-auto ${className}`}>
            {/* Pull indicator */}
            <AnimatePresence>
                {(pullDistance > 10 || refreshing) && (
                    <motion.div
                        className="flex items-center justify-center py-4 absolute top-0 left-0 right-0 z-50"
                        style={{ transform: `translateY(${pullDistance - 40}px)` }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="w-10 h-10 rounded-full bg-emerald-500 shadow-lg flex items-center justify-center"
                            style={{
                                scale: 0.5 + progress * 0.5,
                            }}
                        >
                            {refreshing ? (
                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                            ) : (
                                <motion.div
                                    style={{ rotate: progress * 180 }}
                                >
                                    <ArrowDown className="w-5 h-5 text-white" />
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content with pull offset */}
            <motion.div
                style={{
                    transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
                    transition: pullDistance === 0 ? 'transform 0.3s ease' : undefined,
                }}
            >
                {children}
            </motion.div>
        </div>
    );
}
