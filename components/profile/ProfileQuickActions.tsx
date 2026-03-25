import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FileText, TrendingUp, Calendar, Heart, BookOpen, Gift } from 'lucide-react';
import { createPageUrl } from '@/utils';

export const ProfileQuickActions = () => {
    // Quick actions with creative icons
    const quickActions = [
        { icon: FileText, label: 'ملفي الطبي', href: createPageUrl('MedicalFile'), color: '#2D9B83', bg: 'bg-emerald-50' },
        { icon: TrendingUp, label: 'متتبع الصحة', href: '/health-tracker', color: '#F59E0B', bg: 'bg-amber-50', badge: 'جديد' },
        { icon: Calendar, label: 'مواعيدي', href: createPageUrl('MyAppointments'), color: '#3B82F6', bg: 'bg-blue-50' },
        { icon: Heart, label: 'خريطة الجسم', href: createPageUrl('BodyMap'), color: '#EC4899', bg: 'bg-pink-50' },
        { icon: BookOpen, label: 'دوراتي', href: createPageUrl('Courses'), color: '#8B5CF6', bg: 'bg-violet-50' },
        { icon: Gift, label: 'المكافآت', href: '/rewards', color: '#D4AF37', bg: 'bg-amber-50', badge: 'جديد' },
    ];

    return (
        <div className="px-4 pt-6">
            <motion.h3
                className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3 px-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                خدماتي
            </motion.h3>
            <div className="grid grid-cols-3 gap-3">
                {quickActions.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <Link key={index} href={item.href}>
                            <motion.div
                                className="relative bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 text-center"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + index * 0.05 }}
                                whileHover={{ scale: 1.03, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {item.badge && (
                                    <motion.span
                                        className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[8px] font-bold"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.6, type: 'spring' }}
                                    >
                                        {item.badge}
                                    </motion.span>
                                )}
                                <motion.div
                                    className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center mx-auto mb-2`}
                                    whileTap={{ rotate: -10, scale: 0.9 }}
                                >
                                    <Icon className="w-6 h-6" style={{ color: item.color }} strokeWidth={1.5} />
                                </motion.div>
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                            </motion.div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
