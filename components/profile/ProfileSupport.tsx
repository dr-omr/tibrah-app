import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { HelpCircle, MessageCircle, Info, ChevronLeft } from 'lucide-react';

export const ProfileSupport = () => {
    // Support items
    const supportItems = [
        { icon: HelpCircle, label: 'مركز المساعدة', href: '/help', color: '#3B82F6' },
        { icon: MessageCircle, label: 'تواصل معنا', href: '/contact', color: '#22C55E' },
        { icon: Info, label: 'عن طِبرَا', href: '/about', color: '#6366F1' },
    ];

    return (
        <div className="px-4 pt-6">
            <motion.h3
                className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3 px-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                الدعم والمساعدة
            </motion.h3>
            <motion.div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                {supportItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <Link key={index} href={item.href}>
                            <motion.div
                                className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-700 last:border-0"
                                whileTap={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                            >
                                <motion.div
                                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
                                    whileTap={{ scale: 0.9, rotate: 5 }}
                                >
                                    <Icon className="w-5 h-5" style={{ color: item.color }} />
                                </motion.div>
                                <span className="flex-1 font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                                <ChevronLeft className="w-5 h-5 text-slate-300" />
                            </motion.div>
                        </Link>
                    );
                })}
            </motion.div>
        </div>
    );
};
