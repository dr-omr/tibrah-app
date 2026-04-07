// components/care-hub/CareSessionHub.tsx
// Unified Care Session Hub — replaces DoctorWelcome + NextAppointment
// Dynamically renders based on appointment state

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/db';
import { createPageUrl } from '@/utils';
import { haptic } from '@/lib/HapticFeedback';
import { uiSounds } from '@/lib/uiSounds';
import { Stethoscope, ArrowLeft, Plus, Video, Clock, Sparkles, Shield } from 'lucide-react';

import { ProviderCard } from './ProviderCard';
import { SessionStatusBoard, type SessionData } from './SessionStatusBoard';
import { ReadinessManager, type ChecklistItem } from './ReadinessManager';
import { PostSessionPanel } from './PostSessionPanel';

/* ── Constants ── */
const DOCTOR_PHOTO = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69287e726ff0e068617e81b7/9185440e5_omar.jpg';

const DEFAULT_PROVIDER = {
    id: 'dr-omar',
    name: 'د. عمر العماد',
    title: 'خبير الطب الوظيفي والتكاملي، مستعد لمناقشة خطة تعافيك',
    photoUrl: DOCTOR_PHOTO,
    status: 'online' as const,
};

const DEFAULT_CHECKLIST: ChecklistItem[] = [
    { id: 'health-record', label: 'تحديث السجل الصحي وأي تحاليل جديدة', icon: 'file', completed: false },
    { id: 'quiet-place',   label: 'الجلوس في مكان هادئ مع اتصال إنترنت جيد', icon: 'general', completed: false },
    { id: 'medications',   label: 'تجهيز قائمة الأدوية الحالية', icon: 'pill', completed: false },
    { id: 'questions',     label: 'دوّن أهم النقاط والأسئلة للطبيب', icon: 'question', completed: false },
];

/* ── Interactive Voice Note Component ── */
function VoiceNoteWelcome({ isImminent }: { isImminent: boolean }) {
    const [isPlaying, setIsPlaying] = useState(false);
    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className={`mt-4 px-4 py-3 mx-4 rounded-xl flex items-center justify-between shadow-sm cursor-pointer border ${isImminent ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/30' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'}`}
            onClick={() => { haptic.selection(); setIsPlaying(!isPlaying); uiSounds.tap(); }}
            whileTap={{ scale: 0.98 }}
        >
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isPlaying ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                    {isPlaying ? <span className="w-3 h-3 bg-white rounded-sm animate-pulse" /> : <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-slate-600 dark:border-l-slate-300 border-b-[5px] border-b-transparent ml-1" />}
                </div>
                <div>
                    <p className={`text-[12px] font-bold ${isImminent ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-300'}`}>رسالة د. عمر لك</p>
                    <p className="text-[10px] text-slate-500 font-medium">0:15 • جاهز لاستماعك</p>
                </div>
            </div>
            {/* Visualizer bars */}
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <motion.div 
                        key={i}
                        animate={{ height: isPlaying ? [4, 12, 4] : 4 }}
                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                        className={`w-1 rounded-full ${isImminent ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'}`}
                        style={{ height: 4 }}
                    />
                ))}
            </div>
        </motion.div>
    );
}

/* ── Hub State Logic ── */
type HubState = 'none' | 'scheduled' | 'imminent' | 'completed' | 'missed';

