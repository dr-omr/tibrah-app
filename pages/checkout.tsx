import React, { useState } from 'react';
import { db } from '@/lib/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { createPageUrl } from '../utils';
import {
    ArrowRight, Trash2, Plus, Minus, ShoppingBag,
    MessageCircle, CreditCard, Check, Tag, Sparkles, Clock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import YemeniPaymentGateways, { PaymentMethodType } from '@/components/checkout/YemeniPaymentGateways';
import ManualPaymentModal from '@/components/checkout/ManualPaymentModal';
import { useAuth } from '@/contexts/AuthContext';
import CouponInput, { Coupon } from '@/components/checkout/CouponInput';
import { motion, AnimatePresence } from 'framer-motion';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';

interface CartItem {
    id: string;
    product_id: string;
    product_name: string;
    price: number;
    quantity: number;
    image_url?: string;
    is_subscription?: boolean;
}

export default function Checkout() {
    const [checkoutComplete, setCheckoutComplete] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | undefined>();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [discount, setDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: cartItems = [], isLoading } = useQuery<CartItem[]>({
        queryKey: ['cart', user?.id],
        queryFn: () => db.entities.CartItem.listForUser(user?.id || '') as unknown as Promise<CartItem[]>,
        enabled: !!user?.id,
    });

    const updateQuantityMutation = useMutation({
        mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
            if (quantity <= 0) {
                await db.entities.CartItem.delete(id);
                return;
            }
            await db.entities.CartItem.update(id, { quantity });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });

    const deleteItemMutation = useMutation({
        mutationFn: (id: string) => db.entities.CartItem.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            haptic.impact();
            uiSounds.tap();
            toast.success('تم حذف المنتج', { icon: '🗑️' });
        },
    });

    const clearCartMutation = useMutation({
        mutationFn: async () => {
            await Promise.all(cartItems.map(item => db.entities.CartItem.delete(item.id)));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });

    const subtotal = cartItems.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal >= 200 ? 0 : 25;
    const total = Math.max(0, subtotal + shipping - discount);

    const handleCouponApply = (newDiscount: number, coupon: Coupon | null) => {
        setDiscount(newDiscount);
        setAppliedCoupon(coupon);
    };

    const getUserStr = () => {
        if (!user) return "";
        return `\n👤 العميل: ${user.displayName || user.name || 'مجهول'}\n📞 الهاتف: ${user.phone || 'غير مسجل'}`;
    };

    const saveOrder = async (paymentMethod: string, transactionId?: string) => {
        try {
            await db.entities.Order.createForUser(user?.id || '', {
                user_id: user?.id || 'guest',
                user_name: user?.displayName || user?.name || 'ضيف',
                user_phone: user?.phone || '',
                items: cartItems.map((item: CartItem) => ({
                    product_id: item.product_id,
                    product_name: item.product_name,
                    price: item.price,
                    quantity: item.quantity,
                    image_url: item.image_url || '',
                })),
                subtotal,
                shipping,
                discount,
                total,
                coupon_code: appliedCoupon?.code || '',
                payment_method: paymentMethod,
                transaction_id: transactionId || '',
                status: 'pending' as const,
            });

            // Reward points: 1 point per 10 SAR
            if (typeof window !== 'undefined') {
                const pointsEarned = Math.floor(total / 10);
                if (pointsEarned > 0) {
                    const saved = JSON.parse(localStorage.getItem('tibrahRewards') || '{}');
                    const newPoints = (saved.points || 0) + pointsEarned;
                    localStorage.setItem('tibrahRewards', JSON.stringify({ ...saved, points: newPoints }));
                    setTimeout(() => {
                        toast.success(`🎉 كسبت ${pointsEarned} نقطة مكافأة لإتمامك هذا الطلب!`);
                    }, 1000);
                }
            }
        } catch (e) {
            console.error('Failed to save order:', e);
        }
    };

    const handleWhatsAppOrder = async () => {
        const orderText = cartItems.map((item: CartItem) =>
            `- ${item.product_name} ${item.is_subscription ? '(اشتراك شهري)' : ''} × ${item.quantity} = ${item.price * item.quantity} ر.س`
        ).join('\n');

        const couponText = appliedCoupon ? `\n🏷️ كوبون: ${appliedCoupon.code} (خصم ${discount} ر.س)` : '';
        const message = `🛒 طلب جديد من تطبيق طِبرَا\n\n${orderText}${couponText}\n\n💰 المجموع: ${total} ر.س\n📌 طريقة الدفع: عند الاستلام${getUserStr()}`;
        window.open(`https://wa.me/967771447111?text=${encodeURIComponent(message)}`, '_blank');
        await saveOrder('الدفع عند الاستلام');
        clearCartMutation.mutate();
        setCheckoutComplete(true);
        haptic.success();
        uiSounds.success();
    };

    const handlePaymentConfirm = async (transactionId: string) => {
        setIsPaymentModalOpen(false);

        const orderText = cartItems.map((item: CartItem) =>
            `- ${item.product_name} ${item.is_subscription ? '(اشتراك شهري)' : ''} × ${item.quantity} = ${item.price * item.quantity} ر.س`
        ).join('\n');

        const couponText = appliedCoupon ? `\n🏷️ كوبون: ${appliedCoupon.code} (خصم ${discount} ر.س)` : '';
        const message = `✅ *تأكيد دفع إلكتروني - طِبرَا*\n\n💳 المحفظة: ${selectedMethod}\n🔢 رقم العملية: ${transactionId}\n💰 المبلغ: ${total} ر.س${couponText}\n\n🛒 الطلب:\n${orderText}${getUserStr()}`;

        window.open(`https://wa.me/967771447111?text=${encodeURIComponent(message)}`, '_blank');

        await saveOrder(selectedMethod || 'دفع إلكتروني', transactionId);
        clearCartMutation.mutate();
        setCheckoutComplete(true);
        haptic.success();
        uiSounds.success();
    };

    if (checkoutComplete) {
        // Calculate earned points from last order
        const earnedPoints = Math.floor(total * 2);
        const savedRewards = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('tibrahRewards') || '{}') : {};
        const currentBalance = savedRewards.points || 0;

        const timelineSteps = [
            { label: 'تم تأكيد الطلب', time: 'الآن', done: true },
            { label: 'جاري تجهيز الطلب', time: 'قريباً', done: false },
            { label: 'في الطريق إليك', time: '', done: false },
            { label: 'تم التسليم', time: '', done: false },
        ];

        return (
            <div className="min-h-screen px-6 py-8">
                {/* Success Animation */}
                <motion.div 
                    initial={{ scale: 0, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    transition={{ type: 'spring', damping: 15 }}
                    className="w-20 h-20 mx-auto mb-5 rounded-full gradient-primary flex items-center justify-center shadow-glow"
                >
                    <Check className="w-10 h-10 text-white" />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-1 text-center">تم استلام طلبك بنجاح! 🎉</h2>
                    <p className="text-sm text-slate-500 text-center mb-6">تم إرسال تفاصيل الدفع والطلب عبر واتساب</p>
                </motion.div>

                {/* Order Timeline */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 mb-4 shadow-sm"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">حالة الطلب</h3>
                    </div>
                    <div className="space-y-0">
                        {timelineSteps.map((step, i) => (
                            <div key={i} className="flex items-start gap-3">
                                <div className="flex flex-col items-center">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                        step.done 
                                            ? 'bg-primary text-white' 
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                                    }`}>
                                        {step.done ? <Check className="w-3.5 h-3.5" /> : <span className="text-[10px] font-bold">{i + 1}</span>}
                                    </div>
                                    {i < timelineSteps.length - 1 && (
                                        <div className={`w-0.5 h-8 ${step.done ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                    )}
                                </div>
                                <div className="pt-0.5">
                                    <p className={`text-[13px] font-bold ${step.done ? 'text-slate-800 dark:text-white' : 'text-slate-400'}`}>{step.label}</p>
                                    {step.time && <p className="text-[11px] text-slate-400">{step.time}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Earned Points Banner */}
                {earnedPoints > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.7 }}
                        className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-800 mb-4 flex items-center gap-3"
                    >
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-[13px] font-bold text-amber-800 dark:text-amber-300">كسبت {earnedPoints} نقطة مكافأة!</p>
                            <p className="text-[11px] text-amber-600 dark:text-amber-400">رصيدك الجديد: {currentBalance} نقطة</p>
                        </div>
                    </motion.div>
                )}

                {/* WhatsApp Support */}
                <motion.a 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.9 }}
                    href="https://wa.me/967771447111?text=استفسار%20عن%20طلبي%20الأخير" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-[#25D366]/10 text-[#25D366] font-bold text-[13px] border border-[#25D366]/20 mb-4"
                >
                    <MessageCircle className="w-4 h-4" /> تواصل مع الدعم عبر واتساب
                </motion.a>

                {/* Continue Shopping */}
                <Link href={createPageUrl('Shop')}>
                    <Button className="gradient-primary rounded-2xl px-8 w-full py-3">
                        متابعة التسوق
                    </Button>
                </Link>
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
                    <h1 className="text-lg font-bold text-slate-800 dark:text-white">سلة التسوق</h1>
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
                            تصفح الصيدلية
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
                                        <h3 className="font-semibold text-slate-800 dark:text-white line-clamp-2">
                                            {item.product_name}
                                        </h3>
                                        {item.is_subscription && (
                                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-0 text-[10px] mt-1 px-1.5 py-0 rounded font-bold">
                                                اشتراك شهري
                                            </Badge>
                                        )}
                                        <p className="text-primary font-bold mt-1">
                                            {item.price} ر.س
                                        </p>
                                    </div>

                                    {/* Delete */}
                                    <motion.button whileTap={{ scale: 0.85 }}>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => deleteItemMutation.mutate(item.id)}
                                            className="text-red-400 hover:text-red-500 -mt-1"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    </motion.button>
                                </div>

                                {/* Quantity */}
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                    <span className="text-sm text-slate-500">الكمية</span>
                                    <div className="flex items-center gap-3">
                                        <motion.button whileTap={{ scale: 0.85 }}>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="w-8 h-8 rounded-lg"
                                                onClick={() => {
                                                    updateQuantityMutation.mutate({
                                                        id: item.id,
                                                        quantity: item.quantity - 1
                                                    });
                                                    haptic.tap();
                                                }}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>
                                        </motion.button>
                                        <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                        <motion.button whileTap={{ scale: 0.85 }}>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                className="w-8 h-8 rounded-lg"
                                                onClick={() => {
                                                    updateQuantityMutation.mutate({
                                                        id: item.id,
                                                        quantity: item.quantity + 1
                                                    });
                                                    haptic.tap();
                                                }}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Payment Methods */}
                    <div className="px-6 mt-6">
                        <h3 className="font-bold text-slate-800 dark:text-white mb-3">اختر طريقة الدفع</h3>
                        <YemeniPaymentGateways
                            onSelect={setSelectedMethod}
                            selectedMethod={selectedMethod}
                        />
                    </div>

                    <div className="px-6 mt-4">
                        <div className="glass rounded-2xl p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white mb-4">ملخص الطلب</h3>

                            {/* Coupon Input */}
                            <div className="mb-4">
                                <CouponInput
                                    subtotal={subtotal}
                                    onApply={handleCouponApply}
                                    appliedCoupon={appliedCoupon}
                                />
                            </div>

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
                                {discount > 0 && (
                                    <div className="flex justify-between text-emerald-600">
                                        <span className="flex items-center gap-1">
                                            <Tag className="w-3 h-3" />
                                            خصم الكوبون
                                        </span>
                                        <span className="font-medium">-{discount} ر.س</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-3 border-t">
                                    <span className="font-bold text-slate-800 dark:text-white">الإجمالي</span>
                                    <span className="text-xl font-bold text-primary">{total} ر.س</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Fixed Bottom */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 glass p-4 border-t z-30">
                    <div className="space-y-3">
                        {selectedMethod ? (
                            <motion.div whileTap={{ scale: 0.98 }}>
                                <Button
                                    onClick={() => {
                                        setIsPaymentModalOpen(true);
                                        haptic.selection();
                                    }}
                                    className="w-full h-14 bg-primary hover:bg-primary/90 rounded-2xl text-lg font-bold shadow-lg shadow-green-500/20"
                                >
                                    <CreditCard className="w-5 h-5 ml-2" />
                                    دفع إلكتروني ({total} ر.س)
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div whileTap={{ scale: 0.98 }}>
                                <Button
                                    onClick={() => {
                                        handleWhatsAppOrder();
                                        haptic.selection();
                                    }}
                                    className="w-full h-14 bg-slate-800 hover:bg-slate-900 rounded-2xl text-lg font-bold shadow-lg shadow-slate-800/20"
                                >
                                    <MessageCircle className="w-5 h-5 ml-2" />
                                    الدفع عند الاستلام
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </div>
            )}

            {selectedMethod && (
                <ManualPaymentModal
                    isOpen={isPaymentModalOpen}
                    onClose={() => setIsPaymentModalOpen(false)}
                    method={selectedMethod}
                    amount={total}
                    onConfirm={handlePaymentConfirm}
                />
            )}
        </div>
    );
}
