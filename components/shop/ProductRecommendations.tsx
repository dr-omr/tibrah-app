import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, ArrowLeft, ArrowRight } from 'lucide-react';
import { db } from '@/lib/db';
import ProductCard from './ProductCard';
import { aiClient } from '@/components/ai/aiClient';

interface ProductRecommendationsProps {
    currentProductId: string;
    category: string;
    onAddToCart: (product: any) => void;
}

export default function ProductRecommendations({ currentProductId, category, onAddToCart }: ProductRecommendationsProps) {
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecs = async () => {
            setLoading(true);
            try {
                // Fetch all products in the same category
                const allProducts = await db.entities.Product.filter({ category }) as any[];
                
                // Exclude current product
                const others = allProducts.filter(p => p.id !== currentProductId);
                
                // Shuffle or use AI to rank them based on correlation (mocked sorting for now)
                const scored = others.sort(() => 0.5 - Math.random()).slice(0, 4);
                
                setRecommendations(scored);
            } catch (e) {
                console.error("Failed to load recommendations", e);
            } finally {
                setLoading(false);
            }
        };

        fetchRecs();
    }, [currentProductId, category]);

    if (!loading && recommendations.length === 0) return null;

    return (
        <div className="mt-8 mb-4">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    <Brain className="w-5 h-5" />
                </div>
                <h3 className="font-black text-slate-900 dark:text-white text-lg">منتجات ينصح بها لتعزيز النتائج</h3>
            </div>
            
            {loading ? (
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-6 px-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="min-w-[160px] h-[220px] rounded-[24px] bg-slate-100 dark:bg-slate-800/50 animate-pulse flex-shrink-0" />
                    ))}
                </div>
            ) : (
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-6 px-6 snap-x">
                    {recommendations.map((product, i) => (
                        <motion.div 
                            key={product.id} 
                            initial={{ opacity: 0, x: 20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ delay: i * 0.1 }}
                            className="min-w-[160px] max-w-[180px] flex-shrink-0 snap-start"
                        >
                            <ProductCard 
                                product={product} 
                                onAddToCart={() => onAddToCart(product)} 
                            />
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
