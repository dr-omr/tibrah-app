import React, { useState, useEffect, useRef } from 'react';
import {
    Play, Pause, Volume2, VolumeX, Timer, X, Plus, Minus,
    AlertTriangle, Info, Waves
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

export default function RifeFrequencyPlayer({
    rifeFrequency,
    isOpen,
    onClose,
}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [isMuted, setIsMuted] = useState(false);
    const [timer, setTimer] = useState(null);
    const [remainingTime, setRemainingTime] = useState(null);
    const [activeFrequencyIndex, setActiveFrequencyIndex] = useState(0);
    const [showDisclaimer, setShowDisclaimer] = useState(true);

    const audioContextRef = useRef(null);
    const oscillatorsRef = useRef([]);
    const gainNodeRef = useRef(null);

    useEffect(() => {
        return () => {
            stopAllOscillators();
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    useEffect(() => {
        if (remainingTime !== null && remainingTime > 0) {
            const interval = setInterval(() => {
                setRemainingTime(prev => {
                    if (prev <= 1) {
                        stopPlaying();
                        return null;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [remainingTime]);

    const initAudio = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            gainNodeRef.current = audioContextRef.current.createGain();
            gainNodeRef.current.connect(audioContextRef.current.destination);
            gainNodeRef.current.gain.value = volume;
        }
    };

    const startPlaying = () => {
        initAudio();

        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        stopAllOscillators();

        const frequencies = rifeFrequency.frequencies;
        const freq = frequencies[activeFrequencyIndex] || frequencies[0];

        const oscillator = audioContextRef.current.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = freq;
        oscillator.connect(gainNodeRef.current);
        oscillator.start();

        oscillatorsRef.current = [oscillator];
        setIsPlaying(true);
    };

    const stopPlaying = () => {
        stopAllOscillators();
        setIsPlaying(false);
        setRemainingTime(null);
    };

    const stopAllOscillators = () => {
        oscillatorsRef.current.forEach(osc => {
            try { osc.stop(); } catch (e) { }
        });
        oscillatorsRef.current = [];
    };

    const handleVolumeChange = (value) => {
        const newVolume = value[0];
        setVolume(newVolume);
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = isMuted ? 0 : newVolume;
        }
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = !isMuted ? 0 : volume;
        }
    };

    const setTimerDuration = (minutes) => {
        setTimer(minutes);
        setRemainingTime(minutes * 60);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const nextFrequency = () => {
        if (rifeFrequency.frequencies.length > 1) {
            const newIndex = (activeFrequencyIndex + 1) % rifeFrequency.frequencies.length;
            setActiveFrequencyIndex(newIndex);
            if (isPlaying) {
                stopAllOscillators();
                setTimeout(() => startPlaying(), 100);
            }
        }
    };

    const prevFrequency = () => {
        if (rifeFrequency.frequencies.length > 1) {
            const newIndex = activeFrequencyIndex === 0 ? rifeFrequency.frequencies.length - 1 : activeFrequencyIndex - 1;
            setActiveFrequencyIndex(newIndex);
            if (isPlaying) {
                stopAllOscillators();
                setTimeout(() => startPlaying(), 100);
            }
        }
    };

    if (!rifeFrequency) return null;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-auto">
                <SheetHeader>
                    <SheetTitle className="text-right text-xl flex items-center gap-2">
                        <Waves className="w-6 h-6 text-purple-500" />
                        {rifeFrequency.name}
                    </SheetTitle>
                </SheetHeader>

                <div className="py-6 space-y-6">
                    {/* Disclaimer */}
                    {showDisclaimer && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-amber-800 font-medium mb-1">تنبيه هام</p>
                                    <p className="text-xs text-amber-700 leading-relaxed">
                                        هذه الترددات مكملة للعلاج الطبي وليست بديلاً عنه. استشر طبيبك قبل الاستخدام.
                                    </p>
                                </div>
                                <button onClick={() => setShowDisclaimer(false)}>
                                    <X className="w-4 h-4 text-amber-400" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Main Frequency Display */}
                    <div className="text-center">
                        <div className={`inline-flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl ${isPlaying ? 'animate-pulse' : ''}`}>
                            <div className="text-center">
                                <span className="text-4xl font-bold text-white">
                                    {rifeFrequency.frequencies[activeFrequencyIndex]}
                                </span>
                                <span className="text-white/80 text-lg block">Hz</span>
                            </div>
                        </div>

                        {rifeFrequency.frequencies.length > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-4">
                                <Button variant="outline" size="icon" onClick={prevFrequency} className="rounded-full">
                                    <Minus className="w-4 h-4" />
                                </Button>
                                <span className="text-sm text-slate-500">
                                    {activeFrequencyIndex + 1} / {rifeFrequency.frequencies.length}
                                </span>
                                <Button variant="outline" size="icon" onClick={nextFrequency} className="rounded-full">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* All Frequencies */}
                    {rifeFrequency.frequencies.length > 1 && (
                        <div className="flex flex-wrap gap-2 justify-center">
                            {rifeFrequency.frequencies.map((freq, index) => (
                                <Badge
                                    key={index}
                                    className={`cursor-pointer transition-all ${index === activeFrequencyIndex
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-purple-100'
                                        }`}
                                    onClick={() => {
                                        setActiveFrequencyIndex(index);
                                        if (isPlaying) {
                                            stopAllOscillators();
                                            setTimeout(() => startPlaying(), 100);
                                        }
                                    }}
                                >
                                    {freq} Hz
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Target Condition */}
                    <div className="glass rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Info className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium text-slate-700">الحالة المستهدفة</span>
                        </div>
                        <p className="text-slate-600">{rifeFrequency.target_condition || rifeFrequency.description}</p>
                    </div>

                    {/* Precautions */}
                    {rifeFrequency.precautions?.length > 0 && (
                        <div className="bg-red-50 rounded-2xl p-4">
                            <p className="text-sm font-medium text-red-700 mb-2">تحذيرات:</p>
                            <ul className="space-y-1">
                                {rifeFrequency.precautions.map((precaution, index) => (
                                    <li key={index} className="text-xs text-red-600 flex items-start gap-2">
                                        <span>•</span>
                                        <span>{precaution}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Timer */}
                    <div>
                        <p className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                            <Timer className="w-4 h-4" />
                            مؤقت الإيقاف التلقائي
                        </p>
                        <div className="flex gap-2">
                            {[5, 10, 15, 30, 60].map((mins) => (
                                <Button
                                    key={mins}
                                    variant={timer === mins ? 'default' : 'outline'}
                                    size="sm"
                                    className={`flex-1 rounded-xl ${timer === mins ? 'gradient-primary' : ''}`}
                                    onClick={() => setTimerDuration(mins)}
                                >
                                    {mins}د
                                </Button>
                            ))}
                        </div>
                        {remainingTime !== null && (
                            <p className="text-center text-sm text-slate-500 mt-2">
                                الوقت المتبقي: {formatTime(remainingTime)}
                            </p>
                        )}
                    </div>

                    {/* Volume */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-medium text-slate-700">مستوى الصوت</p>
                            <button onClick={toggleMute}>
                                {isMuted ? <VolumeX className="w-5 h-5 text-slate-400" /> : <Volume2 className="w-5 h-5 text-slate-600" />}
                            </button>
                        </div>
                        <Slider
                            value={[volume]}
                            max={1}
                            step={0.01}
                            onValueChange={handleVolumeChange}
                            className="w-full"
                        />
                    </div>

                    {/* Play Button */}
                    <Button
                        onClick={isPlaying ? stopPlaying : startPlaying}
                        className={`w-full h-16 rounded-2xl text-lg font-bold shadow-xl ${isPlaying
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90'
                            }`}
                    >
                        {isPlaying ? (
                            <>
                                <Pause className="w-6 h-6 ml-2" />
                                إيقاف
                            </>
                        ) : (
                            <>
                                <Play className="w-6 h-6 ml-2" />
                                تشغيل التردد
                            </>
                        )}
                    </Button>

                    {/* Research Source */}
                    {rifeFrequency.research_source && (
                        <p className="text-xs text-center text-slate-400">
                            المصدر: {rifeFrequency.research_source}
                        </p>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}