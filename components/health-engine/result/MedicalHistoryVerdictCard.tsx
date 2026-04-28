// components/health-engine/result/MedicalHistoryVerdictCard.tsx
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Pill, Users, Dumbbell, TestTube, ChevronLeft,
    ChevronDown, ChevronUp, AlertCircle, ShieldCheck, Stethoscope,
    Activity, Clock, TrendingUp, Info,
} from 'lucide-react';
import Link from 'next/link';
import type { MedicalHistoryVerdict } from '@/lib/medical-history-bridge';
import type { DomainVisConfig } from './shared/design-tokens';
import { W } from './shared/design-tokens';
import { GlassCard, AccentIconBox, SectionLabel } from './shared/GlassCard';

interface Props { data: MedicalHistoryVerdict; vis: DomainVisConfig; on: boolean; }

const RISK_CONFIG = {
    elevated:   { bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.22)',   text: '#DC2626', label: '⚠️ عوامل مرتفعة', bar: '#EF4444' },
    neutral:    { bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.22)', text: '#64748B', label: '📋 عوامل محايدة', bar: '#94A3B8' },
    protective: { bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.22)',  text: '#059669', label: '✅ عوامل إيجابية', bar: '#10B981' },
};

/* ── Risk Meter Bar ── */
function RiskMeter({ modifier, totalSignals }: { modifier: string; totalSignals: number }) {
    const score = modifier === 'elevated' ? Math.min(90, 40 + totalSignals * 15)
        : modifier === 'protective' ? 15 : 30 + totalSignals * 8;
    const color = modifier === 'elevated' ? '#EF4444' : modifier === 'protective' ? '#10B981' : '#94A3B8';
    const label = modifier === 'elevated' ? 'مخاطرة مرتفعة'
        : modifier === 'protective' ? 'مخاطرة منخفضة' : 'مخاطرة متوسطة';

    return (
        <div className="p-3 rounded-xl mb-4"
            style={{ background: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.7)' }}>
            <div className="flex items-center justify-between mb-2">
                <p style={{ fontSize: 10.5, fontWeight: 800, color: W.textPrimary }}>مستوى المخاطرة السريرية</p>
                <span style={{ fontSize: 9.5, fontWeight: 700, color, background: `${color}15`, padding: '2px 10px', borderRadius: 20 }}>
                    {label}
                </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden"
                style={{ background: 'rgba(148,163,184,0.15)' }}>
                <motion.div className="h-full rounded-full"
                    style={{ background: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 1.2, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
                />
            </div>
            <p style={{ fontSize: 9, color: W.textSub, marginTop: 4 }}>
                بناءً على {totalSignals} عامل مرتبط بأعراضك الحالية
            </p>
        </div>
    );
}

/* ── Collapsible Section ── */
function Section({
    title, icon: Icon, color, children, defaultOpen = false, count,
}: {
    title: string; icon: React.ElementType; color: string;
    children: React.ReactNode; defaultOpen?: boolean; count?: number;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="rounded-xl overflow-hidden mb-2.5 last:mb-0"
            style={{ background: 'rgba(255,255,255,0.42)', border: '1px solid rgba(255,255,255,0.65)' }}>
            <button onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-3.5 py-3 cursor-pointer">
                <div className="flex items-center gap-2">
                    <Icon style={{ width: 14, height: 14, color }} />
                    <p style={{ fontSize: 11.5, fontWeight: 800, color: W.textPrimary }}>{title}</p>
                    {count !== undefined && (
                        <span style={{
                            fontSize: 9, fontWeight: 800, color,
                            background: `${color}15`, padding: '1px 7px', borderRadius: 20,
                        }}>{count}</span>
                    )}
                </div>
                {open
                    ? <ChevronUp style={{ width: 13, height: 13, color: W.textSub }} />
                    : <ChevronDown style={{ width: 13, height: 13, color: W.textSub }} />}
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div key="c"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden">
                        <div className="px-3.5 pb-3">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ── Chronic Disease Row ── */
function DiseaseRow({ text }: { text: string }) {
    const [disease, concern] = text.split(' — ');
    return (
        <div className="mb-2.5 last:mb-0 p-2 rounded-lg"
            style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: W.textPrimary }}>{disease}</p>
            {concern && <p style={{ fontSize: 9.5, color: '#DC2626', marginTop: 1 }}>↳ {concern}</p>}
        </div>
    );
}

/* ── Medication Row ── */
function MedRow({ name, concern }: { name: string; concern: string }) {
    return (
        <div className="mb-2.5 last:mb-0 p-2.5 rounded-lg"
            style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <div className="flex items-center gap-1.5 mb-1">
                <Pill style={{ width: 11, height: 11, color: '#D97706' }} />
                <p style={{ fontSize: 11, fontWeight: 700, color: W.textPrimary }}>{name}</p>
            </div>
            <p style={{ fontSize: 9.5, color: '#B45309', lineHeight: 1.5 }}>↳ {concern}</p>
        </div>
    );
}

/* ── Lab Tag ── */
function LabTag({ lab }: { lab: string }) {
    return (
        <span style={{
            fontSize: 9.5, fontWeight: 700,
            background: 'rgba(14,165,233,0.08)',
            color: '#0369A1',
            border: '1px solid rgba(14,165,233,0.18)',
            padding: '3px 9px', borderRadius: 20,
            display: 'inline-block', margin: '2px',
        }}>
            {lab}
        </span>
    );
}

/* ── Family Flag Row ── */
function FamilyRow({ text }: { text: string }) {
    return (
        <div className="flex items-center gap-2 mb-1.5 last:mb-0">
            <Users style={{ width: 11, height: 11, color: '#8B5CF6', flexShrink: 0 }} />
            <p style={{ fontSize: 10.5, color: W.textSub }}>{text}</p>
        </div>
    );
}

/* ── Lifestyle Row ── */
function LifestyleRow({ text, index }: { text: string; index: number }) {
    const colors = ['#0D9488', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6'];
    const color = colors[index % colors.length];
    return (
        <div className="flex items-start gap-2 mb-2 last:mb-0">
            <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
            <p style={{ fontSize: 10.5, color: W.textSub, lineHeight: 1.5 }}>{text}</p>
        </div>
    );
}

/* ── ROS Finding ── */
function ROSRow({ text }: { text: string }) {
    const [system, findings] = text.split(': ');
    return (
        <div className="mb-2 last:mb-0 flex items-start gap-2">
            <Activity style={{ width: 11, height: 11, color: '#0EA5E9', flexShrink: 0, marginTop: 2 }} />
            <div>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: W.textPrimary }}>{system}: </span>
                <span style={{ fontSize: 10.5, color: W.textSub }}>{findings}</span>
            </div>
        </div>
    );
}

/* ── Action Item ── */
function ActionItem({ text, index }: { text: string; index: number }) {
    const icons = ['🔬', '💊', '🏥', '🌱', '📅'];
    return (
        <div className="flex items-start gap-2.5 mb-2 last:mb-0">
            <span style={{ fontSize: 13 }}>{icons[index % icons.length]}</span>
            <p style={{ fontSize: 10.5, color: W.textSub, lineHeight: 1.5 }}>{text}</p>
        </div>
    );
}

/* ── Follow-up Timeline ── */
function FollowUpBadge({ timeline }: { timeline: string }) {
    const urgent = timeline.includes('أسبوع');
    return (
        <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl"
            style={{
                background: urgent ? 'rgba(239,68,68,0.06)' : 'rgba(16,185,129,0.06)',
                border: `1px solid ${urgent ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)'}`,
            }}>
            <Clock style={{ width: 13, height: 13, color: urgent ? '#DC2626' : '#059669' }} />
            <div>
                <p style={{ fontSize: 9, fontWeight: 700, color: W.textSub }}>المتابعة المقترحة</p>
                <p style={{ fontSize: 11, fontWeight: 800, color: urgent ? '#DC2626' : '#059669' }}>{timeline}</p>
            </div>
        </div>
    );
}

/* ── Stat Pill ── */
function StatPill({ label, value, color }: { label: string; value: string | number; color: string }) {
    return (
        <div className="flex-1 text-center py-3 rounded-xl"
            style={{ background: `${color}08`, border: `1px solid ${color}18` }}>
            <p style={{ fontSize: 16, fontWeight: 900, color }}>{value}</p>
            <p style={{ fontSize: 9, fontWeight: 700, color: W.textSub, marginTop: 2 }}>{label}</p>
        </div>
    );
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════ */

export function MedicalHistoryVerdictCard({ data, vis, on }: Props) {
    if (!data || !data.hasData) return null;

    // Only show when there are actual correlations (not just labs)
    const totalSignals = data.relevantChronicDiseases.length
        + data.relevantMedications.length
        + data.lifestyleFactors.length;
    const hasCorrelations = totalSignals > 0
        || data.familyRiskFlags.length > 0
        || data.correlatedROSFindings.length > 0;

    // If no correlations and no summary, hide the card entirely
    if (!hasCorrelations && !data.summaryArabic) return null;

    const risk = RISK_CONFIG[data.riskModifier];

    return (
        <GlassCard delay={0.80} on={on} className="mx-4 mb-4 p-5">
            <div className="relative z-10">

                {/* ── Header ── */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <AccentIconBox color="#6366f1">
                            <FileText style={{ width: 16, height: 16, color: '#6366f1' }} />
                        </AccentIconBox>
                        <div>
                            <SectionLabel text="ربط التاريخ المرضي" color="#6366f1" />
                            <p style={{ fontSize: 9, color: W.textSub, marginTop: -2 }}>
                                تحليل حتمي من ملفك الطبي المحفوظ
                            </p>
                        </div>
                    </div>
                    <span style={{
                        fontSize: 9, fontWeight: 800, padding: '4px 10px', borderRadius: 20,
                        background: risk.bg, color: risk.text, border: `1px solid ${risk.border}`,
                    }}>
                        {risk.label}
                    </span>
                </div>

                {/* ── Summary ── */}
                {data.summaryArabic && (
                    <div className="mb-4 p-3 rounded-xl"
                        style={{ background: risk.bg, border: `1px solid ${risk.border}` }}>
                        <p style={{ fontSize: 11.5, color: risk.text, fontWeight: 700, lineHeight: 1.6 }}>
                            {data.summaryArabic}
                        </p>
                    </div>
                )}

                {/* ── Risk Meter ── */}
                <RiskMeter modifier={data.riskModifier} totalSignals={totalSignals} />

                {/* ── Stats Row (only when there are actual signals) ── */}
                {totalSignals > 0 && (
                    <div className="flex gap-2 mb-4">
                        <StatPill label="أمراض مزمنة" value={data.relevantChronicDiseases.length} color="#EF4444" />
                        <StatPill label="تفاعلات دوائية" value={data.relevantMedications.length} color="#F59E0B" />
                        <StatPill label="عوامل حياتية" value={data.lifestyleFactors.length} color="#6366F1" />
                        <StatPill label="تاريخ عائلي" value={data.familyRiskFlags.length} color="#8B5CF6" />
                    </div>
                )}

                {/* ── Sections ── */}
                {data.relevantChronicDiseases.length > 0 && (
                    <Section title="أمراض مزمنة مرتبطة" icon={Stethoscope} color="#EF4444"
                        defaultOpen count={data.relevantChronicDiseases.length}>
                        {data.relevantChronicDiseases.slice(0, 4).map((d, i) => (
                            <DiseaseRow key={i} text={d} />
                        ))}
                    </Section>
                )}

                {data.relevantMedications.length > 0 && (
                    <Section title="أدوية قد تؤثر" icon={Pill} color="#D97706"
                        defaultOpen count={data.relevantMedications.length}>
                        {data.relevantMedications.slice(0, 3).map((m, i) => (
                            <MedRow key={i} name={m.name} concern={m.concern} />
                        ))}
                        <div className="mt-2 p-2 rounded-lg"
                            style={{ background: 'rgba(245,158,11,0.06)' }}>
                            <div className="flex items-start gap-1.5">
                                <Info style={{ width: 11, height: 11, color: '#D97706', marginTop: 1 }} />
                                <p style={{ fontSize: 9.5, color: '#B45309' }}>
                                    لا تغيّر جرعتك أو تستبدل دواءك بدون استشارة طبيبك المعالج
                                </p>
                            </div>
                        </div>
                    </Section>
                )}

                {data.lifestyleFactors.length > 0 && (
                    <Section title="عوامل نمط الحياة" icon={Dumbbell} color="#10B981"
                        count={data.lifestyleFactors.length}>
                        {data.lifestyleFactors.map((f, i) => (
                            <LifestyleRow key={i} text={f} index={i} />
                        ))}
                        <div className="mt-3 pt-2.5"
                            style={{ borderTop: '1px solid rgba(16,185,129,0.12)' }}>
                            <p style={{ fontSize: 10, fontWeight: 700, color: '#059669', marginBottom: 6 }}>
                                التعديلات ذات الأثر الأكبر:
                            </p>
                            {[
                                'نوم ٧–٩ ساعات — يعالج ٦٠٪ من الأعراض التعبية',
                                'مشي ٣٠ دقيقة يومياً — يرفع الطاقة ويخفض الإجهاد',
                                'شرب ٢ لتر ماء — يمنع الصداع ويحسّن الهضم',
                            ].map((tip, i) => (
                                <div key={i} className="flex items-start gap-1.5 mb-1.5">
                                    <TrendingUp style={{ width: 11, height: 11, color: '#059669', marginTop: 2, flexShrink: 0 }} />
                                    <p style={{ fontSize: 9.5, color: W.textSub }}>{tip}</p>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {data.familyRiskFlags.length > 0 && (
                    <Section title="تاريخ عائلي ذو صلة" icon={Users} color="#8B5CF6"
                        count={data.familyRiskFlags.length}>
                        {data.familyRiskFlags.slice(0, 4).map((f, i) => (
                            <FamilyRow key={i} text={f} />
                        ))}
                        <div className="mt-3 p-2.5 rounded-lg"
                            style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.12)' }}>
                            <div className="flex items-start gap-1.5">
                                <ShieldCheck style={{ width: 11, height: 11, color: '#7C3AED', marginTop: 1 }} />
                                <p style={{ fontSize: 9.5, color: '#6D28D9' }}>
                                    التاريخ العائلي يرفع احتمالية الإصابة — الكشف المبكر يحمي ويمنع
                                </p>
                            </div>
                        </div>
                    </Section>
                )}

                {data.correlatedROSFindings.length > 0 && (
                    <Section title="نتائج مراجعة الأجهزة" icon={Activity} color="#0EA5E9"
                        count={data.correlatedROSFindings.length}>
                        {data.correlatedROSFindings.map((r, i) => (
                            <ROSRow key={i} text={r} />
                        ))}
                    </Section>
                )}

                {data.suggestedLabs.length > 0 && (
                    <Section title="فحوصات مقترحة" icon={TestTube} color="#0EA5E9" defaultOpen>
                        <p style={{ fontSize: 9.5, color: W.textSub, marginBottom: 8, lineHeight: 1.5 }}>
                            بناءً على مسار أعراضك وتاريخك المرضي — استشر طبيبك قبل إجرائها:
                        </p>
                        <div className="flex flex-wrap">
                            {data.suggestedLabs.map((lab, i) => (
                                <LabTag key={i} lab={lab} />
                            ))}
                        </div>
                        <div className="mt-3 p-2.5 rounded-lg"
                            style={{ background: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.15)' }}>
                            <p style={{ fontSize: 9.5, color: '#0369A1', fontWeight: 600 }}>
                                💡 أطبع هذه القائمة وأعطها لطبيبك في زيارتك القادمة
                            </p>
                        </div>
                    </Section>
                )}

                {/* ── Immediate Actions ── */}
                {data.riskModifier === 'elevated' && (
                    <Section title="إجراءات فورية مقترحة" icon={AlertCircle} color="#EF4444" defaultOpen>
                        {[
                            'حجز موعد طبيب خلال أسبوعين',
                            'إجراء الفحوصات المقترحة أعلاه',
                            'مراجعة كل أدويتك مع طبيبك',
                            'بدء نظام الطيبات لدعم تعافيك',
                        ].map((a, i) => (
                            <ActionItem key={i} text={a} index={i} />
                        ))}
                        <FollowUpBadge timeline="خلال أسبوع إلى أسبوعين" />
                    </Section>
                )}

                {/* ── CTA ── */}
                <Link href="/medical-history">
                    <motion.div whileTap={{ scale: 0.97 }}
                        className="mt-4 flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer"
                        style={{
                            background: 'linear-gradient(135deg, rgba(99,102,241,0.10), rgba(139,92,246,0.07))',
                            border: '1px solid rgba(99,102,241,0.22)',
                        }}>
                        <div>
                            <p style={{ fontSize: 11.5, fontWeight: 800, color: '#6366F1' }}>
                                تحديث تاريخك المرضي
                            </p>
                            <p style={{ fontSize: 9.5, color: W.textSub, marginTop: 1 }}>
                                بيانات أحدث = تحليل أدق وأعمق
                            </p>
                        </div>
                        <ChevronLeft className="w-4 h-4 text-indigo-400" />
                    </motion.div>
                </Link>

            </div>
        </GlassCard>
    );
}
