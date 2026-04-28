// components/home/quick-checkin/steps/ClinicalSteps.tsx
// ════════════════════════════════════════════════════════════════════
// TIBRAH — Clinical Assessment Steps: RedFlags, HPI Dynamic, SOCRATES,
// PMH, Emotional
// ════════════════════════════════════════════════════════════════════

import React from 'react';
import { motion } from 'framer-motion';
import {
    AlertTriangle, Brain, ChevronLeft, ChevronRight,
    FileText,
} from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { socratesQuestions } from '@/lib/clinicalPathways';
import { type ClinicalData, type IntakeStep, TRIAGE_PRIORITY, NONE_OPTION, getEmotionalPrompt } from '../checkin-types';

interface StepProps {
    clinicalData: ClinicalData;
    updateData: (key: keyof ClinicalData, value: any) => void;
    setClinicalData: React.Dispatch<React.SetStateAction<ClinicalData>>;
    setStep: (step: IntakeStep) => void;
    handleNavigateBack: () => void;
}

/* ── Red Flags ────────────────────────────────────── */
export function RedFlagsStep({
    clinicalData, handleNavigateBack,
    activeRedFlags, currentRedFlagIndex, setCurrentRedFlagIndex,
    handleRedFlagAnswer,
}: StepProps & {
    activeRedFlags: any[];
    currentRedFlagIndex: number;
    setCurrentRedFlagIndex: (fn: (p: number) => number) => void;
    handleRedFlagAnswer: (rf: any, isYes: boolean) => void;
}) {
    if (activeRedFlags.length === 0 || !activeRedFlags[currentRedFlagIndex]) return null;
    return (
        <motion.div key="rf" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-500 animate-pulse" />
                    <h4 className="text-[15px] font-extrabold text-slate-800 dark:text-white">أسئلة أمان حيوية (Triage)</h4>
                </div>
                <button onClick={() => { if (currentRedFlagIndex > 0) setCurrentRedFlagIndex(p => p - 1); else handleNavigateBack(); }}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <p className="text-[11px] text-slate-500 mb-4 bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700">
                للحرص على سلامتك واستبعاد الخطورة وتوجيهك فوراً إذا لزم، يرجى الإجابة بالنفي أو التأكيد:
            </p>
            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-900/50 mb-auto mt-2">
                <p className="text-[14px] font-bold text-slate-800 dark:text-slate-200 leading-relaxed mb-6 text-center">
                    "{activeRedFlags[currentRedFlagIndex].text}"
                </p>
                <div className="flex gap-3">
                    <button onClick={() => handleRedFlagAnswer(activeRedFlags[currentRedFlagIndex], true)}
                        className="flex-1 py-3 text-[13px] font-bold text-white bg-rose-500 hover:bg-rose-600 rounded-xl shadow-lg shadow-rose-500/30 transition-colors">نعم (يوجد)</button>
                    <button onClick={() => handleRedFlagAnswer(activeRedFlags[currentRedFlagIndex], false)}
                        className="flex-1 py-3 text-[13px] font-bold text-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl transition-colors">لا (سليم)</button>
                </div>
            </div>
            <div className="mt-4 flex justify-center gap-1.5 opacity-60">
                {activeRedFlags.map((_: any, i: number) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentRedFlagIndex ? 'w-5 bg-rose-500' : i < currentRedFlagIndex ? 'w-1.5 bg-rose-300' : 'w-1.5 bg-slate-200'}`} />
                ))}
            </div>
        </motion.div>
    );
}

/* ── HPI Dynamic ──────────────────────────────────── */
export function HPIDynamicStep({
    clinicalData, updateData, setStep, handleNavigateBack,
    activeQuestions, currentDynamicQIndex, setCurrentDynamicQIndex,
    toggleHpiMulti,
}: StepProps & {
    activeQuestions: any[];
    currentDynamicQIndex: number;
    setCurrentDynamicQIndex: (fn: (p: number) => number) => void;
    toggleHpiMulti: (qId: string, opt: string) => void;
}) {
    const q = activeQuestions[currentDynamicQIndex];
    if (!q) return null;

    return (
        <motion.div key="hpi_dyn" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-[14px] font-extrabold text-indigo-700 flex items-center gap-2"><Brain className="w-4 h-4" /> تفاصيل الأعراض</h4>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">{currentDynamicQIndex + 1} / {activeQuestions.length}</span>
                    <button onClick={() => { if (currentDynamicQIndex > 0) setCurrentDynamicQIndex(p => p - 1); else handleNavigateBack(); }}
                        className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ChevronRight className="w-5 h-5" /></button>
                </div>
            </div>
            <div className="mb-6 flex-1">
                <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 mb-4 leading-relaxed">{q.text}</p>
                {q.type === 'single' && (
                    <div className="space-y-2 max-h-[170px] overflow-y-auto custom-scrollbar pr-1">
                        {q.options?.map((opt: string) => (
                            <button key={opt} onClick={() => { updateData('hpiAnswers', { ...clinicalData.hpiAnswers, [q.id]: opt }); haptic.selection(); }}
                                className={`w-full p-3 rounded-xl border text-right transition-all text-[12px] font-bold ${clinicalData.hpiAnswers[q.id] === opt ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}>
                                {opt}
                            </button>
                        ))}
                    </div>
                )}
                {q.type === 'multiple' && (
                    <div className="space-y-2 max-h-[170px] overflow-y-auto custom-scrollbar pr-1">
                        {[...(q.options || []), NONE_OPTION].map((opt: string) => {
                            const isSelected = (clinicalData.hpiAnswers[q.id] || []).includes(opt);
                            const isNone = opt === NONE_OPTION;
                            return (
                                <button key={opt} onClick={() => toggleHpiMulti(q.id, opt)}
                                    className={`w-full p-3 rounded-xl border flex justify-between items-center transition-all text-[12px] font-bold ${isSelected ? (isNone ? 'bg-slate-700 text-white border-slate-700' : 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm') : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}>
                                    {opt}
                                    <div className={`w-4 h-4 rounded-sm border ${isSelected ? (isNone ? 'bg-slate-700 border-slate-700' : 'bg-indigo-600 border-indigo-600') : 'border-slate-300 dark:border-slate-600'} flex items-center justify-center`}>
                                        {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
            <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => { if (currentDynamicQIndex > 0) setCurrentDynamicQIndex(p => p - 1); else handleNavigateBack(); }}
                    className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors">
                    <ChevronRight className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <button onClick={() => { haptic.selection(); if (currentDynamicQIndex < activeQuestions.length - 1) setCurrentDynamicQIndex(p => p + 1); else setStep('socrates'); }}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-[13px] flex justify-center items-center gap-2">
                    التالي <ChevronLeft className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}

/* ── SOCRATES ─────────────────────────────────────── */
export function SocratesStep({ clinicalData, updateData, setClinicalData, setStep, handleNavigateBack }: StepProps) {
    return (
        <motion.div key="soc" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-[15px] font-extrabold text-slate-800 dark:text-white">التاريخ والشدة العامة</h4>
                <button onClick={handleNavigateBack} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 mb-6">
                <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">{socratesQuestions[0].text}</label>
                    <div className="flex flex-wrap gap-2">
                        {socratesQuestions[0].options?.map(opt => (
                            <button key={opt} onClick={() => updateData('socratesAnswers', { ...clinicalData.socratesAnswers, onset: opt })}
                                className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-colors ${clinicalData.socratesAnswers.onset === opt ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}>{opt}</button>
                        ))}
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">تقييم شدة الإزعاج أو الألم (10 الأسوأ)</label>
                        <span className="text-[12px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shadow-sm">{clinicalData.socratesAnswers.severity || 5} / 10</span>
                    </div>
                    <input type="range" min="1" max="10" value={clinicalData.socratesAnswers.severity || 5}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setClinicalData(prev => {
                                const escalating = val >= 9;
                                const currentObjLevel = TRIAGE_PRIORITY[prev.highestTriageLevel as keyof typeof TRIAGE_PRIORITY] || 1;
                                const finalLevel = escalating && TRIAGE_PRIORITY.urgent_sameday > currentObjLevel ? 'urgent_sameday' : prev.highestTriageLevel;
                                return { ...prev, socratesAnswers: { ...prev.socratesAnswers, severity: val }, highestTriageLevel: finalLevel };
                            });
                        }}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-1" />
                </div>
                {!clinicalData.hasUrgentRedFlag && (
                    <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">مسار وتطور الشكوى مع الوقت</label>
                        <div className="grid grid-cols-2 gap-2">
                            {socratesQuestions[3].options?.map(opt => (
                                <button key={opt} onClick={() => updateData('socratesAnswers', { ...clinicalData.socratesAnswers, pattern: opt })}
                                    className={`px-2 py-2 text-[10px] font-bold rounded-lg text-center border transition-colors ${clinicalData.socratesAnswers.pattern === opt ? 'bg-indigo-50 border-indigo-400 text-indigo-700' : 'bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}`}>{opt}</button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <button onClick={() => { haptic.selection(); setStep('pmh'); }}
                className="w-full py-3 mt-auto rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[13px] shadow-lg">
                التالي: التاريخ الطبي
            </button>
        </motion.div>
    );
}

/* ── PMH (Past Medical History) ───────────────────── */
export function PMHStep({ clinicalData, updateData, setStep, handleNavigateBack }: StepProps) {
    return (
        <motion.div key="pmh" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-[15px] font-extrabold text-slate-800 dark:text-white">تاريخ طبي سريع (مهم للطبيب)</h4>
                <button onClick={handleNavigateBack} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 mb-6 flex-1 overflow-y-auto custom-scrollbar pr-1">
                <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">أمراض مزمنة أو عمليات جراحية</label>
                    <textarea placeholder="سكري، ضغط، ربو، عملية زائدة، الخ..." rows={2}
                        value={clinicalData.pastMedicalHistory.join(', ')}
                        onChange={(e) => updateData('pastMedicalHistory', e.target.value.split(',').map(s => s.trim()))}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">الأدوية الحالية المؤثرة</label>
                    <textarea placeholder="اكتب الأدوية أو المكملات التي تتناولها بانتظام..." rows={1}
                        value={clinicalData.currentMeds} onChange={(e) => updateData('currentMeds', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">حساسية من أدوية أو أشياء أخرى</label>
                    <textarea placeholder="حساسية بنسيلين، أسبرين، غذاء، الخ... (أو اترك فارغاً)" rows={1}
                        value={clinicalData.allergies} onChange={(e) => updateData('allergies', e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
            </div>
            <button onClick={() => setStep('emotional')}
                className="w-full py-3 mt-auto rounded-xl bg-slate-800 text-white font-bold text-[13px] shadow-lg flex justify-center items-center gap-2">
                التالي: التقييم الشعوري <Brain className="w-4 h-4" />
            </button>
        </motion.div>
    );
}

/* ── Emotional State ──────────────────────────────── */
export function EmotionalStep({ clinicalData, updateData, setStep, handleNavigateBack }: StepProps) {
    return (
        <motion.div key="emotional" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-[15px] font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-indigo-500" /> البعد التشخيصي النفس-جسدي
                </h4>
                <button onClick={handleNavigateBack} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><ChevronRight className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 mb-6 flex-1 overflow-y-auto custom-scrollbar pr-1">
                <div className="bg-indigo-50/50 dark:bg-indigo-900/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                    <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-bold leading-relaxed mb-3">
                        جزء أساسي من نموذجنا السريري هو <span className="font-bold text-slate-800">التشخيص الشعوري</span> لتحديد <span className="font-bold text-slate-800">النمط التشخيصي الشعوري</span> الموازي للأعراض.
                    </p>
                    <div className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-indigo-200 dark:border-indigo-700/50">
                        <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
                            <span className="text-indigo-600 font-bold block mb-1">الارتباط التشخيصي المحتمل للاستجابة الجسدية المحددة:</span>
                            {getEmotionalPrompt(clinicalData.primaryComplaintId)}
                        </p>
                    </div>
                </div>
                <div>
                    <div className="flex justify-between items-end mb-2">
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400">مستوى الضغط والتوتر الحالي (10 الأعلى)</label>
                        <span className="text-[12px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shadow-sm">{clinicalData.emotionalState.stress} / 10</span>
                    </div>
                    <input type="range" min="1" max="10" value={clinicalData.emotionalState.stress}
                        onChange={(e) => updateData('emotionalState', { ...clinicalData.emotionalState, stress: parseInt(e.target.value) })}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 mt-1" />
                </div>
                <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">حالة جودة النوم ومشاكله</label>
                    <select value={clinicalData.emotionalState.sleep}
                        onChange={(e) => updateData('emotionalState', { ...clinicalData.emotionalState, sleep: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none">
                        <option value="">اختر حالة النوم...</option>
                        <option value="good">نوم عميق ومريح</option>
                        <option value="tired_morning">صعوبة استيقاظ وخمول (تفكير زائد)</option>
                        <option value="insomnia">أرق وصعوبة في الدخول بالنوم</option>
                        <option value="interrupted">استيقاظ متكرر في منتصف الليل</option>
                    </select>
                </div>
                <div>
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">هل تلاحظ عوامل شعورية أخرى أو محفزات توتر مؤخراً؟ (اختياري)</label>
                    <textarea placeholder="اكتب باختصار لربط الجانب الجسدي بالشعوري للطبيب..." rows={2}
                        value={clinicalData.emotionalState.details}
                        onChange={(e) => updateData('emotionalState', { ...clinicalData.emotionalState, details: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <input type="checkbox" id="repeatedPattern" checked={clinicalData.emotionalState.repeated_pattern_flag}
                        onChange={(e) => updateData('emotionalState', { ...clinicalData.emotionalState, repeated_pattern_flag: e.target.checked })}
                        className="w-5 h-5 accent-indigo-600 rounded cursor-pointer" />
                    <label htmlFor="repeatedPattern" className="text-[12px] font-bold text-slate-700 dark:text-slate-300 cursor-pointer flex-1">
                        علامة تكرار النمط: هل تلاحظ تكرار هذا العرض الجسدي دائماً مع نفس المشاعر أو المواقف؟
                    </label>
                </div>
            </div>
            <button onClick={() => setStep('review')}
                className="w-full py-3 mt-auto rounded-xl bg-slate-800 text-white font-bold text-[13px] shadow-lg flex justify-center items-center gap-2">
                المراجعة قبل التحليل <FileText className="w-4 h-4" />
            </button>
        </motion.div>
    );
}
