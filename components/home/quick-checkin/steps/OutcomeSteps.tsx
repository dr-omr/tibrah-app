// components/home/quick-checkin/steps/OutcomeSteps.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Outcome Steps: Review, Analyzing, Complete
// ════════════════════════════════════════════════════════════════════

import React from 'react';
import { motion } from 'framer-motion';
import {
    Activity, AlertTriangle, Brain, Edit3, FileText, HeartPulse,
    MessageCircle, PhoneCall, RefreshCw, ShieldAlert, Sparkles,
    Stethoscope, UserCog, Wind,
} from 'lucide-react';
import Link from 'next/link';
import { clinicalPathways } from '@/lib/clinicalPathways';
import { getRelevantProducts, getComplaintSuggestionMeta } from '@/lib/triageProductMap';
import { localProducts } from '@/lib/products';
import { type ClinicalData, type IntakeStep, Confetti, getEmotionalPrompt } from '../checkin-types';

interface StepProps {
    clinicalData: ClinicalData;
    setStep: (step: IntakeStep) => void;
}

/* ── Review ───────────────────────────────────────── */
export function ReviewStep({
    clinicalData, setStep,
    updateData, performAnalysis,
}: StepProps & {
    updateData: (key: keyof ClinicalData, value: any) => void;
    performAnalysis: (data: any) => void;
}) {
    return (
        <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h4 className="text-[15px] font-extrabold text-slate-800 dark:text-white mb-1">مراجعة التقييم 📝</h4>
                    <p className="text-[11px] text-slate-500">التقرير النهائي جاهز، راجع بياناتك</p>
                </div>
                <button onClick={() => setStep('welcome')} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
                {/* Demographics */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 relative group">
                    <button onClick={() => setStep('demographics')} className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-700 p-1.5 rounded-md shadow-sm border border-slate-200 dark:border-slate-600 text-indigo-600"><Edit3 className="w-3.5 h-3.5" /></button>
                    <h5 className="text-[11px] font-bold text-indigo-600 mb-2 flex items-center gap-1.5"><UserCog className="w-3.5 h-3.5" /> بيانات ديموغرافية</h5>
                    <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">
                        {clinicalData.demographics.age} • {clinicalData.demographics.gender} {clinicalData.demographics.pregnancy === 'pregnant' ? '• (محتمل حمل)' : ''}
                    </p>
                </div>
                {/* Chief Complaint */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 relative group">
                    <button onClick={() => setStep('chief_complaint')} className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-700 p-1.5 rounded-md shadow-sm border border-slate-200 dark:border-slate-600 text-indigo-600"><Edit3 className="w-3.5 h-3.5" /></button>
                    <h5 className="text-[11px] font-bold text-indigo-600 mb-2 flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> الشكوى الرئيسية</h5>
                    <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{clinicalPathways[clinicalData.primaryComplaintId || '']?.label || 'غير محدد'}</p>
                    {clinicalData.openNarrative && <p className="text-[11px] text-slate-500 mt-1">"{clinicalData.openNarrative}"</p>}
                </div>
                {/* SOCRATES */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 relative group">
                    <button onClick={() => setStep('socrates')} className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-700 p-1.5 rounded-md shadow-sm border border-slate-200 dark:border-slate-600 text-indigo-600"><Edit3 className="w-3.5 h-3.5" /></button>
                    <h5 className="text-[11px] font-bold text-indigo-600 mb-2 flex items-center gap-1.5"><HeartPulse className="w-3.5 h-3.5" /> حدة الأعراض والألم</h5>
                    <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{clinicalData.socratesAnswers.severity || 5} / 10</p>
                </div>
                {/* PMH */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 relative group">
                    <button onClick={() => setStep('pmh')} className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-700 p-1.5 rounded-md shadow-sm border border-slate-200 dark:border-slate-600 text-indigo-600"><Edit3 className="w-3.5 h-3.5" /></button>
                    <h5 className="text-[11px] font-bold text-indigo-600 mb-2 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> التاريخ والأدوية</h5>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1"><span className="font-bold">مزمنة:</span> {clinicalData.pastMedicalHistory.length > 0 && clinicalData.pastMedicalHistory[0] ? clinicalData.pastMedicalHistory.join('، ') : 'لا يوجد'}</p>
                    <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400"><span className="font-bold">أدوية:</span> {clinicalData.currentMeds || 'لا يوجد'}</p>
                </div>
                {/* Notes */}
                <div className="mt-2">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">ملاحظات حرة إضافية للطبيب (اختياري)</label>
                    <textarea placeholder="كتابة أي شيء تود إضافته للطبيب هنا..." rows={2}
                        value={clinicalData.additionalNotes} onChange={(e) => updateData('additionalNotes', e.target.value)}
                        className="w-full bg-white dark:bg-slate-800 border-[1.5px] border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:border-indigo-500 outline-none transition-colors" />
                </div>
            </div>
            <div className="flex gap-2 mt-auto pt-2">
                <button onClick={() => { setStep('analyzing'); performAnalysis(clinicalData); }}
                    className={`w-full py-4 rounded-xl text-white shadow-lg font-bold text-[14px] flex items-center justify-center gap-2 relative overflow-hidden group ${clinicalData.highestTriageLevel === 'emergency' ? 'bg-rose-600' : clinicalData.highestTriageLevel === 'urgent_sameday' ? 'bg-orange-500' : 'bg-gradient-to-r from-teal-500 to-indigo-600'}`}>
                    {clinicalData.highestTriageLevel === 'emergency' || clinicalData.highestTriageLevel === 'urgent_sameday' ? <AlertTriangle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                    إصدار التقرير النهائي
                </button>
            </div>
        </motion.div>
    );
}

/* ── Analyzing ────────────────────────────────────── */
export function AnalyzingStep({ clinicalData }: { clinicalData: ClinicalData }) {
    return (
        <motion.div key="analyzing" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-8 h-full space-y-4">
            <div className="relative">
                <div className={`w-16 h-16 rounded-full border-4 ${clinicalData.hasUrgentRedFlag ? 'border-rose-100' : 'border-slate-100 dark:border-slate-800'}`} />
                <div className={`w-16 h-16 rounded-full border-4 ${clinicalData.hasUrgentRedFlag ? 'border-rose-500' : 'border-indigo-600'} border-t-transparent animate-spin absolute inset-0`} />
                <Brain className={`w-6 h-6 ${clinicalData.hasUrgentRedFlag ? 'text-rose-500' : 'text-indigo-600'} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse`} />
            </div>
            <div className="text-center space-y-1 mt-2">
                <h4 className={`text-[15px] font-black ${clinicalData.hasUrgentRedFlag ? 'text-rose-600' : 'text-slate-800 dark:text-white'}`}>جاري التوليف السريري الشامل...</h4>
                <p className="text-[11px] text-slate-500">يقوم النظام بترتيب معطياتك المتعددة كتقييم موحد</p>
            </div>
        </motion.div>
    );
}

/* ── Complete ─────────────────────────────────────── */
export function CompleteStep({
    clinicalData, setStep, showConfetti, aiResult,
    handleExport, activeQuestionsLength, activeRedFlagsLength,
}: StepProps & {
    showConfetti: boolean;
    aiResult: any;
    handleExport: (target: 'doctor' | 'patient' | 'whatsapp') => void;
    activeQuestionsLength: number;
    activeRedFlagsLength: number;
}) {
    const level = clinicalData.highestTriageLevel;
    const isEmergency = level === 'emergency';
    const isUrgent = level === 'urgent_sameday';
    const isNearReview = level === 'near_review';
    const isRoutine = level === 'routine';
    const complaintId = clinicalData.primaryComplaintId || 'other';
    const suggestionMeta = getComplaintSuggestionMeta(complaintId);
    const suggestedProducts = getRelevantProducts(complaintId, localProducts);
    const analysisCount = Object.keys(clinicalData.hpiAnswers).length + activeRedFlagsLength + 4; // SOCRATES questions count

    return (
        <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col h-full">
            {!clinicalData.hasUrgentRedFlag && <Confetti show={showConfetti} />}

            {/* Status Header */}
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${isEmergency ? 'bg-rose-100 text-rose-600' : isUrgent ? 'bg-orange-100 text-orange-600' : isNearReview ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {isEmergency || isUrgent ? <ShieldAlert className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                </div>
                <div>
                    <h4 className="text-[15px] font-black text-slate-800 dark:text-white leading-tight">
                        {isEmergency ? 'حالة طوارئ — تصرف فوراً' : isUrgent ? 'حالة عاجلة — راجع طبيبك اليوم' : isNearReview ? 'التقرير جاهز — ننصحك بمراجعة الطبيب قريباً' : 'التقرير جاهز — حالتك مطمئنة'}
                    </h4>
                    <p className={`text-[11px] font-bold ${isEmergency ? 'text-rose-500' : isUrgent ? 'text-orange-500' : isNearReview ? 'text-amber-500' : 'text-emerald-500'}`}>
                        {isEmergency ? '🔴 طوارئ قصوى — الرجاء التوجه فوراً' : isUrgent ? `🟠 ${clinicalData.redFlagsTriggered.length} علامة خطر مؤكدة` : isNearReview ? '🟡 يُفضل المتابعة الطبية' : '🟢 لم يُرصد خطر فوري'}
                    </p>
                </div>
            </div>

            {/* Trust Badge */}
            <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg px-3 py-2 mb-4 border border-indigo-100 dark:border-indigo-800">
                <Brain className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                <p className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                    تم تحليل {analysisCount} نقطة سريرية وتصنيف حالتك بدقة عبر النظام الذكي
                </p>
            </div>

            {/* AI Insight */}
            {aiResult && !isEmergency && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-4">
                    <div>
                        <h5 className="text-[13px] font-black text-indigo-800 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
                            <Stethoscope className="w-4 h-4 text-indigo-600" /> التحليل السريري للذكاء الاصطناعي
                        </h5>
                        <p className="text-[11.5px] text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">{aiResult.clinical_insight}</p>
                    </div>
                    <div className="h-px w-full bg-slate-100 dark:bg-slate-800/80" />
                    <div>
                        <h5 className="text-[13px] font-black text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                            <Wind className="w-4 h-4 text-emerald-600" /> التشخيص الشعوري المدمج
                        </h5>
                        <p className="text-[11.5px] text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">{aiResult.emotional_insight}</p>
                    </div>
                    {aiResult.holistic_advice?.length > 0 && (
                        <>
                            <div className="h-px w-full bg-slate-100 dark:bg-slate-800/80" />
                            <div className="flex gap-2 items-start mt-2">
                                <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{aiResult.holistic_advice[0]}</p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Smart Routing */}
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-1 pb-2">
                {isEmergency && (
                    <div className="bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-300 rounded-xl p-4 space-y-3">
                        <p className="text-[12px] font-bold text-rose-700 dark:text-rose-300 leading-relaxed text-center">
                            بناءً على {clinicalData.redFlagsTriggered.length} علامة خطر تم تأكيدها، هذه الحالة تتطلب تدخلاً طبياً فورياً.
                        </p>
                        <a href="tel:997" className="w-full py-3 bg-rose-600 text-white rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30">
                            <PhoneCall className="w-5 h-5" /> الاتصال بالإسعاف (997)
                        </a>
                        <button onClick={() => handleExport('whatsapp')} className="w-full py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-[12px] flex justify-center items-center gap-2">
                            <MessageCircle className="w-4 h-4" /> إرسال التقرير لطبيبك عبر واتساب
                        </button>
                    </div>
                )}
                {isUrgent && (
                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 rounded-xl p-4 space-y-3">
                        <p className="text-[12px] font-bold text-orange-700 dark:text-orange-300 leading-relaxed text-center">
                            ننصح بمراجعة الطبيب اليوم. سيصل الطبيب تقريرك المفصل مسبقاً لتوفير وقتك.
                        </p>
                        <Link href={`/book-appointment?triage=urgent&complaint=${complaintId}`}>
                            <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25">
                                <Stethoscope className="w-5 h-5" /> احجز استشارة عاجلة الآن
                            </button>
                        </Link>
                        <button onClick={() => handleExport('whatsapp')} className="w-full py-2.5 rounded-xl bg-[#25D366] text-white font-bold text-[12px] flex justify-center items-center gap-2">
                            <MessageCircle className="w-4 h-4" /> إرسال التقرير عبر واتساب
                        </button>
                    </div>
                )}
                {(isRoutine || isNearReview) && (
                    <>
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                            <p className="text-[12px] text-slate-600 dark:text-slate-400 font-bold leading-relaxed text-center">
                                {isNearReview ? 'أعراضك تستدعي مراجعة الطبيب قريباً. أرسل التقرير واحجز موعداً مناسباً.' : 'رائع! لا توجد مؤشرات خطر واضحة. يمكنك مشاركة التقرير مع طبيبك للاطمئنان.'}
                            </p>
                            <button onClick={() => handleExport('whatsapp')} className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-[14px] flex justify-center items-center gap-2 shadow-lg shadow-[#25D366]/30 transition-all">
                                <MessageCircle className="w-5 h-5" /> إرسال التقرير للطبيب (WhatsApp)
                            </button>
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={() => handleExport('doctor')} className="py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex flex-col justify-center items-center gap-1.5 transition-all">
                                    <Activity className="w-4 h-4" /> نسخ SOAP
                                </button>
                                <button onClick={() => handleExport('patient')} className="py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex flex-col justify-center items-center gap-1.5 transition-all">
                                    <UserCog className="w-4 h-4" /> ملخص مبسط
                                </button>
                            </div>
                        </div>
                        {isNearReview && (
                            <Link href={`/book-appointment?complaint=${complaintId}`}>
                                <button className="w-full py-3 rounded-xl border-2 border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 font-bold text-[13px] flex items-center justify-center gap-2">
                                    <Stethoscope className="w-4 h-4" /> احجز موعد متابعة
                                </button>
                            </Link>
                        )}
                        {suggestedProducts.length > 0 && (
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-800">
                                <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5" /> {suggestionMeta.emoji} {suggestionMeta.label}
                                </p>
                                <div className="space-y-2">
                                    {suggestedProducts.map((p: any) => (
                                        <Link key={p.id} href={`/shop?product=${p.id}`}>
                                            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 rounded-lg p-2.5 border border-emerald-100 dark:border-emerald-800/50 hover:border-emerald-300 transition-colors">
                                                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                                                    {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-contain rounded-lg" /> : '💊'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[11px] font-bold text-slate-800 dark:text-white truncate">{p.name}</p>
                                                    <p className="text-[10px] font-bold text-emerald-600">{p.price} ر.س</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <button onClick={() => setStep('welcome')} className="w-full py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-[13px] mt-auto">
                العودة للرئيسية وإغلاق
            </button>
        </motion.div>
    );
}
