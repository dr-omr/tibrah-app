import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, HeartPulse, Wind, Thermometer, ChevronLeft,
  AlertTriangle, Phone, Sparkles, Check, ChevronRight, Info
} from 'lucide-react';
import {
  clinicalPathways, socratesQuestions, findSuggestedCategories, ClinicalPathway
} from '@/lib/clinicalPathways';
import { useRouter } from 'next/router';
import { haptic } from '@/lib/HapticFeedback';

const PATHWAY_ICONS: Record<string, React.ElementType> = {
  Brain,
  HeartPulse,
  Wind,
  Thermometer,
  Activity: HeartPulse, // fallback
  Zap: Sparkles,
  AlertCircle: AlertTriangle,
  ActivitySquare: HeartPulse,
};

type AnswerMap = Record<string, string | string[] | number>;

const steps = ['اختر الشكوى', 'علامات تحذيرية', 'استبيان SOCRATES', 'أسئلة إضافية', 'الملخص'];

export default function SymptomCheckerPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(0); // 0=select, 1=red-flags, 2=socrates, 3=pathway-questions, 4=summary
  const [freeText, setFreeText] = useState('');
  const [suggestedIds] = useState<string[]>([]);
  const [selectedPathway, setSelectedPathway] = useState<ClinicalPathway | null>(null);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [redFlagAnswers, setRedFlagAnswers] = useState<Record<string, boolean>>({});
  const [criticalRedFlag, setCriticalRedFlag] = useState<string | null>(null);

  const allPathways = Object.values(clinicalPathways);

  const handleSelectPathway = useCallback((pathway: ClinicalPathway) => {
    haptic.selection();
    setSelectedPathway(pathway);
    setAnswers({});
    setRedFlagAnswers({});
    setCriticalRedFlag(null);
    setStep(1);
  }, []);

  const handleRedFlagAnswer = (rfId: string, yes: boolean) => {
    haptic.selection();
    setRedFlagAnswers(prev => ({ ...prev, [rfId]: yes }));
    if (yes && selectedPathway) {
      const rf = selectedPathway.redFlags.find(r => r.id === rfId);
      if (rf && (rf.level === 'emergency' || rf.level === 'urgent_sameday')) {
        setCriticalRedFlag(rf.actionMessage);
      }
    }
  };

  const handleAnswer = useCallback((questionId: string, value: string | string[] | number) => {
    haptic.selection();
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const handleToggleMultiple = useCallback((questionId: string, option: string) => {
    haptic.selection();
    setAnswers(prev => {
      const current = (prev[questionId] as string[]) || [];
      if (current.includes(option)) return { ...prev, [questionId]: current.filter(o => o !== option) };
      return { ...prev, [questionId]: [...current, option] };
    });
  }, []);

  const renderProgressBar = () => (
    <div className="flex gap-1 px-5 py-3">
      {steps.map((s, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-teal-500' : 'bg-slate-200'}`}
        />
      ))}
    </div>
  );

  // ── STEP 0: Select Category ──
  const renderSelectStep = () => (
    <div className="px-5 space-y-3">
      {/* Free text */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <p className="text-xs font-bold text-slate-500 mb-2">صف شكواك باختصار (اختياري)</p>
        <textarea
          className="w-full text-sm text-slate-700 bg-slate-50 rounded-xl p-3 border border-slate-200 resize-none outline-none focus:border-teal-400 transition-colors"
          rows={2}
          placeholder="مثال: عندي صداع من الأمس ومستمر..."
          value={freeText}
          onChange={e => setFreeText(e.target.value)}
        />
        {freeText.length > 3 && (
          <p className="text-xs text-teal-600 mt-1 font-medium">
            الكلمات المرتبطة: {findSuggestedCategories(freeText).map(id => clinicalPathways[id]?.label).join('، ') || 'لم يُحدد'}
          </p>
        )}
      </div>

      <p className="text-xs font-black tracking-widest text-slate-400 uppercase text-center pt-1">
        أو اختر الفئة مباشرة
      </p>

      {allPathways.filter(p => p.id !== 'other').map(pathway => {
        const Icon = PATHWAY_ICONS[pathway.iconName] || Brain;
        return (
          <motion.button
            key={pathway.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSelectPathway(pathway)}
            className="w-full flex items-center gap-4 bg-white rounded-2xl border border-slate-200 p-4 text-right hover:border-teal-300 hover:shadow-md transition-all shadow-sm group"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors flex-shrink-0">
              <Icon className="w-6 h-6 text-teal-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-slate-800 text-sm">{pathway.label}</p>
              <p className="text-xs text-slate-500 mt-0.5 truncate">{pathway.description}</p>
            </div>
            <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors" />
          </motion.button>
        );
      })}

      {/* Other */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => handleSelectPathway(clinicalPathways.other)}
        className="w-full flex items-center gap-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-4 text-right hover:border-teal-300 transition-all"
      >
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-slate-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-slate-600 text-sm">أعراض أخرى</p>
          <p className="text-xs text-slate-400 mt-0.5">لم أجد ما يناسبني أعلاه</p>
        </div>
        <ChevronLeft className="w-4 h-4 text-slate-300" />
      </motion.button>
    </div>
  );

  // ── STEP 1: Red Flags ──
  const renderRedFlagsStep = () => {
    if (!selectedPathway) return null;

    if (criticalRedFlag) {
      return (
        <div className="px-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border-2 border-red-400 rounded-3xl p-6 text-center"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-black text-red-700 mb-2">تنبيه طبي عاجل</h3>
            <p className="text-sm text-red-600 leading-relaxed mb-5">{criticalRedFlag}</p>
            <a
              href="tel:997"
              className="inline-flex items-center gap-2 bg-red-500 text-white font-black px-6 py-3 rounded-2xl shadow-lg hover:bg-red-600 transition-colors"
            >
              <Phone className="w-5 h-5" />
              اتصل بالإسعاف 997
            </a>
            <button
              onClick={() => { setCriticalRedFlag(null); setStep(2); }}
              className="block mt-3 text-xs text-red-400 mx-auto hover:text-red-600"
            >
              استمر في الاستبيان على أي حال
            </button>
          </motion.div>
        </div>
      );
    }

    if (selectedPathway.redFlags.length === 0) {
      setStep(2);
      return null;
    }

    return (
      <div className="px-5 space-y-3">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">قبل المتابعة، أجب على العلامات التحذيرية الهامة</p>
        </div>

        {selectedPathway.redFlags.map(rf => (
          <div key={rf.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <p className="text-sm text-slate-700 font-medium mb-3">{rf.text}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleRedFlagAnswer(rf.id, true)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  redFlagAnswers[rf.id] === true
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-red-50'
                }`}
              >
                نعم
              </button>
              <button
                onClick={() => handleRedFlagAnswer(rf.id, false)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  redFlagAnswers[rf.id] === false
                    ? 'bg-teal-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-teal-50'
                }`}
              >
                لا
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={() => setStep(2)}
          disabled={selectedPathway.redFlags.length !== Object.keys(redFlagAnswers).length}
          className="w-full py-3.5 rounded-2xl bg-teal-600 text-white font-black text-sm disabled:opacity-40 shadow-lg shadow-teal-500/20"
        >
          التالي — أسئلة الأعراض
        </button>
      </div>
    );
  };

  // ── STEP 2: SOCRATES ──
  const renderSocratesStep = () => (
    <div className="px-5 space-y-4">
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex gap-3">
        <Info className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-500">هذه الأسئلة تساعد على فهم ديناميكية الشكوى بدقة</p>
      </div>

      {socratesQuestions.map(q => (
        <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
          <p className="text-sm font-bold text-slate-700">{q.text}</p>

          {q.type === 'scale' ? (
            <div className="space-y-1">
              <input
                type="range"
                min={1}
                max={10}
                value={(answers[q.id] as number) || 5}
                onChange={e => handleAnswer(q.id, parseInt(e.target.value))}
                className="w-full accent-teal-500"
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>1 (طفيف)</span>
                <span className="font-black text-teal-600 text-base">{(answers[q.id] as number) || 5}</span>
                <span>10 (شديد جداً)</span>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {q.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(q.id, opt)}
                  className={`w-full text-right px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3 ${
                    answers[q.id] === opt
                      ? 'bg-teal-50 border-2 border-teal-400 text-teal-700 font-bold'
                      : 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-teal-200'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${answers[q.id] === opt ? 'border-teal-500 bg-teal-500' : 'border-slate-300'}`}>
                    {answers[q.id] === opt && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      <button
        onClick={() => setStep(selectedPathway?.questions.length ? 3 : 4)}
        className="w-full py-3.5 rounded-2xl bg-teal-600 text-white font-black text-sm shadow-lg shadow-teal-500/20"
      >
        التالي
      </button>
    </div>
  );

  // ── STEP 3: Pathway Questions ──
  const renderPathwayQuestions = () => {
    if (!selectedPathway || !selectedPathway.questions.length) {
      setStep(4);
      return null;
    }

    return (
      <div className="px-5 space-y-4">
        {selectedPathway.questions.map(q => (
          <div key={q.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
            <p className="text-sm font-bold text-slate-700">{q.text}</p>
            <div className="space-y-2">
              {q.options?.map(opt => {
                const isMultiple = q.type === 'multiple';
                const currentMulti = (answers[q.id] as string[]) || [];
                const isSelected = isMultiple ? currentMulti.includes(opt) : answers[q.id] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => isMultiple ? handleToggleMultiple(q.id, opt) : handleAnswer(q.id, opt)}
                    className={`w-full text-right px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-3 ${
                      isSelected
                        ? 'bg-teal-50 border-2 border-teal-400 text-teal-700 font-bold'
                        : 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-teal-200'
                    }`}
                  >
                    <div className={`w-4 h-4 ${isMultiple ? 'rounded-md' : 'rounded-full'} border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-teal-500 bg-teal-500' : 'border-slate-300'}`}>
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                    </div>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        <button
          onClick={() => setStep(4)}
          className="w-full py-3.5 rounded-2xl bg-teal-600 text-white font-black text-sm shadow-lg shadow-teal-500/20"
        >
          عرض الملخص
        </button>
      </div>
    );
  };

  // ── STEP 4: Summary ──
  const renderSummary = () => {
    const severity = (answers['severity'] as number) || 5;
    const severityColor = severity >= 8 ? 'text-red-600' : severity >= 5 ? 'text-amber-600' : 'text-emerald-600';
    const severityLabel = severity >= 8 ? 'شديد — يستدعي اهتماماً عاجلاً' : severity >= 5 ? 'متوسط — يحتاج متابعة طبية' : 'خفيف — المراقبة كافية';

    return (
      <div className="px-5 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-3xl p-5 text-white"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-black text-lg">ملخص الاستبيان</p>
              <p className="text-white/70 text-xs">{selectedPathway?.label}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/80">شدة الأعراض</p>
            <p className={`font-black text-2xl text-white`}>{severity}/10</p>
          </div>
          <p className="text-xs text-white/60 mt-1">{severityLabel}</p>
        </motion.div>

        {/* Onset + Duration */}
        {answers['onset'] && (
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <p className="text-xs font-bold text-slate-400 mb-1">بداية الشكوى</p>
            <p className="text-sm text-slate-700">{answers['onset'] as string}</p>
          </div>
        )}

        {/* Red flags triggered */}
        {Object.entries(redFlagAnswers).filter(([, v]) => v).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <p className="text-sm font-bold text-red-600">علامات تحذيرية أجبت بـ «نعم» عليها</p>
            </div>
            {selectedPathway?.redFlags
              .filter(rf => redFlagAnswers[rf.id])
              .map(rf => (
                <p key={rf.id} className="text-xs text-red-500 mb-1">• {rf.actionMessage}</p>
              ))}
          </div>
        )}

        {/* Recommendation */}
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 text-center">
          <p className="text-sm font-bold text-teal-700 mb-2">
            {severity >= 7 ? '📋 احجز استشارة مع طبيب' : '🩺 سجّل هذه الأعراض في ملفك الطبي'}
          </p>
          <a
            href="/book-appointment"
            className="inline-block bg-teal-600 text-white font-black px-6 py-2.5 rounded-xl text-sm shadow-md"
          >
            {severity >= 7 ? 'احجز موعداً الآن' : 'اذهب للملف الطبي'}
          </a>
        </div>

        <button
          onClick={() => { setStep(0); setSelectedPathway(null); setAnswers({}); setRedFlagAnswers({}); setCriticalRedFlag(null); haptic.impact(); }}
          className="w-full py-3.5 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm"
        >
          بدء استبيان جديد
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-32" dir="rtl">
      <Head>
        <title>مدقق الأعراض — طِبرَا</title>
        <meta name="description" content="استبيان طبي ذكي لتحليل أعراضك وإرشادك للخطوة الصحيحة" />
      </Head>

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-700 px-5 pt-10 pb-8">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="relative">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : router.back()}
            className="flex items-center gap-2 text-white/70 mb-4 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm">{step > 0 ? 'رجوع' : 'إلغاء'}</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">مدقق الأعراض</h1>
              <p className="text-xs text-white/60">{steps[step]}</p>
            </div>
          </div>
        </div>
      </div>

      {renderProgressBar()}

      {/* Safety Note */}
      {step === 0 && (
        <div className="px-5 mb-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
            <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700">
              هذه الأداة للتوجيه فقط وليست تشخيصاً طبياً. في الحالات الطارئة اتصل بـ 997
            </p>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {step === 0 && renderSelectStep()}
          {step === 1 && renderRedFlagsStep()}
          {step === 2 && renderSocratesStep()}
          {step === 3 && renderPathwayQuestions()}
          {step === 4 && renderSummary()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
