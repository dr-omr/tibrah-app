// components/home/ShopPreview.tsx
// Premium shop preview — 3D tilt cards, filter chips, cart animation, stock badges

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Star, ShoppingCart, Sparkles, CheckCircle, Zap } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { localProducts } from '@/lib/products';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';

const CATEGORIES = ['الكل', 'مكملات', 'أعشاب', 'استشفاء'];

export default function ShopPreview() {
    const [activeCategory, setActiveCategory] = useState('الكل');
    const [addedId, setAddedId] = useState<string | null>(null);

    const all = localProducts.filter((p: any) => p.featured || p.in_stock !== false).slice(0, 8);
    const featured = activeCategory === 'الكل' ? all : all.filter((_: any, i: number) => {
        // Mock category filter by index groups
        const catMap: Record<string, number[]> = { 'مكملات': [0, 1, 4, 5], 'أعشاب': [2, 3], 'استشفاء': [6, 7] };
        return (catMap[activeCategory] || []).includes(i);
    });

    if (all.length === 0) return null;

    const handleAdd = (id: string) => {
        haptic.success();
        uiSounds.select();
        setAddedId(id);
        setTimeout(() => setAddedId(null), 1800);
    };

    return (
        <section className="mt-8 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between px-5 mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', boxShadow: '0 4px 16px rgba(245,158,11,0.3)' }}>
                        <ShoppingBag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h2 className="text-[16px] font-extrabold text-slate-800 dark:text-white leading-tight mb-0.5">صيدلية طِبرَا</h2>
                        <div className="flex items-center gap-1 opacity-80">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <p className="text-[11px] text-slate-500 font-semibold">مكملات لدعم خطتك</p>
                        </div>
                    </div>
                </div>
                <Link href={createPageUrl('Shop')} className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full liquid-icon text-amber-600 dark:text-amber-400 active:scale-95 transition-transform">
                    شوف الكل <ArrowLeft className="w-3 h-3" />
                </Link>
            </div>

            {/* Category Filter Chips */}
            <div className="flex gap-2 px-5 mb-4 overflow-x-auto scrollbar-hide">
                {CATEGORIES.map(cat => (
                    <motion.button
                        key={cat}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => { setActiveCategory(cat); haptic.tap(); uiSounds.select(); }}
                        className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[11.5px] font-bold transition-all duration-300 ${activeCategory === cat
                            ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                    >
                        {cat}
                    </motion.button>
                ))}
            </div>

            {/* Products Horizontal Scroll */}
            <div className="overflow-x-auto scrollbar-hide">
                <AnimatePresence mode="popLayout">
                    <div className="flex gap-3 px-5 pb-2" style={{ minWidth: 'min-content' }}>
                        {featured.map((product: any, i: number) => {
                            const isRecommended = i === 1;
                            const isLowStock = i === 0 || i === 3;
                            return (
                                <ProductCard
                                    key={product.id || i}
                                    product={product}
                                    index={i}
                                    isRecommended={isRecommended}
                                    isLowStock={isLowStock}
                                    isAdded={addedId === (product.id || String(i))}
                                    onAdd={() => handleAdd(product.id || String(i))}
                                />
                            );
                        })}
                    </div>
                </AnimatePresence>
            </div>
        </section>
    );
}

/* ── 3D Tilt Product Card ── */
function ProductCard({ product, index, isRecommended, isLowStock, isAdded, onAdd }: {
    product: any; index: number; isRecommended: boolean; isLowStock: boolean; isAdded: boolean; onAdd: () => void;
}) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x, { stiffness: 300, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 300, damping: 20 });
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['6deg', '-6deg']);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-6deg', '6deg']);

    const handleMove = (e: React.TouchEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.touches[0].clientX - rect.left) / rect.width - 0.5);
        y.set((e.touches[0].clientY - rect.top) / rect.height - 0.5);
    };
    const handleEnd = () => { x.set(0); y.set(0); };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.05 }}
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 800 }}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
        >
            <Link href={createPageUrl(`ProductDetails?id=${product.id}`)} onClick={() => haptic.selection()}>
                <div className={`w-[158px] rounded-[20px] overflow-hidden active:scale-[0.97] transition-all duration-300 relative group liquid-card ${isRecommended ? 'ring-1 ring-amber-400 shadow-md shadow-amber-500/15' : ''}`}>
                    {/* Badges */}
                    {isRecommended && (
                        <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            <span className="text-[9px] font-bold tracking-wide">الأفضل لك</span>
                        </div>
                    )}
                    {isLowStock && !isRecommended && (
                        <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded-lg bg-red-500/90 text-white shadow-sm flex items-center gap-1 backdrop-blur-sm">
                            <Zap className="w-3 h-3" />
                            <span className="text-[9px] font-bold">باقي 3 فقط</span>
                        </div>
                    )}

                    {/* Product Image */}
                    <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 relative overflow-hidden flex items-center justify-center p-3">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                        {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-[80%] h-[80%] object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500" loading="lazy" />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                <ShoppingBag className="w-7 h-7 text-slate-400" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="p-3">
                        <div className="flex items-center gap-0.5 mb-1.5 opacity-80">
                            {[1, 2, 3, 4].map(s => <Star key={s} className="w-2.5 h-2.5 text-amber-400" fill="#fbbf24" />)}
                            <Star className="w-2.5 h-2.5 text-slate-300 dark:text-slate-600" fill="currentColor" />
                            <span className="text-[9px] text-slate-400 font-medium ml-1">4.8</span>
                        </div>
                        <h3 className="text-[12px] font-extrabold text-slate-800 dark:text-white line-clamp-2 leading-tight mb-2 h-[34px]">{product.name}</h3>

                        <div className="flex items-center justify-between mt-auto">
                            <div className="flex flex-col">
                                <span className="text-[14px] font-extrabold text-emerald-600 dark:text-emerald-400 leading-none">{product.price}</span>
                                <span className="text-[9px] text-slate-400 font-bold mt-0.5">ريال</span>
                            </div>
                            {/* Cart Button with animation */}
                            <motion.button
                                whileTap={{ scale: 0.85 }}
                                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-95 ${isAdded ? 'bg-emerald-500 text-white' : 'liquid-icon text-slate-500 hover:text-emerald-600'}`}
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAdd(); }}
                                aria-label="أضف للسلة"
                            >
                                <AnimatePresence mode="wait">
                                    {isAdded ? (
                                        <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                            <CheckCircle className="w-4 h-4" />
                                        </motion.div>
                                    ) : (
                                        <motion.div key="cart" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                            <ShoppingCart className="w-4 h-4" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
