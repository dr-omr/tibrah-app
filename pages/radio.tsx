import React, { useEffect } from 'react';
import { useAudio } from '@/contexts/AudioContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, Waves, Radio as RadioIcon } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function RadioPage() {
    const { isPlaying, currentTrack, togglePlay, volume, setVolume } = useAudio();
    const router = useRouter();

    // If no track is loaded, maybe show a "Not Playing" state or redirect
    // For now, valid empty state.

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pb-24">
            <Head>
                <title>راديو طِبرَا - Tibrah Soul Radio</title>
            </Head>

            {/* Header */}
            <div className="p-6 flex items-center justify-between">
                <button onClick={() => router.back()} className="text-white/60 hover:text-white transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                </button>
                <span className="font-bold tracking-wider text-sm text-white/80">SOUL RADIO</span>
                <div className="w-6" /> {/* Spacer */}
            </div>

            {/* Main Player UI */}
            <div className="flex flex-col items-center justify-center px-8 py-4 space-y-8">

                {/* Visualizer / Art Area */}
                <div className="relative w-72 h-72 sm:w-96 sm:h-96">
                    {/* Glowing effects */}
                    <div className={`absolute inset-0 bg-gradient-to-tr from-[#2D9B83] to-purple-600 rounded-full blur-[60px] opacity-40 ${isPlaying ? 'animate-pulse' : ''}`} />

                    {/* Circle Container */}
                    <div className="relative w-full h-full rounded-full border-4 border-white/5 bg-white/5 backdrop-blur-3xl flex items-center justify-center shadow-2xl overflow-hidden">
                        {currentTrack ? (
                            <div className="text-center space-y-4 animate-in zoom-in duration-700">
                                <Waves className={`w-24 h-24 mx-auto text-white/90 ${isPlaying ? 'animate-pulse-soft' : ''}`} />
                                <div className="space-y-1">
                                    <div className="text-3xl font-bold">{currentTrack.frequency_hz || 'Rife'} <span className="text-lg font-normal text-white/60">Hz</span></div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center text-white/40">
                                <RadioIcon className="w-20 h-20 mx-auto mb-4 opacity-50" />
                                <p>اختر تردداً للبدء</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Track Info */}
                <div className="text-center space-y-2 w-full max-w-md">
                    <h1 className="text-2xl font-bold truncate">
                        {currentTrack?.title || 'لا يوجد تشغيل'}
                    </h1>
                    <p className="text-white/50 text-sm truncate">
                        {currentTrack?.description || 'اختر من مكتبة الترددات'}
                    </p>
                </div>

                {/* Controls */}
                <div className="w-full max-w-sm space-y-8">
                    {/* Progress (Visual Decoration for now as tones are infinite) */}
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r from-[#2D9B83] to-[#3FB39A] ${isPlaying ? 'animate-[progress_2s_linear_infinite]' : 'w-0'}`} />
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-between">
                        {/* Previous (Dummy) */}
                        <button className="text-white/40 hover:text-white transition-colors">
                            <SkipBack className="w-8 h-8" />
                        </button>

                        {/* Play/Pause */}
                        <button
                            onClick={togglePlay}
                            disabled={!currentTrack}
                            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-300
                                ${currentTrack
                                    ? 'bg-white text-slate-900 hover:scale-105 active:scale-95'
                                    : 'bg-white/10 text-white/20 cursor-not-allowed'}
                            `}
                        >
                            {isPlaying ? (
                                <Pause className="w-8 h-8 fill-current" />
                            ) : (
                                <Play className="w-8 h-8 fill-current ml-1" />
                            )}
                        </button>

                        {/* Next (Dummy) */}
                        <button className="text-white/40 hover:text-white transition-colors">
                            <SkipForward className="w-8 h-8" />
                        </button>
                    </div>

                    {/* Volume */}
                    <div className="flex items-center gap-4">
                        <Volume2 className="w-5 h-5 text-white/50" />
                        <Slider
                            value={[volume]}
                            max={1}
                            step={0.01}
                            onValueChange={(val) => setVolume(val[0])}
                            className="w-full cursor-grab active:cursor-grabbing"
                        />
                    </div>
                </div>

                {/* Library Button */}
                {!currentTrack && (
                    <button
                        onClick={() => router.push('/frequencies')}
                        className="mt-8 px-8 py-3 bg-[#2D9B83] hover:bg-[#25806C] text-white rounded-full font-bold shadow-lg shadow-[#2D9B83]/20 transition-all active:scale-95"
                    >
                        تصفح الترددات
                    </button>
                )}
            </div>
        </div>
    );
}
