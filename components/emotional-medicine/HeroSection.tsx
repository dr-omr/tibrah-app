import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowRight, Brain, Activity, Search, Mic, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { emotionalDiseases, organSystems } from '@/data/emotionalMedicineData';

interface HeroSectionProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    isListening: boolean;
    startVoiceSearch: () => void;
    onBack: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
    searchQuery,
    setSearchQuery,
    isListening,
    startVoiceSearch,
    onBack
}) => {
    return (
        <div className="bg-gradient-to-br from-pink-600 via-rose-500 to-amber-500 px-6 pt-12 pb-28 relative overflow-hidden rounded-b-[3rem]">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute -top-20 -right-20 w-60 h-60 bg-white rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute bottom-10 left-10 w-40 h-40 bg-yellow-300/20 rounded-full blur-2xl"
                />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="text-white hover:bg-white/20 rounded-full backdrop-blur-sm"
                    >
                        <ArrowRight className="w-6 h-6" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                            الطب الشعوري
                            <Heart className="w-8 h-8" />
                        </h1>
                        <p className="text-rose-100 text-sm">اكتشف الجذور الشعورية للأمراض</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 flex-wrap">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/15 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center gap-3"
                    >
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-lg">{emotionalDiseases.length}+</p>
                            <p className="text-rose-100 text-xs">مرض موثق</p>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/15 backdrop-blur-md rounded-2xl px-4 py-3 flex items-center gap-3"
                    >
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-lg">{organSystems.length}</p>
                            <p className="text-rose-100 text-xs">نظام جسمي</p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Floating Search Bar */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute -bottom-7 left-6 right-6"
            >
                <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-rose-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Search className="w-5 h-5 text-white" />
                    </div>
                    <Input
                        placeholder="ابحث عن مرض، عضو، أو شعور..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border-none shadow-none text-base flex-1 focus-visible:ring-0"
                    />
                    {searchQuery && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSearchQuery('')}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                    {/* Voice Search Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className={`h-10 w-10 rounded-xl transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-rose-500'}`}
                        onClick={startVoiceSearch}
                    >
                        <Mic className="w-5 h-5" />
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};
