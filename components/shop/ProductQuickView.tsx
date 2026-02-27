// components/shop/ProductQuickView.tsx
// Product quick view modal with image, details, and add-to-cart

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ShoppingCart, Star, Heart, Share2,
    Plus, Minus, Shield, Truck, RefreshCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductQuickViewProps {
    product: any;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (quantity: number) => void;
}

export default function ProductQuickView({ product, isOpen, onClose, onAddToCart }: ProductQuickViewProps) {
    const [quantity, setQuantity] = useState(1);
    const [liked, setLiked] = useState(false);

    if (!product) return null;

    const discount = product.original_price
        ? Math.round((1 - product.price / product.original_price) * 100)
        : 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed bottom-0 left-0 right-0 z-[101] bg-white dark:bg-slate-900 rounded-t-3xl max-h-[85vh] overflow-y-auto"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    >
                        {/* Drag Handle */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                        </div>

                        {/* Close + Actions */}
                        <div className="flex items-center justify-between px-5 pb-3">
                            <motion.button
                                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                                whileTap={{ scale: 0.85 }}
                                onClick={onClose}
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </motion.button>
                            <div className="flex gap-2">
                                <motion.button
                                    className={`w-9 h-9 rounded-full flex items-center justify-center ${liked ? 'bg-red-100 text-red-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                        }`}
                                    whileTap={{ scale: 0.85 }}
                                    onClick={() => setLiked(!liked)}
                                >
                                    <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                                </motion.button>
                                <motion.button
                                    className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                                    whileTap={{ scale: 0.85 }}
                                >
                                    <Share2 className="w-4 h-4 text-slate-400" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Product Image */}
                        <div className="px-5 mb-4">
                            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl h-56 flex items-center justify-center overflow-hidden">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-2xl" />
                                ) : (
                                    <ShoppingCart className="w-16 h-16 text-slate-300" />
                                )}
                                {discount > 0 && (
                                    <Badge className="absolute top-3 right-3 bg-red-500 text-white border-0 text-xs font-bold">
                                        -{discount}%
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="px-5 pb-4">
                            {/* Name + Rating */}
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{product.name}</h2>
                            <div className="flex items-center gap-2 mb-3">
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3.5 h-3.5 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                                    ))}
                                </div>
                                <span className="text-xs text-slate-400">(4.0) • {product.category || 'مكمل غذائي'}</span>
                            </div>

                            {/* Price */}
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-2xl font-black text-emerald-600">{product.price} ر.س</span>
                                {product.original_price && (
                                    <span className="text-sm text-slate-400 line-through">{product.original_price} ر.س</span>
                                )}
                            </div>

                            {/* Description */}
                            {product.description && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                                    {product.description}
                                </p>
                            )}

                            {/* Trust Badges */}
                            <div className="flex items-center gap-4 mb-5 py-3 border-y border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Shield className="w-4 h-4 text-emerald-500" />
                                    منتج أصلي
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Truck className="w-4 h-4 text-blue-500" />
                                    شحن سريع
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <RefreshCcw className="w-4 h-4 text-purple-500" />
                                    إرجاع مجاني
                                </div>
                            </div>

                            {/* Quantity + Add to Cart */}
                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl">
                                    <motion.button
                                        className="w-10 h-10 flex items-center justify-center"
                                        whileTap={{ scale: 0.85 }}
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    >
                                        <Minus className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                    </motion.button>
                                    <span className="w-8 text-center font-bold text-slate-800 dark:text-white">{quantity}</span>
                                    <motion.button
                                        className="w-10 h-10 flex items-center justify-center"
                                        whileTap={{ scale: 0.85 }}
                                        onClick={() => setQuantity(quantity + 1)}
                                    >
                                        <Plus className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                                    </motion.button>
                                </div>

                                <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
                                    <Button
                                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                                        onClick={() => {
                                            onAddToCart(quantity);
                                            onClose();
                                        }}
                                    >
                                        <ShoppingCart className="w-5 h-5 ml-2" />
                                        أضف للسلة — {(product.price * quantity).toFixed(0)} ر.س
                                    </Button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
