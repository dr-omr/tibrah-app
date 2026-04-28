// pages/medical-history.tsx
// ════════════════════════════════════════════════════════
// Comprehensive Medical History — SOCRATES + Functional Medicine
// Orchestrator: imports modular sub-components
// ════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, ChevronLeft, CheckCircle, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/db';
import SEO from '@/components/common/SEO';
import { haptic } from '@/lib/HapticFeedback';
import { toast } from 'sonner';

// Modular imports
import { SECTIONS, EMPTY, type MedicalHistory } from '@/components/medical-history/medical-history-types';
import { ProgressHeader, SectionOverlay } from '@/components/medical-history/medical-history-ui';
import {
  PersonalSection, ComplaintSection, PMHSection, MedicationsSection,
  FamilySection, LifestyleSection, ROSSection, GoalsSection,
} from '@/components/medical-history/medical-history-sections';
import { CompletionScreen, generateSummary } from '@/components/medical-history/medical-history-completion';

/* ═══════════════════════════════════════════════
   MAIN PAGE — Orchestrator
   ═══════════════════════════════════════════════ */
export default function MedicalHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentSection, setCurrentSection] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [history, setHistory] = useState<MedicalHistory>(EMPTY);

  // Load draft
  useEffect(() => {
    try {
      const d = localStorage.getItem('tibrah_medical_history');
      if (d) setHistory(JSON.parse(d));
    } catch {}
  }, []);

  // Auto-save
  useEffect(() => {
    const t = setTimeout(() => {
      localStorage.setItem('tibrah_medical_history', JSON.stringify(history));
    }, 800);
    return () => clearTimeout(t);
  }, [history]);

  const update = useCallback((k: keyof MedicalHistory, v: any) => {
    setHistory(h => ({ ...h, [k]: v }));
  }, []);

  const markCompleted = (idx: number) => setCompleted(s => { const n = new Set(s); n.add(idx); return n; });

  const goNext = () => {
    markCompleted(currentSection);
    if (currentSection < SECTIONS.length - 1) {
      setCurrentSection(c => c + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (user?.id) {
        await db.entities.DailyLog.createForUser(user.id, {
          date: new Date().toISOString().split('T')[0],
          notes: generateSummary(history).slice(0, 500),
        });
      }
      const allIdx = new Set(SECTIONS.map((_, i) => i));
      setCompleted(allIdx);
      localStorage.removeItem('tibrah_medical_history');
      toast.success('تم حفظ تاريخك المرضي بالكامل ✓');
      haptic.success();
      setShowCompletion(true);
    } catch (e) {
      toast.error('خطأ في الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem('tibrah_medical_history', JSON.stringify(history));
      markCompleted(currentSection);
      setSaved(true);
      toast.success('تم حفظ هذا القسم ✓');
      haptic.impact();
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const sec = SECTIONS[currentSection];
  const SecIcon = sec.icon;

  const renderSection = () => {
    switch (sec.id) {
      case 'personal':    return <PersonalSection data={history} update={update} />;
      case 'complaint':   return <ComplaintSection data={history} update={update} />;
      case 'pmh':         return <PMHSection data={history} update={update} />;
      case 'medications': return <MedicationsSection data={history} update={update} />;
      case 'family':      return <FamilySection data={history} update={update} />;
      case 'lifestyle':   return <LifestyleSection data={history} update={update} />;
      case 'ros':         return <ROSSection data={history} update={update} />;
      case 'goals':       return <GoalsSection data={history} update={update} />;
      default: return null;
    }
  };

  const isLast = currentSection === SECTIONS.length - 1;
  const allDone = completed.size >= SECTIONS.length - 1;

  // Completion screen
  if (showCompletion) {
    return (
    <div dir="rtl" style={{ minHeight:'100svh', background:'linear-gradient(160deg,#EEF2F5 0%,#F2F5F7 40%,#EBF4F3 100%)', fontFamily:'inherit' }}>
        <SEO title="تاريخك المرضي مكتمل | طِبرَا" />
        <div className="sticky top-0 z-40">
          <div className="flex items-center justify-between h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 shadow-sm border-b border-slate-100 dark:border-slate-800/60">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowCompletion(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800">
              <ArrowRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </motion.button>
            <span className="text-[13px] font-black text-slate-700 dark:text-slate-200">التاريخ المرضي مكتمل</span>
            <div className="w-8" />
          </div>
        </div>
        <CompletionScreen history={history} onBack={() => setShowCompletion(false)} />
      </div>
    );
  }

  return (
    <div dir="rtl" style={{ minHeight:'100svh', background:'linear-gradient(160deg,#EEF2F5 0%,#F2F5F7 40%,#EBF4F3 100%)', fontFamily:'inherit' }}>
      <SEO title="التاريخ المرضي | طِبرَا" />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-8%] right-[-5%] w-64 h-64 rounded-full"
          style={{ background: `radial-gradient(circle, ${sec.color}22 0%, transparent 70%)`, filter: 'blur(50px)', transition: 'background 0.5s' }} />
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40">
        <div className="flex items-center justify-between h-14 px-4" style={{ background:'rgba(242,245,247,0.88)', backdropFilter:'blur(20px) saturate(160%)', WebkitBackdropFilter:'blur(20px) saturate(160%)', borderBottom:'0.5px solid rgba(0,0,0,0.08)' }}>
          <motion.button whileTap={{ scale: 0.9 }}
            onClick={() => currentSection > 0 ? setCurrentSection(c => c - 1) : router.back()}
            style={{ width:36, height:36, borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.72)', backdropFilter:'blur(12px)', border:'1px solid rgba(0,0,0,0.07)', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
            <ArrowRight className="w-4 h-4 text-slate-600" />
          </motion.button>

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ backgroundColor: `${sec.color}20` }}>
              <SecIcon className="w-3 h-3" style={{ color: sec.color }} />
            </div>
            <span className="text-[13px] font-black text-slate-700 dark:text-slate-200">{sec.label}</span>
          </div>

          <div className="flex items-center gap-2">
            {saved && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="w-7 h-7 rounded-full flex items-center justify-center bg-teal-50">
                <Check className="w-3.5 h-3.5 text-teal-500" />
              </motion.div>
            )}
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setShowOverlay(true)}
              style={{ width:36, height:36, borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.72)', backdropFilter:'blur(12px)', border:'1px solid rgba(0,0,0,0.07)', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
              <span className="text-[11px] font-black text-slate-500">{currentSection + 1}/{SECTIONS.length}</span>
            </motion.button>
          </div>
        </div>
        <ProgressHeader current={currentSection + 1} total={SECTIONS.length}
          sectionLabel={sec.label} color={sec.color}
          onSectionClick={() => setShowOverlay(true)} />
      </div>

      {/* Section label */}
      <div className="px-4 pt-5 pb-2 max-w-md mx-auto">
        <motion.div key={sec.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${sec.color}20` }}>
              <SecIcon className="w-3.5 h-3.5" style={{ color: sec.color }} />
            </div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: sec.color }}>
              القسم {currentSection + 1} من {SECTIONS.length}
            </span>
          </div>
          <h1 className="text-[20px] font-black text-slate-800 dark:text-white">{sec.label}</h1>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">{sec.desc}</p>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-4 pb-36 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div key={sec.id}
            initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}>
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom actions */}
      <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:30, padding:'12px 16px', paddingBottom:'max(env(safe-area-inset-bottom),24px)', background:'linear-gradient(to top, rgba(242,245,247,1) 60%, rgba(242,245,247,0) 100%)' }}>
        <div className="flex gap-2.5">
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleQuickSave} disabled={saving}
          style={{ width:48, height:48, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.82)', backdropFilter:'blur(12px)', border:'1px solid rgba(0,0,0,0.08)', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', flexShrink:0 }}>
            {saving ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-teal-500" />
              : saved ? <Check className="w-4 h-4 text-teal-500" /> : <Save className="w-4 h-4 text-slate-500" />}
          </motion.button>

          <motion.button whileTap={{ scale: 0.97 }} onClick={isLast ? handleSave : goNext}
            className="flex-1 h-12 rounded-2xl text-white text-[14px] font-black flex items-center justify-between px-5 relative overflow-hidden"
            style={{ background: `linear-gradient(135deg, ${sec.color}, ${sec.color}cc)`, boxShadow: `0 6px 20px ${sec.color}35` }}>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/8 to-white/0" />
            <span>{isLast ? (allDone ? 'حفظ التاريخ المرضي كاملاً ✓' : 'حفظ وإنهاء') : 'التالي'}</span>
            {!isLast && <ChevronLeft className="w-5 h-5 text-white/80" />}
            {isLast && <CheckCircle className="w-5 h-5 text-white/80" />}
          </motion.button>
        </div>

        <div className="flex gap-1 justify-center mt-3">
          {SECTIONS.map((_, i) => (
            <motion.div key={i} animate={{ width: i === currentSection ? 20 : 6, opacity: i <= currentSection ? 1 : 0.3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={() => setCurrentSection(i)}
              className="h-1.5 rounded-full cursor-pointer"
              style={{ backgroundColor: i <= currentSection ? sec.color : '#e2e8f0' }} />
          ))}
        </div>
      </div>

      {/* Section overlay */}
      <AnimatePresence>
        {showOverlay && (
          <SectionOverlay current={currentSection} completed={completed}
            onSelect={setCurrentSection} onClose={() => setShowOverlay(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
