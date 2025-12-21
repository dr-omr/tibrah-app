import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/db';
import { aiClient } from '@/components/ai/aiClient';
import { ImageUpload } from '@/components/ai/ImageUpload';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Sparkles, Loader2, Mic, MicOff, Trash2, StopCircle, HeartPulse } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from 'sonner';

export default function ChatInterface() {
    const [messages, setMessages] = useState<Array<{ role: string, content: string }>>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [voiceMode, setVoiceMode] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string } | null>(null);

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
            console.log('Transcript updated:', transcript);
            setInput(transcript);
        }
    }, [transcript]);

    // Auto-speak responses
    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        if (voiceMode && lastMsg?.role === 'assistant' && !isLoading) {
            speak(lastMsg.content);
        }
    }, [messages, voiceMode, isLoading, speak]);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const getRealHealthContext = async () => {
        try {
            // const { base44 } = require('@/api/base44Client');
            const { format } = require('date-fns');
            const today = format(new Date(), 'yyyy-MM-dd');

            // Parallel Fetching for speed
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

    const handleSend = async () => {
        if (!input.trim() && !transcript && !selectedImage) return;

        const userMsg = input || transcript;
        setInput('');
        resetTranscript();

        // Handle Image Analysis
        if (selectedImage) {
            const tempImage = selectedImage;
            setSelectedImage(null); // Clear immediately

            // Add user message with image indicator
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

        // Optimistic UI
        const newMessages = [...messages, { role: 'user', content: userMsg }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Fetch Context on Fly
            const healthProfile = await getRealHealthContext();

            const aiResponse = await aiClient.chat(newMessages, { healthProfile });
            setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "عذراً، حدث خطأ في الاتصال. حاول مرة أخرى."
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClear = () => {
        aiClient.clearConversation();
        setMessages([]);
        setInput('');
        resetTranscript();
        stopListening();
        stopSpeaking();
        toast.info("تم مسح المحادثة.");
    }

    return (
        <div className="flex flex-col h-full relative z-10 text-right" dir="rtl">
            {/* Header */}
            <div className={`p-4 border-b border-slate-100 flex items-center justify-between ${voiceMode ? 'bg-[#2D9B83]/10' : 'bg-white/80 backdrop-blur-md'
                } transition-colors duration-300`}>
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-100 animate-pulse' : 'bg-[#2D9B83]/10'
                        }`}>
                        <HeartPulse className={`w-6 h-6 ${isListening ? 'text-red-500' : 'text-[#2D9B83]'}`} />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800">مساعد طِبرَا {voiceMode && '🎤'}</h2>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            {isListening ? 'جاري الاستماع...' : isSpeaking ? 'جاري التحدث...' : isLoading ? 'يكتب...' : 'متاح الآن'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setVoiceMode(!voiceMode)}
                        className={`rounded-full transition-all active:scale-95 ${voiceMode ? 'bg-[#2D9B83] text-white hover:bg-[#2D9B83]/90 ring-4 ring-[#2D9B83]/20' : 'hover:bg-slate-100'
                            }`}
                    >
                        {voiceMode ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-slate-400" />}
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={handleClear}
                        className="rounded-full hover:bg-red-50 text-slate-400 hover:text-red-500 active:scale-95 transition-transform"
                    >
                        <Trash2 className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
                {messages.length === 0 && (
                    <div className="text-center py-8 opacity-50">
                        <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <Sparkles className="w-10 h-10 text-slate-400" />
                        </div>
                        <p>مرحباً بك! أنا مساعدك الصحي الذكي.</p>
                        <p className="text-sm">اسألني عن صحتك، تغذيتك، أو منتجاتنا.</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                        <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1
                            ${msg.role === 'user' ? 'bg-slate-800' : 'bg-[#2D9B83]'}
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
                                ? 'bg-slate-800 text-white rounded-tr-none'
                                : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                            }
                        `}>
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                    </div>
                ))}

                {/* Loading Skeleton */}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2D9B83] flex items-center justify-center flex-shrink-0 mt-1">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4 shadow-sm w-[70%] space-y-2">
                            <Skeleton className="h-4 w-[90%]" />
                            <Skeleton className="h-4 w-[75%]" />
                            <Skeleton className="h-4 w-[50%]" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-100">
                {/* Image Upload Preview Context */}
                {selectedImage && (
                    <div className="mb-2 p-2 bg-slate-50 rounded-lg flex items-center justify-between animate-in slide-in-from-bottom-2">
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
                        className={`flex-1 bg-white border-slate-200 focus:border-[#2D9B83] rounded-xl h-12 ${isListening ? 'animate-pulse border-[#2D9B83] text-[#2D9B83]' : ''
                            }`}
                        disabled={isLoading || isListening}
                    />

                    {voiceMode && (
                        <Button
                            type="button"
                            size="icon"
                            className={`h-12 w-12 rounded-xl transition-all active:scale-95 ${isListening
                                ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 animate-pulse'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
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
                        disabled={isLoading || (!input.trim() && !isListening && !selectedImage)}
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