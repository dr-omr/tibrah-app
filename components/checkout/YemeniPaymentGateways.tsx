import React from 'react';
import { CreditCard, Wallet, Smartphone } from 'lucide-react';

export type PaymentMethodType = 'jebh' | 'jawali' | 'floosak' | 'kuraimi';

interface PaymentMethod {
    id: PaymentMethodType;
    name: string;
    icon: any;
    color: string;
    bgColor: string;
    description: string;
}

const METHODS: PaymentMethod[] = [
    {
        id: 'kuraimi',
        name: 'كريمي إم فلوس',
        icon: Wallet,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        description: 'تحويل عبر تطبيق الكريمي'
    },
    {
        id: 'jawali',
        name: 'محفظة جوالي',
        icon: Smartphone,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        description: 'WeCash / جوالي'
    },
    {
        id: 'floosak',
        name: 'فلوسك',
        icon: CreditCard,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        description: 'محفظة بنك اليمن والكويت'
    },
    {
        id: 'jebh',
        name: 'محفظة جيب',
        icon: Wallet,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        description: 'Tadhamon Pay'
    }
];

interface YemeniPaymentGatewaysProps {
    onSelect: (method: PaymentMethodType) => void;
    selectedMethod?: PaymentMethodType;
}

export default function YemeniPaymentGateways({ onSelect, selectedMethod }: YemeniPaymentGatewaysProps) {
    return (
        <div className="grid grid-cols-2 gap-3 mb-6">
            {METHODS.map((method) => (
                <button
                    key={method.id}
                    onClick={() => onSelect(method.id)}
                    className={`relative p-4 rounded-2xl border-2 transition-all text-right ${selectedMethod === method.id
                            ? 'border-[#2D9B83] bg-[#2D9B83]/5 shadow-[0_0_0_2px_#2D9B83]'
                            : 'border-slate-100 bg-white hover:border-[#2D9B83]/30'
                        }`}
                >
                    <div className={`w-10 h-10 rounded-full ${method.bgColor} flex items-center justify-center mb-3`}>
                        <method.icon className={`w-5 h-5 ${method.color}`} />
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm mb-1">{method.name}</h3>
                    <p className="text-xs text-slate-400">{method.description}</p>

                    {selectedMethod === method.id && (
                        <div className="absolute top-3 left-3 w-4 h-4 bg-[#2D9B83] rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
}
