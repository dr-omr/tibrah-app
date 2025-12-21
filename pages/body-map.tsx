import React, { useState } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { createPageUrl } from '../utils';
import {
    ArrowRight, Search, Heart, Brain, Activity, Sparkles, ShoppingBag, Star, MessageCircle
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import InteractiveBody from '@/components/body-map/InteractiveBody';
import { useQuery } from '@tanstack/react-query';

const holisticSections = [
    { name: 'الطب الشعوري', description: 'افهم رسائل جسمك', page: 'emotional-medicine', icon: Heart, color: 'from-pink-500 to-rose-500' },
    { name: 'تحليل الأعراض', description: 'شخص حالتك', page: 'symptom-analysis', icon: Activity, color: 'from-blue-500 to-cyan-500' }
];

// Emotional Map Data (Based on Dr. Ahmed Eldemellawy & META-Health Principles)
const emotionalMap: Record<string, any> = {
    head: {
        name: 'الرأس',
        categoryName: 'مركز القيادة',
        categoryColor: '#FF6B6B',
        categoryIcon: '🧠',
        emotion: 'التوتر والضغط المستمر',
        description: 'كثرة التفكير (Overthinking) والشعور بمسؤولية مفرطة.',
        deeperCause: 'الرغبة في السيطرة على كل التفاصيل والخوف من الخطأ.',
        treatment: ['التفريغ الكتابي', 'التأمل لدقيقة', 'تقبل عدم الكمال'],
        affirmation: 'أنا أثق في سير الحياة، وأسمح لعقلي بالراحة.'
    },
    throat: {
        name: 'الحلق/الرقبة',
        categoryName: 'بوابة التعبير',
        categoryColor: '#4ECDC4',
        categoryIcon: '🗣️',
        emotion: 'كبت الكلام والحقيقة',
        description: 'الشعور بالعجز عن التعبير عن النفس أو "ابتلاع" الغضب.',
        deeperCause: 'الخوف من الرفض إذا عبرت عن حقيقتك.',
        treatment: ['الغناء أو الدندنة', 'التحدث بصدق مع النفس', 'شرب الماء بكثرة'],
        affirmation: 'صوتي مسموع، وأعبر عن نفسي بوضوح وحب.'
    },
    shoulders_back: {
        name: 'أكتاف (خلفي)',
        categoryName: 'حمل الأعباء',
        categoryColor: '#FFD93D',
        categoryIcon: '🎒',
        emotion: 'أعباء الحياة الثقيلة',
        description: 'الشعور بأنك تحمل مشاكل العائلة أو العمل وحدك.',
        deeperCause: 'اعتقادك أن "لا أحد يستطيع فعل ذلك غيري".',
        treatment: ['تفويض المسؤوليات', 'مساج الأكتاف', 'تعلم طلب المساعدة'],
        affirmation: 'أنا أسمح للآخرين بتحمل مسؤولياتهم، وأتحرر من الثقل.'
    },
    joints: {
        name: 'المفاصل',
        categoryName: 'المرونة في الحياة',
        categoryColor: '#FF8B94',
        categoryIcon: '🔗',
        emotion: 'مقاومة التغيير',
        description: 'صعوبة في التأقلم مع مراحل جديدة في الحياة.',
        deeperCause: 'التمسك بالماضي أو الخوف من المجهول القادم.',
        treatment: ['تمارين التمدد (Stretching)', 'الرقص الحر', 'ممارسة الامتنان'],
        affirmation: 'أنا أتدفق مع تغييرات الحياة بيسر وسهولة.'
    },
    liver: {
        name: 'الكبد',
        categoryName: 'مصنع المشاعر',
        categoryColor: '#D4AF37',
        categoryIcon: '🧪',
        emotion: 'الغضب المكبوت',
        description: 'تراكم مشاعر الغضب والاستياء وعدم الرضا.',
        deeperCause: 'الشعور بالظلم أو الانتقاد الدائم للذات والآخرين.',
        treatment: ['التخلص من السموم (ديتوكس)', 'التعبير الصحي عن الغضب', 'المسامحة'],
        affirmation: 'أنا أحرر كل الغضب القديم، وأملأ كياني بالسلام والرضا.'
    },
    kidneys: {
        name: 'الكلى',
        categoryName: 'العلاقات والمخاوف',
        categoryColor: '#6C5CE7',
        categoryIcon: '💧',
        emotion: 'الخوف وخيبة الأمل',
        description: 'مخاوف عميقة، غالباً مرتبطة بالعلاقات أو النقد.',
        deeperCause: 'الشعور بالطفولة (الخوف كالطفل) وعدم الأمان.',
        treatment: ['شرب الماء بوعي', 'مواجهة المخاوف', 'تعزيز الثقة بالنفس'],
        affirmation: 'أنا آمن، والحكمة الإلهية ترعاني في كل لحظة.'
    },
    spine: {
        name: 'العمود الفقري',
        categoryName: 'عمود الدعم',
        categoryColor: '#2D9B83',
        categoryIcon: '🦴',
        emotion: 'الدعم والسند',
        description: 'الشعور بعدم وجود دعم كافٍ في الحياة.',
        deeperCause: 'الاعتماد الكلي على الذات ورفض الدعم الخارجي.',
        treatment: ['اليوجا (وضعية الشجرة)', 'الثقة في دعم الحياة', 'بناء شبكة دعم'],
        affirmation: 'أنا مدعوم دائماً من الله ومن الكون ومن حولي.'
    },
    chest: {
        name: 'الصدر',
        categoryName: 'بيت القلب',
        categoryColor: '#FF6B6B',
        categoryIcon: '❤️',
        emotion: 'الحزن والجرح القديم',
        description: 'كبت المشاعر، أو الشعور بعدم استحقاق الحب.',
        deeperCause: 'إغلاق القلب لحماية النفس من الألم.',
        treatment: ['التنفس العميق', 'العطاء والصدقة', 'احتضان من تحب'],
        affirmation: 'قلبي مفتوح لاستقبال الحب، وأنا أستحق السعادة.'
    },
    stomach: {
        name: 'المعدة',
        categoryName: 'هضم الأحداث',
        categoryColor: '#FFD93D',
        categoryIcon: '🥣',
        emotion: 'القلق من الجديد',
        description: 'عدم القدرة على "هضم" موقف جديد أو شخص معين.',
        deeperCause: 'الخوف من المستقبل والتمسك بالمألوف.',
        treatment: ['شرب النعناع أو البابونج', 'تقبل التغيير', 'التنفس البطني'],
        affirmation: 'أنا أهضم تجارب الحياة بسهولة، وكل جديد هو خير لي.'
    },
    legs: {
        name: 'الأرجل',
        categoryName: 'المضي قدماً',
        categoryColor: '#2D9B83',
        categoryIcon: '🦶',
        emotion: 'الخوف من المستقبل',
        description: 'التردد في اتخاذ خطوات جديدة أو المضي قدماً.',
        deeperCause: 'الخوف من الفشل أو الخوف من ترك منطقة الراحة.',
        treatment: ['المشي في الطبيعة', 'تحديد أهداف صغيرة', 'التجذر (Grounding)'],
        affirmation: 'أتقدم للأمام بثقة، لأنني أعلم أن طريقي آمن.'
    },
    lower_back: {
        name: 'أسفل الظهر',
        categoryName: 'الدعم المادي',
        categoryColor: '#A8E6CF',
        categoryIcon: '💰',
        emotion: 'الخوف المالي',
        description: 'قلق بشأن المال، العمل، أو المستقبل المادي.',
        deeperCause: 'الشعور بعدم الأمان المادي أو فقدان الدعم.',
        treatment: ['التخطيط المالي', 'التوكيدات للوفرة', 'الإيمان بالرزق'],
        affirmation: 'أثق أن رزقي مضمون، والكون يدعمني بوفرة.'
    },
    default: {
        name: 'الجسم',
        categoryName: 'رسالة جسدية',
        categoryColor: '#94A3B8',
        categoryIcon: '🧘',
        emotion: 'تنبيه للتوازن',
        description: 'جسدك يناديك لتعود لحالة التوازن (Homeostasis).',
        deeperCause: 'انفصال مؤقت بين العقل إشارات الجسد.',
        treatment: ['جلسة سكون', 'شرب الماء', 'النوم المبكر'],
        affirmation: 'أنا أعود الآن إلى توازني الطبيعي وصحتي المثالية.'
    }
};

export default function BodyMap() {
    const [selectedArea, setSelectedArea] = useState<any>(null);

    // Fetch products to suggest (cached)
    const { data: allProducts } = useQuery({
        queryKey: ['products'],
        queryFn: () => db.entities.Product.list(),
        initialData: []
    });

    const getSuggestedProducts = (areaName: string) => {
        return allProducts?.slice(0, 3) || [];
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-24">
            <div className="bg-white p-6 rounded-b-3xl shadow-sm mb-6">
                <h1 className="text-2xl font-bold text-slate-800 mb-2">خريطة الجسم 🧘‍♂️</h1>
                <p className="text-slate-500">اضغط على أي منطقة في الجسم لفهم رسالتها الشعورية</p>
            </div>

            <InteractiveBody
                onSelectPart={(id: string) => {
                    const data = emotionalMap[id] || { ...emotionalMap.default, name: id };
                    setSelectedArea(data);
                }}
                className="mb-8"
            />

            <div className="px-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">أقسام الصحة الشمولية</h2>
                <div className="grid grid-cols-2 gap-3">
                    {holisticSections.map((section, idx) => {
                        const Icon = section.icon;
                        return (
                            <Link
                                key={idx}
                                href={createPageUrl(section.page)}
                                className="glass rounded-2xl p-4 hover:shadow-lg transition-all"
                            >
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center mb-3`}>
                                    <Icon className="w-5 h-5 text-white" />
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm mb-1">{section.name}</h4>
                                <p className="text-xs text-slate-500">{section.description}</p>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* CTA */}
            <div className="mt-8 mx-6 bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] rounded-3xl p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-2">هل تحتاج مساعدة متخصصة؟</h3>
                <p className="text-white/80 text-sm mb-4">
                    احجز جلسة تشخيصية مع د. عمر العماد لفهم أعمق لحالتك
                </p>
                <a
                    href="https://wa.me/967771447111?text=مرحباً%20د.%20عمر،%20أريد%20جلسة%20تشخيصية%20للطب%20الشعوري"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button className="bg-white text-[#2D9B83] hover:bg-white/90 rounded-xl px-6 h-12 font-bold">
                        <MessageCircle className="w-5 h-5 ml-2" />
                        احجز جلستك الآن
                    </Button>
                </a>
            </div>

            {/* Area Detail Sheet */}
            <Sheet open={!!selectedArea} onOpenChange={() => setSelectedArea(null)}>
                <SheetContent side="bottom" className="rounded-t-3xl max-h-[85vh] overflow-y-auto">
                    {selectedArea && (
                        <>
                            <SheetHeader className="pb-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                                        style={{ backgroundColor: `${selectedArea.categoryColor}15` }}
                                    >
                                        {selectedArea.categoryIcon}
                                    </div>
                                    <div className="text-right">
                                        <SheetTitle className="text-xl">{selectedArea.name}</SheetTitle>
                                        <p className="text-sm text-slate-500">{selectedArea.categoryName}</p>
                                    </div>
                                </div>
                            </SheetHeader>

                            <div className="space-y-6 pb-8">
                                {/* Emotion */}
                                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4">
                                    <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                                        <Heart className="w-5 h-5 text-red-500" />
                                        السبب الشعوري
                                    </h4>
                                    <p className="text-lg font-semibold text-red-600 mb-2">{selectedArea.emotion}</p>
                                    <p className="text-slate-600 text-sm">{selectedArea.description}</p>
                                </div>

                                {/* Deeper Cause */}
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-2">السبب العميق</h4>
                                    <p className="text-slate-600 leading-relaxed">{selectedArea.deeperCause}</p>
                                </div>

                                {/* Treatment Steps */}
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <Sparkles className="w-5 h-5 text-[#2D9B83]" />
                                        خطوات العلاج الشعوري
                                    </h4>
                                    <div className="space-y-2">
                                        {selectedArea.treatment.map((step: string, idx: number) => (
                                            <div key={idx} className="flex items-start gap-3 bg-slate-50 rounded-xl p-3">
                                                <div className="w-6 h-6 rounded-full bg-[#2D9B83] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                                    {idx + 1}
                                                </div>
                                                <p className="text-slate-700 text-sm">{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Affirmation */}
                                <div className="bg-gradient-to-br from-[#2D9B83]/10 to-[#3FB39A]/10 rounded-2xl p-5">
                                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                                        <Star className="w-5 h-5 text-[#D4AF37]" />
                                        التأكيد الشفائي
                                    </h4>
                                    <p className="text-[#2D9B83] text-lg font-medium leading-relaxed italic">
                                        "{selectedArea.affirmation}"
                                    </p>
                                    <p className="text-sm text-slate-500 mt-3">
                                        ردد هذا التأكيد 3 مرات يومياً أمام المرآة بإيمان وثقة
                                    </p>
                                </div>

                                {/* CTA */}
                                <a
                                    href="https://wa.me/967771447111?text=مرحباً%20د.%20عمر،%20أريد%20استشارة%20بخصوص%20الخريطة%20الجسمية"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block mt-6"
                                >
                                    <Button className="w-full gradient-primary text-white rounded-xl h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all">
                                        <MessageCircle className="w-5 h-5 ml-2" />
                                        استشارة د. عمر العماد
                                    </Button>
                                </a>

                                {/* Suggested Products */}
                                {getSuggestedProducts(selectedArea.name).length > 0 && (
                                    <div className="mt-8 pt-6 border-t border-slate-100">
                                        <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                            <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                                            منتجات مساعدة مقترحة
                                        </h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            {getSuggestedProducts(selectedArea.name).map((prod: any) => (
                                                <Link key={prod.id} href={`/product/${prod.id}`}>
                                                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl hover:bg-slate-100 transition-colors">
                                                        <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border border-slate-200">
                                                            <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                                                        </div>
                                                        <div>
                                                            <h5 className="font-bold text-slate-800 text-sm">{prod.name}</h5>
                                                            <p className="text-[#2D9B83] text-sm font-bold">{prod.price} ر.س</p>
                                                        </div>
                                                        <Button size="sm" variant="outline" className="mr-auto">عرض</Button>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
