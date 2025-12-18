/**
 * Advanced Skeleton Components
 * Professional loading states for all content types
 * Supports multiple variants, sizes, and animations
 */

import React from 'react';

// Base Skeleton with Shimmer Animation
export function Skeleton({
    className = '',
    variant = 'rectangular',
    width,
    height,
    animation = 'pulse'
}: {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
    animation?: 'pulse' | 'wave' | 'none';
}) {
    const baseClasses = 'bg-slate-200 relative overflow-hidden';

    const variantClasses = {
        text: 'rounded h-4',
        circular: 'rounded-full',
        rectangular: '',
        rounded: 'rounded-2xl'
    };

    const animationClasses = {
        pulse: 'animate-pulse',
        wave: 'skeleton-wave',
        none: ''
    };

    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
            style={style}
        >
            {animation === 'wave' && (
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            )}
        </div>
    );
}

// Card Skeleton - for metric cards, product cards, etc.
export function CardSkeleton({
    hasImage = false,
    imageHeight = 120,
    lines = 3,
    hasAction = false
}: {
    hasImage?: boolean;
    imageHeight?: number;
    lines?: number;
    hasAction?: boolean;
}) {
    return (
        <div className="glass rounded-2xl p-4 space-y-4">
            {hasImage && (
                <Skeleton variant="rounded" height={imageHeight} className="w-full" />
            )}
            <div className="space-y-2">
                {Array.from({ length: lines }).map((_, i) => (
                    <Skeleton
                        key={i}
                        variant="text"
                        className={i === 0 ? 'w-3/4' : i === lines - 1 ? 'w-1/2' : 'w-full'}
                        height={i === 0 ? 20 : 14}
                    />
                ))}
            </div>
            {hasAction && (
                <div className="flex justify-end">
                    <Skeleton variant="rounded" width={80} height={36} />
                </div>
            )}
        </div>
    );
}

// Metric Card Skeleton - for health metrics
export function MetricCardSkeleton() {
    return (
        <div className="glass rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
                <Skeleton variant="rounded" width={40} height={40} />
                <Skeleton variant="text" width={40} height={16} />
            </div>
            <Skeleton variant="text" width="60%" height={28} className="mb-2" />
            <Skeleton variant="text" width="40%" height={14} />
            <div className="flex items-center justify-between mt-3">
                <Skeleton variant="text" width="30%" height={14} />
                <Skeleton variant="circular" width={16} height={16} />
            </div>
        </div>
    );
}

// Health Rings Skeleton
export function HealthRingsSkeleton() {
    return (
        <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-center">
                <div className="relative">
                    <Skeleton variant="circular" width={180} height={180} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Skeleton variant="circular" width={140} height={140} className="bg-slate-100" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-1">
                            <Skeleton variant="text" width={60} height={28} className="mx-auto" />
                            <Skeleton variant="text" width={40} height={14} className="mx-auto" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-center gap-6 mt-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="text-center">
                        <Skeleton variant="circular" width={12} height={12} className="mx-auto mb-1" />
                        <Skeleton variant="text" width={50} height={12} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// Goal Progress Skeleton
export function GoalProgressSkeleton() {
    return (
        <div className="glass rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Skeleton variant="circular" width={20} height={20} />
                    <Skeleton variant="text" width={100} height={18} />
                </div>
                <Skeleton variant="text" width={60} height={14} />
            </div>
            {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-1">
                    <div className="flex justify-between">
                        <Skeleton variant="text" width={60} height={12} />
                        <Skeleton variant="text" width={30} height={12} />
                    </div>
                    <Skeleton variant="rounded" height={8} className="w-full" />
                </div>
            ))}
        </div>
    );
}

// List Item Skeleton
export function ListItemSkeleton({
    hasAvatar = true,
    hasSecondaryAction = false
}: {
    hasAvatar?: boolean;
    hasSecondaryAction?: boolean;
}) {
    return (
        <div className="flex items-center gap-4 p-4">
            {hasAvatar && <Skeleton variant="circular" width={48} height={48} />}
            <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="70%" height={16} />
                <Skeleton variant="text" width="40%" height={14} />
            </div>
            {hasSecondaryAction && <Skeleton variant="rounded" width={32} height={32} />}
        </div>
    );
}

