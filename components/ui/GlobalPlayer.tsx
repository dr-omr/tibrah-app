import React, { useState } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { Play, Pause, X, Moon, Timer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';

export default function GlobalPlayer() {
    const { isPlaying, currentTrack, togglePlay, closePlayer, sleepTimer, setSleepTimer } = useAudio();
    const router = useRouter();
    const [showTimerMenu, setShowTimerMenu] = useState(false);

    if (!currentTrack) return null;

    return (
        <div className="fixed bottom-[85px] left-4 right-4 z-40 animate-in slide-in-from-bottom-5 duration-500 md:left-1/2 md:-translate-x-1/2 md:w-[500px] md:bottom-8">
            <div className="glass bg-slate-900/95 backdrop-blur-xl border-white/10 text-white rounded-2xl p-3 shadow-2xl flex items-center gap-3 relative overflow-hidden ring-1 ring-white/10">

                {/* Progress Bar (Fake for Tone/Rife) */}
                <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                    <div className={`h-full bg-primary ${isPlaying ? 'animate-pulse' : ''}`} style={{ width: '100%' }} />
                </div>

                {/* Icon / Art */}
                <div
                    className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 animate-pulse-soft cursor-pointer active:scale-95 transition-transform"
                    onClick={() => router.push('/frequencies')}
                >
                    <span className="text-xl">🎵</span>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => router.push('/frequencies')}>
                    <h3 className="font-bold text-sm truncate hover:text-primary transition-colors">{currentTrack.title}</h3>
                    <p className="text-xs text-white/60 truncate">
                        {currentTrack.frequency_hz ? `${currentTrack.frequency_hz} Hz` : 'تسلسل رايف'}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1">
                    
                    {/* Sleep Timer Toggle */}
                    <div className="relative">
                        <button 
                            onClick={(e) => { e.stopPropagation(); setShowTimerMenu(!showTimerMenu); }}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${sleepTimer ? 'bg-indigo-500/20 text-indigo-400' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                        >
                            <Moon className="w-4 h-4" />
                            {sleepTimer && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-500 rounded-full text-[8px] font-black flex items-center justify-center text-white border border-slate-900">
                                    {sleepTimer}
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {showTimerMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute bottom-full mb-2 right-0 w-36 rounded-xl overflow-hidden shadow-2xl border border-white/10"
                                    style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(16px)' }}
                                >
                                    <div className="px-3 py-2 border-b border-white/5 bg-white/5 flex items-center gap-2">
                                        <Timer className="w-3.5 h-3.5 text-indigo-400" />
                                        <span className="text-[10px] font-bold text-white/70">مؤقت إيقاف</span>
                                    </div>
                                    <div className="flex flex-col">
                                        {[15, 30, 45, 60].map(mins => (
                                            <button 
                                                key={mins}
                                                onClick={(e) => { e.stopPropagation(); setSleepTimer(mins); setShowTimerMenu(false); }}
                                                className={`px-3 py-2 text-xs font-bold text-right hover:bg-white/10 transition-colors ${sleepTimer === mins ? 'text-indigo-400 bg-indigo-500/10' : 'text-white/80'}`}
                                            >
                                                {mins} دقيقة
                                            </button>
                                        ))}
                                        {sleepTimer && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setSleepTimer(null); setShowTimerMenu(false); }}
                                                className="px-3 py-2 text-[11px] font-bold text-red-400 text-right hover:bg-red-500/10 transition-colors border-t border-white/5"
                                            >
                                                إلغاء المؤقت
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button onClick={togglePlay} className="w-9 h-9 ml-1 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current pl-0.5" />}
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); closePlayer(); }}
                        className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
