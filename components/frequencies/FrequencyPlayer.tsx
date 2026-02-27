import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Timer, Music, X, Waves } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

export default function FrequencyPlayer({
    frequency,
    isPlaying,
    onClose,
    onTogglePlay
}) {
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [timer, setTimer] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [showTimer, setShowTimer] = useState(false);
    const [musicEnabled, setMusicEnabled] = useState(false);

    const audioContextRef = useRef(null);
    const oscillatorRef = useRef(null);
    const gainNodeRef = useRef(null);

    // Create and manage audio
    useEffect(() => {
        if (frequency && isPlaying) {
            // Create audio context if not exists or closed
            if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }

            // Resume if suspended (for iOS)
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }

            // Stop any existing oscillator
            if (oscillatorRef.current) {
                try {
                    oscillatorRef.current.stop();
                    oscillatorRef.current.disconnect();
                } catch (e) { }
            }

            oscillatorRef.current = audioContextRef.current.createOscillator();
            gainNodeRef.current = audioContextRef.current.createGain();

            oscillatorRef.current.type = 'sine';
            oscillatorRef.current.frequency.setValueAtTime(
                frequency.frequency_hz,
                audioContextRef.current.currentTime
            );

            oscillatorRef.current.connect(gainNodeRef.current);
            gainNodeRef.current.connect(audioContextRef.current.destination);
            gainNodeRef.current.gain.setValueAtTime(
                isMuted ? 0 : volume * 0.3,
                audioContextRef.current.currentTime
            );

            oscillatorRef.current.start();

            return () => {
                try {
                    oscillatorRef.current?.stop();
                    oscillatorRef.current?.disconnect();
                } catch (e) { }
            };
        } else if (!isPlaying && oscillatorRef.current) {
            // Stop when not playing
            try {
                oscillatorRef.current.stop();
                oscillatorRef.current.disconnect();
                oscillatorRef.current = null;
            } catch (e) { }
        }
    }, [frequency, isPlaying]);

    // Update volume
    useEffect(() => {
        if (gainNodeRef.current && audioContextRef.current) {
            gainNodeRef.current.gain.setValueAtTime(
                isMuted ? 0 : volume * 0.3,
                audioContextRef.current.currentTime
            );
        }
    }, [volume, isMuted]);

    // Timer logic
    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setElapsed(prev => prev + 1);
                if (timerActive && timer > 0) {
                    setTimer(prev => {
                        if (prev <= 1) {
                            onTogglePlay();
                            setTimerActive(false);
                            return 0;
                        }
                        return prev - 1;
                    });
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, timerActive, timer]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const timerPresets = [5, 10, 15, 30, 60];

    if (!frequency) return null;

    return (
        <div className="fixed bottom-24 left-4 right-4 z-40">
            <div className="glass-dark rounded-3xl p-4 shadow-glow">
                {/* Visualizer */}
                {isPlaying && (
                    <div className="flex items-center justify-center gap-1 mb-4">
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1 bg-gradient-to-t from-[#2D9B83] to-[#3FB39A] rounded-full animate-pulse"
                                style={{
                                    height: `${Math.random() * 24 + 8}px`,
                                    animationDelay: `${i * 0.1}s`,
                                    animationDuration: `${0.5 + Math.random() * 0.5}s`
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Main Info */}
                <div className="flex items-center gap-4">
                    {/* Play/Pause Button */}
                    <button
                        onClick={onTogglePlay}
                        className={`w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg ${isPlaying ? 'animate-breathe' : ''
                            }`}
                    >
                        {isPlaying ? (
                            <Pause className="w-6 h-6 text-white" />
                        ) : (
                            <Play className="w-6 h-6 text-white mr-[-2px]" />
                        )}
                    </button>

                    {/* Frequency Info */}
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-800">{frequency.name}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-gradient">
                                {frequency.frequency_hz}
                            </span>
                            <span className="text-slate-500">Hz</span>
                            {isPlaying && (
                                <span className="text-sm text-slate-400">
                                    {formatTime(elapsed)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Close Button */}
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={onClose}
                        className="text-slate-400"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Controls */}
                <div className="mt-4 flex items-center gap-3">
                    {/* Volume */}
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setIsMuted(!isMuted)}
                        className="text-slate-500"
                    >
                        {isMuted ? (
                            <VolumeX className="w-5 h-5" />
                        ) : (
                            <Volume2 className="w-5 h-5" />
                        )}
                    </Button>

                    <Slider
                        value={[isMuted ? 0 : volume * 100]}
                        onValueChange={(v) => {
                            setVolume(v[0] / 100);
                            if (v[0] > 0) setIsMuted(false);
                        }}
                        max={100}
                        className="flex-1"
                    />

                    {/* Timer */}
                    <Sheet open={showTimer} onOpenChange={setShowTimer}>
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setShowTimer(true)}
                            className={timerActive ? 'text-[#2D9B83]' : 'text-slate-500'}
                        >
                            <Timer className="w-5 h-5" />
                        </Button>
                        <SheetContent side="bottom" className="rounded-t-3xl">
                            <SheetHeader>
                                <SheetTitle className="text-right">مؤقت النوم</SheetTitle>
                            </SheetHeader>
                            <div className="py-6">
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {timerPresets.map((mins) => (
                                        <Button
                                            key={mins}
                                            variant={timer === mins * 60 && timerActive ? 'default' : 'outline'}
                                            className={`rounded-xl ${timer === mins * 60 && timerActive
                                                ? 'gradient-primary text-white'
                                                : 'glass border-0'
                                                }`}
                                            onClick={() => {
                                                setTimer(mins * 60);
                                                setTimerActive(true);
                                                setShowTimer(false);
                                            }}
                                        >
                                            {mins} دقيقة
                                        </Button>
                                    ))}
                                </div>
                                {timerActive && (
                                    <div className="text-center mt-6">
                                        <p className="text-slate-500 text-sm mb-2">الوقت المتبقي</p>
                                        <p className="text-3xl font-bold text-gradient">{formatTime(timer)}</p>
                                        <Button
                                            variant="ghost"
                                            className="mt-2 text-red-500"
                                            onClick={() => {
                                                setTimerActive(false);
                                                setTimer(0);
                                            }}
                                        >
                                            إلغاء المؤقت
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </SheetContent>
                    </Sheet>

                    {/* Music Mix Toggle */}
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setMusicEnabled(!musicEnabled)}
                        className={musicEnabled ? 'text-[#2D9B83]' : 'text-slate-500'}
                    >
                        <Music className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}