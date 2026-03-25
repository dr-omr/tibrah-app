// components/booking/PatientInfoStep.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { User, Phone, Mail, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import SmartIntakeForm from '@/components/checkout/SmartIntakeForm';

interface PatientInfoStepProps {
    formData: any;
    setFormData: (data: any) => void;
    sessionTypes: any[];
    onBack: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export default function PatientInfoStep({ 
    formData, 
    setFormData, 
    sessionTypes, 
    onBack, 
    onSubmit, 
    isSubmitting 
}: PatientInfoStepProps) {
    const selectedSession = sessionTypes.find(s => s.id === formData.session_type);

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">بياناتك الشخصية</h2>
                <p className="text-slate-500 dark:text-slate-400">أدخل معلومات التواصل</p>
            </div>

            <div className="space-y-4">
                <div>
                    <Label className="text-slate-700 mb-2 block">الاسم الكامل *</Label>
                    <div className="relative">
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            value={formData.patient_name}
                            onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                            placeholder="أدخل اسمك الكامل"
                            className="glass border-0 h-14 pr-12 rounded-xl"
                        />
                    </div>
                </div>

                <div>
                    <Label className="text-slate-700 mb-2 block">رقم الجوال *</Label>
                    <div className="relative">
                        <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            value={formData.patient_phone}
                            onChange={(e) => setFormData({ ...formData, patient_phone: e.target.value })}
                            placeholder="05XXXXXXXX"
                            className="glass border-0 h-14 pr-12 rounded-xl"
                            dir="ltr"
                        />
                    </div>
                </div>

                <div>
                    <Label className="text-slate-700 mb-2 block">البريد الإلكتروني</Label>
                    <div className="relative">
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                            value={formData.patient_email}
                            onChange={(e) => setFormData({ ...formData, patient_email: e.target.value })}
                            placeholder="example@email.com"
                            className="glass border-0 h-14 pr-12 rounded-xl"
                            dir="ltr"
                        />
                    </div>
                </div>

                <div className="mt-6 mb-2">
                    <Label className="text-slate-700 mb-2 block font-bold text-lg">الشكوى السريرية الجسدية</Label>
                    <SmartIntakeForm 
                        value={formData.health_concern}
                        onChange={(val) => setFormData({ ...formData, health_concern: val })}
                    />
                </div>
                
                <div className="mt-4 mb-2">
                    <Label className="text-slate-700 mb-2 font-bold text-lg flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-indigo-500" />
                        البعد التشخيصي النفس-جسدي
                    </Label>
                    <p className="text-[12px] text-slate-500 mb-3 block border-r-4 border-indigo-200 pl-2 bg-indigo-50/50 p-2 rounded-l-md font-semibold">
                        هذا بُعد أساسي ضمن القراءة التشخيصية المتكاملة لحالتك مع د.عمر (اختياري، لكن يوصى به بشدة)
                    </p>
                    <Textarea 
                        placeholder="مثال: أشعر بضغوط عمل مستمرة مؤخراً، توتر من تغييرات في حياتي..."
                        value={formData.emotional_context}
                        onChange={(e) => setFormData({ ...formData, emotional_context: e.target.value })}
                        className="glass border-0 min-h-[100px] rounded-xl text-sm"
                    />
                </div>
            </div>

            {/* Summary */}
            <div className="glass rounded-2xl p-4 mt-6">
                <h4 className="font-semibold text-slate-800 dark:text-white mb-3">ملخص الحجز</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-500">نوع الجلسة</span>
                        <span className="font-medium">{selectedSession?.label}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">التاريخ</span>
                        <span className="font-medium">
                            {formData.date && format(formData.date, 'dd MMMM yyyy', { locale: ar })}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">الوقت</span>
                        <span className="font-medium">{formData.time_slot}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                        <span className="text-slate-700 font-semibold">المبلغ</span>
                        <span className="text-primary font-bold">{selectedSession?.price} ر.س</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-3">
                <Button
                    variant="outline"
                    onClick={onBack}
                    className="flex-1 h-14 rounded-2xl"
                >
                    السابق
                </Button>
                <Button
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="flex-1 h-14 gradient-primary rounded-2xl text-lg font-bold shadow-lg shadow-primary/30"
                >
                    {isSubmitting ? 'جاري الحجز...' : 'تأكيد الحجز'}
                </Button>
            </div>
        </motion.div>
    );
}
