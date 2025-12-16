/**
 * Utility function to merge class names
 * Simplified version that works without external dependencies
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
    return inputs.filter(Boolean).join(' ');
}
