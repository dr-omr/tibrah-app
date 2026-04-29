// pages/tayyibat/result.tsx
// Route: /tayyibat/result — صفحة نتيجة التقييم الكاملة
'use client';
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowRight, ExternalLink, Utensils, RotateCcw } from 'lucide-react';

import { computeTayyibatScore }   from '@/lib/tayyibat/tayyibat-scoring-engine';
import { detectPatterns, detectContradictions, computeConfidence, PATTERN_DESCRIPTIONS }
    from '@/lib/tayyibat/pattern-engine';
import { TAYYIBAT_ATTRIBUTION, ATTRIBUTION_TEXTS } from '@/lib/tayyibat/attribution';
import { RED_FLAG_DISCLAIMER }    from '@/lib/tayyibat/tayyibat-scoring-engine';
import {
    saveResult, getConfidenceWithTrackerData, getMealLogCount,
} from '@/lib/tayyibat/tayyibat-store';
import type { StoredTayyibatResult } from '@/lib/tayyibat/tayyibat-store';
import { hasRedFlagAnswers }       from '@/lib/tayyibat/assessment-questions';
import { trackEvent }             from '@/lib/analytics';

const W = {
    glass:'rgba(255,255,255,0.62)', glassHigh:'rgba(255,255,255,0.80)',
    glassBorder:'rgba(255,255,255,0.88)', glassShadow:'0 8px 32px rgba(5,150,105,0.10)',
    green:'#059669', textPrimary:'#0C4A6E', textSub:'#0369A1', textMuted:'#7DD3FC',
    amber:'#D97706', red:'#DC2626', teal:'#0891B2',
};

const CONFIDENCE_COLORS = { high: W.green, medium: W.amber, low: '#9CA3AF' };
const CONFIDENCE_AR     = { high: 'عالية', medium: 'متوسطة', low: 'منخفضة' };

