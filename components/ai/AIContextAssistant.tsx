import React, { useState, useRef, useEffect } from 'react';
import { useAI } from '@/components/ai/useAI';
import { AI_DISCLAIMER } from '@/components/ai/aiClient';
import { Send, Bot, X, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Removed framer-motion for performance

export default function AIContextAssistant({ contextType, contextData, knowledgeBase, title = "مساعد طِبرَا" }) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const { chat, loading, isEnabled } = useAI();
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        const response = await chat([...messages, userMsg], { type: contextType, data: contextData }, knowledgeBase);

        if (response) {
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        }
    };

    if (!isEnabled()) return null;

    return (
        <>
            {/* Trigger Button - Fixed or Inline based on need, here Inline usage mostly intended but made collapsible */}
            <div className="mt-4">
                {!isOpen ? (
                    <Button
                        onClick={() => setIsOpen(true)}
                        className="w-full bg-gradient-to-r from-[#2D9B83]/10 to-[#3FB39A]/10 hover:from-[#2D9B83]/20 hover:to-[#3FB39A]/20 text-[#2D9B83] border-0 shadow-none justify-between"
                    >
                        <span className="flex items-center gap-2">
                            <Bot className="w-5 h-5" />
                            <span>{title} - اسأل عن {contextType === 'dashboard' ? 'يومك' : 'هذا المحتوى'}</span>
                        </span>
                        <MessageSquare className="w-4 h-4 opacity-50" />
                    </Button>
                ) : (
                    <div className="glass rounded-2xl overflow-hidden border border-[#2D9B83]/20 shadow-lg animate-in slide-in-from-top-2 duration-300">
                        {/* Header */}
                        <div className="bg-[#2D9B83]/5 p-3 flex items-center justify-between border-b border-[#2D9B83]/10">
                            <div className="flex items-center gap-2">
                                <Bot className="w-5 h-5 text-[#2D9B83]" />
                                <span className="font-bold text-sm text-slate-700">{title}</span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
                                <X className="w-4 h-4 text-slate-400" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <div className="h-64 overflow-y-auto p-4 space-y-3 bg-white/50">
                            <div className="bg-blue-50 text-blue-800 p-2 rounded-lg text-xs mb-4 text-center">
                                {AI_DISCLAIMER}
                            </div>

                            {messages.length === 0 && (
                                <div className="text-center text-slate-400 text-sm py-8">
                                    كيف يمكنني مساعدتك اليوم؟
                                </div>
                            )}

                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${msg.role === 'user'
                                        ? 'bg-[#2D9B83] text-white rounded-tr-none'
                                        : 'bg-white text-slate-700 shadow-sm rounded-tl-none'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}

                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white rounded-2xl rounded-tl-none px-4 py-2 shadow-sm">
                                        <Loader2 className="w-4 h-4 text-[#2D9B83] animate-spin" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSend} className="p-3 border-t border-slate-100 flex gap-2 bg-white">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="اكتب سؤالك هنا..."
                                className="flex-1 text-sm h-10"
                                disabled={loading}
                            />
                            <Button type="submit" size="icon" disabled={loading || !input.trim()} className="h-10 w-10 bg-[#2D9B83]">
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </>
    );
}