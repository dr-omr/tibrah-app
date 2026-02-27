// components/checkout/CouponInput.tsx
// Animated coupon code input with validation

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, X, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// ============================================
// COUPONS DATABASE
// ============================================

export interface Coupon {
    code: string;
    type: 'percentage' | 'fixed';
    value: number; // % or flat amount in SAR
    minOrder: number;
    maxDiscount?: number;
    label: string;
    emoji: string;
    expiresAt?: string; // ISO date
}

// Available coupons (in production, fetch from Firestore)
const AVAILABLE_COUPONS: Coupon[] = [
    { code: 'TIBRAH10', type: 'percentage', value: 10, minOrder: 50, label: 'خصم 10%', emoji: '🎉' },
    { code: 'WELCOME', type: 'percentage', value: 15, minOrder: 100, maxDiscount: 50, label: 'خصم ترحيبي 15%', emoji: '👋' },
    { code: 'FREESHIP', type: 'fixed', value: 25, minOrder: 0, label: 'شحن مجاني', emoji: '🚚' },
    { code: 'HEALTH20', type: 'percentage', value: 20, minOrder: 200, maxDiscount: 100, label: 'خصم صحي 20%', emoji: '💚' },
    { code: 'VIP50', type: 'fixed', value: 50, minOrder: 300, label: 'خصم VIP ثابت', emoji: '⭐' },
];

export function validateCoupon(code: string, subtotal: number): { valid: boolean; coupon?: Coupon; discount: number; message: string } {
    const normalizedCode = code.trim().toUpperCase();
    const coupon = AVAILABLE_COUPONS.find(c => c.code === normalizedCode);

    if (!coupon) {
        return { valid: false, discount: 0, message: 'كود الخصم غير صحيح' };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return { valid: false, discount: 0, message: 'انتهت صلاحية هذا الكوبون' };
    }

    if (subtotal < coupon.minOrder) {
        return { valid: false, discount: 0, message: `الحد الأدنى للطلب ${coupon.minOrder} ر.س` };
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
        discount = Math.round(subtotal * (coupon.value / 100));
        if (coupon.maxDiscount) {
            discount = Math.min(discount, coupon.maxDiscount);
        }
    } else {
        discount = coupon.value;
    }

    return {
        valid: true,
        coupon,
        discount,
        message: `${coupon.emoji} ${coupon.label} — وفرت ${discount} ر.س!`
    };
}

// ============================================
// COUPON INPUT COMPONENT
// ============================================

interface CouponInputProps {
    subtotal: number;
    onApply: (discount: number, coupon: Coupon | null) => void;
    appliedCoupon: Coupon | null;
}

export default function CouponInput({ subtotal, onApply, appliedCoupon }: CouponInputProps) {
    const [code, setCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    const handleApply = async () => {
        if (!code.trim()) return;
        setIsValidating(true);
        setError('');

        // Simulate network delay for UX
        await new Promise(r => setTimeout(r, 600));

        const result = validateCoupon(code, subtotal);
        setIsValidating(false);

        if (result.valid && result.coupon) {
            onApply(result.discount, result.coupon);
            toast.success(result.message);
            setCode('');
            setIsExpanded(false);
        } else {
            setError(result.message);
            toast.error(result.message);
        }
    };

    const handleRemove = () => {
        onApply(0, null);
        setCode('');
        toast.info('تم إزالة كود الخصم');
    };

    // If coupon is already applied
    if (appliedCoupon) {
        return (
            <motion.div
                className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 flex items-center justify-between"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                layout
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">{appliedCoupon.code}</span>
                            <span className="text-emerald-600 dark:text-emerald-500 text-xs">{appliedCoupon.emoji} {appliedCoupon.label}</span>
                        </div>
                        <p className="text-xs text-emerald-500 dark:text-emerald-600 mt-0.5">
                            {appliedCoupon.type === 'percentage' ? `خصم ${appliedCoupon.value}%` : `خصم ${appliedCoupon.value} ر.س`}
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    className="text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl h-8 w-8 p-0"
                >
                    <X className="w-4 h-4" />
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="space-y-2">
            {/* Toggle button */}
            {!isExpanded && (
                <motion.button
                    className="flex items-center gap-2 text-sm text-[#2D9B83] font-medium hover:text-[#258570] transition-colors py-1"
                    onClick={() => setIsExpanded(true)}
                    whileTap={{ scale: 0.97 }}
                >
                    <Tag className="w-4 h-4" />
                    عندك كود خصم؟
                    <Sparkles className="w-3 h-3" />
                </motion.button>
            )}

            {/* Input form */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        className="flex gap-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: 'spring', damping: 20 }}
                    >
                        <div className="flex-1 relative">
                            <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                value={code}
                                onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                                placeholder="أدخل كود الخصم..."
                                className={`pr-10 h-11 rounded-xl uppercase font-mono tracking-wider bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 ${error ? 'border-red-300 dark:border-red-800' : 'focus:border-[#2D9B83]'}`}
                                dir="ltr"
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                            />
                        </div>
                        <Button
                            onClick={handleApply}
                            disabled={!code.trim() || isValidating}
                            className="h-11 px-5 rounded-xl bg-[#2D9B83] hover:bg-[#258570] text-white font-semibold"
                        >
                            {isValidating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                'تطبيق'
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setIsExpanded(false); setError(''); setCode(''); }}
                            className="h-11 w-11 rounded-xl text-slate-400"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error message */}
            <AnimatePresence>
                {error && (
                    <motion.p
                        className="text-xs text-red-500 px-1"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        ⚠️ {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
