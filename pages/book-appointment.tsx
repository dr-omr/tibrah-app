// pages/book-appointment.tsx
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { db } from '@/lib/db';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/components/notification-engine';


import { useAuth } from '@/contexts/AuthContext';
import { createPageUrl } from '@/utils';
import ProtectedRoute from '@/components/common/ProtectedRoute';
import SEO from '@/components/common/SEO';

// Booking Flow Steps
import ServiceSelectionStep from '@/components/booking/ServiceSelectionStep';
import DateTimeSelectionStep from '@/components/booking/DateTimeSelectionStep';
import PatientInfoStep from '@/components/booking/PatientInfoStep';
import ConfirmationStep from '@/components/booking/ConfirmationStep';

// خدمات العيادة
const sessionTypes = [
    {
        id: 'consultation',
        label: 'استشارة طب وظيفي',
        description: 'جلسة شاملة لتحليل التاريخ المرضي وجذور الأعراض',
        duration: '45 دقيقة',
        price: 350
    },
    {
        id: 'therapy',
        label: 'جلسة علاج بالترددات',
        description: 'جلسة علاجية باستخدام تقنيات الرنين الحيوي',
        duration: '30 دقيقة',
        price: 200
    },
    {
        id: 'followup',
        label: 'متابعة دورية',
        description: 'متابعة تطور الحالة وتعديل الخطة العلاجية',
        duration: '20 دقيقة',
        price: 150
    }
];

const timeSlots = [
    '10:00 ص', '10:30 ص', '11:00 ص', '11:30 ص',
    '04:00 م', '04:30 م', '05:00 م', '05:30 م',
    '06:00 م', '06:30 م', '07:00 م', '07:30 م'
];

