/**
 * Tibrah Database Client
 * Provides integration with Firebase Firestore with automatic Local Storage fallback.
 */

import { db as firestoreDb } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

// Types for entity operations
interface EntityBase {
    id?: string;
    created_at?: string;
    updated_at?: string;
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
        calories?: number;
    };
}

interface FastingSession extends EntityBase {
    start_time: string;
    end_time?: string;
    target_hours: number;
    completed: boolean;
    type?: string;
}

interface DoseLog extends EntityBase {
    medication_id?: string;
    medication_name?: string;
    date: string;
    time?: string;
    taken: boolean;
    dose?: string;
}

interface WeightLog extends EntityBase {
    date: string;
    weight: number;
    unit?: string;
    body_fat?: number;
    muscle_mass?: number;
    notes?: string;
}

interface UserHealth extends EntityBase {
    user_id?: string;
    program_id?: string;
    enrolled_at?: string;
    status?: string;
    progress?: number;
}

interface Comment extends EntityBase {
    target_type: string;
    target_id: string;
    content: string;
    rating?: number;
    user_name?: string;
}

interface User extends EntityBase {
    email?: string;
    name?: string;
    settings?: Record<string, unknown>;
}


// Helper to determine mode
const isFirebaseReady = () => {
    return !!firestoreDb;
};

// Create entity operations helper
function createEntityOperations<T extends EntityBase>(entityName: string) {
    const storageKey = `tibrah_db_${entityName}`;
    const collectionRef = isFirebaseReady() ? collection(firestoreDb, entityName) : null;

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
            if (isFirebaseReady() && firestoreDb) {
                try {
                    const docRef = doc(firestoreDb, entityName, id);
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
                    const newDocRef = doc(collectionRef);
                    newItem.id = newDocRef.id;
                    await setDoc(newDocRef, newItem);
                    return newItem;
                } catch (e) {
                    console.error(`Firestore create failed for ${entityName}`, e);
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

            if (isFirebaseReady() && firestoreDb) {
                try {
                    const docRef = doc(firestoreDb, entityName, id);
                    await updateDoc(docRef, updateData);
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
            if (isFirebaseReady() && firestoreDb) {
                try {
                    await deleteDoc(doc(firestoreDb, entityName, id));
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

// Tibrah Database Client
export const db = {
    // Entities
    users: createEntityOperations<User>('users'),
    healthMetrics: createEntityOperations<HealthMetric>('health_metrics'),
    dailyLogs: createEntityOperations<DailyLog>('daily_logs'),
    symptomLogs: createEntityOperations<EntityBase>('symptom_logs'),
    appointments: createEntityOperations<EntityBase>('appointments'),
    products: createEntityOperations<EntityBase>('products'),
    cartItems: createEntityOperations<EntityBase>('cart_items'),
    comments: createEntityOperations<Comment>('comments'),
    foods: createEntityOperations<EntityBase>('foods'),
    recipes: createEntityOperations<EntityBase>('recipes'),

    // Explicit entity names for compatibility during migration (optional, but helpful)
    entities: {
        User: createEntityOperations<User>('users'),
        HealthMetric: createEntityOperations<HealthMetric>('health_metrics'),
        DailyLog: createEntityOperations<DailyLog>('daily_logs'),
        SymptomLog: createEntityOperations<EntityBase>('symptom_logs'),
        Appointment: createEntityOperations<EntityBase>('appointments'),
        Product: createEntityOperations<EntityBase>('products'),
        CartItem: createEntityOperations<EntityBase>('cart_items'),
        Comment: createEntityOperations<Comment>('comments'),
        Course: createEntityOperations<EntityBase>('courses'),
        Lesson: createEntityOperations<EntityBase>('lessons'),
        CourseEnrollment: createEntityOperations<EntityBase>('course_enrollments'),
        KnowledgeArticle: createEntityOperations<EntityBase>('knowledge_articles'),
        LabResult: createEntityOperations<EntityBase>('lab_results'),
        DiagnosticResult: createEntityOperations<EntityBase>('diagnostic_results'),
        Medication: createEntityOperations<EntityBase>('medications'),
        MedicationLog: createEntityOperations<EntityBase>('medication_logs'),
        WaterLog: createEntityOperations<EntityBase>('water_logs'),
        SleepLog: createEntityOperations<EntityBase>('sleep_logs'),
        Reminder: createEntityOperations<EntityBase>('reminders'),
        DoctorRecommendation: createEntityOperations<EntityBase>('doctor_recommendations'),
        HealthProgram: createEntityOperations<EntityBase>('health_programs'),
        Food: createEntityOperations<EntityBase>('foods'),
        Recipe: createEntityOperations<EntityBase>('recipes'),
        // Frequencies (kept for legacy data if needed, but not used in frontend anymore)
        Frequency: createEntityOperations<EntityBase>('frequencies'),
        RifeFrequency: createEntityOperations<EntityBase>('rife_frequencies'),
        FastingSession: createEntityOperations<FastingSession>('fasting_sessions'),
        DoseLog: createEntityOperations<DoseLog>('dose_logs'),
        WeightLog: createEntityOperations<WeightLog>('weight_logs'),
        UserHealth: createEntityOperations<UserHealth>('user_health'),
    },

    // AI Integrations (Simplified)
    integrations: {
        Core: {
            async InvokeLLM(options: { prompt: string; response_json_schema?: object }): Promise<unknown> {
                try {
                    const response = await fetch('/api/llm-invoke', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(options)
                    });

                    if (!response.ok) {
                        throw new Error(`API Error: ${response.status}`);
                    }

                    return await response.json();
                } catch (e) {
                    console.error('[TibrahDB] InvokeLLM Failed:', e);
                    // Fallback client-side safety if fetch completely fails
                    return {
                        error: "Connection failed",
                        fallback_data: true
                    };
                }
            },
            async UploadFile(options: { file: File }): Promise<{ file_url: string }> {
                console.log('[TibrahDB] UploadFile:', options.file.name);

                // Try Firebase Storage if available
                if (isFirebaseReady() && firestoreDb) {
                    try {
                        // Dynamic import to avoid SSR issues if used there
                        const { ref, uploadBytes, getDownloadURL, getStorage } = await import('firebase/storage');
                        const storage = getStorage(firestoreDb.app);

                        const storageRef = ref(storage, `uploads/${Date.now()}_${options.file.name}`);
                        const snapshot = await uploadBytes(storageRef, options.file);
                        const url = await getDownloadURL(snapshot.ref);
                        return { file_url: url };
                    } catch (e) {
                        console.error('[TibrahDB] Firebase Upload Failed:', e);
                        // Fallthrough to local fallback
                    }
                }

                // Fallback: Create local blob URL (temporary)
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve({
                            file_url: URL.createObjectURL(options.file)
                        });
                    }, 1000);
                });
            }
        }
    }
};

export default db;
