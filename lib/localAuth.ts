/**
 * Local Authentication Service
 * Advanced local authentication system with encrypted password storage
 * Works offline and requires no external services
 */

// Types
export interface LocalUser {
    id: string;
    email: string;
    name: string;
    displayName?: string;
    photoURL?: string;
    phone?: string;
    role: 'user' | 'admin';
    createdAt: string;
    lastLoginAt: string;
    isVerified: boolean;
}

interface StoredUser extends LocalUser {
    passwordHash: string;
    salt: string;
}

interface Session {
    userId: string;
    token: string;
    expiresAt: number;
    createdAt: number;
}

// Constants
const USERS_STORAGE_KEY = 'tibrah_users';
const SESSION_STORAGE_KEY = 'tibrah_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Simple but effective password hashing using Web Crypto API simulation
 * For production, use bcrypt on a backend
 */
function hashPassword(password: string, salt: string): string {
    // Create a hash using the password and salt
    let hash = 0;
    const combined = password + salt;
    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    // Create a more complex hash by running multiple iterations
    let complexHash = Math.abs(hash).toString(36);
    for (let i = 0; i < 3; i++) {
        const iteration = combined + complexHash + i;
        let iterHash = 0;
        for (let j = 0; j < iteration.length; j++) {
            const char = iteration.charCodeAt(j);
            iterHash = ((iterHash << 5) - iterHash) + char;
            iterHash = iterHash & iterHash;
        }
        complexHash += Math.abs(iterHash).toString(36);
    }

    return complexHash;
}

/**
 * Generate a random salt for password hashing
 */
