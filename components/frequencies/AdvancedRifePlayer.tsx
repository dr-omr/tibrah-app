import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Play, Pause, Volume2, VolumeX, Timer, X, SkipForward, SkipBack,
    AlertTriangle, Info, Waves, Settings, Repeat, List, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function AdvancedRifePlayer({
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
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Advanced settings
    const [waveType, setWaveType] = useState('sine');
    const [autoAdvance, setAutoAdvance] = useState(true);
    const [frequencyDuration, setFrequencyDuration] = useState(180); // seconds per frequency
    const [currentFreqTime, setCurrentFreqTime] = useState(0);
    const [sweepMode, setSweepMode] = useState(false);
    const [carrierFrequency, setCarrierFrequency] = useState(null);

    const audioContextRef = useRef(null);
    const oscillatorRef = useRef(null);
    const gainNodeRef = useRef(null);
    const carrierOscRef = useRef(null);
    const modulatorOscRef = useRef(null);
    const modulatorGainRef = useRef(null);
    const analyserRef = useRef(null);
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopPlaying();
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    // Timer countdown
    useEffect(() => {
        if (remainingTime !== null && remainingTime > 0 && isPlaying) {
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
    }, [remainingTime, isPlaying]);

    // Per-frequency timer for auto-advance
    useEffect(() => {
        if (!isPlaying || !autoAdvance) return;

        const interval = setInterval(() => {
            setCurrentFreqTime(prev => {
                if (prev >= frequencyDuration) {
                    // Move to next frequency
                    const nextIndex = (activeFrequencyIndex + 1) % rifeFrequency.frequencies.length;
                    if (nextIndex === 0 && !autoAdvance) {
                        stopPlaying();
                        return 0;
                    }
                    setActiveFrequencyIndex(nextIndex);
                    return 0;
                }
                return prev + 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isPlaying, autoAdvance, frequencyDuration, activeFrequencyIndex, rifeFrequency?.frequencies?.length]);

    // Update oscillator when frequency changes
    useEffect(() => {
        if (isPlaying && oscillatorRef.current && rifeFrequency?.frequencies) {
            const freq = rifeFrequency.frequencies[activeFrequencyIndex];
            oscillatorRef.current.frequency.setValueAtTime(freq, audioContextRef.current.currentTime);
        }
    }, [activeFrequencyIndex, isPlaying]);

    const initAudio = useCallback(() => {
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        // Create analyser for visualization
        if (!analyserRef.current) {
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
        }

        // Create gain node
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.gain.value = isMuted ? 0 : volume;
        gainNodeRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);
    }, [volume, isMuted]);

    const startPlaying = useCallback(() => {
        if (!rifeFrequency?.frequencies?.length) return;

        initAudio();
        stopOscillators();

        const freq = rifeFrequency.frequencies[activeFrequencyIndex];

        // Create main oscillator
        oscillatorRef.current = audioContextRef.current.createOscillator();
        oscillatorRef.current.type = waveType;
        oscillatorRef.current.frequency.value = freq;
        oscillatorRef.current.connect(gainNodeRef.current);
        oscillatorRef.current.start();

        setIsPlaying(true);
        setCurrentFreqTime(0);

        // Start visualization
        drawVisualization();
    }, [rifeFrequency, activeFrequencyIndex, waveType, initAudio]);

    const stopOscillators = () => {
        try {
            if (oscillatorRef.current) {
                oscillatorRef.current.stop();
                oscillatorRef.current.disconnect();
                oscillatorRef.current = null;
            }
            if (carrierOscRef.current) {
                carrierOscRef.current.stop();
                carrierOscRef.current.disconnect();
                carrierOscRef.current = null;
            }
            if (modulatorOscRef.current) {
                modulatorOscRef.current.stop();
                modulatorOscRef.current.disconnect();
                modulatorOscRef.current = null;
            }
        } catch (e) { }
    };

    const stopPlaying = () => {
        stopOscillators();
        setIsPlaying(false);
        setCurrentFreqTime(0);
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    };

    const togglePlayPause = () => {
        if (isPlaying) {
            stopPlaying();
        } else {
            startPlaying();
        }
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
        if (!rifeFrequency?.frequencies?.length) return;
        const newIndex = (activeFrequencyIndex + 1) % rifeFrequency.frequencies.length;
        setActiveFrequencyIndex(newIndex);
        setCurrentFreqTime(0);
    };

    const prevFrequency = () => {
        if (!rifeFrequency?.frequencies?.length) return;
        const newIndex = activeFrequencyIndex === 0 ? rifeFrequency.frequencies.length - 1 : activeFrequencyIndex - 1;
        setActiveFrequencyIndex(newIndex);
        setCurrentFreqTime(0);
    };

    const drawVisualization = () => {
        if (!canvasRef.current || !analyserRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            analyserRef.current.getByteFrequencyData(dataArray);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const barHeight = (dataArray[i] / 255) * canvas.height;

                const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
                gradient.addColorStop(0, '#a855f7');
                gradient.addColorStop(1, '#ec4899');

                ctx.fillStyle = gradient;
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + 1;
            }
        };

        draw();
    };

    if (!rifeFrequency) return null;

    const currentFreq = rifeFrequency.frequencies?.[activeFrequencyIndex] || 0;
    const progress = (currentFreqTime / frequencyDuration) * 100;

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent side="bottom" className="rounded-t-3xl max-h-[95vh] overflow-auto">
                <SheetHeader>
                    <SheetTitle className="text-right text-xl flex items-center gap-2">
                        <Waves className="w-6 h-6 text-purple-500" />
                        {rifeFrequency.name}
                        {rifeFrequency.name_en && (
                            <span className="text-sm text-slate-400 font-normal">({rifeFrequency.name_en})</span>
                        )}
                    </SheetTitle>
                </SheetHeader>

                <div className="py-4 space-y-4">
                    {/* Disclaimer */}
                    {showDisclaimer && (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-xs text-amber-700 leading-relaxed">
                                        ترددات رايف علاج تكميلي وليست بديلاً عن الطب. استشر طبيبك.
                                    </p>
                                </div>
                                <button onClick={() => setShowDisclaimer(false)} className="text-amber-400">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Visualization */}
                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900 to-pink-900 p-4">
                        <canvas
                            ref={canvasRef}
                            width={300}
                            height={80}
                            className="w-full rounded-xl"
                        />

                        {/* Main Frequency Display */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className={`text-center ${isPlaying ? 'animate-pulse' : ''}`}>
                                <span className="text-5xl font-bold text-white drop-shadow-lg">
                                    {currentFreq}
                                </span>
                                <span className="text-white/80 text-xl block">Hz</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress bar for current frequency */}
                    {isPlaying && autoAdvance && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>تردد {activeFrequencyIndex + 1}/{rifeFrequency.frequencies.length}</span>
                                <span>{formatTime(currentFreqTime)} / {formatTime(frequencyDuration)}</span>
                            </div>
                            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Frequency Navigation */}
                    {rifeFrequency.frequencies.length > 1 && (
                        <div className="flex items-center justify-center gap-4">
                            <Button variant="outline" size="icon" onClick={prevFrequency} className="rounded-full">
                                <SkipBack className="w-4 h-4" />
                            </Button>
                            <div className="flex flex-wrap gap-1 justify-center max-w-[200px]">
                                {rifeFrequency.frequencies.map((freq, index) => (
                                    <Badge
                                        key={index}
                                        className={`cursor-pointer text-xs transition-all ${index === activeFrequencyIndex
                                                ? 'bg-purple-500 text-white scale-110'
                                                : 'bg-slate-100 text-slate-600 hover:bg-purple-100'
                                            }`}
                                        onClick={() => {
                                            setActiveFrequencyIndex(index);
                                            setCurrentFreqTime(0);
                                        }}
                                    >
                                        {freq}
                                    </Badge>
                                ))}
                            </div>
                            <Button variant="outline" size="icon" onClick={nextFrequency} className="rounded-full">
                                <SkipForward className="w-4 h-4" />
                            </Button>
                        </div>
                    )}

                    {/* Target Condition */}
                    <div className="glass rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Info className="w-4 h-4 text-purple-500" />
                            <span className="text-xs font-medium text-slate-700">الحالة المستهدفة</span>
                        </div>
                        <p className="text-sm text-slate-600">{rifeFrequency.target_condition || rifeFrequency.description}</p>
                    </div>

                    {/* Advanced Settings Toggle */}
                    <button
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="w-full flex items-center justify-between p-3 glass rounded-xl text-sm"
                    >
                        <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-slate-500" />
                            <span className="font-medium text-slate-700">إعدادات متقدمة</span>
                        </div>
                        {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showAdvanced && (
                        <div className="space-y-4 p-4 glass rounded-xl">
                            {/* Wave Type */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-700">نوع الموجة</span>
                                <Select value={waveType} onValueChange={setWaveType}>
                                    <SelectTrigger className="w-32 h-8">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sine">Sine جيب</SelectItem>
                                        <SelectItem value="square">Square مربع</SelectItem>
                                        <SelectItem value="sawtooth">Sawtooth منشار</SelectItem>
                                        <SelectItem value="triangle">Triangle مثلث</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Auto Advance */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Repeat className="w-4 h-4 text-slate-500" />
                                    <span className="text-sm text-slate-700">تقدم تلقائي</span>
                                </div>
                                <Switch checked={autoAdvance} onCheckedChange={setAutoAdvance} />
                            </div>

                            {/* Duration per frequency */}
                            {autoAdvance && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-700">مدة كل تردد</span>
                                    <Select value={frequencyDuration.toString()} onValueChange={(v) => setFrequencyDuration(parseInt(v))}>
                                        <SelectTrigger className="w-32 h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="60">دقيقة</SelectItem>
                                            <SelectItem value="120">دقيقتان</SelectItem>
                                            <SelectItem value="180">3 دقائق</SelectItem>
                                            <SelectItem value="300">5 دقائق</SelectItem>
                                            <SelectItem value="600">10 دقائق</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Timer */}
                    <div>
                        <p className="text-xs font-medium text-slate-700 mb-2 flex items-center gap-2">
                            <Timer className="w-4 h-4" />
                            مؤقت الجلسة
                        </p>
                        <div className="flex gap-2">
                            {[5, 15, 30, 45, 60].map((mins) => (
                                <Button
                                    key={mins}
                                    variant={timer === mins ? 'default' : 'outline'}
                                    size="sm"
                                    className={`flex-1 rounded-xl text-xs ${timer === mins ? 'bg-gradient-to-r from-purple-500 to-pink-500' : ''}`}
                                    onClick={() => setTimerDuration(mins)}
                                >
                                    {mins}د
                                </Button>
                            ))}
                        </div>
                        {remainingTime !== null && (
                            <p className="text-center text-sm text-purple-600 font-medium mt-2">
                                ⏱️ {formatTime(remainingTime)}
                            </p>
                        )}
                    </div>

                    {/* Volume */}
                    <div className="flex items-center gap-3">
                        <button onClick={toggleMute} className="p-2">
                            {isMuted ? <VolumeX className="w-5 h-5 text-slate-400" /> : <Volume2 className="w-5 h-5 text-slate-600" />}
                        </button>
                        <Slider
                            value={[volume]}
                            max={1}
                            step={0.01}
                            onValueChange={handleVolumeChange}
                            className="flex-1"
                        />
                        <span className="text-xs text-slate-500 w-8">{Math.round(volume * 100)}%</span>
                    </div>

                    {/* Play Button */}
                    <Button
                        onClick={togglePlayPause}
                        className={`w-full h-14 rounded-2xl text-lg font-bold shadow-xl ${isPlaying
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
                                تشغيل البرنامج العلاجي
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