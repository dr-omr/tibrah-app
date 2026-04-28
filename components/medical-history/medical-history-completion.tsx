// components/medical-history/medical-history-completion.tsx
// ════════════════════════════════════════════════════════
// Summary Generator + Completion Screen for Medical History
// ════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  CheckCircle, Sparkles, HeartPulse, ArrowRight,
  MessageCircle, Share2, Copy, Check, ExternalLink,
} from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import type { MedicalHistory } from './medical-history-types';
import { SECTIONS } from './medical-history-types';

const DOCTOR_WHATSAPP = '967771447111';

/* ─── Summary Generator ─────────────────────── */
export function generateSummary(h: MedicalHistory): string {
  const lines: string[] = [];
  lines.push('📋 *التاريخ المرضي — طِبرَا*');
  lines.push(`📅 التاريخ: ${new Date().toLocaleDateString('ar-SA')}`);
  lines.push('');

  if (h.birthYear || h.gender || h.occupation) {
    lines.push('👤 *البيانات الشخصية*');
    if (h.birthYear) lines.push(`• المولد: ${h.birthYear}`);
    if (h.gender) lines.push(`• الجنس: ${h.gender}`);
    if (h.maritalStatus) lines.push(`• الحالة: ${h.maritalStatus}`);
    if (h.occupation) lines.push(`• المهنة: ${h.occupation}`);
    lines.push('');
  }

  if (h.site || h.character.length || h.severity) {
    lines.push('🩺 *الشكوى الحالية (SOCRATES)*');
    if (h.site) lines.push(`• الموقع: ${h.site}`);
    if (h.onset) lines.push(`• البداية: ${h.onset}${h.onsetDate ? ' (' + h.onsetDate + ')' : ''}`);
    if (h.character.length) lines.push(`• الطبيعة: ${h.character.join('، ')}`);
    if (h.radiation) lines.push(`• الانتشار: ${h.radiation}`);
    if (h.associatedSymptoms.length) lines.push(`• أعراض مصاحبة: ${h.associatedSymptoms.join('، ')}`);
    if (h.timing) lines.push(`• التوقيت: ${h.timing}`);
    if (h.exacerbating.length) lines.push(`• محرضات: ${h.exacerbating.join('، ')}`);
    if (h.relieving.length) lines.push(`• مخففات: ${h.relieving.join('، ')}`);
    lines.push(`• الحدة: ${h.severity}/10`);
    lines.push('');
  }

  if (h.chronicDiseases.length || h.previousSurgeries) {
    lines.push('📁 *التاريخ الطبي*');
    if (h.chronicDiseases.length) lines.push(`• أمراض مزمنة: ${h.chronicDiseases.join('، ')}`);
    if (h.previousSurgeries) lines.push(`• عمليات: ${h.previousSurgeries}`);
    if (h.hospitalizations) lines.push(`• مستشفيات: ${h.hospitalizations}`);
    lines.push('');
  }

  if (h.currentMeds.length || h.allergies.length) {
    lines.push('💊 *الأدوية والحساسية*');
    h.currentMeds.forEach(m => lines.push(`• ${m.name} ${m.dose} (منذ ${m.since})`));
    if (h.supplements) lines.push(`• مكملات: ${h.supplements}`);
    if (h.allergies.length) lines.push(`• حساسية: ${h.allergies.join('، ')}`);
    lines.push('');
  }

  const famLines = Object.entries(h.familyDiseases).filter(([, v]) => v.length > 0);
  if (famLines.length) {
    lines.push('👨‍👩‍👧 *التاريخ العائلي*');
    famLines.forEach(([member, diseases]) => lines.push(`• ال${member}: ${diseases.join('، ')}`) );
    lines.push('');
  }

  if (h.diet || h.exercise || h.sleepHours) {
    lines.push('🌿 *النمط الحياتي*');
    if (h.diet) lines.push(`• النظام الغذائي: ${h.diet}`);
    if (h.exercise) lines.push(`• التمرين: ${h.exercise}`);
    if (h.sleepHours) lines.push(`• النوم: ${h.sleepHours} — ${h.sleepQuality}`);
    if (h.smoking && h.smoking !== 'لا أدخن') lines.push(`• التدخين: ${h.smoking}`);
    lines.push(`• مستوى التوتر: ${h.stressLevel}/10`);
    lines.push('');
  }

  const rosLines = Object.entries(h.rosPositive).filter(([, v]) => v.length > 0);
  if (rosLines.length) {
    lines.push('🔍 *مراجعة الأجهزة (الأعراض الإيجابية)*');
    rosLines.forEach(([sys, syms]) => lines.push(`• ${sys}: ${syms.join('، ')}`) );
    lines.push('');
  }

  if (h.mainGoal || h.specificGoals.length) {
    lines.push('🎯 *الأهداف*');
    if (h.mainGoal) lines.push(`• الهدف الرئيسي: ${h.mainGoal}`);
    if (h.specificGoals.length) lines.push(`• أهداف: ${h.specificGoals.join('، ')}`);
    if (h.timeframe) lines.push(`• الإطار: ${h.timeframe}`);
    lines.push('');
  }

  if (h.additionalNotes) {
    lines.push('📝 *ملاحظات إضافية*');
    lines.push(h.additionalNotes);
    lines.push('');
  }

  lines.push('—');
  lines.push('أُرسل عبر تطبيق طِبرَا الصحي');
  return lines.join('\n');
}

