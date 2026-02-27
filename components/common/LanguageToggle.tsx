// components/common/LanguageToggle.tsx
// Beautiful animated language toggle switch

import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import { useLanguage, Language } from '@/contexts/LanguageContext';

interface LanguageToggleProps {
    variant?: 'button' | 'switch' | 'minimal';
}

export default function LanguageToggle({ variant = 'button' }: LanguageToggleProps) {
    const { language, setLanguage } = useLanguage();

    const toggle = () => {
        setLanguage(language === 'ar' ? 'en' : 'ar');
    };

    if (variant === 'minimal') {
        return (
            <motion.button
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                onClick={toggle}
                whileTap={{ scale: 0.95 }}
            >
                <Globe className="w-3.5 h-3.5" />
                {language === 'ar' ? 'EN' : 'عربي'}
            </motion.button>
        );
    }

    if (variant === 'switch') {
        return (
            <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-slate-400" />
                <div
                    className="relative w-16 h-8 bg-slate-100 dark:bg-slate-800 rounded-full cursor-pointer p-1"
                    onClick={toggle}
                >
                    <motion.div
                        className="w-6 h-6 bg-[#2D9B83] rounded-full flex items-center justify-center shadow-md"
                        animate={{ x: language === 'ar' ? 0 : 32 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                        <span className="text-white text-[9px] font-bold">
                            {language === 'ar' ? 'ع' : 'E'}
                        </span>
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-between px-2.5 pointer-events-none">
                        <span className={`text-[10px] font-semibold ${language === 'ar' ? 'text-transparent' : 'text-slate-400 dark:text-slate-500'}`}>ع</span>
                        <span className={`text-[10px] font-semibold ${language === 'en' ? 'text-transparent' : 'text-slate-400 dark:text-slate-500'}`}>E</span>
                    </div>
                </div>
            </div>
        );
    }

    // Default: button variant
    return (
        <motion.button
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            onClick={toggle}
            whileTap={{ scale: 0.96 }}
        >
            <Globe className="w-4 h-4 text-[#2D9B83]" />
            <span>{language === 'ar' ? 'English' : 'العربية'}</span>
        </motion.button>
    );
}
