import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { createPageUrl } from '../utils';
import {
    ArrowRight, ShoppingCart, Heart, Star, Check,
    Minus, Plus, Truck, Shield, RefreshCw
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import CommentsSection from '../components/common/CommentsSection';

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
}

interface CartItem {
    id: string;
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
    image_url?: string;
}

export default function ProductDetails() {
    const router = useRouter();
    const productId = router.query.id as string;

    // Guard: Wait for router to be ready
    if (!router.isReady) {
        return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-[#2D9B83] border-t-transparent rounded-full"></div></div>;
    }

    const [quantity, setQuantity] = useState(1);
    const queryClient = useQueryClient();

    const { data: product, isLoading } = useQuery<Product | null>({
        queryKey: ['product', productId],
        queryFn: async (): Promise<Product | null> => {
            const products = await db.entities.Product.filter({ id: productId }) as unknown as Product[];
            return products[0] || null;
        },
        enabled: !!productId,
    });

    const { data: cartItems = [] } = useQuery<CartItem[]>({
        queryKey: ['cart'],
        queryFn: async (): Promise<CartItem[]> => {
            return db.entities.CartItem.list() as unknown as CartItem[];
        },
    });

    const addToCartMutation = useMutation({
        mutationFn: async () => {
            const existingItem = cartItems.find((item: CartItem) => item.product_id === productId);
            if (existingItem) {
                return db.entities.CartItem.update(existingItem.id, {
                    quantity: existingItem.quantity + quantity
                });
            }
            return db.entities.CartItem.create({
                product_id: productId,
                product_name: product?.name || '',
                price: product?.price || 0,
                quantity: quantity,
                image_url: product?.image_url || ''
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.success('تمت الإضافة للسلة');
        },
    });

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
                    <Button size="icon" variant="secondary" className="rounded-full bg-white/80 backdrop-blur-sm">
                        <ArrowRight className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="flex gap-2">
                    <Button size="icon" variant="secondary" className="rounded-full bg-white/80 backdrop-blur-sm">
                        <Heart className="w-5 h-5" />
                    </Button>
                    <Link href={createPageUrl('Checkout')}>
                        <Button size="icon" variant="secondary" className="rounded-full bg-white/80 backdrop-blur-sm relative">
                            <ShoppingCart className="w-5 h-5" />
                            {totalCartItems > 0 && (
                                <Badge className="absolute -top-1 -left-1 w-5 h-5 p-0 flex items-center justify-center gradient-primary text-white text-xs border-0">
                                    {totalCartItems}
                                </Badge>
                            )}
                        </Button>
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
                <Badge variant="outline" className="mb-3 text-[#2D9B83] border-[#2D9B83]">
                    {product.category === 'vitamins' && 'فيتامينات'}
                    {product.category === 'minerals' && 'معادن'}
                    {product.category === 'supplements' && 'مكملات'}
                    {product.category === 'dmso' && 'DMSO'}
                    {product.category === 'personal_care' && 'عناية شخصية'}
                    {product.category === 'detox' && 'ديتوكس'}
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

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                    <span className="text-3xl font-bold text-[#2D9B83]">{product.price}</span>
                    <span className="text-lg text-slate-500">ر.س</span>
                    {hasDiscount && (
                        <span className="text-lg text-slate-400 line-through">{product.original_price} ر.س</span>
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
                                    <Icon className="w-6 h-6 mx-auto text-[#2D9B83] mb-2" />
                                    <p className="text-xs text-slate-600">{feature.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Reviews Section */}
                <CommentsSection targetType="product" targetId={productId} showRating={true} />
            </div>

            {/* Fixed Bottom */}
            <div className="fixed bottom-0 left-0 right-0 glass p-4 border-t">
                <div className="flex items-center gap-4">
                    {/* Quantity */}
                    <div className="flex items-center gap-3 glass rounded-xl p-2">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="w-8 h-8"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                            <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{quantity}</span>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="w-8 h-8"
                            onClick={() => setQuantity(quantity + 1)}
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Add to Cart */}
                    <Button
                        onClick={() => addToCartMutation.mutate()}
                        disabled={addToCartMutation.isPending || product.in_stock === false}
                        className="flex-1 h-14 gradient-primary rounded-2xl text-lg font-bold"
                    >
                        <ShoppingCart className="w-5 h-5 ml-2" />
                        {product.in_stock === false ? 'نفذت الكمية' : 'أضف للسلة'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
