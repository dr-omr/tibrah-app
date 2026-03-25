import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode } from 'lucide-react';

interface QRCodeModalProps {
    show: boolean;
    onClose: () => void;
    qrCodeUrl: string;
}

export const QRCodeModal = ({ show, onClose, qrCodeUrl }: QRCodeModalProps) => {
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full text-center"
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <QrCode className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">كود التطبيق</h3>
                        <p className="text-sm text-slate-500 mb-4">امسح الكود لمشاركة التطبيق</p>

                        {qrCodeUrl && (
                            <motion.div
                                className="bg-white p-4 rounded-2xl inline-block mb-4 shadow-lg"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                            >
                                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
                            </motion.div>
                        )}

                        <motion.button
                            className="w-full py-3 bg-emerald-600 text-white font-bold rounded-xl"
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                        >
                            إغلاق
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
