// components/booking/booking-steps.tsx
// ════════════════════════════════════════════════════════
// Step components + shared UI for Booking flow
// ════════════════════════════════════════════════════════

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Check, ArrowRight, MessageCircle, Instagram, Music2, Lock, Sparkles } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { createPageUrl } from '@/utils';
import {
  SESSIONS, TIMES, getAvailableDays, SPRING_SNAPPY, SPRING_SMOOTH,
  DR_PHONE, DR_PHOTO, DR_IG, DR_TT,
  type BookingForm,
} from './booking-data';

/* ─── Confetti ───────────────────────────────── */
export function Confetti() {
  const colors = ['#0d9488','#10b981','#f59e0b','#6366f1','#ec4899','#f97316'];
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(28)].map((_, i) => (
        <motion.div key={i} className="absolute w-2.5 h-2.5 rounded-sm"
          style={{ left: `${Math.random() * 100}%`, top: '-10px', background: colors[i % colors.length], rotate: Math.random() * 360 }}
          animate={{ y: ['0vh', '110vh'], x: [0, (Math.random() - 0.5) * 200], rotate: [0, Math.random() * 720 - 360], opacity: [1, 1, 0] }}
          transition={{ duration: 2.2 + Math.random() * 1.2, delay: Math.random() * 0.8, ease: 'easeIn' }} />
      ))}
    </div>
  );
}

/* ─── ShimmerCard ────────────────────────────── */
export function ShimmerCard({ active, color, children, onClick }: { active: boolean; color: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.975 }} onClick={onClick}
      className="w-full relative overflow-hidden rounded-[22px] text-right transition-all"
      style={{
        background: active ? `${color}0F` : 'rgba(255,255,255,0.94)',
        border: `2px solid ${active ? color : 'rgba(0,0,0,0)'}`,
        boxShadow: active ? `0 8px 28px ${color}25, 0 1px 0 rgba(255,255,255,0.8) inset` : '0 2px 10px rgba(0,0,0,0.055), 0 1px 0 rgba(255,255,255,0.9) inset',
      }}>
      {active && (
        <motion.div className="absolute inset-y-0 w-1/3 skew-x-[-20deg]" style={{ background: `linear-gradient(90deg,transparent,${color}18,transparent)` }}
          animate={{ left: ['-40%', '140%'] }} transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }} />
      )}
      {children}
    </motion.button>
  );
}

/* ─── FloatInput ─────────────────────────────── */
export function FloatInput({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || !!value;
  return (
    <div className="relative">
      <div className="relative rounded-[16px] transition-all overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.95)', border: `1.5px solid ${focused ? '#0d9488' : 'rgba(0,0,0,0.08)'}`, boxShadow: focused ? '0 0 0 3px rgba(13,148,136,0.1)' : '0 2px 6px rgba(0,0,0,0.04)' }}>
        <label className="absolute right-4 pointer-events-none font-bold transition-all duration-200"
          style={{ top: lifted ? '8px' : '50%', transform: lifted ? 'none' : 'translateY(-50%)', fontSize: lifted ? '10px' : '14px', color: lifted ? (focused ? '#0d9488' : '#94a3b8') : '#94a3b8' }}>{label}</label>
        <input type={type} value={value} placeholder={focused ? placeholder : ''} onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          className="w-full px-4 pb-3 pt-6 text-[14px] font-medium outline-none bg-transparent" style={{ color: '#0f172a' }} />
      </div>
    </div>
  );
}

/* ─── BottomCTA ──────────────────────────────── */
export function BottomCTA({ label, sublabel, disabled, loading, onClick }: {
  label: string; sublabel?: string; disabled?: boolean; loading?: boolean; onClick: () => void;
}) {
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 px-5 pb-8 pt-4" style={{ background: 'linear-gradient(to top, #F0FAF8 65%, rgba(240,250,248,0))' }}>
      <motion.button whileTap={disabled ? {} : { scale: 0.97 }} onClick={() => { if (!disabled && !loading) onClick(); }}
        className="w-full rounded-[18px] flex flex-col items-center justify-center transition-all"
        style={{
          height: sublabel ? 60 : 54,
          background: disabled ? 'rgba(0,0,0,0.08)' : 'linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #0d9488 100%)',
          backgroundSize: '200% 100%', boxShadow: disabled ? 'none' : '0 10px 32px rgba(13,148,136,0.4)', color: disabled ? '#94a3b8' : '#fff',
        }}
        animate={!disabled ? { backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] } : {}} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
        {loading ? (
          <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />
        ) : (<><span className="text-[15px] font-black leading-tight">{label}</span>{sublabel && <span className="text-[10px] font-medium opacity-70 mt-0.5">{sublabel}</span>}</>)}
      </motion.button>
    </div>
  );
}