export default function TayyibatResultPage() {
    const router = useRouter();
    const [result, setResult]         = useState<StoredTayyibatResult | null>(null);
    const [showAttrib, setShowAttrib] = useState(false);
    const [showFlags, setShowFlags]   = useState(false);
    const [trackerConf, setTrackerConf] = useState<ReturnType<typeof getConfidenceWithTrackerData> | null>(null);
    const [loading, setLoading]       = useState(true);

    useEffect(() => {
        // استرجاع الإجابات من sessionStorage
        const raw = typeof window !== 'undefined'
            ? sessionStorage.getItem('tayyibat_final_answers') : null;
        const modeRaw = typeof window !== 'undefined'
            ? sessionStorage.getItem('tayyibat_mode') : 'quick';

        if (!raw) { router.replace('/tayyibat/assessment'); return; }

        try {
            const rawAnswers = JSON.parse(raw) as Record<string, string | string[]>;
            const mode = (modeRaw ?? 'quick') as 'quick' | 'deep';

            // بناء TayyibatAnswers من الإجابات الخام
            const a = buildAnswersFromRaw(rawAnswers);
            const scoreOutput = computeTayyibatScore(a);
            const patterns    = detectPatterns(a);
            const logCount    = getMealLogCount();
            const contradictions = detectContradictions(a, []);
            const conf = computeConfidence(
                Object.keys(rawAnswers).length,
                mode === 'quick' ? 7 : 25,
                logCount,
                contradictions
            );

            const stored: StoredTayyibatResult = {
                sessionId:          `res_${Date.now()}`,
                computedAt:         new Date().toISOString(),
                overallScore:       scoreOutput.overallCompatibility,
                primaryPattern:     patterns.primaryPattern,
                secondaryPatterns:  patterns.secondaryPatterns,
                confidenceScore:    conf.score,
                confidenceLabel:    conf.label,
                topThreeGaps:       scoreOutput.topThreeGaps,
                firstStepToday:     scoreOutput.firstStep24h,
                sevenDayPlan:       scoreOutput.weeklyPlan,
                hasSafetyGate:      patterns.safetyGated || hasRedFlagAnswers(rawAnswers),
                mealLogCountAtTime: logCount,
                fullOutput:         scoreOutput,
            };

            saveResult(stored);
            setResult(stored);
            setTrackerConf(getConfidenceWithTrackerData());
            trackEvent('tayyibat_result_viewed', {
                pattern: stored.primaryPattern,
                score:   stored.overallScore,
                mode,
            });
        } catch (e) {
            console.error('Tayyibat result error:', e);
            router.replace('/tayyibat/assessment');
        } finally {
            setLoading(false);
        }
    }, []);

    if (loading) return (
        <div dir="rtl" style={{background:'linear-gradient(168deg,#E8FBF0,#D0F8E8)',minHeight:'100svh',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <motion.div animate={{rotate:360}} transition={{duration:1.2,repeat:Infinity,ease:'linear'}}
                style={{width:36,height:36,borderRadius:'50%',border:'3px solid rgba(5,150,105,0.15)',borderTopColor:W.green}} />
        </div>
    );

    if (!result) return null;

    const pattern  = PATTERN_DESCRIPTIONS[result.primaryPattern];
    const isSafe   = result.hasSafetyGate;
    const confConf = trackerConf ?? { score: result.confidenceScore, label: result.confidenceLabel, note: null };

    return (
        <div dir="rtl" style={{background:'linear-gradient(168deg,#E8FBF0,#D0F8E8,#F0FBF5)',minHeight:'100svh',padding:'0 0 120px'}}>
            <Head>
                <title>نتيجة تقييم الطيبات — طبرا</title>
                <meta name="description" content="نتيجتك الشخصية من تقييم نظام الطيبات — الثغرات والخطوات والخطة" />
            </Head>

            {/* Header */}
            <div style={{background:'rgba(232,251,240,0.88)',backdropFilter:'blur(20px)',padding:'52px 16px 16px',borderBottom:`1px solid ${W.glassBorder}`}}>
                <motion.button whileTap={{scale:0.88}} onClick={()=>router.push('/tayyibat')}
                    className="flex items-center gap-2 mb-4"
                    style={{background:W.glass,border:`1px solid ${W.glassBorder}`,borderRadius:20,padding:'7px 14px'}}>
                    <ArrowRight style={{width:14,height:14,color:W.textSub}} />
                    <span style={{fontSize:11,fontWeight:700,color:W.textSub}}>الطيبات</span>
                </motion.button>
                <h1 style={{fontSize:22,fontWeight:900,color:W.textPrimary}}>نتيجة تقييم الطيبات</h1>
                <p style={{fontSize:11,fontWeight:600,color:W.textMuted,marginTop:4}}>
                    {new Date(result.computedAt).toLocaleDateString('ar-SA', {weekday:'long',day:'numeric',month:'long'})}
                </p>
            </div>

            <div className="px-4 pt-5 space-y-4">

                {/* Safety Gate — أهم عنصر */}
                {isSafe && (
                    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                        className="rounded-[22px] p-5"
                        style={{background:'rgba(8,145,178,0.07)',border:'1.5px solid rgba(8,145,178,0.22)' }}>
                        <div className="flex items-center gap-3 mb-3">
                            <span style={{fontSize:18}}>🩺</span>
                            <p style={{fontSize:15,fontWeight:900,color:W.textPrimary}}>تقييم طبي مقترح أولاً</p>
                        </div>
                        <p style={{fontSize:12,fontWeight:600,color:W.textSub,lineHeight:1.8,marginBottom:12}}>
                            {RED_FLAG_DISCLAIMER}
                        </p>
                        <motion.button whileTap={{scale:0.97}} onClick={()=>setShowFlags(!showFlags)}
                            className="flex items-center gap-2 mb-3">
                            <span style={{fontSize:11,fontWeight:700,color:W.teal}}>التفاصيل</span>
                            <motion.div animate={{rotate:showFlags?180:0}}>
                                <ChevronDown style={{width:14,height:14,color:W.teal}} />
                            </motion.div>
                        </motion.button>
                        <AnimatePresence>
                            {showFlags && (
                                <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}}>
                                    {result.fullOutput.medicalRedFlags.map((f,i)=>(
                                        <div key={i} className="flex items-center gap-2 py-1">
                                            <span style={{fontSize:8,color:W.teal}}>●</span>
                                            <p style={{fontSize:11,fontWeight:600,color:W.textSub}}>{f}</p>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <motion.button whileTap={{scale:0.97}} onClick={()=>router.push('/book-appointment')}
                            className="w-full rounded-[18px] py-4 mt-2"
                            style={{background:'linear-gradient(135deg,#0891B2,#0E7490)',border:'none'}}>
                            <span style={{fontSize:14,fontWeight:900,color:'#fff'}}>احجز استشارة</span>
                        </motion.button>
                    </motion.div>
                )}

                {/* Score + Pattern + Confidence */}
                <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.1}}
                    className="rounded-[24px] p-5"
                    style={{background:pattern.color,border:`1.5px solid ${W.glassBorder}`,boxShadow:W.glassShadow}}>
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p style={{fontSize:12,fontWeight:700,color:W.textMuted}}>درجة التوافق مع الطيبات</p>
                            <p style={{fontSize:42,fontWeight:900,color:W.textPrimary,lineHeight:1,marginTop:2}}>
                                {result.overallScore}<span style={{fontSize:18}}>٪</span>
                            </p>
                        </div>
                        <span style={{fontSize:36}}>{pattern.icon}</span>
                    </div>
                    {/* Pattern badge */}
                    <div className="rounded-[14px] p-3 mb-3" style={{background:'rgba(255,255,255,0.60)',border:`1px solid ${W.glassBorder}`}}>
                        <p style={{fontSize:11,fontWeight:800,color:W.textMuted,marginBottom:2}}>النمط الرئيسي</p>
                        <p style={{fontSize:15,fontWeight:900,color:W.textPrimary}}>{pattern.label}</p>
                        <p style={{fontSize:11,fontWeight:600,color:W.textSub,marginTop:4,lineHeight:1.6}}>{pattern.summary}</p>
                    </div>
                    {/* Secondary patterns */}
                    {result.secondaryPatterns.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {result.secondaryPatterns.map(p=>(
                                <span key={p} style={{fontSize:10,fontWeight:700,color:W.textSub,background:'rgba(255,255,255,0.55)',padding:'3px 10px',borderRadius:12,border:`1px solid ${W.glassBorder}`}}>
                                    {PATTERN_DESCRIPTIONS[p].icon} {PATTERN_DESCRIPTIONS[p].label}
                                </span>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Confidence */}
                <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.15}}
                    className="rounded-[18px] p-4"
                    style={{background:W.glass,border:`1px solid ${W.glassBorder}`}}>
                    <div className="flex items-center justify-between mb-2">
                        <p style={{fontSize:12,fontWeight:700,color:W.textPrimary}}>موثوقية النتيجة</p>
                        <span style={{fontSize:11,fontWeight:800,color:CONFIDENCE_COLORS[confConf.label],background:`rgba(${confConf.label==='high'?'5,150,105':confConf.label==='medium'?'217,119,6':'156,163,175'},0.10)`,padding:'3px 10px',borderRadius:12}}>
                            {CONFIDENCE_AR[confConf.label]} ({confConf.score}٪)
                        </span>
                    </div>
                    {confConf.note && (
                        <p style={{fontSize:11,fontWeight:600,color:W.textSub,lineHeight:1.6}}>{confConf.note}</p>
                    )}
                    {!confConf.note && getMealLogCount() < 5 && (
                        <p style={{fontSize:11,fontWeight:600,color:W.textMuted,lineHeight:1.6}}>
                            سجّل ٥ وجبات على الأقل لرفع دقة النتيجة.
                        </p>
                    )}
                </motion.div>

                {/* Top 3 Gaps */}
                <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
                    className="rounded-[22px] p-5"
                    style={{background:W.glass,border:`1px solid ${W.glassBorder}`,boxShadow:W.glassShadow}}>
                    <p style={{fontSize:13,fontWeight:900,color:W.textPrimary,marginBottom:12}}>أكبر ٣ ثغرات</p>
                    {result.topThreeGaps.map((gap,i)=>(
                        <div key={i} className="flex items-start gap-3 py-2.5" style={{borderTop:i>0?'1px solid rgba(255,255,255,0.5)':'none'}}>
                            <span style={{fontSize:13,fontWeight:900,color:W.textMuted,width:18,flexShrink:0}}>{i+1}</span>
                            <p style={{fontSize:11,fontWeight:600,color:W.textSub,lineHeight:1.7}}>{gap}</p>
                        </div>
                    ))}
                </motion.div>

                {/* First Step Today */}
                <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.25}}
                    className="rounded-[22px] p-5"
                    style={{background:'rgba(5,150,105,0.08)',border:'1.5px solid rgba(5,150,105,0.25)'}}>
                    <p style={{fontSize:11,fontWeight:800,color:W.green,marginBottom:6}}>⚡ خطوتك الأولى اليوم</p>
                    <p style={{fontSize:14,fontWeight:900,color:W.textPrimary,lineHeight:1.6}}>{result.firstStepToday}</p>
                </motion.div>

                {/* 7-Day Plan */}
                <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
                    className="rounded-[22px] p-5"
                    style={{background:W.glass,border:`1px solid ${W.glassBorder}`,boxShadow:W.glassShadow}}>
                    <p style={{fontSize:13,fontWeight:900,color:W.textPrimary,marginBottom:12}}>📅 خطة ٧ أيام</p>
                    {result.sevenDayPlan.map((day,i)=>(
                        <div key={i} className="flex items-start gap-3 py-2" style={{borderTop:i>0?'1px solid rgba(255,255,255,0.45)':'none'}}>
                            <span style={{fontSize:9,color:W.green,marginTop:5,flexShrink:0}}>★</span>
                            <p style={{fontSize:11,fontWeight:600,color:W.textSub,lineHeight:1.7}}>{day}</p>
                        </div>
                    ))}
                </motion.div>

                {/* Protocol (not shown if safety gated) */}
                {!isSafe && result.fullOutput.recommendedProtocol && (
                    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.35}}
                        className="rounded-[22px] p-5"
                        style={{background:'rgba(8,145,178,0.07)',border:'1px solid rgba(8,145,178,0.22)'}}>
                        <p style={{fontSize:11,fontWeight:800,color:W.teal,marginBottom:4}}>🧪 البروتوكول المقترح</p>
                        <p style={{fontSize:14,fontWeight:900,color:W.textPrimary}}>
                            {result.fullOutput.recommendedProtocol === 'gut_reset'     ? 'بروتوكول إعادة ضبط الهضم ٣٠ يوماً'
                           : result.fullOutput.recommendedProtocol === 'anti_inflammation' ? 'بروتوكول مكافحة الالتهاب ٤٥ يوماً'
                           : 'بروتوكول الأساس ٢١ يوماً'}
                        </p>
                        <p style={{fontSize:11,fontWeight:600,color:W.textSub,marginTop:4}}>{pattern.primaryRecommendation}</p>
                    </motion.div>
                )}

                {/* Tracker CTA */}
                <motion.button whileTap={{scale:0.97}} onClick={()=>{ trackEvent('tracker_cta_clicked'); router.push('/tayyibat/tracker'); }}
                    initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.40}}
                    className="w-full rounded-[22px] p-5 flex items-center gap-4"
                    style={{background:'linear-gradient(135deg,#059669,#047857)',border:'none',boxShadow:'0 8px 24px rgba(5,150,105,0.25)'}}>
                    <Utensils style={{width:22,height:22,color:'rgba(255,255,255,0.9)',flexShrink:0}} />
                    <div className="text-right">
                        <p style={{fontSize:15,fontWeight:900,color:'#fff'}}>ابدأ سجل الوجبات</p>
                        <p style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.75)'}}>
                            سجّل ٥ وجبات لرفع موثوقية نتيجتك
                        </p>
                    </div>
                </motion.button>

                {/* Attribution */}
                <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.45}}
                    className="rounded-[18px] p-4"
                    style={{background:'rgba(8,145,178,0.04)',border:'1px solid rgba(8,145,178,0.12)'}}>
                    <motion.button onClick={()=>setShowAttrib(!showAttrib)}
                        className="flex items-center justify-between w-full">
                        <p style={{fontSize:11,fontWeight:800,color:W.teal}}>
                            🌿 {ATTRIBUTION_TEXTS.badge}
                        </p>
                        <motion.div animate={{rotate:showAttrib?180:0}}>
                            <ChevronDown style={{width:13,height:13,color:W.textMuted}} />
                        </motion.div>
                    </motion.button>
                    <AnimatePresence>
                        {showAttrib && (
                            <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden">
                                <p style={{fontSize:11,fontWeight:600,color:W.textSub,lineHeight:1.7,marginTop:8}}>
                                    {ATTRIBUTION_TEXTS.expandedBody}
                                </p>
                                <p style={{fontSize:10,fontWeight:700,color:W.green,marginTop:6}}>
                                    {ATTRIBUTION_TEXTS.tibrahAdds}
                                </p>
                                <a href={TAYYIBAT_ATTRIBUTION.website} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center gap-1 mt-2" style={{textDecoration:'none'}}>
                                    <ExternalLink style={{width:11,height:11,color:W.textMuted}} />
                                    <span style={{fontSize:10,fontWeight:700,color:W.textMuted}}>{TAYYIBAT_ATTRIBUTION.website}</span>
                                </a>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Disclaimer */}
                <p style={{fontSize:10,fontWeight:600,color:W.textMuted,textAlign:'center',lineHeight:1.7,padding:'0 4px'}}>
                    {ATTRIBUTION_TEXTS.disclaimer}
                </p>

                {/* Reassess */}
                <motion.button whileTap={{scale:0.95}} onClick={()=>router.push('/tayyibat/assessment')}
                    className="w-full flex items-center justify-center gap-2 rounded-[18px] py-4"
                    style={{background:'transparent',border:`1px solid ${W.glassBorder}`}}>
                    <RotateCcw style={{width:14,height:14,color:W.textMuted}} />
                    <span style={{fontSize:12,fontWeight:700,color:W.textMuted}}>أعد التقييم</span>
                </motion.button>
            </div>
        </div>
    );
}

