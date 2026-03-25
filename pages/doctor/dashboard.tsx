// pages/doctor/dashboard.tsx
// Doctor Dashboard Demo: A look at how patients' Triage/SOAP reports appear to the medical team.

import React, { useState } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/db';
import { useQuery } from '@tanstack/react-query';
import { 
    Activity, ShieldAlert, Heart, Calendar, Clock, ArrowRight,
    Search, Filter, Users, FileText, CheckCircle2, TrendingUp,
    AlertTriangle, Bell, MessageSquare, Plus, ChevronDown, UserSquare2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

    // Fetch the daily logs which might include our clinical triages
    const { data: logs = [], isLoading } = useQuery({
        queryKey: ['clinical-triage-doctor-view'],
        queryFn: async () => {
            const allLogs = await db.entities.DailyLog.list();
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

    const triageColorMap: Record<string, string> = {
        'routine': 'bg-emerald-50 text-emerald-700 border-emerald-200',
        'near_review': 'bg-amber-50 text-amber-700 border-amber-200',
        'urgent_sameday': 'bg-orange-50 text-orange-700 border-orange-200',
        'emergency': 'bg-rose-50 text-rose-700 border-rose-200',
    };

    const triageLabelMap: Record<string, string> = {
        'routine': 'روتيني',
        'near_review': 'متابعة قريبة',
        'urgent_sameday': 'عاجل (نفس اليوم)',
        'emergency': 'طوارئ',
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
            <Head>
                <title>Tibrah Doctor Portal</title>
            </Head>

            {/* Top Navigation */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-slate-800 tracking-tight">طِبرَا <span className="text-indigo-600 font-medium text-sm ml-1">DR</span></h1>
                        </div>
                        
                        <nav className="hidden md:flex gap-1 ml-4">
                            {[
                                { id: 'triage', label: 'الفرز الطبي (Triage)', icon: ShieldAlert },
                                { id: 'patients', label: 'المرضى', icon: Users },
                                { id: 'appointments', label: 'المواعيد', icon: Calendar },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                                        activeTab === tab.id 
                                        ? 'bg-indigo-50 text-indigo-700' 
                                        : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text" 
                                placeholder="بحث بالاسم أو الملف..." 
                                className="w-64 pl-4 pr-10 py-2 bg-slate-100 border-transparent rounded-lg text-sm focus:border-indigo-300 focus:bg-white focus:ring-0 transition-all outline-none"
                            />
                        </div>
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                            <span className="font-bold text-slate-600 text-sm">د.ع</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8 flex gap-6 h-[calc(100vh-4rem)]">
                
                {/* Left Column: Triage Queue */}
                <div className="w-[380px] flex-shrink-0 flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h2 className="font-bold text-slate-800 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-600" />
                            قائمة الانتظار النشطة
                        </h2>
                        <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200">{logs.length} حالات</Badge>
                    </div>

                    <div className="p-2 border-b border-slate-100 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 text-xs">
                            <Filter className="w-3 h-3 ml-1" /> تصفية
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 text-xs text-rose-600 border-rose-200 hover:bg-rose-50">
                            الحرجة فقط
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                        {isLoading ? (
                            <div className="p-4 text-center text-slate-500 text-sm">جاري التحميل...</div>
                        ) : logs.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">
                                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">لا توجد تقارير فرز جديدة.</p>
                                <p className="text-xs mt-1">قم بتسجيل أعراض في الصفحة الرئيسية لتظهر هنا.</p>
                            </div>
                        ) : (
                            logs.map(log => {
                                let tData: TriageReport | null = null;
                                try { tData = JSON.parse(log.notes); } catch(e) {}
                                
                                const isSelected = selectedReportId === log.id;
                                const tLevel = tData?.highestTriageLevel || 'routine';
                                const colorClass = triageColorMap[tLevel] || triageColorMap['routine'];
                                
                                return (
                                    <button 
                                        key={log.id}
                                        onClick={() => setSelectedReportId(log.id)}
                                        className={`w-full text-right p-3 rounded-xl border transition-all ${
                                            isSelected 
                                            ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
                                            : 'bg-white border-slate-100 hover:border-indigo-100 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                                                    <UserSquare2 className="w-4 h-4 text-slate-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">مريض غير مسجل (Demo)</p>
                                                    <p className="text-[11px] text-slate-500">{new Date(log.date).toLocaleDateString('ar-SA')}</p>
                                                </div>
                                            </div>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${colorClass}`}>
                                                {triageLabelMap[tLevel]}
                                            </span>
                                        </div>
                                        {tData?.primaryComplaintId && (
                                            <p className="text-xs font-semibold text-slate-700 truncate mb-1">
                                                الشكوى: {tData.primaryComplaintId}
                                            </p>
                                        )}
                                        {tData?.openNarrative && (
                                            <p className="text-[11px] text-slate-500 line-clamp-1 italic">
                                                "{tData.openNarrative}"
                                            </p>
                                        )}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Right Column: Active Patient Report (SOAP Note) */}
                <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col relative">
                    {selectedReportId && selectedTriage ? (
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={selectedReportId} 
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
                                className="flex flex-col h-full"
                            >
                                {/* Report Header */}
                                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-2xl font-bold text-slate-400">
                                            M
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                                ملف التقييم #TC-{selectedReportId.substring(0,6).toUpperCase()}
                                                <span className={`text-xs px-2.5 py-1 rounded-md border font-bold flex items-center gap-1 ${triageColorMap[selectedTriage.highestTriageLevel]}`}>
                                                    {selectedTriage.highestTriageLevel === 'emergency' && <AlertTriangle className="w-3 h-3" />}
                                                    {triageLabelMap[selectedTriage.highestTriageLevel]}
                                                </span>
                                            </h2>
                                            <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-3">
                                                <span><strong className="text-slate-700">العمر:</strong> {selectedTriage.demographics?.age || 'غير محدد'}</span>
                                                <span><strong className="text-slate-700">الجنس:</strong> {selectedTriage.demographics?.gender || 'غير محدد'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" className="border-slate-200 text-slate-600 bg-white shadow-sm">
                                            <MessageSquare className="w-4 h-4 ml-2" />
                                            مراسلة المريض
                                        </Button>
                                        <Button className="bg-indigo-600 text-white shadow-sm hover:bg-indigo-700">
                                            قبول الحالة
                                        </Button>
                                    </div>
                                </div>

                                {/* Clinical SOAP Area */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                                    
                                    {/* Subjective */}
                                    <section>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-700 font-bold">S</div>
                                            Subjective (الشكوى والتاريخ)
                                        </h3>
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-4 shadow-sm">
                                            <div>
                                                <p className="text-xs text-slate-500 font-bold mb-1">الشكوى الرئيسية (Chief Complaint)</p>
                                                <p className="text-base font-bold text-slate-800">{selectedTriage.primaryComplaintId}</p>
                                            </div>
                                            
                                            {selectedTriage.openNarrative && (
                                                <div>
                                                    <p className="text-xs text-slate-500 font-bold mb-1">وصف المريض الحرفي</p>
                                                    <p className="text-sm text-slate-700 italic border-r-2 border-indigo-300 pr-3 py-1">"{selectedTriage.openNarrative}"</p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                                                <div className="bg-white p-3 rounded-lg border border-slate-100">
                                                    <p className="text-xs text-slate-400 mb-1">الشدة (Severity)</p>
                                                    <p className="font-bold text-slate-800">{selectedTriage.socratesAnswers?.severity || 5} / 10</p>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg border border-slate-100">
                                                    <p className="text-xs text-slate-400 mb-1">البداية (Onset)</p>
                                                    <p className="font-bold text-slate-800 text-sm">{selectedTriage.socratesAnswers?.onset || '-'}</p>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg border border-slate-100">
                                                    <p className="text-xs text-slate-400 mb-1">المدة (Duration)</p>
                                                    <p className="font-bold text-slate-800 text-sm">{selectedTriage.socratesAnswers?.duration || '-'}</p>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg border border-slate-100">
                                                    <p className="text-xs text-slate-400 mb-1">النمط (Pattern)</p>
                                                    <p className="font-bold text-slate-800 text-sm">{selectedTriage.socratesAnswers?.pattern || '-'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* HPI Details */}
                                    {Object.keys(selectedTriage.hpiAnswers || {}).length > 0 && (
                                        <section>
                                            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                                <Activity className="w-4 h-4 text-indigo-500" />
                                                أسئلة التاريخ المرضي المفصلة (HPI)
                                            </h3>
                                            <div className="space-y-2">
                                                {Object.entries(selectedTriage.hpiAnswers).map(([qid, ans], i) => (
                                                    <div key={i} className="flex gap-4 p-3 rounded-lg border border-slate-100 bg-white">
                                                        <div className="w-6 h-6 rounded bg-slate-50 text-slate-400 text-xs flex items-center justify-center font-bold flex-shrink-0">Q</div>
                                                        <div>
                                                            <p className="text-xs font-semibold text-slate-600 mb-1">{qid}</p>
                                                            <p className="text-sm font-bold text-slate-800">{Array.isArray(ans) ? ans.join('، ') : ans as string}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Red Flags Triggered */}
                                    {selectedTriage.redFlagsTriggered && selectedTriage.redFlagsTriggered.length > 0 && (
                                        <section>
                                            <h3 className="text-sm font-bold text-rose-600 mb-3 flex items-center gap-2">
                                                <ShieldAlert className="w-4 h-4" />
                                                تنبيهات الخطر (Red Flags)
                                            </h3>
                                            <div className="space-y-2">
                                                {selectedTriage.redFlagsTriggered.map((rf, i) => (
                                                    <div key={i} className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-sm font-bold flex items-center gap-3">
                                                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                                        {rf.msg}
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* System Assessment */}
                                    <section>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-slate-700 font-bold">A</div>
                                            Assessment (التقييم الآلي)
                                        </h3>
                                        <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                                            <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                                بناءً على المعطيات أعلاه، يُشتبه بوجود حالة سريرية تتعلق بـ <strong className="text-indigo-700">{selectedTriage.primaryComplaintId}</strong>.
                                                مستوى الألم المُبلغ عنه هو {selectedTriage.socratesAnswers?.severity || 5}/10. 
                                                {selectedTriage.hasUrgentRedFlag ? ' يتطلب تقييم طبي بشري عاجل نظراً لوجود مؤشرات خطر نشطة.' : ' لا توجد مؤشرات خطر حرجة مسجلة، حالة روتينية.'}
                                            </p>
                                        </div>
                                    </section>
                                    
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
                            <FileText className="w-16 h-16 mb-4 text-slate-200" />
                            <p className="text-lg font-bold text-slate-500 mb-1">لم يتم تحديد تقرير</p>
                            <p className="text-sm">اختر تقرير فرز طبي من القائمة الجانبية لعرض التفاصيل</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
