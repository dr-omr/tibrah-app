import React, { useState } from 'react';
import { db } from '@/lib/db';
import {
    Sparkles, Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
    Loader2, RefreshCw, FileText, Share2, Download, Activity, Heart,
    AlertCircle, Shield, Lightbulb, BarChart3, Calendar, ChevronDown, ChevronUp
} from 'lucide-react';
import LongTermHealthChart from './LongTermHealthChart';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface TrendData {
    direction: 'up' | 'down' | 'stable';
    percentage: string;
    recentAvg: string;
    dataPoints: number;
}

export default function AIHealthAnalysis({ metrics, symptoms, dailyLogs }: { metrics: any[]; symptoms: any[]; dailyLogs: any[] }) {
    const [analysis, setAnalysis] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const calculateTrends = () => {
        const trends: Record<string, TrendData> = {};
        const metricTypes = [...new Set(metrics.map(m => m.metric_type))];

        metricTypes.forEach(type => {
            const typeMetrics = metrics
                .filter(m => m.metric_type === type)
                .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());

            if (typeMetrics.length >= 2) {
                const recent = typeMetrics.slice(-5);
                const older = typeMetrics.slice(0, Math.max(1, typeMetrics.length - 5));
                const recentAvg = recent.reduce((a, b) => a + b.value, 0) / recent.length;
                const olderAvg = older.reduce((a, b) => a + b.value, 0) / older.length;
                const change = ((recentAvg - olderAvg) / olderAvg) * 100;

                trends[type] = {
                    direction: change > 2 ? 'up' : change < -2 ? 'down' : 'stable',
                    percentage: Math.abs(change).toFixed(1),
                    recentAvg: recentAvg.toFixed(1),
                    dataPoints: typeMetrics.length
                };
            }
        });

        return trends;
    };

    const generateAnalysis = async () => {
        setLoading(true);
        try {
            const trends = calculateTrends();

            const metricsText = metrics.map(m =>
                `${m.metric_type}: ${m.value} ${m.unit || ''} (${new Date(m.recorded_at).toLocaleDateString('ar')})`
            ).join('\n');

            const trendsText = Object.entries(trends).map(([type, data]: [string, TrendData]) =>
                `${type}: اتجاه ${data.direction === 'up' ? 'صاعد' : data.direction === 'down' ? 'هابط' : 'مستقر'} (${data.percentage}%)`
            ).join('\n');

            const symptomsText = symptoms.map(s =>
                `${s.symptom} - شدة: ${s.severity}/10, منطقة: ${s.body_area || 'غير محددة'}, تاريخ: ${new Date(s.recorded_at).toLocaleDateString('ar')}`
            ).join('\n');

            const logsText = dailyLogs.slice(-14).map(l =>
                `تاريخ: ${l.date}, المزاج: ${l.mood}/5, الطاقة: ${l.energy_level}/5, النوم: ${l.sleep_quality}/5, التوتر: ${l.stress_level}/5, الرياضة: ${l.exercise?.duration_minutes || 0} دقيقة`
            ).join('\n');

            const prompt = `
أنت مساعد صحي ذكي في تطبيق "طِبرَا" (بشخصية يمنية محببة وخبيرة في الطب الوظيفي).
مهمتك: تحليل بيانات المستخدم الصحية لتقديم تقرير شامل ومفيد باللهجة اليمنية الدافئة والمشجعة.

## البيانات المتاحة للتحليل:
## القياسات الحيوية (${metrics.length} قياس):
${metricsText || 'لا توجد قياسات'}

## اتجاهات القياسات:
${trendsText || 'لا تتوفر بيانات كافية للاتجاهات'}

## الأعراض المسجلة (${symptoms.length} عرض):
${symptomsText || 'لا توجد أعراض مسجلة'}

## السجلات اليومية (آخر 14 يوم):
${logsText || 'لا توجد سجلات'}

## المطلوب (Output JSON):
قدم تحليلاً عميقاً باللهجة اليمنية (صنعانية/تعزية راقية) يتضمن:
1. **الملخص (Summary)**: فقرة ترحيبية وتحليل عام للوضع. (مثلاً: "حيا الله من جاء... وضعك اليوم يبشر بالخير بس نشتي نركز على...")
2. **تقييم الصحة (Score)**: درجة من 100.
3. **تحليل الاتجاهات (Trend Analysis)**: اشرح *لماذا* تتغير القياسات بهذا الشكل. اربط بين الأعراض والعادات (مثلاً: "لاحظت أن صداعك يزيد لما يقل شرب الماء").
4. **أنماط الأعراض**: هل هناك رابط بين وقت معين أو أكلة معينة والأعراض؟
5. **المخاطر**: نبه المستخدم بأسلوب لطيف إذا كان هناك شيء مقلق.
6. **نصائح عملية**: خطوات بسيطة جداً يمكن تطبيقها في البيت اليمني (أعشاب، مشي، أكل).

تذكر:
- تحدث كخبير صديق (يا غالي، يا خبير).
- امدح الدكتور عمر العماد بشكل طبيعي عند الحاجة لنصيحة طبية متخصصة.
- كن دقيقاً علمياً ولكن بأسلوب بسيط.
`;

            const result = await db.integrations.Core.InvokeLLM({
                prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        overall_score: { type: "number" },
                        summary: { type: "string" },
                        health_status: {
                            type: "string",
                            enum: ["excellent", "good", "fair", "needs_attention", "critical"]
                        },
                        trend_analysis: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    metric: { type: "string" },
                                    trend: { type: "string" },
                                    interpretation: { type: "string" },
                                    concern_level: { type: "string", enum: ["low", "medium", "high"] }
                                }
                            }
                        },
                        symptom_patterns: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    pattern: { type: "string" },
                                    frequency: { type: "string" },
                                    possible_causes: { type: "array", items: { type: "string" } },
                                    recommendations: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        risk_assessment: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    risk: { type: "string" },
                                    level: { type: "string", enum: ["low", "moderate", "high", "urgent"] },
                                    explanation: { type: "string" },
                                    preventive_measures: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        positive_points: { type: "array", items: { type: "string" } },
                        attention_points: { type: "array", items: { type: "string" } },
                        recommendations: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    category: { type: "string" },
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    priority: { type: "string", enum: ["high", "medium", "low"] }
                                }
                            }
                        },
                        weekly_action_plan: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    day: { type: "string" },
                                    tasks: { type: "array", items: { type: "string" } }
                                }
                            }
                        },
                        monitoring_indicators: { type: "array", items: { type: "string" } },
                        doctor_notes: { type: "string" }
                    }
                }
            });

            setAnalysis({ ...(result as any), trends, generatedAt: new Date().toISOString() });
        } catch (error) {
            console.error('Error generating analysis:', error);
            toast.error('حدث خطأ في التحليل');
        } finally {
            setLoading(false);
        }
    };

    const generateReport = () => {
        if (!analysis) return;

        const reportDate = new Date().toLocaleDateString('ar-SA', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        const reportContent = `
══════════════════════════════════════════════════════════
                    تقرير صحي شامل
                    عيادة طِبرَا الرقمية
══════════════════════════════════════════════════════════

📅 تاريخ التقرير: ${reportDate}
📊 التقييم العام: ${analysis.overall_score}/100
🏥 الحالة الصحية: ${getStatusLabel(analysis.health_status)}

══════════════════════════════════════════════════════════
                      ملخص الحالة
══════════════════════════════════════════════════════════
${analysis.summary}

══════════════════════════════════════════════════════════
                   تحليل الاتجاهات
══════════════════════════════════════════════════════════
${analysis.trend_analysis?.map(t =>
            `• ${t.metric}: ${t.trend}\n  التفسير: ${t.interpretation}\n  مستوى القلق: ${getLevelLabel(t.concern_level)}`
        ).join('\n\n') || 'لا تتوفر بيانات كافية'}

══════════════════════════════════════════════════════════
                   تقييم المخاطر
══════════════════════════════════════════════════════════
${analysis.risk_assessment?.map(r =>
            `⚠️ ${r.risk} (${getLevelLabel(r.level)})\n   ${r.explanation}\n   الإجراءات الوقائية:\n${r.preventive_measures?.map(m => `   - ${m}`).join('\n')}`
        ).join('\n\n') || 'لا توجد مخاطر محددة'}

══════════════════════════════════════════════════════════
                     التوصيات
══════════════════════════════════════════════════════════
${analysis.recommendations?.map((r, i) =>
            `${i + 1}. [${r.category}] ${r.title}\n   ${r.description}`
        ).join('\n\n') || 'لا توجد توصيات'}

══════════════════════════════════════════════════════════
                   ملاحظات الطبيب
══════════════════════════════════════════════════════════
${analysis.doctor_notes || 'لا توجد ملاحظات'}

══════════════════════════════════════════════════════════
            تنبيه: هذا التقرير للاطلاع فقط
      يرجى استشارة الطبيب قبل اتخاذ أي قرار علاجي
══════════════════════════════════════════════════════════
`;

        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `تقرير-صحي-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('تم تحميل التقرير بنجاح');
    };

    const shareReport = async () => {
        if (!analysis) return;

        const shareText = `📊 تقريري الصحي من طِبرَا\n\n` +
            `التقييم العام: ${analysis.overall_score}/100\n` +
            `الحالة: ${getStatusLabel(analysis.health_status)}\n\n` +
            `${analysis.summary}\n\n` +
            `📅 ${new Date().toLocaleDateString('ar-SA')}`;

        if (navigator.share) {
            try {
                await navigator.share({ title: 'تقريري الصحي', text: shareText });
            } catch (err) {
                navigator.clipboard.writeText(shareText);
                toast.success('تم نسخ التقرير');
            }
        } else {
            navigator.clipboard.writeText(shareText);
            toast.success('تم نسخ التقرير');
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            excellent: 'ممتاز',
            good: 'جيد',
            fair: 'مقبول',
            needs_attention: 'يحتاج انتباه',
            critical: 'حرج'
        };
        return labels[status] || status;
    };

    const getStatusColor = (status) => {
        const colors = {
            excellent: 'bg-green-500',
            good: 'bg-blue-500',
            fair: 'bg-yellow-500',
            needs_attention: 'bg-orange-500',
            critical: 'bg-red-500'
        };
        return colors[status] || 'bg-gray-500';
    };

    const getLevelLabel = (level) => {
        const labels = {
            low: 'منخفض',
            medium: 'متوسط',
            moderate: 'متوسط',
            high: 'مرتفع',
            urgent: 'عاجل'
        };
        return labels[level] || level;
    };

    const getLevelColor = (level) => {
        const colors = {
            low: 'bg-green-100 text-green-700',
            medium: 'bg-yellow-100 text-yellow-700',
            moderate: 'bg-orange-100 text-orange-700',
            high: 'bg-red-100 text-red-700',
            urgent: 'bg-red-500 text-white'
        };
        return colors[level] || 'bg-gray-100 text-gray-700';
    };

    if (loading) {
        return (
            <div className="glass rounded-3xl p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                    <Brain className="w-10 h-10 text-white" />
                </div>
                <Loader2 className="w-10 h-10 mx-auto text-[#2D9B83] animate-spin mb-4" />
                <p className="text-lg text-slate-700 font-medium mb-2">جاري التحليل المتقدم...</p>
                <p className="text-sm text-slate-400">يتم تحليل {metrics.length} قياس و {symptoms.length} عرض</p>
                <div className="mt-6 space-y-2">
                    <div className="flex items-center gap-2 justify-center text-sm text-slate-500">
                        <Activity className="w-4 h-4 animate-pulse" />
                        <span>تحليل الاتجاهات الصحية</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center text-sm text-slate-500">
                        <Shield className="w-4 h-4 animate-pulse" />
                        <span>تقييم المخاطر المحتملة</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center text-sm text-slate-500">
                        <Lightbulb className="w-4 h-4 animate-pulse" />
                        <span>إنشاء التوصيات</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="glass rounded-3xl p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">التحليل الصحي المتقدم</h3>
                <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                    احصل على تحليل شامل لبياناتك الصحية مع توقعات المخاطر وتوصيات مخصصة
                </p>

                <div className="grid grid-cols-3 gap-3 mb-6 max-w-sm mx-auto">
                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                        <BarChart3 className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                        <span className="text-xs text-slate-600">تحليل الاتجاهات</span>
                    </div>
                    <div className="bg-rose-50 rounded-xl p-3 text-center">
                        <AlertCircle className="w-6 h-6 text-rose-500 mx-auto mb-1" />
                        <span className="text-xs text-slate-600">توقع المخاطر</span>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                        <FileText className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                        <span className="text-xs text-slate-600">تقرير طبي</span>
                    </div>
                </div>

                <Button
                    onClick={generateAnalysis}
                    className="gradient-primary text-white rounded-xl px-8 h-14 text-lg shadow-lg"
                    disabled={!metrics.length && !symptoms.length && !dailyLogs.length}
                >
                    <Brain className="w-6 h-6 ml-2" />
                    ابدأ التحليل المتقدم
                </Button>

                {!metrics.length && !symptoms.length && !dailyLogs.length && (
                    <p className="text-sm text-amber-600 mt-4 flex items-center justify-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        سجل بعض البيانات أولاً للحصول على تحليل
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header Card */}
            <div className="glass rounded-3xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-lg">التحليل الصحي المتقدم</h3>
                            <p className="text-sm text-slate-500">
                                {new Date(analysis.generatedAt).toLocaleDateString('ar-SA')}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={shareReport} className="text-slate-400 hover:text-blue-500">
                            <Share2 className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={generateReport} className="text-slate-400 hover:text-green-500">
                            <Download className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={generateAnalysis} className="text-slate-400 hover:text-purple-500">
                            <RefreshCw className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Score & Status */}
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-500">التقييم العام</span>
                            <span className="text-2xl font-bold text-slate-800">{analysis.overall_score}<span className="text-base text-slate-400">/100</span></span>
                        </div>
                        <div className="bg-slate-100 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ${getStatusColor(analysis.health_status)}`}
                                style={{ width: `${analysis.overall_score}%` }}
                            />
                        </div>
                    </div>
                    <Badge className={`${getStatusColor(analysis.health_status)} text-white px-4 py-2`}>
                        {getStatusLabel(analysis.health_status)}
                    </Badge>
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-br from-[#2D9B83]/10 to-[#3FB39A]/10 rounded-2xl p-4">
                    <p className="text-slate-700 leading-relaxed">{analysis.summary}</p>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full glass rounded-xl p-1 h-auto">
                    <TabsTrigger value="overview" className="flex-1 rounded-lg data-[state=active]:gradient-primary data-[state=active]:text-white py-3">
                        <Activity className="w-4 h-4 ml-1" />
                        نظرة عامة
                    </TabsTrigger>
                    <TabsTrigger value="risks" className="flex-1 rounded-lg data-[state=active]:gradient-primary data-[state=active]:text-white py-3">
                        <Shield className="w-4 h-4 ml-1" />
                        المخاطر
                    </TabsTrigger>
                    <TabsTrigger value="plan" className="flex-1 rounded-lg data-[state=active]:gradient-primary data-[state=active]:text-white py-3">
                        <Calendar className="w-4 h-4 ml-1" />
                        الخطة
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4 mt-4">

                    {/* New Charts Section */}
                    <div className="glass rounded-2xl p-4 mb-4">
                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-[#2D9B83]" />
                            الرسوم البيانية للاتجاهات
                        </h4>
                        <LongTermHealthChart metrics={metrics} dailyLogs={dailyLogs} symptoms={symptoms} />
                    </div>

                    {/* Trend Analysis */}
                    {analysis.trend_analysis?.length > 0 && (
                        <div className="glass rounded-2xl p-4">
                            <button
                                onClick={() => toggleSection('trends')}
                                className="w-full flex items-center justify-between mb-3"
                            >
                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-purple-500" />
                                    تحليل الاتجاهات
                                </h4>
                                {expandedSections.trends ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                            </button>

                            {(expandedSections.trends !== false) && (
                                <div className="space-y-3">
                                    {analysis.trend_analysis.map((trend, idx) => (
                                        <div key={idx} className="bg-white/50 rounded-xl p-3">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-slate-700">{trend.metric}</span>
                                                <Badge className={getLevelColor(trend.concern_level)}>
                                                    {getLevelLabel(trend.concern_level)}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-600 mb-1">{trend.trend}</p>
                                            <p className="text-xs text-slate-400">{trend.interpretation}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Symptom Patterns */}
                    {analysis.symptom_patterns?.length > 0 && (
                        <div className="glass rounded-2xl p-4">
                            <button
                                onClick={() => toggleSection('patterns')}
                                className="w-full flex items-center justify-between mb-3"
                            >
                                <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-rose-500" />
                                    أنماط الأعراض
                                </h4>
                                {expandedSections.patterns ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                            </button>

                            {(expandedSections.patterns !== false) && (
                                <div className="space-y-3">
                                    {analysis.symptom_patterns.map((pattern, idx) => (
                                        <div key={idx} className="bg-rose-50 rounded-xl p-3">
                                            <p className="font-medium text-slate-700 mb-1">{pattern.pattern}</p>
                                            <p className="text-xs text-slate-500 mb-2">التكرار: {pattern.frequency}</p>
                                            {pattern.possible_causes?.length > 0 && (
                                                <div className="text-xs text-slate-600">
                                                    <span className="font-medium">الأسباب المحتملة: </span>
                                                    {pattern.possible_causes.join('، ')}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Positive & Attention Points */}
                    <div className="grid grid-cols-1 gap-4">
                        {analysis.positive_points?.length > 0 && (
                            <div className="glass rounded-2xl p-4">
                                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    النقاط الإيجابية
                                </h4>
                                <div className="space-y-2">
                                    {analysis.positive_points.map((point, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                            <span className="text-green-500 mt-0.5">✓</span>
                                            <span>{point}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {analysis.attention_points?.length > 0 && (
                            <div className="glass rounded-2xl p-4">
                                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    نقاط تحتاج انتباه
                                </h4>
                                <div className="space-y-2">
                                    {analysis.attention_points.map((point, idx) => (
                                        <div key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                            <span className="text-amber-500 mt-0.5">⚠</span>
                                            <span>{point}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Risks Tab */}
                <TabsContent value="risks" className="space-y-4 mt-4">
                    {analysis.risk_assessment?.length > 0 ? (
                        analysis.risk_assessment.map((risk, idx) => (
                            <div key={idx} className="glass rounded-2xl p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${risk.level === 'urgent' ? 'bg-red-100' :
                                            risk.level === 'high' ? 'bg-orange-100' :
                                                risk.level === 'moderate' ? 'bg-yellow-100' : 'bg-green-100'
                                            }`}>
                                            <AlertCircle className={`w-5 h-5 ${risk.level === 'urgent' ? 'text-red-600' :
                                                risk.level === 'high' ? 'text-orange-600' :
                                                    risk.level === 'moderate' ? 'text-yellow-600' : 'text-green-600'
                                                }`} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{risk.risk}</h4>
                                            <Badge className={getLevelColor(risk.level)}>
                                                {getLevelLabel(risk.level)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-600 mb-3">{risk.explanation}</p>

                                {risk.preventive_measures?.length > 0 && (
                                    <div className="bg-slate-50 rounded-xl p-3">
                                        <p className="text-xs font-medium text-slate-500 mb-2">الإجراءات الوقائية:</p>
                                        <ul className="space-y-1">
                                            {risk.preventive_measures.map((measure, mIdx) => (
                                                <li key={mIdx} className="text-sm text-slate-600 flex items-start gap-2">
                                                    <Shield className="w-4 h-4 text-[#2D9B83] mt-0.5 flex-shrink-0" />
                                                    {measure}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="glass rounded-2xl p-6 text-center">
                            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                            <p className="text-slate-600">لم يتم اكتشاف مخاطر صحية محددة</p>
                        </div>
                    )}

                    {/* Monitoring Indicators */}
                    {analysis.monitoring_indicators?.length > 0 && (
                        <div className="glass rounded-2xl p-4">
                            <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-500" />
                                مؤشرات يجب مراقبتها
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {analysis.monitoring_indicators.map((indicator, idx) => (
                                    <Badge key={idx} variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                                        {indicator}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </TabsContent>

                {/* Action Plan Tab */}
                <TabsContent value="plan" className="space-y-4 mt-4">
                    {/* Recommendations */}
                    {analysis.recommendations?.length > 0 && (
                        <div className="glass rounded-2xl p-4">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-[#2D9B83]" />
                                التوصيات العلاجية
                            </h4>
                            <div className="space-y-3">
                                {analysis.recommendations.map((rec, idx) => (
                                    <div key={idx} className="bg-white/50 rounded-xl p-3 border-r-4 border-[#2D9B83]">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-slate-400">{rec.category}</span>
                                            <Badge className={
                                                rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                                                    rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-green-100 text-green-700'
                                            }>
                                                {rec.priority === 'high' ? 'أولوية عالية' : rec.priority === 'medium' ? 'متوسطة' : 'عادية'}
                                            </Badge>
                                        </div>
                                        <p className="font-medium text-slate-700">{rec.title}</p>
                                        <p className="text-sm text-slate-500 mt-1">{rec.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Weekly Plan */}
                    {analysis.weekly_action_plan?.length > 0 && (
                        <div className="glass rounded-2xl p-4">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-purple-500" />
                                خطة الأسبوع القادم
                            </h4>
                            <div className="space-y-3">
                                {analysis.weekly_action_plan.map((day, idx) => (
                                    <div key={idx} className="bg-purple-50 rounded-xl p-3">
                                        <p className="font-medium text-purple-700 mb-2">{day.day}</p>
                                        <ul className="space-y-1">
                                            {day.tasks?.map((task, tIdx) => (
                                                <li key={tIdx} className="text-sm text-slate-600 flex items-start gap-2">
                                                    <span className="text-purple-400">•</span>
                                                    {task}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Doctor Notes */}
                    {analysis.doctor_notes && (
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-200">
                            <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                                <Lightbulb className="w-5 h-5" />
                                ملاحظات طبية
                            </h4>
                            <p className="text-sm text-amber-700 leading-relaxed">{analysis.doctor_notes}</p>
                        </div>
                    )}

                    {/* Generate Report Button */}
                    <div className="flex gap-3">
                        <Button
                            onClick={generateReport}
                            className="flex-1 gradient-primary text-white rounded-xl h-12"
                        >
                            <Download className="w-5 h-5 ml-2" />
                            تحميل التقرير الكامل
                        </Button>
                        <Button
                            onClick={shareReport}
                            variant="outline"
                            className="rounded-xl h-12 px-6"
                        >
                            <Share2 className="w-5 h-5" />
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}