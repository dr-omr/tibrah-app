'use client';
// components/nutrition/TayyibatHeroSection.tsx
// قسم الإقناع والعرض العلمي لنظام الطيبات
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Flame, Shield, Brain, Heart, Zap, ChevronDown, Star } from 'lucide-react';

const W = {
    glass:       'rgba(255,255,255,0.58)',
    glassHigh:   'rgba(255,255,255,0.76)',
    glassBorder: 'rgba(255,255,255,0.88)',
    glassShadow: '0 8px 32px rgba(5,150,105,0.12), 0 2px 8px rgba(0,0,0,0.04)',
    sheen:       'linear-gradient(180deg,rgba(255,255,255,0.75) 0%,rgba(255,255,255,0.10) 50%,transparent 100%)',
    green:       '#059669', greenDeep: '#047857', greenLight: '#34D399',
    textPrimary: '#0C4A6E', textSub: '#0369A1', textMuted: '#7DD3FC',
    amber: '#D97706', red: '#DC2626',
};

const PILLARS = [
    { icon: <Leaf style={{width:18,height:18,color:W.green}}/>, title:'نباتي حي', sub:'خضار + فاكهة طازجة كل يوم', color:'rgba(5,150,105,0.08)', border:'rgba(5,150,105,0.20)' },
    { icon: <Flame style={{width:18,height:18,color:'#EA580C'}}/>, title:'بروتين نظيف', sub:'لحم + سمك + بيض غير مصنّع', color:'rgba(234,88,12,0.07)', border:'rgba(234,88,12,0.20)' },
    { icon: <Shield style={{width:18,height:18,color:W.textSub}}/>, title:'دهون مقدسة', sub:'زيت زيتون + أفوكادو + مكسرات', color:'rgba(3,105,161,0.07)', border:'rgba(3,105,161,0.18)' },
    { icon: <Brain style={{width:18,height:18,color:'#7C3AED'}}/>, title:'صفر سكر أبيض', sub:'لا شوكولاتة صناعية + لا عصائر', color:'rgba(124,58,237,0.07)', border:'rgba(124,58,237,0.18)' },
    { icon: <Heart style={{width:18,height:18,color:W.red}}/>, title:'قلبي ومناعي', sub:'أوميغا ٣ طبيعي من البحر', color:'rgba(220,38,38,0.07)', border:'rgba(220,38,38,0.18)' },
    { icon: <Zap style={{width:18,height:18,color:W.amber}}/>, title:'توقيت ذكي', sub:'إيقاع يومي + نافذة أكل مدروسة', color:'rgba(217,119,6,0.07)', border:'rgba(217,119,6,0.18)' },
];

const STATS = [
    { n:'🌿', label:'قد يُساهم ضبط الطعام في تحسين الطاقة والهضم — النتيجة تختلف من شخص لآخر' },
    { n:'📊', label:'تتبع الوجبات اليومي يُساعد على اكتشاف المحفزات الغذائية الشخصية' },
    { n:'🔬', label:'تدعم أبحاث التغذية الحديثة أهمية جودة الدهون والألياف وتنوع الطعام النباتي' },
];

const SCIENCES = [
    { q:'لماذا يُحسّن المزاج؟', a:'٩٠٪ من السيروتونين يُنتج في الأمعاء — الطيبات تغذّي البكتيريا المنتجة له مباشرة (Gut-Brain Axis).' },
    { q:'كيف يُخفض الالتهاب؟', a:'بحذف الزيوت المهدرجة والسكر الأبيض، تنخفض IL-6 وCRP خلال ٧–١٤ يوم. أوميغا ٣ يُنتج Resolvins (منهيات الالتهاب).' },
    { q:'لماذا يُعيد الطاقة؟', a:'البروتين + الدهون الصحية يُثبّتون سكر الدم — لا هبوط طاقة بعد الأكل. الميتوكوندريا تعمل بكفاءة أعلى.' },
    { q:'علاقته بالهرمونات؟', a:'الكوليسترول الصحي (بيض + أفوكادو) = مادة خام لجميع الهرمونات الجنسية والكظرية. Progesterone وTestosterone يحتاجان دهوناً صحية.' },
];

interface Props { onStartAssessment?: () => void; }

