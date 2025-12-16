import React from 'react';
import { Sparkles, Heart, Brain, Activity } from 'lucide-react';

interface LoadingScreenProps {
    message?: string;
    variant?: 'default' | 'fullscreen' | 'inline';
}

export default function LoadingScreen({
    message = 'جاري التحميل...',
    variant = 'default'
}: LoadingScreenProps) {

    if (variant === 'inline') {
        return (
            <div className="flex items-center justify-center gap-3 py-8">
                <div className="relative w-8 h-8">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
                </div>
                <span className="text-slate-500 text-sm">{message}</span>
            </div>
        );
    }

    const isFullscreen = variant === 'fullscreen';

    return (
        <div className={`${isFullscreen ? 'fixed inset-0 z-50' : ''} min-h-[400px] flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50`}>
            <div className="text-center relative">
                {/* Background decorations */}
                <div className="absolute -inset-20 pointer-events-none">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-pulse-soft" />
                    <div className="absolute bottom-0 left-0 w-40 h-40 bg-gold/5 rounded-full blur-3xl animate-breathe" />
                </div>

                {/* Main loader */}
                <div className="relative mb-8">
                    {/* Logo container with animated ring */}
                    <div className="relative w-24 h-24 mx-auto">
                        {/* Outer spinning ring */}
                        <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '3s' }}>
                            <circle
                                cx="48" cy="48" r="44"
                                fill="none"
                                stroke="url(#gradient1)"
                                strokeWidth="3"
                                strokeDasharray="70 200"
                                strokeLinecap="round"
                            />
                            <defs>
                                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="var(--primary)" />
                                    <stop offset="100%" stopColor="var(--primary-light)" />
                                </linearGradient>
                            </defs>
                        </svg>

                        {/* Inner pulsing ring */}
                        <div className="absolute inset-3 rounded-full border-2 border-dashed border-slate-200 animate-pulse" />

                        {/* Center logo */}
                        <div className="absolute inset-4 rounded-2xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/25">
                            <span className="text-white font-bold text-2xl">ط</span>
                        </div>
                    </div>

                    {/* Floating icons around */}
                    <div className="absolute -top-2 -right-4 animate-float" style={{ animationDelay: '0s' }}>
                        <div className="w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center">
                            <Heart className="w-4 h-4 text-red-400" />
                        </div>
                    </div>
                    <div className="absolute -bottom-2 -left-4 animate-float" style={{ animationDelay: '0.5s' }}>
                        <div className="w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center">
                            <Brain className="w-4 h-4 text-purple-400" />
                        </div>
                    </div>
                    <div className="absolute top-1/2 -right-6 animate-float" style={{ animationDelay: '1s' }}>
                        <div className="w-6 h-6 rounded-md bg-white shadow-sm flex items-center justify-center">
                            <Activity className="w-3 h-3 text-primary" />
                        </div>
                    </div>
                </div>

                {/* Text */}
                <div className="relative z-10">
                    <h2 className="text-xl font-bold text-slate-800 mb-2 flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5 text-gold animate-pulse" />
                        طِبرَا
                        <Sparkles className="w-5 h-5 text-gold animate-pulse" />
                    </h2>
                    <p className="text-slate-500">{message}</p>

                    {/* Loading dots */}
                    <div className="flex items-center justify-center gap-1 mt-4">
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Skeleton components for content loading
export function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 animate-pulse">
            <div className="w-full h-40 bg-slate-200 rounded-xl mb-4" />
            <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
        </div>
    );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl animate-pulse">
                    <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                    <div className="flex-1">
                        <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                        <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2 animate-pulse">
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-4 bg-slate-200 rounded"
                    style={{ width: i === lines - 1 ? '60%' : '100%' }}
                />
            ))}
        </div>
    );
}
