import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createPageUrl } from '../utils';
import {
    ArrowRight, Calendar, Clock, Video, MessageCircle,
    Check, User, Phone, Mail, FileText, Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { toast } from "sonner";
import { format, addDays, isSameDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNotifications } from '@/contexts/NotificationContext';

const sessionTypes = [
    {
        id: 'diagnostic',
        label: 'الجلسة التشخيصية',
        duration: '٤٥-٦٠ دقيقة',
        price: '٣٥٠',
        description: 'تحليل شامل لحالتك الصحية وتحديد الأسباب الجذرية'
    },
    {
        id: 'followup',
        label: 'جلسة المتابعة',
        duration: '٣٠ دقيقة',
        price: '٢٠٠',
        description: 'متابعة تقدمك وتعديل الخطة العلاجية'
    },
    {
        id: 'consultation',
        label: 'استشارة سريعة',
        duration: '١٥ دقيقة',
        price: '١٠٠',
        description: 'استشارة سريعة لسؤال محدد'
    },
];

const timeSlots = [
    '09:00 ص', '10:00 ص', '11:00 ص', '12:00 م',
    '02:00 م', '03:00 م', '04:00 م', '05:00 م'
];

export default function BookAppointment() {
    const router = useRouter();
    const { notify } = useNotifications();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        session_type: '',
        date: null,
        time_slot: '',
        patient_name: '',
        patient_phone: '',
        patient_email: '',
        health_concern: '',
    });

    const createAppointmentMutation = useMutation({
        mutationFn: (data) => base44.entities.Appointment.create({
            ...data,
            date: format(data.date, 'yyyy-MM-dd'),
            status: 'pending'
        }),
        onSuccess: () => {
            // Show toast notification
            toast.success('تم حجز الموعد بنجاح');

            // Add to notification system
            notify('تم حجز موعدك بنجاح! 🎉', {
                body: `موعدك يوم ${formData.date ? format(formData.date, 'dd MMMM', { locale: ar }) : ''} الساعة ${formData.time_slot}`,
                type: 'success',
                action: {
                    label: 'عرض مواعيدي',
                    href: '/my-appointments'
                }
            });

            setStep(4);
        },
    });

    const handleSubmit = () => {
        if (!formData.patient_name || !formData.patient_phone) {
            toast.error('يرجى ملء جميع الحقول المطلوبة');
            return;
        }
        createAppointmentMutation.mutate(formData);
    };

    const selectedSession = sessionTypes.find(s => s.id === formData.session_type);

    // Generate available dates (next 14 days including today, excluding Fridays)
    const availableDates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i <= 14; i++) {
        const date = addDays(new Date(), i);
        if (date.getDay() !== 5) { // Exclude Friday
            availableDates.push(date);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            {/* Header */}
            <div className="sticky top-0 z-20 glass px-6 py-4">
                <div className="flex items-center gap-4">
                    <Link href={createPageUrl('Home')}>
                        <Button size="icon" variant="ghost">
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-lg font-bold text-slate-800">حجز موعد</h1>
                </div>

                {/* Progress */}
                <div className="flex gap-2 mt-4">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`flex-1 h-1 rounded-full transition-all duration-300 ${s <= step ? 'gradient-primary' : 'bg-slate-200'
                                }`}
                        />
                    ))}
                </div>
            </div>

            <div className="px-6 py-6">
                {/* Step 1: Session Type */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">اختر نوع الجلسة</h2>
                            <p className="text-slate-500">حدد الخدمة المناسبة لاحتياجاتك</p>
                        </div>

                        <div className="space-y-4">
                            {sessionTypes.map((session) => (
                                <button
                                    key={session.id}
                                    onClick={() => setFormData({ ...formData, session_type: session.id })}
                                    className={`w-full text-right p-5 rounded-2xl transition-all duration-300 ${formData.session_type === session.id
                                        ? 'glass-dark ring-2 ring-[#2D9B83] shadow-glow'
                                        : 'glass hover:shadow-lg'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${formData.session_type === session.id
                                            ? 'gradient-primary'
                                            : 'bg-slate-100'
                                            }`}>
                                            <Video className={`w-6 h-6 ${formData.session_type === session.id ? 'text-white' : 'text-slate-400'
                                                }`} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-slate-800">{session.label}</h3>
                                            <p className="text-sm text-slate-500 mt-1">{session.description}</p>
                                            <div className="flex items-center gap-4 mt-3">
                                                <span className="text-sm text-slate-400 flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {session.duration}
                                                </span>
                                                <span className="text-[#2D9B83] font-bold">
                                                    {session.price} ر.س
                                                </span>
                                            </div>
                                        </div>
                                        {formData.session_type === session.id && (
                                            <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                                                <Check className="w-4 h-4 text-white" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <Button
                            onClick={() => setStep(2)}
                            disabled={!formData.session_type}
                            className="w-full h-14 gradient-primary rounded-2xl text-lg font-bold"
                        >
                            التالي
                        </Button>
                    </div>
                )}

                {/* Step 2: Date & Time */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">اختر الموعد</h2>
                            <p className="text-slate-500">حدد التاريخ والوقت المناسب</p>
                        </div>

                        {/* Calendar */}
                        <div className="glass rounded-2xl p-4">
                            <CalendarComponent
                                mode="single"
                                selected={formData.date}
                                onSelect={(date) => setFormData({ ...formData, date })}
                                disabled={(date) => {
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    const checkDate = new Date(date);
                                    checkDate.setHours(0, 0, 0, 0);
                                    return checkDate < today ||
                                        date.getDay() === 5 ||
                                        date > addDays(new Date(), 14);
                                }}
                                className="mx-auto"
                            />
                        </div>

                        {/* Time Slots */}
                        {formData.date && (
                            <div>
                                <h3 className="font-semibold text-slate-800 mb-3">الأوقات المتاحة</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {timeSlots.map((slot) => (
                                        <button
                                            key={slot}
                                            onClick={() => setFormData({ ...formData, time_slot: slot })}
                                            className={`py-3 px-2 rounded-xl text-sm font-medium transition-all duration-300 ${formData.time_slot === slot
                                                ? 'gradient-primary text-white shadow-md'
                                                : 'glass hover:bg-[#2D9B83]/10'
                                                }`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setStep(1)}
                                className="flex-1 h-14 rounded-2xl"
                            >
                                السابق
                            </Button>
                            <Button
                                onClick={() => setStep(3)}
                                disabled={!formData.date || !formData.time_slot}
                                className="flex-1 h-14 gradient-primary rounded-2xl text-lg font-bold"
                            >
                                التالي
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Personal Info */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">بياناتك الشخصية</h2>
                            <p className="text-slate-500">أدخل معلومات التواصل</p>
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

                            <div>
                                <Label className="text-slate-700 mb-2 block">الشكوى الصحية الرئيسية</Label>
                                <div className="relative">
                                    <FileText className="absolute right-4 top-4 w-5 h-5 text-slate-400" />
                                    <Textarea
                                        value={formData.health_concern}
                                        onChange={(e) => setFormData({ ...formData, health_concern: e.target.value })}
                                        placeholder="صف مشكلتك الصحية بإيجاز..."
                                        className="glass border-0 pr-12 rounded-xl min-h-[120px]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="glass rounded-2xl p-4">
                            <h4 className="font-semibold text-slate-800 mb-3">ملخص الحجز</h4>
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
                                    <span className="text-[#2D9B83] font-bold">{selectedSession?.price} ر.س</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setStep(2)}
                                className="flex-1 h-14 rounded-2xl"
                            >
                                السابق
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={createAppointmentMutation.isPending}
                                className="flex-1 h-14 gradient-primary rounded-2xl text-lg font-bold"
                            >
                                {createAppointmentMutation.isPending ? 'جاري الحجز...' : 'تأكيد الحجز'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step 4: Confirmation */}
                {step === 4 && (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full gradient-primary flex items-center justify-center shadow-glow animate-breathe">
                            <Check className="w-12 h-12 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">تم الحجز بنجاح!</h2>
                        <p className="text-slate-500 mb-8">
                            سنتواصل معك قريباً لتأكيد الموعد
                        </p>

                        <div className="glass rounded-2xl p-6 mb-6">
                            <div className="space-y-3 text-right">
                                <div className="flex justify-between">
                                    <span className="font-medium">{selectedSession?.label}</span>
                                    <span className="text-slate-500">نوع الجلسة</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">
                                        {formData.date && format(formData.date, 'dd MMMM yyyy', { locale: ar })}
                                    </span>
                                    <span className="text-slate-500">التاريخ</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium">{formData.time_slot}</span>
                                    <span className="text-slate-500">الوقت</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <a
                                href={`https://wa.me/967777088577?text=مرحباً، لقد حجزت ${selectedSession?.label} بتاريخ ${formData.date ? format(formData.date, 'dd/MM/yyyy') : ''}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                            >
                                <Button className="w-full h-14 bg-green-500 hover:bg-green-600 rounded-2xl text-lg font-bold">
                                    <MessageCircle className="w-5 h-5 ml-2" />
                                    تأكيد عبر واتساب
                                </Button>
                            </a>

                            <a
                                href={`https://wa.me/967777088577?text=${encodeURIComponent(`📋 نسخة من بيانات الحجز

👤 الاسم: ${formData.patient_name}
📱 الجوال: ${formData.patient_phone}
📧 البريد: ${formData.patient_email || 'غير محدد'}

📌 نوع الجلسة: ${selectedSession?.label}
📅 التاريخ: ${formData.date ? format(formData.date, 'dd MMMM yyyy', { locale: ar }) : ''}
⏰ الوقت: ${formData.time_slot}
💰 المبلغ: ${selectedSession?.price} ر.س

💬 الشكوى الصحية:
${formData.health_concern || 'لم تحدد'}

✅ تم إرسال هذه النسخة من تطبيق طِبرَا`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                            >
                                <Button variant="outline" className="w-full h-14 rounded-2xl text-lg font-bold border-green-500 text-green-600 hover:bg-green-50">
                                    <MessageCircle className="w-5 h-5 ml-2" />
                                    إرسال نسخة من بيانات الحجز
                                </Button>
                            </a>

                            <Link href={createPageUrl('Home')}>
                                <Button variant="outline" className="w-full h-14 rounded-2xl">
                                    العودة للرئيسية
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
