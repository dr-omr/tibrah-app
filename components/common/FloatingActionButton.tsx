/**
 * FloatingActionButton — Quick access FAB for common actions
 * Shows: AI Assistant, Book Appointment, Search, Scroll to top
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, X, Bot, CalendarPlus, Search, ArrowUp,
    MessageCircle, Sparkles
} from 'lucide-react';

interface FloatingActionButtonProps {
    onSearchOpen?: () => void;
}

export default function FloatingActionButton({ onSearchOpen }: FloatingActionButtonProps) {
    const router = useRouter();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Hide on certain pages where FAB would overlap
    const hiddenPages = ['/ai-assistant', '/login', '/register'];
    const isHidden = hiddenPages.some(p => router.pathname.startsWith(p));

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isHidden) return null;

    const actions = [
        {
            id: 'ai',
            label: 'المساعد الذكي',
            icon: <Bot className="w-5 h-5" />,
            color: 'bg-[#2D9B83]',
            onClick: () => { router.push('/ai-assistant'); setIsExpanded(false); },
        },
        {
            id: 'appointment',
            label: 'حجز موعد',
            icon: <CalendarPlus className="w-5 h-5" />,
            color: 'bg-blue-500',
            onClick: () => { router.push('/book-appointment'); setIsExpanded(false); },
        },
        {
            id: 'search',
            label: 'بحث',
            icon: <Search className="w-5 h-5" />,
            color: 'bg-purple-500',
            onClick: () => { onSearchOpen?.(); setIsExpanded(false); },
        },
        {
            id: 'whatsapp',
            label: 'واتساب',
            icon: <MessageCircle className="w-5 h-5" />,
            color: 'bg-green-500',
            onClick: () => { window.open('https://wa.me/967771447111', '_blank'); setIsExpanded(false); },
        },
    ];

    return (
        <>
            {/* Backdrop */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[998]"
                        onClick={() => setIsExpanded(false)}
                    />
                )}
            </AnimatePresence>

            <div className="fixed bottom-24 left-4 z-[999] flex flex-col-reverse items-center gap-3">
                {/* Scroll to top */}
                <AnimatePresence>
                    {showScrollTop && !isExpanded && (
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            onClick={scrollToTop}
                            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                        >
                            <ArrowUp className="w-4 h-4" />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* Action Items */}
                <AnimatePresence>
                    {isExpanded && actions.map((action, idx) => (
                        <motion.div
                            key={action.id}
                            initial={{ scale: 0, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0, opacity: 0, y: 20 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex items-center gap-2"
                        >
                            <span className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap">
                                {action.label}
                            </span>
                            <button
                                onClick={action.onClick}
                                className={`w-12 h-12 rounded-full ${action.color} text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform`}
                            >
                                {action.icon}
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Main FAB */}
                <motion.button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${isExpanded
                            ? 'bg-slate-800 dark:bg-slate-600 rotate-45'
                            : 'bg-gradient-to-br from-[#2D9B83] to-[#3FB39A]'
                        }`}
                    whileTap={{ scale: 0.9 }}
                >
                    {isExpanded ? (
                        <X className="w-6 h-6 text-white" />
                    ) : (
                        <Sparkles className="w-6 h-6 text-white" />
                    )}
                </motion.button>
            </div>
        </>
    );
}
