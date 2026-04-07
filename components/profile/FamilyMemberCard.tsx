import React from 'react';
import { motion } from 'framer-motion';
import { Activity, PlusCircle, Share } from 'lucide-react';
import Link from 'next/link';
import { haptic } from '@/lib/HapticFeedback';

export interface FamilyMember {
    id: string; // the actual user id if linked, or a custom unlinked id 
    name: string;
    relation: string;
    age: number;
    medical_history?: string;
    hasAppAccess?: boolean; // True if they use the app, false if it's just a placeholder created by parent
}

interface FamilyMemberCardProps {
    member: FamilyMember;
    onClick?: () => void;
    onShare?: (e: React.MouseEvent) => void;
}

export default function FamilyMemberCard({ member, onClick, onShare }: FamilyMemberCardProps) {
    // Generate an avatar color based on relation
    const getAvatarColor = () => {
        if (member.relation.includes('ابن') || member.relation.includes('ابن')) return 'bg-blue-100 text-blue-600';
        if (member.relation.includes('زوج')) return 'bg-rose-100 text-rose-600';
        if (member.relation.includes('أب') || member.relation.includes('أم')) return 'bg-emerald-100 text-emerald-600';
        return 'bg-indigo-100 text-indigo-600';
    };

    return (
        <motion.div 
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { haptic.selection(); onClick?.(); }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/60 rounded-[32px] p-5 shadow-lg shadow-slate-200/40 relative overflow-hidden group cursor-pointer"
        >
            {/* Liquid Glass Background effect */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-100/30 dark:bg-teal-900/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {/* Avatar Ring */}
                    <div className="relative">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-lg ${getAvatarColor()}`}>
                            {member.name.charAt(0)}
                        </div>
                        {/* Activity indicator (Green dot for good health logic, could be dynamic) */}
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full" />
                    </div>

                    <div>
                        <h3 className="font-black text-slate-800 dark:text-white text-[15px] mb-1">
                            {member.name}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                            <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                                {member.relation}
                            </span>
                            <span>•</span>
                            <span>{member.age} سنة</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    {onShare && (
                        <button 
                            onClick={onShare}
                            className="w-10 h-10 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition-colors"
                        >
                            <Share className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            <div className="relative z-10 mt-5 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex gap-2">
                <button className="flex-1 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center gap-2 transition-colors">
                    <Activity className="w-4 h-4 text-teal-500" />
                    المؤشرات اليوم
                </button>
                <button className="flex-1 py-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-indigo-100 shadow-inner">
                    <PlusCircle className="w-4 h-4" />
                    سجل لـ {member.name.split(' ')[0]}
                </button>
            </div>
        </motion.div>
    );
}