/* ─── StepSession ────────────────────────────── */
export function StepSession({ selected, onSelect, onNext }: { selected: string; onSelect: (id: string) => void; onNext: () => void }) {
  return (
    <motion.div key="step-session" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }} transition={SPRING_SMOOTH} className="pb-28">
      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-[13px] font-bold text-slate-400 mb-5">ما الجلسة التي تحتاجها؟</motion.p>
      <div className="space-y-3">
        {SESSIONS.map((s, i) => {
          const active = selected === s.id;
          return (
            <motion.div key={s.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING_SMOOTH, delay: i * 0.07 }}>
              <ShimmerCard active={active} color={s.color} onClick={() => { onSelect(s.id); haptic.selection(); }}>
                <div className="flex items-center gap-4 px-4 py-4">
                  <motion.div className="w-[52px] h-[52px] rounded-[16px] flex items-center justify-center flex-shrink-0 text-[26px]"
                    style={{ background: `${s.color}14` }} animate={active ? { scale: [1, 1.06, 1] } : { scale: 1 }} transition={{ duration: 0.5 }}>{s.emoji}</motion.div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[14px] font-black text-slate-800 leading-tight">{s.label}</p>
                      {s.badge && (<motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={SPRING_SNAPPY} className="flex-shrink-0 text-[9px] font-black text-white px-2 py-0.5 rounded-full" style={{ background: s.color }}>{s.badge}</motion.span>)}
                    </div>
                    <p className="text-[11.5px] text-slate-400 leading-snug">{s.tagline}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[15px] font-black" style={{ color: s.color }}>{s.price}</span>
                      {s.original && <span className="text-[11px] text-slate-300 line-through">{s.original}</span>}
                      <span className="text-[11px] text-slate-300">· {s.duration}</span>
                    </div>
                  </div>
                  <motion.div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center"
                    style={{ background: active ? s.color : 'rgba(0,0,0,0.06)' }} animate={{ scale: active ? [1, 1.2, 1] : 1 }} transition={{ duration: 0.35 }}>
                    <AnimatePresence>{active && (<motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={SPRING_SNAPPY}><Check className="w-3.5 h-3.5 text-white" strokeWidth={3} /></motion.div>)}</AnimatePresence>
                  </motion.div>
                </div>
              </ShimmerCard>
            </motion.div>
          );
        })}
      </div>
      <BottomCTA label={selected ? 'التالي — اختر الموعد' : 'اختر جلسة للمتابعة'} disabled={!selected} onClick={() => { haptic.impact(); onNext(); }} />
    </motion.div>
  );
}

