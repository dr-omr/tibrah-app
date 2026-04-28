// pages/tayyibat/tracker.tsx
// Route: /tayyibat/tracker — سجل الوجبات + الرؤى الأسبوعية
'use client';
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ArrowRight, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

import type { TayyibatMeal, MealType, TayyibatCompliance } from '@/lib/tayyibat/meal-tracker';
import { buildWeeklyInsight, buildDaySummary, MEAL_TYPE_AR, COMPLIANCE_AR } from '@/lib/tayyibat/meal-tracker';
import { addMealLog, getMealLogs, getMealLogsForLastNDays, getConfidenceWithTrackerData }
    from '@/lib/tayyibat/tayyibat-store';
import { ATTRIBUTION_TEXTS } from '@/lib/tayyibat/attribution';
import { trackEvent } from '@/lib/analytics';

const W = {
    glass:'rgba(255,255,255,0.62)', glassHigh:'rgba(255,255,255,0.80)',
    glassBorder:'rgba(255,255,255,0.88)', glassShadow:'0 8px 32px rgba(5,150,105,0.10)',
    green:'#059669', textPrimary:'#0C4A6E', textSub:'#0369A1', textMuted:'#7DD3FC',
    amber:'#D97706', red:'#DC2626', teal:'#0891B2',
};

type TrackerTab = 'log' | 'insights';

