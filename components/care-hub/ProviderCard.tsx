import React from 'react';
import Image from 'next/image';
import { MessageCircle, Clock, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createPageUrl } from '@/utils';

interface Provider {
    id: string;
    name: string;
    title: string;
    photoUrl: string;
    status: 'online' | 'offline' | 'busy';
    lastSeen?: string;
}

interface ProviderCardProps {
    provider: Provider;
    mode: 'none' | 'scheduled' | 'imminent' | 'completed' | 'missed';
}

export function ProviderCard({ provider, mode }: ProviderCardProps) {
    const isOnline = provider.status === 'online';

    return (
        <div className="relative p-4 rounded-t-[24px] bg-gradient-to-b from-teal-50/50 to-white dark:from-slate-800/50 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 overflow-hidden">
            {/* Subtle glow effect top edge */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-teal-400/30 to-transparent" />
            
            <div className="flex items-center gap-4 relative z-10">
                {/* Avatar with precise safe-area treatment */}
                <div className="relative flex-shrink-0">
                    <div className={`w-[72px] h-[72px] rounded-[24px] p-[2px] shadow-sm transform transition-transform duration-300 ${mode === 'none' ? 'rotate-2 hover:rotate-0' : ''}`}
                         style={{ background: isOnline ? 'linear-gradient(135deg, #0d9488, #10b981)' : 'var(--slate-200)' }}>
                        <div className="w-full h-full rounded-[22px] overflow-hidden bg-slate-100 dark:bg-slate-800">
                             <Image
                                src={provider.photoUrl}
                                alt={provider.name}
                                width={72}
                                height={72}
                                className="w-full h-full object-cover object-top"
                                priority
                            />
                        </div>
                    </div>
                    {/* Status Dot */}
                    {isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-[18px] h-[18px] rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                        </div>
                    )}
                </div>

                {/* Info Text */}
                <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-[17px] font-extrabold text-slate-800 dark:text-white leading-tight mb-1 truncate">
                        {provider.name}
                    </h3>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 font-medium leading-snug line-clamp-2">
                        {provider.title}
                    </p>
                    
                    {/* Contextual Action / Status based on Mode */}
                    <div className="mt-2.5 flex items-center gap-3">
                        {mode === 'none' ? (
                            <Link href={createPageUrl('BookAppointment')}>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    className="text-[11px] font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10 hover:bg-teal-100 dark:hover:bg-teal-500/20 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
                                >
                                    حجز استشارة
                                </motion.button>
                            </Link>
                        ) : (
                             <button className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700 transition-colors flex items-center gap-1.5">
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>مراسلة مجانية</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
