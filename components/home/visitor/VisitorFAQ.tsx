// components/home/visitor/VisitorFAQ.tsx
// NEW — Expandable FAQ accordion with spring physics
// Apple Shortcuts / iOS Settings style: tap to reveal, smooth spring expand
// Glassmorphism cards, teal accent, RTL-first

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, MessageCircle } from 'lucide-react';
import { haptic } from '@/lib/HapticFeedback';

const G = {
    canvas:   '#F0FAF8',
    glass:    'rgba(255,255,255,0.85)',
    blur:     'blur(24px) saturate(180%)',
    border:   'rgba(255,255,255,0.82)',
    borderTop:'rgba(255,255,255,0.98)',
    shadow:   '0 2px 0 rgba(255,255,255,1) inset, 0 6px 24px rgba(15,23,42,0.07)',
    accent:   '#0D9488',
    ink:      '#0F172A',
    sub:      '#475569',
    muted:    '#94A3B8',
};
const SP = { type: 'spring' as const, stiffness: 420, damping: 32 };

const FAQS = [
    {
        q: 'ما الفرق بين طِبرَا والطبيب العادي؟',
        a: 'الطب التقليدي يعالج الأعراض. طِبرَا يبحث عن السبب الجذري — يجمع الجسد والعقل والعوامل الوظيفية ليبني لك بروتوكولاً مخصصاً يعالج الإنسان بالكامل، لا مجرد التشخيص.',
        tag: 'المنهج',
        tagColor: G.accent,
    },
    {
        q: 'كيف يتم التشخيص في طِبرَا؟',
        a: 'نبدأ بجلسة تشخيصية شاملة تستغرق ٦٠-٩٠ دقيقة. نراجع تاريخك الطبي الكامل، أنماطك الغذائية، حالتك النفسية، ومؤشراتك الوظيفية. ثم نبني بروتوكولاً علاجياً مكتوباً خاصاً بك.',
        tag: 'العملية',
        tagColor: '#6366f1',
    },
    {
        q: 'هل الاستشارة أونلاين أو حضورية؟',
        a: 'كلاهما متاح. الاستشارات الأونلاين مثالية للمتابعة والحالات غير الطارئة، بينما الجلسات الحضورية أفضل للتقييم الأولي الشامل. نتيح لك الاختيار بحسب راحتك.',
        tag: 'الحضور',
        tagColor: '#0891b2',
    },
    {
        q: 'ما الحالات التي يعالجها طِبرَا؟',
        a: 'متلازمة التعب المزمن، الأمراض المناعية، الهضم، الهرمونات، الاضطرابات النفس-جسدية، الالتهاب المزمن، فرط النشاط، والأمراض التي لم تجد لها تفسيراً في الطب التقليدي.',
        tag: 'التخصص',
        tagColor: G.accent,
    },
    {
        q: 'كم يستغرق البروتوكول العلاجي؟',
        a: 'يتراوح بين ٣ شهور لـ ١٢ شهراً بحسب تعقيد الحالة. لكن معظم المرضى يلحظون تحسناً ملموساً في الشهر الأول. العلاج الجذري يحتاج وقتاً — لكن نتائجه دائمة.',
        tag: 'المدة',
        tagColor: '#D97706',
    },
    {
        q: 'ماذا أحضر معي لأول جلسة؟',
        a: 'اپ تقارير الفحوصات السابقة، قائمة الأدوية الحالية، وكل ما تعرفه عن تاريخ عائلتك الصحي. إذا لم يكن لديك شيء، لا مشكلة — نبدأ من الصفر ونبني معاً.',
        tag: 'الاستعداد',
        tagColor: '#6366f1',
    },
];

