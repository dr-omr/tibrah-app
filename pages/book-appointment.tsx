// pages/book-appointment.tsx
// ════════════════════════════════════════════════════════
// TIBRAH — Premium Native Booking v5 "Apple-tier" — Orchestrator
// ════════════════════════════════════════════════════════

'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/components/notification-engine';
import { useAuth } from '@/contexts/AuthContext';
import { haptic } from '@/lib/HapticFeedback';
import { createPageUrl } from '@/utils';
import SEO from '@/components/common/SEO';

// Modular imports
import { SESSIONS, STEP_LABELS, EMPTY_FORM, type BookingForm } from '@/components/booking/booking-data';
import { StepSession, StepDateTime, StepInfo, StepSuccess } from '@/components/booking/booking-steps';

export default function BookAppointment() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<BookingForm>(EMPTY_FORM);

  useEffect(() => {
    if (user) setForm(p => ({
      ...p,
      patient_name: user.displayName || (user as any).name || p.patient_name,
      patient_email: user.email || p.patient_email,
      patient_phone: (user as any).phone || p.patient_phone,
    }));
  }, [user]);

  useEffect(() => {
    if (!router.isReady) return;
    let concern = '';
    if (router.query.symptom) concern += `الأعراض: ${router.query.symptom}\n`;
    if (router.query.complaint) concern += `الشكوى: ${router.query.complaint}\n`;
    if (concern) setForm(p => ({ ...p, health_concern: concern }));
  }, [router.isReady, router.query]);

  const mutation = useMutation({
    mutationFn: async (data: BookingForm) => {
      const session = SESSIONS.find(s => s.id === data.session_type);
      const payload = {
        ...data, date: data.date ? format(data.date, 'yyyy-MM-dd') : '',
        session_type_label: session?.label || '', status: 'pending', user_id: user?.id || 'guest',
      };
      if (user?.id) { try { await db.entities.Appointment.createForUser(user.id, payload); } catch {} }
      await fetch('/api/webhooks/booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    },
    onSuccess: () => { haptic.success(); toast.success('تم استلام طلب الحجز! 🎉'); setStep(3); },
    onError: () => toast.error('حدث خطأ. حاول مرة أخرى.'),
  });

  const handleSubmit = () => {
    if (!form.patient_name.trim() || !form.patient_phone.trim()) { toast.error('يرجى إدخال اسمك ورقم جوالك'); return; }
    mutation.mutate(form);
  };

  const goBack = () => { setStep(s => s - 1); haptic.selection(); };

  return (
    <div className="min-h-screen bg-[#F0FAF8]" dir="rtl">
      <SEO title="احجز جلستك — طِبرَا" description="احجز جلسة مع د. عمر العماد" />

      <div className="pointer-events-none fixed inset-x-0 top-0 h-80"
        style={{ background: 'radial-gradient(ellipse at 50% -20%, rgba(13,148,136,0.15) 0%, transparent 65%)' }} />

      {/* Header */}
      <motion.div className="sticky top-0 z-40 px-4" style={{ background: 'rgba(240,250,248,0.85)', backdropFilter: 'blur(24px)' }}>
        <div className="flex items-center gap-3 py-3">
          <AnimatePresence mode="wait">
            {step === 0 ? (
              <motion.div key="home-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Link href={createPageUrl('Home')}>
                  <motion.button whileTap={{ scale: 0.88 }} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.06)' }}>
                    <ArrowRight className="w-4 h-4 text-slate-600" />
                  </motion.button>
                </Link>
              </motion.div>
            ) : step < 3 ? (
              <motion.button key="back-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                whileTap={{ scale: 0.88 }} onClick={goBack} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.06)' }}>
                <ArrowRight className="w-4 h-4 text-slate-600" />
              </motion.button>
            ) : null}
          </AnimatePresence>
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.p key={`title-${step}`} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.18 }} className="text-[17px] font-black text-slate-800">
                {step === 3 ? 'تم الحجز ✓' : 'احجز جلستك'}
              </motion.p>
            </AnimatePresence>
            {step < 3 && <p className="text-[11px] text-slate-400 font-medium">مع د. عمر العماد</p>}
          </div>
          {step < 3 && (
            <motion.div key={step} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="text-[11px] font-black px-2.5 py-1 rounded-full" style={{ background: 'rgba(13,148,136,0.1)', color: '#0d9488' }}>
              {step + 1} / {STEP_LABELS.length}
            </motion.div>
          )}
        </div>
        {step < 3 && (
          <div className="flex gap-1.5 pb-2">
            {STEP_LABELS.map((_, i) => (
              <div key={i} className="flex-1 h-[3px] rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
                <motion.div className="h-full rounded-full" style={{ background: '#0d9488' }}
                  initial={{ width: 0 }} animate={{ width: i < step ? '100%' : i === step ? '60%' : '0%' }}
                  transition={{ duration: 0.4, ease: 'easeOut' }} />
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Steps */}
      <div className="px-4 pt-4 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {step === 0 && <StepSession key="s0" selected={form.session_type} onSelect={id => setForm(p => ({ ...p, session_type: id }))} onNext={() => setStep(1)} />}
          {step === 1 && <StepDateTime key="s1" form={form} setForm={setForm} onNext={() => setStep(2)} />}
          {step === 2 && <StepInfo key="s2" form={form} setForm={setForm} onSubmit={handleSubmit} isLoading={mutation.isPending} />}
          {step === 3 && <StepSuccess key="s3" form={form} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
