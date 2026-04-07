/**
 * Haptic Feedback Service
 * Provides safe wrappers around navigator.vibrate for immersive mobile web experiences.
 */

export const Haptics = {
    /** 
     * Extremely light, fast tick (e.g., typing, toggling a switch, selecting a minor option) 
     */
    tick: () => {
        if (typeof window !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(10);
        }
    },

    /** 
     * Solid selection tap (e.g., clicking a main button, selecting a medical intent card) 
     */
    selection: () => {
        if (typeof window !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(20);
        }
    },

    /** 
     * Double pulse - typical for success (e.g., successful login, completing password)
     */
    success: () => {
        if (typeof window !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([20, 50, 30]);
        }
    },

    /** 
     * Heavy buzz - typical for error or critical warning (e.g., wrong password)
     */
    error: () => {
        if (typeof window !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([40, 40, 60]);
        }
    },

    /** 
     * Deep heavy press sensation (e.g. simulated 3D touch hold)
     */
    deepPress: () => {
        if (typeof window !== 'undefined' && navigator.vibrate) {
            navigator.vibrate(40);
        }
    }
};
