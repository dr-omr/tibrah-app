import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, Pill, CalendarDays, BellPlus, Activity, ScanLine, Clock,
    CheckCircle2, ShieldCheck, Truck, Droplet, Zap, Search, Sparkles
} from 'lucide-react';
import { useRouter } from 'next/router';
import SEO from '@/components/common/SEO';
import PrescriptionScanner from '@/components/pharmacy/PrescriptionScanner';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { haptic } from '@/lib/HapticFeedback';

/* ═══ Types ═══ */
type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

interface MedSlot {
    id: string;
    name: string;
    dosage: string;
    time: TimeOfDay;
    timeLabel: string;
    taken: boolean;
    color: string;
    icon: React.ElementType;
}

/* ═══ Timeline Slot Card (Ultra Premium) ═══ */
const TimelineSlot = ({ med, onToggle }: { med: MedSlot, onToggle: (id: string) => void }) => {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onToggle(med.id)}
            className={`relative p-5 rounded-[28px] overflow-hidden cursor-pointer transition-all duration-300 border ${
                med.taken
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/50 grayscale-[0.3] shadow-inner'
                    : 'bg-white/90 dark:bg-[#0B1121]/90 backdrop-blur-xl border-slate-200/80 dark:border-slate-700/50 shadow-[0_10px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] hover:border-teal-200 dark:hover:border-teal-900/50'
            }`}
        >
            <div className="relative z-10 flex items-center gap-5">
                <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center transition-colors shadow-inner ${
                    med.taken ? 'bg-slate-100 dark:bg-slate-700/50 text-slate-400' : 'bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/40 dark:to-teal-800/40 text-teal-600 dark:text-teal-400 border border-teal-200/50 dark:border-teal-500/20 shadow-teal-500/10'
                }`}>
                    <med.icon className="w-7 h-7" />
                </div>

                <div className="flex-1">
                    <h3 className={`text-lg font-black tracking-tight mb-1 ${med.taken ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-900 dark:text-white'}`}>
                        {med.name}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${med.taken ? 'text-slate-400' : 'text-slate-500'}`}>
                            {med.dosage}
                        </span>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
                        <span className={`flex items-center gap-1.5 text-[11px] font-black tracking-wide ${med.taken ? 'text-slate-400' : 'text-teal-600 dark:text-teal-400'}`}>
                            <Clock className="w-3.5 h-3.5" />
                            {med.timeLabel}
                        </span>
                    </div>
                </div>

                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                    med.taken
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-600 text-transparent bg-slate-50 dark:bg-slate-800'
                }`}>
                    <CheckCircle2 className="w-6 h-6" />
                </div>
            </div>
        </motion.div>
    );
};