/* ─── StepDateTime ───────────────────────────── */
export function StepDateTime({ form, setForm, onNext }: { form: BookingForm; setForm: any; onNext: () => void }) {
  const days = getAvailableDays();
  const AR_DOW = ['أح','إث','ثل','أر','خم'];
  const canNext = !!form.date && !!form.time_slot;
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div key="step-dt" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }} transition={SPRING_SMOOTH} className="pb-28">
      <p className="text-[13px] font-bold text-slate-400 mb-3">اختر اليوم</p>
      <div ref={scrollRef} className="flex gap-2.5 overflow-x-auto pb-3 mb-6 snap-x snap-mandatory" style={{ scrollbarWidth: 'none' }}>
        {days.map((d, i) => {
          const active = form.date && format(form.date, 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd');
          return (
            <motion.button key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.92 }} onClick={() => { setForm((p: any) => ({ ...p, date: d })); haptic.selection(); }}
              className="flex flex-col items-center py-3 px-3.5 rounded-[18px] flex-shrink-0 min-w-[64px] snap-start transition-all"
              style={{ background: active ? '#0d9488' : 'rgba(255,255,255,0.94)', boxShadow: active ? '0 8px 20px rgba(13,148,136,0.35)' : '0 2px 8px rgba(0,0,0,0.05)' }}>
              <span className={`text-[10px] font-bold ${active ? 'text-white/70' : 'text-slate-400'}`}>{AR_DOW[d.getDay()]}</span>
              <span className={`text-[24px] font-black leading-tight ${active ? 'text-white' : 'text-slate-800'}`}>{d.getDate()}</span>
              <span className={`text-[9px] mt-0.5 ${active ? 'text-white/60' : 'text-slate-400'}`}>{format(d, 'MMM', { locale: ar })}</span>
              {active && <motion.div className="w-1.5 h-1.5 rounded-full bg-white mt-1.5" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />}
            </motion.button>
          );
        })}
      </div>
      <p className="text-[13px] font-bold text-slate-400 mb-3">اختر الوقت</p>
      <div className="grid grid-cols-3 gap-2.5">
        {TIMES.map((slot, i) => {
          if (!slot) return <div key={i} className="col-span-3 h-px my-1" style={{ background: 'rgba(0,0,0,0.05)' }} />;
          const active = form.time_slot === slot;
          return (
            <motion.button key={slot} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
              whileTap={{ scale: 0.91 }} onClick={() => { setForm((p: any) => ({ ...p, time_slot: slot })); haptic.selection(); }}
              className="py-3.5 rounded-[14px] text-[13px] font-bold transition-all relative overflow-hidden"
              style={{ background: active ? '#0d9488' : 'rgba(255,255,255,0.94)', color: active ? '#fff' : '#334155', boxShadow: active ? '0 6px 16px rgba(13,148,136,0.3)' : '0 1px 4px rgba(0,0,0,0.05)' }}>
              {active && <motion.div className="absolute inset-0 bg-white/10" initial={{ opacity: 0 }} animate={{ opacity: [0, 0.4, 0] }} transition={{ duration: 0.5 }} />}
              {slot}
            </motion.button>
          );
        })}
      </div>
      <AnimatePresence>
        {canNext && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-5 flex items-center gap-2.5 px-4 py-3 rounded-[14px]" style={{ background: 'rgba(13,148,136,0.07)', border: '1px solid rgba(13,148,136,0.14)' }}>
            <span className="text-[18px]">📅</span>
            <p className="text-[12.5px] font-bold text-teal-700">{format(form.date!, 'EEEE d MMMM', { locale: ar })} · {form.time_slot}</p>
            <Check className="w-4 h-4 text-teal-500 mr-auto flex-shrink-0" strokeWidth={2.5} />
          </motion.div>
        )}
      </AnimatePresence>
      <BottomCTA label="التالي — بياناتك" disabled={!canNext} onClick={() => { haptic.impact(); onNext(); }} />
    </motion.div>
  );
}