function getHubState(appointment: any): HubState {
    if (!appointment) return 'none';
    
    const now = new Date();
    const apptDate = new Date(`${appointment.date}T${appointment.time || '00:00'}`);
    const diff = apptDate.getTime() - now.getTime();
    const durationMs = (appointment.duration || 45) * 60 * 1000;
    
    if (appointment.status === 'cancelled') return 'none';
    
    // Past the appointment end time
    if (diff < -durationMs) {
        if (appointment.status === 'missed') return 'missed';
        return 'completed';
    }
    
    // Within 15 minutes of start
    if (diff <= 15 * 60 * 1000 && diff > -durationMs) return 'imminent';
    
    return 'scheduled';
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════ */
export default function CareSessionHub() {
    const { user } = useAuth();

    const { data: appointments = [] } = useQuery({
        queryKey: ['appointments', user?.id],
        queryFn: () => db.entities.Appointment.listForUser(user?.id || ''),
        enabled: !!user,
    });

    // Find the most relevant upcoming appointment
    const activeAppointment = useMemo(() => {
        const now = new Date();
        const sorted = [...appointments]
            .filter((a: any) => a.status !== 'cancelled')
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        // First, check for imminent/ongoing
        const imminent = sorted.find((a: any) => {
            const d = new Date(`${a.date}T${a.time || '00:00'}`);
            const diff = d.getTime() - now.getTime();
            return diff > -(a.duration || 45) * 60 * 1000 && diff <= 15 * 60 * 1000;
        });
        if (imminent) return imminent;

        // Then upcoming
        const upcoming = sorted.find((a: any) => new Date(a.date) >= now);
        if (upcoming) return upcoming;

        // Then the most recent past one (for completed/missed states)
        const past = sorted.filter((a: any) => new Date(a.date) < now);
        if (past.length > 0) {
            const lastPast = past[past.length - 1] as any;
            const hoursSince = (now.getTime() - new Date(lastPast.date).getTime()) / (1000 * 60 * 60);
            if (hoursSince < 24) return lastPast; // Show completed/missed only within 24hrs
        }

        return null;
    }, [appointments]);

    const hubState = useMemo(() => getHubState(activeAppointment), [activeAppointment]);

    // Checklist state (local for now)
    const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);
    const handleToggle = useCallback((id: string) => {
        haptic.tap();
        setChecklist(prev => prev.map(item => 
            item.id === id ? { ...item, completed: !item.completed } : item
        ));
    }, []);

    /* ── Not logged in → Should not render (handled by parent usually, but add fallback) ── */
    if (!user) {
        return null;
    }

    /* ── No appointment state ── */
    if (hubState === 'none') {
        return (
            <div>
                <ProviderCard provider={DEFAULT_PROVIDER} mode="none" />
                <NoAppointmentCTA />
            </div>
        );
    }

    const sessionData: SessionData = {
        id: activeAppointment.id,
        date: activeAppointment.date,
        time: activeAppointment.time || '00:00',
        duration: activeAppointment.duration || 45,
        type: activeAppointment.session_type || activeAppointment.type || 'followup',
        mode: (activeAppointment.session_mode as any) || 'video',
        status: activeAppointment.status || 'confirmed',
        meetingUrl: activeAppointment.meeting_url,
        notes: activeAppointment.notes,
    };

    /* ── Completed / Missed ── */
    if (hubState === 'completed' || hubState === 'missed') {
        return (
            <HubContainer>
                <ProviderCard provider={DEFAULT_PROVIDER} mode={hubState} />
                <PostSessionPanel status={hubState} />
            </HubContainer>
        );
    }

    /* ── Scheduled / Imminent ── */
    return (
        <HubContainer isImminent={hubState === 'imminent'}>
            <ProviderCard provider={DEFAULT_PROVIDER} mode={hubState} />
            <SessionStatusBoard session={sessionData} hubState={hubState} />

            {/* Voice Note Preview */}
            {hubState === 'scheduled' || hubState === 'imminent' ? <VoiceNoteWelcome isImminent={hubState === 'imminent'} /> : null}

            {/* Readiness → hide when imminent to reduce noise */}
            {hubState !== 'imminent' && (
                <div className="mt-2">
                    <ReadinessManager items={checklist} onToggle={handleToggle} />
                </div>
            )}

            {/* Primary Action */}
            <div className="px-4 pb-5">
                <JoinButton
                    isImminent={hubState === 'imminent'}
                    meetingUrl={sessionData.meetingUrl}
                />
                {/* Secondary actions */}
                <div className="flex items-center justify-center gap-4 mt-3">
                    <Link href={createPageUrl('MyAppointments')}>
                        <button className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                            تفاصيل الموعد
                        </button>
                    </Link>
                    <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                    <Link href={createPageUrl('BookAppointment')}>
                        <button className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                            إعادة جدولة
                        </button>
                    </Link>
                </div>
            </div>
        </HubContainer>
    );
}

/* ══════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════ */

