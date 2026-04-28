// pages/daily-log.tsx
// ════════════════════════════════════════════════════════
// Daily Health Log — Orchestrator (7-step clinical diary)
// ════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Moon, Zap, Brain, Droplets, Pill, Plus,
  CheckCircle2, Check, ChevronLeft,
} from 'lucide-react';
import { useRouter } from 'next/router';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { toast } from '@/components/notification-engine';
import Head from 'next/head';

// Modular imports
import {
  STEPS_ORDERED, TOTAL_STEPS, SPRING, SYMPTOMS_LIST, MOOD_OPTIONS, QUICK_MEDS,
  getPainDesc, type StepType,
} from '@/components/daily-log/daily-log-data';
import { GlassCard, StepDots, MetalDial, NavButtons } from '@/components/daily-log/daily-log-ui';

export default function DailyLog() {
  const router = useRouter();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState<StepType>('welcome');
  const [direction, setDirection] = useState(1);

  const [painLevel, setPainLevel] = useState(0);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [mood, setMood] = useState<number | null>(null);
  const [activeSymptoms, setActiveSymptoms] = useState<string[]>([]);
  const [waterGlasses, setWaterGlasses] = useState(4);
  const [medsChecked, setMedsChecked] = useState<string[]>([]);
  const [customMed, setCustomMed] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [streakCount, setStreakCount] = useState(1);

  const goTo = (step: StepType, dir = 1) => { setDirection(dir); haptic.selection(); uiSounds.select(); setCurrentStep(step); };

  const handleSubmit = async () => {
    setIsSaving(true); goTo('analyzing'); haptic.success();
    try {
      const today = new Date().toISOString().split('T')[0];
      const existing = await db.entities.DailyLog.filter({ date: today, user_id: user?.id });
      const logData = { date: today, pain_level: painLevel, energy_level: energyLevel, sleep_quality: sleepQuality, mood: mood || 3 };
      if (existing.length > 0) { await db.entities.DailyLog.update(existing[0].id as string, logData); }
      else { await db.entities.DailyLog.createForUser(user?.id || '', logData); setStreakCount(p => p + 1); }
      const saved = JSON.parse(localStorage.getItem('tibrahRewards') || '{"points":0}');
      saved.points = (saved.points || 0) + 10;
      localStorage.setItem('tibrahRewards', JSON.stringify(saved));
      setTimeout(() => toast.success('🎉 كسبت 10 نقاط لاهتمامك بصحتك اليوم'), 500);
      try {
        const text = await db.integrations.Core.InvokeLLM({
          prompt: `المريض سجل: ألم ${painLevel}/10، طاقة ${energyLevel}/10، نوم ${sleepQuality}/10، مزاج ${mood}/5، ماء ${waterGlasses} أكواب، أعراض: ${activeSymptoms.join(', ') || 'لا شيء'}. اعطه نصيحة طبية عملية ومشجعة في 3 أسطر.`
        }) as any;
        setAiAnalysis(text?.response || text?.answer || 'رائع! استمر على هذا النهج — الانتظام مفتاح التعافي.');
      } catch { setAiAnalysis('رائع أنك سجّلت يومك! الانتظام هو أقوى دواء يعرفه الطب.'); }
      goTo('result'); uiSounds.success();
    } catch (err) { console.error(err); goTo('result'); }
    finally { setIsSaving(false); }
  };

  const pageVariants = {
    enter: (d: number) => ({ opacity: 0, x: d > 0 ? 32 : -32 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d > 0 ? -32 : 32 }),
  };
  const pageTransition: any = { duration: 0.28, ease: [0.25, 0.1, 0.25, 1] };
  const today = new Date().toLocaleDateString('ar-SA', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <>
      <Head><title>يومياتي الصحية — طِبرَا</title><meta name="theme-color" content="#F2F5F7" /></Head>
      <div dir="rtl" style={{ minHeight: '100svh', background: 'linear-gradient(160deg, #EEF2F5 0%, #F2F5F7 40%, #EBF4F3 100%)', overflowX: 'hidden' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-safe" style={{ paddingTop: 'max(env(safe-area-inset-top), 52px)', paddingBottom: 12 }}>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => router.back()} className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(12px)', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.07)' }}>
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </motion.button>
          <div className="text-center">
            <p className="font-bold text-slate-900" style={{ fontSize: 15 }}>يومياتي الصحية</p>
            <p style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{today}</p>
          </div>
          <div className="w-9" />
        </div>

        <div className="px-4 mb-4"><StepDots current={currentStep} /></div>

        <div style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 120px)' }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={currentStep} custom={direction} variants={pageVariants} initial="enter" animate="center" exit="exit" transition={pageTransition} className="px-4">

              {/* WELCOME */}
              {currentStep === 'welcome' && (
                <div className="flex flex-col items-center pt-6">
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    className="w-24 h-24 rounded-[28px] flex items-center justify-center mb-6"
                    style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,253,250,0.8))', boxShadow: '0 0 0 0.5px rgba(13,148,136,0.12), 0 4px 24px rgba(13,148,136,0.14), inset 0 1px 0 rgba(255,255,255,1)', border: '1px solid rgba(13,148,136,0.12)' }}>
                    <Activity className="w-10 h-10" style={{ color: '#0d9488' }} />
                  </motion.div>
                  <h1 className="font-black text-slate-900 text-center mb-3" style={{ fontSize: 28, letterSpacing: '-0.4px' }}>كيف كان يومك؟</h1>
                  <p className="text-center text-slate-500 leading-relaxed mb-8" style={{ fontSize: 15, maxWidth: 280 }}>تسجيل بياناتك اليومية يساعد د. عمر على تتبع تطورك ودقة خطتك العلاجية.</p>
                  <GlassCard className="w-full mb-6" style={{ padding: 16 }}>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[{ icon: '😣', label: 'ألم' }, { icon: '⚡', label: 'طاقة' }, { icon: '🌙', label: 'نوم' }, { icon: '💧', label: 'ماء' }].map((x, i) => (
                        <div key={i} className="flex flex-col items-center gap-1.5 py-2 rounded-2xl" style={{ background: 'rgba(13,148,136,0.05)' }}>
                          <span style={{ fontSize: 22 }}>{x.icon}</span><span className="font-bold text-slate-800" style={{ fontSize: 12 }}>{x.label}</span>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => goTo('pain')}
                    className="w-full h-14 rounded-[18px] flex items-center justify-center font-bold relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', boxShadow: '0 4px 20px rgba(13,148,136,0.28)', color: '#fff', fontSize: 16 }}>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 55%)' }} />
                    <span className="relative z-10">ابدأ التسجيل</span>
                  </motion.button>
                </div>
              )}

              {/* PAIN */}
              {currentStep === 'pain' && (
                <div>
                  <p className="font-bold mb-1" style={{ fontSize: 12, color: '#ef4444' }}>خطوة ١ من {TOTAL_STEPS}</p>
                  <h2 className="font-black text-slate-900 mb-5" style={{ fontSize: 22 }}>مستوى الألم اليوم؟</h2>
                  <GlassCard style={{ padding: 24, marginBottom: 20 }}>
                    <div className="text-center mb-6">
                      <motion.span key={painLevel} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING}
                        className="font-black leading-none" style={{ fontSize: 72, color: getPainDesc(painLevel).color }}>{painLevel}</motion.span>
                      <span className="font-bold text-slate-300" style={{ fontSize: 24 }}>/١٠</span>
                    </div>
                    <MetalDial value={painLevel} onChange={setPainLevel} min={0} max={10} color={getPainDesc(painLevel).color} />
                    <motion.div key={getPainDesc(painLevel).text} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                      className="mt-4 text-center py-2.5 rounded-2xl font-bold"
                      style={{ background: getPainDesc(painLevel).color + '12', color: getPainDesc(painLevel).color, fontSize: 15 }}>{getPainDesc(painLevel).text}</motion.div>
                  </GlassCard>
                  <NavButtons onNext={() => goTo('energy')} />
                </div>
              )}

              {/* ENERGY */}
              {currentStep === 'energy' && (
                <div>
                  <p className="font-bold mb-1" style={{ fontSize: 12, color: '#f59e0b' }}>خطوة ٢ من {TOTAL_STEPS}</p>
                  <h2 className="font-black text-slate-900 mb-5" style={{ fontSize: 22 }}>مستوى طاقتك اليوم؟</h2>
                  <GlassCard style={{ padding: 24, marginBottom: 20 }}>
                    <div className="flex justify-center mb-5">
                      <motion.div animate={{ boxShadow: `0 0 ${energyLevel * 3}px rgba(245,158,11,${energyLevel * 0.03})` }}
                        className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #fcd34d)', boxShadow: '0 4px 20px rgba(245,158,11,0.2)' }}>
                        <Zap className="w-9 h-9 text-white fill-white" />
                      </motion.div>
                    </div>
                    <div className="text-center mb-5"><motion.span key={energyLevel} initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={SPRING} className="font-black" style={{ fontSize: 60, color: '#f59e0b' }}>{energyLevel}</motion.span></div>
                    <MetalDial value={energyLevel} onChange={setEnergyLevel} min={1} max={10} color="#f59e0b" />
                    <div className="flex justify-between mt-2 px-1"><span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>منهك</span><span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>طاقة عالية</span></div>
                  </GlassCard>
                  <NavButtons onBack={() => goTo('pain', -1)} onNext={() => goTo('sleep')} />
                </div>
              )}

              {/* SLEEP */}
              {currentStep === 'sleep' && (
                <div>
                  <p className="font-bold mb-1" style={{ fontSize: 12, color: '#6366f1' }}>خطوة ٣ من {TOTAL_STEPS}</p>
                  <h2 className="font-black text-slate-900 mb-5" style={{ fontSize: 22 }}>جودة نومك البارحة؟</h2>
                  <GlassCard style={{ padding: 24, marginBottom: 20 }}>
                    <div className="flex justify-center mb-5">
                      <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 3, repeat: Infinity }}
                        className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 4px 20px rgba(99,102,241,0.2)' }}>
                        <Moon className="w-9 h-9 text-white fill-white" />
                      </motion.div>
                    </div>
                    <div className="text-center mb-5"><motion.span key={sleepQuality} initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={SPRING} className="font-black" style={{ fontSize: 60, color: '#6366f1' }}>{sleepQuality}</motion.span></div>
                    <MetalDial value={sleepQuality} onChange={setSleepQuality} min={1} max={10} color="#6366f1" />
                    <div className="flex justify-between mt-2 px-1"><span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>متقطع/سيء</span><span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>عميق/مريح</span></div>
                  </GlassCard>
                  <NavButtons onBack={() => goTo('energy', -1)} onNext={() => goTo('mood')} />
                </div>
              )}

              {/* MOOD */}
              {currentStep === 'mood' && (
                <div>
                  <p className="font-bold mb-1" style={{ fontSize: 12, color: '#10b981' }}>خطوة ٤ من {TOTAL_STEPS}</p>
                  <h2 className="font-black text-slate-900 mb-5" style={{ fontSize: 22 }}>كيف مزاجك اليوم؟</h2>
                  <div className="grid grid-cols-5 gap-2 mb-5">
                    {MOOD_OPTIONS.map(m => {
                      const sel = mood === m.val;
                      return (
                        <motion.button key={m.val} whileTap={{ scale: 0.9 }} onClick={() => { setMood(m.val); haptic.impact(); }}
                          className="flex flex-col items-center py-3 rounded-2xl relative"
                          style={{ background: sel ? m.color + '15' : 'rgba(255,255,255,0.65)', border: sel ? `1.5px solid ${m.color}40` : '1px solid rgba(0,0,0,0.07)', backdropFilter: 'blur(12px)', boxShadow: sel ? `0 4px 16px ${m.color}20` : '0 1px 4px rgba(0,0,0,0.05)', transition: 'all 200ms' }}>
                          {sel && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: m.color }}><Check className="w-2 h-2 text-white" strokeWidth={3} /></motion.div>}
                          <span style={{ fontSize: 26, lineHeight: 1, marginBottom: 4 }}>{m.emoji}</span>
                          <span style={{ fontSize: 9, fontWeight: 700, color: sel ? m.color : '#94a3b8' }}>{m.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                  <NavButtons onBack={() => goTo('sleep', -1)} onNext={() => goTo('symptoms')} disabled={mood === null} />
                </div>
              )}

              {/* SYMPTOMS */}
              {currentStep === 'symptoms' && (
                <div>
                  <p className="font-bold mb-1" style={{ fontSize: 12, color: '#8b5cf6' }}>خطوة ٥ من {TOTAL_STEPS}</p>
                  <h2 className="font-black text-slate-900 mb-2" style={{ fontSize: 22 }}>أي أعراض تلاحظها؟</h2>
                  <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>اختر كل ما ينطبق اليوم</p>
                  <div className="grid grid-cols-2 gap-2.5 mb-5">
                    {SYMPTOMS_LIST.map(s => {
                      const sel = activeSymptoms.includes(s.id);
                      return (
                        <motion.button key={s.id} whileTap={{ scale: 0.95 }}
                          onClick={() => { haptic.selection(); s.id === 'none' ? setActiveSymptoms(['none']) : setActiveSymptoms(prev => { const w = prev.filter(x => x !== 'none'); return w.includes(s.id) ? w.filter(x => x !== s.id) : [...w, s.id]; }); }}
                          className="flex items-center gap-3 px-4 py-3.5 rounded-2xl relative"
                          style={{ background: sel ? '#8b5cf615' : 'rgba(255,255,255,0.70)', border: sel ? '1.5px solid #8b5cf640' : '1px solid rgba(0,0,0,0.07)', backdropFilter: 'blur(12px)', boxShadow: sel ? '0 2px 12px rgba(139,92,246,0.12)' : '0 1px 4px rgba(0,0,0,0.05)', transition: 'all 200ms' }}>
                          <span style={{ fontSize: 22, flexShrink: 0 }}>{s.emoji}</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: sel ? '#7c3aed' : '#374151' }}>{s.label}</span>
                          {sel && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute left-3 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: '#8b5cf6' }}><Check className="w-2.5 h-2.5 text-white" strokeWidth={3} /></motion.div>}
                        </motion.button>
                      );
                    })}
                  </div>
                  <NavButtons onBack={() => goTo('mood', -1)} onNext={() => goTo('water')} />
                </div>
              )}

              {/* WATER */}
              {currentStep === 'water' && (
                <div>
                  <p className="font-bold mb-1" style={{ fontSize: 12, color: '#0ea5e9' }}>خطوة ٦ من {TOTAL_STEPS}</p>
                  <h2 className="font-black text-slate-900 mb-2" style={{ fontSize: 22 }}>كمية الماء اليوم؟</h2>
                  <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>الهدف ٨ أكواب (٢ لتر)</p>
                  <GlassCard style={{ padding: 24, marginBottom: 20 }}>
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => { if (waterGlasses > 0) { setWaterGlasses(p => p - 1); haptic.selection(); } }}
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black"
                        style={{ background: 'rgba(14,165,233,0.10)', color: '#0ea5e9', border: '1.5px solid rgba(14,165,233,0.20)' }}>−</motion.button>
                      <div className="text-center">
                        <motion.span key={waterGlasses} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING}
                          className="font-black block" style={{ fontSize: 64, color: '#0ea5e9', lineHeight: 1 }}>{waterGlasses}</motion.span>
                        <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>كوب</span>
                      </div>
                      <motion.button whileTap={{ scale: 0.85 }} onClick={() => { if (waterGlasses < 15) { setWaterGlasses(p => p + 1); haptic.selection(); } }}
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl font-black"
                        style={{ background: 'rgba(14,165,233,0.10)', color: '#0ea5e9', border: '1.5px solid rgba(14,165,233,0.20)' }}>+</motion.button>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <motion.div key={i} animate={{ background: i < waterGlasses ? '#0ea5e9' : 'rgba(14,165,233,0.12)', scale: i < waterGlasses ? 1 : 0.9 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 28, delay: i * 0.03 }}
                          onClick={() => { setWaterGlasses(i + 1); haptic.selection(); }}
                          style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <Droplets className="w-5 h-5" style={{ color: i < waterGlasses ? '#fff' : '#0ea5e980' }} />
                        </motion.div>
                      ))}
                    </div>
                    {waterGlasses >= 8 && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        className="mt-4 py-2.5 rounded-2xl text-center font-bold" style={{ background: 'rgba(14,165,233,0.10)', color: '#0ea5e9', fontSize: 13 }}>🎉 هدفك اليومي محقق!</motion.div>
                    )}
                  </GlassCard>
                  <NavButtons onBack={() => goTo('symptoms', -1)} onNext={() => goTo('meds')} />
                </div>
              )}

              {/* MEDS */}
              {currentStep === 'meds' && (
                <div>
                  <p className="font-bold mb-1" style={{ fontSize: 12, color: '#10b981' }}>خطوة ٧ من {TOTAL_STEPS}</p>
                  <h2 className="font-black text-slate-900 mb-2" style={{ fontSize: 22 }}>أدويتك اليوم</h2>
                  <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>أكّد أي أدوية أخذتها اليوم</p>
                  {QUICK_MEDS.map(med => {
                    const sel = medsChecked.includes(med);
                    return (
                      <motion.button key={med} whileTap={{ scale: 0.97 }}
                        onClick={() => { haptic.selection(); setMedsChecked(p => p.includes(med) ? p.filter(x => x !== med) : [...p, med]); }}
                        className="w-full flex items-center gap-3 px-4 mb-2.5 rounded-2xl"
                        style={{ height: 52, background: sel ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.78)', border: sel ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(0,0,0,0.07)', backdropFilter: 'blur(12px)', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 200ms' }}>
                        <Pill className="w-4 h-4 flex-shrink-0" style={{ color: sel ? '#10b981' : '#94a3b8' }} />
                        <span style={{ flex: 1, textAlign: 'right', fontSize: 14, fontWeight: 600, color: sel ? '#065f46' : '#374151' }}>{med}</span>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: sel ? '#10b981' : 'rgba(0,0,0,0.08)', transition: 'all 200ms' }}>
                          {sel && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                        </div>
                      </motion.button>
                    );
                  })}
                  <div className="flex gap-2 mt-1 mb-5">
                    <input value={customMed} onChange={e => setCustomMed(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && customMed.trim()) { setMedsChecked(p => [...p, customMed.trim()]); setCustomMed(''); } }}
                      placeholder="أضف دواء آخر..." dir="rtl"
                      className="flex-1 px-4 rounded-2xl outline-none font-medium text-slate-800"
                      style={{ height: 44, background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(0,0,0,0.09)', backdropFilter: 'blur(12px)', fontSize: 14 }} />
                    <motion.button whileTap={{ scale: 0.9 }}
                      onClick={() => { if (customMed.trim()) { setMedsChecked(p => [...p, customMed.trim()]); setCustomMed(''); haptic.selection(); } }}
                      className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: '#0d9488', boxShadow: '0 2px 8px rgba(13,148,136,0.25)' }}><Plus className="w-4 h-4 text-white" /></motion.button>
                  </div>
                  <NavButtons onBack={() => goTo('water', -1)} onNext={handleSubmit} nextLabel="حفظ وتحليل يومياتي" nextColor="#0d9488" />
                </div>
              )}

              {/* ANALYZING */}
              {currentStep === 'analyzing' && (
                <div className="flex flex-col items-center justify-center" style={{ minHeight: '70vh' }}>
                  <div className="relative w-28 h-28 mb-8">
                    <motion.div className="absolute inset-[-16px] rounded-full" style={{ background: 'rgba(13,148,136,0.08)' }}
                      animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }} transition={{ duration: 2.5, repeat: Infinity }} />
                    <div className="absolute inset-0 rounded-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #0d9488, #4f8bdb)', boxShadow: '0 8px 32px rgba(13,148,136,0.25)' }}>
                      <Brain className="w-12 h-12 text-white" />
                    </div>
                    <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}>
                      <div style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)', width: 12, height: 12, borderRadius: 6, background: '#ffffff', boxShadow: '0 0 12px rgba(255,255,255,0.8)' }} />
                    </motion.div>
                  </div>
                  <h2 className="font-black text-slate-900 mb-2" style={{ fontSize: 24 }}>جاري التحليل...</h2>
                  <p style={{ fontSize: 14, color: '#94a3b8' }}>يعالج الذكاء الاصطناعي حالتك اليومية</p>
                </div>
              )}

              {/* RESULT */}
              {currentStep === 'result' && (
                <div className="flex flex-col items-center pt-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                    className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                    style={{ background: 'linear-gradient(135deg, #10b981, #0d9488)', boxShadow: '0 8px 32px rgba(16,185,129,0.25)' }}>
                    <CheckCircle2 className="w-10 h-10 text-white" />
                  </motion.div>
                  <h2 className="font-black text-slate-900 mb-1" style={{ fontSize: 28 }}>تم الحفظ! 🎉</h2>
                  <p style={{ fontSize: 14, color: '#0d9488', fontWeight: 600, marginBottom: 20 }}>يوميات يومك سُجِّلت بنجاح</p>
                  <GlassCard style={{ padding: 16, marginBottom: 16, width: '100%' }}>
                    <div className="flex items-center gap-3 justify-center">
                      <span style={{ fontSize: 28 }}>🔥</span>
                      <div className="text-right"><p style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>السجل المتواصل</p><p className="font-black" style={{ fontSize: 20, color: '#f59e0b' }}>{streakCount} يوم</p></div>
                    </div>
                  </GlassCard>
                  <GlassCard style={{ padding: 16, marginBottom: 16, width: '100%' }}>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[{ l: 'ألم', v: `${painLevel}/١٠`, c: getPainDesc(painLevel).color }, { l: 'طاقة', v: `${energyLevel}/١٠`, c: '#f59e0b' }, { l: 'نوم', v: `${sleepQuality}/١٠`, c: '#6366f1' }, { l: 'ماء', v: `${waterGlasses} 💧`, c: '#0ea5e9' }].map((x, i) => (
                        <div key={i}><p style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700, marginBottom: 2 }}>{x.l}</p><p style={{ fontSize: 16, fontWeight: 800, color: x.c }}>{x.v}</p></div>
                      ))}
                    </div>
                  </GlassCard>
                  {aiAnalysis && (
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                      style={{ width: '100%', borderRadius: 20, padding: 20, marginBottom: 16, background: 'linear-gradient(145deg, rgba(13,148,136,0.08), rgba(79,139,219,0.06))', border: '1px solid rgba(13,148,136,0.15)', backdropFilter: 'blur(16px)' }}>
                      <div className="flex items-center gap-2 mb-3"><Brain className="w-4 h-4" style={{ color: '#0d9488' }} /><span style={{ fontSize: 12, fontWeight: 700, color: '#0d9488' }}>تحليل الذكاء الاصطناعي</span></div>
                      <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.65 }}>{aiAnalysis}</p>
                    </motion.div>
                  )}
                  <motion.button whileTap={{ scale: 0.97 }} onClick={() => router.back()}
                    className="w-full h-14 rounded-[18px] font-bold"
                    style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', boxShadow: '0 4px 20px rgba(13,148,136,0.25)', color: '#fff', fontSize: 16 }}>العودة للرئيسية</motion.button>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
