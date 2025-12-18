import { useState, useCallback } from 'react';
import { aiClient } from './aiClient';

export function useAI() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateSuggestions = useCallback(async (context) => {
        setLoading(true);
        setError(null);
        try {
            const result = await aiClient.generateSuggestions(context);
            return result;
        } catch (err) {
            setError(err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const summarize = useCallback(async (text, type) => {
        setLoading(true);
        setError(null);
        try {
            const result = await aiClient.summarize(text, type);
            return result;
        } catch (err) {
            setError(err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const chat = useCallback(async (messages, context, knowledgeBase) => {
        setLoading(true);
        setError(null);
        try {
            const result = await aiClient.chat(messages, context, knowledgeBase);
            return result;
        } catch (err) {
            setError(err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        generateSuggestions,
        summarize,
        chat,
        isEnabled: aiClient.isEnabled
    };
}