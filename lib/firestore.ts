// Firestore Cloud Storage Service
// This service handles all cloud data operations for the admin panel

import {
    collection,
    doc,
    getDocs,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    writeBatch,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Collection names
export const COLLECTIONS = {
    DISEASES: 'emotional_diseases',
    PRODUCTS: 'products',
    SERVICES: 'services',
    APPOINTMENTS: 'appointments',
    USERS: 'users',
    SETTINGS: 'settings',
    FREQUENCIES: 'frequencies',
    TESTIMONIALS: 'testimonials',
    // Meal Planning
    FOODS: 'foods',
    RECIPES: 'recipes',
    MEAL_PLANS: 'meal_plans',
    HEALTH_CONDITIONS: 'health_conditions',
    // Content
    ARTICLES: 'articles',
    PROGRAMS: 'programs',
    HOME_CONTENT: 'home_content',
} as const;

// ═══════════════════════════════════════════════════════════════
// GENERIC CRUD OPERATIONS
// ═══════════════════════════════════════════════════════════════

// Get all documents from a collection
export async function getAllDocuments<T>(collectionName: string): Promise<T[]> {
    if (!db) {
        console.warn('Firestore not initialized, returning empty array');
        return [];
    }

    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as T[];
    } catch (error) {
        console.error(`Error getting documents from ${collectionName}:`, error);
        return [];
    }
}

// Get a single document by ID
export async function getDocumentById<T>(collectionName: string, docId: string): Promise<T | null> {
    if (!db) {
        console.warn('Firestore not initialized');
        return null;
    }

    try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as T;
        }
        return null;
    } catch (error) {
        console.error(`Error getting document ${docId}:`, error);
        return null;
    }
}

// Create a new document with auto-generated ID
export async function createDocument<T extends Record<string, any>>(
    collectionName: string,
    data: T
): Promise<string | null> {
    if (!db) {
        console.warn('Firestore not initialized');
        return null;
    }

    try {
        const docRef = await addDoc(collection(db, collectionName), {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error(`Error creating document in ${collectionName}:`, error);
        return null;
    }
}

// Create or update a document with a specific ID
export async function setDocument<T extends Record<string, any>>(
    collectionName: string,
    docId: string,
    data: T,
    merge: boolean = true
): Promise<boolean> {
    if (!db) {
        console.warn('Firestore not initialized');
        return false;
    }

    try {
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        }, { merge });
        return true;
    } catch (error) {
        console.error(`Error setting document ${docId}:`, error);
        return false;
    }
}

// Update specific fields of a document
export async function updateDocument(
    collectionName: string,
    docId: string,
    data: Record<string, any>
): Promise<boolean> {
    if (!db) {
        console.warn('Firestore not initialized');
        return false;
    }

    try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error(`Error updating document ${docId}:`, error);
        return false;
    }
}

