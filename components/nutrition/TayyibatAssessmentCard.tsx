// components/nutrition/TayyibatAssessmentCard.tsx
'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Leaf, Sparkles } from 'lucide-react';
import { BottomCTA } from '@/components/health-engine/ui/BottomCTA';
import { haptic } from '@/lib/HapticFeedback';

type Knowledge = 'dont_know' | 'know_not_following' | 'yes_partial' | 'yes_following';

interface Props {
  pathwayId: string;
  clinicalAnswers: Record<string, unknown>;
  onComplete: (answers: {
    gateAnswers: Record<string, string>;
    deepAnswers: Record<string, string>;
    deepTriggered: boolean;
  }) => void;
}

const C = {
  bg: 'linear-gradient(168deg, #E8F8FB 0%, #E6F7EF 34%, #EEF7FF 68%, #F8FCFD 100%)',
  ink: '#073B52',
  sub: '#0F6F8F',
  muted: '#639CAF',
  green: '#059669',
  teal: '#0787A5',
  amber: '#D97706',
  glass: 'rgba(255,255,255,0.68)',
  border: 'rgba(255,255,255,0.90)',
};

const KNOWLEDGE_OPTIONS: Array<{ id: Knowledge; title: string; sub: string; color: string }> = [
  { id: 'dont_know', title: 'لا أعرفه', sub: 'لن نقيّم التزامك؛ سنعرض مدخلًا تعريفيًا فقط', color: '#64748B' },
  { id: 'know_not_following', title: 'أعرفه ولا أطبقه', sub: 'نبدأ بخطوة بسيطة', color: '#D97706' },
  { id: 'yes_partial', title: 'أطبقه جزئياً', sub: 'نبحث عن الثغرات', color: '#0787A5' },
  { id: 'yes_following', title: 'أطبقه غالباً', sub: 'نرفع الدقة بالمتابعة', color: '#059669' },
];

const UNKNOWN_FOOD_QUESTIONS = [
  { id: 'food_after_meals', text: 'هل تزيد الأعراض بعد الأكل؟', options: ['نعم', 'أحياناً', 'لا أعرف', 'لا'] },
  { id: 'food_digestive_symptoms', text: 'هل يحدث انتفاخ/غازات/حموضة؟', options: ['نعم', 'أحياناً', 'لا أعرف', 'لا'] },
  { id: 'food_energy_crash', text: 'هل يحدث هبوط طاقة أو رغبة سكر بعد الوجبات؟', options: ['نعم', 'أحياناً', 'لا أعرف', 'لا'] },
];

const KNOWN_QUESTIONS = [
  { id: 'tay_adherence_detail', text: 'ما مستوى الالتزام؟', options: ['لا أطبقه الآن', 'أطبقه أحياناً', 'أطبقه غالباً', 'أحتاج متابعة'] },
  { id: 'tay_hardest_part', text: 'ما أصعب شيء في التطبيق؟', options: ['الخبز/القمح', 'الألبان/البيض', 'السكر', 'الروتين والوقت', 'الأسرة والمناسبات'] },
  { id: 'tay_first_step_preference', text: 'ما الخطوة الصغيرة التي تفضّل البدء بها؟', options: ['تبديل الخبز', 'تقليل السكر', 'تنظيم وقت الوجبات', 'تسجيل ما آكل', 'لا أعرف بعد'] },
  { id: 'tay_symptom_difference', text: 'هل لاحظت فرقاً في الأعراض مع الالتزام؟', options: ['فرق واضح', 'فرق بسيط', 'لم ألاحظ', 'لم أتابع بما يكفي'] },
  { id: 'tay_disruptive_habit', text: 'ما أكثر وجبة أو عادة تربك جسمك؟', options: ['وجبة متأخرة', 'حلويات', 'قهوة كثيرة', 'أكل سريع', 'لا أعرف'] },
];

