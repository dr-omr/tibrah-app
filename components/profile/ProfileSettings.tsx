import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { User, Bell, Palette, Shield, ChevronLeft } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { createPageUrl } from '@/utils';

interface ProfileSettingsProps {
    notifications: boolean;
    isDarkMode: boolean;
    updateSetting: (key: string, value: boolean) => void;
    toggleDarkMode: () => void;
}

export const ProfileSettings = ({ notifications, isDarkMode, updateSetting, toggleDarkMode }: ProfileSettingsProps) => {
    // Settings items
    const settingsItems = [
        { icon: User, label: 'تعديل الملف الشخصي', href: createPageUrl('Settings'), color: '#6366F1' },
        { icon: Bell, label: 'الإشعارات', toggle: true, value: notifications, onToggle: (v: boolean) => updateSetting('notifications', v), color: '#F59E0B' },
        { icon: Palette, label: 'الوضع الداكن', toggle: true, value: isDarkMode, onToggle: () => toggleDarkMode(), color: '#8B5CF6' },
        { icon: Shield, label: 'الأمان والخصوصية', href: createPageUrl('Settings'), color: '#10B981' },
    ];

    return (
        <div className="px-4 pt-6">
            <motion.h3
                className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3 px-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                الإعدادات
            </motion.h3>
            <motion.div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                {settingsItems.map((item, index) => {
                    const Icon = item.icon;
                    const content = (
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
                            {item.toggle ? (
                                <Switch
                                    checked={item.value}
                                    onCheckedChange={item.onToggle}
                                    className="data-[state=checked]:bg-primary"
                                />
                            ) : (
                                <ChevronLeft className="w-5 h-5 text-slate-300" />
                            )}
                        </motion.div>
                    );
                    return item.href ? (
                        <Link key={index} href={item.href}>{content}</Link>
                    ) : (
                        <div key={index}>{content}</div>
                    );
                })}
            </motion.div>
        </div>
    );
};
