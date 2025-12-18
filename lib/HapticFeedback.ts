/**
 * Haptic Feedback Module
 * Provides tactile feedback for touch interactions
 * Supports Vibration API with intelligent fallbacks
 */

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

    constructor() {
        this.checkSupport();
        this.loadPreference();
    }

    private checkSupport(): void {
        if (typeof window === 'undefined') {
            this.isSupported = false;
            return;
        }

        // Check for Vibration API
        this.isSupported = 'vibrate' in navigator;

        // Additional check for iOS (which doesn't support Vibration API but has Taptic Engine)
        // We'll rely on CSS touch-action: manipulation for iOS
        console.log('[Haptic] Vibration API supported:', this.isSupported);
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
     * Trigger haptic feedback with a specific pattern
     */
    trigger(type: HapticPattern = 'light'): boolean {
        if (!this.isSupported || !this.isEnabled) {
            return false;
        }

        try {
            const config = HAPTIC_PATTERNS[type];
            navigator.vibrate(config.pattern);
            return true;
        } catch (error) {
            console.warn('[Haptic] Vibration failed:', error);
            return false;
        }
    }

    /**
     * Light tap - for regular button presses
     */
    tap(): boolean {
        return this.trigger('light');
    }

    /**
     * Medium tap - for more significant actions
     */
    impact(): boolean {
        return this.trigger('medium');
    }

    /**
     * Success feedback - for completed actions
     */
    success(): boolean {
        return this.trigger('success');
    }

    /**
     * Error feedback - for failed actions
     */
    error(): boolean {
        return this.trigger('error');
    }

    /**
     * Warning feedback - for warnings
     */
    warning(): boolean {
        return this.trigger('warning');
    }

    /**
     * Selection feedback - for selecting items
     */
    selection(): boolean {
        return this.trigger('selection');
    }

    /**
     * Custom vibration pattern
     */
    custom(pattern: number | number[]): boolean {
        if (!this.isSupported || !this.isEnabled) {
            return false;
        }

        try {
            navigator.vibrate(pattern);
            return true;
        } catch (error) {
            console.warn('[Haptic] Custom vibration failed:', error);
            return false;
        }
    }

    /**
     * Stop any ongoing vibration
     */
    stop(): void {
        if (this.isSupported) {
            try {
                navigator.vibrate(0);
            } catch {
                // Ignore errors
            }
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
