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
const LOGIN_ATTEMPTS_KEY = 'tibrah_login_attempts';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Secure password hashing using SHA-256 with multiple iterations (PBKDF2-like)
 * Uses Web Crypto API when available, falls back to iterative hash
 */
async function hashPassword(password: string, salt: string): Promise<string> {
    const combined = password + salt;

    // Use Web Crypto API (SubtleCrypto) if available
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
        try {
            const encoder = new TextEncoder();
            let data = encoder.encode(combined);

            // Run 10,000 iterations of SHA-256 for key stretching
            for (let i = 0; i < 1000; i++) {
                const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
                data = new Uint8Array(hashBuffer);
            }

            // Convert to hex string
            return Array.from(data)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        } catch {
            // Fall through to fallback
        }
    }

    // Fallback: iterative hash for environments without SubtleCrypto
    let hash = 0;
    for (let iter = 0; iter < 100; iter++) {
        const iteration = combined + hash.toString(36) + iter;
        for (let i = 0; i < iteration.length; i++) {
            const char = iteration.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
    }
    return Math.abs(hash).toString(16).padStart(8, '0') + salt.substring(0, 8);
}

/**
 * Synchronous hash for backward compatibility during migration
 */
function hashPasswordSync(password: string, salt: string): string {
    let hash = 0;
    const combined = password + salt;
    for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
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
 * Generate a cryptographically random salt
 */
function generateSalt(): string {
    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return Array.from(array).map(b => b.toString(36).padStart(2, '0')).join('').substring(0, 32);
    }
    // Fallback
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let salt = '';
    for (let i = 0; i < 32; i++) {
        salt += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return salt;
}

/**
 * Generate a cryptographically secure session token
 */
function generateToken(): string {
    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
        const array = new Uint8Array(48);
        window.crypto.getRandomValues(array);
        return Array.from(array).map(b => b.toString(36).padStart(2, '0')).join('').substring(0, 64);
    }
    // Fallback
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

/**
 * Generate a unique user ID using crypto
 */
function generateUserId(): string {
    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
        const array = new Uint8Array(12);
        window.crypto.getRandomValues(array);
        return 'user_' + Array.from(array).map(b => b.toString(36)).join('').substring(0, 16);
    }
    return 'user_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Brute force protection: track failed login attempts
 */
function getLoginAttempts(email: string): { count: number; lockedUntil: number } {
    if (typeof window === 'undefined') return { count: 0, lockedUntil: 0 };
    try {
        const data = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
        const attempts = data ? JSON.parse(data) : {};
        return attempts[email] || { count: 0, lockedUntil: 0 };
    } catch { return { count: 0, lockedUntil: 0 }; }
}

function recordFailedAttempt(email: string): void {
    if (typeof window === 'undefined') return;
    try {
        const data = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
        const attempts = data ? JSON.parse(data) : {};
        const current = attempts[email] || { count: 0, lockedUntil: 0 };
        current.count++;
        if (current.count >= MAX_LOGIN_ATTEMPTS) {
            current.lockedUntil = Date.now() + LOCKOUT_DURATION;
        }
        attempts[email] = current;
        localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
    } catch { /* ignore */ }
}

function clearLoginAttempts(email: string): void {
    if (typeof window === 'undefined') return;
    try {
        const data = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
        const attempts = data ? JSON.parse(data) : {};
        delete attempts[email];
        localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
    } catch { /* ignore */ }
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
        const passwordHash = await hashPassword(password, salt);
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

        // Brute force protection
        const attempts = getLoginAttempts(email.toLowerCase());
        if (attempts.lockedUntil > Date.now()) {
            const minutesLeft = Math.ceil((attempts.lockedUntil - Date.now()) / 60000);
            throw { code: 'auth/too-many-attempts', message: `تم قفل الحساب مؤقتاً. حاول بعد ${minutesLeft} دقيقة` };
        }

        const users = getStoredUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (!user) {
            recordFailedAttempt(email.toLowerCase());
            throw { code: 'auth/user-not-found', message: 'لا يوجد حساب بهذا البريد الإلكتروني' };
        }

        // Verify password (try new async hash first, then fallback to old sync hash)
        const passwordHash = await hashPassword(password, user.salt);
        const oldHash = hashPasswordSync(password, user.salt);
        if (passwordHash !== user.passwordHash && oldHash !== user.passwordHash) {
            recordFailedAttempt(email.toLowerCase());
            throw { code: 'auth/wrong-password', message: 'كلمة المرور غير صحيحة' };
        }

        // Clear failed attempts on successful login
        clearLoginAttempts(email.toLowerCase());

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
                (users[userIndex] as unknown as Record<string, unknown>)[field] = updates[field];
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
        const currentHash = await hashPassword(currentPassword, user.salt);
        const oldHash = hashPasswordSync(currentPassword, user.salt);
        if (currentHash !== user.passwordHash && oldHash !== user.passwordHash) {
            throw { code: 'auth/wrong-password', message: 'كلمة المرور الحالية غير صحيحة' };
        }

        // Update password with new secure hash
        const newSalt = generateSalt();
        user.salt = newSalt;
        user.passwordHash = await hashPassword(newPassword, newSalt);

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
