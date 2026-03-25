import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search } from 'lucide-react';
import { emotionalDiseases, organSystems, EmotionalDisease } from '@/data/emotionalMedicineData';

interface DiseaseListProps {
    filteredDiseases: EmotionalDisease[];
    setSelectedDisease: (disease: EmotionalDisease) => void;
}

export const DiseaseList: React.FC<DiseaseListProps> = ({ filteredDiseases, setSelectedDisease }) => {
    const getSystemColor = (systemId: string) => {
        return organSystems.find(s => s.id === systemId)?.color || '#94A3B8';
    };

    return (
        <div className="px-6 space-y-3">
            <AnimatePresence mode="popLayout">
                {filteredDiseases.slice(0, 50).map((disease, idx) => (
                    <motion.div
                        key={disease.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.03 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => setSelectedDisease(disease)}
                        className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all"
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                                style={{
                                    background: `linear-gradient(135deg, ${getSystemColor(disease.organSystemEn)}20, ${getSystemColor(disease.organSystemEn)}10)`
                                }}
                            >
                                {organSystems.find(s => s.id === disease.organSystemEn)?.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-800 dark:text-white mb-1">{disease.symptom}</h3>
                                <p className="text-xs text-slate-500 mb-2">
                                    {disease.targetOrgan} • {disease.organSystem}
                                </p>
                                <p className="text-sm text-slate-600 line-clamp-2">
                                    {disease.emotionalConflict}
                                </p>
                            </div>
                            <ChevronLeft className="w-5 h-5 text-slate-400 flex-shrink-0" />
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {filteredDiseases.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16"
                >
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">لا توجد نتائج</h3>
                    <p className="text-slate-500">جرب كلمات بحث مختلفة</p>
                </motion.div>
            )}
        </div>
    );
};
