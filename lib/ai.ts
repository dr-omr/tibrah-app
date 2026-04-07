/**
 * Unified AI Client — Single source for Gemini and Groq SDK instances.
 * All API routes should import from here instead of creating their own instances.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Singleton Gemini client (reused across all API routes in the same serverless instance)
export const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

/** Get a Gemini model instance with default or custom config */
export function getGeminiModel(options?: {
    model?: string;
    systemInstruction?: string;
    temperature?: number;
    maxOutputTokens?: number;
    responseMimeType?: string;
}) {
    if (!genAI) return null;

    return genAI.getGenerativeModel({
        model: options?.model || 'gemini-2.5-flash',
        ...(options?.systemInstruction && { systemInstruction: options.systemInstruction }),
        generationConfig: {
            temperature: options?.temperature ?? 0.7,
            maxOutputTokens: options?.maxOutputTokens ?? 2000,
            ...(options?.responseMimeType && { responseMimeType: options.responseMimeType }),
        },
    });
}

/** Lazy Groq client factory (dynamic import to keep bundle small) */
export async function getGroqClient() {
    if (!GROQ_API_KEY) return null;
    const Groq = (await import('groq-sdk')).default;
    return new Groq({ apiKey: GROQ_API_KEY });
}

/** Check if Gemini is configured */
export const isGeminiConfigured = !!GEMINI_API_KEY;

/** Check if Groq is configured */
export const isGroqConfigured = !!GROQ_API_KEY;
