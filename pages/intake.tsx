// pages/intake.tsx
// ════════════════════════════════════════════════════════
// World-class Clinical Assessment — Orchestrator
// Multi-step triage with AI analysis, DB save, and smart handoff
// ════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle, ArrowLeft, ArrowRight, Check,
  Clock, Stethoscope, Lock, Pill, X, Sparkles,
} from 'lucide-react';
import { db } from '@/lib/db';
import SEO from '@/components/common/SEO';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { PAGE_BG_ASSESSMENT } from '@/components/health-engine/result/shared/design-tokens';

// Modular imports
import {
  COMPLAINTS, RED_FLAGS, CHRONIC_CONDITIONS, STEPS,
  EMPTY_ASSESSMENT, computeTriage,
  type StepId, type TriageLevel, type AssessmentData,
} from '@/components/intake/intake-data';
import { StepDots, SeverityMeter, AnalyzingScreen, ResultCard } from '@/components/intake/intake-ui';

export default function ClinicalIntake() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<StepId>('welcome');
  const [triageLevel, setTriageLevel] = useState<TriageLevel>('manageable');
  const [data, setData] = useState<AssessmentData>(EMPTY_ASSESSMENT);

  // Load draft
  useEffect(() => {
    try {
      const draft = localStorage.getItem('tibrah_triage_draft');
      if (draft) {
        const parsed = JSON.parse(draft);
        setData(d => ({ ...d, ...parsed }));
        if (parsed.complaint) setStep('severity');
      }
    } catch { }
  }, []);

  // Save draft
  useEffect(() => {
    if (step !== 'welcome' && step !== 'analyzing' && step !== 'result') {
      localStorage.setItem('tibrah_triage_draft', JSON.stringify(data));
    }
  }, [data, step]);

  const goTo = (s: StepId) => { haptic.selection(); setStep(s); };

  const handleComplaintSelect = (id: string, label: string) => {
    haptic.impact(); uiSounds.select();
    setData(d => ({ ...d, complaint: id, complaintLabel: label }));
    goTo('severity');
  };

  const toggleRedFlag = (id: string) => {
    haptic.selection();
    setData(d => {
      const flags = d.redFlags.includes(id) ? d.redFlags.filter(f => f !== id) : [...d.redFlags, id];
      return { ...d, redFlags: flags, hasRedFlags: flags.length > 0 };
    });
  };

  const toggleCondition = (c: string) => {
    haptic.selection();
    setData(d => {
      if (c === 'لا شيء') return { ...d, chronicConditions: ['لا شيء'] };
      const conds = d.chronicConditions.filter(x => x !== 'لا شيء');
      const next = conds.includes(c) ? conds.filter(x => x !== c) : [...conds, c];
      return { ...d, chronicConditions: next };
    });
  };

  const handleSubmit = async () => {
    goTo('analyzing');
    const level = computeTriage(data);
    await new Promise(r => setTimeout(r, 3200));
    if (user?.id) {
      try {
        await db.entities.DailyLog.createForUser(user.id, {
          date: new Date().toISOString().split('T')[0],
          notes: `التقييم السريري: ${data.complaintLabel} | الحدة: ${data.severity}/10 | المدة: ${data.duration}`,
          energy_level: Math.max(1, 10 - data.severity),
        });
      } catch (e) { console.error('[Intake] DB error:', e); }
    }
    localStorage.removeItem('tibrah_triage_draft');
    setTriageLevel(level);
    goTo('result');
  };

  const stepOrder: StepId[] = ['welcome', 'complaint', 'severity', 'modifiers', 'history'];
  const currentIdx = stepOrder.indexOf(step);
  const canGoBack = currentIdx > 0 && step !== 'analyzing' && step !== 'result';
  const handleBack = () => { if (canGoBack) goTo(stepOrder[currentIdx - 1]); };

  return (
    <div
      dir="rtl"
      className="min-h-screen"
      style={{ background: PAGE_BG_ASSESSMENT, fontFamily: 'var(--font-alexandria), Alexandria, "IBM Plex Sans Arabic", system-ui, sans-serif' }}
    >
      <SEO title="التقييم السريري | طِبرَا" />

      {/* Aquatic animated background */}
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute inset-0" style={{ background: PAGE_BG_ASSESSMENT }} />
        <motion.div
          className="absolute -top-24 -right-24 rounded-full"
          animate={{ scale: [1, 1.10, 1], opacity: [0.28, 0.50, 0.28] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: 360, height: 360, background: 'radial-gradient(circle, rgba(8,145,178,0.30), transparent 68%)', filter: 'blur(54px)' }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 rounded-full"
          animate={{ y: [0, -12, 0], opacity: [0.18, 0.38, 0.18] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          style={{ width: 300, height: 300, background: 'radial-gradient(circle, rgba(99,102,241,0.22), transparent 66%)', filter: 'blur(46px)' }}
        />
        <div
          className="absolute inset-0 opacity-35"
          style={{
            backgroundImage: 'linear-gradient(115deg, rgba(255,255,255,0.28) 0 1px, transparent 1px 14px), linear-gradient(25deg, rgba(255,255,255,0.18) 0 1px, transparent 1px 18px)',
            backgroundSize: '48px 48px, 60px 60px',
          }}
        />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-30 px-4 pt-safe" style={{ position: 'sticky', zIndex: 30 }}>
        <div
          className="flex items-center justify-between h-14 rounded-b-2xl px-4"
          style={{
            background: 'rgba(235,249,252,0.82)',
            backdropFilter: 'blur(28px) saturate(175%)',
            WebkitBackdropFilter: 'blur(28px) saturate(175%)',
            borderBottom: '1px solid rgba(255,255,255,0.72)',
            boxShadow: '0 4px 20px rgba(8,145,178,0.08)',
          }}
        >
          {canGoBack ? (
            <motion.button whileTap={{ scale: 0.90 }} onClick={handleBack}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.76)', border: '1px solid rgba(255,255,255,0.90)', boxShadow: '0 4px 12px rgba(8,145,178,0.10)' }}>
              <ArrowRight className="w-4 h-4" style={{ color: '#0E7490' }} />
            </motion.button>
          ) : step === 'result' ? (
            <motion.button whileTap={{ scale: 0.90 }} onClick={() => router.push('/')}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.76)', border: '1px solid rgba(255,255,255,0.90)' }}>
              <X className="w-4 h-4" style={{ color: '#0E7490' }} />
            </motion.button>
          ) : <div className="w-9" />}

          <div className="flex items-center gap-2">
            <Stethoscope className="w-4 h-4" style={{ color: '#0891B2' }} />
            <span style={{ fontSize: 13.5, fontWeight: 900, color: '#0C4A6E' }}>التقييم السريري</span>
          </div>

          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(8,145,178,0.10)', border: '1px solid rgba(8,145,178,0.18)' }}
          >
            <Lock className="w-2.5 h-2.5" style={{ color: '#0891B2' }} />
            <span style={{ fontSize: 10, fontWeight: 850, color: '#0E7490' }}>مؤمّن</span>
          </div>
        </div>
        <StepDots current={step} />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 pb-36 max-w-md mx-auto">
        <AnimatePresence mode="wait">

          {/* WELCOME */}
          {step === 'welcome' && (
            <motion.div key="welcome" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ type: 'spring', stiffness: 220, damping: 26 }} className="pt-8">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <motion.div animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.85, 0.55] }} transition={{ duration: 3.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(8,145,178,0.55), transparent 70%)', filter: 'blur(22px)', transform: 'scale(1.4)' }} />
                  <div className="w-24 h-24 rounded-3xl flex items-center justify-center relative overflow-hidden"
                    style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(186,230,253,0.70) 50%, rgba(8,145,178,0.35))', border: '1.5px solid rgba(255,255,255,0.90)', boxShadow: '0 18px 48px rgba(8,145,178,0.25), inset 0 2px 0 rgba(255,255,255,0.90)' }}>
                    <Stethoscope className="w-11 h-11" style={{ color: '#0891B2' }} />
                  </div>
                </div>
              </div>
              <h1 className="text-center mb-3 leading-tight" style={{ fontSize: 26, fontWeight: 950, color: '#0C4A6E' }}>
                أهلاً بك في<br />
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #0891B2, #6366f1)' }}>محرك الرعاية الرقمي</span>
              </h1>
              <p className="text-center font-medium leading-relaxed mb-6 px-2" style={{ fontSize: 13, color: '#0369A1' }}>سنطرح عليك أسئلة موجهة بناءً على أسلوب الطب الوظيفي لتصنيف حالتك وتوجيهك للخطوة الأنسب.</p>
              <div className="flex flex-wrap gap-2 justify-center mb-7">
                {['ذكاء اصطناعي', 'دقيقتان فقط', 'خصوصية تامة', 'مجاناً'].map(f => (
                  <span key={f} className="px-3 py-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(255,255,255,0.90)', fontSize: 11, fontWeight: 850, color: '#0369A1', boxShadow: '0 4px 12px rgba(8,145,178,0.08)' }}>{f}</span>
                ))}
              </div>
              <div className="flex items-start gap-3 p-4 rounded-[22px] mb-5" style={{ background: 'rgba(254,243,199,0.82)', border: '1px solid rgba(245,158,11,0.22)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.72)' }}>
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#D97706' }} />
                <p className="font-medium leading-relaxed" style={{ fontSize: 11.5, color: '#92400E' }}>إذا كنت في حالة طارئة تهدد حياتك فتوجه للطوارئ فوراً — هذا التقييم <strong>لا يحل</strong> محل الطوارئ.</p>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => goTo('complaint')}
                className="w-full h-[56px] rounded-[24px] text-white flex items-center justify-between px-6 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0891B2, #6366f1)', boxShadow: '0 14px 36px rgba(8,145,178,0.30), inset 0 1.5px 0 rgba(255,255,255,0.24)', fontSize: 15, fontWeight: 950 }}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/8 to-white/0" />
                <span>ابدأ التقييم الآن</span>
                <motion.div animate={{ x: [0, -5, 0] }} transition={{ duration: 1.8, repeat: Infinity }}><ArrowLeft className="w-5 h-5 text-white/80" /></motion.div>
              </motion.button>
            </motion.div>
          )}

          {/* COMPLAINT */}
          {step === 'complaint' && (
            <motion.div key="complaint" initial={{ opacity: 0, x: -22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 22 }} transition={{ type: 'spring', stiffness: 220, damping: 26 }} className="pt-5">
              <div className="mb-5">
                <p style={{ fontSize: 11, fontWeight: 950, color: '#059669', marginBottom: 5 }}>السؤال ١ من ٤</p>
                <h2 style={{ fontSize: 22, fontWeight: 950, color: '#0C4A6E', lineHeight: 1.35 }}>ما هي شكواك الرئيسية؟</h2>
                <p style={{ fontSize: 12, color: '#0369A1', fontWeight: 700, marginTop: 5 }}>اختر ما يزعجك أكثر شيء حالياً</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {COMPLAINTS.map((c, i) => {
                  const Icon = c.icon;
                  return (
                    <motion.button key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      whileTap={{ scale: 0.93 }} onClick={() => handleComplaintSelect(c.id, c.label)}
                      className="relative p-4 rounded-[22px] text-right overflow-hidden"
                      style={{
                        background: 'rgba(255,255,255,0.76)',
                        border: `1.5px solid ${c.color}22`,
                        backdropFilter: 'blur(18px)',
                        WebkitBackdropFilter: 'blur(18px)',
                        boxShadow: `0 8px 24px ${c.color}10, inset 0 1px 0 rgba(255,255,255,0.90)`,
                      }}>
                      <div className="w-10 h-10 rounded-[16px] flex items-center justify-center mb-3" style={{ background: `${c.color}14`, border: `1px solid ${c.color}20` }}>
                        <Icon className="w-5 h-5" style={{ color: c.color }} />
                      </div>
                      <p style={{ fontSize: 12.5, fontWeight: 900, color: '#0C4A6E', lineHeight: 1.4 }}>{c.label}</p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* SEVERITY */}
          {step === 'severity' && (
            <motion.div key="severity" initial={{ opacity: 0, x: -22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 22 }} transition={{ type: 'spring', stiffness: 220, damping: 26 }} className="pt-5">
              <div className="mb-6">
                <p style={{ fontSize: 11, fontWeight: 950, color: '#D97706', marginBottom: 5 }}>السؤال ٢ من ٤</p>
                <h2 style={{ fontSize: 22, fontWeight: 950, color: '#0C4A6E', lineHeight: 1.35 }}>كيف تقيّم شدة الأعراض؟</h2>
              </div>
              <div className="rounded-[24px] p-5 mb-4" style={{ background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(255,255,255,0.92)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', boxShadow: '0 12px 36px rgba(217,119,6,0.10), inset 0 1.5px 0 rgba(255,255,255,0.96)' }}>
                <p style={{ fontSize: 12, fontWeight: 800, color: '#92400E', marginBottom: 14 }}>اضغط على الشريط ليعكس مستوى ألمك أو انزعاجك</p>
                <SeverityMeter value={data.severity} onChange={v => setData(d => ({ ...d, severity: v }))} />
              </div>
              <div className="rounded-[24px] p-5 mb-5" style={{ background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(255,255,255,0.92)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', boxShadow: '0 12px 36px rgba(8,145,178,0.08), inset 0 1.5px 0 rgba(255,255,255,0.96)' }}>
                <div className="flex items-center gap-2 mb-4"><Clock className="w-4 h-4" style={{ color: '#0891B2' }} /><p style={{ fontSize: 13, fontWeight: 900, color: '#0C4A6E' }}>منذ متى تعاني من هذه الأعراض؟</p></div>
                <div className="grid grid-cols-3 gap-2">
                  {[{ id: 'hours', label: 'ساعات', sub: 'أقل من يوم' }, { id: 'days', label: 'أيام', sub: '٢-١٤ يوم' }, { id: 'weeks', label: 'أسابيع+', sub: 'أكثر من أسبوعين' }].map(opt => (
                    <motion.button key={opt.id} whileTap={{ scale: 0.93 }}
                      onClick={() => { haptic.selection(); setData(d => ({ ...d, duration: opt.id })); }}
                      className="py-3 px-2 rounded-[18px] text-center"
                      style={data.duration === opt.id
                        ? { border: '2px solid #0891B2', background: 'rgba(8,145,178,0.10)' }
                        : { border: '1.5px solid rgba(255,255,255,0.80)', background: 'rgba(255,255,255,0.60)' }}>
                      <p style={{ fontSize: 13, fontWeight: 950, color: data.duration === opt.id ? '#0891B2' : '#64748b' }}>{opt.label}</p>
                      <p style={{ fontSize: 9.5, fontWeight: 700, color: '#94a3b8', marginTop: 2 }}>{opt.sub}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => goTo('modifiers')}
                className="w-full h-[54px] rounded-[24px] text-white flex items-center justify-between px-5"
                style={{ background: 'linear-gradient(135deg, #0891B2, #0E7490)', boxShadow: '0 10px 28px rgba(8,145,178,0.28), inset 0 1.5px 0 rgba(255,255,255,0.22)', fontSize: 14, fontWeight: 950 }}>
                <span>متابعة</span><ArrowLeft className="w-5 h-5 text-white/80" />
              </motion.button>
            </motion.div>
          )}

          {/* RED FLAGS */}
          {step === 'modifiers' && (
            <motion.div key="modifiers" initial={{ opacity: 0, x: -22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 22 }} transition={{ type: 'spring', stiffness: 220, damping: 26 }} className="pt-5">
              <div className="mb-5">
                <p style={{ fontSize: 11, fontWeight: 950, color: '#DC2626', marginBottom: 5 }}>السؤال ٣ من ٤</p>
                <h2 style={{ fontSize: 22, fontWeight: 950, color: '#0C4A6E', lineHeight: 1.35 }}>علامات التحذير</h2>
                <p style={{ fontSize: 12, color: '#0369A1', fontWeight: 700, marginTop: 5 }}>هل تعاني من أي مما يلي تزامناً مع حالتك؟</p>
              </div>
              <div className="space-y-2.5 mb-5">
                {RED_FLAGS.map(flag => {
                  const selected = data.redFlags.includes(flag.id);
                  return (
                    <motion.button key={flag.id} whileTap={{ scale: 0.96 }} onClick={() => toggleRedFlag(flag.id)}
                      className="w-full flex items-center gap-3 p-4 rounded-[22px] text-right overflow-hidden"
                      style={selected
                        ? { background: 'rgba(220,38,38,0.08)', border: '1.5px solid rgba(220,38,38,0.28)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.70)' }
                        : { background: 'rgba(255,255,255,0.76)', border: '1.5px solid rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.90)' }}>
                      <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all"
                        style={selected ? { background: '#DC2626', border: '1.5px solid #DC2626' } : { background: 'rgba(255,255,255,0.80)', border: '1.5px solid rgba(220,38,38,0.28)' }}>
                        {selected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex items-center gap-2 flex-1">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: selected ? '#DC2626' : '#f87171' }} />
                        <span style={{ fontSize: 12.5, fontWeight: 850, color: selected ? '#991B1B' : '#0C4A6E' }}>{flag.label}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              {data.hasRedFlags && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-[22px] mb-5"
                  style={{ background: 'rgba(254,226,226,0.88)', border: '1.5px solid rgba(220,38,38,0.22)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.72)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" style={{ color: '#DC2626' }} />
                    <p style={{ fontSize: 12.5, fontWeight: 950, color: '#7F1D1D' }}>تنبيه طارئ</p>
                  </div>
                  <p style={{ fontSize: 11.5, color: '#991B1B', fontWeight: 700, lineHeight: 1.7 }}>الأعراض التي اخترتها قد تكون طارئة. نوصيك بالتوجه لأقرب طوارئ أو الاتصال بالإسعاف الآن.</p>
                </motion.div>
              )}
              <motion.button whileTap={{ scale: 0.97 }} onClick={() => goTo('history')}
                className="w-full h-[54px] rounded-[24px] text-white flex items-center justify-between px-5"
                style={{ background: 'linear-gradient(135deg, #DC2626, #B91C1C)', boxShadow: '0 10px 28px rgba(220,38,38,0.28), inset 0 1.5px 0 rgba(255,255,255,0.22)', fontSize: 14, fontWeight: 950 }}>
                <span>متابعة</span><ArrowLeft className="w-5 h-5 text-white/80" />
              </motion.button>
            </motion.div>
          )}

          {/* HISTORY */}
          {step === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, x: -22 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 22 }} transition={{ type: 'spring', stiffness: 220, damping: 26 }} className="pt-5">
              <div className="mb-5">
                <p style={{ fontSize: 11, fontWeight: 950, color: '#7C3AED', marginBottom: 5 }}>السؤال ٤ من ٤</p>
                <h2 style={{ fontSize: 22, fontWeight: 950, color: '#0C4A6E', lineHeight: 1.35 }}>التاريخ الطبي</h2>
                <p style={{ fontSize: 12, color: '#0369A1', fontWeight: 700, marginTop: 5 }}>تساعدنا هذه المعلومات في التخصيص الأدق</p>
              </div>
              <div className="rounded-[24px] p-4 mb-4" style={{ background: 'rgba(255,255,255,0.84)', border: '1px solid rgba(255,255,255,0.92)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', boxShadow: '0 12px 36px rgba(124,58,237,0.08), inset 0 1.5px 0 rgba(255,255,255,0.96)' }}>
                <p style={{ fontSize: 12, fontWeight: 900, color: '#5B21B6', marginBottom: 10 }}>الأمراض المزمنة المعروفة (اختر ما ينطبق)</p>
                <div className="flex flex-wrap gap-2">
                  {CHRONIC_CONDITIONS.map(c => {
                    const selected = data.chronicConditions.includes(c);
                    return (
                      <motion.button key={c} whileTap={{ scale: 0.92 }} onClick={() => toggleCondition(c)}
                        className="px-3 py-1.5 rounded-[14px] text-[11.5px] font-bold transition-all"
                        style={selected
                          ? { background: 'rgba(124,58,237,0.12)', border: '1.5px solid rgba(124,58,237,0.30)', color: '#5B21B6' }
                          : { background: 'rgba(255,255,255,0.72)', border: '1.5px solid rgba(255,255,255,0.86)', color: '#64748b' }}>
                        {selected && <span style={{ marginLeft: 4 }}>✓</span>}{c}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
              <div className="rounded-[24px] p-4 mb-5" style={{ background: 'rgba(255,255,255,0.84)', border: '1px solid rgba(255,255,255,0.92)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)', boxShadow: '0 12px 36px rgba(8,145,178,0.08), inset 0 1.5px 0 rgba(255,255,255,0.96)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Pill className="w-4 h-4" style={{ color: '#0891B2' }} />
                  <p style={{ fontSize: 12, fontWeight: 900, color: '#0C4A6E' }}>هل تتناول أدوية حالياً؟ (اختياري)</p>
                </div>
                <textarea
                  value={data.medications}
                  onChange={e => setData(d => ({ ...d, medications: e.target.value }))}
                  placeholder="اذكر الأدوية إن وجدت..."
                  rows={2}
                  style={{ width: '100%', fontSize: 13, fontWeight: 700, color: '#0C4A6E', background: 'rgba(255,255,255,0.60)', borderRadius: 14, padding: '10px 14px', border: '1px solid rgba(8,145,178,0.18)', resize: 'none', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleSubmit}
                className="w-full h-[56px] rounded-[24px] text-white flex items-center justify-between px-5 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0891B2, #6366f1)', boxShadow: '0 14px 36px rgba(8,145,178,0.30), inset 0 1.5px 0 rgba(255,255,255,0.24)', fontSize: 14, fontWeight: 950 }}>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-white" />
                  <span>تحليل الحالة بالذكاء الاصطناعي</span>
                </div>
                <ArrowLeft className="w-5 h-5 text-white/80" />
              </motion.button>
            </motion.div>
          )}

          {/* ANALYZING */}
          {step === 'analyzing' && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pt-8">
              <AnalyzingScreen />
            </motion.div>
          )}

          {/* RESULT */}
          {step === 'result' && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-4">
              <ResultCard level={triageLevel} data={data} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
