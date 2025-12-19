import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

export interface Track {
    id: string;
    title: string;
    description: string;
    frequency_hz?: number;
    frequencies?: number[]; // For Rife sequences
    type: 'tone' | 'rife' | 'music';
    fileUrl?: string; // For MP3s if we add music later
}

interface AudioContextType {
    isPlaying: boolean;
    currentTrack: Track | null;
    playTrack: (track: Track) => void;
    togglePlay: () => void;
    closePlayer: () => void;
    volume: number;
    setVolume: (val: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
    const [volume, setVolume] = useState(0.5);

    // Audio Engine Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const oscillatorRef = useRef<OscillatorNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const rifeIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const initAudio = useCallback(() => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            gainNodeRef.current = audioContextRef.current.createGain();
            gainNodeRef.current.connect(audioContextRef.current.destination);
            gainNodeRef.current.gain.value = volume;
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    }, [volume]);

    useEffect(() => {
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = volume;
        }
    }, [volume]);

    const stopAudio = useCallback(() => {
        // Clear logic intervals immediately
        if (rifeIntervalRef.current) {
            clearInterval(rifeIntervalRef.current);
            rifeIntervalRef.current = null;
        }

        if (gainNodeRef.current && audioContextRef.current) {
            // Soft stop (fade out) to prevent "clicking"
            try {
                const ct = audioContextRef.current.currentTime;
                gainNodeRef.current.gain.cancelScheduledValues(ct);
                gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, ct);
                gainNodeRef.current.gain.exponentialRampToValueAtTime(0.001, ct + 0.1);

                // Disconnect oscillators after fade out
                setTimeout(() => {
                    if (oscillatorRef.current) {
                        try {
                            oscillatorRef.current.stop();
                            oscillatorRef.current.disconnect();
                        } catch (e) { }
                        oscillatorRef.current = null;
                    }
                }, 150);
            } catch (e) {
                // Fallback hard stop if context is weird
                if (oscillatorRef.current) {
                    try { oscillatorRef.current.stop(); } catch (e) { }
                    oscillatorRef.current = null;
                }
            }
        } else {
            if (oscillatorRef.current) {
                try { oscillatorRef.current.stop(); } catch (e) { }
                oscillatorRef.current = null;
            }
        }
    }, []);

    const playTone = useCallback((freq: number) => {
        initAudio(); // Ensure context is ready
        stopAudio();

        setTimeout(() => {
            if (!audioContextRef.current) return;

            const osc = audioContextRef.current.createOscillator();
            const gain = audioContextRef.current.createGain();

            gain.connect(audioContextRef.current.destination);
            osc.connect(gain);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioContextRef.current.currentTime);

            // Fade in
            gain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
            gain.gain.linearRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.1);

            osc.start();

            // Update refs
            oscillatorRef.current = osc;
            gainNodeRef.current = gain; // Replace global gain ref for this tone
        }, 50); // Short delay to allow cleanup

    }, [initAudio, stopAudio, volume]);

    const playRifeSequence = useCallback((frequencies: number[]) => {
        initAudio();
        stopAudio();

        if (!frequencies.length) return;

        let index = 0;
        const playNext = () => {
            playTone(frequencies[index]);
            index = (index + 1) % frequencies.length;
        };

        playNext();
        rifeIntervalRef.current = setInterval(playNext, 5000);

    }, [initAudio, stopAudio, playTone]);


    const playTrack = useCallback((track: Track) => {
        if (currentTrack?.id === track.id && isPlaying) {
            setIsPlaying(false);
            stopAudio();
            return; // Toggle off if same track
        }

        setCurrentTrack(track);
        setIsPlaying(true);

        // Logic based on types
        if (track.type === 'tone' && track.frequency_hz) {
            playTone(track.frequency_hz);
        } else if (track.type === 'rife' && track.frequencies) {
            playRifeSequence(track.frequencies);
        } else {
            console.log('Music files not yet implemented locally');
        }

    }, [currentTrack, isPlaying, playTone, playRifeSequence, stopAudio]);

    const togglePlay = useCallback(() => {
        if (isPlaying) {
            stopAudio();
            setIsPlaying(false);
        } else if (currentTrack) {
            playTrack(currentTrack); // Resume
        }
    }, [isPlaying, currentTrack, playTrack, stopAudio]);

    const closePlayer = useCallback(() => {
        stopAudio();
        setIsPlaying(false);
        setCurrentTrack(null);
    }, [stopAudio]);

    // Cleanup
    useEffect(() => {
        return () => stopAudio();
    }, [stopAudio]);

    return (
        <AudioContext.Provider value={{ isPlaying, currentTrack, playTrack, togglePlay, closePlayer, volume, setVolume }}>
            {children}
        </AudioContext.Provider>
    );
}

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) throw new Error('useAudio must be used within AudioProvider');
    return context;
};
