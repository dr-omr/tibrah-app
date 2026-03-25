// components/admin/DoctorClinicalView.tsx
// ⚕️ Advanced Clinical Intelligence Dashboard for Dr. Omar
// Surfaces patient risk flags, emotional patterns, and longitudinal profiles

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, AlertTriangle, TrendingDown, TrendingUp, Activity,
    Heart, Brain, Stethoscope, ChevronLeft, Search, Shield,
    Calendar, Clock, Zap, Eye, FileText, ArrowRight,
    ThermometerSun, Frown, Smile, Meh, Loader2, X, Phone, Mail
} from 'lucide-react';

// ════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════

interface PatientSummary {
    id: string;
    name: string;
    email: string;
    phone?: string;
    joinDate: string;
    // Clinical Computed Fields
    riskLevel: 'low' | 'moderate' | 'high' | 'critical';
    avgMood: number;
    avgEnergy: number;
    avgStress: number;
    totalLogs: number;
    totalAppointments: number;
    lastActivity: string;
    topSymptoms: string[];
    flags: string[];
    diagnosticSeverity?: string;
}

interface DoctorClinicalViewProps {
    users: any[];
    appointments: any[];
    dailyLogs?: any[];
    symptomLogs?: any[];
    diagnosticResults?: any[];
}

// ════════════════════════════════════════════
// CLINICAL INTELLIGENCE ENGINE
// ════════════════════════════════════════════

function computePatientSummaries(
    users: any[],
    appointments: any[],
    dailyLogs: any[],
    symptomLogs: any[],
    diagnosticResults: any[]
): PatientSummary[] {
    return users.map(user => {
        const userId = user.id;
        const userEmail = user.email || '';

        // Match appointments by patient_email or created_by
        const userAppts = appointments.filter((a: any) =>
            a.patient_email === userEmail || a.created_by === userId
        );

        // Match logs by created_by (the user who created the log)
        const userLogs = dailyLogs.filter((l: any) => l.created_by === userId);
        const userSymptoms = symptomLogs.filter((s: any) => s.created_by === userId);
        const userDiagnostics = diagnosticResults.filter((d: any) => d.created_by === userId);

        // Compute mood, energy, stress averages
        const moodValues = userLogs.map((l: any) => l.mood).filter(Boolean);
        const energyValues = userLogs.map((l: any) => l.energy_level).filter(Boolean);
        const stressValues = userLogs.map((l: any) => l.stress_level).filter(Boolean);

        const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

        const avgMood = avg(moodValues);
        const avgEnergy = avg(energyValues);
        const avgStress = avg(stressValues);

        // Top symptoms
        const symptomCounts: Record<string, number> = {};
        userSymptoms.forEach((s: any) => {
            const name = s.symptom || 'غير محدد';
            symptomCounts[name] = (symptomCounts[name] || 0) + 1;
        });
        const topSymptoms = Object.entries(symptomCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name]) => name);

        // Diagnostic severity
        const highSeverity = userDiagnostics.find((d: any) => d.severity_level === 'critical' || d.severity_level === 'high');

        // Risk Flags
        const flags: string[] = [];
        if (avgMood > 0 && avgMood <= 2) flags.push('انخفاض مزاجي حاد');
        if (avgStress > 0 && avgStress >= 4) flags.push('مستوى توتر مرتفع');
        if (avgEnergy > 0 && avgEnergy <= 2) flags.push('طاقة منخفضة جداً');
        if (userSymptoms.some((s: any) => s.severity >= 8)) flags.push('أعراض شديدة مسجّلة');
        if (highSeverity) flags.push('تشخيص عالي الخطورة');
        if (userLogs.length === 0 && userAppts.length > 0) flags.push('لا يسجل يومياته');

        // Risk Level
        let riskLevel: PatientSummary['riskLevel'] = 'low';
        if (flags.length >= 3 || highSeverity?.severity_level === 'critical') riskLevel = 'critical';
        else if (flags.length >= 2) riskLevel = 'high';
        else if (flags.length >= 1) riskLevel = 'moderate';

        // Last activity: most recent log date or appointment date
        const allDates = [
            ...userLogs.map((l: any) => l.date || l.created_date),
            ...userAppts.map((a: any) => a.date || a.created_date),
        ].filter(Boolean).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        const lastActivity = allDates[0]
            ? new Date(allDates[0]).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' })
            : 'لا يوجد';

        return {
            id: userId,
            name: user.name || userEmail?.split('@')[0] || 'مريض',
            email: userEmail,
            phone: user.phone || '',
            joinDate: user.created_at ? new Date(user.created_at).toLocaleDateString('ar-EG') : '-',
            riskLevel,
            avgMood: Math.round(avgMood * 10) / 10,
            avgEnergy: Math.round(avgEnergy * 10) / 10,
            avgStress: Math.round(avgStress * 10) / 10,
            totalLogs: userLogs.length,
            totalAppointments: userAppts.length,
            lastActivity,
            topSymptoms,
            flags,
            diagnosticSeverity: highSeverity?.severity_level,
        };
    });
}

