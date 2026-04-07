import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, X, SkipForward, SkipBack, Maximize2, Volume2 } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';

interface ContentPlayerProps {
    title: string;
    subtitle: string;
    type: 'audio' | 'video';
    src: string;
    thumbnail?: string;
    onClose: () => void;
}

export default function ContentPlayer({ title, subtitle, type, src, thumbnail, onClose }: ContentPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    // Simulate progress
    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    setIsPlaying(false);
                    return 0;
                }
                return prev + 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [isPlaying]);

    const handlePlayPause = () => {
        haptic.selection();
        setIsPlaying(!isPlaying);
    };

    if (isExpanded && type === 'video') {
        return (
            <div className="fixed inset-0 z-50 bg-black flex flex-col justify-center">
                <div className="absolute top-6 right-6 z-10 flex gap-4">
                    <button onClick={() => setIsExpanded(false)} className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center backdrop-blur-md">
                        <Maximize2 className="w-5 h-5 shrink-0" />
                    </button>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center backdrop-blur-md">
                        <X className="w-5 h-5 shrink-0" />
                    </button>
                </div>
                {/* Fake Video Player Placeholder */}
                <div className="w-full aspect-video bg-slate-900 border-y border-white/10 relative flex items-center justify-center">
                    {thumbnail && (
                        <img src={thumbnail} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                    )}
                    <button onClick={handlePlayPause} className="w-20 h-20 rounded-full bg-teal-500/80 text-white flex items-center justify-center backdrop-blur-md z-10 hover:bg-teal-400 transition-colors">
                        {isPlaying ? <Pause className="w-10 h-10 ml-1" /> : <Play className="w-10 h-10 ml-2" />}
                    </button>
                </div>
                
                <div className="absolute bottom-10 left-6 right-6">
                    <h2 className="text-white font-bold text-xl mb-1">{title}</h2>
                    <p className="text-white/60 text-sm mb-4">{subtitle}</p>
                    <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 max-w-sm w-full mx-auto z-50"
            >
                {/* Apple Music Style Floating Player */}
                <div 
                    onClick={() => type === 'video' && setIsExpanded(true)}
                    className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/50 dark:border-slate-700/50 rounded-3xl p-3 flex items-center gap-3 shadow-2xl overflow-hidden cursor-pointer group"
                >
                    {/* Background Progress Hint */}
                    <div className="absolute bottom-0 left-0 h-1 bg-teal-500/20 w-full">
                        <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                    </div>

                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden relative border border-slate-200/50 dark:border-slate-700/50">
                        {thumbnail ? (
                            <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Volume2 className="w-5 h-5 text-slate-400" />
                            </div>
                        )}
                        {isPlaying && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[2px]">
                                <div className="flex gap-0.5 h-3">
                                    <div className="w-1 bg-white animate-pulse" />
                                    <div className="w-1 bg-white animate-pulse delay-75" />
                                    <div className="w-1 bg-white animate-pulse delay-150" />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="text-[13px] font-bold text-slate-800 dark:text-white truncate">{title}</h4>
                        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                        <button onClick={handlePlayPause} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>
                        <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
