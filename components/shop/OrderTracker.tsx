// components/shop/OrderTracker.tsx
// Order tracking with step progress for completed orders

import React from 'react';
import { motion } from 'framer-motion';
import {
    Package, Truck, CheckCircle2, Clock, MapPin,
    Phone, MessageCircle
} from 'lucide-react';

interface OrderStep {
    id: string;
    label: string;
    icon: React.ElementType;
    completed: boolean;
    active: boolean;
    time?: string;
}

interface OrderTrackerProps {
    orderId: string;
    status: 'pending' | 'confirmed' | 'preparing' | 'shipped' | 'delivered';
    customerName?: string;
    orderDate?: string;
    estimatedDelivery?: string;
    total?: number;
    onWhatsApp?: () => void;
}

export default function OrderTracker({
    orderId, status, customerName, orderDate,
    estimatedDelivery, total, onWhatsApp
}: OrderTrackerProps) {

    const statusIndex = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered'].indexOf(status);

    const steps: OrderStep[] = [
        { id: 'pending', label: 'تم الطلب', icon: Clock, completed: statusIndex > 0, active: statusIndex === 0, time: orderDate },
        { id: 'confirmed', label: 'تم التأكيد', icon: CheckCircle2, completed: statusIndex > 1, active: statusIndex === 1 },
        { id: 'preparing', label: 'جاري التحضير', icon: Package, completed: statusIndex > 2, active: statusIndex === 2 },
        { id: 'shipped', label: 'تم الشحن', icon: Truck, completed: statusIndex > 3, active: statusIndex === 3 },
        { id: 'delivered', label: 'تم التوصيل', icon: MapPin, completed: statusIndex === 4, active: statusIndex === 4, time: estimatedDelivery },
    ];

    return (
        <motion.div
            className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            {/* Header */}
            <div className="bg-gradient-to-l from-emerald-500 to-emerald-600 p-4 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-white/70">رقم الطلب</p>
                        <p className="font-bold text-lg">#{orderId}</p>
                    </div>
                    {total && (
                        <div className="text-left">
                            <p className="text-xs text-white/70">الإجمالي</p>
                            <p className="font-bold text-lg">{total} ر.س</p>
                        </div>
                    )}
                </div>
                {customerName && (
                    <p className="text-sm text-white/80 mt-1">مرحباً {customerName} 👋</p>
                )}
            </div>

            {/* Progress Steps */}
            <div className="p-5">
                <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-5 right-5 left-5 h-0.5 bg-slate-200 dark:bg-slate-700" />
                    <motion.div
                        className="absolute top-5 right-5 h-0.5 bg-emerald-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(0, statusIndex / 4) * 100}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                    />

                    {/* Steps */}
                    <div className="relative flex justify-between">
                        {steps.map((step, idx) => {
                            const Icon = step.icon;
                            const isComplete = step.completed;
                            const isActive = step.active;

                            return (
                                <motion.div
                                    key={step.id}
                                    className="flex flex-col items-center gap-2"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.15 }}
                                >
                                    <motion.div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center z-10 ${isComplete ? 'bg-emerald-500 text-white' :
                                                isActive ? 'bg-emerald-100 text-emerald-600 ring-2 ring-emerald-500' :
                                                    'bg-slate-100 dark:bg-slate-700 text-slate-400'
                                            }`}
                                        animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                                        transition={isActive ? { repeat: Infinity, duration: 2 } : {}}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </motion.div>
                                    <span className={`text-[10px] font-medium text-center whitespace-nowrap ${isComplete || isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'
                                        }`}>
                                        {step.label}
                                    </span>
                                    {step.time && (
                                        <span className="text-[9px] text-slate-400">{step.time}</span>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="px-5 pb-5 flex gap-3">
                {onWhatsApp && (
                    <motion.button
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium text-sm"
                        whileTap={{ scale: 0.95 }}
                        onClick={onWhatsApp}
                    >
                        <MessageCircle className="w-4 h-4" />
                        تواصل عبر واتساب
                    </motion.button>
                )}
                <motion.a
                    href="tel:+967777144711"
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium text-sm"
                    whileTap={{ scale: 0.95 }}
                >
                    <Phone className="w-4 h-4" />
                    اتصل
                </motion.a>
            </div>
        </motion.div>
    );
}