function GlassCard({ children, accent = C.green }: { children: ReactNode; accent?: string }) {
  return (
    <div className="relative overflow-hidden rounded-[26px]"
      style={{ background: C.glass, border: `1.5px solid ${C.border}`, backdropFilter: 'blur(26px)', boxShadow: '0 12px 36px rgba(8,145,178,0.08), inset 0 1.5px 0 rgba(255,255,255,0.92)' }}>
      <div className="absolute inset-x-0 top-0 h-1/2 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.68), transparent)' }} />
      <div className="absolute top-0 left-[18%] right-[18%] h-[3px] rounded-b-full" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function ChoiceCard({ title, sub, selected, color, onClick }: {
  title: string;
  sub: string;
  selected: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full rounded-[22px] p-4 text-right relative overflow-hidden"
      style={{
        background: selected ? `linear-gradient(145deg, rgba(255,255,255,0.92), ${color}12)` : 'rgba(255,255,255,0.54)',
        border: `1.5px solid ${selected ? `${color}35` : 'rgba(255,255,255,0.82)'}`,
        boxShadow: selected ? `0 10px 28px ${color}14` : 'inset 0 1px 0 rgba(255,255,255,0.90)',
      }}
    >
      <div className="flex items-start gap-3">
        <span className="rounded-[15px] flex items-center justify-center shrink-0" style={{ width: 38, height: 38, background: `${color}10`, border: `1px solid ${color}22` }}>
          {selected ? <Check style={{ width: 17, height: 17, color }} /> : <Leaf style={{ width: 17, height: 17, color }} />}
        </span>
        <span className="flex-1">
          <span style={{ display: 'block', fontSize: 14.5, fontWeight: 950, color: C.ink }}>{title}</span>
          <span style={{ display: 'block', fontSize: 11.5, lineHeight: 1.7, color: C.sub, fontWeight: 650, marginTop: 3 }}>{sub}</span>
        </span>
      </div>
    </motion.button>
  );
}

export function TayyibatAssessmentCard({ pathwayId: _pathwayId, clinicalAnswers: _clinicalAnswers, onComplete }: Props) {
  const [knowledge, setKnowledge] = useState<Knowledge | null>(null);
  const [phase, setPhase] = useState<'gate' | 'unknown_choice' | 'unknown_food' | 'known_questions'>('gate');
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const selectedMeta = useMemo(() => KNOWLEDGE_OPTIONS.find(option => option.id === knowledge), [knowledge]);
  const knownQuestionsComplete = KNOWN_QUESTIONS.every(q => answers[q.id]);
  const unknownQuestionsComplete = UNKNOWN_FOOD_QUESTIONS.every(q => answers[q.id]);

  const baseGate = (level: Knowledge) => ({
    tay_know: level,
    tay_level: level === 'yes_following'
      ? 'full'
      : level === 'yes_partial'
        ? 'partial'
        : level === 'know_not_following'
          ? 'not_following'
          : 'unknown',
  });

  const finishUnknown = (deepTriggered: boolean) => {
    onComplete({
      gateAnswers: baseGate('dont_know'),
      deepAnswers: deepTriggered ? { ...answers, tay_mode: 'educational_with_food_signals' } : { tay_mode: 'educational_only' },
      deepTriggered,
    });
  };

  const finishKnown = () => {
    if (!knowledge || knowledge === 'dont_know') return;
    onComplete({
      gateAnswers: baseGate(knowledge),
      deepAnswers: { ...answers, tay_mode: 'known_system_followup' },
      deepTriggered: true,
    });
  };

  const setAnswer = (id: string, value: string) => {
    haptic.selection();
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="relative min-h-screen overflow-hidden" dir="rtl" style={{ background: C.bg }}>
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.38, 0.68, 0.38] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', top: -80, right: -80, width: 340, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(5,150,105,0.18), transparent 64%)', filter: 'blur(54px)' }}
        />
        <div style={{ position: 'absolute', bottom: 80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.13), transparent 64%)', filter: 'blur(52px)' }} />
      </div>

      <div className="relative z-10 px-4 pt-4 pb-44">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 240, damping: 28 }} className="mb-5">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 mb-4"
            style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.18)', backdropFilter: 'blur(16px)' }}>
            <Leaf style={{ width: 13, height: 13, color: C.green }} />
            <span style={{ fontSize: 11, fontWeight: 900, color: C.green }}>الغذاء والإيقاع ضمن تقييمك</span>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 900, lineHeight: 1.2, color: C.ink, letterSpacing: '-0.02em', marginBottom: 9 }}>
            الغذاء والإيقاع
          </h2>
          <p style={{ fontSize: 13, lineHeight: 1.75, fontWeight: 500, color: C.sub }}>
            الغذاء ليس دائماً السبب، لكنه قد يغيّر شدة الأعراض أو توقيتها. سنسأل فقط بالقدر الذي يساعدنا نفهم النمط.
          </p>
        </motion.div>

        <GlassCard accent={selectedMeta?.color ?? C.green}>
          <div className="p-5">
            <p style={{ fontSize: 18, fontWeight: 950, color: C.ink, marginBottom: 4 }}>هل تعرف نظام الطيبات؟</p>
            <p style={{ fontSize: 12.5, lineHeight: 1.75, color: C.sub, fontWeight: 650, marginBottom: 16 }}>
              هذا الجزء ليس اختبار التزام. نستخدمه كطبقة فهم مساعدة فقط.
            </p>

            <div className="space-y-3">
              {KNOWLEDGE_OPTIONS.map(option => (
                <ChoiceCard
                  key={option.id}
                  title={option.title}
                  sub={option.sub}
                  color={option.color}
                  selected={knowledge === option.id}
                  onClick={() => {
                    haptic.selection();
                    setKnowledge(option.id);
                    setAnswers({});
                    setPhase(option.id === 'dont_know' ? 'unknown_choice' : 'known_questions');
                  }}
                />
              ))}
            </div>
          </div>
        </GlassCard>

        <AnimatePresence mode="wait">
          {phase === 'unknown_choice' && knowledge === 'dont_know' && (
            <motion.div key="unknown-choice" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-4">
              <GlassCard accent="#64748B">
                <div className="p-5">
                  <div className="rounded-[18px] px-4 py-3 mb-4"
                    style={{ background: 'rgba(8,145,178,0.06)', border: '1px solid rgba(8,145,178,0.14)', backdropFilter: 'blur(12px)' }}>
                    <p style={{ fontSize: 13, lineHeight: 1.75, fontWeight: 500, color: C.ink }}>
                      ✅ <strong>تمام.</strong> لن نحكم على التزامك بشيء لا تعرفه. سنستخدم الغذاء كطبقة فهم عامة فقط.
                    </p>
                  </div>
                  <p style={{ fontSize: 14.5, fontWeight: 900, color: C.ink, marginBottom: 12 }}>
                    هل تريد إضافة 3 أسئلة عن علاقة الأكل بالأعراض؟
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setPhase('unknown_food')} className="rounded-[18px] py-3 px-3" style={{ background: 'rgba(5,150,105,0.12)', border: '1px solid rgba(5,150,105,0.24)', color: C.green, fontWeight: 950 }}>
                      نعم، اسألني
                    </button>
                    <button type="button" onClick={() => finishUnknown(false)} className="rounded-[18px] py-3 px-3" style={{ background: 'rgba(100,116,139,0.10)', border: '1px solid rgba(100,116,139,0.20)', color: '#64748B', fontWeight: 950 }}>
                      تخطَّ هذا الجزء الآن
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {phase === 'unknown_food' && (
            <motion.div key="unknown-food" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-4 space-y-3">
              {UNKNOWN_FOOD_QUESTIONS.map((question, index) => (
                <QuestionBlock key={question.id} question={question} value={answers[question.id]} index={index} onSelect={setAnswer} />
              ))}
            </motion.div>
          )}

          {phase === 'known_questions' && knowledge && knowledge !== 'dont_know' && (
            <motion.div key="known-questions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="mt-4 space-y-3">
              <div className="rounded-[22px] p-4" style={{ background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.18)' }}>
                <div className="flex items-start gap-3">
                  <Sparkles style={{ width: 17, height: 17, color: C.green, marginTop: 3 }} />
                  <p style={{ fontSize: 12.5, lineHeight: 1.75, color: C.sub, fontWeight: 700 }}>
                    سنقرأ النمط لا نحكم عليك. الهدف خطوة عملية صغيرة يمكن متابعتها.
                  </p>
                </div>
              </div>
              {KNOWN_QUESTIONS.map((question, index) => (
                <QuestionBlock key={question.id} question={question} value={answers[question.id]} index={index} onSelect={setAnswer} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {phase === 'unknown_food' ? (
        <BottomCTA label="إنهاء الغذاء كطبقة تعريفية" onPress={() => finishUnknown(true)} disabled={!unknownQuestionsComplete} variant="teal" sublabel="لن تظهر درجة التزام لأنك اخترت أنك لا تعرف النظام بعد." />
      ) : phase === 'known_questions' ? (
        <BottomCTA label="إنهاء الغذاء والإيقاع" onPress={finishKnown} disabled={!knownQuestionsComplete} variant="teal" sublabel="الغذاء طبقة مساعدة، وليس التفسير الوحيد." />
      ) : null}
    </div>
  );
}

function QuestionBlock({ question, value, index, onSelect }: {
  question: { id: string; text: string; options: string[] };
  value?: string;
  index: number;
  onSelect: (id: string, value: string) => void;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <GlassCard accent={C.green}>
        <div className="p-4">
          <p style={{ fontSize: 15, fontWeight: 950, color: C.ink, lineHeight: 1.6, marginBottom: 12 }}>{question.text}</p>
          <div className="flex flex-wrap gap-2">
            {question.options.map(option => {
              const selected = value === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSelect(question.id, option)}
                  className="rounded-full px-3.5 py-2 flex items-center gap-1.5"
                  style={{
                    background: selected ? 'rgba(5,150,105,0.14)' : 'rgba(255,255,255,0.62)',
                    border: `1.5px solid ${selected ? 'rgba(5,150,105,0.30)' : 'rgba(255,255,255,0.82)'}`,
                    color: selected ? C.green : C.sub,
                    fontSize: 12,
                    fontWeight: 850,
                  }}
                >
                  {selected && <Check style={{ width: 13, height: 13 }} />}
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
