// components/home/quick-checkin/steps/IntakeSteps.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Clinical Intake Steps: Welcome, Demographics, Chief Complaint,
// Primary Selection, Routing Validation
// ════════════════════════════════════════════════════════════════════

import React from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Stethoscope, UserCog, Sparkles, ListChecks,
    Brain, ChevronRight,
} from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { clinicalPathways } from '@/lib/clinicalPathways';
import { type ClinicalData, type IntakeStep, IconMap } from '../checkin-types';

interface StepProps {
    clinicalData: ClinicalData;
    updateData: (key: keyof ClinicalData, value: any) => void;
    setStep: (step: IntakeStep) => void;
    handleNavigateBack: () => void;
}

/* ── Welcome ──────────────────────────────────────── */
export function WelcomeStep({
    updateData, setStep, isDraftAvailable, loadDraft,
}: StepProps & { isDraftAvailable: boolean; loadDraft: () => void }) {
    return (
        <motion.div key="welcome" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="text-center py-2">
            <div className="w-16 h-16 mx-auto rounded-3xl flex items-center justify-center shadow-lg mb-4 bg-gradient-to-br from-teal-500 to-indigo-600 shadow-teal-500/25">
                <Stethoscope className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-[17px] font-black text-slate-800 dark:text-white mb-2">التقييم السريري الخبير</h3>
            <p className="text-[12px] text-slate-500 font-medium mb-6 leading-relaxed">
                نظام يجمع الأعراض ويصنف خطورتها ويدمجها في تقرير طبي دقيق شامل يمكن للطبيب قراءته فوراً. ثق بنا، نحن نهتم بأدق التفاصيل.
            </p>
            <div className="space-y-3 mt-auto flex flex-col gap-3">
                {isDraftAvailable && (
                    <button onClick={loadDraft} className="w-full py-3.5 rounded-xl border border-indigo-200 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold text-[13px] flex items-center justify-center gap-2">
                        استكمال الجلسة المحفوظة سابقاً
                    </button>
                )}
                <button onClick={() => { updateData('orientation', 'new_issue'); haptic.selection(); setStep('demographics'); }}
                    className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[13px] shadow-lg hover:scale-[1.02] transition-transform">
                    بدء تسجيل الأعراض الطبية
                </button>
            </div>
        </motion.div>
    );
}

