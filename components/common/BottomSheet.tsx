// components/common/BottomSheet.tsx
// Enhanced draggable bottom sheet with native mobile feel

import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';

interface BottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    snapPoints?: number[]; // percentages of viewport height, e.g. [50, 90]
    className?: string;
}

export default function BottomSheet({
    isOpen,
    onClose,
    title,
    children,
    snapPoints = [50, 85],
    className = '',
}: BottomSheetProps) {
    const [currentSnap, setCurrentSnap] = useState(0);
    const sheetRef = useRef<HTMLDivElement>(null);

    const handleDragEnd = useCallback((_: any, info: PanInfo) => {
        const velocity = info.velocity.y;
        const offset = info.offset.y;

        // Fast swipe down → close
        if (velocity > 500 || offset > 150) {
            onClose();
            return;
        }

        // Fast swipe up → expand to max snap
        if (velocity < -500) {
            setCurrentSnap(snapPoints.length - 1);
            return;
        }

        // Otherwise snap to nearest point based on position
        if (offset > 50) {
            if (currentSnap > 0) {
                setCurrentSnap(currentSnap - 1);
            } else {
                onClose();
            }
        } else if (offset < -50) {
            if (currentSnap < snapPoints.length - 1) {
                setCurrentSnap(currentSnap + 1);
            }
        }
    }, [currentSnap, onClose, snapPoints]);

    const sheetHeight = snapPoints[currentSnap] || 50;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Sheet */}
                    <motion.div
                        ref={sheetRef}
                        className={`fixed bottom-0 left-0 right-0 z-[101] bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl ${className}`}
                        style={{ maxHeight: '90vh' }}
                        initial={{ y: '100%' }}
                        animate={{ y: `${100 - sheetHeight}%`, height: `${sheetHeight}vh` }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={handleDragEnd}
                    >
                        {/* Drag Handle */}
                        <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
                            <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                        </div>

                        {/* Header */}
                        {title && (
                            <div className="flex items-center justify-between px-6 pb-3 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
                                <motion.button
                                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                                    whileTap={{ scale: 0.85 }}
                                    onClick={onClose}
                                >
                                    <X className="w-4 h-4 text-slate-500" />
                                </motion.button>
                            </div>
                        )}

                        {/* Content */}
                        <div className="overflow-y-auto px-6 py-4 flex-1" style={{ maxHeight: `calc(${sheetHeight}vh - 80px)` }}>
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
