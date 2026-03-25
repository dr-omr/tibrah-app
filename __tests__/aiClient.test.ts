/**
 * AI Client Tests
 * Tests for aiClient methods with fetch mocking
 */
import { aiClient } from '@/components/ai/aiClient';

// Mock ConversationStore
jest.mock('@/lib/ConversationStore', () => ({
    conversationStore: {
        startConversation: jest.fn(),
        addMessage: jest.fn(),
        getCurrentConversation: jest.fn(() => []),
        clearCurrentConversation: jest.fn(),
    }
}));

// Helper to mock fetch
const mockFetch = (response: object, ok = true, status = 200) => {
    global.fetch = jest.fn().mockResolvedValue({
        ok,
        status,
        json: jest.fn().mockResolvedValue(response),
        text: jest.fn().mockResolvedValue(JSON.stringify(response)),
    });
};

describe('AI Client', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock sessionStorage
        const store: Record<string, string> = {};
        Object.defineProperty(window, 'sessionStorage', {
            value: {
                getItem: (key: string) => store[key] || null,
                setItem: (key: string, value: string) => { store[key] = value; },
                removeItem: (key: string) => { delete store[key]; },
            },
            writable: true,
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('isEnabled', () => {
        test('should return true', () => {
            expect(aiClient.isEnabled()).toBe(true);
        });
    });

    describe('generateSuggestions', () => {
        test('should return suggestions from AI', async () => {
            mockFetch({ text: 'نصائح اليوم\nاشرب ماء\nتمرن يومياً\nنم مبكراً' });

            const result = await aiClient.generateSuggestions({});
            expect(result.focus_text).toBe('نصائح اليوم');
            expect(result.suggestions.length).toBeGreaterThan(0);
        });

        test('should return fallback on error', async () => {
            global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

            const result = await aiClient.generateSuggestions({});
            expect(result.focus_text).toBe('تعذر تحميل النصائح');
        });
    });

    describe('summarize', () => {
        test('should return summary text', async () => {
            mockFetch({ text: 'هذا ملخص النص' });

            const result = await aiClient.summarize('نص طويل جداً');
            expect(result).toBe('هذا ملخص النص');
        });

        test('should return fallback on error', async () => {
            global.fetch = jest.fn().mockRejectedValue(new Error('fail'));

            const result = await aiClient.summarize('test');
            expect(result).toBe('تعذر إنشاء الملخص.');
        });
    });

    describe('chat', () => {
        test('should return AI response on success', async () => {
            mockFetch({ text: 'مرحبا! كيف أقدر أساعدك؟' });

            const result = await aiClient.chat([{ role: 'user', content: 'مرحبا' }]);
            expect(result).toBe('مرحبا! كيف أقدر أساعدك؟');
            expect(global.fetch).toHaveBeenCalledWith('/api/chat-gemini', expect.any(Object));
        });

        test('should return error message on API failure', async () => {
            mockFetch({ error: 'خطأ في الخادم' }, false, 500);

            const result = await aiClient.chat([{ role: 'user', content: 'test' }]);
            expect(result).toContain('⚠️');
        });

        test('should return error message on network failure', async () => {
            global.fetch = jest.fn().mockRejectedValue(new Error('Failed to fetch'));

            const result = await aiClient.chat([{ role: 'user', content: 'test' }]);
            expect(result).toContain('⚠️');
        });

        test('should note Groq fallback usage', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            mockFetch({ text: 'response', isGroqFallback: true });

            await aiClient.chat([{ role: 'user', content: 'test' }]);
            expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Groq fallback'));
            consoleSpy.mockRestore();
        });
    });

    describe('analyzeImage', () => {
        test('should return analysis text on success', async () => {
            mockFetch({ text: 'تحليل الصورة: نتائج طبيعية' });

            const result = await aiClient.analyzeImage('base64data', 'image/jpeg', 'lab');
            expect(result).toBe('تحليل الصورة: نتائج طبيعية');
        });

        test('should throw on API error', async () => {
            mockFetch({ error: 'فشل التحليل' }, false, 400);

            await expect(aiClient.analyzeImage('bad', 'image/png')).rejects.toThrow();
        });
    });

    describe('analyzeHealth', () => {
        test('should return analysis data on success', async () => {
            mockFetch({ data: { severity: 'low', recommendation: 'Stay hydrated' } });

            const result = await aiClient.analyzeHealth('symptom_analysis', { symptoms: ['headache'] });
            expect(result).toEqual({ severity: 'low', recommendation: 'Stay hydrated' });
        });

        test('should throw user-friendly error on rate limit', async () => {
            mockFetch({ error: 'طلبات كثيرة' }, false, 429);

            await expect(aiClient.analyzeHealth('test', {})).rejects.toThrow(/ضغط كبير|الانتظار/);
        });

        test('should throw user-friendly error on network failure', async () => {
            global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));

            await expect(
                aiClient.analyzeHealth('test', {})
            ).rejects.toThrow(/الاتصال|الإنترنت/);
        });

        test('should throw offline error when not connected', async () => {
            Object.defineProperty(navigator, 'onLine', { value: false, writable: true });

            await expect(
                aiClient.analyzeHealth('test', {})
            ).rejects.toThrow(/غير متصل/);

            // Restore
            Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
        });
    });

    describe('convenience methods', () => {
        test('analyzeSymptoms should call analyzeHealth', async () => {
            mockFetch({ data: { severity: 'medium' } });

            const result = await aiClient.analyzeSymptoms(['headache', 'fever']);
            expect(result).toEqual({ severity: 'medium' });
            expect(global.fetch).toHaveBeenCalledWith('/api/ai-analyze', expect.any(Object));
        });
    });

    describe('clearConversation', () => {
        test('should clear session storage', () => {
            window.sessionStorage.setItem('tibrah_chat_session', 'test_session');
            aiClient.clearConversation();
            expect(window.sessionStorage.getItem('tibrah_chat_session')).toBeNull();
        });
    });
});