export default function TayyibatTrackerPage() {
    const router = useRouter();
    const [tab, setTab]           = useState<TrackerTab>('log');
    const [logs, setLogs]         = useState<TayyibatMeal[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [conf, setConf]         = useState<ReturnType<typeof getConfidenceWithTrackerData>|null>(null);

    // Form state
    const [mealType, setMealType]         = useState<MealType>('lunch');
    const [foods, setFoods]               = useState('');
    const [compliance, setCompliance]     = useState<TayyibatCompliance>('partial');
    const [bloating, setBloating]         = useState<number>(3);
    const [energy, setEnergy]             = useState<number>(6);
    const [mood, setMood]                 = useState<number>(6);
    const [cravings, setCravings]         = useState<number>(3);
    const [sleepEffect, setSleepEffect]   = useState<number|null>(null);
    const [notes, setNotes]               = useState('');

    useEffect(() => {
        const l = getMealLogs();
        setLogs(l);
        setConf(getConfidenceWithTrackerData());
        trackEvent('tayyibat_result_viewed', { page: 'tracker' });
    }, []);

    const submitMeal = () => {
        const meal = addMealLog({
            mealType,
            foods: foods.split(',').map(f=>f.trim()).filter(Boolean),
            tayyibatCompliance: compliance,
            bloatingScore: bloating,
            energyScore: energy,
            moodScore: mood,
            cravingsAfterMeal: cravings,
            sleepEffect: mealType === 'dinner' ? sleepEffect : null,
            nauseaScore: null,
            notes,
            date: new Date().toISOString().split('T')[0],
        });
        const updatedLogs = getMealLogs();
        setLogs(updatedLogs);
        setConf(getConfidenceWithTrackerData());
        setShowForm(false);
        // reset
        setFoods(''); setNotes(''); setBloating(3); setEnergy(6); setMood(6); setCravings(3); setSleepEffect(null);
        trackEvent('meal_logged', { mealType, compliance });
    };

    // Weekly insights
    const weekLogs    = getMealLogsForLastNDays(7);
    const today       = new Date().toISOString().split('T')[0];
    const daySummary  = buildDaySummary(today, logs.filter(l=>l.date===today));
    const weekSummary = weekLogs.length >= 3
        ? buildWeeklyInsight([daySummary], weekLogs)
        : null;
    const enoughForInsights = weekLogs.length >= 5;

    return (
        <div dir="rtl" style={{background:'linear-gradient(168deg,#E8FBF0,#D0F8E8,#F0FBF5)',minHeight:'100svh',padding:'0 0 120px'}}>
            <Head>
                <title>سجل الوجبات — طبرا الطيبات</title>
                <meta name="description" content="سجّل وجباتك اليومية وتابع التزامك بنظام الطيبات" />
            </Head>

            {/* Header */}
            <div style={{background:'rgba(232,251,240,0.88)',backdropFilter:'blur(20px)',padding:'52px 16px 12px',borderBottom:`1px solid ${W.glassBorder}`}}>
                <motion.button whileTap={{scale:0.88}} onClick={()=>router.push('/tayyibat')}
                    className="flex items-center gap-2 mb-4"
                    style={{background:W.glass,border:`1px solid ${W.glassBorder}`,borderRadius:20,padding:'7px 14px'}}>
                    <ArrowRight style={{width:14,height:14,color:W.textSub}} />
                    <span style={{fontSize:11,fontWeight:700,color:W.textSub}}>الطيبات</span>
                </motion.button>
                <h1 style={{fontSize:20,fontWeight:900,color:W.textPrimary}}>سجل الوجبات</h1>
                <p style={{fontSize:11,fontWeight:600,color:W.textMuted,marginTop:2}}>
                    {ATTRIBUTION_TEXTS.badge}
                </p>
                {/* Tabs */}
                <div className="flex gap-1 mt-3 p-1 rounded-[14px]" style={{background:'rgba(5,150,105,0.05)',border:`1px solid ${W.glassBorder}`}}>
                    {([['log','اليومي'],['insights','رؤى الأسبوع']] as [TrackerTab,string][]).map(([t,l])=>(
                        <button key={t} onClick={()=>{ setTab(t); if(t==='insights') trackEvent('weekly_insight_viewed'); }}
                            className="flex-1 rounded-[10px] py-2"
                            style={{background:tab===t?W.glassHigh:'transparent',border:tab===t?`1px solid ${W.glassBorder}`:'1px solid transparent',fontSize:11,fontWeight:800,color:tab===t?W.textPrimary:W.textMuted}}>
                            {l}
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-4 pt-4 space-y-3">

                {/* Confidence banner */}
                {conf?.note && (
                    <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}}
                        className="rounded-[16px] p-3 flex items-center gap-2"
                        style={{background:'rgba(5,150,105,0.07)',border:'1px solid rgba(5,150,105,0.20)'}}>
                        <CheckCircle style={{width:16,height:16,color:W.green,flexShrink:0}} />
                        <p style={{fontSize:11,fontWeight:700,color:W.textSub}}>{conf.note}</p>
                    </motion.div>
                )}

                <AnimatePresence mode="wait">

                    {/* ── LOG TAB ── */}
                    {tab === 'log' && (
                        <motion.div key="log" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="space-y-3">
                            {/* Add button */}
                            <motion.button whileTap={{scale:0.97}} onClick={()=>setShowForm(!showForm)}
                                className="w-full rounded-[20px] p-4 flex items-center gap-3"
                                style={{background:showForm?'rgba(5,150,105,0.08)':'linear-gradient(135deg,#059669,#047857)',border:showForm?'1.5px solid rgba(5,150,105,0.30)':'none',boxShadow:showForm?'none':'0 6px 20px rgba(5,150,105,0.25)'}}>
                                <Plus style={{width:20,height:20,color:showForm?W.green:'#fff',flexShrink:0}} />
                                <span style={{fontSize:14,fontWeight:900,color:showForm?W.green:'#fff'}}>
                                    {showForm ? 'إلغاء' : 'سجّل وجبة جديدة'}
                                </span>
                            </motion.button>

                            {/* Meal form */}
                            <AnimatePresence>
                                {showForm && (
                                    <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                                        className="rounded-[24px] p-5 space-y-4 overflow-hidden"
                                        style={{background:W.glass,border:`1px solid ${W.glassBorder}`,boxShadow:W.glassShadow}}>

                                        {/* Meal type */}
                                        <div>
                                            <p style={{fontSize:12,fontWeight:800,color:W.textPrimary,marginBottom:8}}>نوع الوجبة</p>
                                            <div className="flex gap-2">
                                                {(['breakfast','lunch','dinner','snack'] as MealType[]).map(t=>(
                                                    <button key={t} onClick={()=>setMealType(t)}
                                                        style={{flex:1,padding:'8px 4px',borderRadius:14,border:mealType===t?`1.5px solid ${W.green}`:`1px solid ${W.glassBorder}`,background:mealType===t?'rgba(5,150,105,0.10)':W.glass,fontSize:10,fontWeight:800,color:mealType===t?W.green:W.textMuted}}>
                                                        {MEAL_TYPE_AR[t]}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Foods */}
                                        <div>
                                            <p style={{fontSize:12,fontWeight:800,color:W.textPrimary,marginBottom:6}}>الأطعمة (مفصولة بفاصلة)</p>
                                            <input value={foods} onChange={e=>setFoods(e.target.value)}
                                                placeholder="مثال: أرز، سمك، زيت زيتون"
                                                style={{width:'100%',padding:'12px 14px',borderRadius:16,border:`1px solid ${W.glassBorder}`,background:W.glassHigh,fontSize:12,fontWeight:600,color:W.textPrimary,outline:'none',direction:'rtl'}} />
                                        </div>

                                        {/* Compliance */}
                                        <div>
                                            <p style={{fontSize:12,fontWeight:800,color:W.textPrimary,marginBottom:8}}>الالتزام بالطيبات</p>
                                            <div className="flex gap-2">
                                                {(['yes','partial','no'] as TayyibatCompliance[]).map(c=>(
                                                    <button key={c} onClick={()=>setCompliance(c)}
                                                        style={{flex:1,padding:'10px 4px',borderRadius:14,border:compliance===c?`1.5px solid ${c==='yes'?W.green:c==='partial'?W.amber:W.red}`:`1px solid ${W.glassBorder}`,background:compliance===c?`rgba(${c==='yes'?'5,150,105':c==='partial'?'217,119,6':'220,38,38'},0.08)`:W.glass,fontSize:10,fontWeight:800,color:compliance===c?(c==='yes'?W.green:c==='partial'?W.amber:W.red):W.textMuted}}>
                                                        {c==='yes'?'✅ ملتزم':c==='partial'?'🔶 جزئي':'⛔ لا'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Scores */}
                                        {[
                                            {label:'الانتفاخ بعد الوجبة', val:bloating, set:setBloating, bad:true},
                                            {label:'الطاقة بعد الوجبة',   val:energy,   set:setEnergy,   bad:false},
                                            {label:'المزاج بعد الوجبة',   val:mood,     set:setMood,     bad:false},
                                            {label:'رغبة في السكر بعد ساعتين', val:cravings, set:setCravings, bad:true},
                                        ].map(({label,val,set,bad})=>(
                                            <div key={label}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <p style={{fontSize:11,fontWeight:800,color:W.textPrimary}}>{label}</p>
                                                    <span style={{fontSize:13,fontWeight:900,color:bad?(val>=7?W.red:val>=4?W.amber:W.green):(val>=7?W.green:val>=4?W.amber:W.red)}}>
                                                        {val}/١٠
                                                    </span>
                                                </div>
                                                <input type="range" min={0} max={10} value={val} onChange={e=>set(Number(e.target.value))}
                                                    style={{width:'100%',accentColor:W.green}} />
                                            </div>
                                        ))}

                                        {/* Sleep — dinner only */}
                                        {mealType === 'dinner' && (
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <p style={{fontSize:11,fontWeight:800,color:W.textPrimary}}>تأثير العشاء على النوم</p>
                                                    <span style={{fontSize:13,fontWeight:900,color:W.textSub}}>{sleepEffect ?? '-'}/١٠</span>
                                                </div>
                                                <input type="range" min={0} max={10} value={sleepEffect ?? 5} onChange={e=>setSleepEffect(Number(e.target.value))}
                                                    style={{width:'100%',accentColor:W.teal}} />
                                            </div>
                                        )}

                                        {/* Notes */}
                                        <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2}
                                            placeholder="ملاحظات اختيارية..."
                                            style={{width:'100%',padding:'10px 12px',borderRadius:14,border:`1px solid ${W.glassBorder}`,background:W.glassHigh,fontSize:11,fontWeight:600,color:W.textSub,outline:'none',resize:'none',direction:'rtl'}} />

                                        {/* Submit */}
                                        <motion.button whileTap={{scale:0.97}} onClick={submitMeal}
                                            disabled={!foods.trim()}
                                            className="w-full rounded-[18px] py-4"
                                            style={{background:foods.trim()?'linear-gradient(135deg,#059669,#047857)':'rgba(5,150,105,0.15)',border:'none'}}>
                                            <span style={{fontSize:14,fontWeight:900,color:foods.trim()?'#fff':W.green}}>حفظ الوجبة</span>
                                        </motion.button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Today's logs */}
                            <p style={{fontSize:12,fontWeight:800,color:W.textPrimary}}>وجبات اليوم ({logs.filter(l=>l.date===today).length})</p>
                            {logs.filter(l=>l.date===today).length === 0 ? (
                                <p style={{fontSize:12,fontWeight:600,color:W.textMuted,textAlign:'center',padding:'20px 0'}}>لم تسجّل أي وجبة اليوم بعد</p>
                            ) : (
                                logs.filter(l=>l.date===today).map((log,i)=>(
                                    <motion.div key={log.id} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
                                        className="rounded-[18px] p-4"
                                        style={{background:W.glass,border:`1px solid ${W.glassBorder}`}}>
                                        <div className="flex items-center justify-between mb-2">
                                            <p style={{fontSize:13,fontWeight:900,color:W.textPrimary}}>{MEAL_TYPE_AR[log.mealType]}</p>
                                            <span style={{fontSize:10,fontWeight:700,color:log.tayyibatCompliance==='yes'?W.green:log.tayyibatCompliance==='partial'?W.amber:W.red}}>
                                                {COMPLIANCE_AR[log.tayyibatCompliance]}
                                            </span>
                                        </div>
                                        <p style={{fontSize:11,fontWeight:600,color:W.textSub}}>{log.foods.join(' • ')}</p>
                                        <div className="flex gap-3 mt-2">
                                            {log.bloatingScore != null && <span style={{fontSize:10,fontWeight:700,color:W.textMuted}}>انتفاخ {log.bloatingScore}/١٠</span>}
                                            {log.energyScore != null   && <span style={{fontSize:10,fontWeight:700,color:W.textMuted}}>طاقة {log.energyScore}/١٠</span>}
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {/* ── INSIGHTS TAB ── */}
                    {tab === 'insights' && (
                        <motion.div key="insights" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="space-y-3">
                            {!enoughForInsights ? (
                                <div className="rounded-[22px] p-6 text-center" style={{background:W.glass,border:`1px solid ${W.glassBorder}`}}>
                                    <AlertCircle style={{width:28,height:28,color:W.amber,margin:'0 auto 12px'}} />
                                    <p style={{fontSize:14,fontWeight:900,color:W.textPrimary,marginBottom:6}}>بيانات غير كافية</p>
                                    <p style={{fontSize:12,fontWeight:600,color:W.textSub,lineHeight:1.7}}>
                                        سجّل ٥ وجبات على الأقل حتى نعطيك قراءة أوثق.
                                    </p>
                                    <p style={{fontSize:11,fontWeight:700,color:W.textMuted,marginTop:8}}>
                                        لديك {weekLogs.length} وجبة — أضف {Math.max(0,5-weekLogs.length)} أخرى
                                    </p>
                                </div>
                            ) : weekSummary ? (
                                <>
                                    {/* Adherence */}
                                    <div className="rounded-[22px] p-5" style={{background:W.glass,border:`1px solid ${W.glassBorder}`,boxShadow:W.glassShadow}}>
                                        <p style={{fontSize:12,fontWeight:800,color:W.textMuted,marginBottom:4}}>الالتزام الأسبوعي</p>
                                        <p style={{fontSize:36,fontWeight:900,color:W.green}}>{weekSummary.weeklyAdherencePercentage}٪</p>
                                        <div style={{height:6,borderRadius:8,background:'rgba(5,150,105,0.12)',marginTop:8,overflow:'hidden'}}>
                                            <div style={{height:'100%',width:`${weekSummary.weeklyAdherencePercentage}%`,background:'linear-gradient(90deg,#059669,#34D399)',borderRadius:8}} />
                                        </div>
                                        <p style={{fontSize:11,fontWeight:700,color:W.green,marginTop:8}}>
                                            {weekSummary.positiveReinforcement}
                                        </p>
                                    </div>

                                    {/* Insight cards */}
                                    {[
                                        weekSummary.mostSymptomLinkedMeal && { icon:'🫁', title:'الوجبة الأكثر ارتباطاً بالأعراض', value:MEAL_TYPE_AR[weekSummary.mostSymptomLinkedMeal] },
                                        weekSummary.mostRepeatedTriggerFood && { icon:'🔍', title:'الطعام المشتبه به كمحفز', value:weekSummary.mostRepeatedTriggerFood },
                                        weekSummary.bestEnergyDay && { icon:'⚡', title:'أفضل يوم طاقة', value:weekSummary.bestEnergyDay },
                                    ].filter(Boolean).map((item,i)=>item&&(
                                        <motion.div key={i} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                                            className="rounded-[18px] p-4 flex items-center gap-3"
                                            style={{background:W.glass,border:`1px solid ${W.glassBorder}`}}>
                                            <span style={{fontSize:22}}>{item.icon}</span>
                                            <div>
                                                <p style={{fontSize:10,fontWeight:700,color:W.textMuted}}>{item.title}</p>
                                                <p style={{fontSize:14,fontWeight:900,color:W.textPrimary}}>{item.value}</p>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {/* Next week focus */}
                                    <div className="rounded-[22px] p-5" style={{background:'rgba(5,150,105,0.07)',border:'1.5px solid rgba(5,150,105,0.22)'}}>
                                        <p style={{fontSize:11,fontWeight:800,color:W.green,marginBottom:6}}>🎯 تركيز الأسبوع القادم</p>
                                        <p style={{fontSize:13,fontWeight:700,color:W.textPrimary,lineHeight:1.7}}>{weekSummary.nextWeekFocus}</p>
                                    </div>

                                    {/* Insight summary */}
                                    <p style={{fontSize:11,fontWeight:600,color:W.textSub,lineHeight:1.7,padding:'0 4px'}}>{weekSummary.insightSummary}</p>

                                    {/* View result CTA */}
                                    <motion.button whileTap={{scale:0.97}} onClick={()=>router.push('/tayyibat/result')}
                                        className="w-full rounded-[18px] py-4 flex items-center justify-center gap-2"
                                        style={{background:'rgba(5,150,105,0.08)',border:'1.5px solid rgba(5,150,105,0.25)'}}>
                                        <TrendingUp style={{width:16,height:16,color:W.green}} />
                                        <span style={{fontSize:13,fontWeight:900,color:W.green}}>اعرض نتيجتك المحدّثة</span>
                                    </motion.button>
                                </>
                            ) : null}
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
