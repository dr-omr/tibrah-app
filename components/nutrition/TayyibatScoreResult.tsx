'use client';
// components/nutrition/TayyibatScoreResult.tsx
// عرض نتائج تقييم الالتزام بنظام الطيبات — بصري + سريري
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Leaf, TrendingUp, AlertTriangle, CheckCircle, ChevronLeft, Zap } from 'lucide-react';

const W = {
    glass:'rgba(255,255,255,0.60)', glassHigh:'rgba(255,255,255,0.80)',
    glassBorder:'rgba(255,255,255,0.88)', glassShadow:'0 8px 32px rgba(5,150,105,0.12)',
    sheen:'linear-gradient(180deg,rgba(255,255,255,0.75) 0%,transparent 100%)',
    green:'#059669', greenDeep:'#047857', greenLight:'#34D399',
    textPrimary:'#0C4A6E', textSub:'#0369A1', textMuted:'#7DD3FC',
    amber:'#D97706', red:'#DC2626', teal:'#0891B2',
};

export interface TayyibatScoreData {
    score: number;          // 0–100
    level: 'elite'|'good'|'moderate'|'poor'|'critical';
    strengths: string[];
    gaps: string[];
    topPriority: string;
    weeklyPlan: string[];
    clinicalLink: string;   // Connection to their clinical symptoms
}

const LEVELS: Record<string, {
    label:string; emoji:string; color:string; bg:string; border:string; desc:string;
}> = {
    elite:    { label:'نمط متقدم',    emoji:'🌿', color:'#059669', bg:'rgba(5,150,105,0.08)',  border:'rgba(5,150,105,0.25)',  desc:'إجاباتك تعكس نمطاً غذائياً متقدماً. انتقل للتحسينات الدقيقة.' },
    good:     { label:'جيد',          emoji:'✅', color:'#0891B2', bg:'rgba(8,145,178,0.08)',  border:'rgba(8,145,178,0.22)',  desc:'الأساس موجود. بعض الثغرات تستحق المتابعة لتحصل على النتائج الكاملة.' },
    moderate: { label:'متوسط',        emoji:'🔶', color:'#D97706', bg:'rgba(217,119,6,0.07)',  border:'rgba(217,119,6,0.22)',  desc:'معك جزء من النظام لكن الانتقال الكامل سيُحسّن نتائجك خلال ٢١ يوم.' },
    poor:     { label:'يحتاج بناء',   emoji:'📋', color:'#D97706', bg:'rgba(217,119,6,0.07)', border:'rgba(217,119,6,0.20)',  desc:'نظامك الغذائي الحالي يحتاج تغييرات. التحول للطيبات هو نقطة البداية.' },
    critical: { label:'نقطة البداية', emoji:'📋', color:'#D97706', bg:'rgba(217,119,6,0.08)', border:'rgba(217,119,6,0.25)',  desc:'يُنصح بتغيير الأنماط الغذائية تدريجياً — الطيبات خطوة أولى عملية.' },
};

interface Props { data: TayyibatScoreData; onViewPlan?: () => void; }