// Chat Message Skeleton
export function ChatMessageSkeleton({ isUser = false }: { isUser?: boolean }) {
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-[80%] ${isUser ? 'order-2' : ''}`}>
                {!isUser && <Skeleton variant="circular" width={32} height={32} className="mb-2" />}
                <div className={`rounded-2xl p-4 ${isUser ? 'bg-[#2D9B83]/10' : 'bg-slate-100'}`}>
                    <div className="space-y-2">
                        <Skeleton variant="text" width="100%" height={14} />
                        <Skeleton variant="text" width="80%" height={14} />
                        <Skeleton variant="text" width="60%" height={14} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Dashboard Skeleton - Complete dashboard loading state
export function DashboardSkeleton() {
    return (
        <div className="space-y-6 py-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton variant="text" width={150} height={24} />
                    <Skeleton variant="text" width={100} height={16} />
                </div>
                <Skeleton variant="circular" width={48} height={48} />
            </div>

            {/* Health Rings */}
            <HealthRingsSkeleton />

            {/* Goals */}
            <GoalProgressSkeleton />

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <MetricCardSkeleton key={i} />
                ))}
            </div>

            {/* Daily Tip */}
            <CardSkeleton lines={2} />
        </div>
    );
}

// Health Summary Skeleton
export function HealthSummarySkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Skeleton variant="circular" width={20} height={20} />
                    <Skeleton variant="text" width={120} height={20} />
                </div>
                <Skeleton variant="text" width={100} height={14} />
            </div>

            {/* Activity Rings */}
            <HealthRingsSkeleton />

            {/* Daily Goals */}
            <GoalProgressSkeleton />

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <MetricCardSkeleton key={i} />
                ))}
            </div>

            {/* Daily Tip */}
            <div className="glass rounded-2xl p-4 bg-gradient-to-r from-[#2D9B83]/5 to-[#3FB39A]/5">
                <div className="flex items-center gap-3">
                    <Skeleton variant="text" width={32} height={32} />
                    <div className="flex-1 space-y-1">
                        <Skeleton variant="text" width={80} height={16} />
                        <Skeleton variant="text" width="90%" height={12} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Product Grid Skeleton
export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <CardSkeleton key={i} hasImage imageHeight={160} lines={2} hasAction />
            ))}
        </div>
    );
}

// Article Skeleton
export function ArticleSkeleton() {
    return (
        <div className="space-y-6">
            {/* Hero Image */}
            <Skeleton variant="rounded" height={200} className="w-full" />

            {/* Title */}
            <div className="space-y-2">
                <Skeleton variant="text" width="90%" height={28} />
                <Skeleton variant="text" width="60%" height={28} />
            </div>

            {/* Meta */}
            <div className="flex items-center gap-4">
                <Skeleton variant="circular" width={40} height={40} />
                <div className="space-y-1">
                    <Skeleton variant="text" width={100} height={14} />
                    <Skeleton variant="text" width={80} height={12} />
                </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton
                        key={i}
                        variant="text"
                        className={i === 3 || i === 6 ? 'w-3/4' : 'w-full'}
                        height={16}
                    />
                ))}
            </div>
        </div>
    );
}

// Add shimmer animation to globals.css (CSS keyframes)
export const shimmerCSS = `
@keyframes shimmer {
    100% {
        transform: translateX(100%);
    }
}

.skeleton-wave::after {
    content: '';
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    animation: shimmer 2s infinite;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
}
`;

export default {
    Skeleton,
    CardSkeleton,
    MetricCardSkeleton,
    HealthRingsSkeleton,
    GoalProgressSkeleton,
    ListItemSkeleton,
    ChatMessageSkeleton,
    DashboardSkeleton,
    HealthSummarySkeleton,
    ProductGridSkeleton,
    ArticleSkeleton
};
