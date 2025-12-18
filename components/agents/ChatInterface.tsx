import React, { useState, useEffect, useRef } from 'react';
import { useAI } from '@/components/ai/useAI';
import { DOCTOR_KNOWLEDGE } from '@/components/ai/knowledge';
import { Send, X, Loader2, Sparkles, User, Bot } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatInterfaceProps {
    onClose: () => void;
}

export default function ChatInterface({ onClose }: ChatInterfaceProps) {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'أهلاً وسهلاً يا غالي! 🌿\n\nأنا مساعد طِبرَا الذكي، حاضر لمساعدتك في رحلتك الصحية.\n\nكيف أقدر أفيدك اليوم؟'
        }
    ]);
    const [input, setInput] = useState('');
    const { chat, loading } = useAI();
    const scrollRef = useRef(null);

    const quickReplies = [
        { text: 'من هو د. عمر؟', emoji: '👨‍⚕️' },
        { text: 'عندي مشكلة في الهضم', emoji: '🫃' },
        { text: 'كيف أحجز جلسة؟', emoji: '📅' },
        { text: 'ما هي الترددات العلاجية؟', emoji: '🎵' }
    ];

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        const currentInput = input;
        setInput('');

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);

        try {
            const response = await chat(newMessages, { type: 'floating_assistant' }, DOCTOR_KNOWLEDGE);
            if (response) {
                setMessages(prev => [...prev, { role: 'assistant', content: response }]);
            }
        } catch (err) {
            // Should be handled by aiClient fallback, but just in case
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "عذراً، حدث خطأ في الاتصال. حاول مرة أخرى."
            }]);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#2D9B83] to-[#3FB39A] text-white rounded-t-2xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">مساعد طِبرَا الذكي</h3>
                        <span className="text-xs text-white/80 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" /> متصل الآن
                        </span>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" onClick={onClose}>
                    <X className="w-5 h-5" />
                </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg, idx) => {
                    const isUser = msg.role === 'user';
                    return (
                        <div
                            key={idx}
                            className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-2 duration-300`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${isUser ? 'bg-slate-200' : 'bg-[#2D9B83]/10'
                                }`}>
                                {isUser ? <User className="w-4 h-4 text-slate-600" /> : <Sparkles className="w-4 h-4 text-[#2D9B83]" />}
                            </div>

                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${isUser
                                ? 'bg-[#2D9B83] text-white rounded-tr-none'
                                : 'bg-white border border-slate-100 shadow-sm rounded-tl-none text-slate-700'
                                }`}>
                                {msg.role === 'assistant' ? (
                                    <ReactMarkdown
                                        className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2"
                                        components={{
                                            a: ({ node, ...props }) => <a {...props} className="text-[#2D9B83] underline font-medium" target="_blank" />,
                                            ul: ({ node, ...props }) => <ul {...props} className="list-disc mr-4" />,
                                            ol: ({ node, ...props }) => <ol {...props} className="list-decimal mr-4" />
                                        }}
                                    >
                                        {msg.content}
                                    </ReactMarkdown>
                                ) : (
                                    msg.content
                                )}
                            </div>
                        </div>
                    );
                })}
                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2D9B83]/10 flex items-center justify-center flex-shrink-0">
                            <Loader2 className="w-4 h-4 text-[#2D9B83] animate-spin" />
                        </div>
                        <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Replies - shown only at start */}
            {messages.length === 1 && !loading && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                    {quickReplies.map((reply, idx) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setInput(reply.text);
                                setTimeout(() => handleSend(), 100);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600 hover:border-[#2D9B83] hover:text-[#2D9B83] transition-colors"
                        >
                            <span>{reply.emoji}</span>
                            <span>{reply.text}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
                <form
                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    className="flex items-center gap-2 bg-slate-50 p-2 rounded-full border border-slate-200 focus-within:border-[#2D9B83] focus-within:ring-1 focus-within:ring-[#2D9B83]/20 transition-all"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="اسألني عن صحتك، الدورات، أو المنتجات..."
                        className="border-0 bg-transparent focus-visible:ring-0 px-4"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="rounded-full bg-[#2D9B83] hover:bg-[#2D9B83]/90 text-white shadow-md disabled:opacity-50"
                        disabled={!input.trim() || loading}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}