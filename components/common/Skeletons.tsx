import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

interface CardSkeletonProps {
    className?: string;
}

interface ListSkeletonProps {
    count?: number;
}

export function CardSkeleton({ className = '' }: CardSkeletonProps) {
    return (
        <div className={`p-4 glass rounded-2xl ${className}`}>
            <Skeleton className="h-4 w-3/4 mb-4 bg-slate-200" />
            <Skeleton className="h-20 w-full rounded-xl bg-slate-100" />
            <div className="mt-4 flex gap-2">
                <Skeleton className="h-8 w-20 rounded-full bg-slate-100" />
                <Skeleton className="h-8 w-20 rounded-full bg-slate-100" />
            </div>
        </div>
    );
}

export function ListSkeleton({ count = 3 }: ListSkeletonProps) {
    return (
        <div className="space-y-3">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 glass rounded-2xl">
                    <Skeleton className="h-12 w-12 rounded-xl bg-slate-200" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/2 bg-slate-200" />
                        <Skeleton className="h-3 w-3/4 bg-slate-100" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function QuickAccessSkeleton() {
    return (
        <div className="px-5 py-6">
            <Skeleton className="h-6 w-40 mb-4 bg-slate-200" />
            <div className="grid grid-cols-2 gap-3 mb-5">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="p-4 bg-white rounded-2xl border border-slate-100">
                        <Skeleton className="w-11 h-11 rounded-xl bg-slate-200 mb-2" />
                        <Skeleton className="h-4 w-20 bg-slate-200 mb-1" />
                        <Skeleton className="h-3 w-16 bg-slate-100" />
                    </div>
                ))}
            </div>
            <Skeleton className="h-16 w-full rounded-2xl bg-green-100" />
        </div>
    );
}

export function HomeSkeleton() {
    return (
        <div className="min-h-screen animate-pulse">
            {/* Doctor Intro Skeleton */}
            <div className="px-6 py-8">
                <div className="text-center mb-8">
                    <Skeleton className="h-16 w-40 mx-auto mb-6 rounded-2xl bg-slate-200" />
                    <Skeleton className="h-10 w-48 mx-auto mb-3 bg-slate-200" />
                    <Skeleton className="h-5 w-32 mx-auto bg-slate-100" />
                </div>
                <div className="glass rounded-3xl p-6 mb-8">
                    <div className="flex flex-col items-center">
                        <Skeleton className="w-36 h-36 rounded-full bg-slate-200 mb-6" />
                        <Skeleton className="h-8 w-40 bg-slate-200 mb-2" />
                        <Skeleton className="h-5 w-56 bg-slate-100 mb-4" />
                        <Skeleton className="h-4 w-full max-w-sm bg-slate-100 mb-2" />
                        <Skeleton className="h-4 w-3/4 max-w-sm bg-slate-100 mb-5" />
                        <Skeleton className="h-14 w-full max-w-xs rounded-2xl bg-[#2D9B83]/20" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="glass rounded-2xl p-4 text-center">
                            <Skeleton className="w-12 h-12 mx-auto mb-3 rounded-xl bg-slate-200" />
                            <Skeleton className="h-6 w-12 mx-auto bg-slate-200 mb-1" />
                            <Skeleton className="h-3 w-20 mx-auto bg-slate-100" />
                        </div>
                    ))}
                </div>
            </div>
            <QuickAccessSkeleton />
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="min-h-screen pb-24">
            <div className="relative overflow-hidden bg-slate-100 px-6 py-8 h-64 animate-pulse">
                <div className="flex items-center gap-4 mt-10">
                    <Skeleton className="w-20 h-20 rounded-2xl bg-slate-200" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-1/2 bg-slate-200" />
                        <Skeleton className="h-4 w-1/3 bg-slate-200" />
                    </div>
                </div>
            </div>
            <div className="px-6 py-6 space-y-6">
                <ListSkeleton count={3} />
                <ListSkeleton count={2} />
            </div>
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="min-h-screen pb-24 space-y-6">
            <div className="bg-slate-100 h-64 rounded-b-3xl p-6 animate-pulse">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex gap-3 items-center">
                        <Skeleton className="w-12 h-12 rounded-xl bg-slate-200" />
                        <div className="space-y-2">
                            <Skeleton className="w-20 h-3 bg-slate-200" />
                            <Skeleton className="w-32 h-5 bg-slate-200" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="w-10 h-10 rounded-full bg-slate-200" />
                        <Skeleton className="w-10 h-10 rounded-full bg-slate-200" />
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mt-8">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-24 rounded-2xl bg-slate-200" />
                    ))}
                </div>
            </div>
            <div className="px-6">
                <Skeleton className="h-40 w-full rounded-3xl bg-slate-100 mb-6" />
                <ListSkeleton count={2} />
            </div>
        </div>
    );
}

export function ProductGridSkeleton() {
    return (
        <div className="grid grid-cols-2 gap-4 mt-4">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="glass rounded-2xl p-3 space-y-3">
                    <Skeleton className="w-full aspect-square rounded-xl bg-slate-200" />
                    <Skeleton className="h-4 w-3/4 bg-slate-200" />
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-16 bg-slate-200" />
                        <Skeleton className="h-8 w-8 rounded-full bg-slate-200" />
                    </div>
                </div>
            ))}
        </div>
    );
}