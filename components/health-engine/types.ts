// components/health-engine/types.ts
// THIE — Tibrah Health Intelligence Engine
// All TypeScript types shared across the engine

export type TriageLevel = 'emergency' | 'urgent' | 'needs_doctor' | 'review' | 'manageable';

export type StepId =
    | 'welcome'
    | 'pathway'
    | 'redflags'
    | 'clinical'
    | 'emotional'
    | 'analyzing'
    | 'result';

export interface Pathway {
    id: string;
    label: string;
    emoji: string;
    color: string;
    gradient: [string, string];
    description: string;
    redFlags: RedFlag[];
    clinicalQuestions: ClinicalQuestion[];
}

export interface RedFlag {
    id: string;
    text: string;
    level: 'emergency' | 'urgent';
    actionMessage: string;
}

export interface ClinicalQuestion {
    id: string;
    text: string;
    type: 'single' | 'multiple' | 'scale' | 'text';
    options?: string[];
    min?: number;
    max?: number;
}

export interface EngineAnswers {
    pathwayId: string;
    severity: number;
    duration: string;
    redFlags: string[];
    hasEmergencyFlag: boolean;
    emergencyMessage: string;
    clinicalAnswers: Record<string, string | string[] | number>;
    emotionalContext: string[];
    emotionalNote: string;
    freeText: string;
}

export type AnswerValue = string | string[] | number;
