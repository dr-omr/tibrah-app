// components/checkout/OrderTracker.tsx
// Beautiful animated order tracking timeline

import React from 'react';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle2, Clock, MapPin, CreditCard, ShoppingBag } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered';

export interface Order {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
    date: string;
    estimatedDelivery?: string;
    couponCode?: string;
    discount?: number;
}

// ============================================
// STATUS STEPS
// ============================================

const orderSteps: Array<{
    status: OrderStatus;
    label: string;
    icon: React.ElementType;
    description: string;
}> = [
        { status: 'pending', label: 'قيد الانتظار', icon: Clock, description: 'تم استلام طلبك' },
        { status: 'confirmed', label: 'تم التأكيد', icon: CreditCard, description: 'تم تأكيد الدفع' },
        { status: 'preparing', label: 'جاري التجهيز', icon: Package, description: 'نجهز طلبك بعناية' },
        { status: 'shipped', label: 'تم الشحن', icon: Truck, description: 'طلبك في الطريق إليك' },
        { status: 'delivered', label: 'تم التوصيل', icon: CheckCircle2, description: 'استلمت طلبك بنجاح' },
    ];

function getStepIndex(status: OrderStatus): number {
    return orderSteps.findIndex(s => s.status === status);
}

// ============================================
// ORDER TRACKER COMPONENT
// ============================================

interface OrderTrackerProps {
    order: Order;
}

export default function OrderTracker({ order }: OrderTrackerProps) {
    const currentStepIndex = getStepIndex(order.status);

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="p-5 bg-gradient-to-l from-[#2D9B83]/5 to-transparent border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-[#2D9B83]" />
                        <h3 className="font-bold text-slate-800 dark:text-white">طلب #{order.orderNumber}</h3>
                    </div>
                    <span className="text-xs text-slate-400">{order.date}</span>
                </div>
                {order.estimatedDelivery && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="w-3 h-3" />
                        <span>التوصيل المتوقع: {order.estimatedDelivery}</span>
                    </div>
                )}
            </div>

            {/* Timeline */}
            <div className="p-5">
                <div className="space-y-0">
                    {orderSteps.map((step, idx) => {
                        const isCompleted = idx <= currentStepIndex;
                        const isCurrent = idx === currentStepIndex;
                        const isLast = idx === orderSteps.length - 1;
                        const Icon = step.icon;

                        return (
                            <div key={step.status} className="flex gap-4">
                                {/* Timeline column */}
                                <div className="flex flex-col items-center">
                                    <motion.div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${isCompleted
                                                ? 'bg-[#2D9B83] shadow-lg shadow-[#2D9B83]/25'
                                                : 'bg-slate-100 dark:bg-slate-700'
                                            }`}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: idx * 0.15, type: 'spring', stiffness: 300 }}
                                    >
                                        <Icon className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                                    </motion.div>
                                    {!isLast && (
                                        <div className="relative w-0.5 h-12 bg-slate-100 dark:bg-slate-700">
                                            <motion.div
                                                className="absolute top-0 left-0 w-full bg-[#2D9B83]"
                                                initial={{ height: 0 }}
                                                animate={{ height: isCompleted ? '100%' : '0%' }}
                                                transition={{ delay: idx * 0.15 + 0.3, duration: 0.4 }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <motion.div
                                    className={`pb-8 ${isLast ? 'pb-0' : ''}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.15 + 0.1 }}
                                >
                                    <p className={`font-semibold text-sm ${isCompleted
                                            ? 'text-slate-800 dark:text-white'
                                            : 'text-slate-400 dark:text-slate-500'
                                        }`}>
                                        {step.label}
                                        {isCurrent && (
                                            <motion.span
                                                className="inline-block mr-2 w-2 h-2 rounded-full bg-[#2D9B83]"
                                                animate={{ opacity: [1, 0.3, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            />
                                        )}
                                    </p>
                                    <p className={`text-xs mt-0.5 ${isCompleted
                                            ? 'text-slate-500 dark:text-slate-400'
                                            : 'text-slate-300 dark:text-slate-600'
                                        }`}>
                                        {step.description}
                                    </p>
                                </motion.div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Order Items Summary */}
            <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-700 pt-4">
                <div className="space-y-2">
                    {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">
                                {item.name} × {item.quantity}
                            </span>
                            <span className="font-medium text-slate-800 dark:text-slate-200">{item.price * item.quantity} ر.س</span>
                        </div>
                    ))}
                    {order.discount && order.discount > 0 && (
                        <div className="flex justify-between text-sm text-emerald-600">
                            <span>خصم كوبون {order.couponCode}</span>
                            <span>-{order.discount} ر.س</span>
                        </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                        <span className="font-bold text-slate-800 dark:text-white">الإجمالي</span>
                        <span className="font-bold text-[#2D9B83]">{order.total} ر.س</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
