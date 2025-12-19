/**
 * Base44 Client - API client for health platform
 * This provides integration with the Base44 backend for:
 * - Entity management (HealthMetric, DailyLog, Comment)
 * - Authentication (auth.me, auth.updateMe)
 * - AI/LLM integration (Core.InvokeLLM)
 */

// Types for entity operations
interface EntityBase {
    id?: string;
    created_at?: string;
    updated_at?: string;
    // Allow any additional properties
    [key: string]: unknown;
}

interface HealthMetric extends EntityBase {
    metric_type: string;
    value: number;
    unit: string;
    recorded_at: string;
    notes?: string;
}

interface DailyLog extends EntityBase {
    date: string;
    mood?: number;
    energy_level?: number;
    sleep_quality?: number;
    stress_level?: number;
    notes?: string;
    exercise?: {
        type: string;
        duration_minutes: number;
    };
}

interface Comment extends EntityBase {
    target_type: string;
    target_id: string;
    content: string;
    rating?: number;
    user_name?: string;
}

interface User {
    id: string;
    email?: string;
    name?: string;
    settings?: Record<string, unknown>;
}

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, orderBy as firestoreOrderBy, limit as firestoreLimit } from 'firebase/firestore';

// Helper to determine mode
const isFirebaseReady = () => {
    return !!db;
};

