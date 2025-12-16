import React from 'react';
import { Play, Pause, Info } from 'lucide-react';
import { Button } from "@/components/ui/button";

const categoryIcons = {
    solfeggio: '🎵',
    brainwave: '🧠',
    chakra: '🌈',
    organ: '❤️',
    angel_numbers: '👼',
    planetary: '🪐',
};

const categoryColors = {
    solfeggio: 'from-purple-500 to-indigo-600',
    brainwave: 'from-blue-500 to-cyan-500',
    chakra: 'from-pink-500 to-orange-500',
    organ: 'from-red-500 to-pink-500',
    angel_numbers: 'from-yellow-400 to-amber-500',
    planetary: 'from-indigo-500 to-purple-600',
};

export default function FrequencyCard({ frequency, isPlaying, onPlay, onShowDetails }) {
    return (
        <div className={`glass rounded-2xl p-4 hover:shadow-glow transition-all duration-300 ${isPlaying ? 'ring-2 ring-[#2D9B83] shadow-glow' : ''
            }`}>
            <div className="flex items-start gap-4">
                {/* Play Button */}
                <button
                    onClick={onPlay}
                    className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${categoryColors[frequency.category] || 'from-[#2D9B83] to-[#3FB39A]'
                        } flex items-center justify-center shadow-lg ${isPlaying ? 'animate-pulse-soft' : ''
                        }`}
                >
                    {isPlaying ? (
                        <Pause className="w-6 h-6 text-white" />
                    ) : (
                        <Play className="w-6 h-6 text-white mr-[-2px]" />
                    )}

                    {/* Ripple effect when playing */}
                    {isPlaying && (
                        <>
                            <span className="absolute inset-0 rounded-2xl animate-ping bg-white/20" />
                            <span className="absolute inset-0 rounded-2xl animate-pulse bg-white/10" />
                        </>
                    )}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{categoryIcons[frequency.category]}</span>
                        <h3 className="font-bold text-slate-800 truncate">{frequency.name}</h3>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl font-bold text-gradient">
                            {frequency.frequency_hz}
                        </span>
                        <span className="text-sm text-slate-500">Hz</span>
                    </div>

                    {frequency.description && (
                        <p className="text-sm text-slate-500 line-clamp-2">
                            {frequency.description}
                        </p>
                    )}
                </div>

                {/* Info Button */}
                <Button
                    size="icon"
                    variant="ghost"
                    className="text-slate-400 hover:text-[#2D9B83]"
                    onClick={onShowDetails}
                >
                    <Info className="w-5 h-5" />
                </Button>
            </div>

            {/* Benefits Tags */}
            {frequency.benefits && frequency.benefits.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                    {frequency.benefits.slice(0, 3).map((benefit, index) => (
                        <span
                            key={index}
                            className="text-xs px-2 py-1 rounded-full bg-[#2D9B83]/10 text-[#2D9B83]"
                        >
                            {benefit}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}