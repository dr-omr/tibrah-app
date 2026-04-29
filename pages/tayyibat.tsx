// pages/tayyibat.tsx — نظام الطيبات (تجربة كاملة)
import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Leaf, BookOpen, Utensils, BarChart3, Star, User } from 'lucide-react';

import { TayyibatHeroSection }            from '@/components/nutrition/TayyibatHeroSection';
import { TayyibatAllowedForbiddenSheet }  from '@/components/nutrition/TayyibatAllowedForbiddenSheet';
import { TayyibatMealLogger }             from '@/components/nutrition/TayyibatMealLogger';
import { TayyibatAdherenceScore }         from '@/components/nutrition/TayyibatAdherenceScore';
import { TayyibatViolationList }          from '@/components/nutrition/TayyibatViolationList';
import { TayyibatIntelligenceCard }       from '@/components/nutrition/TayyibatIntelligenceCard';
import { TayyibatAssessmentCard }         from '@/components/nutrition/TayyibatAssessmentCard';
import { TayyibatScoreResult, computeTayyibatScore } from '@/components/nutrition/TayyibatScoreResult';
import { TayyibatDrAwadhi } from '@/components/nutrition/tayyibat/TayyibatDrAwadhi';
import { trackEvent } from '@/lib/analytics';
import { haptic } from '@/lib/HapticFeedback';

const PAGE_BG = 'linear-gradient(168deg,#E8FBF0 0%,#D0F8E8 18%,#E2FEF1 42%,#EDFFF5 65%,#F0FBF5 88%,#F5FEFA 100%)';

const W = {
    glass:'rgba(255,255,255,0.58)', glassHigh:'rgba(255,255,255,0.72)',
    glassBorder:'rgba(255,255,255,0.85)', glassShadow:'0 8px 32px rgba(5,150,105,0.10)',
    textPrimary:'#0C4A6E', textSub:'#0369A1', textMuted:'#7DD3FC',
    green:'#059669', greenDeep:'#047857',
};

type PageTab = 'overview' | 'reference' | 'logger' | 'tracker' | 'source';

const TABS: Array<{ id: PageTab; label: string; icon: React.ReactNode }> = [
    { id:'overview',   label:'نظرة عامة', icon:<Leaf     style={{width:14,height:14}}/> },
    { id:'reference',  label:'المرجع',    icon:<BookOpen style={{width:14,height:14}}/> },
    { id:'logger',     label:'سجّل',      icon:<Utensils style={{width:14,height:14}}/> },
    { id:'tracker',    label:'الالتزام',  icon:<BarChart3 style={{width:14,height:14}}/> },
    { id:'source',     label:'الأصل',     icon:<User     style={{width:14,height:14}}/> },
];

type AssessPhase = 'none' | 'assessing' | 'result';