export function TayyibatScoreResult({ data, onViewPlan }: Props) {
    const lvl = LEVELS[data.level];
    const circumference = 2 * Math.PI * 38;
    const strokeDash = circumference - (circumference * data.score) / 100;

    const scoreColor = useMemo(() => {
        if (data.score >= 80) return W.green;
        if (data.score >= 60) return W.teal;
        if (data.score >= 40) return W.amber;
        return W.red;
    }, [data.score]);

    return (
        <div className="space-y-4" style={{ direction:'rtl' }}>

            {/* Score circle card */}
            <motion.div
                initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                className="rounded-[28px] p-6"
                style={{ background:`linear-gradient(145deg,${lvl.bg},rgba(255,255,255,0.30))`, border:`1.5px solid ${lvl.border}`, boxShadow:W.glassShadow, position:'relative', overflow:'hidden' }}
            >
                <div style={{ position:'absolute', inset:0, background:W.sheen, pointerEvents:'none' }} />
                <div className="flex items-center gap-5" style={{ position:'relative', zIndex:1 }}>
                    {/* SVG ring */}
                    <div style={{ position:'relative', width:90, height:90, flexShrink:0 }}>
                        <svg width="90" height="90" style={{ transform:'rotate(-90deg)' }}>
                            <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="7" />
                            <motion.circle cx="45" cy="45" r="38" fill="none"
                                stroke={scoreColor} strokeWidth="7"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                initial={{ strokeDashoffset: circumference }}
                                animate={{ strokeDashoffset: strokeDash }}
                                transition={{ duration:1.2, ease:'easeOut' }}
                            />
                        </svg>
                        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                            <span style={{ fontSize:26, fontWeight:900, color:scoreColor, letterSpacing:'-0.03em', lineHeight:1 }}>{data.score}</span>
                            <span style={{ fontSize:9, fontWeight:700, color:W.textMuted }}>/ ١٠٠</span>
                        </div>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span style={{ fontSize:20 }}>{lvl.emoji}</span>
                            <span style={{ fontSize:20, fontWeight:900, color:lvl.color }}>{lvl.label}</span>
                        </div>
                        <p style={{ fontSize:12, fontWeight:600, color:W.textSub, lineHeight:1.7 }}>{lvl.desc}</p>
                    </div>
                </div>

                {/* Clinical link */}
                {data.clinicalLink && (
                    <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
                        className="mt-4 rounded-[16px] p-3.5 flex items-start gap-2.5"
                        style={{ background:'rgba(8,145,178,0.07)', border:'1px solid rgba(8,145,178,0.18)' }}>
                        <Zap style={{ width:14, height:14, color:W.teal, flexShrink:0, marginTop:1 }} />
                        <p style={{ fontSize:11.5, fontWeight:700, color:W.textSub, lineHeight:1.7 }}>{data.clinicalLink}</p>
                    </motion.div>
                )}
            </motion.div>

            {/* Strengths & Gaps */}
            <div className="grid grid-cols-2 gap-3">
                <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2 }}
                    className="rounded-[20px] p-4"
                    style={{ background:'rgba(5,150,105,0.07)', border:'1px solid rgba(5,150,105,0.20)' }}>
                    <div className="flex items-center gap-1.5 mb-3">
                        <CheckCircle style={{ width:14, height:14, color:W.green }} />
                        <span style={{ fontSize:11, fontWeight:800, color:W.green }}>نقاط قوتك</span>
                    </div>
                    <div className="space-y-2">
                        {data.strengths.slice(0,4).map((s,i) => (
                            <div key={i} className="flex items-start gap-1.5">
                                <span style={{ color:W.green, fontSize:8, marginTop:4 }}>●</span>
                                <p style={{ fontSize:10.5, fontWeight:600, color:W.textPrimary, lineHeight:1.6 }}>{s}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.25 }}
                    className="rounded-[20px] p-4"
                    style={{ background:'rgba(220,38,38,0.06)', border:'1px solid rgba(220,38,38,0.18)' }}>
                    <div className="flex items-center gap-1.5 mb-3">
                        <AlertTriangle style={{ width:14, height:14, color:W.amber }} />
                        <span style={{ fontSize:11, fontWeight:800, color:W.amber }}>نقاط للتحسين</span>
                    </div>
                    <div className="space-y-2">
                        {data.gaps.slice(0,4).map((g,i) => (
                            <div key={i} className="flex items-start gap-1.5">
                                <span style={{ color:W.red, fontSize:8, marginTop:4 }}>●</span>
                                <p style={{ fontSize:10.5, fontWeight:600, color:W.textPrimary, lineHeight:1.6 }}>{g}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Top priority */}
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
                className="rounded-[20px] p-4 flex items-center gap-3"
                style={{ background:'rgba(217,119,6,0.08)', border:'1px solid rgba(217,119,6,0.22)' }}>
                <div style={{ width:40, height:40, borderRadius:14, background:'rgba(217,119,6,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <TrendingUp style={{ width:18, height:18, color:W.amber }} />
                </div>
                <div>
                    <p style={{ fontSize:10, fontWeight:800, color:W.amber }}>أولويتك هذا الأسبوع</p>
                    <p style={{ fontSize:13, fontWeight:800, color:W.textPrimary, lineHeight:1.6, marginTop:2 }}>{data.topPriority}</p>
                </div>
            </motion.div>

            {/* 7-day plan */}
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35 }}
                className="rounded-[22px] p-5"
                style={{ background:W.glass, border:`1px solid ${W.glassBorder}`, boxShadow:W.glassShadow }}>
                <div className="flex items-center gap-2 mb-4">
                    <Leaf style={{ width:15, height:15, color:W.green }} />
                    <p style={{ fontSize:13, fontWeight:900, color:W.textPrimary }}>خطة ٧ أيام للانطلاق</p>
                </div>
                <div className="space-y-2.5">
                    {data.weeklyPlan.map((step, i) => (
                        <motion.div key={i}
                            initial={{ opacity:0, x:10 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.4 + i*0.06 }}
                            className="flex items-start gap-3">
                            <div style={{ width:24, height:24, borderRadius:8, background:'rgba(5,150,105,0.10)', border:'1px solid rgba(5,150,105,0.20)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                                <span style={{ fontSize:10, fontWeight:900, color:W.green }}>{i+1}</span>
                            </div>
                            <p style={{ fontSize:12, fontWeight:700, color:W.textSub, lineHeight:1.7 }}>{step}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* CTA button */}
            {onViewPlan && (
                <motion.button whileTap={{ scale:0.97 }} onClick={onViewPlan}
                    className="w-full rounded-[22px] py-4 flex items-center justify-center gap-2"
                    style={{ background:'linear-gradient(135deg,#059669,#047857)', boxShadow:'0 8px 24px rgba(5,150,105,0.35)' }}>
                    <span style={{ fontSize:15, fontWeight:900, color:'#fff' }}>افتح خطتي المخصصة</span>
                    <ChevronLeft style={{ width:18, height:18, color:'rgba(255,255,255,0.8)' }} />
                </motion.button>
            )}
        </div>
    );
}

// ── Score Calculator ──
export function computeTayyibatScore(answers: Record<string,string>): TayyibatScoreData {
    let score = 50;
    const strengths: string[] = [];
    const gaps: string[] = [];

    // Gate: knowledge
    if (answers['tay_know'] === 'expert')    { score += 15; strengths.push('معرفة عميقة بالنظام'); }
    else if (answers['tay_know'] === 'basic') { score += 5; }
    else { score -= 5; gaps.push('تحتاج فهم أعمق لمبادئ الطيبات'); }

    // Gate: level
    if (answers['tay_level'] === 'full')         { score += 25; strengths.push('التزام كامل بالنظام'); }
    else if (answers['tay_level'] === 'partial')  { score += 10; gaps.push('بعض الانتهاكات اليومية تُعيق النتائج'); }
    else if (answers['tay_level'] === 'started')  { score += 2; gaps.push('البداية موجودة لكن الثبات مفقود'); }
    else { score -= 15; gaps.push('لم يبدأ التطبيق الفعلي بعد'); }

    // Deep: oils
    if (answers['tay_oils'] === 'olive_only')  { score += 10; strengths.push('زيت الزيتون فقط ✓'); }
    else if (answers['tay_oils'] === 'mixed')   { score -= 5; gaps.push('الزيوت المهدرجة تُطفئ الميتوكوندريا'); }
    else if (answers['tay_oils'] === 'seed_oils') { score -= 15; gaps.push('زيوت البذور = مصدر التهاب رئيسي'); }

    // Deep: sugar
    if (answers['tay_sugar'] === 'none')       { score += 10; strengths.push('صفر سكر أبيض ✓'); }
    else if (answers['tay_sugar'] === 'rare')   { score += 4; }
    else if (answers['tay_sugar'] === 'daily')  { score -= 10; gaps.push('السكر اليومي يُبطل المناعة ٤–٦ ساعات بعد أكله'); }

    // Deep: protein
    if (answers['tay_protein'] === 'every_meal') { score += 8; strengths.push('بروتين في كل وجبة ✓'); }
    else if (answers['tay_protein'] === 'once')   { score += 2; gaps.push('زِد البروتين لوجبتين على الأقل'); }
    else { score -= 8; gaps.push('نقص البروتين = فقدان عضلات + ضعف مناعة'); }

    score = Math.max(0, Math.min(100, score));

    const level: TayyibatScoreData['level'] =
        score >= 85 ? 'elite' : score >= 70 ? 'good' : score >= 50 ? 'moderate' : score >= 30 ? 'poor' : 'critical';

    const weeklyPlan = [
        'احذف كل الزيوت النباتية المصنعة واستبدلها بزيت الزيتون',
        'أضف ٢٥–٣٠ جم بروتين نظيف في كل وجبة رئيسية',
        'احذف السكر الأبيض والعصائر ٧ أيام كاملة',
        'أكل خضار نيئة أو مطبوخة على البخار مرة/يوم',
        'استبدل المعجنات الصباحية بفطور بيض + أفوكادو',
        'لا أكل ٣ ساعات قبل النوم (نافذة الإيقاع)',
        'سجّل وجباتك في تطبيق طبرا يومياً لمتابعة الالتزام',
    ];

    return {
        score, level, strengths, gaps,
        topPriority: gaps[0] ?? 'تعمّق في فهم الطيبات وشارك شخصاً قريباً به',
        weeklyPlan,
        clinicalLink: score < 60
            ? 'نظامك الغذائي الحالي يُغذّي الأعراض التي أبلغت عنها — تحسين الطيبات سيُسرّع استجابتك للعلاج'
            : 'الطيبات يدعم خطتك السريرية ويُعزز نتائج التحليل',
    };
}
