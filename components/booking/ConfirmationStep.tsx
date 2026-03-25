// components/booking/ConfirmationStep.tsx
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Check, MessageCircle, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

interface ConfirmationStepProps {
    formData: any;
    sessionTypes: any[];
}

export default function ConfirmationStep({ formData, sessionTypes }: ConfirmationStepProps) {
    const selectedSession = sessionTypes.find(s => s.id === formData.session_type);

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
        >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center animate-breathe" style={{ background: 'linear-gradient(135deg, #0d9488, #10b981)', boxShadow: '0 8px 32px rgba(13,148,136,0.3)' }}>
                <Check className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-[24px] font-black text-slate-800 mb-2">تم الحجز بنجاح! 🎉</h2>
            <p className="text-[13px] text-slate-500 mb-6 font-semibold">
                سنتواصل معك قريباً لتأكيد الموعد عبر واتساب
            </p>

            <div className="rounded-2xl p-5 mb-6 text-right" style={{ background: '#f0fdfa', border: '1px solid rgba(13,148,136,0.15)' }}>
                <div className="space-y-3">
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
                    href={`https://wa.me/967771447111?text=مرحباً، لقد حجزت ${selectedSession?.label} بتاريخ ${formData.date ? format(formData.date, 'dd/MM/yyyy') : ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                >
                    <Button className="w-full h-14 bg-green-500 hover:bg-green-600 rounded-2xl text-lg font-bold shadow-md shadow-green-500/20">
                        <MessageCircle className="w-5 h-5 ml-2" />
                        تأكيد عبر واتساب
                    </Button>
                </a>

                <a
                    href={`https://wa.me/967771447111?text=${encodeURIComponent(`📋 نسخة من بيانات الحجز

👤 الاسم: ${formData.patient_name}
📱 الجوال: ${formData.patient_phone}
📧 البريد: ${formData.patient_email || 'غير محدد'}

📌 نوع الجلسة: ${selectedSession?.label}
📅 التاريخ: ${formData.date ? format(formData.date, 'dd MMMM yyyy', { locale: ar }) : ''}
⏰ الوقت: ${formData.time_slot}
💰 المبلغ: ${selectedSession?.price} ر.س

💬 الشكوى الجسدية:
${formData.health_concern || 'لم تحدد'}

🧠 البعد الشعوري والسياق النفس-جسدي:
${formData.emotional_context || 'لم يحدد'}

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

                {/* Google Calendar Link */}
                {formData.date && (
                    <a
                        href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`${selectedSession?.label} - طِبرَا`)}&dates=${format(formData.date, 'yyyyMMdd')}T${formData.time_slot.replace(/[^0-9:]/g, '').replace(':', '')}00/${format(formData.date, 'yyyyMMdd')}T${formData.time_slot.replace(/[^0-9:]/g, '').replace(':', '')}00&details=${encodeURIComponent(`جلسة ${selectedSession?.label} مع د. عمر العماد`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                    >
                        <Button variant="outline" className="w-full h-14 rounded-2xl text-lg font-bold border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950">
                            <CalendarIcon className="w-5 h-5 ml-2" />
                            أضف لتقويم Google
                        </Button>
                    </a>
                )}

                <Link href={createPageUrl('Home')} className="block pt-2">
                    <Button variant="ghost" className="w-full h-14 rounded-2xl text-slate-500 hover:bg-slate-100">
                        العودة للرئيسية
                    </Button>
                </Link>
            </div>
        </motion.div>
    );
}
