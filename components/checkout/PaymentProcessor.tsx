/**
 * PaymentProcessor — Unified payment component for Tibrah
 * Supports: WhatsApp transfer, bank transfer, and future payment gateways
 * Used by both shop checkout and appointment booking
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    CreditCard, Smartphone, Building2, MessageCircle, Copy,
    Check, Shield, Clock, ArrowLeft, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/notification-engine';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type PaymentMethod = 'whatsapp' | 'bank_transfer' | 'mobile_wallet';

export interface PaymentDetails {
    amount: number;
    currency: 'SAR' | 'YER';
    description: string;
    items?: { name: string; price: number; quantity: number }[];
    customerName?: string;
    customerPhone?: string;
}

interface PaymentProcessorProps {
    payment: PaymentDetails;
    onComplete: (transactionId: string, method: PaymentMethod) => void;
    onCancel?: () => void;
    whatsappNumber?: string;
}

// ═══════════════════════════════════════════════════════════════
// BANK ACCOUNTS DATA
// ═══════════════════════════════════════════════════════════════

const bankAccounts = [
    {
        id: 'alhilal',
        name: 'بنك الهلال',
        accountName: 'عمر العماد',
        accountNumber: 'XXXX-XXXX-XXXX',
        icon: '🏦',
    },
    {
        id: 'alrajhi',
        name: 'مصرف الراجحي',
        accountName: 'عمر العماد',
        iban: 'SAXX XXXX XXXX XXXX',
        icon: '🏛️',
    },
];

const mobileWallets = [
    { id: 'jawali', name: 'جوالي', number: '771447111', icon: '📱' },
    { id: 'floosak', name: 'فلوسك', number: '771447111', icon: '💳' },
];

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function PaymentProcessor({
    payment,
    onComplete,
    onCancel,
    whatsappNumber = '967771447111',
}: PaymentProcessorProps) {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
    const [transactionId, setTransactionId] = useState('');
    const [step, setStep] = useState<'select' | 'details' | 'confirm'>('select');
    const [copied, setCopied] = useState<string | null>(null);

    const currencyLabel = payment.currency === 'SAR' ? 'ر.س' : 'ر.ي';

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        toast.success('تم النسخ');
        setTimeout(() => setCopied(null), 2000);
    };

    const handleWhatsAppPayment = () => {
        const itemsList = payment.items
            ? payment.items.map(i => `${i.name} × ${i.quantity}`).join('\n')
            : payment.description;

        const message = encodeURIComponent(
            `💰 طلب دفع — طِبرَا\n\n` +
            `📋 ${itemsList}\n` +
            `💵 المبلغ: ${payment.amount} ${currencyLabel}\n` +
            `👤 ${payment.customerName || 'عميل'}\n` +
            `📱 ${payment.customerPhone || ''}\n\n` +
            `أريد تأكيد الدفع`
        );

        window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');

        // Generate a temp transaction ID
        const txId = `WA-${Date.now().toString(36).toUpperCase()}`;
        onComplete(txId, 'whatsapp');
    };

    const handleConfirmTransfer = () => {
        if (!transactionId.trim()) {
            toast.error('يرجى إدخال رقم العملية');
            return;
        }
        onComplete(transactionId, selectedMethod!);
    };

    const methods: { id: PaymentMethod; label: string; icon: React.ReactNode; desc: string }[] = [
        {
            id: 'whatsapp',
            label: 'الدفع عبر واتساب',
            icon: <MessageCircle className="w-6 h-6 text-green-500" />,
            desc: 'الأسرع — تواصل مباشر مع الدعم',
        },
        {
            id: 'bank_transfer',
            label: 'تحويل بنكي',
            icon: <Building2 className="w-6 h-6 text-blue-500" />,
            desc: 'حوّل للحساب البنكي وأرسل الإيصال',
        },
        {
            id: 'mobile_wallet',
            label: 'محفظة إلكترونية',
            icon: <Smartphone className="w-6 h-6 text-purple-500" />,
            desc: 'جوالي، فلوسك، وغيرها',
        },
    ];

    return (
        <div className="space-y-6" dir="rtl">
            {/* Order Summary */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-slate-500 dark:text-slate-400 text-sm">المبلغ الإجمالي</span>
                    <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-600">دفع آمن</span>
                    </div>
                </div>
                <p className="text-3xl font-bold text-slate-800 dark:text-white">
                    {payment.amount} <span className="text-lg text-slate-500">{currencyLabel}</span>
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{payment.description}</p>
            </div>

            <AnimatePresence mode="wait">
                {/* Step 1: Select Method */}
                {step === 'select' && (
                    <motion.div
                        key="select"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-3"
                    >
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">اختر طريقة الدفع</h3>

                        {methods.map((method) => (
                            <button
                                key={method.id}
                                onClick={() => {
                                    setSelectedMethod(method.id);
                                    if (method.id === 'whatsapp') {
                                        handleWhatsAppPayment();
                                    } else {
                                        setStep('details');
                                    }
                                }}
                                className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all duration-200 ${selectedMethod === method.id
                                        ? 'bg-[#2D9B83]/10 ring-2 ring-[#2D9B83]'
                                        : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700'
                                    }`}
                            >
                                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                    {method.icon}
                                </div>
                                <div className="flex-1 text-right">
                                    <p className="font-bold text-slate-800 dark:text-white">{method.label}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{method.desc}</p>
                                </div>
                                <ArrowLeft className="w-5 h-5 text-slate-300" />
                            </button>
                        ))}
                    </motion.div>
                )}

                {/* Step 2: Payment Details */}
                {step === 'details' && selectedMethod === 'bank_transfer' && (
                    <motion.div
                        key="bank"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">تفاصيل التحويل البنكي</h3>

                        {bankAccounts.map((bank) => (
                            <div key={bank.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl">{bank.icon}</span>
                                    <p className="font-bold text-slate-800 dark:text-white">{bank.name}</p>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 rounded-xl px-3 py-2">
                                        <span className="text-sm text-slate-500">اسم الحساب</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{bank.accountName}</span>
                                            <button onClick={() => copyToClipboard(bank.accountName, `${bank.id}-name`)}>
                                                {copied === `${bank.id}-name` ? (
                                                    <Check className="w-4 h-4 text-green-500" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    {bank.accountNumber && (
                                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 rounded-xl px-3 py-2">
                                            <span className="text-sm text-slate-500">رقم الحساب</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium font-mono" dir="ltr">{bank.accountNumber}</span>
                                                <button onClick={() => copyToClipboard(bank.accountNumber!, `${bank.id}-num`)}>
                                                    {copied === `${bank.id}-num` ? (
                                                        <Check className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <Copy className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {bank.iban && (
                                        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 rounded-xl px-3 py-2">
                                            <span className="text-sm text-slate-500">IBAN</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium font-mono" dir="ltr">{bank.iban}</span>
                                                <button onClick={() => copyToClipboard(bank.iban!, `${bank.id}-iban`)}>
                                                    {copied === `${bank.id}-iban` ? (
                                                        <Check className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <Copy className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Transaction ID Input */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4">
                            <p className="text-sm text-amber-700 dark:text-amber-400 mb-3 font-medium">
                                ⚠️ بعد التحويل، أدخل رقم العملية لتأكيد الدفع
                            </p>
                            <Input
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="رقم العملية أو المرجع"
                                className="h-12 rounded-xl"
                                dir="ltr"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => { setStep('select'); setSelectedMethod(null); }}
                                className="flex-1 h-14 rounded-2xl"
                            >
                                رجوع
                            </Button>
                            <Button
                                onClick={handleConfirmTransfer}
                                disabled={!transactionId.trim()}
                                className="flex-1 h-14 gradient-primary rounded-2xl text-lg font-bold"
                            >
                                تأكيد الدفع
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Mobile Wallet */}
                {step === 'details' && selectedMethod === 'mobile_wallet' && (
                    <motion.div
                        key="wallet"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">المحافظ الإلكترونية</h3>

                        {mobileWallets.map((wallet) => (
                            <div key={wallet.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{wallet.icon}</span>
                                        <div>
                                            <p className="font-bold text-slate-800 dark:text-white">{wallet.name}</p>
                                            <p className="text-sm text-slate-500 font-mono" dir="ltr">{wallet.number}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => copyToClipboard(wallet.number, wallet.id)}>
                                        {copied === wallet.id ? (
                                            <Check className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Copy className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Transaction ID */}
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4">
                            <p className="text-sm text-amber-700 dark:text-amber-400 mb-3 font-medium">
                                ⚠️ بعد التحويل، أدخل رقم العملية لتأكيد الدفع
                            </p>
                            <Input
                                value={transactionId}
                                onChange={(e) => setTransactionId(e.target.value)}
                                placeholder="رقم العملية"
                                className="h-12 rounded-xl"
                                dir="ltr"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => { setStep('select'); setSelectedMethod(null); }}
                                className="flex-1 h-14 rounded-2xl"
                            >
                                رجوع
                            </Button>
                            <Button
                                onClick={handleConfirmTransfer}
                                disabled={!transactionId.trim()}
                                className="flex-1 h-14 gradient-primary rounded-2xl text-lg font-bold"
                            >
                                تأكيد الدفع
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Security Notice */}
            <div className="flex items-center gap-2 justify-center text-xs text-slate-400">
                <Shield className="w-3 h-3" />
                <span>جميع عمليات الدفع مؤمّنة ومحمية</span>
            </div>

            {/* Cancel */}
            {onCancel && (
                <button
                    onClick={onCancel}
                    className="w-full text-center text-sm text-slate-400 hover:text-slate-600 py-2"
                >
                    إلغاء
                </button>
            )}
        </div>
    );
}
