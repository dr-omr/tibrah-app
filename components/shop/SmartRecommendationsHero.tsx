import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';

export default function SmartRecommendationsHero({ products, onAddToCart }: { products: any[], onAddToCart: (p: any) => void }) {
    // Just pick the top 2 recommended for the hero
    const recommended = products.slice(0, 2);

    if (!recommended.length) return null;

    return (
        <section className="mt-2 mb-8 relative">
            <div className="flex items-center gap-2 mb-4 px-1 text-primary">
                <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h2 className="text-lg font-black text-slate-800 dark:text-white">وصفتك الذكية</h2>
                <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full mr-auto">
                    خصيصاً لك
                </span>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x px-1">
                {recommended.map((product, i) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="snap-start min-w-[280px] sm:min-w-[320px] p-5 rounded-3xl relative overflow-hidden flex-shrink-0"
                    >
                        {/* Background with glowing effects */}
                        <div className="absolute inset-0 bg-primary/5 dark:bg-slate-800/80" />
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />

                        {/* Content */}
                        <div className="relative z-10 flex">
                            <div className="flex-1 pr-2">
                                <h3 className="text-slate-800 dark:text-white font-black text-lg mb-1 leading-tight">{product.name}</h3>
                                <p className="text-slate-600 dark:text-slate-300 text-xs mb-4 line-clamp-2 leading-relaxed">
                                    {product.description}
                                </p>
                                
                                <div className="flex items-center gap-3">
                                    <Button 
                                        onClick={(e) => {
                                            e.preventDefault();
                                            onAddToCart(product);
                                        }}
                                        className="bg-primary text-white hover:bg-primary/90 font-bold px-4 py-2 h-auto rounded-xl text-xs shadow-md"
                                    >
                                        إضافة للسلة
                                    </Button>
                                    <Link href={`/product-details?id=${product.id}`}>
                                        <button className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors">
                                            <ArrowUpRight className="w-4 h-4" />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="w-24 h-24 shrink-0 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center border border-slate-100 dark:border-slate-600 relative shadow-sm">
                                {product.image_url ? (
                                    <img src={product.image_url} alt="" className="w-[80%] h-[80%] object-contain drop-shadow-lg" />
                                ) : (
                                    <span className="text-3xl">💊</span>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
