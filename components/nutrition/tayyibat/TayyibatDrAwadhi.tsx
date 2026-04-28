'use client';
// components/nutrition/tayyibat/TayyibatDrAwadhi.tsx
// عرض نظام د. ضياء العوضي — مقارنة + أطعمة مفاجئة + قواعد اليومية
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertTriangle, BookOpen, ChevronDown, Scale, Star } from 'lucide-react';
import {
    DR_AWADHI_PRINCIPLES,
    DR_AWADHI_ALLOWED,
    DR_AWADHI_FORBIDDEN,
    DR_AWADHI_SYMPTOM_INDICATORS,
    DR_AWADHI_MEAL_RULES,
    SYSTEM_COMPARISON,
} from '@/lib/tayyibat/dr-awadhi-system';

const W = {
    glass:'rgba(255,255,255,0.60)', glassHigh:'rgba(255,255,255,0.80)',
    glassBorder:'rgba(255,255,255,0.88)', glassShadow:'0 8px 32px rgba(5,150,105,0.10)',
    sheen:'linear-gradient(180deg,rgba(255,255,255,0.75) 0%,transparent 100%)',
    green:'#059669', textPrimary:'#0C4A6E', textSub:'#0369A1', textMuted:'#7DD3FC',
    amber:'#D97706', red:'#DC2626', teal:'#0891B2',
};

type Section = 'principles' | 'foods' | 'symptoms' | 'meals' | 'compare';

const SECTIONS: Array<{id: Section; label: string; icon: React.ReactNode}> = [
    { id:'principles', label:'المبادئ', icon:<Zap style={{width:13,height:13}}/> },
    { id:'foods',      label:'الأطعمة', icon:<Star style={{width:13,height:13}}/> },
    { id:'symptoms',   label:'المؤشرات', icon:<AlertTriangle style={{width:13,height:13}}/> },
    { id:'meals',      label:'الروتين', icon:<BookOpen style={{width:13,height:13}}/> },
    { id:'compare',    label:'المقارنة', icon:<Scale style={{width:13,height:13}}/> },
];

