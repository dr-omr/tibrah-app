import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Target, Activity, BrainCircuit, Dna, Leaf, Sparkles, Heart, Stethoscope, CheckCircle2 } from 'lucide-react';
import ActionCoreBtn from '../interactives/ActionCoreBtn';
import { Haptics } from '../utils/haptics';

// Sub-component for 3D Magnetic Tilt Effect
function MagneticCard({
    isActive,
    color,
    onClick,
    children,
}: {
    isActive: boolean;
    color: string;
    onClick: () => void;
    children: React.ReactNode;
}) {
    const ref = useRef<HTMLButtonElement>(null);

    // Mouse tracking for 3D tilt
    const x = useMotionValue(0.5);
    const y = useMotionValue(0.5);

    // Smooth springs
    const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

    // Rotate transforms (tilt magnitude)
    const rotateX = useTransform(mouseY, [0, 1], [4, -4]);
    const rotateY = useTransform(mouseX, [0, 1], [-4, 4]);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width);
        y.set((e.clientY - rect.top) / rect.height);
    };

    const handleMouseLeave = () => {
        x.set(0.5);
        y.set(0.5);
    };

    return (
        <motion.button
            ref={ref}
            type="button"
            onClick={onClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            whileTap={{ scale: 0.95, rotateX: 0, rotateY: 0 }}
            onTapStart={() => Haptics.selection()}
            style={{
                perspective: 1000,
                rotateX,
                rotateY,
                padding: isActive ? '16px 16px 14px' : '14px 16px',
                borderRadius: '20px',
                background: isActive
                    ? 'linear-gradient(135deg, #101822 0%, #182230 100%)'
                    : 'rgba(255,255,255,0.65)',
                color: isActive ? '#fff' : '#101822',
                border: `1px solid ${isActive ? `${color}44` : 'rgba(16,24,34,0.05)'}`,
                boxShadow: isActive
                    ? `0 12px 30px rgba(16,24,34,0.18), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px ${color}22`
                    : '0 2px 8px rgba(16,24,34,0.04)',
                backdropFilter: 'blur(16px)',
                transformStyle: 'preserve-3d',
                zIndex: isActive ? 10 : 1,
            }}
            className="w-full flex items-center gap-3.5 text-right relative overflow-hidden transition-colors duration-300 transform-gpu"
        >
            {/* Magnetic highlight that follows the mouse (only on hover when active) */}
            <motion.div
                className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity"
                style={{
                    background: useTransform(
                        [mouseX, mouseY],
                        ([mx, my]) => `radial-gradient(circle 80px at ${(mx as number) * 100}% ${(my as number) * 100}%, rgba(255,255,255,0.06), transparent 100%)`
                    ),
                }}
            />
            {/* Internal content is pushed forward via translateZ inside the children rendering */}
            {children}
        </motion.button>
    );
}


interface StepMedicalIntentProps {
    onSubmit: (intents: string[]) => void;
    loading: boolean;
}

const stagger = (i: number) => ({ delay: 0.06 + i * 0.07 });

