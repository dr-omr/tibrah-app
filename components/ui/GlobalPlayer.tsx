import React from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { Play, Pause, X, Volume2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useRouter } from 'next/router';

export default function GlobalPlayer() {
    const { isPlaying, currentTrack, togglePlay, closePlayer, volume, setVolume } = useAudio();
    const router = useRouter();

    if (!currentTrack) return null;

    return (
        <div className="fixed bottom-[85px] left-4 right-4 z-40 animate-in slide-in-from-bottom-5 duration-500 md:left-1/2 md:-translate-x-1/2 md:w-[500px] md:bottom-8">
            <div className="glass bg-slate-900/95 backdrop-blur-xl border-white/10 text-white rounded-2xl p-3 shadow-2xl flex items-center gap-3 relative overflow-hidden ring-1 ring-white/10">

                {/* Progress Bar (Fake for Tone/Rife) */}
                <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                    <div className={`h-full bg-[#2D9B83] ${isPlaying ? 'animate-pulse' : ''}`} style={{ width: '100%' }} />
                </div>

                {/* Icon / Art */}
                <div
                    className="w-10 h-10 rounded-xl bg-[#2D9B83]/20 flex items-center justify-center flex-shrink-0 animate-pulse-soft cursor-pointer active:scale-95 transition-transform"
                    onClick={() => router.push('/frequencies')}
                >
                    <span className="text-xl">🎵</span>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => router.push('/frequencies')}>
                    <h3 className="font-bold text-sm truncate hover:text-[#2D9B83] transition-colors">{currentTrack.title}</h3>
                    <p className="text-[10px] text-white/60 truncate">
                        {currentTrack.frequency_hz ? `${currentTrack.frequency_hz} Hz` : 'تسلسل رايف'}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <button onClick={togglePlay} className="w-9 h-9 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
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
