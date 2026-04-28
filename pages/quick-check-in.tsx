// pages/quick-check-in.tsx
// ════════════════════════════════════════════════════════
// Daily Health Check-in — Orchestrator
// ════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Battery, Moon, Brain, ArrowLeft, ArrowRight,
  HeartPulse, Sparkles, CheckCircle2, Loader2, Heart,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import { toast } from 'sonner';
import { haptic } from '@/lib/HapticFeedback';
import SEO from '@/components/common/SEO';

// Modular imports
import {
  EMPTY_CHECKIN, PHYSICAL_SYMPTOMS_CHIPS, EMOTIONAL_CHIPS,
  type CheckInData, type StepId,
} from '@/components/quick-check-in/checkin-data';
import {
  EmojiScale, WaterTracker, AnalyzingScreen, ResultScreen, StepBar,
} from '@/components/quick-check-in/checkin-ui';

export default function QuickCheckIn() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<StepId>('vitals');
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<CheckInData>(EMPTY_CHECKIN);

  const update = (field: keyof CheckInData) => (val: any) => setData(d => ({ ...d, [field]: val }));
  const goTo = (s: StepId) => { haptic.selection(); setStep(s); };
  const canGoBack = step === 'symptoms' || step === 'emotional';
  const handleBack = () => { if (step === 'symptoms') goTo('vitals'); else if (step === 'emotional') goTo('symptoms'); };

  const handleAnalyze = async () => {
    goTo('analyzing'); setSaving(true);
    try {
      if (user?.id) {
        await db.entities.DailyLog.createForUser(user.id, {
          date: new Date().toISOString(), energy_level: data.energy, sleep_quality: data.sleep, stress_level: data.stress,
          notes: data.physicalSymptoms, emotional_diagnostic: {
            body_region: 'غير محدد', physical_complaint: data.physicalSymptoms, emotional_diagnostic_pattern: 'قيد التحليل',
            psychosomatic_dimension: data.emotionalContext, stress_context: data.stress >= 4 ? 'عالي' : data.stress >= 3 ? 'متوسط' : 'منخفض',
            behavioral_contributors: [], repeated_pattern_flag: false, clinician_summary: '', patient_summary: '',
          },
        });
        try { await fetch('/api/rewards/award', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, action: 'daily_checkin' }) }); } catch {}
        toast.success('تم حفظ تقييمك اليومي ✓', { duration: 2000 });
      }
    } catch (e) { console.error('[CheckIn]', e); toast.error('حدث خطأ في الحفظ'); }
    finally { setSaving(false); }
    await new Promise(r => setTimeout(r, 2800));
    goTo('result');
  };

  return (
    <div className="min-h-screen bg-[#F7FAFA] dark:bg-[#080D13] font-sans">
      <SEO title="تقييمي اليومي | طِبرَا" />

      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-8%] left-[-5%] w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)', filter: 'blur(45px)' }} />
        <div className="absolute bottom-[20%] right-[-8%] w-52 h-52 rounded-full" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-safe">
        <div className="flex items-center justify-between h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-b-2xl px-4 shadow-sm border-b border-slate-100 dark:border-slate-800/60">
          {canGoBack ? (
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleBack} className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800"><ArrowRight className="w-4 h-4 text-slate-600 dark:text-slate-300" /></motion.button>
          ) : (
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()} className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800"><ArrowRight className="w-4 h-4 text-slate-600 dark:text-slate-300" /></motion.button>
          )}
          <div className="flex items-center gap-1.5"><HeartPulse className="w-4 h-4 text-teal-600 dark:text-teal-400" /><span className="text-[13px] font-black text-slate-700 dark:text-slate-200">تقييمي اليومي</span></div>
          <span className="text-[10px] font-bold text-slate-400">{new Date().toLocaleDateString('ar-SA', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
        </div>
        <StepBar step={step} />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 pb-28 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {step === 'vitals' && (
            <motion.div key="vitals" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="pt-4 space-y-3">
              <div className="mb-4">
                <p className="text-[11.5px] font-bold text-teal-600 dark:text-teal-400 mb-0.5">الخطوة ١ من ٣</p>
                <h1 className="text-[20px] font-black text-slate-800 dark:text-white">مؤشراتك الحيوية</h1>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">كيف تشعر اليوم؟</p>
              </div>
              <EmojiScale field="energy" value={data.energy} label="مستوى الطاقة" icon={Battery} color="#f59e0b" onChange={update('energy')} />
              <EmojiScale field="sleep" value={data.sleep} label="جودة النوم الليلة الماضية" icon={Moon} color="#6366f1" onChange={update('sleep')} />
              <EmojiScale field="stress" value={data.stress} label="مستوى التوتر" icon={Brain} color="#ef4444" onChange={update('stress')} />
              <EmojiScale field="mood" value={data.mood} label="المزاج العام" icon={Heart} color="#10b981" onChange={update('mood')} />
              <WaterTracker value={data.waterGlasses} onChange={update('waterGlasses')} />
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => goTo('symptoms')}
                className="w-full h-[52px] rounded-2xl text-white text-[14px] font-black flex items-center justify-between px-5 mt-2"
                style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', boxShadow: '0 6px 20px rgba(13,148,136,0.25)' }}>
                <span>متابعة — الأعراض</span><ArrowLeft className="w-5 h-5 text-white/80" />
              </motion.button>
            </motion.div>
          )}

          {step === 'symptoms' && (
            <motion.div key="symptoms" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="pt-4">
              <div className="mb-5">
                <p className="text-[11.5px] font-bold text-teal-600 dark:text-teal-400 mb-0.5">الخطوة ٢ من ٣</p>
                <h1 className="text-[20px] font-black text-slate-800 dark:text-white">الأعراض الجسدية</h1>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">ما الذي تشعر به جسدياً اليوم؟</p>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {PHYSICAL_SYMPTOMS_CHIPS.map(s => {
                  const selected = data.physicalSymptoms.includes(s);
                  return (
                    <motion.button key={s} whileTap={{ scale: 0.92 }}
                      onClick={() => {
                        haptic.selection();
                        if (s === 'لا أعراض') { update('physicalSymptoms')('لا أعراض اليوم'); }
                        else { const current = data.physicalSymptoms.replace('لا أعراض اليوم', '').trim(); const arr = current ? current.split('، ').filter(Boolean) : []; update('physicalSymptoms')(selected ? arr.filter(x => x !== s).join('، ') : [...arr, s].join('، ')); }
                      }}
                      className="px-3 py-1.5 rounded-xl border-2 text-[11.5px] font-bold transition-all"
                      style={selected ? { borderColor: '#0d9488', backgroundColor: 'rgba(13,148,136,0.1)', color: '#0d9488' } : { borderColor: '#e2e8f0', backgroundColor: '#f8fafc', color: '#64748b' }}>{s}</motion.button>
                  );
                })}
              </div>
              <div className="bg-white dark:bg-slate-800/60 rounded-[22px] p-4 border border-slate-100 dark:border-slate-700/60 shadow-sm mb-5">
                <p className="text-[11.5px] font-bold text-slate-500 dark:text-slate-400 mb-2">أو اكتب بنفسك (اختياري)</p>
                <textarea value={data.physicalSymptoms} onChange={e => update('physicalSymptoms')(e.target.value)} placeholder="صف ما تشعر به..." rows={3}
                  className="w-full text-[13px] font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/60 resize-none focus:outline-none focus:border-teal-300 placeholder-slate-300 dark:placeholder-slate-600" />
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => goTo('emotional')}
                className="w-full h-[52px] rounded-2xl text-white text-[14px] font-black flex items-center justify-between px-5"
                style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', boxShadow: '0 6px 20px rgba(13,148,136,0.25)' }}>
                <span>متابعة — الجانب العاطفي</span><ArrowLeft className="w-5 h-5 text-white/80" />
              </motion.button>
            </motion.div>
          )}

          {step === 'emotional' && (
            <motion.div key="emotional" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="pt-4">
              <div className="mb-5">
                <p className="text-[11.5px] font-bold text-teal-600 dark:text-teal-400 mb-0.5">الخطوة ٣ من ٣</p>
                <h1 className="text-[20px] font-black text-slate-800 dark:text-white">البعد العاطفي</h1>
              </div>
              <div className="p-4 rounded-2xl mb-4 border border-indigo-100 dark:border-indigo-800/20" style={{ backgroundColor: 'rgba(99,102,241,0.05)' }}>
                <div className="flex items-center gap-2 mb-1.5"><Brain className="w-4 h-4 text-indigo-500" /><p className="text-[12px] font-bold text-indigo-700 dark:text-indigo-300">الجسد يتحدث بصوت المشاعر</p></div>
                <p className="text-[11px] text-indigo-600/80 dark:text-indigo-300/70 font-medium leading-relaxed">في طِبرَا ندرك أن كثيراً من الأعراض الجسدية ترتبط بالجانب النفسي والشعوري.</p>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {EMOTIONAL_CHIPS.map(ctx => {
                  const selected = data.emotionalContext.includes(ctx);
                  return (
                    <motion.button key={ctx} whileTap={{ scale: 0.92 }}
                      onClick={() => {
                        haptic.selection();
                        if (ctx === 'لا شيء') { update('emotionalContext')(''); }
                        else { const arr = data.emotionalContext ? data.emotionalContext.split('، ').filter(x => x && x !== 'لا شيء') : []; update('emotionalContext')(selected ? arr.filter(x => x !== ctx).join('، ') : [...arr, ctx].join('، ')); }
                      }}
                      className="px-3 py-1.5 rounded-xl border-2 text-[11.5px] font-bold transition-all"
                      style={selected ? { borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.1)', color: '#6366f1' } : { borderColor: '#e2e8f0', backgroundColor: '#f8fafc', color: '#64748b' }}>{ctx}</motion.button>
                  );
                })}
              </div>
              <div className="bg-white dark:bg-slate-800/60 rounded-[22px] p-4 border border-slate-100 dark:border-slate-700/60 shadow-sm mb-5">
                <textarea value={data.emotionalContext} onChange={e => update('emotionalContext')(e.target.value)}
                  placeholder="شيء تودّ إضافته عن حالتك العاطفية اليوم (اختياري)" rows={3}
                  className="w-full text-[13px] font-medium text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700/60 resize-none focus:outline-none focus:border-indigo-300 placeholder-slate-300 dark:placeholder-slate-600" />
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleAnalyze} disabled={saving}
                className="w-full h-[54px] rounded-2xl text-white text-[14px] font-black flex items-center justify-between px-5 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0d9488, #6366f1)', boxShadow: '0 8px 24px rgba(13,148,136,0.28)', opacity: saving ? 0.7 : 1 }}>
                {saving ? (<><Loader2 className="w-5 h-5 text-white animate-spin" /><span>جاري الحفظ...</span></>) : (<><div className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-white" /><span>تحليل يومياتي الصحية</span></div><ArrowLeft className="w-5 h-5 text-white/80" /></>)}
              </motion.button>
            </motion.div>
          )}

          {step === 'analyzing' && (<motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-8"><AnalyzingScreen /></motion.div>)}

          {step === 'result' && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1"><CheckCircle2 className="w-5 h-5 text-teal-500" /><h2 className="text-[18px] font-black text-slate-800 dark:text-white">تقريرك الصحي اليومي</h2></div>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">تم الحفظ والتحليل بنجاح ✓</p>
              </div>
              <ResultScreen data={data} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