export default function BookAppointment() {
    const router = useRouter();
    const { user } = useAuth();
    
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        session_type: '',
        date: null,
        time_slot: '',
        patient_name: '',
        patient_phone: '',
        patient_email: '',
        health_concern: '',
        emotional_context: '',
    });

    // Prefill from query params (BodyMap or Triage)
    useEffect(() => {
        if (router.isReady && !formData.health_concern) {
            let concern = '';
            if (router.query.symptom || router.query.emotion) {
                concern = 'الأعراض المحولة من التقييم:\n';
                if (router.query.symptom) concern += `- المنطقة/العرض: ${router.query.symptom}\n`;
                if (router.query.emotion) setFormData(prev => ({ ...prev, emotional_context: router.query.emotion as string }));
            } 
            else if (router.query.complaint || router.query.triage) {
                concern = 'التقييم السريري الذكي:\n';
                if (router.query.complaint) concern += `- الشكوى الرئيسية: ${router.query.complaint}\n`;
                if (router.query.triage) concern += `- تصنيف الخطورة: ${router.query.triage === 'urgent' ? 'عاجل (تتطلب استشارة)' : 'عادي'}\n`;
                if (router.query.emotion) setFormData(prev => ({ ...prev, emotional_context: router.query.emotion as string }));
            }
            if (concern) {
                setFormData(prev => ({ ...prev, health_concern: concern }));
            }
        }
    }, [router.isReady, router.query, formData.health_concern]);

    // Auto-fill from Auth
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                patient_name: user.displayName || user.name || prev.patient_name,
                patient_email: user.email || prev.patient_email,
                patient_phone: user.phone || prev.patient_phone
            }));
        }
    }, [user]);

    // Mutation
    const createAppointmentMutation = useMutation({
        mutationFn: async (data: any) => {
            const emotionalDiagnosticObj = {
                body_region: router.query.symptom ? String(router.query.symptom) : "general",
                physical_complaint: data.health_concern || "غير محدد",
                emotional_diagnostic_pattern: router.query.emotion ? String(router.query.emotion) : "إدخال مباشر",
                psychosomatic_dimension: data.emotional_context || "",
                stress_context: "",
                behavioral_contributors: [],
                repeated_pattern_flag: false,
                clinician_summary: data.emotional_context,
                patient_summary: ""
            };

            const payload = {
                ...data,
                date: format(data.date, 'yyyy-MM-dd'),
                status: 'pending',
                emotional_diagnostic: (data.emotional_context || router.query.emotion) ? emotionalDiagnosticObj : null
            };

            // 1. Save to Firestore Local DB
            const appointmentDbResult = await db.entities.Appointment.createForUser(user?.id || '', payload);

            // 2. Fire the Webhook silently to Zapier/Make or Clinic automation
            try {
                await fetch('/api/webhooks/booking', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, transactionId: appointmentDbResult })
                });
            } catch (e) {
                console.error('Webhook trigger failed:', e);
            }

            return appointmentDbResult;
        },
        onSuccess: () => {
            toast.success('تم حجز الموعد بنجاح 👏');
            toast.booking('تم حجز موعدك بنجاح! 🎉', {
                body: `موعدك يوم ${formData.date ? format(formData.date, 'dd MMMM', { locale: ar }) : ''} الساعة ${formData.time_slot}`,
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

    return (
        <ProtectedRoute requireAuth={true}>
            <div className="min-h-screen pb-10 bg-[#FAFAFA] dark:bg-[#020617] relative">
                <SEO title="حجز موعد — طِبرَا" description="حجز جلسة استشارة تشخيصية أو جلسة ترددات مع دكتور عمر العماد" />
                
                {/* Visual Premium Header Blob */}
                <div className="absolute top-0 left-0 w-full h-[200px] bg-gradient-to-b from-teal-500/10 dark:from-indigo-600/20 to-transparent pointer-events-none" />

                {/* Header */}
                <div className="sticky top-0 z-20 px-5 py-4 liquid-nav">
                    <div className="flex items-center gap-3">
                        <Link href={createPageUrl('Home')}>
                            <button className="w-10 h-10 rounded-2xl flex items-center justify-center bg-teal-50 dark:bg-white/5 active:scale-95 transition-transform">
                                <ArrowRight className="w-5 h-5 text-teal-700 dark:text-teal-400" />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-[18px] font-black text-slate-800 dark:text-white">حجز موعد</h1>
                            <p className="text-[12px] text-slate-500 dark:text-slate-400 font-semibold tracking-wide">مع د. عمر العماد</p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    {step < 4 && (
                        <div className="flex items-center gap-1.5 mt-3.5">
                            {['اختر الخدمة', 'الموعد', 'البيانات'].map((label, i) => (
                                <div key={i} className="flex-1">
                                    <div className="h-[3px] rounded-full transition-all duration-500" style={{ background: i + 1 <= step ? 'linear-gradient(90deg, #0d9488, #10b981)' : '#e2e8f0' }} />
                                    <p className={`text-[9px] font-bold mt-1 text-center ${i + 1 <= step ? 'text-emerald-600' : 'text-slate-300'}`}>{label}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="px-5 py-5 overflow-hidden">
                    {/* Render Form Steps */}
                    {step === 1 && (
                        <ServiceSelectionStep 
                            sessionTypes={sessionTypes} 
                            formData={formData} 
                            setFormData={setFormData} 
                            onNext={() => setStep(2)} 
                        />
                    )}
                    
                    {step === 2 && (
                        <DateTimeSelectionStep 
                            timeSlots={timeSlots} 
                            formData={formData} 
                            setFormData={setFormData} 
                            onBack={() => setStep(1)} 
                            onNext={() => setStep(3)} 
                        />
                    )}

                    {step === 3 && (
                        <PatientInfoStep 
                            sessionTypes={sessionTypes} 
                            formData={formData} 
                            setFormData={setFormData} 
                            onBack={() => setStep(2)} 
                            onSubmit={handleSubmit} 
                            isSubmitting={createAppointmentMutation.isPending} 
                        />
                    )}

                    {step === 4 && (
                        <ConfirmationStep 
                            sessionTypes={sessionTypes} 
                            formData={formData} 
                        />
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
