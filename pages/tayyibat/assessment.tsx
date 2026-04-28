// pages/tayyibat/assessment.tsx
// Route: /tayyibat/assessment
// وضعان: سريع (٧ أسئلة) وعميق (٢٥ سؤالاً)
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Zap, BookOpen, CheckCircle, AlertTriangle } from 'lucide-react';

import { QUICK_QUESTIONS, DEEP_QUESTIONS, hasRedFlagAnswers } from '@/lib/tayyibat/assessment-questions';
import type { AssessmentQuestion, AssessmentOption }           from '@/lib/tayyibat/assessment-questions';
import {
    startNewSession, updateSessionAnswer, updateSessionStep,
    completeSession, saveDraftAnswers, getDraftAnswers, clearDraft,
} from '@/lib/tayyibat/tayyibat-store';
import { trackEvent } from '@/lib/analytics';
import { haptic } from '@/lib/HapticFeedback';

const W = {
    glass:'rgba(255,255,255,0.62)', glassHigh:'rgba(255,255,255,0.80)',
    glassBorder:'rgba(255,255,255,0.88)', glassShadow:'0 8px 32px rgba(5,150,105,0.10)',
    green:'#059669', greenDeep:'#047857', textPrimary:'#0C4A6E',
    textSub:'#0369A1', textMuted:'#7DD3FC', amber:'#D97706', red:'#DC2626',
};

type AssessMode = 'quick' | 'deep';

