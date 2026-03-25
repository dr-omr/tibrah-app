import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Scale, Thermometer, Calendar } from 'lucide-react';
import type { PatientProfile } from '@/components/medical-file/MedicalFileForms';

interface QuickInfoGridProps {
    profile: PatientProfile;
}

const quickInfoItems = [
    { icon: Droplets, label: 'فصيلة الدم', key: 'blood_type', gradient: 'from-red-500 to-rose-500', glow: 'shadow-red-500/20', bg: 'bg-red-50 dark:bg-red-900/20' },
    { icon: Scale, label: 'الوزن', key: 'weight', gradient: 'from-violet-500 to-purple-500', glow: 'shadow-violet-500/20', bg: 'bg-purple-50 dark:bg-purple-900/20', suffix: 'كجم' },
    { icon: Thermometer, label: 'الطول', key: 'height', gradient: 'from-blue-500 to-blue-600', glow: 'shadow-blue-500/20', bg: 'bg-blue-50 dark:bg-blue-900/20', suffix: 'سم' },
    { icon: Calendar, label: 'العمر', key: 'birth_date', gradient: 'from-emerald-500 to-teal-500', glow: 'shadow-emerald-500/20', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
];

export default function QuickInfoGrid({ profile }: QuickInfoGridProps) {
    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        if (today.getMonth() < birth.getMonth() ||
            (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    return (
        <div className="px-4 -mt-5 relative z-10">
            <div className="grid grid-cols-4 gap-2 mb-5">
                {quickInfoItems.map((item, index) => {
                    const Icon = item.icon;
                    let value = profile[item.key as keyof PatientProfile];
                    if (item.key === 'birth_date' && value) {
                        value = calculateAge(value as string).toString();
                    }
                    return (
                        <motion.div
                            key={index}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-3 shadow-md shadow-slate-200/50 dark:shadow-none border border-slate-100/80 dark:border-slate-700/60 text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.08 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mx-auto mb-2 shadow-md ${item.glow}`}>
                                <Icon className="w-4 h-4 text-white" strokeWidth={2} />
                            </div>
                            <div className="text-sm font-bold text-slate-800 dark:text-white leading-none">
                                {typeof value === 'string' || typeof value === 'number' ? value || '—' : '—'}{item.suffix && value ? ` ${item.suffix}` : ''}
                            </div>
                            <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">{item.label}</div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
