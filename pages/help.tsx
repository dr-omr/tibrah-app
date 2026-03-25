import React, { useState, useRef } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Search, ChevronDown, ChevronUp,
    MessageCircle, Phone, Calendar,
    CreditCard, Shield, Heart, Sparkles, Brain, Loader2, Send
} from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { db } from '@/lib/db';

const faqCategories = [
    { id: 'all', label: 'الكل', icon: Sparkles },
    { id: 'appointments', label: 'المواعيد', icon: Calendar },
    { id: 'payments', label: 'الدفع', icon: CreditCard },
    { id: 'health', label: 'الصحة', icon: Heart },
    { id: 'account', label: 'الحساب', icon: Shield },
];

const faqData = [
    { question: 'ما هو طِبرَا وكيف يختلف عن العيادات التقليدية؟', answer: 'طِبرَا هي منصة رعاية شمولية تعتمد على الطب الوظيفي. نحن لا نعالج الأعراض، بل نبحث عن الجذر الأساسي للمشكلة (نفسي، جسدي، أو هرموني) ونبني خطة تعافي متكاملة.', category: 'general' },
    { question: 'هل الجلسات تتم عن بُعد؟', answer: 'نعم، 100% من خدماتنا واستشاراتنا تتم عبر مكالمات فيديو آمنة، لنوفر لك أعلى مستويات الراحة والخصوصية من أي مكان بالعالم.', category: 'general' },
    { question: 'كيف تعمل ميزة الكونسيرج الذكي؟', answer: 'الكونسيرج الذكي هو مرافقك الطبي المدعوم بالذكاء الاصطناعي، يراقب تقدمك، يجيب على استفساراتك اليومية، ويرسل تنبيهات للدكتور عمر عند ملاحظة أي تراجع في مؤشراتك الحيوية.', category: 'health' },
    { question: 'هل يمكنني حجز موعد لنفس اليوم؟', answer: 'إذا كنت مشتركاً في (طِبرَا بلس) تتاح لك أولوية الحجز في نفس اليوم للحالات العاجلة. للمستخدمين العاديين، يعتمد الأمر على توفر مقاعد في الجدول.', category: 'appointments' },
    { question: 'كم تستغرق الجلسة التشخيصية الأولى؟', answer: 'تستغرق الجلسة التشخيصية الأولى من 45 إلى 60 دقيقة. هدفها الغوص في تاريخك الطبي والنفسي بالكامل لرسم خارطة واضحة لرحلة التشافي.', category: 'appointments' },
    { question: 'هل هناك سياسة استرداد؟', answer: 'نعم، تتيح لك سياسة طِبرَا استرداد كامل المبلغ في حال إلغاء الموعد قبل 24 ساعة من وقته المحدد.', category: 'payments' },
    { question: 'كيف يتم توصيل المكملات من الصيدلية الذكية؟', answer: 'يتم شحن المكملات فور اعتمادها من الدكتور، وتصلك إلى باب منزلك مجاناً إذا كنت من مشتركي الرعاية الشمولية (VIP).', category: 'payments' },
];

