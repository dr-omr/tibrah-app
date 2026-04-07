import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { Shield, Sparkles, CheckCircle2, Clock, ChevronLeft, CreditCard, Activity, Microscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { PaymentEngine } from '@/lib/payment';
import SEO from '@/components/common/SEO';

const SERVICES = [
    {
        id: 'full_case_review',
        title: 'مراجعة الحالة الشاملة',
        price: '١٩٩',
        icon: Activity,
        color: 'from-indigo-600 to-indigo-800',
        accent: 'text-indigo-400',
        turnaround: '٤٨ ساعة',
        features: [
            'دراسة الأعراض الشاملة من قبل د. عمر',
            'تحليل الارتباط النفس-جسدي للأعراض',
            'خطة علاج رقمية مبدئية',
            'إجابة على ٣ أسئلة رئيسية'
        ],
        idealFor: 'الحالات المزمنة أو الأعراض غير المفسرة'
    },
    {
        id: 'lab_review',
        title: 'تحليل مخصص للمختبر والأشعة',
        price: '١٤٩',
        icon: Microscope,
        color: 'from-emerald-600 to-teal-700',
        accent: 'text-emerald-400',
        turnaround: '٢٤ ساعة',
        features: [
            'قراءة متخصصة للتحاليل المخبرية',
            'ربط النتائج بالأعراض الظاهرة',
            'توصيات المكملات الغذائية الدقيقة',
        ],
        idealFor: 'لمن لديه حزمة تحاليل حديثة ويريد خطة'
    }
];

export default function DigitalServices() {
    const router = useRouter();
    const { user } = useAuth();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const handlePurchase = async (serviceId: string, priceStr: string) => {
        if (!user) {
            router.push('/login?redirect=/digital-services');
            return;
        }

        setProcessingId(serviceId);
        const amount = parseInt(priceStr.replace(/[^0-9]/g, ''), 10) || 100; // rough convert

        const res = await PaymentEngine.processDigitalService({
            userId: user.id,
            productId: serviceId,
            amount
        });

        if (res.success) {
            alert('تم تسجيل طلبك بنجاح. سيتم تحويلك لتحميل الإيصال ومتابعة الملف.');
            router.push('/my-care');
        } else {
            alert('فشل معالجة الطلب، حاول مرة أخرى.');
        }
        setProcessingId(null);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <SEO title="الخدمات الرقمية | طِبرَا" />
            
            {/* Header */}
            <div className="bg-white px-5 pt-10 pb-6 shadow-sm border-b border-slate-100 flex items-center justify-between sticky top-0 z-30">
                <div>
                    <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-indigo-600" />
                        بوابة الرعاية الرقمية
                    </h1>
                    <p className="text-xs text-slate-500 font-medium mt-1">خدمات طبية موثوقة من أي مكان</p>
                </div>
            </div>

            <div className="px-5 pt-8">
                <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-4 mb-8 flex gap-3 text-amber-800">
                    <Sparkles className="w-5 h-5 shrink-0" />
                    <p className="text-xs leading-relaxed font-semibold">
                        جميع الخدمات الرقمية تتم معالجتها وحفظها مباشرة في "رعايتي" لضمان تكامل خطتك العلاجية في منصة واحدة.
                    </p>
                </div>

                <div className="space-y-6">
                    {SERVICES.map((service, idx) => {
                        const Icon = service.icon;
                        const isProcessing = processingId === service.id;

                        return (
                            <motion.div 
                                key={service.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100"
                            >
                                <div className={`p-6 bg-gradient-to-br ${service.color} text-white relative`}>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
                                    
                                    <div className="flex justify-between items-start relative z-10">
                                        <div>
                                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <h2 className="text-xl font-black mb-1">{service.title}</h2>
                                            <p className={`text-sm font-medium ${service.accent}`}>{service.idealFor}</p>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs text-white/70 font-semibold mb-1">الاستثمار</p>
                                            <p className="text-2xl font-black">{service.price}<span className="text-sm font-bold mr-1 text-white/80">ر.س</span></p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        ماذا تشمل الخدمة؟
                                    </h3>
                                    <ul className="space-y-3 mb-6">
                                        {service.features.map((feat, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600 font-medium">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                                                {feat}
                                            </li>
                                        ))}
                                    </ul>
                                    
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 bg-slate-50 p-3 rounded-xl mb-6">
                                        <Clock className="w-4 h-4" />
                                        مدة التنفيذ: {service.turnaround}
                                    </div>

                                    <Button 
                                        className={`w-full h-14 rounded-2xl font-bold text-lg shadow-lg ${isProcessing ? 'opacity-70' : ''}`}
                                        style={{ backgroundColor: isProcessing ? '#9ca3af' : '#4f46e5' }}
                                        onClick={() => handlePurchase(service.id, service.price)}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? 'جاري التحويل...' : 'طلب الخدمة الآن'}
                                        {!isProcessing && <CreditCard className="w-5 h-5 ml-2" />}
                                    </Button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
