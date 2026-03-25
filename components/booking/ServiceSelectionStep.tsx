// components/booking/ServiceSelectionStep.tsx
import React from 'react';
import { Video, Clock, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface ServiceSelectionStepProps {
    sessionTypes: any[];
    formData: any;
    setFormData: (data: any) => void;
    onNext: () => void;
}

export default function ServiceSelectionStep({ 
    sessionTypes, 
    formData, 
    setFormData, 
    onNext 
}: ServiceSelectionStepProps) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
        >
            <div className="text-center mb-6">
                <h2 className="text-[22px] font-black text-slate-800 mb-1.5">اختر نوع الجلسة</h2>
                <p className="text-[13px] text-slate-400 font-semibold">حدد الخدمة المناسبة لاحتياجاتك</p>
            </div>

            <div className="space-y-3">
                {sessionTypes.map((session) => {
                    const isSelected = formData.session_type === session.id;
                    const colors = session.id === 'consultation' ? '#0d9488' : session.id === 'therapy' ? '#7c3aed' : '#2563eb';
                    return (
                        <button
                            key={session.id}
                            onClick={() => setFormData({ ...formData, session_type: session.id })}
                            className="w-full text-right rounded-2xl transition-all duration-200 active:scale-[0.98]"
                            style={{
                                padding: '18px',
                                background: isSelected ? `linear-gradient(135deg, ${colors}08, ${colors}12)` : 'white',
                                border: isSelected ? `2px solid ${colors}` : '1.5px solid #e2e8f0',
                                boxShadow: isSelected ? `0 4px 16px ${colors}20` : '0 1px 3px rgba(0,0,0,0.04)',
                            }}
                        >
                            <div className="flex items-start gap-3.5">
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: isSelected ? colors : '#f1f5f9' }}>
                                    <Video className="w-6 h-6" style={{ color: isSelected ? 'white' : '#94a3b8' }} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-[15px] font-black text-slate-800">{session.label}</h3>
                                    <p className="text-[12px] text-slate-500 font-medium mt-0.5 leading-relaxed">{session.description}</p>
                                    <div className="flex items-center gap-3 mt-2.5">
                                        <span className="text-[12px] text-slate-400 flex items-center gap-1 font-semibold">
                                            <Clock className="w-3.5 h-3.5" />
                                            {session.duration}
                                        </span>
                                        <span className="text-[14px] font-black" style={{ color: colors }}>
                                            {session.price} ر.ي
                                        </span>
                                    </div>
                                </div>
                                {isSelected && (
                                    <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: colors }}>
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            <button
                onClick={onNext}
                disabled={!formData.session_type}
                className="w-full h-14 rounded-2xl text-[15px] font-black text-white disabled:opacity-40 active:scale-[0.98] transition-all"
                style={{ background: 'linear-gradient(135deg, #0d9488, #10b981)', boxShadow: '0 6px 20px rgba(13,148,136,0.3)' }}
            >
                التالي ←
            </button>

            {/* Trust note */}
            <p className="text-[10px] text-slate-300 text-center font-semibold">🔒 بياناتك محمية — الحجز مجاني وبدون التزام</p>
        </motion.div>
    );
}
