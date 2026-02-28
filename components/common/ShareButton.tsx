/**
 * ShareButton — Universal share component for any content
 * Supports: WhatsApp, Copy to clipboard, Native share API
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, MessageCircle, Copy, Check, X } from 'lucide-react';

interface ShareButtonProps {
    title: string;
    text: string;
    url?: string;
    whatsappNumber?: string;
    className?: string;
    variant?: 'icon' | 'button';
}

export default function ShareButton({
    title,
    text,
    url,
    whatsappNumber = '967771447111',
    className = '',
    variant = 'icon',
}: ShareButtonProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [copied, setCopied] = useState(false);

    const fullText = url ? `${text}\n\n${url}` : text;

    const shareWhatsApp = () => {
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(fullText)}`, '_blank');
        setShowMenu(false);
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(fullText);
            setCopied(true);
            setTimeout(() => { setCopied(false); setShowMenu(false); }, 1500);
        } catch { /* fallback */ }
    };

    const nativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title, text, url: url || undefined });
            } catch { /* user cancelled */ }
        }
        setShowMenu(false);
    };

    const handleClick = () => {
        // Use native share on mobile if available
        if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
            nativeShare();
        } else {
            setShowMenu(!showMenu);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handleClick}
                className={`${variant === 'button'
                    ? 'flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium'
                    : 'p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
                    } transition-colors ${className}`}
            >
                <Share2 className="w-4 h-4" />
                {variant === 'button' && <span>مشاركة</span>}
            </button>

            <AnimatePresence>
                {showMenu && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute left-0 bottom-full mb-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 min-w-[180px]"
                        >
                            <button
                                onClick={shareWhatsApp}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-right"
                            >
                                <MessageCircle className="w-5 h-5 text-green-500" />
                                <span className="text-sm text-slate-700 dark:text-slate-200">واتساب</span>
                            </button>

                            <button
                                onClick={copyToClipboard}
                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-right"
                            >
                                {copied ? (
                                    <Check className="w-5 h-5 text-green-500" />
                                ) : (
                                    <Copy className="w-5 h-5 text-slate-400" />
                                )}
                                <span className="text-sm text-slate-700 dark:text-slate-200">
                                    {copied ? 'تم النسخ!' : 'نسخ'}
                                </span>
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
