/**
 * Haptic Feedback Module
 * Provides tactile feedback for touch interactions
 * Supports Vibration API with intelligent fallbacks
 */

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning' | 'selection';

interface HapticPatternConfig {
    pattern: number | number[];
    intensity?: 'light' | 'medium' | 'heavy';
}

const HAPTIC_PATTERNS: Record<HapticPattern, HapticPatternConfig> = {
    light: { pattern: 10, intensity: 'light' },
    medium: { pattern: 25, intensity: 'medium' },
    heavy: { pattern: 50, intensity: 'heavy' },
    success: { pattern: [10, 50, 20], intensity: 'medium' },
    error: { pattern: [50, 30, 50, 30, 50], intensity: 'heavy' },
    warning: { pattern: [30, 50, 30], intensity: 'medium' },
    selection: { pattern: 5, intensity: 'light' }
};

class HapticFeedback {
    private isSupported: boolean = false;
    private isEnabled: boolean = true;
    private isNative: boolean = false;

    constructor() {
        this.checkSupport();
        this.loadPreference();
    }

    private checkSupport(): void {
        if (typeof window === 'undefined') {
            this.isSupported = false;
            return;
        }

        this.isNative = Capacitor.isNativePlatform();
        
        if (this.isNative) {
            this.isSupported = true; // Capacitor Handles Support Checking internally
        } else {
            // Fallback for Web PWA
            this.isSupported = 'vibrate' in navigator;
        }
    }

    private loadPreference(): void {
        if (typeof window === 'undefined') return;
        try {
            const stored = localStorage.getItem('tibrah_haptic_enabled');
            if (stored !== null) {
                this.isEnabled = JSON.parse(stored);
            }
        } catch {
            this.isEnabled = true;
        }
    }

    /**
     * Check if haptic feedback is available
     */
    isAvailable(): boolean {
        return this.isSupported && this.isEnabled;
    }

    /**
     * Enable/disable haptic feedback
     */
    setEnabled(enabled: boolean): void {
        this.isEnabled = enabled;
        if (typeof window !== 'undefined') {
            localStorage.setItem('tibrah_haptic_enabled', JSON.stringify(enabled));
        }
    }

    /**
     * Get current enabled state
     */
    getEnabled(): boolean {
        return this.isEnabled;
    }

    /**
     * Fallback to Web Vibration API if not native
     */
    private triggerWebFallback(type: HapticPattern): boolean {
         if (!this.isSupported || !this.isEnabled || !navigator.vibrate) return false;
         try {
             navigator.vibrate(HAPTIC_PATTERNS[type].pattern);
             return true;
         } catch {
             return false;
         }
    }

    /**
     * Trigger haptic feedback based on type
     */
    async trigger(type: HapticPattern = 'light'): Promise<boolean> {
        if (!this.isSupported || !this.isEnabled) return false;

        if (this.isNative) {
            try {
                switch(type) {
                    case 'light':
                        await Haptics.impact({ style: ImpactStyle.Light });
                        break;
                    case 'medium':
                        await Haptics.impact({ style: ImpactStyle.Medium });
                        break;
                    case 'heavy':
                        await Haptics.impact({ style: ImpactStyle.Heavy });
                        break;
                    case 'success':
                        await Haptics.notification({ type: NotificationType.Success });
                        break;
                    case 'error':
                        await Haptics.notification({ type: NotificationType.Error });
                        break;
                    case 'warning':
                        await Haptics.notification({ type: NotificationType.Warning });
                        break;
                    case 'selection':
                        await Haptics.selectionStart();
                        await Haptics.selectionChanged();
                        await Haptics.selectionEnd();
                        break;
                }
                return true;
            } catch (e) {
                console.warn('[Haptic Native] Failed', e);
                return this.triggerWebFallback(type);
            }
        } else {
             return this.triggerWebFallback(type);
        }
    }

    // Sugar methods
    tap() { this.trigger('light'); return true; }
    impact() { this.trigger('medium'); return true; }
    success() { this.trigger('success'); return true; }
    error() { this.trigger('error'); return true; }
    warning() { this.trigger('warning'); return true; }
    selection() { this.trigger('selection'); return true; }

    /**
     * Custom vibration pattern (Web only currently, Native doesn't support raw arrays easily)
     */
    async custom(pattern: number | number[]): Promise<boolean> {
        if (!this.isSupported || !this.isEnabled) return false;
        
        if (this.isNative) {
            // Vibrate roughly maps to heavy impact in native for a custom request
             try {
                await Haptics.vibrate({ duration: Array.isArray(pattern) ? pattern[0] : pattern });
                return true;
             } catch {
                return false;
             }
        } else if (navigator.vibrate) {
            try {
                navigator.vibrate(pattern);
                return true;
            } catch {
                return false;
            }
        }
        return false;
    }

    /**
     * Stop any ongoing vibration
     */
    stop(): void {
        if (!this.isNative && navigator.vibrate) {
            try { navigator.vibrate(0); } catch {}
        }
    }
}

// Singleton instance
export const haptic = new HapticFeedback();

// React hook for haptic feedback
export function useHaptic() {
    return {
        trigger: haptic.trigger.bind(haptic),
        tap: haptic.tap.bind(haptic),
        impact: haptic.impact.bind(haptic),
        success: haptic.success.bind(haptic),
        error: haptic.error.bind(haptic),
        warning: haptic.warning.bind(haptic),
        selection: haptic.selection.bind(haptic),
        isAvailable: haptic.isAvailable(),
        isEnabled: haptic.getEnabled(),
        setEnabled: haptic.setEnabled.bind(haptic)
    };
}

export default haptic;
