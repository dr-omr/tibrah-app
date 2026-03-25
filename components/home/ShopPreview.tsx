// components/home/ShopPreview.tsx
// Premium shop preview for home page — featured products horizontal scroll

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Star, ShoppingCart, Sparkles, AlertCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { localProducts } from '@/lib/products';
import { haptic } from '@/lib/HapticFeedback';

// Mock personalization data
const mockPersonalization = {
    goal: 'تحسين جودة النوم',
    recommendedProductId: 'p2', // Using a generic ID since localProducts might vary, will match by index in render
    reason: 'فيه مغنيسيوم يساعدك ترتاح وتنام أحسن'
};

export default function ShopPreview() {
    // Show first 6 featured products
    const featured = localProducts
        .filter((p: any) => p.featured || p.in_stock !== false)
        .slice(0, 6);

    if (featured.length === 0) return null;

    return (
        <section className="mt-8 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between px-5 mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
                        style={{ background: 'linear-gradient(135deg, #f59e0b, #ea580c)', boxShadow: '0 4px 12px rgba(245,158,11,0.25)' }}
                    >
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
                <Link
                    href={createPageUrl('Shop')}
                    className="flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 active:scale-95 transition-transform"
                >
                    شوف الكل
                    <ArrowLeft className="w-3 h-3" />
                </Link>
            </div>

            {/* Personalized Context Banner */}
            <div className="mx-5 mb-4">
                <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl p-3 flex items-start gap-3"
                >
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Star className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 mb-0.5">بناءً على هدفك: {mockPersonalization.goal}</p>
                        <p className="text-[10px] text-indigo-600/80 dark:text-indigo-400/80 font-medium leading-relaxed">اخترنا لك هالمكملات خصيصاً لدعم خطتك العلاجية.</p>
                    </div>
                </motion.div>
            </div>

            {/* Horizontal scroll products */}
            <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-3 px-5 pb-2" style={{ minWidth: 'min-content' }}>
                    {featured.map((product: any, i: number) => {
                        const isRecommended = i === 1; // Mock second item as recommended
                        return (
                        <motion.div
                            key={product.id || i}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Link
                                href={createPageUrl(`ProductDetails?id=${product.id}`)}
                                onClick={() => haptic.selection()}
                            >
                                <div
                                    className={`w-[160px] rounded-[20px] overflow-hidden active:scale-[0.97] transition-all duration-300 relative group bg-white dark:bg-slate-800 border ${isRecommended ? 'border-amber-400 shadow-md shadow-amber-500/10' : 'border-slate-100 dark:border-slate-700 shadow-sm'}`}
                                >
                                    {/* Recommended Badge */}
                                    {isRecommended && (
                                        <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm flex items-center gap-1 backdrop-blur-md">
                                            <Sparkles className="w-3 h-3" />
                                            <span className="text-[9px] font-bold tracking-wider">الأفضل لك</span>
                                        </div>
                                    )}

                                    {/* Image Container */}
                                    <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 relative overflow-hidden flex items-center justify-center p-3">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                                        {product.image_url ? (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="w-[80%] h-[80%] object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                                <ShoppingBag className="w-7 h-7 text-slate-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Content */}
                                    <div className="p-3">
                                        {/* Ratings */}
                                        <div className="flex items-center gap-0.5 mb-1.5 opacity-80">
                                            {[1,2,3,4].map(s => (
                                                <Star key={s} className="w-2.5 h-2.5 text-amber-400" fill="#fbbf24" />
                                            ))}
                                            <Star className="w-2.5 h-2.5 text-slate-300 dark:text-slate-600" fill="currentColor" />
                                            <span className="text-[9px] text-slate-400 font-medium ml-1 mr-0.5">4.8</span>
                                        </div>
                                        
                                        <h3 className="text-[12px] font-extrabold text-slate-800 dark:text-white line-clamp-2 leading-tight mb-2 h-[34px]">
                                            {product.name}
                                        </h3>
                                        
                                        {isRecommended && (
                                            <p className="text-[9px] text-amber-600 dark:text-amber-400 font-medium leading-tight mb-2 line-clamp-1 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded border border-amber-100 dark:border-amber-900/30">
                                                {mockPersonalization.reason}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex flex-col">
                                                <span className="text-[14px] font-extrabold text-emerald-600 dark:text-emerald-400 leading-none">{product.price}</span>
                                                <span className="text-[9px] text-slate-400 font-bold mt-0.5">ريال</span>
                                            </div>
                                            <button
                                                className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-50 hover:bg-emerald-50 dark:bg-slate-700 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-slate-100 dark:border-slate-600 hover:border-emerald-200 dark:hover:border-emerald-800 active:scale-95"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    haptic.success();
                                                    // Add to cart logic would go here
                                                }}
                                                aria-label="أضف للسلة"
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    )})}
                </div>
            </div>
        </section>
    );
}
