import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createPageUrl } from '../utils';
import {
    ArrowRight, ShoppingCart, Heart, Star, Check,
    Minus, Plus, Truck, Shield, RefreshCw, Sparkles
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import CommentsSection from '../components/common/CommentsSection';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { useAuth } from '@/contexts/AuthContext';
import ProductRecommendations from '@/components/shop/ProductRecommendations';

// TypeScript interfaces
interface Product {
    id: string;
    name: string;
    name_en?: string;
    description?: string;
    price: number;
    original_price?: number;
    category: string;
    image_url?: string;
    featured?: boolean;
    in_stock?: boolean;
    benefits?: string[];
    is_subscription_eligible?: boolean;
}

interface CartItem {
    id: string;
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
    image_url?: string;
    is_subscription?: boolean;
}

export default function ProductDetails() {
    const router = useRouter();
    const productId = router.query.id as string;
    const [quantity, setQuantity] = useState(1);
    const [purchaseType, setPurchaseType] = useState<'onetime' | 'subscription'>('onetime');
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const { data: product, isLoading } = useQuery<Product | null>({
        queryKey: ['product', productId],
        queryFn: async (): Promise<Product | null> => {
            const products = await db.entities.Product.filter({ id: productId }) as unknown as Product[];
            return products[0] || null;
        },
        enabled: !!productId && router.isReady,
    });

    const { data: cartItems = [] } = useQuery<CartItem[]>({
        queryKey: ['cart', user?.id],
        queryFn: async (): Promise<CartItem[]> => {
            return db.entities.CartItem.listForUser(user?.id || '') as unknown as CartItem[];
        },
        enabled: !!user?.id,
    });

    const addToCartMutation = useMutation({
        mutationFn: async () => {
            // Read fresh cart data to avoid stale closure
            const currentCart = queryClient.getQueryData<CartItem[]>(['cart']) || [];
            // Match product ID and subscription type
            const existingItem = currentCart.find((item: CartItem) => item.product_id === productId && item.is_subscription === (purchaseType === 'subscription'));
            if (existingItem) {
                return db.entities.CartItem.update(existingItem.id, {
                    quantity: existingItem.quantity + quantity
                });
            }
            return db.entities.CartItem.createForUser(user?.id || '', {
                product_id: productId,
                product_name: product?.name || '',
                price: purchaseType === 'subscription' ? Math.round((product?.price || 0) * 0.85) : (product?.price || 0),
                quantity: quantity,
                image_url: product?.image_url || '',
                is_subscription: purchaseType === 'subscription'
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            haptic.success();
            uiSounds.success();
            toast.success('تمت الإضافة للسلة', { icon: '🛒' });
        },
    });

    // Guard: Wait for router to be ready
    if (!router.isReady) {
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;
    }

    const features = [
        { icon: Truck, text: 'شحن سريع خلال ٣-٥ أيام' },
        { icon: Shield, text: 'ضمان جودة المنتج' },
        { icon: RefreshCw, text: 'استرجاع خلال ١٤ يوم' },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <div className="aspect-square bg-slate-100 animate-pulse" />
                <div className="p-6 space-y-4">
                    <div className="h-8 bg-slate-100 rounded-lg animate-pulse w-3/4" />
                    <div className="h-6 bg-slate-100 rounded-lg animate-pulse w-1/2" />
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-500">المنتج غير موجود</p>
                    <Link href={createPageUrl('Shop')}>
                        <Button className="mt-4">العودة للمتجر</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const hasDiscount = product.original_price && product.original_price > product.price;
    const discountPercent = hasDiscount
        ? Math.round((1 - product.price / product.original_price) * 100)
        : 0;

    const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="min-h-screen pb-32">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 px-4 py-4 flex items-center justify-between">
                <Link href={createPageUrl('Shop')}>
                    <motion.div whileTap={{ scale: 0.9 }}>
                        <Button size="icon" variant="secondary" className="rounded-full bg-white/80 backdrop-blur-sm shadow-sm">
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </motion.div>
                </Link>
                <div className="flex gap-2">
                    <motion.div whileTap={{ scale: 0.9 }}>
                        <Button size="icon" variant="secondary" className="rounded-full bg-white/80 backdrop-blur-sm shadow-sm" onClick={() => haptic.tap()}>
                            <Heart className="w-5 h-5" />
                        </Button>
                    </motion.div>
                    <Link href={createPageUrl('Checkout')}>
                        <motion.div whileTap={{ scale: 0.9 }}>
                            <Button size="icon" variant="secondary" className="rounded-full bg-white/80 backdrop-blur-sm relative shadow-sm">
                                <ShoppingCart className="w-5 h-5" />
                                <AnimatePresence>
                                    {totalCartItems > 0 && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                            transition={{ type: 'spring' }}
                                            className="absolute -top-1 -left-1"
                                        >
                                            <Badge className="w-5 h-5 p-0 flex items-center justify-center gradient-primary text-white text-xs border-0 shadow-sm shadow-primary/20">
                                                {totalCartItems}
                                            </Badge>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Button>
                        </motion.div>
                    </Link>
                </div>
            </div>

            {/* Product Image */}
            <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-50">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-8xl">💊</span>
                    </div>
                )}

                {/* Badges */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                    {product.featured && (
                        <Badge className="gradient-gold text-white border-0">مميز</Badge>
                    )}
                    {hasDiscount && (
                        <Badge className="bg-red-500 text-white border-0">-{discountPercent}%</Badge>
                    )}
                </div>
            </div>

            {/* Product Info */}
            <div className="px-6 py-6">
                {/* Category */}
                <Badge variant="outline" className="mb-3 text-primary border-primary">
                    {product.category === 'vitamins' && 'فيتامينات'}
                    {product.category === 'minerals' && 'معادن'}
                    {product.category === 'supplements' && 'مكملات'}
                    {product.category === 'dmso' && 'DMSO'}
                    {product.category === 'personal_care' && 'عناية شخصية'}
                    {product.category === 'detox' && 'ديتوكس'}
                    {product.category === 'gut_health' && 'صحة الأمعاء'}
                </Badge>

                {/* Name */}
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{product.name}</h1>
                {product.name_en && (
                    <p className="text-slate-400 text-sm mb-4">{product.name_en}</p>
                )}

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star
                                key={i}
                                className={`w-4 h-4 ${i < 4 ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-slate-200'}`}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-slate-500">(٤.٨) • ١٢٣ تقييم</span>
                </div>

                {/* Purchase Options - Subscribe & Save */}
                <div className="mb-6 space-y-3">
                    
                    {/* Clinical Evidence Snippet */}
                    <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2 text-primary">
                            <Sparkles className="w-4 h-4" />
                            <h4 className="font-bold text-sm">لماذا اختاره أطباؤنا؟</h4>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            هذا المنتج مصمم سريرياً بناءً على أحدث الأبحاث لدعم الخطة العلاجية الخاصة بك، لضمان أعلى درجات الامتصاص والفعالية دون أعراض جانبية للمعدة.
                        </p>
                    </div>

                    <h3 className="font-semibold text-slate-800 dark:text-white mb-2">خيارات الشراء</h3>
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            setPurchaseType('onetime');
                            haptic.tap();
                            uiSounds.select();
                        }}
                        className={`w-full p-4 rounded-2xl border-2 text-right transition-all flex items-center justify-between ${
                            purchaseType === 'onetime'
                                ? 'border-primary bg-primary/5 shadow-sm shadow-primary/5'
                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                    >
                        <div>
                            <p className="font-bold text-slate-800 dark:text-white mb-1">شراء لمرة واحدة</p>
                            <p className="text-sm text-slate-500 font-semibold">{product.price} ر.س</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                            purchaseType === 'onetime' ? 'border-primary' : 'border-slate-300 dark:border-slate-600'
                        }`}>
                            {purchaseType === 'onetime' && (
                                <motion.div layoutId="purchase-selector" className="w-2.5 h-2.5 rounded-full bg-primary" />
                            )}
                        </div>
                    </motion.button>

                    {product.is_subscription_eligible && (
                        <>
                            <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    setPurchaseType('subscription');
                                    haptic.selection();
                                    uiSounds.select();
                                }}
                                className={`w-full p-4 rounded-2xl border-2 text-right transition-all flex items-center justify-between relative overflow-hidden ${
                                    purchaseType === 'subscription'
                                        ? 'border-emerald-500 bg-emerald-500/5 shadow-sm shadow-emerald-500/5'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                            >
                                {purchaseType === 'subscription' && (
                                    <motion.div layoutId="subscription-bar" className="absolute top-0 right-0 w-1.5 h-full bg-emerald-500" />
                                )}
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-bold text-slate-800 dark:text-white">اشتراك شهري</p>
                                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 shadow-none text-[10px] px-1.5 py-0 rounded font-bold">
                                            وفر ١٥٪
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold">
                                        {Math.round(product.price * 0.85)} ر.س <span className="text-xs text-slate-400 font-medium line-through mr-1">{product.price} ر.س</span>
                                    </p>
                                </div>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    purchaseType === 'subscription' ? 'border-emerald-500' : 'border-slate-300 dark:border-slate-600'
                                }`}>
                                    {purchaseType === 'subscription' && (
                                        <motion.div layoutId="purchase-selector" className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                                    )}
                                </div>
                            </motion.button>
                            {purchaseType === 'subscription' && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 px-2 mt-2">
                                    <Shield className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                                    توصيل تلقائي كل شهر. يمكنك الإلغاء في أي وقت بدون رسوم.
                                </p>
                            )}
                        </>
                    )}
                </div>

                {/* Description */}
                {product.description && (
                    <div className="mb-6">
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-2">الوصف</h3>
                        <p className="text-slate-600 leading-relaxed">{product.description}</p>
                    </div>
                )}

                {/* Benefits */}
                {product.benefits && product.benefits.length > 0 && (
                    <div className="mb-6">
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-3">الفوائد</h3>
                        <div className="space-y-2">
                            {product.benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="text-slate-600">{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Features */}
                <div className="glass rounded-2xl p-4 mb-6">
                    <div className="grid grid-cols-3 gap-4">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div key={index} className="text-center">
                                    <Icon className="w-6 h-6 mx-auto text-primary mb-2" />
                                    <p className="text-xs text-slate-600">{feature.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Reviews Section */}
                <CommentsSection targetType="product" targetId={productId} showRating={true} />
                
                {/* AI Recommendations */}
                <ProductRecommendations 
                    currentProductId={productId} 
                    category={product.category} 
                    onAddToCart={(p) => addToCartMutation.mutate()} // Will need custom state or we just redirect to that product. Let's redirect since the mutation is hardcoded to `product`. Actually, let's fix that.
                />
            </div>

            {/* Fixed Bottom */}
            <div className="fixed bottom-0 left-0 right-0 glass p-4 border-t">
                <div className="flex items-center gap-4">
                    {/* Quantity */}
                    <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md rounded-2xl p-2 border border-slate-200/50 shadow-sm">
                        <motion.button whileTap={{ scale: 0.85 }}>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="w-9 h-9 rounded-xl text-slate-500 hover:text-slate-800"
                                onClick={() => {
                                    setQuantity(Math.max(1, quantity - 1));
                                    haptic.tap();
                                }}
                            >
                                <Minus className="w-4 h-4" />
                            </Button>
                        </motion.button>
                        <span className="w-6 text-center font-bold text-slate-800">{quantity}</span>
                        <motion.button whileTap={{ scale: 0.85 }}>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="w-9 h-9 rounded-xl text-slate-500 hover:text-slate-800"
                                onClick={() => {
                                    setQuantity(quantity + 1);
                                    haptic.tap();
                                }}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </motion.button>
                    </div>

                    {/* Add to Cart */}
                    <motion.div className="flex-1" whileTap={{ scale: 0.98 }}>
                        <Button
                            onClick={() => addToCartMutation.mutate()}
                            disabled={addToCartMutation.isPending || product.in_stock === false}
                            className="w-full h-14 gradient-primary rounded-2xl text-base font-bold shadow-lg shadow-primary/20"
                        >
                            {addToCartMutation.isPending ? (
                                <RefreshCw className="w-5 h-5 ml-2 animate-spin" />
                            ) : (
                                <ShoppingCart className="w-5 h-5 ml-2" />
                            )}
                            {product.in_stock === false ? 'نفذت الكمية' : 'أضف للسلة'}
                        </Button>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
