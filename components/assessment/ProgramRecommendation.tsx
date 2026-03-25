import React, { useState } from 'react';
import { db } from '@/lib/db';
import { Brain, Check, ChevronRight, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DOCTOR_KNOWLEDGE } from '@/components/ai/knowledge';

interface ProgramRecommendationProps {
    userMetrics?: Record<string, unknown>;
    userSymptoms?: Record<string, unknown>;
}

export default function ProgramRecommendation({ userMetrics = {}, userSymptoms = {} }: ProgramRecommendationProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [recommendation, setRecommendation] = useState(null);

    const [answers, setAnswers] = useState({
        goal: '',
        energy_level: '',
        digestive_health: '',
        stress_level: '',
        chronic_conditions: [],
        time_commitment: ''
    });

    const questions = [
        {
            id: 'goal',
            question: 'ما هو هدفك الصحي الرئيسي حالياً؟',
            options: [
                { value: 'weight_loss', label: 'نزول الوزن بشكل صحي' },
                { value: 'gut_healing', label: 'علاج مشاكل الهضم والقولون' },
                { value: 'energy_boost', label: 'رفع مستويات الطاقة والنشاط' },
                { value: 'detox', label: 'ديتوكس وتنظيف الجسم' },
                { value: 'general_health', label: 'تحسين الصحة العامة والوقاية' }
            ]
        },
        {
            id: 'symptoms',
            question: 'ما هي أكثر الأعراض التي تزعجك؟',
            options: [
                { value: 'bloating', label: 'انتفاخ وغازات' },
                { value: 'fatigue', label: 'خمول وتعب مستمر' },
                { value: 'sleep_issues', label: 'أرق ومشاكل نوم' },
                { value: 'skin_issues', label: 'مشاكل في البشرة' },
                { value: 'mood_swings', label: 'تقلبات مزاجية' }
            ],
            multi: true
        },
        {
            id: 'time_commitment',
            question: 'كم تستطيع تخصيص وقت يومياً لصحتك؟',
            options: [
                { value: 'low', label: '15-30 دقيقة (مشغول جداً)' },
                { value: 'medium', label: '30-60 دقيقة (متوسط)' },
                { value: 'high', label: 'أكثر من ساعة (مستعد للتغيير الجذري)' }
            ]
        }
    ];

    const handleOptionSelect = (value) => {
        const currentQ = questions[step - 1];
        if (currentQ.multi) {
            const currentValues = answers[currentQ.id] || [];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            setAnswers({ ...answers, [currentQ.id]: newValues });
        } else {
            setAnswers({ ...answers, [questions[step - 1].id]: value });
        }
    };

    const nextStep = () => {
        if (step < questions.length) {
            setStep(step + 1);
        } else {
            generateRecommendation();
        }
    };

    const generateRecommendation = async () => {
        setLoading(true);
        try {
            const prompt = `
      أنت مساعد طبي خبير في الطب الوظيفي (شخصية د. عمر العماد).
      
      بناءً على إجابات المريض:
      ${JSON.stringify(answers)}
      
      وبياناته الصحية الموجودة:
      ${JSON.stringify(userMetrics || {})}
      ${JSON.stringify(userSymptoms || {})}
      
      والبرامج المتاحة في العيادة:
      ${JSON.stringify(DOCTOR_KNOWLEDGE.programs)}
      
      قم باقتراح البرنامج الأنسب له (أسبوعي، 21 يوم، 3 أشهر).
      
      وخصص الخطة بشكل دقيق:
      1. خطة غذائية مقترحة (خطوط عريضة).
      2. نوع التمارين المناسبة لحالته وطاقته.
      3. جلسات الترددات المقترحة.
      4. نصيحة ذهبية خاصة به باللهجة اليمنية.
      
      الرد يجب أن يكون JSON بهذا الشكل:
      {
        "recommended_program_id": "weekly" | "21_days" | "3_months",
        "match_percentage": number,
        "reason": "string (Yemeni dialect)",
        "custom_plan": {
          "diet_focus": "string",
          "exercise_type": "string",
          "frequency_sessions": ["string"],
          "golden_advice": "string"
        }
      }
      `;

            const result = await db.integrations.Core.InvokeLLM({
                prompt: prompt,
                response_json_schema: {
                    type: "object",
                    properties: {
                        recommended_program_id: { type: "string", enum: ["weekly", "21_days", "3_months"] },
                        match_percentage: { type: "number" },
                        reason: { type: "string" },
                        custom_plan: {
                            type: "object",
                            properties: {
                                diet_focus: { type: "string" },
                                exercise_type: { type: "string" },
                                frequency_sessions: { type: "array", items: { type: "string" } },
                                golden_advice: { type: "string" }
                            }
                        }
                    }
                }
            });

            setRecommendation(result);
        } catch (error) {
            console.error("Recommendation Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const getProgramDetails = (id) => {
        const programs = [
            { id: 'weekly', name: 'البرنامج الأسبوعي', color: 'bg-blue-500' },
            { id: '21_days', name: 'برنامج ٢١ يوم', color: 'bg-primary' },
            { id: '3_months', name: 'برنامج ٣ أشهر', color: 'bg-[#D4AF37]' }
        ];
        return programs.find(p => p.id === id) || programs[1];
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button className="w-full gradient-gold text-white rounded-xl h-12 shadow-lg animate-pulse-soft">
                    <Brain className="w-5 h-5 ml-2" />
                    مش عارف أي برنامج يناسبك؟
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold text-slate-800">
                        {recommendation ? 'خطتك العلاجية المخصصة' : 'تحليل احتياجك الصحي'}
                    </DialogTitle>
                </DialogHeader>

                {!recommendation ? (
                    <div className="py-4">
                        {loading ? (
                            <div className="text-center py-10">
                                <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
                                <p className="text-slate-600 font-medium">جاري تحليل بياناتك وتصميم خطتك...</p>
                                <p className="text-xs text-slate-400 mt-2">نستخدم الذكاء الاصطناعي لمطابقة حالتك مع برامج د. عمر</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <Progress value={(step / questions.length) * 100} className="h-2" />

                                <div className="space-y-4 min-h-[200px]">
                                    <h3 className="text-lg font-semibold text-slate-800">
                                        {questions[step - 1].question}
                                    </h3>

                                    <div className="grid gap-3">
                                        {questions[step - 1].options.map((option) => {
                                            const isSelected = questions[step - 1].multi
                                                ? (answers[questions[step - 1].id] || []).includes(option.value)
                                                : answers[questions[step - 1].id] === option.value;

                                            return (
                                                <div
                                                    key={option.value}
                                                    onClick={() => {
                                                        // Use requestAnimationFrame to prevent INP issues
                                                        requestAnimationFrame(() => {
                                                            handleOptionSelect(option.value);
                                                        });
                                                    }}
                                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all will-change-transform ${isSelected
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-slate-100 hover:border-primary/30'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className={`font-medium ${isSelected ? 'text-primary' : 'text-slate-600'}`}>
                                                            {option.label}
                                                        </span>
                                                        {isSelected && <Check className="w-5 h-5 text-primary" />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setStep(Math.max(1, step - 1))}
                                        disabled={step === 1}
                                    >
                                        سابق
                                    </Button>
                                    <Button
                                        onClick={nextStep}
                                        className="gradient-primary px-8"
                                        disabled={questions[step - 1].multi
                                            ? !(answers[questions[step - 1].id] && answers[questions[step - 1].id].length > 0)
                                            : !answers[questions[step - 1].id]}
                                    >
                                        {step === questions.length ? 'تحليل النتيجة' : 'التالي'}
                                        <ChevronRight className="w-4 h-4 mr-2" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6 py-2 animate-in fade-in zoom-in duration-500">
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                <Sparkles className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-1">
                                البرنامج الأنسب لك هو
                            </h3>
                            <div className={`text-xl font-bold text-white py-2 px-6 rounded-xl inline-block my-2 ${getProgramDetails(recommendation.recommended_program_id).color}`}>
                                {getProgramDetails(recommendation.recommended_program_id).name}
                            </div>
                            <p className="text-primary font-bold text-sm">
                                نسبة التطابق: {recommendation.match_percentage}%
                            </p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                            <p className="text-slate-700 text-sm leading-relaxed text-center">
                                "{recommendation.reason}"
                            </p>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                <Brain className="w-5 h-5 text-purple-500" />
                                خطتك المبدئية المخصصة:
                            </h4>

                            <div className="grid grid-cols-1 gap-3">
                                <div className="glass p-3 rounded-lg">
                                    <span className="text-xs text-slate-400 block mb-1">التركيز الغذائي</span>
                                    <p className="text-sm font-medium text-slate-700">{recommendation.custom_plan.diet_focus}</p>
                                </div>
                                <div className="glass p-3 rounded-lg">
                                    <span className="text-xs text-slate-400 block mb-1">النشاط الرياضي</span>
                                    <p className="text-sm font-medium text-slate-700">{recommendation.custom_plan.exercise_type}</p>
                                </div>
                                <div className="glass p-3 rounded-lg">
                                    <span className="text-xs text-slate-400 block mb-1">الترددات المقترحة</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {recommendation.custom_plan.frequency_sessions.map((s, i) => (
                                            <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mt-4">
                                <span className="text-xs text-amber-500 font-bold block mb-1">💡 نصيحة د. عمر لك:</span>
                                <p className="text-sm text-amber-800">{recommendation.custom_plan.golden_advice}</p>
                            </div>
                        </div>

                        <Button className="w-full gradient-primary h-12 text-lg font-bold rounded-xl" onClick={() => window.location.href = "https://wa.me/967771447111?text=أريد الاشتراك في البرنامج المقترح"}>
                            ابدأ هذا البرنامج الآن
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}