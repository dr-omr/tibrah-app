// components/care-hub/CareSessionPrep.tsx
// تحضير الجلسة — Session Preparation Intelligence
// Inspired by:
//   - Epic MyChart (USA): pre-visit checklists
//   - One Medical (USA): smart pre-appointment forms
//   - Ping An Good Doctor (China): AI-generated doctor prep questions
//
// Shows: Questions to bring to session, things to prepare before the visit,
//        emotional check-in gauge, progress since last session

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, CheckSquare, Square, ChevronDown, ChevronUp,
    Sparkles, Brain, Heart, Clock, Send,
} from 'lucide-react';
import { CT } from './care-tokens';
import { haptic } from '@/lib/HapticFeedback';
import { SPRING_BOUNCY } from '@/lib/tibrah-motion';

interface SessionQuestion {
    id:      string;
    text:    string;
    checked: boolean;
    type:    'physical' | 'emotional' | 'general';
}

const DEFAULT_QUESTIONS: SessionQuestion[] = [
    { id: 'q1', text: 'هل تحسنت الأعراض الجسدية منذ آخر جلسة؟',         checked: false, type: 'physical'  },
    { id: 'q2', text: 'هل لاحظت نمطاً عاطفياً متكرراً هذا الأسبوع؟',    checked: false, type: 'emotional' },
    { id: 'q3', text: 'هل هناك أي آثار جانبية من المكملات؟',              checked: false, type: 'physical'  },
    { id: 'q4', text: 'ما المواقف التي عززت أو أضعفت طاقتي؟',            checked: false, type: 'emotional' },
    { id: 'q5', text: 'هل أريد تعديل البروتوكول العلاجي؟',               checked: false, type: 'general'  },
];

const PREP_ITEMS = [
    { icon: '📋', label: 'نتائج التحاليل الحديثة' },
    { icon: '💊', label: 'قائمة المكملات الحالية' },
    { icon: '📓', label: 'يوميات الأعراض للأسبوع' },
    { icon: '🎯', label: 'أسئلتك الخاصة للدكتور' },
];

const TYPE_COLORS: Record<SessionQuestion['type'], string> = {
    physical:  CT.teal.c,
    emotional: CT.soul.c,
    general:   CT.warm.c,
};

/* ── Emotional check-in widget ── */
const MOODS = [
    { emoji: '😞', label: 'صعب', val: 1 },
    { emoji: '😕', label: 'هادئ', val: 2 },
    { emoji: '😐', label: 'عادي', val: 3 },
    { emoji: '🙂', label: 'بخير', val: 4 },
    { emoji: '😄', label: 'رائع', val: 5 },
];

function EmotionalCheckIn() {
    const [selected, setSelected] = useState<number | null>(null);
    const [sent, setSent] = useState(false);

    if (sent) return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="py-3 text-center">
            <p className="text-[12px] font-black" style={{ color: CT.teal.c }}>
                ✓ تم تسجيل حالتك الشعورية
            </p>
        </motion.div>
    );

    return (
        <div>
            <p className="text-[11px] font-bold text-slate-500 mb-3">كيف حالك الشعوري اليوم؟</p>
            <div className="flex justify-between mb-3">
                {MOODS.map(m => (
                    <motion.button key={m.val} whileTap={{ scale: 0.88 }}
                        onClick={() => { setSelected(m.val); haptic.selection(); }}
                        className="flex flex-col items-center gap-1">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-[22px]"
                            style={{
                                background: selected === m.val ? `${CT.soul.c}15` : 'transparent',
                                border: `2px solid ${selected === m.val ? CT.soul.c : 'transparent'}`,
                                transform: selected === m.val ? 'scale(1.15)' : 'scale(1)',
                                transition: 'all 0.2s',
                            }}>
                            {m.emoji}
                        </div>
                        <span className="text-[8px] text-slate-400 font-medium">{m.label}</span>
                    </motion.button>
                ))}
            </div>
            {selected && (
                <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { haptic.impact(); setSent(true); }}
                    className="w-full py-2.5 rounded-[14px] flex items-center justify-center gap-2 text-[12px] font-black text-white"
                    style={{ background: CT.soul.c, boxShadow: `0 6px 20px ${CT.soul.glow}` }}>
                    <Send className="w-3.5 h-3.5" />
                    أرسل لد. عمر
                </motion.button>
            )}
        </div>
    );
}

