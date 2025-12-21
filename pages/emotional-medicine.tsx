import React, { useState } from 'react';
import { Heart, Search, BookOpen, User, Star, ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Common Emotional Roots Data (Louise Hay inspired)
const ailments = [
    { name: 'الصداع', root: 'انتقاد الذات، التقليل من شأن الذات', affirmation: 'أنا أحب وأقدر نفسي' },
    { name: 'الظهر (علوي)', root: 'نقص الدعم العاطفي، الشعور بعدم الحب', affirmation: 'أنا أحب نفسي والحياة تدعمني' },
    { name: 'الظهر (سفلي)', root: 'الخوف المالي، عدم الثقة في المستقبل', affirmation: 'أنا أثق في الحياة واحتياجاتي ملباة' },
    { name: 'السرطان', root: 'جرح عميق، استياء طويل الأمد، حمل الكراهية', affirmation: 'أنا أسامح وأحرر الماضي بحب' },
    { name: 'القلب', root: 'حرمان من الفرح، تصلب القلب، الإجهاد', affirmation: 'قلبي ينبض بإيقاع الحب والفرح' },
    { name: 'المعدة', root: 'الخوف من الجديد، عدم القدرة على هضم الأحداث', affirmation: 'أنا أهضم الحياة بسهولة ويسر' },
    { name: 'الركبة', root: 'عناد الأنا، عدم القدرة على الانحناء، الخوف', affirmation: 'أنا مرن وأتدفق مع الحياة' },
    { name: 'الغدة الدرقية', root: 'الذل، "متى سيأتي دوري؟"', affirmation: 'أنا أعبر عن نفسي بحرية وإبداع' },
    { name: 'زيادة الوزن', root: 'الحاجة للحماية، الهروب من المشاعر، عدم الأمان', affirmation: 'أنا آمن، وأنا محمي بالحب الإلهي' },
    { name: 'الأرق', root: 'الخوف، عدم الثقة في عملية الحياة، الذنب', affirmation: 'أنا أثق في الغد وأنام بسلام' }
];

export default function EmotionalMedicine() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const filteredAilments = ailments.filter(a =>
        a.name.includes(searchQuery) || a.root.includes(searchQuery)
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20" dir="rtl">
            {/* Header */}
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 px-6 pt-12 pb-24 relative overflow-hidden rounded-b-[3rem]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-10 translate-x-10" />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="text-white hover:bg-white/20 rounded-full"
                        >
                            <ArrowRight className="w-6 h-6" />
                        </Button>
                        <h1 className="text-2xl font-bold text-white">الطب الشعوري</h1>
                    </div>
                    <p className="text-pink-100 max-w-md leading-relaxed">
                        اكتشف الرسائل الخفية وراء أعراضك الجسدية. كل ألم هو رسالة حب من جسدك يطلب فيها التغيير.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="absolute -bottom-7 left-6 right-6">
                    <div className="relative bg-white rounded-2xl shadow-xl p-2 flex items-center">
                        <Search className="w-5 h-5 text-slate-400 mr-3" />
                        <Input
                            placeholder="ابحث عن العرض (مثال: الصداع، الظهر...)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-none shadow-none text-lg"
                        />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-6 mt-12 space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-pink-500" />
                        قاموس الأمراض والمشاعر
                    </h2>
                </div>

                <div className="space-y-4">
                    {filteredAilments.map((item, idx) => (
                        <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-pink-200 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg text-slate-800">{item.name}</h3>
                                <div className="bg-pink-50 text-pink-500 px-3 py-1 rounded-full text-xs font-bold">
                                    السبب الجذري
                                </div>
                            </div>
                            <p className="text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl border-r-4 border-pink-400">
                                {item.root}
                            </p>

                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl flex items-start gap-3">
                                <Star className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-green-700 font-bold block text-sm mb-1">التوكيد الشفائي:</span>
                                    <p className="text-green-800 font-medium italic">"{item.affirmation}"</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filteredAilments.length === 0 && (
                        <div className="text-center py-10 opacity-70">
                            <p>لا توجد نتائج بحث مطابقة</p>
                        </div>
                    )}
                </div>

                {/* CTA Card */}
                <div className="bg-slate-900 rounded-3xl p-6 text-white text-center mt-8">
                    <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4 animate-pulse" />
                    <h3 className="text-xl font-bold mb-2">هل تريد تعمق أكثر؟</h3>
                    <p className="text-slate-300 text-sm mb-6">
                        هذه معلومات استرشادية. الجلسة الخاصة تساعدك على فك شيفرة مشاعرك بدقة.
                    </p>
                    <Button className="w-full bg-pink-500 hover:bg-pink-600 text-white rounded-xl h-12 font-bold">
                        احجز استشارة خاصة
                    </Button>
                </div>
            </div>
        </div>
    );
}
