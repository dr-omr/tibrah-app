import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

export default function CompanionBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: 'أهلاً بك في طِبرَا! أنا مساعدك الصحي الذكي. كيف يمكنني مساعدتك؟ (مثال: أشعر بصداع، أو أحتاج لمساعدة في النوم)'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Include message history for context, limit to last 6 messages
            const history = [...messages.slice(-5), userMsg].map(m => ({ role: m.role, content: m.content }));

            const res = await fetch('/api/triage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history })
            });

            if (!res.ok) throw new Error('Network error');
            const data = await res.json();

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.reply
            }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'عذراً، حدث خطأ في الاتصال. حاول مرة أخرى لاحقاً.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-24 left-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(13,148,136,0.4)] active:scale-95 transition-transform"
                        style={{ background: 'linear-gradient(135deg, #0d9488, #10b981)' }}
                    >
                        <Bot className="w-6 h-6 text-white" />
                        <span className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-500 border-2 border-slate-900"></span>
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-4 left-4 right-4 md:left-auto md:w-[380px] z-50 h-[80vh] max-h-[600px] flex flex-col rounded-[28px] overflow-hidden shadow-2xl border border-white/10"
                        style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(24px)' }}
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, rgba(13,148,136,0.1), rgba(16,185,129,0.05))' }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-teal-500/20 text-teal-400">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                                        المساعد الصحي "طِبرَا"
                                        <Sparkles className="w-3 h-3 text-teal-400" />
                                    </h3>
                                    <p className="text-[10px] font-bold text-teal-300">متصل الآن - جاهز للمساعدة</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex max-w-[85%] ${msg.role === 'user' ? 'mr-auto justify-end' : 'ml-auto justify-start'}`}
                                >
                                    <div
                                        className={`p-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                                ? 'bg-teal-600 text-white rounded-bl-sm'
                                                : 'bg-white/10 text-white/90 rounded-br-sm border border-white/5'
                                            }`}
                                    >
                                        <ReactMarkdown
                                            components={{
                                                a: ({ node, ...props }) => (
                                                    <Link href={props.href!} className="text-teal-300 font-bold underline underline-offset-2 hover:text-teal-200 transition-colors inline-flex items-center gap-0.5 mt-1" onClick={() => setIsOpen(false)}>
                                                        {props.children}
                                                        <ArrowRight className="w-3 h-3 inline rotate-180 ml-1" />
                                                    </Link>
                                                )
                                            }}
                                        >
                                            {msg.content}
                                        </ReactMarkdown>
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex max-w-[85%] ml-auto justify-start">
                                    <div className="p-4 rounded-2xl bg-white/5 rounded-br-sm border border-white/5 flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 text-teal-400 animate-spin" />
                                        <span className="text-[11px] font-bold text-white/50">يُفكر...</span>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/10 bg-slate-900/50">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="اكتب أعراضك أو استفسارك هنا..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500/50 transition-colors placeholder:text-white/30"
                                    dir="rtl"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center bg-teal-500 text-white active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-teal-500/20"
                                >
                                    <Send className="w-4 h-4 -ml-1 mt-0.5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