// ════════════════════════════════════════════
// RISK BADGE COMPONENT
// ════════════════════════════════════════════

function RiskBadge({ level }: { level: PatientSummary['riskLevel'] }) {
    const config = {
        low: { label: 'مستقر', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
        moderate: { label: 'متوسط', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
        high: { label: 'مرتفع', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
        critical: { label: 'حرج', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
    }[level];

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${config.bg} ${config.text} ${config.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${level === 'critical' ? 'animate-pulse' : ''}`} />
            {config.label}
        </span>
    );
}

// ════════════════════════════════════════════
// MINI METRIC BAR
// ════════════════════════════════════════════

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
    const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
    return (
        <div className="relative h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`absolute inset-y-0 left-0 rounded-full ${color}`}
            />
        </div>
    );
}

// ════════════════════════════════════════════
// PATIENT DETAIL DRAWER
// ════════════════════════════════════════════

function PatientDrawer({ patient, onClose }: { patient: PatientSummary; onClose: () => void }) {
    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 w-full max-w-lg bg-white border-r border-slate-200 shadow-2xl z-50 overflow-y-auto"
        >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between">
                <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-slate-100 transition-colors">
                    <X className="w-5 h-5 text-slate-600" />
                </button>
                <div className="text-right">
                    <h2 className="text-lg font-black text-slate-800">{patient.name}</h2>
                    <p className="text-xs text-slate-500 font-medium">{patient.email}</p>
                </div>
            </div>

            <div className="p-6 space-y-8">
                {/* Risk & Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                        <RiskBadge level={patient.riskLevel} />
                        <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase">مستوى الخطر</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                        <span className="text-2xl font-black text-slate-800">{patient.totalLogs}</span>
                        <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">سجلات يومية</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                        <span className="text-2xl font-black text-slate-800">{patient.totalAppointments}</span>
                        <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">مواعيد</p>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                        <span className="text-sm font-bold text-slate-800">{patient.lastActivity}</span>
                        <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">آخر نشاط</p>
                    </div>
                </div>

                {/* Contact */}
                <div className="flex gap-3">
                    {patient.phone && (
                        <a href={`tel:${patient.phone}`} className="flex-1 flex items-center justify-center gap-2 bg-teal-50 border border-teal-100 rounded-2xl p-3 text-teal-700 text-sm font-bold hover:bg-teal-100 transition-colors">
                            <Phone className="w-4 h-4" /> اتصال
                        </a>
                    )}
                    <a href={`mailto:${patient.email}`} className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 border border-indigo-100 rounded-2xl p-3 text-indigo-700 text-sm font-bold hover:bg-indigo-100 transition-colors">
                        <Mail className="w-4 h-4" /> بريد
                    </a>
                </div>

                {/* Clinical Vitals */}
                <div>
                    <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-teal-600" /> المؤشرات الحيوية (المتوسط)
                    </h3>
                    <div className="space-y-3">
                        {[
                            { label: 'المزاج', value: patient.avgMood, icon: patient.avgMood >= 3 ? Smile : patient.avgMood >= 2 ? Meh : Frown, color: patient.avgMood >= 3 ? 'bg-emerald-500' : patient.avgMood >= 2 ? 'bg-amber-500' : 'bg-red-500' },
                            { label: 'الطاقة', value: patient.avgEnergy, icon: Zap, color: patient.avgEnergy >= 3 ? 'bg-sky-500' : patient.avgEnergy >= 2 ? 'bg-amber-500' : 'bg-red-500' },
                            { label: 'التوتر', value: patient.avgStress, icon: ThermometerSun, color: patient.avgStress <= 2 ? 'bg-emerald-500' : patient.avgStress <= 3 ? 'bg-amber-500' : 'bg-red-500' },
                        ].map(item => {
                            const Icon = item.icon;
                            return (
                                <div key={item.label} className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-3">
                                    <Icon className="w-5 h-5 text-slate-400 shrink-0" />
                                    <span className="text-sm font-bold text-slate-700 w-16">{item.label}</span>
                                    <MiniBar value={item.value} max={5} color={item.color} />
                                    <span className="text-sm font-black text-slate-800 mr-auto">
                                        {item.value > 0 ? `${item.value}/5` : '—'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Symptoms */}
                {patient.topSymptoms.length > 0 && (
                    <div>
                        <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
                            <Stethoscope className="w-4 h-4 text-rose-500" /> أكثر الأعراض تكراراً
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {patient.topSymptoms.map(s => (
                                <span key={s} className="px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl text-xs font-bold text-rose-700">{s}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Clinical Flags */}
                {patient.flags.length > 0 && (
                    <div>
                        <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" /> إنذارات سريرية
                        </h3>
                        <div className="space-y-2">
                            {patient.flags.map((flag, i) => (
                                <div key={i} className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span className="text-xs font-bold text-amber-800">{flag}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Doctor Notes Placeholder */}
                <div>
                    <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500" /> ملاحظات الطبيب
                    </h3>
                    <textarea
                        placeholder="اكتب ملاحظاتك حول هذا المريض..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-700 placeholder-slate-400 resize-none h-28 focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition-all font-medium"
                    />
                </div>
            </div>
        </motion.div>
    );
}

// ════════════════════════════════════════════
// MAIN DOCTOR CLINICAL VIEW
// ════════════════════════════════════════════

export default function DoctorClinicalView({
    users,
    appointments,
    dailyLogs = [],
    symptomLogs = [],
    diagnosticResults = [],
}: DoctorClinicalViewProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [riskFilter, setRiskFilter] = useState<string>('all');
    const [selectedPatient, setSelectedPatient] = useState<PatientSummary | null>(null);

    // Compute patient summaries
    const patients = useMemo(() =>
        computePatientSummaries(users, appointments, dailyLogs, symptomLogs, diagnosticResults),
        [users, appointments, dailyLogs, symptomLogs, diagnosticResults]
    );

    // Filter & sort
    const filteredPatients = useMemo(() => {
        let result = patients;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q));
        }
        if (riskFilter !== 'all') {
            result = result.filter(p => p.riskLevel === riskFilter);
        }
        // Sort: critical first, then high, moderate, low
        const riskOrder = { critical: 0, high: 1, moderate: 2, low: 3 };
        result.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);
        return result;
    }, [patients, searchQuery, riskFilter]);

    // Summary stats
    const criticalCount = patients.filter(p => p.riskLevel === 'critical').length;
    const highCount = patients.filter(p => p.riskLevel === 'high').length;
    const totalFlags = patients.reduce((t, p) => t + p.flags.length, 0);
    const avgMoodAll = patients.filter(p => p.avgMood > 0).length > 0
        ? Math.round(patients.filter(p => p.avgMood > 0).reduce((t, p) => t + p.avgMood, 0) / patients.filter(p => p.avgMood > 0).length * 10) / 10
        : 0;

    const riskFilters = [
        { id: 'all', label: 'الكل', count: patients.length },
        { id: 'critical', label: 'حرج', count: criticalCount },
        { id: 'high', label: 'مرتفع', count: highCount },
        { id: 'moderate', label: 'متوسط', count: patients.filter(p => p.riskLevel === 'moderate').length },
        { id: 'low', label: 'مستقر', count: patients.filter(p => p.riskLevel === 'low').length },
    ];

    return (
        <div className="space-y-6">
            {/* ════ Clinical Summary Cards ════ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-teal-600" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">إجمالي المرضى</span>
                    </div>
                    <span className="text-3xl font-black text-slate-800">{patients.length}</span>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white border border-red-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">حالات حرجة</span>
                    </div>
                    <span className="text-3xl font-black text-red-700">{criticalCount + highCount}</span>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-amber-600" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">إجمالي الإنذارات</span>
                    </div>
                    <span className="text-3xl font-black text-amber-700">{totalFlags}</span>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white border border-sky-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-sky-600" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">متوسط المزاج العام</span>
                    </div>
                    <span className="text-3xl font-black text-sky-700">{avgMoodAll || '—'}</span>
                    <span className="text-xs text-slate-400 font-bold mr-1">/5</span>
                </motion.div>
            </div>

            {/* ════ Search + Risk Filter ════ */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث باسم المريض أو البريد..."
                        className="w-full bg-white border border-slate-200 rounded-xl pr-10 pl-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-200 focus:border-teal-300 transition-all font-medium"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                    {riskFilters.map(f => (
                        <button
                            key={f.id}
                            onClick={() => setRiskFilter(f.id)}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold border whitespace-nowrap transition-all ${
                                riskFilter === f.id
                                    ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {f.label} ({f.count})
                        </button>
                    ))}
                </div>
            </div>

            {/* ════ Patient Table ════ */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_80px] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <span>المريض</span>
                    <span>الخطورة</span>
                    <span>المزاج</span>
                    <span>التوتر</span>
                    <span>آخر نشاط</span>
                    <span>الإنذارات</span>
                    <span></span>
                </div>

                {/* Patient Rows */}
                {filteredPatients.length === 0 ? (
                    <div className="text-center py-16">
                        <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-400">لا توجد نتائج</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredPatients.map((patient, i) => (
                            <motion.div
                                key={patient.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.02 }}
                                onClick={() => setSelectedPatient(patient)}
                                className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_80px] gap-2 md:gap-4 items-center px-6 py-4 cursor-pointer hover:bg-slate-50 transition-colors group"
                            >
                                {/* Patient Info */}
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:border-teal-200 transition-colors">
                                        <span className="text-sm font-black text-teal-700">{patient.name.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 group-hover:text-teal-700 transition-colors">{patient.name}</p>
                                        <p className="text-[11px] text-slate-400 font-medium">{patient.email}</p>
                                    </div>
                                </div>

                                {/* Risk */}
                                <div className="flex items-center">
                                    <RiskBadge level={patient.riskLevel} />
                                </div>

                                {/* Mood */}
                                <div className="flex items-center gap-2">
                                    {patient.avgMood > 0 ? (
                                        <>
                                            <MiniBar value={patient.avgMood} max={5} color={patient.avgMood >= 3 ? 'bg-emerald-500' : 'bg-amber-500'} />
                                            <span className="text-xs font-bold text-slate-600">{patient.avgMood}</span>
                                        </>
                                    ) : (
                                        <span className="text-xs text-slate-300">—</span>
                                    )}
                                </div>

                                {/* Stress */}
                                <div className="flex items-center gap-2">
                                    {patient.avgStress > 0 ? (
                                        <>
                                            <MiniBar value={patient.avgStress} max={5} color={patient.avgStress >= 4 ? 'bg-red-500' : 'bg-sky-500'} />
                                            <span className="text-xs font-bold text-slate-600">{patient.avgStress}</span>
                                        </>
                                    ) : (
                                        <span className="text-xs text-slate-300">—</span>
                                    )}
                                </div>

                                {/* Last Activity */}
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-slate-300" />
                                    <span className="text-xs font-medium text-slate-500">{patient.lastActivity}</span>
                                </div>

                                {/* Flags */}
                                <div>
                                    {patient.flags.length > 0 ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-100 rounded-lg text-[10px] font-bold text-amber-700">
                                            <AlertTriangle className="w-3 h-3" />
                                            {patient.flags.length}
                                        </span>
                                    ) : (
                                        <span className="text-xs text-emerald-500 font-bold">✓ نظيف</span>
                                    )}
                                </div>

                                {/* View Action */}
                                <div className="flex justify-end">
                                    <button className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-teal-50 hover:border-teal-200">
                                        <Eye className="w-4 h-4 text-slate-500 group-hover:text-teal-600" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* ════ Patient Detail Drawer ════ */}
            <AnimatePresence>
                {selectedPatient && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedPatient(null)}
                            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                        />
                        <PatientDrawer patient={selectedPatient} onClose={() => setSelectedPatient(null)} />
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