// Create entity operations helper
function createEntityOperations<T extends EntityBase>(entityName: string) {
    const storageKey = `base44_${entityName}`;
    const collectionRef = isFirebaseReady() ? collection(db, entityName) : null;

    // --- Local Storage Implementation (Fallback) ---
    const getLocalAll = (): T[] => {
        if (typeof window === 'undefined') return [];
        try {
            const data = localStorage.getItem(storageKey);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    };

    const saveLocalAll = (items: T[]) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(storageKey, JSON.stringify(items));
        }
    };

    return {
        async list(orderBy?: string, limit?: number): Promise<T[]> {
            if (isFirebaseReady() && collectionRef) {
                try {
                    // Basic query construction
                    // Note: Complex ordering/filtering in Firestore requires indexes.
                    // For now, we fetch all and sort client-side to be safe, 
                    // or implement basic optimization.
                    const snapshot = await getDocs(collectionRef);
                    let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));

                    // Client-side sort/limit for consistency without indexes
                    if (orderBy) {
                        const desc = orderBy.startsWith('-');
                        const field = desc ? orderBy.slice(1) : orderBy;
                        items.sort((a, b) => {
                            const aVal = (a as any)[field];
                            const bVal = (b as any)[field];
                            if (desc) return String(bVal).localeCompare(String(aVal));
                            return String(aVal).localeCompare(String(bVal));
                        });
                    }
                    if (limit) items = items.slice(0, limit);
                    return items;
                } catch (e) {
                    console.warn(`Firestore list failed for ${entityName}, falling back to local.`, e);
                }
            }

            // Fallback to Local
            let items = getLocalAll();
            if (orderBy) {
                const desc = orderBy.startsWith('-');
                const field = desc ? orderBy.slice(1) : orderBy;
                items.sort((a, b) => {
                    const aVal = (a as any)[field];
                    const bVal = (b as any)[field];
                    if (desc) return String(bVal).localeCompare(String(aVal));
                    return String(aVal).localeCompare(String(bVal));
                });
            }
            if (limit) items = items.slice(0, limit);
            return items;
        },

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async filter(criteria: Record<string, any>, orderBy?: string, limit?: number): Promise<T[]> {
            // For simplicity in this hybrid migration, we'll list all and filter in memory.
            // In a full production app, you'd build a structured Firestore Query here.
            const allItems = await this.list(orderBy);

            let filtered = allItems.filter(item => {
                return Object.entries(criteria).every(([key, value]) => {
                    const itemValue = (item as any)[key];
                    if (typeof value === 'object' && value !== null) {
                        if ('$in' in value) return (value.$in as unknown[]).includes(itemValue);
                        if ('$ne' in value) return itemValue !== value.$ne;
                    }
                    return itemValue === value;
                });
            });

            if (limit) filtered = filtered.slice(0, limit);
            return filtered;
        },

        async get(id: string): Promise<T | null> {
            if (isFirebaseReady() && db) {
                try {
                    const docRef = doc(db, entityName, id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        return { id: docSnap.id, ...docSnap.data() } as T;
                    }
                    return null;
                } catch (e) {
                    console.warn(`Firestore get failed for ${entityName} ${id}`, e);
                }
            }

            // Fallback
            const items = getLocalAll();
            return items.find(item => item.id === id) || null;
        },

        async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
            const newItem = {
                ...data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            } as T;

            if (isFirebaseReady() && collectionRef) {
                try {
                    // Auto-generate ID if not provided logic is handled by doc()
                    // But we want to return the ID.
                    // Let's use a new doc ref to get ID
                    const newDocRef = doc(collectionRef);
                    newItem.id = newDocRef.id;
                    await setDoc(newDocRef, newItem);
                    return newItem;
                } catch (e) {
                    console.error(`Firestore create failed for ${entityName}`, e);
                    // Continue to fallback
                }
            }

            // Fallback
            newItem.id = `${entityName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const items = getLocalAll();
            items.push(newItem);
            saveLocalAll(items);
            return newItem;
        },

        async update(id: string, data: Partial<T>): Promise<T> {
            const updateData = {
                ...data,
                updated_at: new Date().toISOString()
            };

            if (isFirebaseReady() && db) {
                try {
                    const docRef = doc(db, entityName, id);
                    await updateDoc(docRef, updateData);
                    // Return updated
                    const updatedSnap = await getDoc(docRef);
                    return { id: updatedSnap.id, ...updatedSnap.data() } as T;
                } catch (e) {
                    console.error(`Firestore update failed for ${entityName} ${id}`, e);
                }
            }

            // Fallback
            const items = getLocalAll();
            const index = items.findIndex(item => item.id === id);
            if (index === -1) throw new Error(`${entityName} with id ${id} not found`);

            items[index] = { ...items[index], ...updateData };
            saveLocalAll(items);
            return items[index];
        },

        async delete(id: string): Promise<void> {
            if (isFirebaseReady() && db) {
                try {
                    await deleteDoc(doc(db, entityName, id));
                    return;
                } catch (e) {
                    console.error(`Firestore delete failed for ${entityName} ${id}`, e);
                }
            }

            // Fallback
            const items = getLocalAll();
            const filtered = items.filter(item => item.id !== id);
            saveLocalAll(filtered);
        }
    };
}

// Base44 client implementation
export const base44 = {
    // Entity management - All entities including new health tracking
    entities: {
        // Health & Medical
        UserHealth: createEntityOperations<EntityBase>('user_health'),
        HealthMetric: createEntityOperations<HealthMetric>('health_metrics'),
        DailyLog: createEntityOperations<DailyLog>('daily_logs'),
        SymptomLog: createEntityOperations<EntityBase>('symptom_logs'),
        LabResult: createEntityOperations<EntityBase>('lab_results'),
        DiagnosticResult: createEntityOperations<EntityBase>('diagnostic_results'),

        // NEW: Medication Management
        Medication: createEntityOperations<EntityBase>('medications'),
        MedicationLog: createEntityOperations<EntityBase>('medication_logs'),

        // NEW: Water & Sleep Tracking
        WaterLog: createEntityOperations<EntityBase>('water_logs'),
        SleepLog: createEntityOperations<EntityBase>('sleep_logs'),

        // Appointments & Reminders
        Appointment: createEntityOperations<EntityBase>('appointments'),
        Reminder: createEntityOperations<EntityBase>('reminders'),
        DoctorRecommendation: createEntityOperations<EntityBase>('doctor_recommendations'),

        // Courses & Learning
        Course: createEntityOperations<EntityBase>('courses'),
        Lesson: createEntityOperations<EntityBase>('lessons'),
        CourseEnrollment: createEntityOperations<EntityBase>('course_enrollments'),

        // Frequencies
        Frequency: createEntityOperations<EntityBase>('frequencies'),
        RifeFrequency: createEntityOperations<EntityBase>('rife_frequencies'),

        // Library
        KnowledgeArticle: createEntityOperations<EntityBase>('knowledge_articles'),

        // Shop
        Product: createEntityOperations<EntityBase>('products'),
        CartItem: createEntityOperations<EntityBase>('cart_items'),

        // Programs
        HealthProgram: createEntityOperations<EntityBase>('health_programs'),

        // Comments
        Comment: createEntityOperations<Comment>('comments'),

        // Users
        User: createEntityOperations<EntityBase>('users')
    },

    // Authentication
    auth: {
        async me(): Promise<User | null> {
            try {
                if (typeof window === 'undefined') return null;
                const userData = localStorage.getItem('base44_user');
                return userData ? JSON.parse(userData) : null;
            } catch {
                return null;
            }
        },

        async isAuthenticated(): Promise<boolean> {
            const user = await this.me();
            return user !== null;
        },

        async redirectToLogin(returnUrl?: string): Promise<void> {
            if (typeof window === 'undefined') return;
            // Store the return URL for after login
            if (returnUrl) {
                localStorage.setItem('base44_return_url', returnUrl);
            }
            // Redirect to login page
            window.location.href = '/login';
        },

        async updateMe(data: Partial<User>): Promise<User> {
            const current = await this.me();
            const updated = {
                ...current,
                ...data,
                id: current?.id || `user_${Date.now()}`
            };
            if (typeof window !== 'undefined') {
                localStorage.setItem('base44_user', JSON.stringify(updated));
            }
            return updated;
        },

        async login(email: string, password: string): Promise<User> {
            // Mock login - in production this would hit an API
            const user: User = {
                id: `user_${Date.now()}`,
                email,
                name: email.split('@')[0]
            };
            if (typeof window !== 'undefined') {
                localStorage.setItem('base44_user', JSON.stringify(user));

                // Check for return URL
                const returnUrl = localStorage.getItem('base44_return_url');
                if (returnUrl) {
                    localStorage.removeItem('base44_return_url');
                    window.location.href = returnUrl;
                }
            }

            return user;
        },

        async logout(): Promise<void> {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('base44_user');
            }
        }
    },

    // Integrations (AI/LLM)
    integrations: {
        Core: {
            async InvokeLLM(options: {
                prompt: string;
                response_json_schema?: object;
            }): Promise<unknown> {
                // In production, this would call an actual LLM API
                // For now, return mock responses or throw an error
                // that the aiClient can handle with fallbacks

                console.log('[Base44] InvokeLLM called with:', options.prompt.slice(0, 100) + '...');

                // If we have a schema, return a mock object
                if (options.response_json_schema) {
                    const schema = options.response_json_schema as Record<string, unknown>;
                    if (schema.properties) {
                        const props = schema.properties as Record<string, { type: string }>;
                        const result: Record<string, unknown> = {};

                        for (const [key, propDef] of Object.entries(props)) {
                            if (propDef.type === 'string') {
                                result[key] = 'مثال نص عربي';
                            } else if (propDef.type === 'number') {
                                result[key] = 75;
                            } else if (propDef.type === 'array') {
                                result[key] = [];
                            } else if (propDef.type === 'object') {
                                result[key] = {};
                            }
                        }

                        return result;
                    }
                }

                // Return a default text response
                return "يا غالي، هذا رد تجريبي من النظام.";
            }
        }
    }
};

export default base44;