/* ─── StepInfo ───────────────────────────────── */
export function StepInfo({ form, setForm, onSubmit, isLoading }: { form: BookingForm; setForm: any; onSubmit: () => void; isLoading: boolean }) {
  const session = SESSIONS.find(s => s.id === form.session_type);
  const canBook = !!form.patient_name?.trim() && !!form.patient_phone?.trim();
  return (
    <motion.div key="step-info" initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -32 }} transition={SPRING_SMOOTH} className="pb-28">
      {session && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-4 py-3.5 rounded-[18px] mb-5" style={{ background: `${session.color}0D`, border: `1.5px solid ${session.color}22` }}>
          <span className="text-[22px]">{session.emoji}</span>
          <div className="flex-1"><p className="text-[13px] font-black text-slate-700">{session.label}</p><p className="text-[11px] text-slate-400">{form.date ? format(form.date, 'd MMM', { locale: ar }) : ''} · {form.time_slot}</p></div>
          <div className="text-right"><p className="text-[16px] font-black" style={{ color: session.color }}>{session.price}</p><p className="text-[10px] text-slate-400">{session.duration}</p></div>
        </motion.div>
      )}
      <p className="text-[13px] font-bold text-slate-400 mb-4">بياناتك</p>
      <div className="space-y-3.5">
        <FloatInput label="الاسم الكامل *" value={form.patient_name || ''} onChange={v => setForm((p: any) => ({ ...p, patient_name: v }))} placeholder="أحمد محمد العمري" />
        <FloatInput label="رقم الجوال (واتساب) *" value={form.patient_phone || ''} onChange={v => setForm((p: any) => ({ ...p, patient_phone: v }))} type="tel" placeholder="+967 7XX XXX XXX" />
        <FloatInput label="البريد الإلكتروني" value={form.patient_email || ''} onChange={v => setForm((p: any) => ({ ...p, patient_email: v }))} type="email" placeholder="اختياري" />
        <div className="relative">
          <div className="rounded-[16px] transition-all overflow-hidden" style={{ background: 'rgba(255,255,255,0.95)', border: '1.5px solid rgba(0,0,0,0.08)' }}>
            <p className="absolute top-3 right-4 text-[10px] font-bold text-slate-400 pointer-events-none">شكواك الصحية</p>
            <textarea rows={3} value={form.health_concern || ''} onChange={e => setForm((p: any) => ({ ...p, health_concern: e.target.value }))}
              placeholder="اكتب باختصار ما تعاني منه..."
              className="w-full px-4 pb-3 pt-7 text-[14px] font-medium outline-none resize-none bg-transparent" style={{ color: '#0f172a' }}
              onFocus={e => { (e.target.parentElement as any).style.borderColor = '#0d9488'; (e.target.parentElement as any).style.boxShadow = '0 0 0 3px rgba(13,148,136,0.1)'; }}
              onBlur={e => { (e.target.parentElement as any).style.borderColor = 'rgba(0,0,0,0.08)'; (e.target.parentElement as any).style.boxShadow = 'none'; }} />
          </div>
        </div>
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="flex items-center gap-2 mt-4 px-4 py-2.5 rounded-[12px]" style={{ background: 'rgba(0,0,0,0.03)' }}>
        <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /><p className="text-[11px] text-slate-400 font-medium">بياناتك محمية ومشفرة ١٠٠٪ · لن نشاركها مع أحد</p>
      </motion.div>
      <BottomCTA label="أكد الحجز" sublabel={session ? `${session.label} · ${session.price}` : undefined} disabled={!canBook} loading={isLoading} onClick={onSubmit} />
    </motion.div>
  );
}

