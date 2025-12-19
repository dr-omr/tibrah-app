import React from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { Play, Pause, X, Volume2, Maximize2 } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useRouter } from 'next/router';

export default function GlobalPlayer() {
    const { isPlaying, currentTrack, togglePlay, volume, setVolume, playTrack } = useAudio();
    const router = useRouter();

    if (!currentTrack) return null;

    // Don't show on the specific player pages if we had them, but here we want it global
    // Maybe hide on specific full-screen flows if needed

    return (
        <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 duration-500 md:left-1/2 md:-translate-x-1/2 md:w-[500px] md:bottom-8">
            <div className="glass bg-slate-900/90 backdrop-blur-xl border-white/10 text-white rounded-2xl p-4 shadow-2xl flex items-center gap-4 relative overflow-hidden">

                {/* Progress Bar (Fake for Tone/Rife) or Real for Music */}
                <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                    <div className={`h-full bg-[#2D9B83] ${isPlaying ? 'animate-pulse' : ''}`} style={{ width: '100%' }} />
                </div>

                {/* Icon / Art */}
                <div className="w-12 h-12 rounded-xl bg-[#2D9B83]/20 flex items-center justify-center flex-shrink-0 animate-pulse-soft">
                    <span className="text-2xl">🎵</span>
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0" onClick={() => router.push('/frequencies')}>
                    <h3 className="font-bold text-sm truncate cursor-pointer hover:text-[#2D9B83] transition-colors">{currentTrack.title}</h3>
                    <p className="text-xs text-white/50 truncate">
                        {currentTrack.frequency_hz ? `${currentTrack.frequency_hz} Hz - tone` : 'Rife Sequence'}
                    </p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                    <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center hover:scale-105 transition-transform">
                        {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current pl-0.5" />}
                    </button>

                    {/* Volume (Hidden on mobile for space, or show on expand) */}
                    <div className="hidden sm:flex items-center gap-2 w-20">
                        <Volume2 className="w-4 h-4 text-white/50" />
                        <Slider
                            value={[volume]}
                            max={1}
                            step={0.1}
                            onValueChange={(val) => setVolume(val[0])}
                            className="w-16"
                        />
                    </div>

                    <button
                        onClick={() => playTrack(currentTrack)} // This creates a stop/close effect effectively if we change logic, but for now just hide context?
                        // Better: Add a close method to context or just stop
                        className="text-white/40 hover:text-white transition-colors"
                    >
                        {/* Actually we just want to stop/close */}
                        {/* Simple X to stop playback */}
                        <X className="w-5 h-5" onClick={(e) => { e.stopPropagation(); togglePlay(); }} />
                    </button>
                </div>
            </div>
        </div>
    );
}
