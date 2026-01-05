/**
 * XSS Sanitization Utilities
 * 
 * Provides functions to sanitize user input and prevent XSS attacks.
 * Uses DOMPurify for HTML sanitization - install with: npm install isomorphic-dompurify
 */

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * 
 * @param dirty - Untrusted HTML string
 * @returns Sanitized HTML string safe for rendering
 * 
 * @example
 * const userInput = '<script>alert("xss")</script>Hello';
 * const safe = sanitizeHtml(userInput); // Returns: 'Hello'
 */
export function sanitizeHtml(dirty: string): string {
    // Enhanced sanitization (TEMPORARY - replace with DOMPurify when possible)
    // TODO: Install isomorphic-dompurify for production use
    // import DOMPurify from 'isomorphic-dompurify';
    // return DOMPurify.sanitize(dirty);

    if (!dirty || typeof dirty !== 'string') {
        return '';
    }

    // Step 1: Remove all HTML tags and their content
    let sanitized = dirty;

    // Remove script tags and their content
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove style tags and their content
    sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Remove iframe tags
    sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');

    // Remove object, embed, and applet tags
    sanitized = sanitized.replace(/<(object|embed|applet)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi, '');

    // Remove event handlers (onclick, onerror, onload, etc.)
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

    // Remove javascript: and data: URIs
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/data:text\/html/gi, '');

    // Escape HTML special characters
    sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');

    return sanitized;
}

/**
 * Sanitizes text content (no HTML allowed).
 * 
 * @param text - Untrusted text string
 * @returns Sanitized plain text
 * 
 * @example
 * const userInput = '<b>Bold</b> text';
 * const safe = sanitizeText(userInput); // Returns: 'Bold text'
 */
export function sanitizeText(text: string): string {
    // Strip all HTML tags
    return text.replace(/<[^>]*>/g, '').trim();
}

/**
 * Sanitizes fabric.js canvas JSON data to prevent XSS in saved designs.
 * 
 * @param canvasData - Fabric.js canvas JSON object
 * @returns Sanitized canvas data
 * 
 * @example
 * const designData = canvas.toJSON();
 * const safeData = sanitizeCanvasData(designData);
 */
export function sanitizeCanvasData(canvasData: any): any {
    if (!canvasData || typeof canvasData !== 'object') {
        return canvasData;
    }

    // Clone to avoid mutating original
    const sanitized = JSON.parse(JSON.stringify(canvasData));

    // Sanitize text objects
    if (sanitized.objects && Array.isArray(sanitized.objects)) {
        sanitized.objects = sanitized.objects.map((obj: any) => {
            if (obj.type === 'text' || obj.type === 'i-text' || obj.type === 'textbox') {
                if (obj.text) {
                    // Sanitize text content
                    obj.text = sanitizeText(obj.text);
                }
            }
            return obj;
        });
    }

    return sanitized;
}

/**
 * Sanitizes product data before saving to database.
 * 
 * @param product - Product object with user-provided data
 * @returns Sanitized product object
 */
export function sanitizeProductData(product: any): any {
    return {
        ...product,
        name: sanitizeText(product.name || ''),
        description: sanitizeText(product.description || ''),
        longDescription: sanitizeText(product.longDescription || ''),
        // Keep other fields as-is (numbers, booleans, etc.)
    };
}

/**
 * Validates and sanitizes email addresses.
 * 
 * @param email - Email string to sanitize
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
    // Basic email validation and sanitization
    const trimmed = email.trim().toLowerCase();

    // Remove any HTML tags or special characters
    const cleaned = trimmed.replace(/[<>'"]/g, '');

    // Basic email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(cleaned) ? cleaned : '';
}

/**
 * Sanitizes URL to prevent javascript: and data: URI attacks.
 * 
 * @param url - URL string to sanitize
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
    const trimmed = url.trim();

    // Block javascript: and data: URIs
    if (/^(javascript|data|vbscript):/i.test(trimmed)) {
        return '';
    }

    // Only allow http, https, and relative URLs
    if (!/^(https?:)?\/\//i.test(trimmed) && !trimmed.startsWith('/')) {
        return '';
    }

    return trimmed;
}

/**
 * Sanitizes file names to prevent path traversal attacks.
 * 
 * @param filename - Filename to sanitize
 * @returns Safe filename
 */
export function sanitizeFilename(filename: string): string {
    return filename
        .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe chars
        .replace(/\.\.+/g, '.') // Remove path traversal
        .substring(0, 255); // Limit length
}
