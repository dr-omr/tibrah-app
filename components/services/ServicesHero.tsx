import React from 'react';
import dynamic from 'next/dynamic';
import { Award } from 'lucide-react';
import { DOCTOR_KNOWLEDGE } from '@/components/ai/knowledge';
import { doctorInfo } from './data';

const AIContextAssistant = dynamic(() => import('@/components/ai/AIContextAssistant'), { ssr: false });

export const ServicesHero = () => {
    return (
        <div className="relative overflow-hidden px-6 py-10" style={{ background: 'linear-gradient(145deg, #064e3b 0%, #047857 50%, #059669 100%)' }}>
            <div className="relative z-10 mb-4">
                <AIContextAssistant
                    contextType="services"
                    contextData={{}}
                    knowledgeBase={DOCTOR_KNOWLEDGE}
                    title="اسألني عن خدمات د. عمر"
                />
            </div>
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-[#D4AF37]/20 rounded-full blur-2xl translate-x-1/2 translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

            <div className="relative text-center">
                {/* Doctor Image */}
                <div className="relative w-32 h-32 mx-auto mb-6">
                    <div className="absolute inset-0 gradient-gold rounded-full blur-lg opacity-50 scale-110" />
                    <div className="relative w-full h-full rounded-full p-1 bg-gradient-to-br from-white/30 to-white/10">
                        <div className="w-full h-full rounded-full overflow-hidden bg-white/20">
                            <img
                                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69287e726ff0e068617e81b7/9185440e5_omar.jpg"
                                alt={doctorInfo.name}
                                className="w-full h-full object-cover object-top"
                            />
                        </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Award className="w-4 h-4 text-primary" />
                    </div>
                </div>

                <h1 className="text-[24px] font-black text-white mb-2" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{doctorInfo.name}</h1>
                <p className="text-white/90 font-bold mb-2">{doctorInfo.title}</p>
                <p className="text-white/70 text-[13px] font-semibold mb-6">{doctorInfo.education}</p>

                <div className="rounded-2xl p-4 max-w-sm mx-auto" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    <p className="text-white font-bold">"{doctorInfo.vision}"</p>
                </div>
            </div>
        </div>
    );
};
