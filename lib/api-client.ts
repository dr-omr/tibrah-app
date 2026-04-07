import { auth } from './firebase'; 

/**
 * Universal Native-Safe API Fetch Client for Tibrah
 * Automatically prefixes API endpoints with the absolute backend URL
 * when running inside a Capacitor native mobile context.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const isCapacitor = typeof window !== 'undefined' && 'Capacitor' in window;
    
    // Provide your hosted API domain. 
    // Must set NEXT_PUBLIC_API_URL in Vercel or your env file before mobile export.
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.tibrah.app';
    
    const url = (isCapacitor && endpoint.startsWith('/api')) 
                ? `${baseUrl}${endpoint}` 
                : endpoint;

    const headers = new Headers(options.headers || {});
    
    // Standard JSON injection
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    // Securely inject the Firebase JWT token if the user is authenticated 
    // This allows the Next.js API to verify native mobile requests without relying on cookies
    if (auth?.currentUser) {
        try {
            const token = await auth.currentUser.getIdToken();
            if (!headers.has('Authorization')) {
                headers.set('Authorization', `Bearer ${token}`);
            }
        } catch (e) {
            console.warn('[API Client] Could not securely retrieve offline token', e);
        }
    }

    return fetch(url, { ...options, headers });
}
