// components/medical-file/AllergiesSection.tsx
// Allergies expandable section with add/remove

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ChevronDown, ChevronUp, X, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AllergiesSectionProps {
    allergies: string[];
    expanded: boolean;
    onToggle: () => void;
    onRemove: (idx: number) => void;
    onAdd: () => void;
}

export default function AllergiesSection({ allergies, expanded, onToggle, onRemove, onAdd }: AllergiesSectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <Card className="border-0 shadow-lg overflow-hidden">
                <motion.div whileTap={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    <CardHeader className="pb-2 cursor-pointer" onClick={onToggle}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center"
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <AlertCircle className="w-5 h-5 text-amber-500" strokeWidth={1.5} />
                                </motion.div>
                                <div>
                                    <CardTitle className="text-base">الحساسية</CardTitle>
                                    <span className="text-xs text-slate-400">
                                        {allergies?.length || 0} نوع مسجل
                                    </span>
                                </div>
                            </div>
                            <motion.div whileTap={{ scale: 0.8 }}>
                                {expanded ?
                                    <ChevronUp className="w-5 h-5 text-slate-400" /> :
                                    <ChevronDown className="w-5 h-5 text-slate-400" />
                                }
                            </motion.div>
                        </div>
                    </CardHeader>
                </motion.div>
                <AnimatePresence>
                    {expanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                        >
                            <CardContent className="pt-0">
                                {allergies && allergies.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {allergies.map((allergy, idx) => (
                                            <motion.div
                                                key={idx}
                                                className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1"
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                {allergy}
                                                <button
                                                    onClick={() => onRemove(idx)}
                                                    className="mr-1 hover:text-red-500"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 text-center py-2">لا توجد حساسية مسجلة</p>
                                )}
                                <motion.button
                                    className="w-full mt-3 p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-slate-500"
                                    whileTap={{ scale: 0.98, borderColor: '#F59E0B' }}
                                    onClick={onAdd}
                                >
                                    <Plus className="w-4 h-4" />
                                    إضافة حساسية
                                </motion.button>
                            </CardContent>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </motion.div>
    );
}
