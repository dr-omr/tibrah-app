// components/tools/YouTubeEmbed.tsx
// ════════════════════════════════════════════════════════════════════════
// TIBRAH — YouTube Video Embed Component (Sprint F)
// ════════════════════════════════════════════════════════════════════════
//
// Lite YouTube embed — shows thumbnail first, loads iframe on click.
// Responsive, lazy-loaded, RTL-aware, no raw iframe dumping.
// ════════════════════════════════════════════════════════════════════════

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

interface YouTubeEmbedProps {
    videoId: string;
    title?: string;
    reason?: string;
    color?: string;
    /** Compact mode for inline section embeds vs hero */
    compact?: boolean;
}

export default function YouTubeEmbed({
    videoId,
    title,
    reason,
    color = '#8B5CF6',
    compact = false,
}: YouTubeEmbedProps) {
    const [activated, setActivated] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Lazy load — only show when visible in viewport
    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '200px' }
        );
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

    const handleActivate = useCallback(() => {
        setActivated(true);
    }, []);

    return (
        <div
            ref={containerRef}
            className={`rounded-[18px] overflow-hidden ${compact ? 'mb-3' : 'mb-4'}`}
            style={{
                background: 'rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.08)',
            }}
        >
            {/* Title + Reason */}
            {(title || reason) && (
                <div className={`px-4 ${compact ? 'pt-3 pb-2' : 'pt-4 pb-2.5'}`}>
                    {title && (
                        <p
                            className={`font-black text-slate-800 ${compact ? 'text-[12px]' : 'text-[13px]'} mb-0.5`}
                        >
                            🎬 {title}
                        </p>
                    )}
                    {reason && (
                        <p className="text-[10px] text-slate-400 font-medium">
                            {reason}
                        </p>
                    )}
                </div>
            )}

            {/* Video Area */}
            <div
                className="relative w-full"
                style={{ paddingBottom: '56.25%' /* 16:9 */ }}
            >
                {!isVisible ? (
                    /* Placeholder before intersection */
                    <div className="absolute inset-0 bg-slate-100 animate-pulse rounded-b-[18px]" />
                ) : !activated ? (
                    /* Thumbnail + Play button */
                    <motion.button
                        className="absolute inset-0 w-full h-full cursor-pointer group"
                        onClick={handleActivate}
                        whileTap={{ scale: 0.98 }}
                        aria-label={`تشغيل فيديو: ${title || videoId}`}
                    >
                        {/* Thumbnail */}
                        <img
                            src={thumbnailUrl}
                            alt={title || 'YouTube video thumbnail'}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                        />

                        {/* Gradient overlay */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background:
                                    'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55) 100%)',
                            }}
                        />

                        {/* Play button */}
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            whileHover={{ scale: 1.08 }}
                        >
                            <div
                                className="w-16 h-16 rounded-full flex items-center justify-center shadow-xl"
                                style={{
                                    background: `linear-gradient(135deg, ${color}, ${color}CC)`,
                                    boxShadow: `0 8px 32px ${color}44`,
                                }}
                            >
                                <Play
                                    className="w-7 h-7 text-white ml-0.5"
                                    fill="white"
                                />
                            </div>
                        </motion.div>

                        {/* Duration hint */}
                        <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm">
                            <span className="text-white text-[10px] font-bold">
                                ▶ اضغط للتشغيل
                            </span>
                        </div>
                    </motion.button>
                ) : (
                    /* Actual iframe — only loaded on click */
                    <iframe
                        className="absolute inset-0 w-full h-full border-0"
                        src={embedUrl}
                        title={title || 'YouTube video'}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        loading="lazy"
                    />
                )}
            </div>
        </div>
    );
}
