import React from 'react';
import { CreditCard, Wallet, Smartphone, Globe, Banknote } from 'lucide-react';
import { motion } from 'framer-motion';

export type PaymentMethodType = 'kuraimi' | 'jawali' | 'floosak' | 'jebh' | 'stcpay' | 'stripe' | 'whatsapp_cod';

interface PaymentMethod {
    id: PaymentMethodType;
    name: string;
    icon: any;
    gradient: string;
    shadow: string;
    description: string;
    region: 'yemen' | 'saudi' | 'international' | 'all';
}

const METHODS: PaymentMethod[] = [
    // ── Yemen ──
    {
        id: 'kuraimi',
        name: 'كريمي إم فلوس',
        icon: Wallet,
        gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        shadow: '0 4px 12px rgba(59,130,246,0.25)',
        description: 'تحويل عبر تطبيق الكريمي',
        region: 'yemen',
    },
    {
        id: 'jawali',
        name: 'محفظة جوالي',
        icon: Smartphone,
        gradient: 'linear-gradient(135deg, #6366f1, #4f46e5)',
        shadow: '0 4px 12px rgba(99,102,241,0.25)',
        description: 'WeCash / جوالي',
        region: 'yemen',
    },
    {
        id: 'floosak',
        name: 'فلوسك',
        icon: CreditCard,
        gradient: 'linear-gradient(135deg, #10b981, #059669)',
        shadow: '0 4px 12px rgba(16,185,129,0.25)',
        description: 'محفظة بنك اليمن والكويت',
        region: 'yemen',
    },
    {
        id: 'jebh',
        name: 'محفظة جيب',
        icon: Wallet,
        gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
        shadow: '0 4px 12px rgba(245,158,11,0.25)',
        description: 'Tadhamon Pay',
        region: 'yemen',
    },
    // ── Saudi ──
    {
        id: 'stcpay',
        name: 'STC Pay',
        icon: Banknote,
        gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        shadow: '0 4px 12px rgba(139,92,246,0.25)',
        description: 'تحويل عبر STC Pay / Apple Pay',
        region: 'saudi',
    },
    // ── International ──
    {
        id: 'stripe',
        name: 'بطاقة ائتمان / PayPal',
        icon: Globe,
        gradient: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
        shadow: '0 4px 12px rgba(14,165,233,0.25)',
        description: 'Visa / MasterCard / PayPal',
        region: 'international',
    },
];

const REGIONS = [
    { id: 'all', label: 'الكل' },
    { id: 'yemen', label: '🇾🇪 اليمن' },
    { id: 'saudi', label: '🇸🇦 السعودية' },
    { id: 'international', label: '🌍 دولي' },
];

interface YemeniPaymentGatewaysProps {
    onSelect: (method: PaymentMethodType) => void;
    selectedMethod?: PaymentMethodType;
}

export default function YemeniPaymentGateways({ onSelect, selectedMethod }: YemeniPaymentGatewaysProps) {
    const [regionFilter, setRegionFilter] = React.useState<string>('all');

    const filtered = regionFilter === 'all'
        ? METHODS
        : METHODS.filter(m => m.region === regionFilter);

    return (
        <div className="mb-6">
            {/* Region tabs */}
            <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-hide">
                {REGIONS.map(r => (
                    <button
                        key={r.id}
                        onClick={() => setRegionFilter(r.id)}
                        className="text-[11px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap transition-all"
                        style={{
                            background: regionFilter === r.id ? 'linear-gradient(135deg, #0d9488, #10b981)' : 'rgba(0,0,0,0.03)',
                            color: regionFilter === r.id ? 'white' : '#64748b',
                            border: regionFilter === r.id ? 'none' : '1px solid rgba(0,0,0,0.06)',
                        }}
                    >
                        {r.label}
                    </button>
                ))}
            </div>

            {/* Payment cards */}
            <div className="grid grid-cols-2 gap-2.5">
                {filtered.map((method, i) => (
                    <motion.button
                        key={method.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => onSelect(method.id)}
                        className="relative p-3.5 rounded-2xl text-right transition-all active:scale-[0.97]"
                        style={{
                            background: selectedMethod === method.id ? 'rgba(13,148,136,0.04)' : 'white',
                            border: selectedMethod === method.id ? '2px solid #0d9488' : '1px solid rgba(0,0,0,0.06)',
                            boxShadow: selectedMethod === method.id ? '0 0 0 3px rgba(13,148,136,0.1)' : '0 1px 4px rgba(0,0,0,0.03)',
                        }}
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center mb-2.5"
                            style={{ background: method.gradient, boxShadow: method.shadow }}
                        >
                            <method.icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-black text-slate-800 text-[12px] mb-0.5">{method.name}</h3>
                        <p className="text-[10px] text-slate-400 font-semibold">{method.description}</p>

                        {selectedMethod === method.id && (
                            <div
                                className="absolute top-2.5 left-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #0d9488, #10b981)' }}
                            >
                                <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                        )}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