export function TayyibatDrAwadhi() {
    const [section, setSection] = useState<Section>('principles');
    const [openIdx, setOpenIdx] = useState<number|null>(null);
    const [foodTab, setFoodTab] = useState<'allowed'|'forbidden'>('forbidden');

    return (
        <div className="space-y-4" style={{direction:'rtl'}}>
            {/* Source badge */}
            <div className="flex items-center gap-2.5 rounded-[16px] px-4 py-3"
                style={{background:'rgba(8,145,178,0.07)',border:'1px solid rgba(8,145,178,0.20)'}}>
                <span style={{fontSize:18}}>👨‍⚕️</span>
                <div>
                    <p style={{fontSize:12,fontWeight:900,color:W.teal}}>نظام د. ضياء العوضي</p>
                    <p style={{fontSize:10,fontWeight:600,color:W.textMuted}}>altayebaat.com — مُدمج وموسَّع في طبرا</p>
                </div>
            </div>

            {/* Section tabs */}
            <div className="flex gap-1 p-1 rounded-[14px] overflow-x-auto"
                style={{background:'rgba(8,145,178,0.04)',border:`1px solid ${W.glassBorder}`}}>
                {SECTIONS.map(s => (
                    <motion.button key={s.id} whileTap={{scale:0.95}}
                        onClick={()=>setSection(s.id)}
                        className="flex-shrink-0 rounded-[10px] px-3 py-2 flex items-center gap-1"
                        style={{
                            background: section===s.id ? W.glassHigh : 'transparent',
                            border: section===s.id ? `1px solid ${W.glassBorder}` : '1px solid transparent',
                            color: section===s.id ? W.teal : W.textMuted,
                        }}>
                        {s.icon}
                        <span style={{fontSize:10,fontWeight:800}}>{s.label}</span>
                    </motion.button>
                ))}
            </div>

            <AnimatePresence mode="wait">

                {/* ── PRINCIPLES ── */}
                {section === 'principles' && (
                    <motion.div key="principles" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="space-y-2">
                        {DR_AWADHI_PRINCIPLES.map((p,i) => (
                            <motion.div key={p.id} className="rounded-[20px] overflow-hidden"
                                style={{background:W.glass,border:`1px solid ${W.glassBorder}`,boxShadow:W.glassShadow}}>
                                <button className="w-full flex items-center gap-3 px-4 py-4 text-right"
                                    onClick={()=>setOpenIdx(openIdx===i?null:i)}>
                                    <span style={{fontSize:22}}>{p.icon}</span>
                                    <div className="flex-1">
                                        <p style={{fontSize:13,fontWeight:900,color:W.textPrimary}}>{p.title}</p>
                                        <p style={{fontSize:11,fontWeight:600,color:W.textMuted,marginTop:2}}>{p.summary}</p>
                                    </div>
                                    <motion.div animate={{rotate:openIdx===i?180:0}}>
                                        <ChevronDown style={{width:14,height:14,color:W.textMuted}}/>
                                    </motion.div>
                                </button>
                                <AnimatePresence>
                                    {openIdx===i && (
                                        <motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden">
                                            <div className="px-4 pb-4 space-y-3">
                                                <p style={{fontSize:12,fontWeight:600,color:W.textSub,lineHeight:1.8}}>{p.detail}</p>
                                                <div className="rounded-[14px] p-3" style={{background:'rgba(8,145,178,0.07)',border:'1px solid rgba(8,145,178,0.18)'}}>
                                                    <p style={{fontSize:10,fontWeight:800,color:W.teal,marginBottom:4}}>التطبيق السريري</p>
                                                    <p style={{fontSize:11,fontWeight:600,color:W.textSub,lineHeight:1.7}}>{p.clinicalImplication}</p>
                                                </div>
                                                <p style={{fontSize:9.5,fontWeight:600,color:W.textMuted,lineHeight:1.6}}>📚 {p.evidenceAlignment}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* ── FOODS ── */}
                {section === 'foods' && (
                    <motion.div key="foods" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="space-y-3">
                        <div className="flex gap-1 p-1 rounded-[12px]" style={{background:'rgba(8,145,178,0.04)',border:`1px solid ${W.glassBorder}`}}>
                            {(['allowed','forbidden'] as const).map(t => (
                                <button key={t} className="flex-1 rounded-[9px] py-2"
                                    onClick={()=>setFoodTab(t)}
                                    style={{background:foodTab===t?W.glassHigh:'transparent',border:foodTab===t?`1px solid ${W.glassBorder}`:'1px solid transparent',fontSize:11,fontWeight:800,color:foodTab===t?(t==='allowed'?W.green:W.red):W.textMuted}}>
                                    {t==='allowed'?'✅ المسموح':'⛔ الممنوع'}
                                </button>
                            ))}
                        </div>

                        {foodTab === 'allowed' && (
                            <div className="space-y-2">
                                {DR_AWADHI_ALLOWED.map((f,i) => (
                                    <motion.div key={f.id} initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
                                        className="rounded-[18px] p-3.5" style={{background:'rgba(5,150,105,0.07)',border:'1px solid rgba(5,150,105,0.20)'}}>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span style={{fontSize:20}}>{f.emoji}</span>
                                            <span style={{fontSize:13,fontWeight:900,color:W.textPrimary}}>{f.name}</span>
                                            <span style={{fontSize:9,fontWeight:700,color:W.textMuted,background:'rgba(8,145,178,0.08)',padding:'2px 7px',borderRadius:8}}>{f.category}</span>
                                        </div>
                                        <p style={{fontSize:11,fontWeight:600,color:W.textSub,lineHeight:1.7,paddingRight:28}}>{f.why}</p>
                                        {f.note && <p style={{fontSize:10,fontWeight:700,color:W.amber,marginTop:4,paddingRight:28}}>⚠️ {f.note}</p>}
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {foodTab === 'forbidden' && (
                            <div className="space-y-2">
                                {DR_AWADHI_FORBIDDEN.map((f,i) => (
                                    <motion.div key={f.id} initial={{opacity:0,x:8}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}
                                        className="rounded-[18px] p-3.5"
                                        style={{background:f.surprise?'rgba(217,119,6,0.07)':'rgba(220,38,38,0.07)',border:`1px solid ${f.surprise?'rgba(217,119,6,0.22)':'rgba(220,38,38,0.20)'}`}}>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span style={{fontSize:20}}>{f.emoji}</span>
                                            <span style={{fontSize:13,fontWeight:900,color:W.textPrimary}}>{f.name}</span>
                                            {f.surprise && <span style={{fontSize:9,fontWeight:800,color:W.amber,background:'rgba(217,119,6,0.12)',padding:'2px 7px',borderRadius:8}}>مفاجئ!</span>}
                                        </div>
                                        <p style={{fontSize:11,fontWeight:600,color:W.textSub,lineHeight:1.7,paddingRight:28}}>{f.why}</p>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ── SYMPTOMS ── */}
                {section === 'symptoms' && (
                    <motion.div key="symptoms" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="space-y-2">
                        <p style={{fontSize:11,fontWeight:700,color:W.textMuted,paddingRight:4}}>مؤشرات يستخدمها د. ضياء لقياس الاستجابة للنظام</p>
                        {DR_AWADHI_SYMPTOM_INDICATORS.map((s,i) => (
                            <motion.div key={s.id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                                className="rounded-[20px] p-4" style={{background:W.glass,border:`1px solid ${W.glassBorder}`,boxShadow:'0 2px 8px rgba(0,0,0,0.03)'}}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span style={{fontSize:20}}>{s.icon}</span>
                                    <p style={{fontSize:13,fontWeight:900,color:W.textPrimary}}>{s.label}</p>
                                </div>
                                <p style={{fontSize:11,fontWeight:600,color:W.textSub,lineHeight:1.7,marginBottom:8}}>{s.meaning}</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="rounded-[12px] p-2.5" style={{background:'rgba(5,150,105,0.08)',border:'1px solid rgba(5,150,105,0.18)'}}>
                                        <p style={{fontSize:9,fontWeight:800,color:W.green,marginBottom:3}}>✅ جيد</p>
                                        <p style={{fontSize:10,fontWeight:600,color:W.textSub,lineHeight:1.6}}>{s.good}</p>
                                    </div>
                                    <div className="rounded-[12px] p-2.5" style={{background:'rgba(220,38,38,0.07)',border:'1px solid rgba(220,38,38,0.18)'}}>
                                        <p style={{fontSize:9,fontWeight:800,color:W.red,marginBottom:3}}>⚠️ تحذير</p>
                                        <p style={{fontSize:10,fontWeight:600,color:W.textSub,lineHeight:1.6}}>{s.bad}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* ── MEALS ── */}
                {section === 'meals' && (
                    <motion.div key="meals" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="space-y-3">
                        {(['breakfast','lunch','dinner'] as const).map((slot,i) => {
                            const m = DR_AWADHI_MEAL_RULES[slot];
                            const labels = {breakfast:'🌅 الفطور',lunch:'☀️ الغداء',dinner:'🌙 العشاء'};
                            const colors = {breakfast:'rgba(217,119,6,0.08)',lunch:'rgba(5,150,105,0.08)',dinner:'rgba(8,145,178,0.07)'};
                            const borders = {breakfast:'rgba(217,119,6,0.22)',lunch:'rgba(5,150,105,0.22)',dinner:'rgba(8,145,178,0.22)'};
                            return (
                                <motion.div key={slot} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
                                    className="rounded-[20px] p-4" style={{background:colors[slot],border:`1px solid ${borders[slot]}`}}>
                                    <p style={{fontSize:14,fontWeight:900,color:W.textPrimary,marginBottom:2}}>{labels[slot]}</p>
                                    <p style={{fontSize:10,fontWeight:700,color:W.textMuted,marginBottom:10}}>⏰ {m.time}</p>
                                    <div className="space-y-1 mb-3">
                                        {m.components.map((c,j) => (
                                            <div key={j} className="flex items-center gap-2">
                                                <span style={{fontSize:8,color:W.green}}>●</span>
                                                <p style={{fontSize:11,fontWeight:700,color:W.textPrimary}}>{c}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <p style={{fontSize:10.5,fontWeight:600,color:W.textSub,lineHeight:1.7,paddingTop:8,borderTop:'1px solid rgba(255,255,255,0.5)'}}>{m.why}</p>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {m.avoid.map((a,j) => (
                                            <span key={j} style={{fontSize:9,fontWeight:700,color:W.red,background:'rgba(220,38,38,0.08)',padding:'2px 7px',borderRadius:8}}>⛔ {a}</span>
                                        ))}
                                    </div>
                                </motion.div>
                            );
                        })}
                        <div className="rounded-[20px] p-4" style={{background:W.glass,border:`1px solid ${W.glassBorder}`}}>
                            <p style={{fontSize:13,fontWeight:900,color:W.textPrimary,marginBottom:10}}>🔑 القواعد الذهبية</p>
                            {DR_AWADHI_MEAL_RULES.goldenRules.map((r,i) => (
                                <div key={i} className="flex items-start gap-2 py-1.5" style={{borderTop:i>0?'1px solid rgba(255,255,255,0.5)':'none'}}>
                                    <span style={{fontSize:8,color:W.green,marginTop:4}}>★</span>
                                    <p style={{fontSize:11,fontWeight:700,color:W.textSub,lineHeight:1.7}}>{r}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── COMPARE ── */}
                {section === 'compare' && (
                    <motion.div key="compare" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="space-y-3">
                        <p style={{fontSize:11,fontWeight:700,color:W.textMuted,paddingRight:4}}>مقارنة نظام د. ضياء مع العلم الحديث — موقف طبرا في المنتصف</p>
                        {SYSTEM_COMPARISON.map((c,i) => (
                            <motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
                                className="rounded-[20px] p-4" style={{background:W.glass,border:`1px solid ${W.glassBorder}`,boxShadow:'0 2px 8px rgba(0,0,0,0.03)'}}>
                                <p style={{fontSize:13,fontWeight:900,color:W.textPrimary,marginBottom:8}}>📌 {c.topic}</p>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div className="rounded-[12px] p-2.5" style={{background:'rgba(8,145,178,0.07)',border:'1px solid rgba(8,145,178,0.18)'}}>
                                        <p style={{fontSize:9,fontWeight:800,color:W.teal,marginBottom:3}}>👨‍⚕️ د. ضياء</p>
                                        <p style={{fontSize:10,fontWeight:600,color:W.textSub,lineHeight:1.6}}>{c.awadhi}</p>
                                    </div>
                                    <div className="rounded-[12px] p-2.5" style={{background:'rgba(5,150,105,0.07)',border:'1px solid rgba(5,150,105,0.18)'}}>
                                        <p style={{fontSize:9,fontWeight:800,color:W.green,marginBottom:3}}>🔬 العلم الحديث</p>
                                        <p style={{fontSize:10,fontWeight:600,color:W.textSub,lineHeight:1.6}}>{c.modern}</p>
                                    </div>
                                </div>
                                <div className="rounded-[12px] p-2.5" style={{background:'rgba(5,150,105,0.10)',border:'1px solid rgba(5,150,105,0.25)'}}>
                                    <p style={{fontSize:9,fontWeight:800,color:W.green,marginBottom:3}}>🌿 موقف طبرا</p>
                                    <p style={{fontSize:10,fontWeight:700,color:W.textPrimary,lineHeight:1.6}}>{c.tibbrah_position}</p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

            </AnimatePresence>
        </div>
    );
}
