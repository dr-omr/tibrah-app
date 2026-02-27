import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/db';
import { aiClient } from '@/components/ai/aiClient';
import { ImageUpload } from '@/components/ai/ImageUpload';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Sparkles, Loader2, Mic, MicOff, Trash2, StopCircle, HeartPulse, Calendar, Utensils, Activity, Brain, Stethoscope, ChevronDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================
// QUICK REPLIES
// ============================================

const quickReplies = [
    { text: 'كيف صحتي اليوم؟', icon: Activity, color: '#10B981' },
    { text: 'أعطني نصيحة غذائية', icon: Utensils, color: '#22C55E' },
    { text: 'عندي صداع', icon: Brain, color: '#8B5CF6' },
    { text: 'حابب أحجز موعد', icon: Calendar, color: '#2D9B83' },
    { text: 'تحليل أعراضي', icon: Stethoscope, color: '#EF4444' },
];

// ============================================
// TYPING INDICATOR
// ============================================

function TypingIndicator() {
    return (
        <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2D9B83] flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-none p-4 shadow-sm">
                <div className="flex items-center gap-1.5">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 bg-[#2D9B83] rounded-full"
                            animate={{ y: [0, -6, 0] }}
                            transition={{
                                duration: 0.6,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: 'easeInOut',
                            }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// ============================================
// MAIN CHAT INTERFACE
// ============================================

export default function ChatInterface() {
    const [messages, setMessages] = useState<Array<{ role: string, content: string, isStreaming?: boolean }>>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [voiceMode, setVoiceMode] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string } | null>(null);
    const [showQuickReplies, setShowQuickReplies] = useState(true);

    const {
        isListening,
        transcript,
        startListening,
        stopListening,
        resetTranscript,
        speak,
        isSpeaking,
        stopSpeaking
    } = useVoiceInput();

    // Sync transcript to input
    useEffect(() => {
        if (transcript) {
            setInput(transcript);
        }
    }, [transcript]);

    // Auto-speak responses when voice mode
    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        if (voiceMode && lastMsg?.role === 'assistant' && !isLoading && !lastMsg.isStreaming) {
            speak(lastMsg.content);
        }
    }, [messages, voiceMode, isLoading, speak]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading, isStreaming]);

    const getRealHealthContext = async () => {
        try {
            const { format } = require('date-fns');
            const today = format(new Date(), 'yyyy-MM-dd');

            const [waterLogs, sleepLogs, dailyLogs] = await Promise.all([
                db.entities.WaterLog.filter({ date: today }).catch(() => []),
                db.entities.SleepLog.list('-date', 1).catch(() => []),
                db.entities.DailyLog.filter({ date: today }).catch(() => [])
            ]);

            const water = waterLogs?.[0]?.glasses || 0;
            const sleep = sleepLogs?.[0]?.duration_hours || 0;
            const daily = dailyLogs?.[0] || {};

            return {
                waterGlasses: Number(water),
                sleepHours: Number(sleep),
                moodScore: Number(daily.mood_score || 0),
                stressLevel: Number(daily.stress_level || 0),
                energyLevel: Number(daily.energy_level || 0)
            };
        } catch (e) {
            console.error("Context Fetch Error:", e);
            return null;
        }
    };

    const handleSend = async (messageOverride?: string) => {
        const userMsg = messageOverride || input || transcript;
        if (!userMsg?.trim() && !selectedImage) return;

        setInput('');
        resetTranscript();
        setShowQuickReplies(false);

        // Handle Image Analysis
        if (selectedImage) {
            const tempImage = selectedImage;
            setSelectedImage(null);

            const newMessages = [...messages, {
                role: 'user',
                content: userMsg ? `${userMsg}\n\n[مرفق صورة طبية]` : '[مرفق صورة طبية]'
            }];
            setMessages(newMessages);
            setIsLoading(true);

            try {
                const analysis = await aiClient.analyzeImage(tempImage.base64, tempImage.mimeType);
                setMessages(prev => [...prev, { role: 'assistant', content: analysis }]);
            } catch (error) {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: "عذراً، لم أتمكن من تحليل الصورة. تأكد أنها واضحة وحاول مرة أخرى."
                }]);
                toast.error("فشل تحليل الصورة");
            } finally {
                setIsLoading(false);
            }
            return;
        }

        // Optimistic UI - add user message
        const newMessages = [...messages, { role: 'user', content: userMsg }];
        setMessages(newMessages);
        setIsLoading(true);
        setIsStreaming(true);

        try {
            const healthProfile = await getRealHealthContext();

            // Add a placeholder for the streaming response
            setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);
            setIsLoading(false); // Hide typing indicator, show streaming message

            await aiClient.chatStream(
                newMessages,
                (text, done) => {
                    setMessages(prev => {
                        const updated = [...prev];
                        const lastIdx = updated.length - 1;
                        if (updated[lastIdx]?.role === 'assistant') {
                            updated[lastIdx] = {
                                role: 'assistant',
                                content: text,
                                isStreaming: !done
                            };
                        }
                        return updated;
                    });
                    if (done) setIsStreaming(false);
                },
                { healthProfile }
            );
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "عذراً، حدث خطأ في الاتصال. حاول مرة أخرى."
            }]);
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
        }
    };

    const handleClear = () => {
        aiClient.clearConversation();
        setMessages([]);
        setInput('');
        resetTranscript();
        stopListening();
        stopSpeaking();
        setShowQuickReplies(true);
        toast.info("تم مسح المحادثة.");
    }

    return (
        <div className="flex flex-col h-full relative z-10 text-right" dir="rtl">
            {/* Header */}
            <div className={`p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between ${voiceMode ? 'bg-[#2D9B83]/10' : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md'
                } transition-colors duration-300`}>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-100 animate-pulse' : 'bg-[#2D9B83]/10'
                        }`}>
                        <HeartPulse className={`w-6 h-6 ${isListening ? 'text-red-500' : 'text-[#2D9B83]'}`} />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800 dark:text-white">مساعد طِبرَا {voiceMode && '🎤'}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            {isListening ? 'جاري الاستماع...' : isSpeaking ? 'جاري التحدث...' : isStreaming ? '✍️ يكتب...' : isLoading ? '💭 يفكر...' : '🟢 متاح الآن'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setVoiceMode(!voiceMode)}
                        className={`rounded-full transition-all active:scale-95 ${voiceMode ? 'bg-[#2D9B83] text-white hover:bg-[#2D9B83]/90 ring-4 ring-[#2D9B83]/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                    >
                        {voiceMode ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-slate-400" />}
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleClear}
                        className="rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 active:scale-95 transition-transform"
                    >
                        <Trash2 className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                {messages.length === 0 && (
                    <motion.div
                        className="text-center py-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <motion.div
                            className="w-20 h-20 bg-gradient-to-br from-[#2D9B83]/10 to-[#3FB39A]/10 rounded-full mx-auto mb-4 flex items-center justify-center"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            <Sparkles className="w-10 h-10 text-[#2D9B83]" />
                        </motion.div>
                        <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">مرحباً بك! أنا مساعدك الصحي الذكي 🌿</p>
                        <p className="text-sm text-slate-400">اسألني عن صحتك، تغذيتك، أو منتجاتنا</p>

                        {/* Quick Replies - Empty State */}
                        <div className="mt-6 space-y-2">
                            <p className="text-xs text-slate-400 mb-3">💡 جرّب أحد هذه الأسئلة:</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                {quickReplies.map((reply, idx) => {
                                    const Icon = reply.icon;
                                    return (
                                        <motion.button
                                            key={idx}
                                            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300 hover:border-[#2D9B83] hover:text-[#2D9B83] transition-all shadow-sm"
                                            onClick={() => handleSend(reply.text)}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.08 }}
                                            whileTap={{ scale: 0.96 }}
                                        >
                                            <Icon className="w-3.5 h-3.5" style={{ color: reply.color }} />
                                            {reply.text}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {messages.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    >
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
                            ${msg.role === 'user' ? 'bg-slate-800 dark:bg-slate-600' : 'bg-[#2D9B83]'}
                        `}>
                            {msg.role === 'user' ? (
                                <User className="w-4 h-4 text-white" />
                            ) : (
                                <Bot className="w-4 h-4 text-white" />
                            )}
                        </div>

                        <div className={`
                            max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm
                            ${msg.role === 'user'
                                ? 'bg-slate-800 dark:bg-slate-700 text-white rounded-tr-none'
                                : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none'
                            }
                        `}>
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                            {msg.isStreaming && (
                                <motion.span
                                    className="inline-block w-0.5 h-4 bg-[#2D9B83] ml-1 align-middle"
                                    animate={{ opacity: [1, 0, 1] }}
                                    transition={{ duration: 0.8, repeat: Infinity }}
                                />
                            )}
                        </div>
                    </motion.div>
                ))}

                {/* Typing indicator */}
                <AnimatePresence>
                    {isLoading && !isStreaming && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <TypingIndicator />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Quick Replies after assistant responds */}
                <AnimatePresence>
                    {showQuickReplies && messages.length > 0 && !isLoading && !isStreaming && messages[messages.length - 1]?.role === 'assistant' && (
                        <motion.div
                            className="flex flex-wrap gap-2 pt-2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            {quickReplies.slice(0, 3).map((reply, idx) => {
                                const Icon = reply.icon;
                                return (
                                    <motion.button
                                        key={idx}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 rounded-full border border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 hover:border-[#2D9B83] hover:text-[#2D9B83] transition-all"
                                        onClick={() => handleSend(reply.text)}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.4 + idx * 0.08 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Icon className="w-3 h-3" style={{ color: reply.color }} />
                                        {reply.text}
                                    </motion.button>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800">
                {/* Image Upload Preview */}
                {selectedImage && (
                    <div className="mb-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-between animate-in slide-in-from-bottom-2">
                        <span className="text-xs text-[#2D9B83] font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> جاري تحليل الصورة...
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedImage(null)} className="h-6 w-6 p-0 rounded-full">
                            <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                    </div>
                )}

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend();
                    }}
                    className="flex gap-2"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isListening ? "جاري الاستماع..." : "اكتب سؤالك هنا..."}
                        className={`flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-[#2D9B83] rounded-xl h-12 dark:text-white ${isListening ? 'animate-pulse border-[#2D9B83] text-[#2D9B83]' : ''
                            }`}
                        disabled={isLoading || isListening || isStreaming}
                    />

                    {voiceMode && (
                        <Button
                            type="button"
                            size="icon"
                            className={`h-12 w-12 rounded-xl transition-all active:scale-95 ${isListening
                                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 animate-pulse'
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600'
                                }`}
                            onClick={isListening ? stopListening : startListening}
                        >
                            {isListening ? <StopCircle className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </Button>
                    )}

                    <ImageUpload
                        onImageSelected={(base64, mimeType) => setSelectedImage({ base64, mimeType })}
                        isLoading={isLoading}
                    />

                    <Button
                        type="submit"
                        disabled={isLoading || isStreaming || (!input.trim() && !isListening && !selectedImage)}
                        className="h-12 w-12 rounded-xl bg-[#2D9B83] hover:bg-[#258570] text-white shadow-lg shadow-[#2D9B83]/20 active:scale-95 transition-transform"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}