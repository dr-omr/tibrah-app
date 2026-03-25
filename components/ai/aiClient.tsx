import { conversationStore } from '@/lib/ConversationStore';

// AI is now server-side only via /api/chat-gemini
const isEnabled = (): boolean => {
    return true;
};

const DISCLAIMER = "هذا محتوى توعوي/تثقيفي، ولا يغني عن استشارة الطبيب أو المختص.";

export const aiClient = {
    isEnabled,

    async generateSuggestions(context: any) {
        // Call real AI for suggestions
        try {
            const response = await fetch('/api/chat-gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: 'أعطني 3 نصائح صحية قصيرة لليوم بناءً على حالتي الصحية',
                    healthContext: context
                })
            });
            const data = await response.json();
            if (data.text) {
                return {
                    focus_text: data.text.split('\n')[0] || "نصائح اليوم 🌿",
                    suggestions: data.text.split('\n').slice(1, 4).filter((s: string) => s.trim())
                };
            }
        } catch (e) {
            console.error('[AI] Suggestions error:', e);
        }
        return {
            focus_text: "تعذر تحميل النصائح",
            suggestions: ["جرب مرة أخرى لاحقاً"]
        };
    },

    async summarize(text: string, contextType: string = 'general') {
        try {
            const response = await fetch('/api/chat-gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `لخص هذا النص باختصار: ${text}`
                })
            });
            const data = await response.json();
            if (data.text) return data.text;
        } catch (e) {
            console.error('[AI] Summary error:', e);
        }
        return "تعذر إنشاء الملخص.";
    },

    async chat(messages: Array<{ role: string, content: string }>, contextData?: any, knowledgeBase?: any) {
        const lastUserMessage = messages[messages.length - 1]?.content || '';

        conversationStore.startConversation();
        conversationStore.addMessage('user', lastUserMessage);

        // Get or create session ID for conversation memory
        let sessionId = typeof window !== 'undefined' ? sessionStorage.getItem('tibrah_chat_session') : null;
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('tibrah_chat_session', sessionId);
            }
        }

        try {
            console.log('[AI Client] 🚀 Calling Gemini API...');

            const response = await fetch(`/api/chat-gemini`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: lastUserMessage,
                    sessionId: sessionId,
                    healthContext: contextData?.healthProfile || {},
                }),
            });

            const textResponse = await response.text();
            console.log('[AI Client] Raw response:', textResponse.substring(0, 100));

            let data;
            try {
                data = JSON.parse(textResponse);
            } catch (e) {
                console.error('[AI Client] Failed to parse JSON:', textResponse.substring(0, 200));
                throw new Error(`خطأ في تحليل الرد: ${response.status}`);
            }

            if (!response.ok) {
                console.error('[AI Client] API error:', data);
                throw new Error(data.error || `خطأ في الخادم: ${response.status}`);
            }

            if (data.text) {
                console.log('[AI Client] ✅ SUCCESS - Got real AI response!');
                if (data.isGroqFallback) {
                    console.log('[AI Client] ⚠️ Note: Used Groq fallback');
                }
                if (data.isLocalFallback) {
                    console.log('[AI Client] ⚠️ Note: Used local fallback');
                }
                conversationStore.addMessage('assistant', data.text);
                return data.text;
            }

            throw new Error('لم يتم استلام رد من الذكاء الاصطناعي');

        } catch (error: any) {
            console.error('[AI Client] ❌ ERROR:', error);

            const errorMessage = `⚠️ عذراً، حدث خطأ في الاتصال بالذكاء الاصطناعي.\n\n**السبب:** ${error.message || 'خطأ غير معروف'}\n\n**الحلول:**\n1. تأكد من اتصالك بالإنترنت\n2. أعد المحاولة بعد قليل\n3. إذا استمرت المشكلة، راسلنا على واتساب`;

            conversationStore.addMessage('assistant', errorMessage);
            return errorMessage;
        }
    },

    /**
     * Streaming chat - reveals response word-by-word for typewriter effect
     * Falls back to regular chat if streaming fails
     */
    async chatStream(
        messages: Array<{ role: string, content: string }>,
        onChunk: (text: string, done: boolean) => void,
        contextData?: any
    ) {
        const lastUserMessage = messages[messages.length - 1]?.content || '';
        conversationStore.startConversation();
        conversationStore.addMessage('user', lastUserMessage);

        let sessionId = typeof window !== 'undefined' ? sessionStorage.getItem('tibrah_chat_session') : null;
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('tibrah_chat_session', sessionId);
            }
        }

        try {
            const response = await fetch('/api/chat-gemini', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: lastUserMessage,
                    sessionId,
                    healthContext: contextData?.healthProfile || {},
                }),
            });

            const data = await response.json();
            if (!response.ok || !data.text) {
                throw new Error(data.error || 'لم يتم استلام رد');
            }

            const fullText = data.text;
            conversationStore.addMessage('assistant', fullText);

            // Simulate streaming with word-by-word reveal
            const words = fullText.split(/(?<=\s)/);
            let accumulated = '';
            const chunkSize = 2; // words per tick
            const delay = 30; // ms between chunks

            for (let i = 0; i < words.length; i += chunkSize) {
                const chunk = words.slice(i, i + chunkSize).join('');
                accumulated += chunk;
                const isDone = i + chunkSize >= words.length;
                onChunk(accumulated, isDone);
                if (!isDone) {
                    await new Promise(r => setTimeout(r, delay));
                }
            }
            // Ensure final call with done=true
            onChunk(fullText, true);
            return fullText;

        } catch (error: any) {
            console.error('[AI Client] ❌ Stream Error:', error);
            const errorMessage = `⚠️ عذراً، حدث خطأ: ${error.message}`;
            conversationStore.addMessage('assistant', errorMessage);
            onChunk(errorMessage, true);
            return errorMessage;
        }
    },

    clearConversation() {
        conversationStore.clearCurrentConversation();
        // Clear session ID too
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('tibrah_chat_session');
        }
    },

    getConversationHistory() {
        return conversationStore.getCurrentConversation();
    },

    async analyzeImage(base64: string, mimeType: string, mode: 'lab' | 'face' = 'lab') {
        try {
            console.log(`[AI Client] 📸 Analyzing image (Mode: ${mode})...`);
            const response = await fetch('/api/analyze-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: base64, mimeType, mode })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'فشل تحليل الصورة');
            }

            console.log('[AI Client] ✅ Image analysis complete');
            return data.text;
        } catch (error: any) {
            console.error('[AI Client] ❌ Image Analysis Error:', error);
            throw new Error(`فشل تحليل الصورة: ${error.message}`);
        }
    },

    /**
     * Universal AI Analysis — calls /api/ai-analyze for all analysis types
     * @param type - Analysis type (symptom_analysis, health_data_analysis, etc.)
     * @param data - The data to analyze
     * @param context - Optional additional context
     */
    async analyzeHealth(type: string, data: any, context?: any) {
        // Quick offline check before fetching
        if (typeof window !== 'undefined' && !navigator.onLine) {
            console.warn(`[AI Client] 🚫 Offline: Could not analyze ${type}`);
            throw new Error('أنت غير متصل بالإنترنت. يرجى التحقق من اتصالك والمحاولة مرة أخرى.');
        }

        try {
            console.log(`[AI Client] 🧠 Running AI analysis: ${type}...`);
            const response = await fetch('/api/ai-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, data, context })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'فشل التحليل');
            }

            console.log(`[AI Client] ✅ Analysis complete: ${type}`);
            return result.data;
        } catch (error: any) {
            console.error(`[AI Client] ❌ Analysis Error (${type}):`, error);
            
            // Provide user-friendly error messages based on the error type
            if (error.message?.includes('429') || error.message?.includes('طلبات كثيرة')) {
                 throw new Error('عذراً، هناك ضغط كبير على الخادم. يرجى الانتظار دقيقة والمحاولة مرة أخرى.');
            }
            if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
                 throw new Error('تعذر الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.');
            }
            if (error.message?.includes('API key')) {
                 throw new Error('خدمة التحليل غير متوفرة حالياً بسبب مشكلة في الإعدادات.');
            }
            
            // Throw a generic but friendly error if none of the specific cases match
            throw new Error(error.message || 'عذراً، حدث خطأ غير متوقع أثناء عملية التحليل. يرجى المحاولة مرة أخرى لاحقاً.');
        }
    },

    // Convenience methods for common analysis types
    async analyzeSymptoms(symptoms: string[], bodyArea?: string) {
        return this.analyzeHealth('symptom_analysis', { symptoms, body_area: bodyArea });
    },

    async analyzeBodyMap(area: string, currentEmotions?: string[]) {
        return this.analyzeHealth('body_map_analysis', { area, current_emotions: currentEmotions });
    },

    async analyzeHealthData(metrics: any, dailyLogs?: any[], symptoms?: any[]) {
        return this.analyzeHealth('health_data_analysis', { metrics, daily_logs: dailyLogs, symptoms });
    },

    async generateWeeklyReport(weeklyData: any) {
        return this.analyzeHealth('weekly_report', weeklyData);
    },

    async analyzeSleep(sleepData: any) {
        return this.analyzeHealth('sleep_analysis', sleepData);
    },

    async analyzeMood(moodData: any) {
        return this.analyzeHealth('mood_analysis', moodData);
    },

    async planMeals(healthProfile: any, preferences?: any) {
        return this.analyzeHealth('meal_planning', { health_profile: healthProfile, preferences });
    },

    async suggestRecipes(ingredients?: string[], healthGoals?: string[]) {
        return this.analyzeHealth('recipe_suggestion', { available_ingredients: ingredients, health_goals: healthGoals });
    },

    async analyzeMedicalFile(profile: any, conditions?: any[], allergies?: string[]) {
        return this.analyzeHealth('medical_file_analysis', { profile, chronic_conditions: conditions, allergies });
    },

    async recommendCourses(healthProfile: any, interests?: string[]) {
        return this.analyzeHealth('course_recommendation', { health_profile: healthProfile, interests });
    },

    async recommendProducts(healthProfile: any, symptoms?: string[]) {
        return this.analyzeHealth('product_recommendation', { health_profile: healthProfile, symptoms });
    },

    async analyzeFasting(fastingData: any) {
        return this.analyzeHealth('fasting_analysis', fastingData);
    },

    async suggestAppointment(symptoms: string[], healthProfile?: any) {
        return this.analyzeHealth('appointment_suggestion', { symptoms, health_profile: healthProfile });
    }
};

export type AnalysisType =
    | 'symptom_analysis' | 'body_map_analysis' | 'health_data_analysis'
    | 'weekly_report' | 'sleep_analysis' | 'mood_analysis'
    | 'meal_planning' | 'recipe_suggestion' | 'medical_file_analysis'
    | 'course_recommendation' | 'product_recommendation'
    | 'fasting_analysis' | 'appointment_suggestion';

export const AI_DISCLAIMER = DISCLAIMER;

