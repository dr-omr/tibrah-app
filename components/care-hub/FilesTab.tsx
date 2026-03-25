// components/care-hub/FilesTab.tsx
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { User, TestTube2, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function FilesTab() {
    return (
        <motion.div
            key="files"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
        >
            <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800 dark:text-white">ملفي الطبي</h3>
                <Link href={createPageUrl('MedicalFile')}>
                    <Button size="sm" variant="outline" className="h-9 rounded-full text-xs font-semibold border-slate-200 dark:border-slate-700 text-primary">
                        عرض التفاصيل
                        <ChevronLeft className="w-3 h-3 mr-1" />
                    </Button>
                </Link>
            </div>

            {/* Quick medical info cards */}
            <div className="grid grid-cols-2 gap-3">
                <Link href={createPageUrl('MedicalFile')}
                    className="bg-white dark:bg-slate-800/80 rounded-3xl p-4 border border-slate-200/60 dark:border-slate-700/50 shadow-sm active:scale-[0.97] transition-transform"
                >
                    <div className="w-10 h-10 rounded-xl bg-blue-100/80 dark:bg-blue-900/20 flex items-center justify-center mb-2.5">
                        <User className="w-5 h-5 text-blue-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">البيانات الشخصية</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">فصيلة الدم، الطول، الوزن</p>
                </Link>
                <Link href={createPageUrl('MedicalFile')}
                    className="bg-white dark:bg-slate-800/80 rounded-3xl p-4 border border-slate-200/60 dark:border-slate-700/50 shadow-sm active:scale-[0.97] transition-transform"
                >
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/80 dark:bg-emerald-900/20 flex items-center justify-center mb-2.5">
                        <TestTube2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">التحاليل</p>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">رفع وعرض نتائج التحاليل</p>
                </Link>
            </div>
        </motion.div>
    );
}