export function TayyibatHeroSection({ onStartAssessment }: Props) {
    const [openQ, setOpenQ] = useState<number | null>(null);

    return (
        <div className="space-y-5" style={{ direction: 'rtl' }}>

            {/* Hero card */}
            <motion.div
                initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }}
                className="rounded-[28px] overflow-hidden"
                style={{ background:'linear-gradient(145deg,rgba(5,150,105,0.10),rgba(34,211,153,0.06))', border:`1px solid ${W.glassBorder}`, boxShadow:W.glassShadow, position:'relative' }}
            >
                <div style={{ position:'absolute', inset:0, background:W.sheen, pointerEvents:'none' }} />
                <div className="p-6" style={{ position:'relative', zIndex:1 }}>
                    <div className="flex items-center gap-3 mb-4">
                        <div style={{ width:52, height:52, borderRadius:18, background:'linear-gradient(145deg,rgba(5,150,105,0.15),rgba(34,211,153,0.10))', border:`1.5px solid rgba(5,150,105,0.25)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <Leaf style={{ width:26, height:26, color:W.green }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize:22, fontWeight:900, color:W.textPrimary, letterSpacing:'-0.03em' }}>نظام الطيبات</h2>
                            <p style={{ fontSize:11, fontWeight:700, color:W.green }}>الغذاء الذي يُعالج · ليس فقط يُشبع</p>
                        </div>
                    </div>
                    <p style={{ fontSize:14, fontWeight:600, color:W.textSub, lineHeight:1.8 }}>
                        نظام غذائي سريري مبني على علم الميكروبيوم والكيمياء الحيوية — يحذف كل ما يُطفئ الميتوكوندريا ويُغذي ما يُنتج الطاقة والتوازن الهرموني.
                    </p>
                    <div className="flex gap-2 mt-4 flex-wrap">
                        {['مضاد التهاب','موازن هرمونات','دعم الأمعاء','طاقة مستدامة'].map(tag => (
                            <span key={tag} style={{ fontSize:10, fontWeight:800, color:W.green, background:'rgba(5,150,105,0.10)', border:'1px solid rgba(5,150,105,0.22)', padding:'4px 10px', borderRadius:20 }}>{tag}</span>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-2">
                {STATS.map((s, i) => (
                    <motion.div key={i} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
                        className="rounded-[20px] p-3 text-center"
                        style={{ background:W.glass, border:`1px solid ${W.glassBorder}`, boxShadow:W.glassShadow }}>
                        <p style={{ fontSize:22, fontWeight:900, color:W.green, letterSpacing:'-0.03em' }}>{s.n}</p>
                        <p style={{ fontSize:9, fontWeight:700, color:W.textMuted, lineHeight:1.5, marginTop:2 }}>{s.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* 6 Pillars */}
            <div>
                <p style={{ fontSize:12, fontWeight:800, color:W.textMuted, marginBottom:10, paddingRight:4 }}>٦ ركائز النظام</p>
                <div className="grid grid-cols-2 gap-2">
                    {PILLARS.map((p, i) => (
                        <motion.div key={i} initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.05 }}
                            className="rounded-[18px] p-3.5 flex items-start gap-2.5"
                            style={{ background:p.color, border:`1px solid ${p.border}` }}>
                            <div style={{ width:34, height:34, borderRadius:11, background:'rgba(255,255,255,0.65)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                {p.icon}
                            </div>
                            <div>
                                <p style={{ fontSize:12, fontWeight:900, color:W.textPrimary }}>{p.title}</p>
                                <p style={{ fontSize:9.5, fontWeight:600, color:W.textSub, lineHeight:1.5, marginTop:1 }}>{p.sub}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Science FAQ */}
            <div>
                <p style={{ fontSize:12, fontWeight:800, color:W.textMuted, marginBottom:10, paddingRight:4 }}>العلم وراء النظام</p>
                <div className="space-y-2">
                    {SCIENCES.map((sc, i) => (
                        <motion.div key={i} className="rounded-[18px] overflow-hidden"
                            style={{ background:W.glass, border:`1px solid ${W.glassBorder}`, boxShadow:'0 2px 8px rgba(0,0,0,0.03)' }}>
                            <button className="w-full flex items-center gap-3 px-4 py-3.5 text-right"
                                onClick={() => setOpenQ(openQ === i ? null : i)}>
                                <Star style={{ width:13, height:13, color:W.green, flexShrink:0 }} />
                                <span style={{ fontSize:12.5, fontWeight:800, color:W.textPrimary, flex:1 }}>{sc.q}</span>
                                <motion.div animate={{ rotate: openQ === i ? 180 : 0 }} transition={{ duration:0.2 }}>
                                    <ChevronDown style={{ width:14, height:14, color:W.textMuted }} />
                                </motion.div>
                            </button>
                            <AnimatePresence>
                                {openQ === i && (
                                    <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
                                        className="overflow-hidden">
                                        <p style={{ fontSize:12, fontWeight:600, color:W.textSub, lineHeight:1.8, padding:'0 16px 14px' }}>{sc.a}</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            {onStartAssessment && (
                <motion.button
                    whileTap={{ scale:0.97 }}
                    onClick={onStartAssessment}
                    className="w-full rounded-[22px] py-4 flex items-center justify-center gap-2"
                    style={{ background:'linear-gradient(135deg,#059669,#047857)', boxShadow:'0 8px 24px rgba(5,150,105,0.35)', border:'none' }}
                >
                    <Leaf style={{ width:18, height:18, color:'#fff' }} />
                    <span style={{ fontSize:15, fontWeight:900, color:'#fff', letterSpacing:'-0.01em' }}>قيّم التزامك الآن</span>
                </motion.button>
            )}
        </div>
    );
}