/* ═══ Main Page ═══ */
export default function SmartPharmacy() {
    const router = useRouter();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'timeline' | 'cabinet' | 'scan'>('timeline');

    const [medications, setMedications] = useState<MedSlot[]>([
        { id: '1', name: 'أوميجا ٣ (Omega-3)', dosage: 'حبة واحدة ١٠٠٠ مغ', time: 'morning', timeLabel: '٨:٠٠ صباحاً', taken: true, color: 'blue', icon: Droplet },
        { id: '2', name: 'جلوكوفاج (Glucophage)', dosage: 'حبة ٥٠٠ مغ', time: 'afternoon', timeLabel: '٢:٠٠ ظهراً', taken: false, color: 'teal', icon: Pill },
        { id: '3', name: 'فيتامين د (Vitamin D3)', dosage: 'قطرات ٥٠٠٠ وحدة', time: 'evening', timeLabel: '٦:٠٠ مساءً', taken: false, color: 'amber', icon: Zap },
    ]);

    const handleToggleDose = (id: string) => {
        haptic.selection();
        setMedications(prev => prev.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
    };

    const takenCount = medications.filter(m => m.taken).length;
    const progress = Math.round((takenCount / medications.length) * 100) || 0;

    return (
        <div className="min-h-screen pb-32 bg-[#FDFDFD] dark:bg-[#020617] font-sans selection:bg-teal-500/30 overflow-hidden relative">
            <SEO title="الصيدلية الطبية الذكية — طِبرَا" description="تحليل الوصفات، إدارة الأدوية، تتبع الجرعات والتنبيهات بالذكاء الاصطناعي." />

            {/* SUPER PREMIUM GLOW EFFECTS */}
            <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-[radial-gradient(circle,_rgba(20,184,166,0.08)_0%,_transparent_60%)] dark:bg-[radial-gradient(circle,_rgba(20,184,166,0.12)_0%,_transparent_60%)] blur-[80px] pointer-events-none" />
            <div className="absolute top-[30%] right-[-20%] w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(99,102,241,0.05)_0%,_transparent_60%)] dark:bg-[radial-gradient(circle,_rgba(99,102,241,0.08)_0%,_transparent_60%)] blur-[80px] pointer-events-none" />

            {/* ─── Header ─── */}
            <div className="sticky top-0 z-50 pt-safe-top pb-4 px-6 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-[#020617]/70 backdrop-blur-2xl">
                <div className="flex items-center justify-between mt-4">
                    <button
                        onClick={() => router.back()}
                        className="w-12 h-12 rounded-full flex items-center justify-center bg-white/50 dark:bg-transparent border border-slate-200/80 dark:border-slate-800 active:scale-90 transition-all text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 shadow-sm rtl:-scale-x-100"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                    <h1 className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">
                        الصيدلية الذكية
                    </h1>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-teal-50 dark:bg-teal-500/10 border border-teal-200/60 dark:border-teal-500/20 text-teal-600 dark:text-teal-400 relative shadow-sm">
                        <BellPlus className="w-6 h-6" />
                        {takenCount < medications.length && (
                            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse border border-white dark:border-slate-900 shadow-sm" />
                        )}
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex items-center gap-2 mt-6 p-1.5 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md rounded-[20px] border border-slate-200/80 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
                    {[
                        { id: 'timeline', label: 'الجدول', icon: CalendarDays },
                        { id: 'cabinet', label: 'الخزانة', icon: Droplet },
                        { id: 'scan', label: 'تحليل روشتة', icon: ScanLine },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { haptic.selection(); setActiveTab(tab.id as any); }}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                                activeTab === tab.id
                                    ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-md'
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white bg-transparent'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ─── Main Content ─── */}
            <div className="relative z-10 px-5 pt-8 max-w-lg mx-auto">
                <AnimatePresence mode="wait">
                    
                    {/* ═══ TAB 1: TIMELINE ═══ */}
                    {activeTab === 'timeline' && (
                        <motion.div
                            key="timeline"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                            className="space-y-8"
                        >
                            {/* AI Safety Card - Ultra Premium */}
                            <div className="p-6 rounded-[32px] bg-gradient-to-br from-indigo-50/80 to-indigo-100/50 dark:from-indigo-900/30 dark:to-[#0B1121] border border-indigo-200/60 dark:border-indigo-800/50 relative overflow-hidden shadow-[0_20px_40px_rgba(79,70,229,0.06)] dark:shadow-[0_20px_40px_rgba(79,70,229,0.15)]">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                    <ShieldCheck className="w-32 h-32 text-indigo-500" />
                                </div>
                                <div className="relative z-10 flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-[20px] bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-inner border border-indigo-200/50 dark:border-indigo-500/30">
                                        <Sparkles className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-black text-indigo-900 dark:text-indigo-100 flex items-center gap-2 mb-1.5 object-contain">
                                            تحليل التفاعلات (طِبرَا AI)
                                            <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] px-2 py-0.5 rounded-md uppercase tracking-widest font-black border border-emerald-200/60 dark:border-emerald-500/20 shadow-sm object-contain">آمن</span>
                                        </h3>
                                        <p className="text-[13px] text-indigo-700 dark:text-indigo-300 font-bold leading-relaxed opacity-90">
                                            بروتوكول الأدوية الحالي لا يحتوي على أي تعارضات سلبية. المكملات الغذائية تدعم امتصاص الأدوية بكفاءة عالية.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Ring */}
                            <div className="flex flex-col items-center justify-center py-6">
                                <div className="relative w-40 h-40 flex items-center justify-center drop-shadow-xl">
                                    <div className="absolute inset-0 bg-white dark:bg-slate-800 rounded-full blur-xl opacity-50" />
                                    <svg className="absolute inset-0 w-full h-full -rotate-90 relative z-10">
                                        <circle cx="80" cy="80" r="70" className="stroke-slate-100 dark:stroke-slate-800" strokeWidth="10" fill="none" />
                                        <circle 
                                            cx="80" cy="80" r="70" 
                                            className="stroke-teal-500 transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]" 
                                            strokeWidth="10" fill="none" 
                                            strokeLinecap="round"
                                            strokeDasharray="439.8"
                                            strokeDashoffset={439.8 - (439.8 * progress) / 100}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                                        <span className="block text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-0.5">{progress}%</span>
                                        <span className="block text-[10px] uppercase tracking-widest text-teal-600 dark:text-teal-400 font-black">تغطية الجرعات</span>
                                    </div>
                                </div>
                            </div>

                            {/* Slots */}
                            <div className="space-y-4 relative z-20">
                                {medications.map(med => (
                                    <TimelineSlot key={med.id} med={med} onToggle={handleToggleDose} />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ═══ TAB 2: MEDICINE CABINET ═══ */}
                    {activeTab === 'cabinet' && (
                        <motion.div
                            key="cabinet"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white">أدويتك الحالية</h2>
                                <button className="px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-500/10 text-sm font-black text-teal-600 dark:text-teal-400 flex items-center gap-2 border border-teal-100 dark:border-teal-500/20 hover:bg-teal-100 transition-colors">
                                    إضافة <Pill className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="relative">
                                <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="ابحث في خزانة أدويتك..." 
                                    className="w-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700 rounded-[20px] py-4 pr-14 pl-5 text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all shadow-sm font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { name: 'جلوكوفاج', type: 'منظم سكر', count: '١٤ حبة متبقية', color: 'teal' },
                                    { name: 'أوميجا ٣', type: 'مكمل غذائي', count: '٤٥ حبة متبقية', color: 'blue' },
                                    { name: 'فيتامين د', type: 'مكمل غذائي', count: 'يكفي لشهر', color: 'amber' },
                                    { name: 'بانادول', type: 'مسكن مؤقت', count: 'استخدام عند اللزوم', color: 'rose' },
                                ].map((pill, i) => (
                                    <motion.div
                                        key={pill.name}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="bg-white/90 dark:bg-[#0B1121]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-[28px] p-5 relative overflow-hidden group shadow-[0_10px_30px_rgb(0,0,0,0.03)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.06)] transition-all"
                                    >
                                        <div className="w-12 h-12 rounded-[20px] bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/40 dark:to-teal-800/40 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4 shadow-inner border border-teal-200/50 dark:border-teal-500/30">
                                            <Pill className="w-6 h-6 text-teal-500" />
                                        </div>
                                        <h3 className="text-base font-black text-slate-900 dark:text-white mb-1.5">{pill.name}</h3>
                                        <span className="text-[11px] font-black tracking-widest uppercase text-teal-600 dark:text-teal-400 block mb-4 bg-teal-50 dark:bg-teal-500/10 inline-block px-2 py-1 rounded-md border border-teal-100 dark:border-teal-500/20">{pill.type}</span>
                                        
                                        <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                            <Activity className="w-4 h-4 text-slate-400" />
                                            <span className="text-[11px] text-slate-500 font-bold">{pill.count}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Store Promo */}
                            <button 
                                onClick={async () => {
                                    haptic.success();
                                    try {
                                        const res = await fetch('/api/pharmacy/refill-request', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({}) });
                                        if (res.ok) {
                                            const data = await res.json();
                                            if (data.whatsappUrl) window.open(data.whatsappUrl, '_blank');
                                        }
                                    } catch(e) {}
                                }}
                                className="w-full mt-8 p-6 rounded-[28px] bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/40 dark:to-emerald-900/40 border border-teal-200/60 dark:border-teal-500/30 flex items-center justify-between shadow-[0_10px_30px_rgba(20,184,166,0.1)] hover:shadow-[0_15px_40px_rgba(20,184,166,0.15)] active:scale-[0.98] transition-all text-right"
                            >
                                <div>
                                    <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                                        <Truck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                        إعادة تعبئة تلقائية
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium max-w-[200px] leading-relaxed">لا تدع أدويتك تنفذ. اشترك في خدمة التوصيل الشهري لضمان استمرارية العلاج.</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm">
                                    <ChevronRight className="w-5 h-5 text-teal-600 dark:text-teal-400 rtl:-scale-x-100" />
                                </div>
                            </button>
                        </motion.div>
                    )}

                    {/* ═══ TAB 3: AI SCANNER ═══ */}
                    {activeTab === 'scan' && (
                        <motion.div
                            key="scan"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-6"
                        >
                            <div className="p-8 rounded-[40px] bg-gradient-to-br from-teal-50/80 to-emerald-50/50 dark:from-teal-900/30 dark:to-teal-800/10 border border-teal-200/60 dark:border-teal-800/50 relative overflow-hidden shadow-[0_20px_40px_rgba(20,184,166,0.06)] dark:shadow-[0_20px_40px_rgba(20,184,166,0.15)]">
                                <div className="absolute top-0 right-[-10%] p-4 opacity-5 blur-[2px] pointer-events-none">
                                    <ScanLine className="w-48 h-48 text-teal-500" />
                                </div>
                                
                                <div className="relative z-10 text-center mb-8 max-w-sm mx-auto">
                                    <div className="inline-flex w-20 h-20 rounded-[28px] bg-white dark:bg-slate-800 items-center justify-center text-teal-600 dark:text-teal-400 mb-6 shadow-xl shadow-teal-500/10 border border-teal-100 dark:border-teal-700">
                                        <ScanLine className="w-10 h-10" />
                                    </div>
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">قراءة الروشتات بالذكاء الاصطناعي</h2>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium leading-relaxed">
                                        قم بتصوير الروشتة أو علبة الدواء وسيقوم "طِبرَا AI" بتحليلها، استخراج الأدوية، وجدولتها تلقائياً مع تحليل التعارضات.
                                    </p>
                                </div>
                                
                                <PrescriptionScanner />
                            </div>
                            
                            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-black uppercase tracking-widest mt-6">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" /> مدعوم بأحدث نماذج التعلم الآلي الطبي
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