/* ─── StepSuccess ────────────────────────────── */
export function StepSuccess({ form }: { form: BookingForm }) {
  const session = SESSIONS.find(s => s.id === form.session_type);
  const dateStr = form.date ? format(form.date, 'EEEE d MMMM', { locale: ar }) : '';
  const waMsg = `مرحباً د. عمر 👋\nاسمي: ${form.patient_name}\nالجلسة: ${session?.label}\nالموعد: ${dateStr} - ${form.time_slot}\nأنا بانتظار التأكيد 🙏`;

  return (
    <>
      <Confetti />
      <motion.div key="step-success" initial={{ opacity: 0, y: 24, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ ...SPRING_SMOOTH, delay: 0.05 }}
        className="flex flex-col items-center pb-10 pt-4">
        <div className="relative mb-6">
          {[1,2,3].map(ring => (<motion.div key={ring} className="absolute inset-0 rounded-full" style={{ border: `2px solid rgba(13,148,136,${0.15 / ring})` }}
            animate={{ scale: [1, 1.5 + ring * 0.3], opacity: [0.6, 0] }} transition={{ duration: 2, delay: ring * 0.25, repeat: Infinity, ease: 'easeOut' }} />))}
          <motion.div className="w-24 h-24 rounded-full flex items-center justify-center relative z-10"
            style={{ background: 'linear-gradient(135deg,#0d9488,#059669)', boxShadow: '0 16px 48px rgba(13,148,136,0.4)' }}
            animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ ...SPRING_SNAPPY, delay: 0.2 }}><Check className="w-12 h-12 text-white" strokeWidth={2.5} /></motion.div>
          </motion.div>
        </div>
        <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="text-[24px] font-black text-slate-800 mb-2">تم استلام حجزك! 🎉</motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="text-[13px] text-slate-400 text-center mb-7 px-6 leading-relaxed">سيتواصل معك د. عمر لتأكيد الموعد قريباً إن شاء الله</motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="w-full p-5 rounded-[22px] mb-5" style={{ background: '#fff', boxShadow: '0 6px 28px rgba(0,0,0,0.07)' }}>
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
            <img src={DR_PHOTO} alt="" className="w-11 h-11 rounded-[13px] object-cover object-top" />
            <div><p className="text-[13px] font-black text-slate-800">د. عمر العماد</p><p className="text-[11px] text-teal-600 font-bold">الطب الوظيفي والتكاملي</p></div>
            <div className="mr-auto flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: 'rgba(16,185,129,0.1)' }}>
              <motion.div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
              <span className="text-[9.5px] font-bold text-emerald-600">قيد المراجعة</span>
            </div>
          </div>
          {[{ l: 'الجلسة', v: `${session?.emoji} ${session?.label}` }, { l: 'التاريخ', v: dateStr }, { l: 'الوقت', v: form.time_slot }, { l: 'السعر', v: session?.price }].map((row, i) => (
            <motion.div key={row.l} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.06 }} className="flex justify-between items-center py-2">
              <span className="text-[11.5px] text-slate-400 font-medium">{row.l}</span>
              <span className="text-[12px] font-bold text-slate-700">{row.v}</span>
            </motion.div>
          ))}
        </motion.div>
        <motion.a initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          href={`https://wa.me/${DR_PHONE}?text=${encodeURIComponent(waMsg)}`} target="_blank" rel="noopener noreferrer"
          className="w-full h-[56px] rounded-[18px] flex items-center justify-center gap-3 text-white text-[15px] font-black mb-3"
          style={{ background: 'linear-gradient(135deg,#25d366,#128c7e)', boxShadow: '0 10px 30px rgba(37,211,102,0.35)' }}>
          <MessageCircle className="w-5 h-5" />تحدث مع الدكتور الآن
        </motion.a>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="flex gap-3 w-full mb-4">
          <a href={`https://instagram.com/${DR_IG}`} target="_blank" rel="noopener noreferrer"
            className="flex-1 h-[46px] rounded-[14px] flex items-center justify-center gap-2 text-white text-[12px] font-bold"
            style={{ background: 'linear-gradient(135deg,#e1306c,#833ab4,#405de6)' }}><Instagram className="w-4 h-4" /> إنستغرام</a>
          <a href={`https://tiktok.com/@${DR_TT}`} target="_blank" rel="noopener noreferrer"
            className="flex-1 h-[46px] rounded-[14px] flex items-center justify-center gap-2 text-[12px] font-bold"
            style={{ background: 'linear-gradient(135deg,#111,#333)', color: '#fff' }}><Music2 className="w-4 h-4" /> تيكتوك</a>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="w-full">
          <Link href={createPageUrl('Home')}><button className="w-full h-[46px] rounded-[16px] text-[14px] font-bold text-slate-400" style={{ background: 'rgba(0,0,0,0.04)' }}>العودة للرئيسية</button></Link>
        </motion.div>
      </motion.div>
    </>
  );
}