export default function VisitorFAQ() {
    const [open, setOpen] = useState<number | null>(null);

    const toggle = (i: number) => {
        haptic.selection();
        setOpen(prev => prev === i ? null : i);
    };

    return (
        <section dir="rtl" className="relative px-4 py-8" style={{ background: G.canvas }}>

            {/* Ambient blob */}
            <div className="absolute top-0 left-0 w-64 h-40 pointer-events-none" aria-hidden
                style={{ background: 'radial-gradient(ellipse, rgba(13,148,136,0.07) 0%, transparent 70%)', filter: 'blur(40px)' }} />

            {/* Section header */}
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} className="mb-6 relative">
                <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-1 h-5 rounded-full" style={{ background: G.accent }} />
                    <HelpCircle className="w-4 h-4" style={{ color: G.accent, opacity: 0.75 }} />
                    <p className="text-[10px] font-black uppercase tracking-[0.14em]"
                        style={{ color: G.accent, opacity: 0.65 }}>أسئلة شائعة</p>
                </div>
                <h2 className="text-[24px] font-black leading-[1.15] tracking-tight"
                    style={{ color: G.ink }}>
                    كل ما تريد<br />
                    <span style={{ color: G.accent }}>معرفته</span>
                </h2>
                <p className="text-[12.5px] mt-2 leading-[1.65]" style={{ color: G.sub }}>
                    أجوبة واضحة على أكثر الأسئلة شيوعاً عن طِبرَا
                </p>
            </motion.div>

            {/* FAQ items */}
            <div className="flex flex-col gap-2.5">
                {FAQS.map((faq, i) => {
                    const isOpen = open === i;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.06, ...SP }}>

                            <motion.div
                                layout
                                className="relative overflow-hidden rounded-[20px]"
                                style={{
                                    background: isOpen
                                        ? 'rgba(255,255,255,0.95)'
                                        : G.glass,
                                    backdropFilter: G.blur,
                                    WebkitBackdropFilter: G.blur,
                                    border: `1.5px solid ${isOpen ? `${G.accent}22` : G.border}`,
                                    boxShadow: isOpen
                                        ? `0 2px 0 rgba(255,255,255,1) inset, 0 12px 36px rgba(13,148,136,0.09), 0 2px 8px rgba(0,0,0,0.04)`
                                        : G.shadow,
                                    transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
                                }}
                                transition={SP}>

                                {/* Top Fluent reflection */}
                                <div className="absolute top-0 left-4 right-4 h-px pointer-events-none"
                                    style={{ background: G.borderTop }} />

                                {/* Question row — tap target */}
                                <button
                                    className="w-full flex items-center gap-3 p-4 text-right"
                                    onClick={() => toggle(i)}>

                                    {/* Tag pill */}
                                    <span className="text-[8.5px] font-black px-2 py-0.5 rounded-md flex-shrink-0"
                                        style={{
                                            background: `${faq.tagColor}12`,
                                            color: faq.tagColor,
                                            border: `1px solid ${faq.tagColor}20`,
                                        }}>
                                        {faq.tag}
                                    </span>

                                    {/* Question text */}
                                    <p className="flex-1 text-[13.5px] font-black text-right leading-tight"
                                        style={{ color: isOpen ? G.accent : G.ink }}>
                                        {faq.q}
                                    </p>

                                    {/* Chevron */}
                                    <motion.div
                                        animate={{ rotate: isOpen ? 180 : 0 }}
                                        transition={SP}
                                        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
                                        style={{
                                            background: isOpen ? `${G.accent}12` : 'rgba(0,0,0,0.04)',
                                        }}>
                                        <ChevronDown className="w-3.5 h-3.5"
                                            style={{ color: isOpen ? G.accent : G.muted }} />
                                    </motion.div>
                                </button>

                                {/* Answer — spring expand */}
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            key="answer"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ ...SP, stiffness: 380, damping: 34 }}
                                            className="overflow-hidden">
                                            <div className="px-4 pb-4 pt-1"
                                                style={{ borderTop: '1px solid rgba(255,255,255,0.55)' }}>
                                                <p className="text-[12.5px] leading-[1.72] font-medium"
                                                    style={{ color: G.sub }}>
                                                    {faq.a}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Bottom WhatsApp nudge */}
            <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.4 }}
                className="mt-6">
                <a href="https://wa.me/967771447111" target="_blank" rel="noopener noreferrer"
                    onClick={() => haptic.impact()}
                    className="flex items-center justify-center gap-2.5 py-3.5 rounded-[18px] no-underline"
                    style={{
                        background: G.glass,
                        backdropFilter: G.blur,
                        WebkitBackdropFilter: G.blur,
                        border: `1px solid ${G.border}`,
                        boxShadow: G.shadow,
                    }}>
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    <span className="text-[12.5px] font-black text-green-700">
                        لديك سؤال آخر؟ راسلنا على واتساب
                    </span>
                </a>
            </motion.div>
        </section>
    );
}
