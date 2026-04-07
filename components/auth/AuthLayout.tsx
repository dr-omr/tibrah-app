import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Shield } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

const containerVariants: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: {
        opacity: 1, y: 0, scale: 1,
        transition: { type: 'spring', damping: 25, stiffness: 350, staggerChildren: 0.1 }
    },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

const headerVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 400 } }
};

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-slate-50 text-slate-900" dir="rtl">
            <AnimatedBackground />

            {/* Central Crisp Card */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative z-10 w-full max-w-[440px]"
            >
                <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-slate-100 relative">

                    {/* Header */}
                    <motion.div variants={headerVariants} className="text-center mb-10">
                        {/* Logo Box */}
                        <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-emerald-100 bg-emerald-50">
                            <span className="text-3xl font-black text-emerald-600">ط</span>
                        </div>
                        <h1 className="text-[28px] font-black text-slate-900 mb-3 tracking-tight leading-tight">{title}</h1>
                        <p className="text-slate-500 text-sm leading-relaxed px-4">{subtitle}</p>
                    </motion.div>

                    {/* Content Slot / Form Elements */}
                    <div className="space-y-6">
                        {children}
                    </div>

                </div>

                {/* Security Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center mt-8 text-slate-400 text-[13px] font-medium tracking-wide flex items-center justify-center gap-2"
                >
                    <Shield className="w-4 h-4 text-emerald-500/70" />
                    محمي بواسطة تقنيات تشفير متطورة
                </motion.div>
            </motion.div>
        </div>
    );
}