export default function TayyibatPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<PageTab>('overview');
    const [assessPhase, setAssessPhase] = useState<AssessPhase>('none');
    const [scoreData, setScoreData] = useState<ReturnType<typeof computeTayyibatScore> | null>(null);

    const handleTabChange = (tab: PageTab) => {
        haptic.selection();
        setActiveTab(tab);
        trackEvent('tayyibat_tab_changed', { tab });
    };

    const handleAssessmentComplete = (answers: {
        gateAnswers: Record<string,string>;
        deepAnswers: Record<string,string>;
        deepTriggered: boolean;
    }) => {
        const allAnswers = { ...answers.gateAnswers, ...answers.deepAnswers };
        const result = computeTayyibatScore(allAnswers);
        setScoreData(result);
        setAssessPhase('result');
        trackEvent('tayyibat_assessment_completed', { score: result.score, level: result.level });
    };

    return (
        <div dir="rtl" style={{ background:PAGE_BG, minHeight:'100svh', paddingBottom:120 }}>
            <Head>
                <title>نظام الطيبات — طِبرَا</title>
                <meta name="description" content="نظام الطيبات الغذائي — المرجع العلمي + تقييم الالتزام + خطتك المخصصة" />
                <meta name="theme-color" content="#E8FBF0" />
            </Head>

            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none" style={{zIndex:0}}>
                <div className="absolute inset-0" style={{background:'radial-gradient(ellipse 60% 40% at 80% 15%,rgba(5,150,105,0.12) 0%,transparent 65%)'}} />
                <div className="absolute inset-0" style={{background:'radial-gradient(ellipse 50% 55% at 15% 70%,rgba(34,211,153,0.08) 0%,transparent 55%)'}} />
                <motion.div animate={{scale:[1,1.08,1],opacity:[0.5,0.8,0.5]}} transition={{duration:7,repeat:Infinity}}
                    style={{position:'absolute',top:-80,right:-40,width:280,height:280,borderRadius:'50%',background:'radial-gradient(circle,rgba(5,150,105,0.14) 0%,transparent 65%)',filter:'blur(50px)'}} />
            </div>

            <div style={{position:'relative',zIndex:1}}>
                {/* Sticky header */}
                <div className="sticky top-0 z-30 px-4 pt-14 pb-3"
                    style={{background:'rgba(232,251,240,0.82)',backdropFilter:'blur(28px) saturate(160%)',borderBottom:'1px solid rgba(255,255,255,0.60)'}}>
                    <div className="flex items-center gap-3 mb-3">
                        <motion.button whileTap={{scale:0.88}} onClick={()=>router.back()}
                            style={{width:38,height:38,borderRadius:'50%',background:W.glass,border:`1px solid ${W.glassBorder}`,backdropFilter:'blur(16px)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:W.glassShadow,flexShrink:0}}>
                            <ArrowRight style={{width:17,height:17,color:W.textSub}} />
                        </motion.button>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <Leaf style={{width:19,height:19,color:W.green}} />
                                <h1 style={{fontSize:20,fontWeight:900,color:W.textPrimary,letterSpacing:'-0.02em'}}>نظام الطيبات</h1>
                            </div>
                            <p style={{fontSize:9.5,fontWeight:600,color:W.textMuted,marginTop:1}}>الغذاء الذي يُعالج · العلم + التطبيق</p>
                        </div>
                        {/* Assessment badge */}
                        {assessPhase === 'result' && scoreData && (
                            <div style={{background:'rgba(5,150,105,0.10)',border:'1px solid rgba(5,150,105,0.25)',borderRadius:20,padding:'4px 10px',display:'flex',alignItems:'center',gap:4}}>
                                <Star style={{width:11,height:11,color:W.green}} />
                                <span style={{fontSize:11,fontWeight:800,color:W.green}}>{scoreData.score}</span>
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 p-1 rounded-[14px]"
                        style={{background:'rgba(5,150,105,0.04)',border:`1px solid ${W.glassBorder}`}}>
                        {TABS.map(tab => (
                            <motion.button key={tab.id} whileTap={{scale:0.95}}
                                onClick={()=>handleTabChange(tab.id)}
                                className="flex-1 rounded-[10px] py-2.5 flex items-center justify-center gap-1"
                                style={{
                                    background: activeTab===tab.id ? W.glassHigh : 'transparent',
                                    border: activeTab===tab.id ? `1px solid ${W.glassBorder}` : '1px solid transparent',
                                    boxShadow: activeTab===tab.id ? W.glassShadow : 'none',
                                    color: activeTab===tab.id ? W.green : W.textMuted,
                                }}>
                                {tab.icon}
                                <span style={{fontSize:10,fontWeight:800}}>{tab.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="px-4 pt-4">
                    <AnimatePresence mode="wait">

                        {/* ── Overview tab ── */}
                        {activeTab === 'overview' && (
                            <motion.div key="overview" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="space-y-3">
                                {/* ── NEW: Entry point cards to sub-routes ── */}
                                <div className="space-y-2 mb-2">
                                    <motion.button whileTap={{scale:0.97}}
                                        onClick={()=>{ trackEvent('tayyibat_assessment_entry_clicked'); router.push('/tayyibat/assessment'); }}
                                        className="w-full rounded-[22px] p-5 flex items-center gap-4"
                                        style={{background:'linear-gradient(135deg,#059669,#047857)',border:'none',boxShadow:'0 8px 24px rgba(5,150,105,0.30)'}}>
                                        <span style={{fontSize:24}}>🎯</span>
                                        <div className="text-right">
                                            <p style={{fontSize:15,fontWeight:900,color:'#fff'}}>ابدأ تقييم الطيبات</p>
                                            <p style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.75)'}}>سريع ٧ أسئلة أو عميق ٢٥ سؤالاً — اختر ما يناسبك</p>
                                        </div>
                                    </motion.button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <motion.button whileTap={{scale:0.97}}
                                            onClick={()=>router.push('/tayyibat/tracker')}
                                            className="rounded-[18px] p-4 flex flex-col items-center gap-2"
                                            style={{background:W.glass,border:`1px solid ${W.glassBorder}`,boxShadow:W.glassShadow}}>
                                            <span style={{fontSize:22}}>🍽️</span>
                                            <p style={{fontSize:11,fontWeight:800,color:W.textPrimary}}>سجل الوجبات</p>
                                        </motion.button>
                                        <motion.button whileTap={{scale:0.97}}
                                            onClick={()=>router.push('/tayyibat/result')}
                                            className="rounded-[18px] p-4 flex flex-col items-center gap-2"
                                            style={{background:W.glass,border:`1px solid ${W.glassBorder}`,boxShadow:W.glassShadow}}>
                                            <span style={{fontSize:22}}>📊</span>
                                            <p style={{fontSize:11,fontWeight:800,color:W.textPrimary}}>نتيجتي</p>
                                        </motion.button>
                                    </div>
                                </div>
                                {assessPhase === 'none' && (
                                    <TayyibatHeroSection onStartAssessment={() => setAssessPhase('assessing')} />
                                )}

                                {assessPhase === 'assessing' && (
                                    <TayyibatAssessmentCard
                                        pathwayId="fatigue"
                                        clinicalAnswers={{}}
                                        onComplete={handleAssessmentComplete}
                                    />
                                )}
                                {assessPhase === 'result' && scoreData && (
                                    <div className="space-y-4">
                                        <TayyibatScoreResult
                                            data={scoreData}
                                            onViewPlan={() => handleTabChange('logger')}
                                        />
                                        <motion.button whileTap={{scale:0.97}}
                                            onClick={() => setAssessPhase('assessing')}
                                            className="w-full rounded-[18px] py-3 flex items-center justify-center"
                                            style={{background:W.glass,border:`1px solid ${W.glassBorder}`}}>
                                            <span style={{fontSize:12,fontWeight:700,color:W.textMuted}}>أعد التقييم</span>
                                        </motion.button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* ── Reference tab ── */}
                        {activeTab === 'reference' && (
                            <motion.div key="reference" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
                                <TayyibatAllowedForbiddenSheet />
                            </motion.div>
                        )}

                        {/* ── Logger tab ── */}
                        {activeTab === 'logger' && (
                            <motion.div key="logger" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="space-y-4">
                                <TayyibatMealLogger />
                                <TayyibatViolationList />
                            </motion.div>
                        )}

                        {/* ── Source tab ── */}
                        {activeTab === 'source' && (
                            <motion.div key="source" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}}>
                                <TayyibatDrAwadhi />
                            </motion.div>
                        )}

                        {/* ── Tracker tab ── */}
                        {activeTab === 'tracker' && (
                            <motion.div key="tracker" initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} className="space-y-4">
                                {scoreData && (
                                    <div className="rounded-[20px] p-4 flex items-center gap-3"
                                        style={{background:'rgba(5,150,105,0.07)',border:'1px solid rgba(5,150,105,0.20)'}}>
                                        <Star style={{width:20,height:20,color:W.green}} />
                                        <div>
                                            <p style={{fontSize:10,fontWeight:800,color:W.green}}>نتيجة التقييم</p>
                                            <p style={{fontSize:16,fontWeight:900,color:W.textPrimary}}>{scoreData.score}/١٠٠ — {scoreData.level === 'elite' ? 'نمط متقدم' : scoreData.level === 'good' ? 'جيد' : scoreData.level === 'moderate' ? 'متوسط' : 'يحتاج بناء'}</p>
                                        </div>
                                    </div>
                                )}
                                <TayyibatIntelligenceCard />
                                <TayyibatAdherenceScore />
                                <TayyibatViolationList />
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
