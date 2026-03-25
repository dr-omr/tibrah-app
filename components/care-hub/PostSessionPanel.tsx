import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FileText, ClipboardList, Pill, CalendarPlus, ArrowLeft, CheckCircle2, AlertTriangle, RefreshCw, MessageCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';

/* ── Post-Session Panel (after appointment) ── */
interface PostSessionPanelProps {
    status: 'completed' | 'missed';
}

export function PostSessionPanel({ status }: PostSessionPanelProps) {
    if (status === 'missed') {
        return <MissedSessionCard />;
    }
    return <CompletedSessionCard />;
}

/* ── Completed Session ── */
function CompletedSessionCard() {
    return (
        <div className="px-4 pb-4">
            <div className="rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/50 p-4">
                {/* Header */}
                <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h4 className="text-[14px] font-bold text-emerald-800 dark:text-emerald-300">تمت الجلسة بنجاح</h4>
                        <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70 font-medium">الخطوات التالية في رحلة تعافيك</p>
                    </div>
                </div>

                {/* Next Steps Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <NextStepCard icon={FileText} label="ملخص الجلسة" color="#0d9488" />
                    <NextStepCard icon={ClipboardList} label="الخطة العلاجية" color="#6366f1" />
                    <NextStepCard icon={Pill} label="الوصفات" color="#ec4899" />
                    <NextStepCard icon={CalendarPlus} label="موعد المتابعة" color="#f59e0b" />
                </div>
            </div>
        </div>
    );
}

function NextStepCard({ icon: Icon, label, color }: { icon: React.ElementType; label: string; color: string }) {
    return (
        <motion.button
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-emerald-100/60 dark:border-slate-700 hover:shadow-sm transition-all text-right"
        >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${color}12` }}>
                <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        </motion.button>
    );
}

/* ── Missed Session ── */
function MissedSessionCard() {
    return (
        <div className="px-4 pb-4">
            <div className="rounded-2xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200/60 dark:border-orange-800/30 p-4">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                        <AlertTriangle className="w-4.5 h-4.5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                        <h4 className="text-[14px] font-bold text-orange-800 dark:text-orange-300">فاتك الموعد</h4>
                        <p className="text-[11px] text-orange-600/70 dark:text-orange-400/70 font-medium">لا تقلق، صحتك تهمنا — يمكنك إعادة الجدولة</p>
                    </div>
                </div>

                <div className="flex gap-2 mt-3">
                    <Link href={createPageUrl('BookAppointment')} className="flex-1">
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 text-white text-[12px] font-bold shadow-sm"
                        >
                            <RefreshCw className="w-3.5 h-3.5" />
                            إعادة جدولة
                        </motion.button>
                    </Link>
                    <motion.button
                        whileTap={{ scale: 0.97 }}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 text-[12px] font-bold"
                    >
                        <MessageCircle className="w-3.5 h-3.5" />
                        تواصل
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
