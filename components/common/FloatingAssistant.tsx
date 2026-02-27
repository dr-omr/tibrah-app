import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import ChatInterface from '../agents/ChatInterface';

export default function FloatingAssistant() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-24 md:bottom-8 left-6 z-50 font-cairo" dir="rtl">
            {isOpen && (
                <div className="absolute bottom-16 left-0 w-[90vw] md:w-[380px] h-[600px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 origin-bottom-left animate-in fade-in zoom-in-95 slide-in-from-bottom-10 duration-200">
                    <ChatInterface />
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 ${isOpen
                    ? 'bg-slate-800 text-white rotate-90'
                    : 'bg-gradient-to-br from-[#2D9B83] to-[#3FB39A] text-white'
                    }`}
            >
                {/* Ripple Effect Animation */}
                {!isOpen && (
                    <span className="absolute inset-0 rounded-full bg-[#2D9B83] animate-ping opacity-20" />
                )}

                <div className="relative z-10">
                    {isOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <Sparkles className="w-7 h-7 md:w-8 md:h-8" />
                    )}
                </div>

                {!isOpen && (
                    <span className="absolute -top-2 -right-2 bg-red-500 w-4 h-4 rounded-full border-2 border-white animate-bounce" />
                )}
            </button>
        </div>
    );
}