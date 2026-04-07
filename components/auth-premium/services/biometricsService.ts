/**
 * Biometrics Service - Enterprise WebAuthn Wrapper
 * Handles interactions with navigator.credentials for TouchID/FaceID.
 */

export interface BiometricAvailability {
    available: boolean;
    type: 'FACE_ID' | 'TOUCH_ID' | 'FINGERPRINT' | 'UNKNOWN' | 'NONE';
}

export class BiometricsService {
    /**
     * Checks if the device supports WebAuthn and Platform Authenticators (Face/Touch ID)
     */
    static async checkAvailability(): Promise<BiometricAvailability> {
        if (typeof window === 'undefined' || !window.PublicKeyCredential) {
            return { available: false, type: 'NONE' };
        }

        try {
            // Check if platform authenticator is available
            const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
            
            if (!available) return { available: false, type: 'NONE' };

            // Heuristics to guess type (Standard web APIs don't explicitly tell you Face vs Touch)
            // But we can guess based on OS
            const userAgent = navigator.userAgent || '';
            let type: BiometricAvailability['type'] = 'UNKNOWN';
            
            if (/iPhone|iPad|iPod/.test(userAgent)) {
                // Modern iPhones use FaceID primarily, but some use TouchID. We'll default to FaceID for newer UIs.
                type = 'FACE_ID';
            } else if (/Mac OS X/.test(userAgent)) {
                type = 'TOUCH_ID';
            } else if (/Android/.test(userAgent)) {
                type = 'FINGERPRINT'; // Standard Android
            }

            return { available: true, type };
        } catch (e) {
            console.error('Biometrics check failed:', e);
            return { available: false, type: 'NONE' };
        }
    }

    /**
     * Registers a new biometric credential for a user (Passkey creation)
     * Note: This is a simulation payload. In production, challenge comes from the server.
     */
    static async registerBiometric(userEmail: string, userId: string): Promise<any> {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        const userIdArray = new Uint8Array(userId.split('').map(c => c.charCodeAt(0)));

        try {
            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge: challenge,
                    rp: {
                        name: "Tibrah Healthcare OS",
                        id: window.location.hostname
                    },
                    user: {
                        id: userIdArray,
                        name: userEmail,
                        displayName: userEmail
                    },
                    pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                    authenticatorSelection: {
                        authenticatorAttachment: "platform",
                        userVerification: "required"
                    },
                    timeout: 60000
                }
            });

            return credential;
        } catch (err) {
            console.error("Biometric Registration Failed:", err);
            throw err;
        }
    }

    /**
     * Authenticates a user using existing biometric credential
     */
    static async authenticate(): Promise<any> {
        const challenge = new Uint8Array(32);
        window.crypto.getRandomValues(challenge);

        try {
            const assertion = await navigator.credentials.get({
                publicKey: {
                    challenge: challenge,
                    rpId: window.location.hostname,
                    userVerification: "required",
                    timeout: 60000
                }
            });
            return assertion;
        } catch (err) {
            console.error("Biometric Authentication Failed:", err);
            throw err;
        }
    }
}