// ── بناء TayyibatAnswers من الإجابات الخام ──
function buildAnswersFromRaw(raw: Record<string, string | string[]>): Parameters<typeof computeTayyibatScore>[0] {
    const get = (id: string, fallback: string) => (typeof raw[id] === 'string' ? raw[id] as string : fallback);
    return {
        oilType:        get('q_oil', 'unknown') as any,
        sugarLevel:     get('q_sugar', 'weekly') as any,
        proteinFreq:    get('q_protein', 'once') as any,
        vegetableFreq:  get('q_veg', 'few') as any,
        processedFood:  get('q_processed', 'often') as any,
        mealTiming:     get('q_timing', 'partial') as any,
        bloatingFreq:   get('q_bloating', 'sometimes') as any,
        gasFreq:        get('q_gas', 'sometimes') as any,
        constipation:   get('q_constipation', 'sometimes') as any,
        acidReflux:     get('q_acid', 'sometimes') as any,
        morningFatigue: get('q_morning', 'sometimes') as any,
        postMealCrash:  get('q_energy', 'sometimes') as any,
        sugarCraving:   get('q_craving', 'mild') as any,
        afternoonSlump: get('q_afternoon', 'sometimes') as any,
        jointPain:      get('q_joint', 'none') as any,
        headacheFreq:   get('q_headache', 'rarely') as any,
        skinIssues:     get('q_skin', 'none') as any,
        sleepQuality:   get('q_sleep', 'fair') as any,
        focusLevel:     get('q_focus', 'fair') as any,
        knowledgeLevel: get('q_know', 'little') as any,
        currentLevel:   get('q_level', 'none') as any,
        biggestChallenge: get('q_challenge', ''),
    };
}
