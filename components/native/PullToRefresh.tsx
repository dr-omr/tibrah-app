import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { motion, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import { haptic } from '@/lib/HapticFeedback';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { uiSounds } from '@/lib/uiSounds';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/notification-engine';
import { useRouter } from 'next/router';

interface PullToRefreshProps {
    children: ReactNode;
    onRefresh?: () => Promise<void>;
}

export default function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
    const triggerPull = 90;
    const loadingY = 70;

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    
    // Y tracks the distance of the user's drag
    const y = useMotionValue(0);
    const controls = useAnimation();
    const queryClient = useQueryClient();
    const router = useRouter();

    // ─── Floating Dynamic Pill Physics (No Root DOM Movement) ───
    const pathLength = useTransform(y, [0, triggerPull], [0, 1]);
    const opacity = useTransform(y, [10, triggerPull * 0.8], [0, 1]);
    
    // Liquid shape transformations for the independent pill
    const blockWidth = useTransform(y, [0, triggerPull], [120, 52]);
    const blockHeight = useTransform(y, [0, triggerPull], [0, 52]);
    const blockRadius = useTransform(y, [0, triggerPull], [4, 100]);
    
    const spinnerScale = useTransform(y, [triggerPull * 0.6, triggerPull], [0.3, 1]);
    const spinnerOpacity = useTransform(y, [triggerPull * 0.5, triggerPull], [0, 1]);
    const spinnerRotate = useTransform(y, [0, triggerPull], [-120, 360]);

    const startY = useRef(0);
    const currentY = useRef(0);
    const isPulling = useRef(false);
    const isReady = useRef(false);
    const lastHapticY = useRef(0);

    const checkIsAtTop = () => window.scrollY <= 0;

    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            if (!checkIsAtTop() || isRefreshing) return;
            startY.current = e.touches[0].clientY;
            lastHapticY.current = 0;
            isPulling.current = true;
            isReady.current = false;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isPulling.current) return;
            
            const diff = e.touches[0].clientY - startY.current;

            if (diff > 0 && checkIsAtTop()) {
                // Smooth logarithmic resistance (Apple Native Math)
                if (diff < triggerPull) {
                    currentY.current = diff * 0.85;
                } else {
                    currentY.current = triggerPull + Math.log(diff - triggerPull + 1) * 15;
                }
                
                y.set(currentY.current);

                // Granular Dial Haptics (like winding a watch)
                if (currentY.current < triggerPull) {
                    if (currentY.current - lastHapticY.current > 12) {
                        haptic.selection(); // Soft click every 12px
                        lastHapticY.current = currentY.current;
                    }
                }

                if (currentY.current >= triggerPull && !isReady.current) {
                    isReady.current = true;
                    haptic.trigger('heavy');
                    uiSounds.tap();
                    router.prefetch(router.pathname);
                } else if (currentY.current < triggerPull && isReady.current) {
                    isReady.current = false;
                    haptic.trigger('light');
                }
                
                // Prevent native bounce ONLY when pulling at top
                if (e.cancelable) e.preventDefault();
            }
        };

        const handleTouchEnd = async () => {
            if (!isPulling.current) return;
            isPulling.current = false;

            if (isReady.current && !isRefreshing) {
                setIsRefreshing(true);
                uiSounds.select();
                haptic.success();
                
                // Snap pill to loading position
                controls.start({ y: loadingY, transition: { type: 'spring', stiffness: 450, damping: 25 } });
                
                try {
                    if (onRefresh) {
                        await onRefresh();
                    } else {
                        await Promise.all([
                            queryClient.invalidateQueries(),
                            new Promise(resolve => setTimeout(resolve, 1400))
                        ]);
                    }
                    
                    setIsSuccess(true);
                    haptic.success();
                    toast.success('مزامنة ناجحة', { 
                        body: 'تم استحضار أحدث البيانات من السجلات بأعلى كفاءة',
                        duration: 3500,
                        addToFeed: false
                    });
                    
                    setTimeout(() => {
                        setIsSuccess(false);
                        setIsRefreshing(false);
                        controls.start({ y: 0, transition: { type: 'spring', stiffness: 500, damping: 35 } });
                        y.set(0);
                    }, 900);

                } catch (error) {
                    setIsRefreshing(false);
                    controls.start({ y: 0, transition: { type: 'spring', stiffness: 500, damping: 35 } });
                    y.set(0);
                }
            } else {
                haptic.trigger('light');
                controls.start({ y: 0, transition: { type: 'spring', stiffness: 600, damping: 30 } });
                y.set(0);
            }
            
            isReady.current = false;
            lastHapticY.current = 0;
        };

        // Attach listeners non-passively to intercept native overscroll properly
        const element = document.documentElement;
        element.addEventListener('touchstart', handleTouchStart, { passive: true });
        element.addEventListener('touchmove', handleTouchMove, { passive: false });
        element.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            element.removeEventListener('touchstart', handleTouchStart);
            element.removeEventListener('touchmove', handleTouchMove);
            element.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isRefreshing, onRefresh, controls, y, queryClient, router]);

    return (
        <div className="relative min-h-screen">
            {/* Decoupled Floating Pill Layer (Always on top, purely GPU accelerated) */}
            <motion.div 
                className="fixed top-0 left-0 right-0 flex items-start justify-center pointer-events-none z-[9999] overflow-visible will-change-transform"
                style={{ height: triggerPull, opacity }}
            >
                {/* Independent Morphing Pill */}
                <motion.div 
                    className="relative flex items-center justify-center bg-white/95 dark:bg-[#111111]/95 shadow-[0_12px_40px_-5px_rgba(0,0,0,0.18)] border border-black/5 dark:border-white/5 backdrop-blur-xl"
                    style={{ 
                        width: isRefreshing ? 52 : blockWidth, 
                        height: isRefreshing ? 52 : blockHeight, 
                        borderRadius: isRefreshing ? 100 : blockRadius,
                        marginTop: isRefreshing ? 0 : 0, 
                        y: isRefreshing ? y : y
                    }}
                    animate={controls}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                    {/* The Inner Spinner / Success Graphic */}
                    <motion.div 
                        className="absolute inset-0 flex items-center justify-center pointer-events-auto"
                        style={{ scale: isRefreshing ? 1 : spinnerScale, opacity: isRefreshing ? 1 : spinnerOpacity }}
                    >
                        {isSuccess ? (
                            <motion.div
                                initial={{ scale: 0, opacity: 0, rotate: -45 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                            >
                                <CheckCircle2 className="w-[26px] h-[26px] text-teal-600" />
                            </motion.div>
                        ) : isRefreshing ? (
                            <motion.div className="relative flex items-center justify-center w-full h-full">
                                <motion.svg
                                    className="absolute w-6 h-6 text-teal-600/20"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                >
                                    <circle cx="12" cy="12" r="9" />
                                </motion.svg>
                                <motion.svg
                                    className="absolute w-6 h-6 text-teal-600"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, ease: 'linear', duration: 0.8 }}
                                >
                                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                                </motion.svg>
                                <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                                    <Sparkles className="w-2.5 h-2.5 text-teal-600" />
                                </motion.div>
                            </motion.div>
                        ) : (
                            <div className="relative w-full h-full flex items-center justify-center">
                                {/* Trace path drawing */}
                                <motion.svg
                                    className="absolute w-6 h-6 text-teal-600"
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                                    style={{ rotate: spinnerRotate }}
                                >
                                    <motion.circle cx="12" cy="12" r="9" style={{ pathLength }} />
                                </motion.svg>
                                <Sparkles className="w-2.5 h-2.5 text-teal-600/70" />
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </motion.div>

            {/* 🔥 NO ROOT TRANSLATION. Native Web Rendering -> Insanely Fast 🔥 */}
            <div className="relative z-10 w-full min-h-screen bg-[#FBFDFD] dark:bg-[#0A0F16]">
                {children}
            </div>
        </div>
    );
}