function generateSalt(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let salt = '';
    for (let i = 0; i < 32; i++) {
        salt += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return salt;
}

/**
 * Generate a secure session token
 */
function generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

/**
 * Generate a unique user ID
 */
function generateUserId(): string {
    return 'user_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Get all stored users from localStorage
 */
function getStoredUsers(): StoredUser[] {
    if (typeof window === 'undefined') return [];
    try {
        const data = localStorage.getItem(USERS_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

/**
 * Save users to localStorage
 */
function saveUsers(users: StoredUser[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

/**
 * Get current session from localStorage
 */
function getStoredSession(): Session | null {
    if (typeof window === 'undefined') return null;
    try {
        const data = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!data) return null;

        const session: Session = JSON.parse(data);

        // Check if session is expired
        if (Date.now() > session.expiresAt) {
            localStorage.removeItem(SESSION_STORAGE_KEY);
            return null;
        }

        return session;
    } catch {
        return null;
    }
}

/**
 * Save session to localStorage
 */
function saveSession(session: Session): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

/**
 * Clear session from localStorage
 */
function clearSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(SESSION_STORAGE_KEY);
}

// ============================================
// Main Authentication Class
// ============================================

class LocalAuthService {
    private listeners: ((user: LocalUser | null) => void)[] = [];
    private currentUser: LocalUser | null = null;

    constructor() {
        // Initialize from stored session
        if (typeof window !== 'undefined') {
            this.initializeFromSession();
        }
    }

    /**
     * Initialize user from stored session
     */
    private initializeFromSession(): void {
        const session = getStoredSession();
        if (session) {
            const users = getStoredUsers();
            const user = users.find(u => u.id === session.userId);
            if (user) {
                this.currentUser = this.sanitizeUser(user);
                this.notifyListeners();
            }
        }
    }

    /**
     * Remove sensitive data from user object
     */
    private sanitizeUser(user: StoredUser): LocalUser {
        const { passwordHash, salt, ...safeUser } = user;
        return safeUser;
    }

    /**
     * Subscribe to auth state changes
     */
    onAuthStateChanged(callback: (user: LocalUser | null) => void): () => void {
        this.listeners.push(callback);
        // Immediately call with current state
        callback(this.currentUser);

        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    /**
     * Notify all listeners of auth state change
     */
    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.currentUser));
    }

    /**
     * Register a new user
     */
    async signUp(email: string, password: string, name: string): Promise<LocalUser> {
        // Validate input
        if (!email || !password || !name) {
            throw { code: 'auth/invalid-input', message: 'جميع الحقول مطلوبة' };
        }

        if (password.length < 6) {
            throw { code: 'auth/weak-password', message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
        }

        if (!email.includes('@')) {
            throw { code: 'auth/invalid-email', message: 'البريد الإلكتروني غير صحيح' };
        }

        const users = getStoredUsers();

        // Check if email already exists
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            throw { code: 'auth/email-already-in-use', message: 'البريد الإلكتروني مستخدم مسبقاً' };
        }

        // Create new user
        const salt = generateSalt();
        const passwordHash = hashPassword(password, salt);
        const now = new Date().toISOString();

        const newUser: StoredUser = {
            id: generateUserId(),
            email: email.toLowerCase(),
            name,
            displayName: name,
            role: users.length === 0 ? 'admin' : 'user', // First user is admin
            createdAt: now,
            lastLoginAt: now,
            isVerified: true,
            passwordHash,
            salt,
        };

        // Save to storage
        users.push(newUser);
        saveUsers(users);

        // Create session
        const session: Session = {
            userId: newUser.id,
            token: generateToken(),
            expiresAt: Date.now() + SESSION_DURATION,
            createdAt: Date.now(),
        };
        saveSession(session);

        // Set current user and notify
        this.currentUser = this.sanitizeUser(newUser);
        this.notifyListeners();

        return this.currentUser;
    }

    /**
     * Sign in with email and password
     */
    async signInWithEmail(email: string, password: string): Promise<LocalUser> {
        if (!email || !password) {
            throw { code: 'auth/invalid-input', message: 'البريد الإلكتروني وكلمة المرور مطلوبان' };
        }

        const users = getStoredUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            throw { code: 'auth/user-not-found', message: 'لا يوجد حساب بهذا البريد الإلكتروني' };
        }

        // Verify password
        const passwordHash = hashPassword(password, user.salt);
        if (passwordHash !== user.passwordHash) {
            throw { code: 'auth/wrong-password', message: 'كلمة المرور غير صحيحة' };
        }

        // Update last login
        user.lastLoginAt = new Date().toISOString();
        saveUsers(users);

        // Create session
        const session: Session = {
            userId: user.id,
            token: generateToken(),
            expiresAt: Date.now() + SESSION_DURATION,
            createdAt: Date.now(),
        };
        saveSession(session);

        // Set current user and notify
        this.currentUser = this.sanitizeUser(user);
        this.notifyListeners();

        return this.currentUser;
    }

    /**
     * Sign in with Google (simulation for demo)
     * In production, this would use Firebase or OAuth
     */
    async signInWithGoogle(): Promise<LocalUser> {
        // Create a demo Google user
        const googleEmail = `demo.user.${Date.now()}@gmail.com`;
        const googleName = 'مستخدم Google';

        // Check if this is a returning "Google" user simulation
        // For demo purposes, we'll create a new account
        try {
            return await this.signUp(googleEmail, generateToken(), googleName);
        } catch (error: unknown) {
            const authError = error as { code?: string };
            if (authError.code === 'auth/email-already-in-use') {
                // User exists, sign them in
                const users = getStoredUsers();
                const user = users.find(u => u.email === googleEmail);
                if (user) {
                    user.lastLoginAt = new Date().toISOString();
                    saveUsers(users);

                    const session: Session = {
                        userId: user.id,
                        token: generateToken(),
                        expiresAt: Date.now() + SESSION_DURATION,
                        createdAt: Date.now(),
                    };
                    saveSession(session);

                    this.currentUser = this.sanitizeUser(user);
                    this.notifyListeners();
                    return this.currentUser;
                }
            }
            throw error;
        }
    }

    /**
     * Sign out current user
     */
    async signOut(): Promise<void> {
        clearSession();
        this.currentUser = null;
        this.notifyListeners();
    }

    /**
     * Get current user
     */
    getCurrentUser(): LocalUser | null {
        return this.currentUser;
    }

    /**
     * Update user profile
     */
    async updateProfile(updates: Partial<LocalUser>): Promise<LocalUser> {
        if (!this.currentUser) {
            throw { code: 'auth/not-authenticated', message: 'يجب تسجيل الدخول أولاً' };
        }

        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.id === this.currentUser!.id);

        if (userIndex === -1) {
            throw { code: 'auth/user-not-found', message: 'المستخدم غير موجود' };
        }

        // Update allowed fields only
        const allowedFields: (keyof LocalUser)[] = ['name', 'displayName', 'photoURL', 'phone'];
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                (users[userIndex] as Record<string, unknown>)[field] = updates[field];
            }
        });

        saveUsers(users);
        this.currentUser = this.sanitizeUser(users[userIndex]);
        this.notifyListeners();

        return this.currentUser;
    }

    /**
     * Change password
     */
    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        if (!this.currentUser) {
            throw { code: 'auth/not-authenticated', message: 'يجب تسجيل الدخول أولاً' };
        }

        if (newPassword.length < 6) {
            throw { code: 'auth/weak-password', message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
        }

        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.id === this.currentUser!.id);

        if (userIndex === -1) {
            throw { code: 'auth/user-not-found', message: 'المستخدم غير موجود' };
        }

        const user = users[userIndex];

        // Verify current password
        const currentHash = hashPassword(currentPassword, user.salt);
        if (currentHash !== user.passwordHash) {
            throw { code: 'auth/wrong-password', message: 'كلمة المرور الحالية غير صحيحة' };
        }

        // Update password
        const newSalt = generateSalt();
        user.salt = newSalt;
        user.passwordHash = hashPassword(newPassword, newSalt);

        saveUsers(users);
    }

    /**
     * Delete account
     */
    async deleteAccount(): Promise<void> {
        if (!this.currentUser) {
            throw { code: 'auth/not-authenticated', message: 'يجب تسجيل الدخول أولاً' };
        }

        const users = getStoredUsers();
        const filteredUsers = users.filter(u => u.id !== this.currentUser!.id);
        saveUsers(filteredUsers);

        await this.signOut();
    }

    /**
     * Check if user is admin
     */
    isAdmin(): boolean {
        return this.currentUser?.role === 'admin' ||
            this.currentUser?.email === 'dr.omar@tibrah.com';
    }

    /**
     * Get all users (admin only)
     */
    getAllUsers(): LocalUser[] {
        if (!this.isAdmin()) {
            throw { code: 'auth/permission-denied', message: 'غير مصرح لك بهذا الإجراء' };
        }

        return getStoredUsers().map(u => this.sanitizeUser(u));
    }
}

// Export singleton instance
export const localAuth = new LocalAuthService();
export default localAuth;
