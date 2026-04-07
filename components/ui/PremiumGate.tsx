import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Sparkles, Crown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useFeatureGate, FeatureName } from '@/lib/subscription/gates';

interface PremiumGateProps {
    feature: FeatureName;
    children: React.ReactNode;
    fallbackStyle?: 'blur' | 'hide' | 'card';
}

export default function PremiumGate({ feature, children, fallbackStyle = 'blur' }: PremiumGateProps) {
    const { allowed, loading, upgradePrompt } = useFeatureGate(feature);

    if (loading) {
        return <div className="animate-pulse bg-slate-100 dark:bg-slate-800 rounded-2xl h-32 w-full" />;
    }

    if (allowed) {
        return <>{children}</>;
    }

    if (fallbackStyle === 'hide') {
        return null;
    }

    if (fallbackStyle === 'card') {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-[28px] p-6 bg-gradient-to-br from-indigo-50 dark:from-indigo-900/30 to-purple-50 dark:to-purple-900/20 border border-indigo-100 dark:border-indigo-800/50 shadow-inner flex flex-col items-center justify-center text-center gap-4"
            >
                <div className="w-14 h-14 rounded-full bg-white dark:bg-[#0B1121] shadow-lg flex items-center justify-center text-indigo-500">
                    <Crown className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-black text-slate-900 dark:text-white mb-2 text-lg">ميزة حصرية للمشتركين</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-5 max-w-[280px]">
                        {upgradePrompt}
                    </p>
                    <Link href="/premium">
                        <Button className="rounded-full px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:opacity-90 font-bold shadow-lg shadow-indigo-500/30 text-white">
                            <Sparkles className="w-4 h-4 ml-2" />
                            تعرف على الباقات
                        </Button>
                    </Link>
                </div>
            </motion.div>
        );
    }

    // Default: Blur Style (Premium Content Teaser)
    return (
        <div className="relative overflow-hidden rounded-[28px] group">
            {/* The actual content blurred out */}
            <div className="blur-md opacity-40 select-none pointer-events-none grayscale-[0.2]">
                {children}
            </div>

            {/* The Paywall Overlay */}
            <div className="absolute inset-0 bg-white/40 dark:bg-[#0B1121]/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-10 p-6 text-center">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/90 dark:bg-[#0B1121]/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xl max-w-sm w-full"
                >
                    <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-500 mb-4 ring-4 ring-white dark:ring-[#0B1121]">
                        <Lock className="w-5 h-5" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">محتوى متميز</h4>
                    <p className="text-xs font-bold text-slate-500 leading-relaxed mb-5">
                        {upgradePrompt}
                    </p>
                    <Link href="/premium" className="block w-full">
                        <Button className="w-full rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-12 font-black text-sm active:scale-[0.98] transition-transform shadow-lg shadow-slate-900/10 dark:shadow-white/10">
                            ترقية الحساب الآن
                        </Button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
