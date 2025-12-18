/**
 * Conversation Store
 * Persistent memory for AI chat conversations
 * Stores conversation history and enables context-aware responses
 */

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    metadata?: {
        healthContext?: boolean;
        intent?: string;
        sentiment?: 'positive' | 'neutral' | 'negative';
    };
}

export interface Conversation {
    id: string;
    messages: ChatMessage[];
    startedAt: number;
    lastMessageAt: number;
    summary?: string;
    userMood?: number;
    topics?: string[];
}

const STORAGE_KEY = 'tibrah_conversations';
const MAX_CONVERSATIONS = 10;
const MAX_MESSAGES_PER_CONVERSATION = 50;
const MAX_CONTEXT_MESSAGES = 20; // Last 20 messages for AI context

class ConversationStore {
    private conversations: Map<string, Conversation> = new Map();
    private currentConversationId: string | null = null;

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage(): void {
        if (typeof window === 'undefined') return;

        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const data = JSON.parse(stored) as { conversations: Conversation[] };
                data.conversations.forEach(conv => {
                    this.conversations.set(conv.id, conv);
                });
            }
        } catch (error) {
            console.error('[ConversationStore] Failed to load:', error);
        }
    }

    private saveToStorage(): void {
        if (typeof window === 'undefined') return;

        try {
            const conversationsArray = Array.from(this.conversations.values())
                .sort((a, b) => b.lastMessageAt - a.lastMessageAt)
                .slice(0, MAX_CONVERSATIONS);

            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                conversations: conversationsArray
            }));
        } catch (error) {
            console.error('[ConversationStore] Failed to save:', error);
        }
    }

    // Start or continue a conversation
    startConversation(existingId?: string): string {
        if (existingId && this.conversations.has(existingId)) {
            this.currentConversationId = existingId;
            return existingId;
        }

        const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const conversation: Conversation = {
            id,
            messages: [],
            startedAt: Date.now(),
            lastMessageAt: Date.now(),
            topics: []
        };

        this.conversations.set(id, conversation);
        this.currentConversationId = id;
        this.saveToStorage();

        return id;
    }

    // Add a message to current conversation
    addMessage(
        role: 'user' | 'assistant',
        content: string,
        metadata?: ChatMessage['metadata']
    ): ChatMessage {
        if (!this.currentConversationId) {
            this.startConversation();
        }

        const conversation = this.conversations.get(this.currentConversationId!);
        if (!conversation) {
            throw new Error('No active conversation');
        }

        const message: ChatMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            role,
            content,
            timestamp: Date.now(),
            metadata
        };

        conversation.messages.push(message);
        conversation.lastMessageAt = Date.now();

        // Trim old messages if needed
        if (conversation.messages.length > MAX_MESSAGES_PER_CONVERSATION) {
            conversation.messages = conversation.messages.slice(-MAX_MESSAGES_PER_CONVERSATION);
        }

        // Extract topics from user messages
        if (role === 'user') {
            const detectedTopics = this.detectTopics(content);
            conversation.topics = [...new Set([...(conversation.topics || []), ...detectedTopics])].slice(-10);
        }

        this.saveToStorage();
        return message;
    }

    // Get context for AI (last N messages)
    getContext(): { role: string; content: string }[] {
        if (!this.currentConversationId) return [];

        const conversation = this.conversations.get(this.currentConversationId);
        if (!conversation) return [];

        return conversation.messages
            .slice(-MAX_CONTEXT_MESSAGES)
            .map(msg => ({
                role: msg.role,
                content: msg.content
            }));
    }

    // Get current conversation
    getCurrentConversation(): Conversation | null {
        if (!this.currentConversationId) return null;
        return this.conversations.get(this.currentConversationId) || null;
    }

    // Get all conversations (for history display)
    getAllConversations(): Conversation[] {
        return Array.from(this.conversations.values())
            .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
    }

    // Clear current conversation
    clearCurrentConversation(): void {
        if (this.currentConversationId) {
            this.conversations.delete(this.currentConversationId);
            this.currentConversationId = null;
            this.saveToStorage();
        }
    }

    // Clear all conversations
    clearAll(): void {
        this.conversations.clear();
        this.currentConversationId = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
        }
    }

    // Extract user's name from conversation
    getUserName(): string | null {
        const conversation = this.getCurrentConversation();
        if (!conversation) return null;

        for (const msg of conversation.messages) {
            if (msg.role === 'user') {
                // Look for name patterns in Arabic
                const namePatterns = [
                    /اسمي\s+(.+?)(?:\s|$|،|\.)/,
                    /أنا\s+(.+?)(?:\s|$|،|\.)/,
                    /انا\s+(.+?)(?:\s|$|،|\.)/,
                ];

                for (const pattern of namePatterns) {
                    const match = msg.content.match(pattern);
                    if (match && match[1] && match[1].length < 20) {
                        return match[1].trim();
                    }
                }
            }
        }

        return null;
    }

    // Detect topics from message
    private detectTopics(text: string): string[] {
        const topicKeywords: Record<string, string[]> = {
            'صحة': ['صحة', 'مرض', 'علاج', 'دواء', 'طبيب'],
            'نوم': ['نوم', 'أرق', 'نعاس', 'استيقاظ'],
            'تغذية': ['أكل', 'طعام', 'تغذية', 'حمية', 'سعرات'],
            'رياضة': ['رياضة', 'تمارين', 'مشي', 'جري'],
            'مزاج': ['مزاج', 'حزن', 'فرح', 'قلق', 'توتر', 'اكتئاب'],
            'طاقة': ['طاقة', 'تعب', 'إرهاق', 'نشاط'],
            'ألم': ['ألم', 'وجع', 'صداع', 'ظهر', 'رقبة'],
            'هضم': ['هضم', 'معدة', 'بطن', 'قولون', 'غثيان'],
        };

        const detectedTopics: string[] = [];
        const lowerText = text.toLowerCase();

        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(kw => lowerText.includes(kw))) {
                detectedTopics.push(topic);
            }
        }

        return detectedTopics;
    }

    // Generate conversation summary
    generateSummary(): string {
        const conversation = this.getCurrentConversation();
        if (!conversation || conversation.messages.length === 0) {
            return 'محادثة جديدة';
        }

        const topics = conversation.topics || [];
        const messageCount = conversation.messages.length;
        const userName = this.getUserName();

        let summary = '';
        if (userName) {
            summary += `محادثة مع ${userName}. `;
        }
        if (topics.length > 0) {
            summary += `المواضيع: ${topics.slice(0, 3).join('، ')}. `;
        }
        summary += `${messageCount} رسالة.`;

        return summary;
    }
}

// Singleton instance
export const conversationStore = new ConversationStore();

export default conversationStore;
