import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, Copy, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface ManualPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    method: 'jebh' | 'jawali' | 'floosak' | 'kuraimi';
    amount: number;
    onConfirm: (transactionId: string) => void;
}

const WALLET_NUMBERS = {
    kuraimi: '777088577',
    jawali: '777088577',
    floosak: '777088577',
    jebh: '777088577'
};

const LABELS = {
    kuraimi: 'إم فلوس (الكريمي)',
    jawali: 'محفظة جوالي',
    floosak: 'محفظة فلوسك',
    jebh: 'محفظة جيب'
};

export default function ManualPaymentModal({ isOpen, onClose, method, amount, onConfirm }: ManualPaymentModalProps) {
    const [transactionId, setTransactionId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(WALLET_NUMBERS[method]);
        toast.success("تم نسخ الرقم");
    };

    const handleSubmit = async () => {
        if (!transactionId.trim()) return;
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        onConfirm(transactionId);
        setIsSubmitting(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white">
                <DialogHeader>
                    <DialogTitle className="text-center text-xl font-bold">الدفع عبر {LABELS[method]}</DialogTitle>
                    <DialogDescription className="text-center">
                        قم بتحويل المبلغ إلى الرقم الموضح أدناه
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Amount & Number */}
                    <div className="bg-slate-50 p-4 rounded-2xl space-y-4 border border-slate-100">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-500">المبلغ المطلوب</span>
                            <span className="font-bold text-[#2D9B83] text-lg">{amount} ر.س</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-dashed border-slate-200">
                            <div className="text-right">
                                <p className="text-xs text-slate-400 mb-1">رقم المحفظة / الحساب</p>
                                <p className="font-mono text-lg font-bold text-slate-700">{WALLET_NUMBERS[method]}</p>
                            </div>
                            <Button size="icon" variant="ghost" onClick={handleCopy}>
                                <Copy className="w-4 h-4 text-slate-400" />
                            </Button>
                        </div>
                    </div>

                    {/* Confirmation Input */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700 block text-right">
                            رقم العملية (إشعار التحويل)
                        </label>
                        <Input
                            placeholder="مثال: 12345678"
                            className="bg-white"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                        />
                        <p className="text-xs text-slate-400 text-right">
                            * سيتم مراجعة الطلب وتأكيده فوراً بعد التحقق
                        </p>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        className="w-full bg-[#2D9B83] hover:bg-[#2D9B83]/90 text-white h-12 rounded-xl text-md font-bold"
                        disabled={!transactionId.trim() || isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin ml-2" />
                                جاري التأكيد...
                            </>
                        ) : (
                            <>
                                <Check className="w-5 h-5 ml-2" />
                                تأكيد الدفع
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
