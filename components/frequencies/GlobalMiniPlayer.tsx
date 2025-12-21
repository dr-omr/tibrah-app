import React from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { Play, Pause, X, Radio, Volume2 } from 'lucide-react';
import { useRouter } from 'next/router';

export default function GlobalMiniPlayer() {
    const { currentTrack, isPlaying, togglePlay, closePlayer } = useAudio();
    const router = useRouter();

    if (!currentTrack) return null;

    // Do not show on the full player page/radio page if we had one, but currently we don't have a dedicated full-screen player page other than frequencies.
    // Actually, let's keep it visible everywhere except maybe the checkout or if specifically hidden? 
    // The Layout handles padding, so it's safe to be fixed.

    return (
        <div className="fixed bottom-[80px] left-0 right-0 z-40 px-4 animate-in slide-in-from-bottom-5 fade-in duration-500">
            <div className="container-app mx-auto">
                <div
                    className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-white/10 flex items-center p-3 gap-3"
                    onClick={() => router.push('/frequencies')} // Go to frequencies page on click (could be expanded)
                >
                    {/* Visualizer / Icon */}
                    <div className="w-12 h-12 rounded-xl bg-[#2D9B83] flex items-center justify-center shrink-0 relative overflow-hidden">
                        {isPlaying ? (
                            <div className="flex items-center gap-0.5 h-4">
                                <div className="w-1 bg-white/80 rounded-full animate-[music-bar_1s_ease-in-out_infinite]" style={{ animationDelay: '0s' }} />
                                <div className="w-1 bg-white/80 rounded-full animate-[music-bar_1s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }} />
                                <div className="w-1 bg-white/80 rounded-full animate-[music-bar_1s_ease-in-out_infinite]" style={{ animationDelay: '0.4s' }} />
                            </div>
                        ) : (
                            <Radio className="w-6 h-6 text-white" />
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 pointer-events-none">
                        <h4 className="font-bold text-sm truncate leading-tight">
                            {currentTrack.title}
                        </h4>
                        <p className="text-xs text-white/60 truncate">
                            {currentTrack.description || 'جاري التشغيل...'}
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={togglePlay}
                            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                        >
                            {isPlaying ? (
                                <Pause className="w-5 h-5 text-white" fill="currentColor" />
                            ) : (
                                <Play className="w-5 h-5 text-white" fill="currentColor" />
                            )}
                        </button>

                        <button
                            onClick={closePlayer}
                            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
            <style jsx global>{`
                @keyframes music-bar {
                    0%, 100% { height: 4px; }
                    50% { height: 16px; }
                }
            `}</style>
        </div>
    );
}
