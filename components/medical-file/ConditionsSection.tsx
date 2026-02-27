// components/medical-file/ConditionsSection.tsx
// Chronic conditions expandable section

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { ChronicCondition } from './MedicalFileForms';

interface ConditionsSectionProps {
    conditions: ChronicCondition[];
    expanded: boolean;
    onToggle: () => void;
    onRemove: (idx: number) => void;
    onAdd: () => void;
}

function getStatusColor(status: string) {
    switch (status) {
        case 'active': return 'bg-red-100 text-red-700';
        case 'controlled': return 'bg-green-100 text-green-700';
        case 'resolved': return 'bg-slate-100 text-slate-600';
        default: return 'bg-slate-100 text-slate-600';
    }
}

function getStatusLabel(status: string) {
    switch (status) {
        case 'active': return 'نشط';
        case 'controlled': return 'تحت السيطرة';
        case 'resolved': return 'تم الشفاء';
        default: return status;
    }
}

export default function ConditionsSection({ conditions, expanded, onToggle, onRemove, onAdd }: ConditionsSectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <Card className="border-0 shadow-lg overflow-hidden">
                <motion.div whileTap={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                    <CardHeader className="pb-2 cursor-pointer" onClick={onToggle}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <motion.div
                                    className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Activity className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
                                </motion.div>
                                <div>
                                    <CardTitle className="text-base">الحالات المزمنة</CardTitle>
                                    <span className="text-xs text-slate-400">
                                        {conditions?.length || 0} حالات مسجلة
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
                                {conditions && conditions.length > 0 ? (
                                    <div className="space-y-2">
                                        {conditions.map((condition, idx) => (
                                            <motion.div
                                                key={idx}
                                                className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-xl p-3"
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                <div>
                                                    <span className="font-medium text-slate-800 dark:text-white">{condition.name}</span>
                                                    {condition.diagnosis_date && (
                                                        <span className="text-xs text-slate-400 mr-2">
                                                            منذ {format(new Date(condition.diagnosis_date), 'yyyy', { locale: ar })}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={`${getStatusColor(condition.status)} border-0 text-xs`}>
                                                        {getStatusLabel(condition.status)}
                                                    </Badge>
                                                    <motion.button
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50"
                                                        whileTap={{ scale: 0.8 }}
                                                        onClick={() => onRemove(idx)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </motion.button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 text-center py-2">لا توجد حالات مسجلة</p>
                                )}
                                <motion.button
                                    className="w-full mt-3 p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-slate-500"
                                    whileTap={{ scale: 0.98, borderColor: '#2D9B83' }}
                                    onClick={onAdd}
                                >
                                    <Plus className="w-4 h-4" />
                                    إضافة حالة مزمنة
                                </motion.button>
                            </CardContent>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        </motion.div>
    );
}
