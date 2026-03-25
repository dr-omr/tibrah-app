import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { emotionalDiseases, organSystems } from '@/data/emotionalMedicineData';

interface CategoryPillsProps {
    selectedSystem: string | null;
    setSelectedSystem: (system: string | null) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({ selectedSystem, setSelectedSystem }) => {
    return (
        <div className="px-6 mt-12 mb-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6"
            >
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedSystem(null)}
                    className={`px-4 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${!selectedSystem
                        ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-lg shadow-rose-500/30'
                        : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-rose-200'
                        }`}
                >
                    <span>✨</span>
                    <span>الكل</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                        {emotionalDiseases.length}
                    </span>
                </motion.button>
                {organSystems.map((system, idx) => {
                    const count = emotionalDiseases.filter(d => d.organSystemEn === system.id).length;
                    return (
                        <motion.button
                            key={system.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedSystem(selectedSystem === system.id ? null : system.id)}
                            className={`px-4 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${selectedSystem === system.id
                                ? 'text-white shadow-lg'
                                : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-rose-200'
                                }`}
                            style={{
                                background: selectedSystem === system.id
                                    ? `linear-gradient(135deg, ${system.color}, ${system.color}dd)`
                                    : undefined,
                                boxShadow: selectedSystem === system.id
                                    ? `0 8px 24px ${system.color}40`
                                    : undefined
                            }}
                        >
                            <span>{system.icon}</span>
                            <span>{system.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${selectedSystem === system.id ? 'bg-white/20' : 'bg-slate-100'
                                }`}>
                                {count}
                            </span>
                        </motion.button>
                    );
                })}
            </motion.div>
        </div>
    );
};