export default function StepMedicalIntent({ onSubmit, loading }: StepMedicalIntentProps) {
    const [selected, setSelected] = useState<string[]>([]);

    const toggleIntent = (id: string) => {
        setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const intents = useMemo(() => [
        {
            id: 'chronic', icon: Activity, color: '#f43f5e',
            label: 'الأمراض المزمنة',
            desc: 'سكري، ضغط، غدة — نعالج السبب مش العرض',
            detail: 'بروتوكولات دقيقة مبنية على تحاليلك الشخصية',
        },
        {
            id: 'weight', icon: Target, color: '#fbbf24',
            label: 'الوزن والتغذية',
            desc: 'أنظمة تفهم جسمك، مش حميات عابرة',
            detail: 'خطة استقلاب ذكية تتكيف مع أسلوب حياتك',
        },
        {
            id: 'mental', icon: BrainCircuit, color: '#8b5cf6',
            label: 'راحتك النفسية',
            desc: 'لأن العافية تبدأ من الداخل',
            detail: 'دعم نفسي متكامل مع متابعة مؤشرات القلق والنوم',
        },
        {
            id: 'longevity', icon: Dna, color: '#3b82f6',
            label: 'الطب الوقائي',
            desc: 'اليوم تبني صحة بكرة بإذن الله',
            detail: 'فحوصات مبكرة + تحليل جيني + مكملات مخصصة',
        },
        {
            id: 'holistic', icon: Leaf, color: '#2B9A89',
            label: 'الطب التكاملي',
            desc: 'العلم الحديث + حكمة الطبيعة',
            detail: 'ندمج بين الطب الوظيفي والطب البديل المبني على دليل',
        },
    ], []);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.2 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 14, scale: 0.98 },
        show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring' as const, stiffness: 120, damping: 16 } }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full relative origin-center"
        >
            {/* ─── HEADER ─── */}
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={stagger(0)}
                className="inline-block text-[13px] font-semibold mb-4"
                style={{ color: '#2B9A89' }}
            >
                خطوة أخيرة ✨
            </motion.span>

            <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={stagger(1)}
                className="text-[34px] sm:text-[40px] font-black leading-[1.18] tracking-tight mb-3"
                style={{ color: '#101822' }}
            >
                وش الشي اللي{' '}
                <span style={{ color: '#2B9A89' }}>يهمّك أكثر؟</span>
            </motion.h2>

            <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={stagger(2)}
                className="text-[14px] leading-[1.85] mb-3 max-w-[340px]"
                style={{ color: '#64748B' }}
            >
                لكل إنسان بصمة، ولكل جسد لغة. اختر مجالاتك ليصمم الذكاء الاصطناعي بروتوكولاً يشبهك.
            </motion.p>

            {/* Selection counter with fluid layout shift */}
            <motion.div
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={stagger(3)}
                className="flex items-center gap-3 mb-7"
            >
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(16,24,34,0.03)' }}>
                    <Stethoscope className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
                    <span className="text-[11px] font-medium" style={{ color: '#94a3b8' }}>
                        {selected.length === 0
                            ? 'اختر واحد أو أكثر لتبدأ الرحلة'
                            : `تم تثبيت ${selected.length} ${selected.length === 1 ? 'مجال' : 'مجالات'} في ملفك`}
                    </span>
                </div>
                {/* Mini dots showing selection state */}
                <div className="flex gap-1.5">
                    {intents.map(intent => (
                        <motion.div
                            key={intent.id}
                            animate={{
                                backgroundColor: selected.includes(intent.id) ? intent.color : 'rgba(16,24,34,0.06)',
                                scale: selected.includes(intent.id) ? [1, 1.4, 1.2] : 1,
                            }}
                            transition={{ duration: 0.3 }}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ boxShadow: selected.includes(intent.id) ? `0 0 6px ${intent.color}88` : 'none' }}
                        />
                    ))}
                </div>
            </motion.div>

            {/* ─── INTENT CARDS (With 3D Magnetic Physics) ─── */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-3 mb-8"
                style={{ perspective: 1200 }} // Container perspective for 3D children
            >
                {intents.map((intent) => {
                    const isActive = selected.includes(intent.id);
                    return (
                        <motion.div key={intent.id} variants={itemVariants} layout>
                            <MagneticCard
                                isActive={isActive}
                                color={intent.color}
                                onClick={() => toggleIntent(intent.id)}
                            >
                                {/* Colored glow behind icon when selected */}
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.4 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.4 }}
                                            className="absolute -right-4 -top-4 w-28 h-28 rounded-full pointer-events-none"
                                            style={{
                                                background: `radial-gradient(circle, ${intent.color}35 0%, transparent 65%)`,
                                                transform: 'translateZ(-10px)' // Push glow backward in 3D space
                                            }}
                                        />
                                    )}
                                </AnimatePresence>

                                {/* Icon (Pushed forward in 3D) */}
                                <motion.div
                                    animate={{ rotate: isActive ? [0, -5, 5, 0] : 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10 transition-colors duration-200"
                                    style={{
                                        backgroundColor: isActive ? `${intent.color}35` : `${intent.color}0F`,
                                        color: intent.color,
                                        transform: 'translateZ(10px)', // Pushed out towards user
                                    }}
                                >
                                    <intent.icon className="w-[18px] h-[18px]" strokeWidth={2} />
                                </motion.div>

                                {/* Text content */}
                                <div className="flex-1 relative z-10 min-w-0" style={{ transform: 'translateZ(5px)' }}>
                                    <span className="font-bold text-[14px] block leading-snug">{intent.label}</span>
                                    <span className="text-[11px] font-medium block mt-0.5 leading-relaxed"
                                          style={{ color: isActive ? 'rgba(255,255,255,0.55)' : '#94a3b8' }}>
                                        {intent.desc}
                                    </span>
                                    {/* Extra detail that appears when selected */}
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.span
                                                initial={{ opacity: 0, height: 0, filter: 'blur(4px)' }}
                                                animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
                                                exit={{ opacity: 0, height: 0, filter: 'blur(4px)' }}
                                                className="text-[10px] font-medium block mt-1.5 overflow-hidden leading-relaxed"
                                                style={{ color: `${intent.color}CC` }}
                                            >
                                                ✦ {intent.detail}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Radio indicator */}
                                <div className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 relative z-10 transition-all duration-200"
                                     style={{
                                         border: `2px solid ${isActive ? intent.color : 'rgba(16,24,34,0.1)'}`,
                                         backgroundColor: isActive ? `${intent.color}15` : 'transparent',
                                         transform: 'translateZ(8px)',
                                     }}>
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                exit={{ scale: 0 }}
                                                transition={{ type: 'spring', stiffness: 300 }}
                                                className="w-2.5 h-2.5 rounded-full"
                                                style={{ backgroundColor: intent.color, boxShadow: `0 0 8px ${intent.color}` }}
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>
                            </MagneticCard>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* ─── WHAT HAPPENS NEXT (Fluid layout expansion) ─── */}
            <AnimatePresence>
                {selected.length > 0 && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, height: 0, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
                        exit={{ opacity: 0, height: 0, filter: 'blur(8px)' }}
                        className="overflow-hidden mb-6"
                    >
                        <div className="p-5 rounded-2xl relative overflow-hidden group"
                             style={{ background: 'rgba(43,154,137,0.03)', border: '1px solid rgba(43,154,137,0.08)' }}>
                            {/* Subtle sweeping light */}
                            <motion.div 
                                className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{
                                    background: 'linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                                    backgroundSize: '200% 100%'
                                }}
                                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                            />
                            
                            <p className="text-[11px] font-bold mb-3 relative z-10 flex items-center gap-1.5" style={{ color: '#2B9A89' }}>
                                <Sparkles className="w-3.5 h-3.5" />
                                وش راح يصير بعدين؟
                            </p>
                            <div className="space-y-2.5 relative z-10">
                                {[
                                    'يقوم محرك الذكاء الاصطناعي ببناء خريطتك',
                                    'نخصص الفحوصات والتحاليل بناءً على مجالك',
                                    'دخولك الأول سيكون لبروتوكول جاهز كلياً لك',
                                ].map((step, i) => (
                                    <motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * i }}
                                        className="flex items-start gap-2"
                                    >
                                        <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#2B9A89' }} />
                                        <span className="text-[11.5px] font-medium leading-relaxed" style={{ color: '#64748B' }}>
                                            {step}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ─── ACTION BUTTONS ─── */}
            <motion.div layout className="flex gap-2.5 items-center">
                <div className="flex-[2]">
                    <ActionCoreBtn
                        loading={false}
                        disabled={loading}
                        variant="secondary"
                        onClick={() => onSubmit([])}
                        label={<span className="text-[12px]">أتخطى الآن</span>}
                    />
                </div>
                <div className="flex-[3]">
                    <ActionCoreBtn
                        loading={loading}
                        disabled={selected.length === 0}
                        onClick={() => onSubmit(selected)}
                        label={
                            <span className="flex items-center gap-2 text-[13px]">
                                <Sparkles className="w-4 h-4" />
                                بناء البروتوكول
                            </span>
                        }
                    />
                </div>
            </motion.div>
        </motion.div>
    );
}
