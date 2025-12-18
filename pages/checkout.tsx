import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { createPageUrl } from '../utils';
import {
    ArrowRight, Trash2, Plus, Minus, ShoppingBag,
    MessageCircle, CreditCard, Truck, Check
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface CartItem {
    id: string;
    product_name: string;
    price: number;
    quantity: number;
    image_url?: string;
}

export default function Checkout() {
    const [checkoutComplete, setCheckoutComplete] = useState(false);
    const queryClient = useQueryClient();

    const { data: cartItems = [], isLoading } = useQuery<CartItem[]>({
        queryKey: ['cart'],
        queryFn: () => base44.entities.CartItem.list() as Promise<CartItem[]>,
    });

    const updateQuantityMutation = useMutation({
        mutationFn: ({ id, quantity }: { id: string; quantity: number }) => {
            if (quantity <= 0) {
                return base44.entities.CartItem.delete(id);
            }
            return base44.entities.CartItem.update(id, { quantity });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });

    const deleteItemMutation = useMutation({
        mutationFn: (id: string) => base44.entities.CartItem.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.success('تم حذف المنتج');
        },
    });

    const clearCartMutation = useMutation({
        mutationFn: async () => {
            await Promise.all(cartItems.map(item => base44.entities.CartItem.delete(item.id)));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });

    const subtotal = cartItems.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 200 ? 0 : 25;
    const total = subtotal + shipping;

    const handleWhatsAppOrder = () => {
        const orderText = cartItems.map((item: CartItem) =>
            `- ${item.product_name} × ${item.quantity} = ${item.price * item.quantity} ر.س`
        ).join('\n');

        const message = `🛒 طلب جديد من تطبيق طِبرَا\n\n${orderText}\n\n💰 المجموع: ${total} ر.س`;
        window.open(`https://wa.me/967771447111?text=${encodeURIComponent(message)}`, '_blank');
        clearCartMutation.mutate();
        setCheckoutComplete(true);
    };

    if (checkoutComplete) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full gradient-primary flex items-center justify-center shadow-glow animate-breathe">
                        <Check className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">تم إرسال طلبك!</h2>
                    <p className="text-slate-500 mb-8">سنتواصل معك عبر واتساب لتأكيد الطلب</p>
                    <Link href={createPageUrl('Shop')}>
                        <Button className="gradient-primary rounded-2xl px-8">
                            متابعة التسوق
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-40">
            {/* Header */}
            <div className="sticky top-0 z-20 glass px-6 py-4">
                <div className="flex items-center gap-4">
                    <Link href={createPageUrl('Shop')}>
                        <Button size="icon" variant="ghost">
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                    <h1 className="text-lg font-bold text-slate-800">سلة التسوق</h1>
                    <span className="text-sm text-slate-500">({cartItems.length} منتج)</span>
                </div>
            </div>

            {isLoading ? (
                <div className="px-6 py-8 space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="glass rounded-2xl h-24 animate-pulse" />
                    ))}
                </div>
            ) : cartItems.length === 0 ? (
                <div className="text-center py-16 px-6">
                    <ShoppingBag className="w-20 h-20 mx-auto text-slate-300 mb-4" />
                    <h2 className="text-xl font-bold text-slate-600 mb-2">السلة فارغة</h2>
                    <p className="text-slate-400 mb-6">أضف منتجات لبدء التسوق</p>
                    <Link href={createPageUrl('Shop')}>
                        <Button className="gradient-primary rounded-2xl px-8">
                            تصفح المتجر
                        </Button>
                    </Link>
                </div>
            ) : (
                <>
                    {/* Cart Items */}
                    <div className="px-6 py-4 space-y-4">
                        {cartItems.map((item) => (
                            <div key={item.id} className="glass rounded-2xl p-4">
                                <div className="flex gap-4">
                                    {/* Image */}
                                    <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                                        {item.image_url ? (
                                            <img
                                                src={item.image_url}
                                                alt={item.product_name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl">
                                                💊
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-800 line-clamp-2">
                                            {item.product_name}
                                        </h3>
                                        <p className="text-[#2D9B83] font-bold mt-1">
                                            {item.price} ر.س
                                        </p>
                                    </div>

                                    {/* Delete */}
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => deleteItemMutation.mutate(item.id)}
                                        className="text-red-400 hover:text-red-500 -mt-1"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>

                                {/* Quantity */}
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                    <span className="text-sm text-slate-500">الكمية</span>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="w-8 h-8 rounded-lg"
                                            onClick={() => updateQuantityMutation.mutate({
                                                id: item.id,
                                                quantity: item.quantity - 1
                                            })}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="w-8 h-8 rounded-lg"
                                            onClick={() => updateQuantityMutation.mutate({
                                                id: item.id,
                                                quantity: item.quantity + 1
                                            })}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Promo Code */}
                    <div className="px-6 mb-4">
                        <div className="glass rounded-2xl p-4 flex gap-3">
                            <Input
                                placeholder="كود الخصم"
                                className="flex-1 border-0 bg-white/50"
                            />
                            <Button variant="outline" className="border-[#2D9B83] text-[#2D9B83]">
                                تطبيق
                            </Button>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="px-6">
                        <div className="glass rounded-2xl p-6">
                            <h3 className="font-bold text-slate-800 mb-4">ملخص الطلب</h3>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">المجموع الفرعي</span>
                                    <span className="font-medium">{subtotal} ر.س</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">الشحن</span>
                                    <span className={`font-medium ${shipping === 0 ? 'text-green-500' : ''}`}>
                                        {shipping === 0 ? 'مجاني' : `${shipping} ر.س`}
                                    </span>
                                </div>
                                {subtotal < 200 && (
                                    <p className="text-xs text-slate-400">
                                        أضف {200 - subtotal} ر.س للشحن المجاني
                                    </p>
                                )}
                                <div className="flex justify-between pt-3 border-t">
                                    <span className="font-bold text-slate-800">الإجمالي</span>
                                    <span className="text-xl font-bold text-[#2D9B83]">{total} ر.س</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Fixed Bottom */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 glass p-4 border-t">
                    <div className="space-y-3">
                        <Button
                            onClick={handleWhatsAppOrder}
                            className="w-full h-14 bg-green-500 hover:bg-green-600 rounded-2xl text-lg font-bold"
                        >
                            <MessageCircle className="w-5 h-5 ml-2" />
                            طلب عبر واتساب
                        </Button>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1 h-12 rounded-xl"
                                disabled
                            >
                                <CreditCard className="w-4 h-4 ml-2" />
                                الدفع الإلكتروني
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 h-12 rounded-xl"
                                disabled
                            >
                                <Truck className="w-4 h-4 ml-2" />
                                الدفع عند الاستلام
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
