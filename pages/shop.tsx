import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { db } from '@/lib/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingBag, Search, ShoppingCart, Sparkles, Brain, Loader2, ArrowRight, ShieldCheck, Zap, Heart, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from 'next/link';
import { createPageUrl } from '../utils';
import ProductCard from '../components/shop/ProductCard';
import { ProductGridSkeleton } from '../components/common/Skeletons';
import ErrorState from '../components/common/ErrorState';
import { localProducts } from '@/lib/products';
import { aiClient } from '@/components/ai/aiClient';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
    { id: 'all', label: 'الكل', icon: Sparkles },
    { id: 'supplements', label: 'المكملات الأساسية', icon: ShieldCheck },
    { id: 'herbs', label: 'الأعشاب العلاجية', icon: Heart },
    { id: 'devices', label: 'الأجهزة والأدوات', icon: Zap }
];

export default function Shop() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [category, setCategory] = useState('all');
    const [aiRecs, setAiRecs] = useState<any>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

    const queryClient = useQueryClient();

    // Scroll listener for header
    useEffect(() => {
        const handleScroll = () => {
            setIsHeaderScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const { data: apiProducts = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['products'],
        queryFn: () => db.entities.Product.list(),
    });

    const { data: cartItems = [] } = useQuery({
        queryKey: ['cart', user?.id],
        queryFn: () => db.entities.CartItem.listForUser(user?.id || ''),
        enabled: !!user?.id,
    });

    const addToCartMutation = useMutation({
        mutationFn: async (product: any) => {
            if (product.in_stock === false) throw new Error('هذا المنتج غير متوفر حالياً');
            const currentCart = queryClient.getQueryData<any[]>(['cart', user?.id]) || [];
            const existingItem = currentCart.find((item: any) => item.product_id === product.id);
            if (existingItem) {
                return db.entities.CartItem.update(existingItem.id, { quantity: (existingItem.quantity as number) + 1 });
            }
            return db.entities.CartItem.createForUser(user?.id || '', {
                product_id: product.id,
                product_name: product.name,
                price: product.price,
                quantity: 1,
                image_url: product.image_url
            });
        },
        onSuccess: () => {
            haptic.success();
            uiSounds.success();
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.success('تمت إضافة المنتج للسلة بنجاح! 🛒', { className: 'font-sans font-bold text-emerald-600' });
        },
        onError: (error: Error) => toast.error(error.message || 'حدث خطأ أثناء الإضافة')
    });

    const products: any[] = apiProducts.length > 0 ? apiProducts : localProducts;

    if (isError && localProducts.length === 0) {
        return <ErrorState title="خطأ" message="تعذر تحميل المنتجات" onRetry={refetch} />;
    }

    let filteredProducts = products.filter((product: any) => {
        const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.name_en?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = category === 'all' || product.category === category;
        return matchesSearch && matchesCategory;
    });

    // Default sort by featured
    filteredProducts = [...filteredProducts].sort((a: any, b: any) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    const totalCartItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);

    const getAiRecommendations = async () => {
        haptic.selection();
        setAiLoading(true);
        try {
            let clinicalContext: Record<string, any> = {};
            try {
                const lastTriage = JSON.parse(localStorage.getItem('tibrah_triage_draft') || '{}');
                if (lastTriage.primaryComplaintId) {
                    clinicalContext = {
                        patient_complaint: lastTriage.primaryComplaintId,
                        severity: lastTriage.socratesAnswers?.severity,
                        triage_level: lastTriage.highestTriageLevel
                    };
                }
            } catch {}
            const result = await aiClient.recommendProducts({
                category: category !== 'all' ? category : 'مكملات صحية',
                available_products: products.map((p: any) => p.name).slice(0, 15),
                ...clinicalContext
            });
            setAiRecs(result);
            haptic.success();
        } catch { 
            toast.error('حدث خطأ في جلب التوصيات');
            haptic.error();
        } finally { 
            setAiLoading(false); 
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#020617] font-sans pb-32 selection:bg-teal-500/30 overflow-hidden relative">
            <Head>
                <title>طِبرَا | المتجر الطبي الذكي</title>
            </Head>

            {/* SUPER PREMIUM GLOW EFFECTS */}
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(20,184,166,0.06)_0%,_transparent_60%)] dark:bg-[radial-gradient(circle,_rgba(20,184,166,0.1)_0%,_transparent_60%)] blur-[80px] pointer-events-none" />
            <div className="absolute top-[30%] left-[-20%] w-[500px] h-[500px] bg-[radial-gradient(circle,_rgba(99,102,241,0.04)_0%,_transparent_60%)] dark:bg-[radial-gradient(circle,_rgba(99,102,241,0.08)_0%,_transparent_60%)] blur-[80px] pointer-events-none" />

            {/* ═══ Header ═══ */}
            <header className={`sticky top-0 z-50 transition-all duration-300 ${isHeaderScrolled ? 'bg-white/80 dark:bg-[#020617]/80 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm' : 'bg-transparent border-b border-transparent'}`}>
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={createPageUrl('Profile')} onClick={() => haptic.selection()}>
                            <div className="flex items-center justify-center w-12 h-12 rounded-full border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors shadow-sm bg-white/50 dark:bg-transparent cursor-pointer">
                                <ArrowRight className="w-5 h-5 text-slate-600 dark:text-slate-400 rtl:-scale-x-100" />
                            </div>
                        </Link>
                        <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tighter">
                            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/40 dark:to-teal-800/40 flex items-center justify-center shadow-inner border border-teal-200/50 dark:border-teal-500/20">
                                <ShoppingBag className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                            </span>
                            صيدلية طِبرَا
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href={createPageUrl('Checkout')} onClick={() => { haptic.selection(); uiSounds.navigate(); }}>
                            <div className="relative w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-center justify-center hover:shadow-md hover:scale-105 transition-all shadow-[0_4px_20px_rgb(0,0,0,0.04)] cursor-pointer active:scale-95">
                                <ShoppingCart className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                                <AnimatePresence>
                                    {totalCartItems > 0 && (
                                        <motion.div 
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-[11px] font-black border-[3px] border-white dark:border-slate-800 shadow-sm"
                                        >
                                            {totalCartItems}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="px-5 max-w-lg mx-auto relative z-10 pt-4">
                
                {/* ═══ Premium Hero Section ═══ */}
                {searchQuery === '' && category === 'all' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative w-full rounded-[40px] overflow-hidden mb-8 shadow-[0_20px_40px_rgba(20,184,166,0.1)] dark:shadow-[0_20px_40px_rgba(20,184,166,0.2)] bg-gradient-to-b from-[#0B1121] to-slate-900"
                    >
                        {/* Background glow & noise */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/30 rounded-full blur-[80px]" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px]" />
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay" />
                        
                        <div className="relative z-10 p-8 sm:p-10 flex flex-col justify-end min-h-[260px]">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 w-fit mb-5 shadow-inner">
                                <Sparkles className="w-4 h-4 text-teal-300" />
                                <span className="text-[11px] font-black text-white tracking-widest uppercase">مضمونة 100%</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black text-white mb-3 leading-tight tracking-tight">
                                المكملات التي <br/>
                                <span className="text-transparent bg-clip-text bg-gradient-to-l from-teal-200 via-emerald-300 to-emerald-400">يثق بها د. عمر</span>
                            </h2>
                            <p className="text-slate-300 text-sm font-medium opacity-90 max-w-[280px] leading-relaxed">
                                جميع المنتجات منتقاة بعناية لضمان أعلى مستويات الامتصاص والفعالية.
                            </p>
                        </div>
                    </motion.div>
                )}

                {/* ═══ Search & AI Assistant ═══ */}
                <div className="mb-8 space-y-4">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-[24px] blur-md opacity-0 group-focus-within:opacity-10 transition-opacity duration-500" />
                        <div className="relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-[24px] flex items-center overflow-hidden h-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_10px_40px_rgb(0,0,0,0.06)] transition-all">
                            <input
                                type="text"
                                placeholder="ابحث عن مكمل، عشب علاجي..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 h-full bg-transparent border-none focus:ring-0 px-6 text-base font-bold text-slate-800 dark:text-white placeholder-slate-400"
                            />
                            <div className="w-16 h-full flex items-center justify-center text-slate-400">
                                <Search className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* AI Clinical Concierge Bar */}
                    <AnimatePresence>
                        {searchQuery === '' && !aiRecs && (
                            <motion.button
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                onClick={getAiRecommendations}
                                className="w-full relative overflow-hidden bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-indigo-900/30 dark:to-purple-900/20 border border-indigo-200/60 dark:border-indigo-500/30 rounded-[28px] p-5 flex items-center justify-between group active:scale-[0.98] transition-all shadow-[0_10px_30px_transparent] hover:shadow-[0_15px_40px_rgba(99,102,241,0.1)] hover:border-indigo-300 dark:hover:border-indigo-400/50"
                            >
                                <div className="absolute right-[-10%] top-[-20%] w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className="w-12 h-12 rounded-[20px] bg-white dark:bg-[#0B1121] shadow-inner flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20 group-hover:scale-105 transition-transform">
                                        {aiLoading ? (
                                            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                                        ) : (
                                            <Brain className="w-6 h-6 text-indigo-500" />
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[15px] font-black text-slate-900 dark:text-indigo-100 mb-0.5">محتار إيش تاخذ؟</p>
                                        <p className="text-xs font-bold text-slate-500 dark:text-indigo-300/80">خلي الذكاء الاصطناعي يحلل حالتك ويقترحلك</p>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center group-hover:-translate-x-1 transition-transform rtl:group-hover:translate-x-1 shadow-sm">
                                    <ArrowRight className="w-5 h-5 text-indigo-600 dark:text-indigo-300 rtl:-scale-x-100" />
                                </div>
                            </motion.button>
                        )}
                    </AnimatePresence>

                    {/* AI Recommendations Results */}
                    <AnimatePresence>
                        {aiRecs && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                className="w-full bg-[#0B1121] overflow-hidden rounded-[32px] p-6 relative border border-indigo-500/30 shadow-[0_20px_60px_rgba(99,102,241,0.2)]"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[60px] pointer-events-none" />
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 opacity-60" />
                                
                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                            <Brain className="w-5 h-5 text-indigo-300" />
                                        </div>
                                        <span className="font-black text-white text-base">التوصيات السريرية الذكية</span>
                                    </div>
                                    <button onClick={() => setAiRecs(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white/50 hover:text-white">
                                        ✕
                                    </button>
                                </div>

                                <div className="space-y-4 relative z-10">
                                    {aiRecs.recommendations?.map((rec: any, i: number) => (
                                        <div key={i} className="bg-white/5 backdrop-blur-xl rounded-[20px] p-5 border border-white/10 hover:bg-white/10 transition-colors">
                                            <p className="text-base font-black text-white mb-2">{rec.product || rec.name}</p>
                                            <p className="text-sm text-indigo-200/90 leading-relaxed font-medium">{rec.reason || rec.benefits}</p>
                                        </div>
                                    ))}
                                    {aiRecs.general_tips?.length > 0 && (
                                        <div className="pt-4 border-t border-white/10 mt-5">
                                            <p className="text-xs font-black text-indigo-300 mb-3 flex items-center gap-1.5 uppercase tracking-widest">
                                                <Sparkles className="w-4 h-4" /> نصائح إضافية:
                                            </p>
                                            <ul className="space-y-2">
                                                {aiRecs.general_tips.map((t: string, i: number) => (
                                                    <li key={i} className="text-xs text-white/80 font-medium flex items-start gap-2 leading-relaxed">
                                                        <span className="text-indigo-400 mt-0.5">•</span> {t}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ═══ Category Pills ═══ */}
                <div className="overflow-x-auto hide-scrollbar pb-4 mb-4 -mx-5 px-5 flex gap-2.5">
                    {CATEGORIES.map(cat => {
                        const isSelected = category === cat.id;
                        const Icon = cat.icon;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => { haptic.selection(); setCategory(cat.id); }}
                                className={`relative flex items-center gap-2.5 px-5 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 shadow-sm ${
                                    isSelected 
                                    ? 'text-white' 
                                    : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50 dark:hover:bg-slate-700'
                                }`}
                            >
                                {isSelected && (
                                    <motion.div 
                                        layoutId="activeCategory" 
                                        className="absolute inset-0 bg-slate-900 dark:bg-emerald-600 rounded-2xl z-0 shadow-md" 
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    />
                                )}
                                <Icon className={`w-4 h-4 relative z-10 ${isSelected ? 'text-teal-300 dark:text-teal-100' : 'text-slate-400'}`} />
                                <span className="text-sm font-bold relative z-10">{cat.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* ═══ Products Grid ═══ */}
                {isLoading ? (
                    <ProductGridSkeleton />
                ) : filteredProducts.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-center py-20 bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl rounded-[40px] border border-slate-200/80 dark:border-slate-800 shadow-sm"
                    >
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[28px] flex items-center justify-center mx-auto mb-5 shadow-inner border border-slate-200 dark:border-slate-700">
                            <ShoppingBag className="w-10 h-10 text-slate-300 dark:text-slate-500" />
                        </div>
                        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-2">لا توجد منتجات</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">جرب البحث بكلمات مختلفة أو تصفح كل الأقسام</p>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="grid grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onAddToCart={() => addToCartMutation.mutate(product)}
                            />
                        ))}
                    </motion.div>
                )}
            </main>
        </div>
    );
}