/* ─── Completion Screen ──────────────────────── */
export function CompletionScreen({ history, onBack }: { history: MedicalHistory; onBack: () => void }) {
  const [copied, setCopied] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState(false);

  const summary = generateSummary(history);
  const waText = encodeURIComponent(summary);
  const waUrl = `https://wa.me/${DOCTOR_WHATSAPP}?text=${waText}`;

  // Auto-fetch AI analysis on mount
  useEffect(() => {
    const fetchAI = async () => {
      setAiLoading(true);
      setAiError(false);
      try {
        const prompt = `أنت محلل طبي وظيفي. قدّم تحليلاً سريرياً موجزاً ودقيقاً لهذا التاريخ المرضي بأسلوب دافئ ومهني.\n\nالتاريخ المرضي الكامل:\n${summary}\n\nأريد منك:\n1. 🔍 الأنماط الصحية الملحوظة (2-3 نقاط)\n2. 🌱 الأسباب الجذرية المحتملة (2 نقاط)\n3. ✅ أولويات الإجراء الفوري (3 نقاط عملية)\n4. 🩺 الفحوصات المقترحة إن لزم (نقطة واحدة)\n\nكن موجزاً ومحدداً. لا تتجاوز 200 كلمة. استخدم لغة عربية واضحة.`;

        const res = await fetch('/api/chat-gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: prompt }),
        });

        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (data.text) { setAiAnalysis(data.text); } else { setAiError(true); }
      } catch { setAiError(true); }
      finally { setAiLoading(false); }
    };
    fetchAI();
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      haptic.success();
    } catch { haptic.error(); }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'تاريخي المرضي — طِبرَا', text: summary }); haptic.impact(); }
      catch { }
    } else { handleCopy(); }
  };

  const sections = SECTIONS.length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="px-4 pb-28 max-w-md mx-auto pt-6"
    >
      {/* Success badge */}
      <div className="flex flex-col items-center mb-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
          className="w-20 h-20 rounded-[28px] flex items-center justify-center mb-4 relative"
          style={{ background: 'linear-gradient(135deg, #0d9488, #6366f1)' }}>
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute inset-0 rounded-[28px]"
            style={{ background: 'linear-gradient(135deg, #0d9488, #6366f1)', filter: 'blur(12px)' }} />
          <CheckCircle className="w-10 h-10 text-white relative z-10" />
        </motion.div>
        <h1 className="text-[22px] font-black text-slate-800 dark:text-white text-center">تاريخك المرضي مكتمل</h1>
        <p className="text-[12.5px] text-slate-500 dark:text-slate-400 font-medium text-center mt-1">
          {sections} أقسام مكتملة — تم الحفظ في ملفك الطبي
        </p>
      </div>

      {/* AI Analysis Card */}
      <div className="mb-5">
        <div className="rounded-[22px] overflow-hidden border shadow-sm"
          style={{ borderColor: aiLoading ? '#e2e8f0' : aiError ? '#fecaca' : 'rgba(99,102,241,0.2)',
                   backgroundColor: aiLoading ? '#f8fafc' : aiError ? '#fff5f5' : 'rgba(99,102,241,0.04)' }}>
          <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 border-b"
            style={{ borderColor: aiLoading ? '#f1f5f9' : aiError ? '#fecaca' : 'rgba(99,102,241,0.12)' }}>
            <motion.div
              animate={aiLoading ? { rotate: 360 } : { rotate: 0 }}
              transition={aiLoading ? { duration: 2, repeat: Infinity, ease: 'linear' } : {}}
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: aiError ? '#fee2e2' : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Sparkles className="w-4 h-4" style={{ color: aiError ? '#ef4444' : '#fff' }} />
            </motion.div>
            <div>
              <p className="text-[12.5px] font-black text-slate-700 dark:text-slate-200">تحليل ذكاء طِبرَا الاصطناعي</p>
              <p className="text-[10px] font-bold text-slate-400">
                {aiLoading ? 'يحلل تاريخك المرضي...' : aiError ? 'تعذّر التحليل' : 'تحليل وظيفي مخصص'}
              </p>
            </div>
            {!aiLoading && !aiError && (
              <span className="mr-auto text-[9px] font-extrabold px-2 py-1 rounded-full text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>AI</span>
            )}
          </div>
          <div className="px-4 py-4">
            {aiLoading ? (
              <div className="space-y-2.5">
                {[80, 65, 90, 55, 75].map((w, i) => (
                  <motion.div key={i}
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
                    className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700"
                    style={{ width: `${w}%` }} />
                ))}
                <p className="text-center text-[11px] text-slate-400 font-medium pt-1">جاري التحليل العميق...</p>
              </div>
            ) : aiError ? (
              <p className="text-[12px] text-red-400 font-medium text-center py-2">
                ⚠️ تعذّر التحليل — تحقق من الاتصال
              </p>
            ) : (
              <p className="text-[12px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed whitespace-pre-line">
                {aiAnalysis}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label: 'الأقسام', value: `${sections}`, icon: '📋' },
          { label: 'محفوظ آمن', value: '✓', icon: '🔒' },
          { label: 'جاهز للطبيب', value: '✓', icon: '👨‍⚕️' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/60 text-center">
            <p className="text-[18px] mb-0.5">{s.icon}</p>
            <p className="text-[14px] font-black text-slate-700 dark:text-slate-200">{s.value}</p>
            <p className="text-[9.5px] font-bold text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Sharing section */}
      <div className="bg-white dark:bg-slate-800/60 rounded-[22px] border border-slate-100 dark:border-slate-700/60 shadow-sm overflow-hidden mb-4">
        <div className="px-4 pt-4 pb-3 border-b border-slate-50 dark:border-slate-700/40">
          <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">إرسال ومشاركة</p>
          <p className="text-[12px] text-slate-500 font-medium mt-0.5">أرسل تاريخك للطبيب أو احتفظ بنسخة</p>
        </div>

        <a href={waUrl} target="_blank" rel="noopener noreferrer">
          <motion.div whileTap={{ scale: 0.97 }}
            className="flex items-center gap-3 px-4 py-3.5 cursor-pointer"
            style={{ backgroundColor: 'rgba(37,211,102,0.06)' }}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}>
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[13.5px] font-black text-slate-700 dark:text-slate-200">أرسل للطبيب عبر واتساب</p>
              <p className="text-[10.5px] text-slate-400 font-medium">يفتح واتساب مباشرة مع الملخص كاملاً</p>
            </div>
            <ExternalLink className="w-4 h-4 text-green-400" />
          </motion.div>
        </a>

        <div className="h-[1px] bg-slate-50 dark:bg-slate-700/40 mx-4" />

        <motion.div whileTap={{ scale: 0.97 }} onClick={handleNativeShare}
          className="flex items-center gap-3 px-4 py-3.5 cursor-pointer">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[13.5px] font-black text-slate-700 dark:text-slate-200">مشاركة (إنستغرام، تيليغرام...)</p>
            <p className="text-[10.5px] text-slate-400 font-medium">يفتح قائمة التطبيقات على جهازك</p>
          </div>
          <Share2 className="w-4 h-4 text-indigo-400" />
        </motion.div>

        <div className="h-[1px] bg-slate-50 dark:bg-slate-700/40 mx-4" />

        <motion.div whileTap={{ scale: 0.97 }} onClick={handleCopy}
          className="flex items-center gap-3 px-4 py-3.5 cursor-pointer">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: copied ? 'rgba(13,148,136,0.15)' : '#f1f5f9' }}>
            {copied ? <Check className="w-5 h-5 text-teal-500" /> : <Copy className="w-5 h-5 text-slate-400" />}
          </div>
          <div className="flex-1">
            <p className="text-[13.5px] font-black text-slate-700 dark:text-slate-200">
              {copied ? 'تم النسخ ✓' : 'نسخ النص للحافظة'}
            </p>
            <p className="text-[10.5px] text-slate-400 font-medium">الصقه في أي تطبيق تريده</p>
          </div>
        </motion.div>
      </div>

      {/* Preview box */}
      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/60 mb-5">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">معاينة الملخص</p>
        <p className="text-[11px] text-slate-500 font-medium leading-relaxed" style={{ whiteSpace: 'pre-line', maxHeight: 160, overflow: 'hidden' }}>
          {summary.slice(0, 280)}{summary.length > 280 ? '...' : ''}
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-2.5">
        <Link href="/my-care">
          <motion.div whileTap={{ scale: 0.97 }}
            className="w-full h-[50px] rounded-2xl flex items-center justify-between px-5 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #0d9488, #0f766e)', boxShadow: '0 6px 20px rgba(13,148,136,0.25)' }}>
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-white" />
              <span className="text-[13.5px] font-black text-white">انتقل لرعايتي</span>
            </div>
            <ArrowRight className="w-4 h-4 text-white/70 rotate-180" />
          </motion.div>
        </Link>
        <motion.button whileTap={{ scale: 0.97 }} onClick={onBack}
          className="w-full h-[42px] rounded-xl border border-slate-100 dark:border-slate-700/60 text-[12.5px] font-bold text-slate-500 dark:text-slate-400">
          تعديل التاريخ المرضي
        </motion.button>
      </div>
    </motion.div>
  );
}
