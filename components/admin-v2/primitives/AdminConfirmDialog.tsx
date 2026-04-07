// components/admin-v2/primitives/AdminConfirmDialog.tsx
// Destructive action confirmation dialog

import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface AdminConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  requireTyping?: string; // If set, user must type this to confirm
}

export default function AdminConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  danger = true,
  requireTyping,
}: AdminConfirmDialogProps) {
  const [typedValue, setTypedValue] = useState('');
  const [loading, setLoading] = useState(false);

  const canConfirm = !requireTyping || typedValue === requireTyping;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      // Let caller handle errors
    } finally {
      setLoading(false);
      setTypedValue('');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className={`w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center ${
                  danger ? 'bg-red-50' : 'bg-amber-50'
                }`}>
                  <AlertTriangle className={`w-7 h-7 ${danger ? 'text-red-500' : 'text-amber-500'}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{description}</p>

                {requireTyping && (
                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">
                      اكتب <strong className="text-red-600 font-mono">{requireTyping}</strong> للتأكيد
                    </p>
                    <input
                      type="text"
                      value={typedValue}
                      onChange={(e) => setTypedValue(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-center font-mono focus:ring-2 focus:ring-red-200 focus:border-red-300 outline-none transition-all"
                      placeholder={requireTyping}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 text-slate-600"
                >
                  {cancelLabel}
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={loading || !canConfirm}
                  className={`flex-1 ${
                    danger
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmLabel}
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
