import { z } from 'zod';

/**
 * Client-side validation schemas for checkout forms
 * Provides immediate feedback before server validation
 */

// Shipping Information Schema
export const ShippingInfoSchema = z.object({
    firstName: z.string()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name is too long')
        .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'First name contains invalid characters'),

    lastName: z.string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name is too long')
        .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Last name contains invalid characters'),

    email: z.string()
        .email('Please enter a valid email address')
        .max(100, 'Email is too long')
        .toLowerCase(),

    phone: z.string()
        .regex(/^\+?[0-9\s()-]{8,20}$/, 'Please enter a valid phone number')
        .transform(val => val.replace(/\s+/g, '')), // Remove spaces

    address: z.string()
        .min(5, 'Address must be at least 5 characters')
        .max(200, 'Address is too long'),

    city: z.string()
        .min(2, 'City must be at least 2 characters')
        .max(100, 'City name is too long')
        .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'City contains invalid characters'),

    postalCode: z.string()
        .min(3, 'Postal code is too short')
        .max(12, 'Postal code is too long')
        .regex(/^[A-Z0-9\s-]+$/i, 'Invalid postal code format'),

    country: z.string()
        .min(2, 'Please select a country')
});

export type ShippingInfo = z.infer<typeof ShippingInfoSchema>;

// Payment Information Schema (for display/formatting only - actual card data handled by Stripe)
export const PaymentInfoClientSchema = z.object({
    cardNumber: z.string()
        .regex(/^[\d\s]{13,19}$/, 'Invalid card number format')
        .transform(val => val.replace(/\s+/g, '')),

    cardName: z.string()
        .min(3, 'Cardholder name is too short')
        .max(100, 'Cardholder name is too long')
        .regex(/^[a-zA-Z\s'-]+$/, 'Invalid cardholder name'),

    expiryDate: z.string()
        .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid expiry date (MM/YY)')
        .refine((val) => {
            const [month, year] = val.split('/');
            const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
            return expiry > new Date();
        }, 'Card has expired'),

    cvv: z.string()
        .regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits')
});

export type PaymentInfoClient = z.infer<typeof PaymentInfoClientSchema>;

// Helper function to format validation errors for display
export function formatValidationErrors(error: z.ZodError): Record<string, string> {
    const errors: Record<string, string> = {};

    error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
    });

    return errors;
}

// Helper to validate a single field
export function validateField<T extends z.ZodSchema>(
    schema: T,
    fieldName: string,
    value: any
): string | null {
    try {
        const fieldSchema = (schema as any).shape[fieldName];
        if (fieldSchema) {
            fieldSchema.parse(value);
        }
        return null;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return error.errors[0]?.message || 'Invalid value';
        }
        return 'Validation error';
    }
}

// Country-specific postal code validation
export function validatePostalCode(postalCode: string, country: string): boolean {
    const patterns: Record<string, RegExp> = {
        'Spain': /^\d{5}$/,
        'France': /^\d{5}$/,
        'Germany': /^\d{5}$/,
        'Italy': /^\d{5}$/,
        'Portugal': /^\d{4}-\d{3}$/,
        'UK': /^[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}$/i,
        'USA': /^\d{5}(-\d{4})?$/,
    };

    const pattern = patterns[country];
    return pattern ? pattern.test(postalCode) : true; // Default to allow if country not in list
}

// Email validation (more strict than HTML5)
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
}

// Phone number formatting
export function formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');

    // Format based on length
    if (cleaned.startsWith('+')) {
        // International format
        return cleaned;
    }

    // Default format: (XXX) XXX-XXXX for 10 digits
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }

    return cleaned;
}

// Credit card number formatting (for display only)
export function formatCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s+/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
}

// Luhn algorithm for card validation (basic check)
export function isValidCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s+/g, '');

    if (!/^\d{13,19}$/.test(cleaned)) {
        return false;
    }

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
        let digit = parseInt(cleaned[i]);

        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        isEven = !isEven;
    }

    return sum % 10 === 0;
}

// Detect card type from number
export function getCardType(cardNumber: string): 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown' {
    const cleaned = cardNumber.replace(/\s+/g, '');

    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';

    return 'unknown';
}
