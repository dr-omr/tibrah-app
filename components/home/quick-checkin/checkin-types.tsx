// components/home/quick-checkin/checkin-types.ts
// ════════════════════════════════════════════════════════════════════
// TIBRAH — QuickCheckIn Types, Constants & Helpers
// ════════════════════════════════════════════════════════════════════

import { Activity, Brain, HeartPulse, ActivitySquare, Zap, Clock, AlertCircle, Wind, Thermometer } from 'lucide-react';
import type { TriageLevel } from '@/lib/clinicalPathways';

// Clinical Flow Steps
export type IntakeStep =
    | 'welcome' | 'demographics' | 'chief_complaint'
    | 'primary_selection' | 'routing_validation' | 'red_flags'
    | 'hpi_dynamic' | 'socrates' | 'pmh' | 'emotional'
    | 'review' | 'analyzing' | 'complete';

export const TRIAGE_PRIORITY = { emergency: 4, urgent_sameday: 3, near_review: 2, routine: 1 };

export const IconMap: Record<string, any> = {
    'Brain': Brain,
    'HeartPulse': HeartPulse,
    'Wind': Wind,
    'Thermometer': Thermometer,
    'ActivitySquare': ActivitySquare,
    'Activity': Activity,
    'Zap': Zap,
    'Clock': Clock,
    'AlertCircle': AlertCircle,
};

export interface ClinicalData {
    orientation: string;
    demographics: { age: string; gender: string; pregnancy: string };
    chiefComplaintCategories: string[];
    primaryComplaintId: string | null;
    suggestedCategories: string[];
    openNarrative: string;
    hasUrgentRedFlag: boolean;
    highestTriageLevel: TriageLevel | 'routine';
    redFlagsTriggered: { id: string; msg: string; level?: TriageLevel }[];
    hpiAnswers: Record<string, any>;
    socratesAnswers: Record<string, any>;
    pastMedicalHistory: string[];
    currentMeds: string;
    allergies: string;
    additionalNotes: string;
    emotionalState: {
        stress: number;
        sleep: string;
        details: string;
        behavioral_contributors: string[];
        repeated_pattern_flag: boolean;
    };
}

export const INITIAL_CLINICAL_DATA: ClinicalData = {
    orientation: 'new_issue',
    demographics: { age: '', gender: '', pregnancy: '' },
    chiefComplaintCategories: [],
    primaryComplaintId: null,
    suggestedCategories: [],
    openNarrative: '',
    hasUrgentRedFlag: false,
    highestTriageLevel: 'routine',
    redFlagsTriggered: [],
    hpiAnswers: {},
    socratesAnswers: {},
    pastMedicalHistory: [],
    currentMeds: '',
    allergies: '',
    additionalNotes: '',
    emotionalState: {
        stress: 5,
        sleep: '',
        details: '',
        behavioral_contributors: [],
        repeated_pattern_flag: false,
    },
};

export const NONE_OPTION = 'لا، ليست لدي أي من هذه الأعراض المصاحبة';

export const getEmotionalPrompt = (complaintId: string | null): string => {
    switch (complaintId) {
        case 'headache': return 'الأعراض المرتبطة بالرأس غالباً ما تنشط مع زيادة الضغوطات الفكرية، كثرة التفكير الإيقاعي، ومحاولة التحكم المفرط.';
        case 'chest_pain': return 'أعراض الصدر والخفقان قد ترتبط بالتوتر الشديد، الشعور بالتهديد، أو كبت المشاعر وفقدان الأمان الشعوري.';
        case 'respiratory': return 'أعراض الجهاز التنفسي قد تتأثر بضغوطات تمنعك من التعبير عن نفسك بحرية أو الشعور بالاختناق ضمن محيطك.';
        case 'digestion': return 'المشاكل الهضمية غالباً تمثل استجابة جسدية للقلق من المستقبل أو صعوبة تقبل "وهضم" التغييرات والأحداث الجديدة.';
        case 'urinary': return 'أعراض المسالك البولية قد تظهر بالتزامن مع توترات تخص الحدود الشخصية، العلاقات، أو الشعور بالضغط في بيئتك.';
        case 'fatigue': return 'الإرهاق العام قد يعكس استنزافاً للطاقة في صراعات داخلية أو محاولة تحمل أعباء تفوق طاقتك الشعورية.';
        case 'fever': return 'العدوى والحرارة أحياناً تعقب فترات من الانفعال الشديد أو الاحتراق النفسي كمحاولة من الجسد للراحة الإجبارية.';
        default: return 'الكثير من الأعراض الجسدية تظهر أو تتفاقم كاستجابة طبيعية لتراكم التوتر والضغوطات اليومية.';
    }
};

export function Confetti({ show }: { show: boolean }) {
    if (!show) return null;
    const { motion } = require('framer-motion');
    const particles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 200,
        y: -(Math.random() * 150 + 50),
        rotate: Math.random() * 360,
        color: ['#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'][i % 6],
        size: 5 + Math.random() * 5,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {particles.map(p => (
                <motion.div
                    key={p.id} className="absolute rounded-sm"
                    style={{ width: p.size, height: p.size, backgroundColor: p.color, left: '50%', top: '50%' }}
                    initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
                    animate={{ x: p.x, y: p.y, scale: [0, 1, 0.5], rotate: p.rotate, opacity: [1, 1, 0] }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                />
            ))}
        </div>
    );
}

/** Compute progress bar width by step */
export const getProgressWidth = (step: IntakeStep): string => {
    const map: Record<string, string> = {
        demographics: '8%',
        chief_complaint: '15%',
        primary_selection: '25%',
        routing_validation: '30%',
        red_flags: '40%',
        hpi_dynamic: '50%',
        socrates: '65%',
        pmh: '80%',
        review: '95%',
    };
    return map[step] ?? '100%';
};
