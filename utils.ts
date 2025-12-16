/**
 * Utility functions for the application
 */

/**
 * Creates a URL for a page with optional query parameters
 * @param path - The path or page name with optional query string
 * @returns The full URL path
 */
export function createPageUrl(path: string): string {
    // If it's already a full path, return as-is
    if (path.startsWith('/')) {
        return path;
    }

    // Parse the path for page name and query params
    const [pageName, queryString] = path.split('?');

    // Convert page name to kebab-case path
    const urlPath = pageName
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '');

    // Reconstruct with query string if present
    return queryString ? `/${urlPath}?${queryString}` : `/${urlPath}`;
}

/**
 * Format a number in Arabic numerals
 * @param num - The number to format
 * @returns The formatted Arabic number string
 */
export function formatArabicNumber(num: number): string {
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return String(num)
        .split('')
        .map(digit => {
            const n = parseInt(digit);
            return isNaN(n) ? digit : arabicNumerals[n];
        })
        .join('');
}

/**
 * Format a date in Arabic locale
 * @param date - The date to format
 * @returns Formatted date string in Arabic
 */
export function formatArabicDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('ar-SA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

/**
 * Format currency in Saudi Riyals
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number): string {
    return `${amount.toLocaleString('ar-SA')} ر.س`;
}

/**
 * Truncate text to a maximum length
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}