/* ── Hub Container Card ── */
function HubContainer({ children, isImminent = false }: { children: React.ReactNode; isImminent?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 150 }}
            className="relative overflow-hidden rounded-[26px] liquid-panel bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/50 dark:border-white/5"
            style={{
                boxShadow: '0 8px 32px rgba(16,24,34,0.06)'
            }}
        >
            {/* Ambient Base Layer */}
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.8) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
            {/* Top accent bar */}
            <div
                className={`absolute top-0 left-0 right-0 h-[3px] bg-[length:200%_100%] ${
                    isImminent ? 'animate-[gradient-x_2s_ease_infinite]' : ''
                }`}
                style={{
                    background: isImminent
                        ? 'linear-gradient(90deg, #10b981, #0d9488, #6366f1, #10b981)'
                        : 'linear-gradient(90deg, #0d9488, #10b981, #6366f1)',
                    backgroundSize: isImminent ? '200% 100%' : '100% 100%',
                }}
            />
            {children}
        </motion.div>
    );
}

/* ── Join Button ── */
function JoinButton({ isImminent, meetingUrl }: { isImminent: boolean; meetingUrl?: string }) {
    return (
        <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
                haptic.impact();
                if (meetingUrl) window.open(meetingUrl, '_blank');
            }}
            disabled={!isImminent}
            className={`w-full py-3.5 rounded-2xl text-white text-[14px] font-bold shadow-md flex items-center justify-center gap-2.5 transition-all relative overflow-hidden ${
                isImminent
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-500 shadow-emerald-500/25 active:shadow-emerald-500/40'
                    : 'bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 cursor-not-allowed opacity-70'
            }`}
        >
            {/* Pulse ring when imminent */}
            {isImminent && (
                <span className="absolute inset-0 rounded-2xl animate-ping opacity-20 bg-emerald-400" style={{ animationDuration: '2s' }} />
            )}
            <span className="relative z-10 flex items-center gap-2">
                انضمام للجلسة
                <Video className="w-4.5 h-4.5" />
            </span>
        </motion.button>
    );
}

/* ── No Appointment CTA ── */
function NoAppointmentCTA() {
    const [interests, setInterests] = useState<string[]>([]);
    const [name, setName] = useState('');

    useEffect(() => {
        try {
            const savedInterests = localStorage.getItem('healthInterests');
            if (savedInterests) setInterests(JSON.parse(savedInterests));
            const savedName = localStorage.getItem('userName');
            if (savedName) setName(savedName);
        } catch (e) {}
    }, []);

    const hasProfile = interests.length > 0;

    return (
        <div className="px-4 pb-4 pt-2">
            {hasProfile && (
                <div className="mb-4 p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-500/10 border border-teal-100/50 dark:border-teal-500/20 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        <span className="text-[13px] font-bold text-teal-800 dark:text-teal-300">ملفك الصحي الأساسي جاهز</span>
                    </div>
                    <p className="text-[11px] text-teal-600/90 dark:text-teal-400/90 leading-relaxed">
                        {name ? `${name}، ` : ''}تم تسجيل اهتماماتك الصحية بنجاح لضمان حصولك على خطة تعافي مخصصة عند حجزك للاستشارة.
                    </p>
                </div>
            )}
            <Link href={createPageUrl('BookAppointment')}>
                <motion.div
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { haptic.selection(); uiSounds.navigate(); }}
                    className="group flex items-center gap-3 p-4 rounded-2xl border border-dashed border-slate-300 dark:border-white/10 bg-white/40 dark:bg-slate-800/30 hover:bg-white/70 dark:hover:bg-slate-800/50 backdrop-blur-md transition-all duration-300 cursor-pointer"
                >
                    <div className="w-12 h-12 rounded-[16px] bg-slate-100/80 dark:bg-slate-700/80 group-hover:bg-white dark:group-hover:bg-slate-600 flex items-center justify-center shadow-sm transition-colors">
                        <Plus className="w-5 h-5 text-slate-400 dark:text-slate-400 group-hover:text-teal-500 transition-colors" />
                    </div>
                    <div className="flex-1">
                        <p className="text-[14px] font-bold text-slate-700 dark:text-white">لا توجد مواعيد قادمة</p>
                        <p className="text-[11px] text-teal-600 dark:text-teal-400 font-bold mt-0.5 flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            {hasProfile ? 'ناقش ملفك مع الطبيب الآن' : 'احجز جلسة مع د. عمر'}
                            <motion.span animate={{ x: [0, -3, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                                <ArrowLeft className="w-3.5 h-3.5" />
                            </motion.span>
                        </p>
                    </div>
                </motion.div>
            </Link>
        </div>
    );
}