export default function TayyibatAssessmentPage() {
    const router = useRouter();
    const [mode, setMode]           = useState<AssessMode | null>(null);
    const [step, setStep]           = useState(0);
    const [answers, setAnswers]     = useState<Record<string, string | string[]>>({});
    const [animDir, setAnimDir]     = useState<1 | -1>(1);
    const [redFlagShown, setRedFlagShown] = useState(false);

    const questions = mode === 'quick' ? QUICK_QUESTIONS : DEEP_QUESTIONS;
    const current   = questions[step];
    const progress  = questions.length > 0 ? ((step) / questions.length) * 100 : 0;

    // ── استعادة المسودة ──
    useEffect(() => {
        const draft = getDraftAnswers();
        if (draft && !mode) {
            // لا نستعيد المسودة تلقائياً — نترك المستخدم يختار الوضع
        }
    }, []);

    // ── حفظ المسودة عند كل تغيير ──
    useEffect(() => {
        if (mode && Object.keys(answers).length > 0) {
            saveDraftAnswers(answers, step);
        }
    }, [answers, step, mode]);

    const startMode = (m: AssessMode) => {
        setMode(m);
        setStep(0);
        setAnswers({});
        startNewSession(m);
        trackEvent(m === 'quick' ? 'tayyibat_quick_started' : 'tayyibat_deep_started', { mode: m });
        haptic.selection();
    };

    const handleAnswer = (q: AssessmentQuestion, value: string) => {
        haptic.selection();
        if (q.type === 'multi') {
            const current = (answers[q.id] as string[] | undefined) ?? [];
            const isNone = value === 'none_of_above';
            let next: string[];
            if (isNone) {
                next = ['none_of_above'];
            } else {
                const filtered = current.filter(v => v !== 'none_of_above');
                next = filtered.includes(value) ? filtered.filter(v => v !== value) : [...filtered, value];
            }
            setAnswers(prev => ({ ...prev, [q.id]: next }));
        } else {
            setAnswers(prev => ({ ...prev, [q.id]: value }));
            // Auto-advance for single choice only
            if (q.type === 'single') {
                setTimeout(() => goNext(q.id, value), 280);
            }
            // scale and text: user taps "التالي" manually
        }
        // Persist to session store
        updateSessionAnswer(q.id, value, q.mapsTo ?? undefined, value);
    };

    const goNext = useCallback((currentId?: string, currentVal?: string) => {
        // الإجابة الحالية
        const ans = currentId ? (currentVal ?? answers[currentId]) : answers[current?.id];
        if (current?.required && !ans && !Array.isArray(ans)) return;

        // فحص safety قبل الانتقال لأسئلة السلامة
        const allAnswers = currentId
            ? { ...answers, [currentId]: currentVal ?? answers[currentId] }
            : answers;

        if (hasRedFlagAnswers(allAnswers) && !redFlagShown) {
            setRedFlagShown(true);
            return;
        }

        if (step < questions.length - 1) {
            setAnimDir(1);
            setStep(s => s + 1);
            updateSessionStep(step + 1);
        } else {
            finishAssessment(allAnswers);
        }
    }, [step, questions.length, current, answers, redFlagShown]);

    const goBack = () => {
        if (step === 0) { setMode(null); return; }
        setAnimDir(-1);
        setStep(s => s - 1);
        haptic.selection();
    };

    const finishAssessment = (finalAnswers: Record<string, string | string[]>) => {
        const session = completeSession();
        clearDraft();
        trackEvent(mode === 'quick' ? 'tayyibat_quick_completed' : 'tayyibat_deep_completed', {
            answeredCount: Object.keys(finalAnswers).length,
            hasRedFlags: hasRedFlagAnswers(finalAnswers),
        });
        // تمرير الإجابات للصفحة التالية عبر sessionStorage (أخف من URL params)
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('tayyibat_final_answers', JSON.stringify(finalAnswers));
            sessionStorage.setItem('tayyibat_mode', mode ?? 'quick');
        }
        router.push('/tayyibat/result');
    };

    const isAnswered = (q: AssessmentQuestion) => {
        const a = answers[q.id];
        if (Array.isArray(a)) return a.length > 0;
        return !!a;
    };

    // ══ Mode Selector ══
    if (!mode) return (
        <div dir="rtl" style={{ background:'linear-gradient(168deg,#E8FBF0,#D0F8E8,#F0FBF5)', minHeight:'100svh', padding:'80px 16px 120px' }}>
            <Head>
                <title>تقييم الطيبات — طبرا</title>
                <meta name="description" content="قيّم التزامك بنظام الطيبات واكتشف ثغراتك الغذائية الشخصية" />
            </Head>
            {/* Back */}
            <motion.button whileTap={{scale:0.88}} onClick={()=>router.back()}
                className="flex items-center gap-2 mb-8"
                style={{background:W.glass,border:`1px solid ${W.glassBorder}`,borderRadius:20,padding:'8px 16px'}}>
                <ArrowRight style={{width:16,height:16,color:W.textSub}} />
                <span style={{fontSize:12,fontWeight:700,color:W.textSub}}>رجوع</span>
            </motion.button>

            <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} className="space-y-6">
                <div className="text-center mb-8">
                    <h1 style={{fontSize:26,fontWeight:900,color:W.textPrimary,letterSpacing:'-0.03em'}}>تقييم الطيبات</h1>
                    <p style={{fontSize:13,fontWeight:600,color:W.textSub,marginTop:6}}>
                        اختر مستوى التقييم المناسب لك
                    </p>
                </div>

                {/* Quick */}
                <motion.button whileTap={{scale:0.97}} onClick={()=>startMode('quick')}
                    className="w-full rounded-[24px] p-6 text-right"
                    style={{background:'rgba(5,150,105,0.08)',border:'1.5px solid rgba(5,150,105,0.25)',boxShadow:W.glassShadow}}>
                    <div className="flex items-center gap-3 mb-3">
                        <div style={{width:46,height:46,borderRadius:16,background:'rgba(5,150,105,0.12)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <Zap style={{width:22,height:22,color:W.green}} />
                        </div>
                        <div>
                            <p style={{fontSize:18,fontWeight:900,color:W.textPrimary}}>تقييم سريع</p>
                            <p style={{fontSize:11,fontWeight:700,color:W.green}}>٧ أسئلة • دقيقتان</p>
                        </div>
                    </div>
                    <p style={{fontSize:12,fontWeight:600,color:W.textSub,lineHeight:1.7}}>
                        اكتشف أكبر ثغرة غذائية عندك الآن. مناسب للبداية أو إذا كان وقتك محدوداً.
                    </p>
                </motion.button>

                {/* Deep */}
                <motion.button whileTap={{scale:0.97}} onClick={()=>startMode('deep')}
                    className="w-full rounded-[24px] p-6 text-right"
                    style={{background:W.glass,border:`1px solid ${W.glassBorder}`,boxShadow:W.glassShadow}}>
                    <div className="flex items-center gap-3 mb-3">
                        <div style={{width:46,height:46,borderRadius:16,background:'rgba(8,145,178,0.10)',display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <BookOpen style={{width:22,height:22,color:W.textSub}} />
                        </div>
                        <div>
                            <p style={{fontSize:18,fontWeight:900,color:W.textPrimary}}>تقييم عميق</p>
                            <p style={{fontSize:11,fontWeight:700,color:W.textSub}}>٢٥ سؤالاً • خطة أدق</p>
                        </div>
                    </div>
                    <p style={{fontSize:12,fontWeight:600,color:W.textSub,lineHeight:1.7}}>
                        تقييم شامل يربط الغذاء بأعراضك وينتج خطة مخصصة لك. مستحسن للبدء بخطة علاجية جدية.
                    </p>
                </motion.button>

                {/* Attribution */}
                <p style={{fontSize:10,fontWeight:600,color:W.textMuted,textAlign:'center',marginTop:8}}>
                    نظام الطيبات • د. ضياء العوضي • طبرا يضيف التحليل السريري
                </p>
            </motion.div>
        </div>
    );

    // ══ Red Flag Gate ══
    if (redFlagShown) return (
        <div dir="rtl" style={{background:'linear-gradient(168deg,#FFF5F5,#FFF0F0)',minHeight:'100svh',padding:'80px 16px 120px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}}
                className="w-full max-w-sm rounded-[28px] p-7"
                style={{background:'rgba(255,255,255,0.90)',border:'1.5px solid rgba(220,38,38,0.25)',boxShadow:'0 8px 40px rgba(220,38,38,0.15)'}}>
                <div className="flex items-center gap-3 mb-5">
                    <AlertTriangle style={{width:28,height:28,color:W.red,flexShrink:0}} />
                    <h2 style={{fontSize:18,fontWeight:900,color:'#7F1D1D'}}>مراجعة طبية أولاً</h2>
                </div>
                <p style={{fontSize:13,fontWeight:600,color:'#991B1B',lineHeight:1.8,marginBottom:16}}>
                    بعض الأعراض التي أشرت إليها تستوجب تقييماً طبياً قبل البدء بأي بروتوكول غذائي. يرجى مراجعة طبيب مختص.
                </p>
                <div className="space-y-2 mb-6">
                    {['دم في البراز أو فقدان وزن غير مبرر','قيء متكرر أو ألم بطني شديد','ضيق تنفس أو ألم صدري'].map(f=>(
                        <div key={f} className="flex items-center gap-2">
                            <span style={{fontSize:8,color:W.red}}>●</span>
                            <p style={{fontSize:11,fontWeight:600,color:'#7F1D1D'}}>{f}</p>
                        </div>
                    ))}
                </div>
                <motion.button whileTap={{scale:0.97}} onClick={()=>router.push('/')}
                    className="w-full rounded-[18px] py-4"
                    style={{background:'linear-gradient(135deg,#DC2626,#B91C1C)',border:'none'}}>
                    <span style={{fontSize:14,fontWeight:900,color:'#fff'}}>راجع طبيبًا أولًا</span>
                </motion.button>
                <button onClick={()=>setRedFlagShown(false)} style={{display:'block',margin:'12px auto 0',fontSize:11,fontWeight:600,color:W.textMuted,background:'none',border:'none',cursor:'pointer'}}>
                    المتابعة رغم التحذير
                </button>
            </motion.div>
        </div>
    );

    // ══ Question Step ══
    return (
        <div dir="rtl" style={{background:'linear-gradient(168deg,#E8FBF0,#D0F8E8,#F0FBF5)',minHeight:'100svh',padding:'0 0 120px'}}>
            <Head>
                <title>تقييم الطيبات — {mode === 'quick' ? 'سريع' : 'عميق'} — طبرا</title>
            </Head>

            {/* Fixed Header */}
            <div style={{position:'sticky',top:0,zIndex:30,background:'rgba(232,251,240,0.88)',backdropFilter:'blur(20px)',padding:'52px 16px 12px',borderBottom:'1px solid rgba(255,255,255,0.6)'}}>
                <div className="flex items-center gap-3 mb-3">
                    <motion.button whileTap={{scale:0.88}} onClick={goBack}
                        style={{width:36,height:36,borderRadius:'50%',background:W.glass,border:`1px solid ${W.glassBorder}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                        <ArrowRight style={{width:15,height:15,color:W.textSub}} />
                    </motion.button>
                    <div style={{flex:1}}>
                        <p style={{fontSize:11,fontWeight:700,color:W.textMuted}}>
                            {mode === 'quick' ? 'تقييم سريع' : 'تقييم عميق'} • {step+1} / {questions.length}
                        </p>
                    </div>
                </div>
                {/* Progress bar */}
                <div style={{height:4,borderRadius:8,background:'rgba(5,150,105,0.12)',overflow:'hidden'}}>
                    <motion.div animate={{width:`${progress}%`}} transition={{duration:0.4,ease:'easeOut'}}
                        style={{height:'100%',background:'linear-gradient(90deg,#059669,#34D399)',borderRadius:8}} />
                </div>
            </div>

            {/* Question */}
            <div className="px-4 pt-6">
                <AnimatePresence mode="wait">
                    <motion.div key={step}
                        initial={{opacity:0,x:animDir*40}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-animDir*40}}
                        transition={{duration:0.28,ease:'easeOut'}}
                        className="space-y-4">

                        {/* Domain badge */}
                        <div className="flex items-center gap-2 mb-1">
                            <span style={{fontSize:9,fontWeight:800,color:W.textMuted,background:'rgba(8,145,178,0.08)',padding:'3px 9px',borderRadius:20,textTransform:'uppercase',letterSpacing:'0.05em'}}>
                                {current?.domain}
                            </span>
                        </div>

                        {/* Question text */}
                        <h2 style={{fontSize:19,fontWeight:900,color:W.textPrimary,lineHeight:1.5,letterSpacing:'-0.02em'}}>
                            {current?.text}
                        </h2>
                        {current?.subtext && (
                            <p style={{fontSize:12,fontWeight:600,color:W.textSub,lineHeight:1.7,marginTop:-8}}>
                                {current.subtext}
                            </p>
                        )}

                        {/* Options */}
                        {current?.type === 'single' && current.options && (
                            <div className="space-y-2 mt-4">
                                {current.options.map(opt => {
                                    const selected = answers[current.id] === opt.value;
                                    return (
                                        <motion.button key={opt.value} whileTap={{scale:0.97}}
                                            onClick={()=>handleAnswer(current, opt.value)}
                                            className="w-full rounded-[18px] p-4 flex items-center gap-3 text-right"
                                            style={{
                                                background: selected ? 'rgba(5,150,105,0.10)' : W.glass,
                                                border: selected ? '1.5px solid rgba(5,150,105,0.35)' : `1px solid ${W.glassBorder}`,
                                                boxShadow: selected ? '0 4px 16px rgba(5,150,105,0.15)' : W.glassShadow,
                                            }}>
                                            {selected
                                                ? <CheckCircle style={{width:18,height:18,color:W.green,flexShrink:0}} />
                                                : <div style={{width:18,height:18,borderRadius:'50%',border:`2px solid ${W.glassBorder}`,flexShrink:0}} />
                                            }
                                            {opt.emoji && <span style={{fontSize:18,flexShrink:0}}>{opt.emoji}</span>}
                                            <span style={{fontSize:13,fontWeight:selected?800:600,color:selected?W.green:W.textPrimary,flex:1}}>
                                                {opt.label}
                                            </span>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Multi-choice */}
                        {current?.type === 'multi' && current.options && (
                            <div className="space-y-2 mt-4">
                                {current.options.map(opt => {
                                    const sel = ((answers[current.id] as string[]|undefined)??[]).includes(opt.value);
                                    return (
                                        <motion.button key={opt.value} whileTap={{scale:0.97}}
                                            onClick={()=>handleAnswer(current, opt.value)}
                                            className="w-full rounded-[18px] p-4 flex items-center gap-3 text-right"
                                            style={{
                                                background: sel ? (opt.riskFlag?'rgba(220,38,38,0.08)':'rgba(5,150,105,0.08)') : W.glass,
                                                border: sel ? `1.5px solid ${opt.riskFlag?'rgba(220,38,38,0.35)':'rgba(5,150,105,0.30)'}` : `1px solid ${W.glassBorder}`,
                                            }}>
                                            <div style={{width:18,height:18,borderRadius:6,border:`2px solid ${sel?(opt.riskFlag?W.red:W.green):W.glassBorder}`,background:sel?(opt.riskFlag?W.red:W.green):'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                                                {sel && <span style={{fontSize:10,color:'#fff',fontWeight:900}}>✓</span>}
                                            </div>
                                            {opt.riskFlag && <AlertTriangle style={{width:14,height:14,color:W.red,flexShrink:0}} />}
                                            <span style={{fontSize:13,fontWeight:600,color:W.textPrimary,flex:1}}>{opt.label}</span>
                                        </motion.button>
                                    );
                                })}
                                {/* Multi-choice next button */}
                                <motion.button whileTap={{scale:0.97}} onClick={()=>goNext()}
                                    disabled={!isAnswered(current)}
                                    className="w-full rounded-[20px] py-4 mt-2"
                                    style={{background:isAnswered(current)?'linear-gradient(135deg,#059669,#047857)':'rgba(5,150,105,0.15)',border:'none',opacity:isAnswered(current)?1:0.6}}>
                                    <span style={{fontSize:14,fontWeight:900,color:isAnswered(current)?'#fff':W.green}}>
                                        {step === questions.length - 1 ? 'إنهاء التقييم' : 'التالي →'}
                                    </span>
                                </motion.button>
                            </div>
                        )}
                        {/* Scale 1-10 */}
                        {current?.type === 'scale' && (
                            <div className="mt-5">
                                <div className="flex items-center justify-between mb-3 px-1">
                                    <span style={{fontSize:10,fontWeight:700,color:W.textMuted}}>
                                        {current.scaleMinLabel ?? '١'}
                                    </span>
                                    <span style={{fontSize:13,fontWeight:900,color:W.green}}>
                                        {answers[current.id] ? `${answers[current.id]} / ${current.scaleMax ?? 10}` : 'اختر'}
                                    </span>
                                    <span style={{fontSize:10,fontWeight:700,color:W.textMuted}}>
                                        {current.scaleMaxLabel ?? '١٠'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    {Array.from({length:(current.scaleMax??10)-(current.scaleMin??1)+1},(_,i)=>i+(current.scaleMin??1)).map(n => {
                                        const val = String(n);
                                        const selected = answers[current.id] === val;
                                        return (
                                            <motion.button key={n} whileTap={{scale:0.92}}
                                                onClick={() => handleAnswer(current, val)}
                                                className="rounded-[14px] py-3.5 text-center"
                                                style={{
                                                    background: selected
                                                        ? 'linear-gradient(135deg,rgba(5,150,105,0.18),rgba(5,150,105,0.08))'
                                                        : W.glass,
                                                    border: selected
                                                        ? '1.5px solid rgba(5,150,105,0.40)'
                                                        : `1px solid ${W.glassBorder}`,
                                                    boxShadow: selected ? '0 4px 12px rgba(5,150,105,0.15)' : W.glassShadow,
                                                }}>
                                                <span style={{fontSize:17,fontWeight:900,color:selected?W.green:W.textPrimary}}>
                                                    {n}
                                                </span>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                                <motion.button whileTap={{scale:0.97}} onClick={() => goNext()}
                                    disabled={!isAnswered(current)}
                                    className="w-full rounded-[20px] py-4 mt-4"
                                    style={{background:isAnswered(current)?'linear-gradient(135deg,#059669,#047857)':'rgba(5,150,105,0.15)',border:'none',opacity:isAnswered(current)?1:0.6}}>
                                    <span style={{fontSize:14,fontWeight:900,color:isAnswered(current)?'#fff':W.green}}>
                                        {step === questions.length - 1 ? 'إنهاء التقييم ✓' : 'التالي →'}
                                    </span>
                                </motion.button>
                            </div>
                        )}

                        {/* Text input */}
                        {current?.type === 'text' && (
                            <div className="mt-4 space-y-3">
                                <textarea
                                    value={(answers[current.id] as string) ?? ''}
                                    onChange={e => setAnswers(prev => ({...prev, [current.id]: e.target.value}))}
                                    placeholder="اكتب إجابتك هنا..."
                                    rows={4}
                                    style={{
                                        width:'100%', borderRadius:16, padding:'14px 16px',
                                        background:W.glass, border:`1px solid ${W.glassBorder}`,
                                        fontSize:13, fontWeight:600, color:W.textPrimary,
                                        resize:'none', outline:'none', fontFamily:'inherit',
                                        boxShadow:W.glassShadow, direction:'rtl',
                                    }}
                                />
                                <motion.button whileTap={{scale:0.97}} onClick={() => goNext()}
                                    className="w-full rounded-[20px] py-4"
                                    style={{background:'linear-gradient(135deg,#059669,#047857)',border:'none'}}>
                                    <span style={{fontSize:14,fontWeight:900,color:'#fff'}}>
                                        {step === questions.length - 1 ? 'إنهاء التقييم ✓' : 'التالي →'}
                                    </span>
                                </motion.button>
                            </div>
                        )}

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