/* ── Demographics ─────────────────────────────────── */
export function DemographicsStep({ clinicalData, updateData, setStep, handleNavigateBack }: StepProps) {
    return (
        <motion.div key="dem" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full flex-1">
            <div className="flex justify-between items-start mb-1">
                <h4 className="text-[15px] font-extrabold text-slate-800 dark:text-white flex items-center gap-2"><UserCog className="w-4 h-4 text-indigo-500" /> المعلومات الأولية</h4>
                <button onClick={handleNavigateBack} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <p className="text-[11px] text-slate-500 mb-5 border-b pb-4">تؤثر هذه المعلومات بشدة على طبيعة الأسئلة الطبية الموجهة لك ومسارات الخطر.</p>
            <div className="space-y-5 flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div>
                    <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-2">الفئة العمرية:</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['طفل (0-14)', 'شاب (15-35)', 'بالغ (36-60)', 'كبير سن (+60)'].map(a => (
                            <button key={a} onClick={() => updateData('demographics', { ...clinicalData.demographics, age: a })}
                                className={`p-2.5 rounded-lg text-[11px] font-bold border transition-colors ${clinicalData.demographics.age === a ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>{a}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="text-[12px] font-bold text-slate-700 dark:text-slate-300 block mb-2">الجنس البيولوجي:</label>
                    <div className="flex gap-2">
                        {['ذكر', 'أنثى'].map(g => (
                            <button key={g} onClick={() => updateData('demographics', { ...clinicalData.demographics, gender: g })}
                                className={`flex-1 p-2.5 rounded-lg text-[11px] font-bold border transition-colors ${clinicalData.demographics.gender === g ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>{g}</button>
                        ))}
                    </div>
                </div>
                {clinicalData.demographics.gender === 'أنثى' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                        <div className="bg-rose-50 dark:bg-rose-900/20 p-3 rounded-lg border border-rose-100 dark:border-rose-900/50 mt-2">
                            <label className="text-[12px] font-bold text-rose-700 block mb-2">هل يوجد احتمالية حمل بالوقت الحالي؟</label>
                            <div className="flex gap-2">
                                {[{ v: 'pregnant', l: 'نعم محتمل' }, { v: 'none', l: 'لا غير محتمل' }].map(({ v, l }) => (
                                    <button key={v} onClick={() => updateData('demographics', { ...clinicalData.demographics, pregnancy: v })}
                                        className={`flex-1 p-2 rounded-lg text-[11px] font-bold border transition-colors ${clinicalData.demographics.pregnancy === v ? (v === 'pregnant' ? 'bg-rose-500 text-white border-rose-500 shadow-sm' : 'bg-slate-700 text-white border-slate-700 shadow-sm') : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>{l}</button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
            <button disabled={!clinicalData.demographics.age || !clinicalData.demographics.gender || (clinicalData.demographics.gender === 'أنثى' && !clinicalData.demographics.pregnancy)}
                onClick={() => { haptic.selection(); setStep('chief_complaint'); }}
                className="w-full py-3.5 mt-6 rounded-xl bg-indigo-600 text-white font-bold text-[13px] disabled:opacity-40 shadow-sm flex-shrink-0">
                متابعة للأعراض
            </button>
        </motion.div>
    );
}

/* ── Chief Complaint ──────────────────────────────── */
export function ChiefComplaintStep({
    clinicalData, updateData, handleNavigateBack,
    handleCCSelection, proceedFromChiefComplaint,
}: StepProps & { handleCCSelection: (id: string) => void; proceedFromChiefComplaint: () => void }) {
    return (
        <motion.div key="cc" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="text-[15px] font-extrabold text-slate-800 dark:text-white mb-1">حدد الأعراض الحالية</h4>
                    <p className="text-[11px] text-slate-500">اختر تصنيفاً أو أكثر لشكواك اليوم</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <button onClick={handleNavigateBack} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                    <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-md">{clinicalData.chiefComplaintCategories.length} محدد</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-5 max-h-[160px] overflow-y-auto custom-scrollbar pb-1">
                {Object.values(clinicalPathways).map(cat => {
                    const isSelected = clinicalData.chiefComplaintCategories.includes(cat.id);
                    const IconComponent = IconMap[cat.iconName] || require('lucide-react').Activity;
                    return (
                        <button key={cat.id} onClick={() => handleCCSelection(cat.id)}
                            className={`p-2.5 rounded-xl border flex items-center justify-start gap-3 transition-all ${isSelected ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}>
                            <IconComponent className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <span className={`text-[11px] font-bold text-right leading-tight ${isSelected ? 'text-indigo-700' : 'text-slate-600 dark:text-slate-300'}`}>{cat.label}</span>
                        </button>
                    );
                })}
            </div>
            <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />أو يمكنك كتابة التفاصيل مباشرة وسنقوم بتصنيفها وتحليلها:
                </label>
                <textarea rows={2} placeholder="مثال: أحس بالم شديد في أسفل البطن جهة اليمين ومعاه غثيان وحرارة..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-100 transition-all custom-scrollbar"
                    value={clinicalData.openNarrative} onChange={(e) => updateData('openNarrative', e.target.value)} />
                <button disabled={clinicalData.chiefComplaintCategories.length === 0 && clinicalData.openNarrative.length < 5}
                    onClick={proceedFromChiefComplaint}
                    className="w-full py-3.5 mt-3 rounded-xl bg-indigo-600 text-white font-bold text-[13px] disabled:opacity-40 flex items-center justify-center gap-2 transition-opacity">
                    التالي <ArrowLeft className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}

/* ── Primary Selection ────────────────────────────── */
export function PrimarySelectionStep({ clinicalData, updateData, setStep, handleNavigateBack }: StepProps) {
    return (
        <motion.div key="primary_sel" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full text-center py-2 relative">
            <button onClick={handleNavigateBack} className="absolute top-0 right-0 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ChevronRight className="w-5 h-5" /></button>
            <div className="w-14 h-14 mx-auto bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 mt-2"><ListChecks className="w-7 h-7" /></div>
            <h4 className="text-[16px] font-extrabold text-slate-800 dark:text-white mb-2">ما هو العرض الأكثر إزعاجاً؟</h4>
            <p className="text-[12px] text-slate-600 dark:text-slate-400 mb-5 leading-relaxed">
                لقد قمت باختيار أعراض متعددة. لترتيب أولويات التقييم بشكل طبي سليم، الرجاء تحديد العرض الأقوى (الشكوى الرئيسية Primary Complaint):
            </p>
            <div className="space-y-2 mt-auto text-right">
                {clinicalData.chiefComplaintCategories.map(cat => (
                    <button key={cat} onClick={() => { haptic.selection(); updateData('primaryComplaintId', cat); }}
                        className={`w-full p-4 rounded-xl border-2 transition-all flex justify-between items-center ${clinicalData.primaryComplaintId === cat ? 'bg-indigo-50 border-indigo-600 text-indigo-700' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
                        <span className="font-bold text-[13px]">{clinicalPathways[cat]?.label}</span>
                        {clinicalData.primaryComplaintId === cat && <div className="w-3 h-3 rounded-full bg-indigo-600 shadow-sm" />}
                    </button>
                ))}
                <button disabled={!clinicalData.primaryComplaintId} onClick={() => { haptic.selection(); setStep('red_flags'); }}
                    className="w-full py-3.5 mt-4 rounded-xl bg-slate-900 text-white font-bold text-[13px] disabled:opacity-50">
                    تأكيد ومتابعة التقييم
                </button>
            </div>
        </motion.div>
    );
}

/* ── Routing Validation ───────────────────────────── */
export function RoutingValidationStep({
    clinicalData, handleNavigateBack, handleRoutingDecision,
}: StepProps & { handleRoutingDecision: (d: 'switch' | 'add' | 'ignore') => void }) {
    return (
        <motion.div key="routing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col h-full text-center py-2 relative">
            <button onClick={handleNavigateBack} className="absolute top-0 right-0 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ChevronRight className="w-5 h-5" /></button>
            <div className="w-14 h-14 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4 ring-4 ring-amber-50 mt-2"><Brain className="w-7 h-7" /></div>
            <h4 className="text-[16px] font-extrabold text-slate-800 dark:text-white mb-2">تحليل النص والأعراض</h4>
            <p className="text-[12px] text-slate-600 dark:text-slate-400 mb-5 leading-relaxed px-2">
                لقد اخترت مساراً معيناً، لكن وصفك النصي يوحي بوجود أعراض بارزة تخص: <br />
                <strong className="text-indigo-600 text-[13px] inline-block mt-2">
                    {clinicalData.suggestedCategories.map(c => clinicalPathways[c]?.label).join('، ')}
                </strong>
            </p>
            <div className="space-y-3 mt-auto flex flex-col items-center">
                <p className="text-[11px] font-bold text-slate-400 mb-1">اختر الإجراء الأنسب لحالتك:</p>
                <button onClick={() => handleRoutingDecision('switch')} className="w-full p-3 rounded-xl bg-indigo-600 text-white font-bold text-[12px] text-right">
                    تغيير شكواي الرئيسية لتصبح ({clinicalPathways[clinicalData.suggestedCategories[0]]?.label})
                </button>
                <button onClick={() => handleRoutingDecision('add')} className="w-full p-3 rounded-xl border-2 border-indigo-200 text-indigo-700 bg-indigo-50 font-bold text-[12px] text-right">
                    إبقاء اختياري وإضافة هذه الأعراض كشكوى ثانوية
                </button>
                <button onClick={() => handleRoutingDecision('ignore')} className="w-full p-3 rounded-xl border border-slate-200 text-slate-500 font-bold text-[12px] text-center">
                    تجاهل الاقتراح، وتكملة التقييم باختياري فقط
                </button>
            </div>
        </motion.div>
    );
}
