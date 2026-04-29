/**
 * FloatingActionButton — Premium Unified Quick Access
 * Merges FAB actions + AI Assistant into one elegant button
 * Features: AI chat, booking, WhatsApp, scroll-to-top
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import {
    X, Bot, CalendarPlus, Search, ArrowUp,
    MessageCircle, Sparkles
} from 'lucide-react';

// Lazy-load the ChatInterface only when user opens it
const ChatInterface = dynamic(() => import('../agents/ChatInterface'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
    ),
});

import { useSearch } from '@/components/search-engine';

export default function FloatingActionButton() {
    const router = useRouter();
    const { openSearch } = useSearch();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    // Hide on certain pages
    const hiddenPages = ['/login', '/register'];
    const isHidden = hiddenPages.some(p => router.pathname.startsWith(p));

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleAction = useCallback((action: string) => {
        setIsExpanded(false);
        switch (action) {
            case 'ai':
                setShowChat(true);
                break;
            case 'appointment':
                router.push('/book-appointment');
                break;
            case 'search':
                openSearch();
                break;
            case 'whatsapp':
                window.open('https://wa.me/967771447111', '_blank');
                break;
        }
    }, [router, openSearch]);

    if (isHidden) return null;

    const actions = [
        {
            id: 'ai',
            label: 'المساعد الذكي',
            icon: <Bot className="w-5 h-5" />,
            gradient: 'from-primary to-primary-light',
        },
        {
            id: 'appointment',
            label: 'حجز موعد',
            icon: <CalendarPlus className="w-5 h-5" />,
            gradient: 'from-blue-500 to-blue-600',
        },
        {
            id: 'search',
            label: 'بحث',
            icon: <Search className="w-5 h-5" />,
            gradient: 'from-purple-500 to-violet-600',
        },
        {
            id: 'whatsapp',
            label: 'واتساب',
            icon: <MessageCircle className="w-5 h-5" />,
            gradient: 'from-green-500 to-emerald-600',
        },
    ];

    return (
        <>
            {/* ═══ Chat Panel ═══ */}
            {showChat && (
                <div className="fixed inset-0 z-[9998] flex items-end justify-start p-4 md:items-end md:justify-start">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-ios-fade-in"
                        onClick={() => setShowChat(false)}
                    />
                    {/* Chat Window */}
                    <div className="relative w-full md:w-[400px] h-[70vh] md:h-[600px] max-h-[80vh] mb-20 ml-0 md:ml-2 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-ios-spring-in">
                        {/* Chat Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-l from-primary to-primary-light">
                            <div className="flex items-center gap-2 text-white">
                                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">مساعد طِبرَا الذكي</p>
                                    <p className="text-xs opacity-80">متصل الآن</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowChat(false)}
                                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        {/* Chat Content */}
                        <div className="h-[calc(100%-56px)]">
                            <ChatInterface />
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Backdrop for expanded actions ═══ */}
            {isExpanded && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[998] animate-ios-fade-in"
                    onClick={() => setIsExpanded(false)}
                />
            )}

            {/* ═══ FAB Container ═══ */}
            <div className="fixed bottom-24 left-4 z-[999] flex flex-col-reverse items-center gap-4">

                {/* Action Items — expand upward */}
                {isExpanded && actions.map((action, idx) => (
                    <div
                        key={action.id}
                        className="flex items-center gap-2 animate-ios-spring-in"
                        style={{ animationDelay: `${idx * 50}ms` }}
                    >
                        <span className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-md whitespace-nowrap">
                            {action.label}
                        </span>
                        <button
                            onClick={() => handleAction(action.id)}
                            className={`w-12 h-12 rounded-full bg-gradient-to-br ${action.gradient} text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-transform`}
                        >
                            {action.icon}
                        </button>
                    </div>
                ))}

                {/* ═══ Main FAB Button ═══ */}
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${isExpanded
                        ? 'bg-slate-800 dark:bg-slate-600'
                        : 'bg-gradient-to-br from-primary to-primary-light'
                        }`}
                >
                    {/* Pulse ring — only when collapsed */}
                    {!isExpanded && !showChat && (
                        <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
                    )}

                    <div className="relative z-10 transition-transform duration-300" style={{ transform: isExpanded ? 'rotate(45deg)' : 'none' }}>
                        {isExpanded ? (
                            <X className="w-6 h-6 text-white" />
                        ) : (
                            <Sparkles className="w-6 h-6 text-white" />
                        )}
                    </div>

                    {/* Notification dot */}
                    {!isExpanded && !showChat && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
                    )}
                </button>
            </div>
        </>
    );
}
