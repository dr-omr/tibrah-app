import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Activity, Heart, Shield, CheckCircle2, ChevronRight, ChevronLeft, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { haptic } from '@/lib/HapticFeedback';

interface SmartIntakeFormProps {
    value: string;
    onChange: (value: string) => void;
    onComplete?: () => void;
}

const SYMPTOM_TAGS = [
    'صداع', 'إرهاق', 'ألم مفاصل', 'مشاكل هضمية', 'قلق',
    'أرق', 'تساقط شعر', 'زيادة وزن', 'خفقان', 'ضيق تنفس'
];

export default function SmartIntakeForm({ value, onChange, onComplete }: SmartIntakeFormProps) {
    const [step, setStep] = useState(1);
    const [intakeData, setIntakeData] = useState({
        mainComplaint: '',
        duration: '',
        severity: 5,
        symptoms: [] as string[],
        pastMedicalHistory: '',
        medications: ''
    });

    const updateData = (field: keyof typeof intakeData, val: any) => {
        setIntakeData(prev => {
            const newData = { ...prev, [field]: val };
            compileToValue(newData);
            return newData;
        });
    };

    const toggleSymptom = (sym: string) => {
        haptic.selection();
        setIntakeData(prev => {
            const current = prev.symptoms;
            const updated = current.includes(sym)
                ? current.filter(s => s !== sym)
                : [...current, sym];
            const newData = { ...prev, symptoms: updated };
            compileToValue(newData);
            return newData;
        });
    };

    const compileToValue = (data: typeof intakeData) => {
        const text = `
الشكوى الرئيسية: ${data.mainComplaint}
المدة: ${data.duration}
الشدة (1-10): ${data.severity}
الأعراض المصاحبة: ${data.symptoms.length > 0 ? data.symptoms.join('، ') : 'لا يوجد'}
التاريخ المرضي: ${data.pastMedicalHistory || 'لا يوجد'}
الأدوية الحالية: ${data.medications || 'لا يوجد'}
        `.trim();
        onChange(text);
    };

    const nextStep = () => {
        haptic.selection();
        if (step < 3) setStep(s => s + 1);
        else if (onComplete) onComplete();
    };

    const prevStep = () => {
        haptic.selection();
        if (step > 1) setStep(s => s - 1);
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-teal-100 dark:border-teal-900/30 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 p-4 border-b border-teal-50 dark:border-teal-900/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-500 flex items-center justify-center flex-shrink-0 text-white shadow-sm shadow-teal-500/20">
                    <Brain className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">القصة المرضية الذكية</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">تساعد د.عمر على فهم حالتك بشكل أعمق قبل الجلسة</p>
                </div>
            </div>

            {/* Progress */}
            <div className="flex items-center px-4 pt-4 gap-1">
                {[1, 2, 3].map(s => (
                    <div key={s} className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                        <motion.div
                            initial={false}
                            animate={{ width: step >= s ? '100%' : '0%' }}
                            className="h-full bg-teal-500"
                        />
                    </div>
                ))}
            </div>

            <div className="p-4 relative min-h-[250px]">
                <AnimatePresence mode="wait">
                    {/* Step 1: Main Complaint */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-bold flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-teal-500" />
                                    ما هو السبب الرئيسي لحجز الجلسة؟
                                </Label>
                                <Input
                                    value={intakeData.mainComplaint}
                                    onChange={e => updateData('mainComplaint', e.target.value)}
                                    placeholder="مثال: أعاني من صداع نصفي مستمر وإرهاق..."
                                    className="glass h-12"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 font-bold">منذ متى تعاني من هذا؟</Label>
                                <div className="flex gap-2">
                                    {['أيام', 'أسابيع', 'أشهر', 'سنوات'].map(dur => (
                                        <Button
                                            key={dur}
                                            type="button"
                                            variant={intakeData.duration === dur ? 'default' : 'outline'}
                                            onClick={() => updateData('duration', dur)}
                                            className={`flex-1 h-10 ${intakeData.duration === dur ? 'bg-teal-500 hover:bg-teal-600 text-white border-transparent' : 'border-slate-200'}`}
                                        >
                                            {dur}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between items-center">
                                    <Label className="text-slate-700 font-bold">شدة الأعراض (1-10)</Label>
                                    <span className="font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-md text-sm">{intakeData.severity}/10</span>
                                </div>
                                <input
                                    type="range"
                                    min="1" max="10"
                                    value={intakeData.severity}
                                    onChange={e => updateData('severity', parseInt(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
                                />
                                <div className="flex justify-between text-xs text-slate-400 font-medium">
                                    <span>خفيفة</span>
                                    <span>متوسطة</span>
                                    <span>شديدة جداً</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 2: Symptoms */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <div>
                                <Label className="text-slate-700 font-bold mb-3 block flex items-center gap-2">
                                    <Shield className="w-4 h-4 text-teal-500" />
                                    هل تعاني من أي أعراض أخرى؟ (اختر ما ينطبق)
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {SYMPTOM_TAGS.map(sym => {
                                        const isSelected = intakeData.symptoms.includes(sym);
                                        return (
                                            <button
                                                key={sym}
                                                type="button"
                                                onClick={() => toggleSymptom(sym)}
                                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                                    isSelected 
                                                    ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20 scale-105' 
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                            >
                                                {sym}
                                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 inline-block mr-1.5 opacity-80" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            
                            <div className="space-y-2 mt-4">
                                <Label className="text-slate-700 font-bold text-sm">أعراض أخرى (اختياري)</Label>
                                <Input 
                                    placeholder="اكتب هنا..."
                                    className="glass h-10 text-sm"
                                    onBlur={(e) => {
                                        if(e.target.value && !intakeData.symptoms.includes(e.target.value)) {
                                            toggleSymptom(e.target.value);
                                            e.target.value = '';
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if(e.key === 'Enter') {
                                            e.preventDefault();
                                            if(e.currentTarget.value && !intakeData.symptoms.includes(e.currentTarget.value)) {
                                                toggleSymptom(e.currentTarget.value);
                                                e.currentTarget.value = '';
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Medical History */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-bold flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-teal-500" />
                                    تاريخ مرضي سابق أو عمليات جراحية؟ (اختياري)
                                </Label>
                                <Textarea
                                    value={intakeData.pastMedicalHistory}
                                    onChange={e => updateData('pastMedicalHistory', e.target.value)}
                                    placeholder="لا يوجد..."
                                    className="glass min-h-[80px] resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 font-bold">أدوية أو مكملات تتناولها حالياً؟ (اختياري)</Label>
                                <Textarea
                                    value={intakeData.medications}
                                    onChange={e => updateData('medications', e.target.value)}
                                    placeholder="لا يوجد..."
                                    className="glass min-h-[60px] resize-none"
                                />
                            </div>
                            
                            <div className="p-3 bg-teal-50 rounded-xl flex items-start gap-2 border border-teal-100">
                                <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                                <p className="text-xs font-semibold text-teal-800 leading-relaxed">
                                    شكراً لك! هذه المعلومات ستساعدنا في تجهيز ملفك وتحسين جودة استشارتك مع الطبيب. جميع البيانات سرية تماماً.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 flex justify-between gap-3">
                {step > 1 ? (
                    <Button type="button" variant="outline" onClick={prevStep} className="h-10 px-4 rounded-xl font-bold">
                        <ChevronRight className="w-4 h-4 ml-1" />
                        رجوع
                    </Button>
                ) : <div />}
                
                <Button 
                    type="button"
                    onClick={nextStep} 
                    disabled={step === 1 && (!intakeData.mainComplaint || !intakeData.duration)}
                    className="h-10 px-6 rounded-xl font-bold bg-teal-500 hover:bg-teal-600 text-white transition-all shadow-md shadow-teal-500/20"
                >
                    {step === 3 ? 'إنهاء وحفظ' : 'متابعة'}
                    {step < 3 && <ChevronLeft className="w-4 h-4 mr-1" />}
                </Button>
            </div>
        </div>
    );
}
