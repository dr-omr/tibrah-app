import React from 'react';
import { Play, Pause, Waves, Sparkles, Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAudio } from '@/contexts/AudioContext';

interface FrequencyCardProps {
    frequency: any;
    // Local props are ignored in favor of global context state
    isPlaying?: boolean;
    onPlay?: () => void;
    onShowDetails: () => void;
}

export default function FrequencyCard({ frequency, onShowDetails }: FrequencyCardProps) {
    const { currentTrack, isPlaying, playTrack, togglePlay } = useAudio();

    // Check if THIS card is the one playing globally
    const isThisPlaying = isPlaying && currentTrack?.id === frequency.id;

    const handlePlayClick = (e) => {
        e.stopPropagation();
        if (isThisPlaying) {
            togglePlay();
        } else {
            playTrack({
                id: frequency.id,
                title: frequency.name,
                description: frequency.description,
                frequency_hz: frequency.frequency_hz,
                type: 'tone' // For simplicity, assuming all in card list are tones
            });
        }
    };

    return (
        <div
            onClick={onShowDetails}
            className={`glass p-4 rounded-2xl transition-all duration-300 group hover:shadow-glow cursor-pointer border-l-4 ${isThisPlaying ? 'border-l-[#2D9B83] bg-white/60' : 'border-l-transparent'}`}
        >
            <div className="flex items-center gap-4">
                {/* Play Button Icon */}
                <button
                    onClick={handlePlayClick}
                    className={`rounded-full w-12 h-12 flex items-center justify-center transition-all ${isThisPlaying
                        ? 'bg-[#2D9B83] text-white shadow-lg scale-110'
                        : 'bg-slate-100 text-slate-400 group-hover:bg-[#2D9B83] group-hover:text-white'
                        }`}
                >
                    {isThisPlaying ? (
                        <Pause className="w-5 h-5" />
                    ) : (
                        <Play className="w-5 h-5 ml-1" />
                    )}
                </button>

                {/* Info */}
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className={`font-bold text-lg ${isThisPlaying ? 'text-[#2D9B83]' : 'text-slate-800'}`}>
                            {frequency.name}
                        </h3>
                        <span className="text-xl font-bold text-slate-200 group-hover:text-[#2D9B83]/20 transition-colors">
                            {frequency.frequency_hz} Hz
                        </span>
                    </div>

                    <p className="text-sm text-slate-500 line-clamp-1 mb-2">
                        {frequency.category === 'rife' ? 'تردد رايف العلاجي' : frequency.description}
                    </p>

                    {/* Tags */}
                    <div className="flex gap-2">
                        <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100 text-slate-500">
                            {frequency.category}
                        </span>
                        {frequency.benefits?.[0] && (
                            <span className="text-[10px] px-2 py-1 rounded-full bg-[#2D9B83]/10 text-[#2D9B83]">
                                {frequency.benefits[0]}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}