// Delete a document
export async function deleteDocument(collectionName: string, docId: string): Promise<boolean> {
    if (!db) {
        console.warn('Firestore not initialized');
        return false;
    }

    try {
        const docRef = doc(db, collectionName, docId);
        await deleteDoc(docRef);
        return true;
    } catch (error) {
        console.error(`Error deleting document ${docId}:`, error);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════
// BATCH OPERATIONS
// ═══════════════════════════════════════════════════════════════

// Batch write multiple documents
export async function batchWriteDocuments<T extends Record<string, any>>(
    collectionName: string,
    documents: { id?: string; data: T }[]
): Promise<boolean> {
    if (!db) {
        console.warn('Firestore not initialized');
        return false;
    }

    try {
        const batch = writeBatch(db);

        documents.forEach(({ id, data }) => {
            const docRef = id
                ? doc(db, collectionName, id)
                : doc(collection(db, collectionName));

            batch.set(docRef, {
                ...data,
                updatedAt: serverTimestamp()
            }, { merge: true });
        });

        await batch.commit();
        return true;
    } catch (error) {
        console.error(`Error batch writing to ${collectionName}:`, error);
        return false;
    }
}

// ═══════════════════════════════════════════════════════════════
// REAL-TIME LISTENERS
// ═══════════════════════════════════════════════════════════════

// Subscribe to collection changes
export function subscribeToCollection<T>(
    collectionName: string,
    callback: (data: T[]) => void
): (() => void) | null {
    if (!db) {
        console.warn('Firestore not initialized');
        return null;
    }

    const unsubscribe = onSnapshot(
        collection(db, collectionName),
        (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as T[];
            callback(data);
        },
        (error) => {
            console.error(`Error subscribing to ${collectionName}:`, error);
        }
    );

    return unsubscribe;
}

// Subscribe to a single document
export function subscribeToDocument<T>(
    collectionName: string,
    docId: string,
    callback: (data: T | null) => void
): (() => void) | null {
    if (!db) {
        console.warn('Firestore not initialized');
        return null;
    }

    const unsubscribe = onSnapshot(
        doc(db, collectionName, docId),
        (snapshot) => {
            if (snapshot.exists()) {
                callback({ id: snapshot.id, ...snapshot.data() } as T);
            } else {
                callback(null);
            }
        },
        (error) => {
            console.error(`Error subscribing to document ${docId}:`, error);
        }
    );

    return unsubscribe;
}

// ═══════════════════════════════════════════════════════════════
// SPECIFIC DATA OPERATIONS
// ═══════════════════════════════════════════════════════════════

// Emotional Diseases
export interface CloudEmotionalDisease {
    id?: string;
    symptom: string;
    targetOrgan: string;
    organSystem: string;
    organSystemEn: string;
    emotionalConflict: string;
    biologicalPurpose: string;
    treatmentSteps: string[];
    healingAffirmation: string;
    sourceRef: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export const diseasesService = {
    getAll: () => getAllDocuments<CloudEmotionalDisease>(COLLECTIONS.DISEASES),
    getById: (id: string) => getDocumentById<CloudEmotionalDisease>(COLLECTIONS.DISEASES, id),
    create: (data: Omit<CloudEmotionalDisease, 'id'>) => createDocument(COLLECTIONS.DISEASES, data),
    update: (id: string, data: Partial<CloudEmotionalDisease>) => updateDocument(COLLECTIONS.DISEASES, id, data),
    delete: (id: string) => deleteDocument(COLLECTIONS.DISEASES, id),
    subscribe: (callback: (data: CloudEmotionalDisease[]) => void) => subscribeToCollection(COLLECTIONS.DISEASES, callback),

    // Sync local data to cloud
    syncFromLocal: async (localData: CloudEmotionalDisease[]) => {
        const documents = localData.map(d => ({
            id: d.id,
            data: {
                symptom: d.symptom,
                targetOrgan: d.targetOrgan,
                organSystem: d.organSystem,
                organSystemEn: d.organSystemEn,
                emotionalConflict: d.emotionalConflict,
                biologicalPurpose: d.biologicalPurpose,
                treatmentSteps: d.treatmentSteps,
                healingAffirmation: d.healingAffirmation,
                sourceRef: d.sourceRef,
            }
        }));
        return batchWriteDocuments(COLLECTIONS.DISEASES, documents);
    }
};

// Products
export interface CloudProduct {
    id?: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    inStock: boolean;
    featured?: boolean;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export const productsService = {
    getAll: () => getAllDocuments<CloudProduct>(COLLECTIONS.PRODUCTS),
    getById: (id: string) => getDocumentById<CloudProduct>(COLLECTIONS.PRODUCTS, id),
    create: (data: Omit<CloudProduct, 'id'>) => createDocument(COLLECTIONS.PRODUCTS, data),
    update: (id: string, data: Partial<CloudProduct>) => updateDocument(COLLECTIONS.PRODUCTS, id, data),
    delete: (id: string) => deleteDocument(COLLECTIONS.PRODUCTS, id),
    subscribe: (callback: (data: CloudProduct[]) => void) => subscribeToCollection(COLLECTIONS.PRODUCTS, callback),
};

// Services
export interface CloudService {
    id?: string;
    title: string;
    titleYemeni?: string;
    description: string;
    price: number;
    originalPrice?: number;
    duration: string;
    features: string[];
    badge?: string;
    color?: string;
    icon?: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export const servicesService = {
    getAll: () => getAllDocuments<CloudService>(COLLECTIONS.SERVICES),
    getById: (id: string) => getDocumentById<CloudService>(COLLECTIONS.SERVICES, id),
    create: (data: Omit<CloudService, 'id'>) => createDocument(COLLECTIONS.SERVICES, data),
    update: (id: string, data: Partial<CloudService>) => updateDocument(COLLECTIONS.SERVICES, id, data),
    delete: (id: string) => deleteDocument(COLLECTIONS.SERVICES, id),
    subscribe: (callback: (data: CloudService[]) => void) => subscribeToCollection(COLLECTIONS.SERVICES, callback),
};

// Settings
export interface CloudSettings {
    siteName?: string;
    siteDescription?: string;
    contactPhone?: string;
    contactWhatsApp?: string;
    socialLinks?: {
        facebook?: string;
        instagram?: string;
        youtube?: string;
        twitter?: string;
    };
    heroContent?: {
        title?: string;
        subtitle?: string;
        ctaText?: string;
    };
    updatedAt?: Timestamp;
}

export const settingsService = {
    get: () => getDocumentById<CloudSettings>(COLLECTIONS.SETTINGS, 'main'),
    update: (data: Partial<CloudSettings>) => setDocument(COLLECTIONS.SETTINGS, 'main', data),
    subscribe: (callback: (data: CloudSettings | null) => void) =>
        subscribeToDocument(COLLECTIONS.SETTINGS, 'main', callback),
};

// ═══════════════════════════════════════════════════════════════
// MEAL PLANNING DATA TYPES
// ═══════════════════════════════════════════════════════════════

// Nutrition Info
export interface CloudNutritionInfo {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    cholesterol: number;
}

// Food Item
export interface CloudFoodItem {
    id?: string;
    name: string;
    nameAr: string;
    category: string;
    categoryAr: string;
    servingSize: number;
    servingUnit: string;
    nutrition: CloudNutritionInfo;
    glycemicIndex?: number;
    allergens: string[];
    tags: string[];
    healthConditions: {
        diabetes: 'safe' | 'caution' | 'avoid';
        hypertension: 'safe' | 'caution' | 'avoid';
        ibs: 'safe' | 'caution' | 'avoid';
        celiac: 'safe' | 'caution' | 'avoid';
        lactoseIntolerance: 'safe' | 'caution' | 'avoid';
    };
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export const foodsService = {
    getAll: () => getAllDocuments<CloudFoodItem>(COLLECTIONS.FOODS),
    getById: (id: string) => getDocumentById<CloudFoodItem>(COLLECTIONS.FOODS, id),
    create: (data: Omit<CloudFoodItem, 'id'>) => createDocument(COLLECTIONS.FOODS, data),
    update: (id: string, data: Partial<CloudFoodItem>) => updateDocument(COLLECTIONS.FOODS, id, data),
    delete: (id: string) => deleteDocument(COLLECTIONS.FOODS, id),
    subscribe: (callback: (data: CloudFoodItem[]) => void) => subscribeToCollection(COLLECTIONS.FOODS, callback),

    // Sync from local database
    syncFromLocal: async (localData: CloudFoodItem[]) => {
        const documents = localData.map(food => ({
            id: food.id,
            data: {
                name: food.name,
                nameAr: food.nameAr,
                category: food.category,
                categoryAr: food.categoryAr,
                servingSize: food.servingSize,
                servingUnit: food.servingUnit,
                nutrition: food.nutrition,
                glycemicIndex: food.glycemicIndex,
                allergens: food.allergens,
                tags: food.tags,
                healthConditions: food.healthConditions,
            }
        }));
        return batchWriteDocuments(COLLECTIONS.FOODS, documents);
    }
};

// Recipe
export interface CloudRecipe {
    id?: string;
    name: string;
    nameAr: string;
    description: string;
    descriptionAr: string;
    prepTime: number;
    cookTime: number;
    servings: number;
    difficulty: 'easy' | 'medium' | 'hard';
    ingredients: { foodId: string; amount: number; unit: string }[];
    instructions: string[];
    instructionsAr: string[];
    totalNutrition: CloudNutritionInfo;
    tags: string[];
    imageUrl?: string;
    category?: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export const recipesService = {
    getAll: () => getAllDocuments<CloudRecipe>(COLLECTIONS.RECIPES),
    getById: (id: string) => getDocumentById<CloudRecipe>(COLLECTIONS.RECIPES, id),
    create: (data: Omit<CloudRecipe, 'id'>) => createDocument(COLLECTIONS.RECIPES, data),
    update: (id: string, data: Partial<CloudRecipe>) => updateDocument(COLLECTIONS.RECIPES, id, data),
    delete: (id: string) => deleteDocument(COLLECTIONS.RECIPES, id),
    subscribe: (callback: (data: CloudRecipe[]) => void) => subscribeToCollection(COLLECTIONS.RECIPES, callback),

    syncFromLocal: async (localData: CloudRecipe[]) => {
        const documents = localData.map(recipe => ({
            id: recipe.id,
            data: {
                name: recipe.name,
                nameAr: recipe.nameAr,
                description: recipe.description,
                descriptionAr: recipe.descriptionAr,
                prepTime: recipe.prepTime,
                cookTime: recipe.cookTime,
                servings: recipe.servings,
                difficulty: recipe.difficulty,
                ingredients: recipe.ingredients,
                instructions: recipe.instructions,
                instructionsAr: recipe.instructionsAr,
                totalNutrition: recipe.totalNutrition,
                tags: recipe.tags,
                imageUrl: recipe.imageUrl,
                category: recipe.category,
            }
        }));
        return batchWriteDocuments(COLLECTIONS.RECIPES, documents);
    }
};

// Meal Plan
export interface CloudMealPlan {
    id?: string;
    userId?: string;
    date: string;
    meals: {
        breakfast: { recipeId?: string; foods: { foodId: string; amount: number }[] };
        lunch: { recipeId?: string; foods: { foodId: string; amount: number }[] };
        dinner: { recipeId?: string; foods: { foodId: string; amount: number }[] };
        snacks: { foodId: string; amount: number }[];
    };
    totalNutrition: CloudNutritionInfo;
    notes?: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export const mealPlansService = {
    getAll: () => getAllDocuments<CloudMealPlan>(COLLECTIONS.MEAL_PLANS),
    getById: (id: string) => getDocumentById<CloudMealPlan>(COLLECTIONS.MEAL_PLANS, id),
    getByUser: async (userId: string) => {
        if (!db) return [];
        try {
            const q = query(
                collection(db, COLLECTIONS.MEAL_PLANS),
                where('userId', '==', userId),
                orderBy('date', 'desc')
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CloudMealPlan[];
        } catch (error) {
            console.error('Error getting meal plans by user:', error);
            return [];
        }
    },
    create: (data: Omit<CloudMealPlan, 'id'>) => createDocument(COLLECTIONS.MEAL_PLANS, data),
    update: (id: string, data: Partial<CloudMealPlan>) => updateDocument(COLLECTIONS.MEAL_PLANS, id, data),
    delete: (id: string) => deleteDocument(COLLECTIONS.MEAL_PLANS, id),
    subscribe: (callback: (data: CloudMealPlan[]) => void) => subscribeToCollection(COLLECTIONS.MEAL_PLANS, callback),
};

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

// Check if Firestore is available
export function isFirestoreAvailable(): boolean {
    return db !== null;
}

// Initialize collections with default data
export async function initializeCollections(forceReset: boolean = false): Promise<void> {
    if (!db) {
        console.warn('Firestore not initialized');
        return;
    }

    // Check if already initialized
    const settingsDoc = await getDocumentById<CloudSettings>(COLLECTIONS.SETTINGS, 'main');

    if (settingsDoc && !forceReset) {
        console.log('Collections already initialized');
        return;
    }

    // Initialize settings
    await setDocument(COLLECTIONS.SETTINGS, 'main', {
        siteName: 'طبرة - TIBRAH',
        siteDescription: 'منصة الطب الشعوري والعلاج بالوعي',
        contactPhone: '+967771447111',
        contactWhatsApp: '967771447111',
        heroContent: {
            title: 'اكتشف قوة الشفاء الداخلي',
            subtitle: 'رحلة نحو الوعي والتحول',
            ctaText: 'ابدأ رحلتك'
        }
    });

    console.log('Collections initialized successfully');
}

export default {
    isFirestoreAvailable,
    initializeCollections,
    diseases: diseasesService,
    products: productsService,
    services: servicesService,
    settings: settingsService,
    // Meal Planning
    foods: foodsService,
    recipes: recipesService,
    mealPlans: mealPlansService,
    COLLECTIONS,
};

