// components/common/SkeletonLoader.tsx
// Reusable skeleton loading components for lazy-loaded content
import React from 'react';
import { motion } from 'framer-motion';

// Shimmer animation for skeleton elements
const shimmer = {
    initial: { opacity: 0.5 },
    animate: { opacity: 1 },
    transition: { duration: 0.8, repeat: Infinity, repeatType: 'reverse' as const }
};

export function SkeletonBox({ className = '' }: { className?: string }) {
    return (
        <motion.div
            className={`bg-slate-200 dark:bg-slate-700 rounded-xl ${className}`}
            {...shimmer}
        />
    );
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <SkeletonBox
                    key={i}
                    className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
                />
            ))}
        </div>
    );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
    return (
        <div className={`bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm space-y-3 ${className}`}>
            <div className="flex items-center gap-3">
                <SkeletonBox className="w-12 h-12 rounded-xl" />
                <div className="flex-1 space-y-2">
                    <SkeletonBox className="h-4 w-2/3" />
                    <SkeletonBox className="h-3 w-1/2" />
                </div>
            </div>
            <SkeletonText lines={2} />
        </div>
    );
}

// Skeleton for the Health Tracker page
export function HealthTrackerSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
            {/* Header skeleton */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-8 rounded-b-[2.5rem]">
                <div className="flex justify-between items-start mb-6">
                    <div className="space-y-2">
                        <SkeletonBox className="h-7 w-40 bg-white/20" />
                        <SkeletonBox className="h-4 w-56 bg-white/20" />
                    </div>
                    <SkeletonBox className="w-10 h-10 rounded-full bg-white/20" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => (
                        <SkeletonBox key={i} className="h-20 bg-white/15 rounded-2xl" />
                    ))}
                </div>
            </div>

            {/* Quick actions skeleton */}
            <div className="px-4 -mt-6 relative z-10">
                <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(i => (
                        <SkeletonBox key={i} className="h-24 rounded-2xl" />
                    ))}
                </div>
            </div>

            {/* Cards skeleton */}
            <div className="px-4 mt-4 space-y-4">
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
            </div>
        </div>
    );
}

// Skeleton for Meal Planner page
export function MealPlannerSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-6 rounded-b-[2rem]">
                <div className="space-y-3 mb-4">
                    <SkeletonBox className="h-7 w-48 bg-white/20" />
                    <SkeletonBox className="h-4 w-36 bg-white/20" />
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map(i => (
                        <SkeletonBox key={i} className="w-12 h-16 bg-white/20 rounded-xl flex-shrink-0" />
                    ))}
                </div>
            </div>
            <div className="px-4 -mt-4 relative z-10">
                <SkeletonBox className="h-40 rounded-2xl mb-4" />
            </div>
            <div className="px-4 space-y-4">
                {[1, 2, 3].map(i => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        </div>
    );
}

// Generic page skeleton
export function PageSkeleton() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-24">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-6 py-8 rounded-b-[2.5rem]">
                <SkeletonBox className="h-7 w-48 bg-white/20 mb-2" />
                <SkeletonBox className="h-4 w-64 bg-white/20" />
            </div>
            <div className="px-4 mt-4 space-y-4">
                <SkeletonCard />
                <SkeletonCard />
            </div>
        </div>
    );
}
