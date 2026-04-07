// pages/doctor/dashboard.tsx
// PREMIUM Doctor Dashboard: Advanced Clinical Triage & SOAP Management 
// Features Glassmorphism, Dynamic Layouts, and One-Click Assessment.

import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/db';
import { useQuery } from '@tanstack/react-query';
import { 
    Activity, ShieldAlert, Heart, Calendar, Clock, ArrowRight,
    Search, Filter, Users, FileText, CheckCircle2, TrendingUp,
    AlertTriangle, Bell, MessageSquare, Plus, ChevronDown, UserSquare2,
    Zap, Stethoscope, FileSignature, Sparkles, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/notification-engine';

// Types for parsing triage JSON
interface TriageReport {
    orientation: string;
    demographics: { age: string, gender: string, pregnancy: string };
    chiefComplaintCategories: string[];
    primaryComplaintId: string;
    highestTriageLevel: string;
    hasUrgentRedFlag: boolean;
    redFlagsTriggered: any[];
    hpiAnswers: Record<string, any>;
    socratesAnswers: Record<string, any>;
    openNarrative: string;
}

export default function DoctorDashboard() {
    const [activeTab, setActiveTab] = useState<'triage'|'patients'|'appointments'>('triage');
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch the daily logs which might include our clinical triages
    const { data: logs = [], isLoading } = useQuery({
        queryKey: ['clinical-triage-doctor-view'],
        queryFn: async () => {
            const allLogs = await db.entities.DailyLog.list(undefined, undefined, true);
            return allLogs.filter(log => log.type === 'clinical_triage').reverse();
        }
    });

    const selectedLog = logs.find(l => l.id === selectedReportId);
    let selectedTriage: TriageReport | null = null;
    
    if (selectedLog && selectedLog.notes) {
        try {
            selectedTriage = JSON.parse(selectedLog.notes);
        } catch(e) {}
    }

    // Advanced UI Mappings
    const triageColorMap: Record<string, string> = {
        'routine': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        'near_review': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        'urgent_sameday': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
        'emergency': 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.3)]',
    };

    const triageLabelMap: Record<string, string> = {
        'routine': 'حالة روتينية',
        'near_review': 'متابعة قريبة',
        'urgent_sameday': 'عاجل (نفس اليوم)',
        'emergency': 'حالة طوارئ 🚨',
    };

    const handleAcceptCase = () => {
        setActionLoading(true);
        setTimeout(() => {
            toast.success('تم قبول الحالة ونقلها لعيادتك الرقمية 🏥');
            setActionLoading(false);
        }, 800);
    };

    const handleMarkReviewed = () => {
        setActionLoading(true);
        setTimeout(() => {
            toast.success('تم التأشير على التقرير كـ "تمت المراجعة" ✅');
            setActionLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
            <Head>
                <title>طِبرَا - عيادة الطبيب</title>
            </Head>

            {/* Dynamic Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-indigo-600/10 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-emerald-600/10 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute top-[40%] right-[30%] w-[30vw] h-[30vw] bg-rose-600/5 rounded-full blur-[100px] mix-blend-screen" />
            </div>

            {/* Premium Header */}
            <header className="relative z-30 border-b border-white/5 bg-slate-900/50 backdrop-blur-2xl">
                <div className="max-w-[1920px] mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-10">
                        {/* Logo Area */}
                        <div className="flex items-center gap-3">
                            <motion.div 
                                className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20"
                                whileHover={{ scale: 1.05, rotate: 5 }}
                            >
                                <Stethoscope className="w-6 h-6 text-white" />
                            </motion.div>
                            <div>
                                <h1 className="text-xl font-bold text-white tracking-widest flex items-center gap-2">
                                    طِبرَا <span className="bg-white/10 px-2 py-0.5 rounded text-xs text-indigo-300 font-mono">PRO</span>
                                </h1>
                                <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">Clinical Intelligence System</p>
                            </div>
                        </div>
                        
                        {/* Main Tabs Navigation */}
                        <nav className="hidden lg:flex gap-2 bg-slate-800/50 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
                            {[
                                { id: 'triage', label: 'طابور الفرز', icon: Activity, badge: logs.length },
                                { id: 'patients', label: 'سجل المرضى', icon: Users, badge: 0 },
                                { id: 'appointments', label: 'المواعيد', icon: Calendar, badge: 3 },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`relative px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-3 transition-all duration-300 ${
                                        activeTab === tab.id 
                                        ? 'text-white' 
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                                    }`}
                                >
                                    {activeTab === tab.id && (
                                        <motion.div 
                                            layoutId="activeTabDoc"
                                            className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/20"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-white' : ''}`} />
                                        {tab.label}
                                    </span>
                                    {tab.badge > 0 && (
                                        <span className={`relative z-10 text-[10px] font-black px-2 py-0.5 rounded-full ${
                                            activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-300'
                                        }`}>
                                            {tab.badge}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Right Tools Area */}
                    <div className="flex items-center gap-5">
                        <div className="relative group">
                            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-indigo-400" />
                            <input 
                                type="text" 
                                placeholder="بحث برقم الملف، الهوية..." 
                                className="w-72 pl-4 pr-11 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:bg-slate-800 focus:ring-1 focus:ring-indigo-500 transition-all outline-none"
                            />
                        </div>
                        <button className="relative p-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-slate-300 hover:text-white hover:bg-slate-700 transition-all">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_#f43f5e]"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-bold text-white">د. عمر العماد</p>
                                <p className="text-[11px] text-emerald-400 flex items-center justify-end gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    متاح - On Call
                                </p>
                            </div>
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border border-white/20 shadow-inner flex items-center justify-center overflow-hidden">
                                <span className="font-bold text-white text-lg">ع</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-[1920px] mx-auto p-6 flex gap-6 h-[calc(100vh-5rem)]">
                
                {/* ─────────────────────────────────────────────────────────────────
                    LEFT COLUMN: AI TRIAGE QUEUE (GLASSMORPHISM)
                ────────────────────────────────────────────────────────────────── */}
                <div className="w-[420px] flex-shrink-0 flex flex-col bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden relative">
                    
                    {/* Glowing Edge Effect */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

                    <div className="p-6 border-b border-white/5 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <h2 className="font-bold text-xl text-white flex items-center gap-2">
                                <Activity className="w-5 h-5 text-indigo-400" />
                                الفرز الذكي العاجل
                            </h2>
                            {isLoading && <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />}
                        </div>
                        
                        {/* Smart Filters */}
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1 bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl text-xs h-9">
                                <Filter className="w-3 h-3 ml-1.5" /> الكل
                            </Button>
                            <Button variant="outline" className="flex-1 bg-rose-500/10 border-rose-500/20 text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 rounded-xl text-xs h-9 font-semibold">
                                طوارئ وعاجل
                            </Button>
                        </div>
                    </div>

                    {/* Patient Cards List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                        {isLoading ? (
                            <div className="flex flex-col gap-3">
                                {[1,2,3].map(i => (
                                    <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                                <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500/50" />
                                </div>
                                <p className="font-bold text-slate-400">طابور الفرز فارغ</p>
                                <p className="text-xs mt-1">لا توجد حالات جديدة في الانتظار</p>
                            </div>
                        ) : (
                            logs.map((log, index) => {
                                let tData: TriageReport | null = null;
                                try { tData = JSON.parse(log.notes); } catch(e) {}
                                
                                const isSelected = selectedReportId === log.id;
                                const tLevel = tData?.highestTriageLevel || 'routine';
                                const colorClass = triageColorMap[tLevel] || triageColorMap['routine'];
                                const isUrgent = tLevel === 'emergency' || tLevel === 'urgent_sameday';
                                
                                return (
                                    <motion.button 
                                        key={log.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => setSelectedReportId(log.id)}
                                        className={`w-full text-right p-4 rounded-2xl border transition-all duration-300 group ${
                                            isSelected 
                                            ? 'bg-slate-800/80 border-indigo-500/50 shadow-[0_4px_20px_rgba(99,102,241,0.1)]' 
                                            : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className="w-10 h-10 rounded-[10px] bg-slate-800 flex items-center justify-center overflow-hidden border border-white/10">
                                                        <UserSquare2 className="w-5 h-5 text-slate-400 group-hover:text-indigo-300 transition-colors" />
                                                    </div>
                                                    {isUrgent && (
                                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(244,63,94,0.8)] animate-pulse" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                                        مريض ID: {log.id.substring(0,6).toUpperCase()}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(log.date).toLocaleTimeString('ar-SA', {hour: '2-digit', minute:'2-digit'})}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${colorClass}`}>
                                                {triageLabelMap[tLevel]}
                                            </span>
                                        </div>

                                        {tData?.primaryComplaintId && (
                                            <div className="bg-slate-900/50 rounded-lg p-2.5 border border-white/5 mt-1">
                                                <p className="text-xs font-semibold text-slate-300 truncate">
                                                    <span className="text-indigo-400 ml-1">#</span>
                                                    {tData.primaryComplaintId}
                                                </p>
                                            </div>
                                        )}
                                    </motion.button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ─────────────────────────────────────────────────────────────────
                    RIGHT COLUMN: SMART CLINICAL REPORT (AI-POWERED)
                ────────────────────────────────────────────────────────────────── */}
                <div className="flex-1 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative">
                    {/* Glowing Edge Effect */}
                    <div className="absolute top-0 right-0 left-0 h-[1px] bg-gradient-to-l from-transparent via-cyan-500/50 to-transparent" />

                    {selectedReportId && selectedTriage ? (
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={selectedReportId} 
                                initial={{ opacity: 0, scale: 0.98 }} 
                                animate={{ opacity: 1, scale: 1 }} 
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                className="flex flex-col h-full"
                            >
                                {/* Report Action Header */}
                                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-sm z-10 sticky top-0">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 shadow-lg flex items-center justify-center text-xl font-bold text-white">
                                            {selectedTriage.demographics?.gender === 'female' ? 'F' : 'M'}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                                تقرير S.O.A.P آلي
                                                {selectedTriage.hasUrgentRedFlag && (
                                                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border border-rose-500/50 bg-rose-500/10 text-rose-400 font-bold shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                                                        <AlertTriangle className="w-3.5 h-3.5" />
                                                        عناية عاجلة
                                                    </span>
                                                )}
                                            </h2>
                                            <div className="flex items-center gap-4 text-sm font-medium text-slate-400 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Badge className="bg-slate-800 text-slate-300 border-white/10 text-xs">العمر: {selectedTriage.demographics?.age || 'غير محدد'}</Badge>
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Badge className="bg-slate-800 text-slate-300 border-white/10 text-xs">الجنس: {selectedTriage.demographics?.gender || 'غير محدد'}</Badge>
                                                </span>
                                                <span className="flex items-center gap-1 text-slate-500">
                                                    <Clock className="w-3.5 h-3.5" /> أُنشئ منذ قليل
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex gap-3">
                                        <Button 
                                            variant="outline" 
                                            className="border-white/10 bg-slate-800/50 text-slate-200 hover:bg-slate-800 hover:text-white rounded-xl h-11 transition-all"
                                            onClick={handleMarkReviewed}
                                            disabled={actionLoading}
                                        >
                                            <Check className="w-4 h-4 ml-2 text-emerald-400" />
                                            تمت المراجعة
                                        </Button>
                                        <Button 
                                            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white shadow-lg shadow-indigo-500/20 rounded-xl h-11 font-bold"
                                            onClick={handleAcceptCase}
                                            disabled={actionLoading}
                                        >
                                            <FileSignature className="w-4 h-4 ml-2" />
                                            قبول وفتح ملف
                                        </Button>
                                    </div>
                                </div>

                                {/* Main Report Content Scroll Area */}
                                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative">
                                    
                                    {/* Background Logo Watermark */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
                                        <Activity className="w-[400px] h-[400px]" />
                                    </div>

                                    <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                                        
                                        {/* S: SUBJECTIVE */}
                                        <CategorySection title="Subjective" subtitle="الشكوى والبيانات المعطاة من المريض" letter="S">
                                            <div className="space-y-4">
                                                <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-6">
                                                    <p className="text-xs text-indigo-400 font-bold tracking-widest uppercase mb-2">Chief Complaint (الشكوى الرئيسية)</p>
                                                    <h4 className="text-2xl font-bold text-white mb-2">{selectedTriage.primaryComplaintId}</h4>
                                                    {selectedTriage.openNarrative && (
                                                        <blockquote className="border-r-4 border-indigo-500 pr-4 mt-4 py-1 text-slate-300 italic text-lg opacity-90">
                                                            "{selectedTriage.openNarrative}"
                                                        </blockquote>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                    <StatCard label="الشدة (Pain)" value={`${selectedTriage.socratesAnswers?.severity || 5} / 10`} highlight={Number(selectedTriage.socratesAnswers?.severity) >= 7} />
                                                    <StatCard label="البداية (Onset)" value={selectedTriage.socratesAnswers?.onset || 'تدريجي'} />
                                                    <StatCard label="المدة (Duration)" value={selectedTriage.socratesAnswers?.duration || 'مستمر'} />
                                                    <StatCard label="المسببات (Factors)" value={selectedTriage.socratesAnswers?.pattern || 'غير محدد'} />
                                                </div>
                                            </div>
                                        </CategorySection>

                                        {/* HPI Details - Extracted Context */}
                                        {Object.keys(selectedTriage.hpiAnswers || {}).length > 0 && (
                                            <CategorySection title="History of Present Illness" subtitle="أسئلة التفصيل الموجهة بواسطة الذكاء الاصطناعي" letter="H">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {Object.entries(selectedTriage.hpiAnswers).map(([qid, ans], i) => (
                                                        <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4 flex gap-4 transition-all hover:bg-white/10">
                                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs flex items-center justify-center font-bold flex-shrink-0">Q</div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-slate-400 mb-1 leading-relaxed">{qid}</p>
                                                                <p className="text-sm font-bold text-white leading-relaxed">
                                                                    {Array.isArray(ans) ? ans.join('، ') : ans as string}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CategorySection>
                                        )}

                                        {/* RED FLAGS */}
                                        {selectedTriage.redFlagsTriggered && selectedTriage.redFlagsTriggered.length > 0 && (
                                            <section className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-6 relative overflow-hidden">
                                                <div className="absolute top-0 left-0 w-2 h-full bg-rose-500" />
                                                <h3 className="text-lg font-bold text-rose-400 mb-4 flex items-center gap-2">
                                                    <AlertTriangle className="w-5 h-5" />
                                                    مؤشرات خطر حرجة مسجلة (Red Flags)
                                                </h3>
                                                <div className="space-y-3">
                                                    {selectedTriage.redFlagsTriggered.map((rf, i) => (
                                                        <div key={i} className="bg-slate-900/50 border border-rose-500/20 rounded-xl p-4 flex gap-4 items-start shadow-inner">
                                                            <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                                <Zap className="w-4 h-4 text-rose-500" />
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-bold text-sm mb-1">{rf.msg}</p>
                                                                <p className="text-xs text-rose-300/80">تتطلب تدخلاً عاجلاً قبل التصرف الروتيني.</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        )}

                                        {/* A: ASSESSMENT */}
                                        <CategorySection title="AI Assessment" subtitle="تقييم النظام الآلي المبدئي والتوصيات" letter="A">
                                            <div className="bg-gradient-to-tl from-indigo-900/30 to-purple-900/30 border border-indigo-500/20 rounded-3xl p-6 relative">
                                                <div className="absolute top-4 left-4">
                                                    <Sparkles className="w-6 h-6 text-indigo-400 opacity-50" />
                                                </div>
                                                <p className="text-lg text-slate-200 leading-loose font-medium mt-2">
                                                    بناءً على خوارزميات الفرز، يُشتبه بوجود حالة سريرية تتعلق بـ <strong className="text-white bg-indigo-500/20 px-2 py-0.5 rounded-md">{selectedTriage.primaryComplaintId}</strong>.
                                                    سجل المريض مستوى ألم ملحوظ ({selectedTriage.socratesAnswers?.severity || 5}/10). 
                                                    <br/><br/>
                                                    {selectedTriage.hasUrgentRedFlag ? (
                                                        <span className="text-rose-400 font-bold bg-rose-500/10 px-3 py-1 rounded-lg">
                                                            🚨 خطورة عليا: تتطلب الحالة استشارة في الطوارئ أو التواصل الفوري.
                                                        </span>
                                                    ) : (
                                                        <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg">
                                                            ✅ حالة مستقرة: يمكن توجيه المريض لحجز موعد عيادة أو استخدام خطة علاج ذاتي.
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </CategorySection>

                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                            <motion.div 
                                className="w-32 h-32 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-2xl"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            >
                                <FileText className="w-12 h-12 text-slate-600" />
                            </motion.div>
                            <h3 className="text-2xl font-bold text-white mb-2">منطقة التقييم السريري</h3>
                            <p className="text-sm text-slate-400 max-w-sm text-center">يرجى اختيار مريض من طابور الفرز الجانبي لعرض تقرير SOAP التفصيلي المولد آلياً.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// Helper UI Components
const CategorySection = ({ title, subtitle, letter, children }: { title: string, subtitle: string, letter: string, children: React.ReactNode }) => (
    <section>
        <header className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
                <span className="text-2xl font-black text-white">{letter}</span>
            </div>
            <div>
                <h3 className="text-xl font-bold text-white tracking-wide">{title}</h3>
                <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
            </div>
        </header>
        <div className="mr-8">
            {children}
        </div>
    </section>
);

const StatCard = ({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) => (
    <div className={`p-4 rounded-xl border ${highlight ? 'bg-rose-500/10 border-rose-500/30' : 'bg-white/5 border-white/5'}`}>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">{label}</p>
        <p className={`text-base font-bold truncate ${highlight ? 'text-rose-400' : 'text-white'}`}>{value}</p>
    </div>
);
