/**
 * Data Validation Utilities for Tibrah
 * Lightweight runtime validation for database entities
 * Uses simple type-safe validator functions (no external deps)
 */

// ═══════════════════════════════════════════════════════════════
// VALIDATOR TYPES
// ═══════════════════════════════════════════════════════════════

type ValidationRule<T> = {
    field: keyof T;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
};

type ValidationError = {
    field: string;
    message: string;
};

type ValidationResult<T> = {
    valid: boolean;
    errors: ValidationError[];
    data: T | null;
};

// ═══════════════════════════════════════════════════════════════
// CORE VALIDATOR
// ═══════════════════════════════════════════════════════════════

function validate<T extends Record<string, unknown>>(
    data: unknown,
    rules: ValidationRule<T>[]
): ValidationResult<T> {
    const errors: ValidationError[] = [];

    if (!data || typeof data !== 'object') {
        return { valid: false, errors: [{ field: '_root', message: 'Data must be an object' }], data: null };
    }

    const obj = data as Record<string, unknown>;

    for (const rule of rules) {
        const fieldName = String(rule.field);
        const value = obj[fieldName];

        // Required check
        if (rule.required && (value === undefined || value === null || value === '')) {
            errors.push({ field: fieldName, message: `${fieldName} is required` });
            continue;
        }

        // Skip optional undefined fields
        if (value === undefined || value === null) continue;

        // Type check
        if (rule.type === 'array') {
            if (!Array.isArray(value)) {
                errors.push({ field: fieldName, message: `${fieldName} must be an array` });
                continue;
            }
        } else if (typeof value !== rule.type) {
            errors.push({ field: fieldName, message: `${fieldName} must be of type ${rule.type}` });
            continue;
        }

        // String validations
        if (rule.type === 'string' && typeof value === 'string') {
            if (rule.minLength && value.length < rule.minLength) {
                errors.push({ field: fieldName, message: `${fieldName} must be at least ${rule.minLength} characters` });
            }
            if (rule.maxLength && value.length > rule.maxLength) {
                errors.push({ field: fieldName, message: `${fieldName} must be at most ${rule.maxLength} characters` });
            }
            if (rule.pattern && !rule.pattern.test(value)) {
                errors.push({ field: fieldName, message: `${fieldName} has invalid format` });
            }
        }

        // Number validations
        if (rule.type === 'number' && typeof value === 'number') {
            if (rule.min !== undefined && value < rule.min) {
                errors.push({ field: fieldName, message: `${fieldName} must be at least ${rule.min}` });
            }
            if (rule.max !== undefined && value > rule.max) {
                errors.push({ field: fieldName, message: `${fieldName} must be at most ${rule.max}` });
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        data: errors.length === 0 ? (obj as T) : null,
    };
}

// ═══════════════════════════════════════════════════════════════
// ENTITY VALIDATORS
// ═══════════════════════════════════════════════════════════════

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateUser(data: unknown) {
    return validate(data, [
        { field: 'email', type: 'string', required: true, pattern: EMAIL_REGEX },
        { field: 'name', type: 'string', required: true, minLength: 2, maxLength: 100 },
    ]);
}

export function validateHealthMetric(data: unknown) {
    return validate(data, [
        { field: 'metric_type', type: 'string', required: true },
        { field: 'value', type: 'number', required: true },
        { field: 'unit', type: 'string', required: true },
        { field: 'recorded_at', type: 'string', required: true },
    ]);
}

export function validateDailyLog(data: unknown) {
    return validate(data, [
        { field: 'date', type: 'string', required: true },
        { field: 'mood', type: 'number', min: 1, max: 10 },
        { field: 'energy_level', type: 'number', min: 1, max: 10 },
        { field: 'sleep_quality', type: 'number', min: 1, max: 10 },
        { field: 'stress_level', type: 'number', min: 1, max: 10 },
    ]);
}

export function validateComment(data: unknown) {
    return validate(data, [
        { field: 'target_type', type: 'string', required: true },
        { field: 'target_id', type: 'string', required: true },
        { field: 'content', type: 'string', required: true, minLength: 1, maxLength: 2000 },
        { field: 'rating', type: 'number', min: 1, max: 5 },
    ]);
}

export function validateProduct(data: unknown) {
    return validate(data, [
        { field: 'name', type: 'string', required: true, minLength: 2 },
        { field: 'description', type: 'string', required: true },
        { field: 'price', type: 'number', required: true, min: 0 },
        { field: 'category', type: 'string', required: true },
    ]);
}

export function validateAppointment(data: unknown) {
    return validate(data, [
        { field: 'date', type: 'string', required: true },
        { field: 'type', type: 'string', required: true },
        { field: 'status', type: 'string', required: true },
    ]);
}

export function validateWaterLog(data: unknown) {
    return validate(data, [
        { field: 'date', type: 'string', required: true },
        { field: 'amount', type: 'number', required: true, min: 0, max: 10000 },
    ]);
}

export function validateWeightLog(data: unknown) {
    return validate(data, [
        { field: 'date', type: 'string', required: true },
        { field: 'weight', type: 'number', required: true, min: 10, max: 500 },
        { field: 'unit', type: 'string' },
    ]);
}

// ═══════════════════════════════════════════════════════════════
// SANITIZATION HELPERS
// ═══════════════════════════════════════════════════════════════

/** Strip HTML tags from user input to prevent XSS */
export function sanitizeHtml(input: string): string {
    return input.replace(/<[^>]*>/g, '').trim();
}

/** Truncate string to max length */
export function truncate(input: string, maxLength: number): string {
    if (input.length <= maxLength) return input;
    return input.slice(0, maxLength) + '...';
}

/** Validate and sanitize an email address */
export function sanitizeEmail(email: string): string | null {
    const cleaned = email.trim().toLowerCase();
    return EMAIL_REGEX.test(cleaned) ? cleaned : null;
}

export type { ValidationResult, ValidationError, ValidationRule };