export default function Help() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);
    
    // AI Concierge State
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isAiTyping, setIsAiTyping] = useState(false);
    const aiChatRef = useRef<HTMLDivElement>(null);

    const toggleQuestion = (index: number) => {
        haptic.selection();
        setExpandedQuestions(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
    };

    const handleAiSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiQuery.trim() || isAiTyping) return;
        
        haptic.selection();
        uiSounds.select();
        setIsAiTyping(true);
        setAiResponse('');
        
        if (aiChatRef.current) {
            aiChatRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        try {
            const result = await db.integrations.Core.InvokeLLM({
                prompt: `أنت موظف دعم فني ومساعد طبي ذكي في منصة (طِبرَا) للطب الوظيفي برئاسة الدكتور عمر. يسأل المريض: "${aiQuery}". 
                أجب باختصار شديد، بلطف، ووضوح. إذا كان السؤال يحتاج لتدخل الدكتور، انصحه بحجز جلسة أو التواصل عبر واتساب.`
            }) as any;
            
            setAiResponse(result?.response || result?.answer || "عذراً، لا أستطيع الإجابة حالياً. تفضل بالتواصل معنا عبر واتساب.");
            haptic.success();
            uiSounds.success();
        } catch {
            setAiResponse("استجابة الكونسيرج غير متاحة الآن. يرجى محاولة التواصل معنا عبر واتساب أسفل الشاشة.");
            haptic.error();
        } finally {
            setIsAiTyping(false);
        }
    };

    const filteredFAQ = faqData.filter(item => {
        const matchesSearch = searchQuery === '' || item.question.includes(searchQuery) || item.answer.includes(searchQuery);
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#020617] text-slate-800 dark:text-white selection:bg-indigo-500/30 font-sans pb-32">
            <Head>
                <title>طِبرَا | مركز الدعم والكونسيرج</title>
            </Head>

            {/* ═══ Header ═══ */}
            <div className="relative pt-12 pb-24 px-6 overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white dark:from-[#050B1A] dark:via-[#020617] to-transparent">
                {/* Decorative blurs */}
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(99,102,241,0.08)_0%,_transparent_60%)] dark:bg-[radial-gradient(circle,_rgba(99,102,241,0.15)_0%,_transparent_60%)] blur-[80px] pointer-events-none" />
                <div className="absolute top-[20%] left-[-20%] w-[500px] h-[500px] bg-[radial-gradient(circle,_rgba(20,184,166,0.05)_0%,_transparent_60%)] dark:bg-[radial-gradient(circle,_rgba(20,184,166,0.1)_0%,_transparent_60%)] blur-[80px] pointer-events-none" />

                <Link href="/profile" className="absolute top-6 right-6 z-10" onClick={() => haptic.selection()}>
                    <div className="w-12 h-12 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/80 dark:border-slate-700 flex items-center justify-center hover:bg-white dark:hover:bg-slate-800 transition-colors shadow-sm">
                        <ArrowRight className="w-6 h-6 text-slate-600 dark:text-slate-400 rtl:-scale-x-100" />
                    </div>
                </Link>

                <div className="relative z-10 text-center max-w-xl mx-auto mt-12">
                    <motion.div 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}
                        className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40 border border-indigo-200/60 dark:border-indigo-500/20 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-indigo-500/10"
                    >
                        <Brain className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                    </motion.div>
                    
                    <h1 className="text-4xl sm:text-5xl font-black mb-4 text-slate-900 dark:text-white tracking-tighter">الدعم والكونسيرج</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed mb-10 max-w-sm mx-auto">
                        نحن هنا للإجابة على استفساراتك الطبية والتقنية. اسأل المساعد الذكي أو تواصل مباشرة.
                    </p>

                    {/* AI Chat Input - Ultra Premium */}
                    <div className="relative group max-w-lg mx-auto" ref={aiChatRef}>
                        <div className="absolute inset-0 bg-indigo-500/20 rounded-[28px] blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                        <form onSubmit={handleAiSubmit} className="relative bg-white/90 dark:bg-[#0B1121]/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-colors rounded-[28px] flex items-center p-3 shadow-[0_20px_40px_rgb(0,0,0,0.06)] dark:shadow-[0_20px_40px_rgb(0,0,0,0.3)]">
                            <div className="px-3 shrink-0">
                                <Sparkles className="w-6 h-6 text-indigo-400 dark:text-indigo-500 animate-pulse" />
                            </div>
                            <input
                                value={aiQuery}
                                onChange={(e) => setAiQuery(e.target.value)}
                                placeholder="اسأل الكونسيرج الذكي أي سؤال..."
                                className="flex-1 bg-transparent border-0 text-slate-900 dark:text-white placeholder-slate-400 px-2 focus:ring-0 text-base font-medium"
                            />
                            <button 
                                type="submit" 
                                disabled={isAiTyping || !aiQuery.trim()}
                                className="w-14 h-14 rounded-[20px] bg-indigo-600 flex items-center justify-center hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_20px_rgba(79,70,229,0.3)] active:scale-95 shrink-0"
                            >
                                {isAiTyping ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Send className="w-6 h-6 text-white rtl:-translate-x-0.5 rtl:rotate-180" />}
                            </button>
                        </form>
                    </div>

                    {/* AI Output */}
                    <AnimatePresence>
                        {aiResponse && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className="mt-6 p-6 md:p-8 rounded-[32px] bg-white/80 dark:bg-[#0B1121]/80 backdrop-blur-2xl border border-indigo-100 dark:border-indigo-900/50 text-right shadow-[0_20px_60px_rgba(79,70,229,0.1)] dark:shadow-[0_20px_60px_rgba(79,70,229,0.2)] max-w-lg mx-auto relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none" />
                                
                                <div className="flex gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded-[20px] bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40 border border-indigo-200/60 dark:border-indigo-500/30 flex items-center justify-center shrink-0 shadow-inner">
                                        <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-1">
                                        <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 mb-2 uppercase tracking-wide">الكونسيرج الذكي يقول:</p>
                                        <p className="text-base text-slate-800 dark:text-slate-200 leading-relaxed font-bold break-words w-full" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                                            {aiResponse}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="px-5 -mt-8 relative z-10 max-w-4xl mx-auto space-y-12">
                
                {/* ═══ Contact Cards (Ultra Premium) ═══ */}
                <div>
                    <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-4 px-2">التواصل السريع</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a
                            href="https://wa.me/967771447111?text=مرحباً%20طِبرَا،"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => haptic.success()}
                            className="bg-white/90 dark:bg-[#0B1121]/90 backdrop-blur-xl border border-emerald-200/60 dark:border-emerald-900/30 rounded-[32px] p-6 hover:shadow-[0_20px_60px_rgba(16,185,129,0.15)] transition-all group relative overflow-hidden flex items-center gap-5"
                        >
                            <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/40 dark:to-emerald-800/40 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-500/30 group-hover:scale-110 transition-transform shadow-inner">
                                <MessageCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg text-slate-900 dark:text-white mb-1">واتساب المنسق الطبي</h3>
                                <p className="text-sm font-medium text-slate-500">متواجدون للرد الآني</p>
                            </div>
                        </a>

                        <a
                            href="tel:+967771447111"
                            onClick={() => haptic.success()}
                            className="bg-white/90 dark:bg-[#0B1121]/90 backdrop-blur-xl border border-indigo-200/60 dark:border-indigo-900/30 rounded-[32px] p-6 hover:shadow-[0_20px_60px_rgba(99,102,241,0.15)] transition-all group relative overflow-hidden flex items-center gap-5"
                        >
                            <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-800/40 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-500/30 group-hover:scale-110 transition-transform shadow-inner">
                                <Phone className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="font-black text-lg text-slate-900 dark:text-white mb-1">الرقم الموحد المباشر</h3>
                                <p className="text-sm font-medium text-slate-500" dir="ltr">+967 771 447 111</p>
                            </div>
                        </a>
                    </div>
                </div>

                {/* ═══ Premium FAQ Accordion ═══ */}
                <div className="bg-white/80 dark:bg-[#0B1121]/80 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 rounded-[48px] p-8 md:p-12 shadow-[0_20px_60px_rgb(0,0,0,0.04)] dark:shadow-[0_20px_60px_rgb(0,0,0,0.2)]">
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">الأسئلة الشائعة</h2>
                        <p className="text-base font-medium text-slate-500">إجابات واضحة لأكثر ما يسأله مرضانا</p>
                    </div>

                    {/* Search */}
                    <div className="relative mb-8 max-w-xl mx-auto">
                        <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="ابحث في الأسئلة..."
                            className="w-full h-16 pr-14 rounded-[20px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-bold text-base shadow-sm"
                        />
                    </div>

                    {/* Categories Tabs */}
                    <div className="flex flex-wrap justify-center gap-3 mb-10">
                        {faqCategories.map(cat => {
                            const Icon = cat.icon;
                            const isSelected = selectedCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => { haptic.selection(); setSelectedCategory(cat.id); }}
                                    className={`flex items-center gap-2.5 px-6 py-3 rounded-full whitespace-nowrap text-sm font-bold transition-all shadow-sm ${
                                        isSelected 
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border-transparent' 
                                        : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-500/30'
                                    }`}
                                >
                                    <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`} />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Questions List */}
                    <div className="space-y-4 max-w-3xl mx-auto">
                        {filteredFAQ.length > 0 ? (
                            filteredFAQ.map((item, index) => {
                                const isExpanded = expandedQuestions.includes(index);
                                return (
                                    <div 
                                        key={index} 
                                        className={`rounded-[24px] border transition-all duration-300 overflow-hidden ${
                                            isExpanded 
                                            ? 'bg-white dark:bg-slate-800/80 border-indigo-200/60 dark:border-indigo-500/30 shadow-[0_10px_30px_rgb(0,0,0,0.06)]' 
                                            : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/60 dark:border-slate-700/50 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:bg-white dark:hover:bg-slate-800/50'
                                        }`}
                                    >
                                        <button
                                            onClick={() => toggleQuestion(index)}
                                            className="w-full p-6 md:p-8 flex items-center justify-between text-right"
                                        >
                                            <span className={`font-bold text-lg leading-snug select-none pr-2 ${isExpanded ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                                {item.question}
                                            </span>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors shadow-sm border ${isExpanded ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border-indigo-200/50 dark:border-indigo-500/20' : 'bg-white dark:bg-slate-700 text-slate-400 border-slate-200/80 dark:border-slate-600'}`}>
                                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                >
                                                    <div className="px-6 md:px-8 pb-8 text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                                        {item.answer}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-200/60 dark:border-slate-700 border-dashed">
                                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-lg text-slate-700 dark:text-slate-200 font-bold mb-2">لم نجد نتائج مطابقة</p>
                                <p className="text-sm text-slate-500 font-medium">جرب البحث بكلمات أبسط أو اسأل الكونسيرج أعلى الصفحة</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
