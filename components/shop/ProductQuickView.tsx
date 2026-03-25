// components/shop/ProductQuickView.tsx
// Product quick view modal with image, details, and add-to-cart

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, ShoppingCart, Star, Heart, Share2,
    Plus, Minus, Shield, Truck, RefreshCcw, CheckCircle2, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductQuickViewProps {
    product: any;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: any, quantity: number, isSubscription: boolean) => void;
}

export default function ProductQuickView({ product, isOpen, onClose, onAddToCart }: ProductQuickViewProps) {
    const [quantity, setQuantity] = useState(1);
    const [liked, setLiked] = useState(false);
    const [purchaseType, setPurchaseType] = useState<'one-time' | 'subscribe'>('one-time');

    if (!product) return null;

    const discount = product.original_price
        ? Math.round((1 - product.price / product.original_price) * 100)
        : 0;
        
    const finalPrice = purchaseType === 'subscribe' ? product.price * 0.85 : product.price;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        className="fixed bottom-0 left-0 right-0 z-[101] bg-white dark:bg-slate-900 rounded-t-[2.5rem] max-h-[90vh] overflow-y-auto pb-8 shadow-2xl border-t border-white/20"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    >
                        {/* Drag Handle */}
                        <div className="flex justify-center pt-4 pb-2">
                            <div className="w-12 h-1.5 rounded-full bg-slate-300/50 dark:bg-slate-600/50" />
                        </div>

                        {/* Close + Actions */}
                        <div className="flex items-center justify-between px-6 pb-2">
                            <motion.button
                                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                whileTap={{ scale: 0.9 }}
                                onClick={onClose}
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </motion.button>
                            <div className="flex gap-2">
                                <motion.button
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${liked ? 'bg-red-50 text-red-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                        }`}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setLiked(!liked)}
                                >
                                    <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
                                </motion.button>
                                <motion.button
                                    className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Share2 className="w-5 h-5 text-slate-400" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Product Image */}
                        <div className="px-6 mb-5">
                            <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-3xl h-64 flex items-center justify-center overflow-hidden border border-white/40 dark:border-white/5 shadow-inner">
                                {product.image_url ? (
                                    <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-4 mix-blend-multiply dark:mix-blend-normal" />
                                ) : (
                                    <ShoppingCart className="w-16 h-16 text-slate-300" />
                                )}
                                {discount > 0 && (
                                    <Badge className="absolute top-4 right-4 bg-red-500 text-white border-0 text-xs font-bold px-2 py-1 shadow-md">
                                        -{discount}%
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="px-6 pb-4">
                            {/* Name + Rating */}
                            <div className="flex justify-between items-start gap-4 mb-2">
                                <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">{product.name}</h2>
                            </div>
                            
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-lg">
                                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                        <span className="text-xs font-bold text-amber-600 dark:text-amber-500 ml-1">4.8</span>
                                    </div>
                                    {product.category && (
                                        <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                            {product.category === 'gut_healing' ? 'أمعاء صحية' :
                                             product.category === 'immunity' ? 'دعم المناعة' :
                                             product.category === 'nervous_system' ? 'تهدئة الأعصاب' :
                                             product.category === 'pain_relief' ? 'تسكين الآلام' :
                                             product.category === 'detox' ? 'تطهير السموم' : 'مكمل صحي'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Clinical Evidence Snippet */}
                            <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-6">
                                <div className="flex items-center gap-2 mb-2 text-primary">
                                    <Sparkles className="w-4 h-4" />
                                    <h4 className="font-bold text-sm">لماذا اختاره أطباؤنا؟</h4>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    هذا المنتج مصمم سريرياً بناءً على أحدث الأبحاث لدعم الخطة العلاجية الخاصة بك، لضمان أعلى درجات الامتصاص والفعالية دون أعراض جانبية للمعدة.
                                </p>
                            </div>

                            {/* Purchase Options: One-time vs Subscribe */}
                            {product.is_subscription_eligible && (
                                <div className="mb-6 space-y-3">
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-3">خيارات الشراء</h4>
                                    
                                    {/* One-time Option */}
                                    <div 
                                        className={`relative border-2 rounded-2xl p-4 transition-all cursor-pointer flex items-center justify-between ${purchaseType === 'one-time' ? 'border-primary bg-primary/5' : 'border-slate-100 dark:border-slate-800 bg-transparent'}`}
                                        onClick={() => setPurchaseType('one-time')}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${purchaseType === 'one-time' ? 'border-primary' : 'border-slate-300'}`}>
                                                {purchaseType === 'one-time' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-800 dark:text-white">شراء لمرة واحدة</p>
                                            </div>
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-slate-800 dark:text-white">{product.price} ر.س</p>
                                        </div>
                                    </div>
                                    
                                    {/* Subscribe Option */}
                                    <div 
                                        className={`relative border-2 rounded-2xl p-4 transition-all cursor-pointer flex items-center justify-between ${purchaseType === 'subscribe' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10' : 'border-slate-100 dark:border-slate-800 bg-transparent'}`}
                                        onClick={() => setPurchaseType('subscribe')}
                                    >
                                        <div className="absolute -top-3 left-4">
                                            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 shadow-sm text-[10px] px-2">
                                                الأكثر توفيراً
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${purchaseType === 'subscribe' ? 'border-emerald-500' : 'border-slate-300'}`}>
                                                {purchaseType === 'subscribe' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1">
                                                    اشتراك شهري <RefreshCcw className="w-3 h-3 text-emerald-500" />
                                                </p>
                                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">توفير 15% دائماً</p>
                                            </div>
                                        </div>
                                        <div className="text-left flex flex-col items-end">
                                            <p className="text-xs text-slate-400 line-through mb-0.5">{product.price} ر.س</p>
                                            <p className="font-black text-emerald-600 text-lg">{(product.price * 0.85).toFixed(0)} ر.س</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Description (If Not Subscription OR standard placement) */}
                            {product.description && !product.is_subscription_eligible && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl">
                                    {product.description}
                                </p>
                            )}
                            
                            {/* Benefits List */}
                            {product.benefits && product.benefits.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-3">الفوائد الرئيسية</h4>
                                    <ul className="space-y-2">
                                        {product.benefits.map((benefit: string, index: number) => (
                                            <li key={index} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                <span>{benefit}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Trust Badges */}
                            <div className="flex justify-around items-center mb-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                <div className="flex flex-col items-center gap-1">
                                    <Shield className="w-5 h-5 text-emerald-500 mb-1" />
                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">أصلي 100%</span>
                                </div>
                                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                                <div className="flex flex-col items-center gap-1">
                                    <Truck className="w-5 h-5 text-blue-500 mb-1" />
                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">شحن سريع</span>
                                </div>
                                <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                                <div className="flex flex-col items-center gap-1">
                                    <RefreshCcw className="w-5 h-5 text-purple-500 mb-1" />
                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">استرجاع آمن</span>
                                </div>
                            </div>

                            {/* Action Bar */}
                            <div className="flex items-center gap-3 mt-4">
                                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-2xl h-14 px-1">
                                    <motion.button
                                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-sm"
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    >
                                        <Minus className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                                    </motion.button>
                                    <span className="w-8 text-center font-black text-slate-800 dark:text-white">{quantity}</span>
                                    <motion.button
                                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white dark:hover:bg-slate-700 transition-colors shadow-sm"
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setQuantity(quantity + 1)}
                                    >
                                        <Plus className="w-4 h-4 text-slate-700 dark:text-slate-300" />
                                    </motion.button>
                                </div>

                                <motion.div className="flex-1" whileTap={{ scale: 0.97 }}>
                                    <Button
                                        className="w-full h-14 bg-slate-900 hover:bg-slate-800 dark:bg-primary dark:hover:bg-primary/90 text-white font-black rounded-2xl shadow-xl shadow-slate-900/10 dark:shadow-primary/20 text-md"
                                        onClick={() => {
                                            const productToAdd = { ...product, price: finalPrice };
                                            onAddToCart(productToAdd, quantity, purchaseType === 'subscribe');
                                            onClose();
                                        }}
                                    >
                                        {purchaseType === 'subscribe' ? 'اشتراك ألان' : 'أضف للسلة'} — {(finalPrice * quantity).toFixed(0)} ر.س
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