/* ════════════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════════════ */
interface CareSessionPrepProps {
    nextSession?:    string;     // "بعد 3 أيام"
    hasSession?:     boolean;
    protocol?:       any;        // psychosomatic protocol data
}

export function CareSessionPrep({ nextSession = 'بعد ٣ أيام', hasSession = true, protocol }: CareSessionPrepProps) {
    const [questions, setQuestions] = useState<SessionQuestion[]>(DEFAULT_QUESTIONS);
    const [expanded, setExpanded] = useState(false);

    const toggle = (id: string) => {
        haptic.selection();
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, checked: !q.checked } : q));
    };

    const checkedCount = questions.filter(q => q.checked).length;
    const pct = Math.round((checkedCount / questions.length) * 100);

    return (
        <div className="rounded-[24px] overflow-hidden"
            style={{
                background: `linear-gradient(160deg, ${CT.soul.dark}F5, ${CT.soul.c}EE)`,
                boxShadow: `0 12px 36px ${CT.soul.glow}`,
            }}>
            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Brain className="w-4 h-4 text-white/80" />
                            <span className="text-[10px] font-extrabold text-white/60 uppercase tracking-widest">
                                تحضير الجلسة
                            </span>
                        </div>
                        <h3 className="text-[16px] font-black text-white">اسئل د. عمر عن...</h3>
                        <p className="text-[10.5px] text-white/60 mt-0.5">{nextSession}</p>
                    </div>
                    {/* Prep progress */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.20)', border: '2px solid rgba(255,255,255,0.30)' }}>
                            <span className="text-[15px] font-black text-white">{pct}%</span>
                        </div>
                        <span className="text-[8px] text-white/50">جاهزية</span>
                    </div>
                </div>

                {/* Questions */}
                <div className="space-y-2 mb-4">
                    {questions.slice(0, expanded ? undefined : 3).map(q => (
                        <motion.button key={q.id}
                            onClick={() => toggle(q.id)}
                            className="w-full flex items-start gap-2.5 p-2.5 rounded-[14px] text-right"
                            style={{ background: 'rgba(255,255,255,0.10)' }}
                            whileTap={{ scale: 0.98 }}>
                            <div className="mt-0.5 flex-shrink-0">
                                {q.checked
                                    ? <CheckSquare className="w-4 h-4 text-white" />
                                    : <Square className="w-4 h-4 text-white/40" />
                                }
                            </div>
                            <p className={`text-[12px] text-right flex-1 ${q.checked ? 'line-through text-white/40' : 'text-white/90'} font-medium`}>
                                {q.text}
                            </p>
                            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                                style={{ background: TYPE_COLORS[q.type] }} />
                        </motion.button>
                    ))}
                </div>

                {/* Show more/less */}
                <button onClick={() => setExpanded(e => !e)}
                    className="flex items-center gap-1 text-[10px] text-white/50 font-bold mb-4">
                    {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {expanded ? 'عرض أقل' : `+ ${questions.length - 3} أسئلة أخرى`}
                </button>

                {/* What to bring */}
                <div className="rounded-[16px] p-3 mb-4"
                    style={{ background: 'rgba(255,255,255,0.12)' }}>
                    <p className="text-[10px] font-extrabold text-white/60 uppercase tracking-widest mb-2">
                        ما تحضّره للجلسة
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                        {PREP_ITEMS.map(item => (
                            <div key={item.label} className="flex items-center gap-1.5">
                                <span className="text-[12px]">{item.icon}</span>
                                <span className="text-[10px] text-white/75 font-medium">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Emotional check-in */}
                <div className="rounded-[16px] p-3" style={{ background: 'rgba(255,255,255,0.12)' }}>
                    <EmotionalCheckIn />
                </div>
            </div>
        </div>
    );
}
