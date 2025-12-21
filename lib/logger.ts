/**
 * Secure Logging Utility
 * Prevents sensitive data leakage in logs
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
    /**
     * Additional metadata to log
     */
    data?: any;

    /**
     * Whether to sanitize the data
     * @default true
     */
    sanitize?: boolean;
}

/**
 * Sensitive field names to redact
 */
const SENSITIVE_FIELDS = [
    'password',
    'token',
    'secret',
    'key',
    'apiKey',
    'api_key',
    'apikey',
    'cardNumber',
    'card_number',
    'cvv',
    'cvc',
    'ssn',
    'social_security',
    'creditCard',
    'credit_card',
    'authorization',
    'authToken',
    'auth_token',
    'sessionId',
    'session_id',
    'cookie',
    'cookies',
    'email', // Partial redaction
    'phone',
    'phoneNumber',
    'phone_number',
    'address',
    'streetAddress',
    'street_address'
];

/**
 * Sanitize sensitive data from logs
 */
function sanitizeData(data: any, depth: number = 0): any {
    // Prevent infinite recursion
    if (depth > 10) {
        return '[Max Depth Reached]';
    }

    // Null/undefined
    if (data == null) {
        return data;
    }

    // Primitive types
    if (typeof data !== 'object') {
        return data;
    }

    // Arrays
    if (Array.isArray(data)) {
        return data.map(item => sanitizeData(item, depth + 1));
    }

    // Objects
    const sanitized: any = {};

    for (const key in data) {
        if (!data.hasOwnProperty(key)) continue;

        const lowerKey = key.toLowerCase();
        const value = data[key];

        // Check if field is sensitive
        const isSensitive = SENSITIVE_FIELDS.some(field =>
            lowerKey.includes(field.toLowerCase())
        );

        if (isSensitive) {
            // Special handling for email (show partial)
            if (lowerKey.includes('email') && typeof value === 'string') {
                const [local, domain] = value.split('@');
                if (local && domain) {
                    sanitized[key] = `${local.slice(0, 2)}***@${domain}`;
                } else {
                    sanitized[key] = '***REDACTED***';
                }
            }
            // Special handling for phone (show last 4)
            else if (lowerKey.includes('phone') && typeof value === 'string') {
                const digits = value.replace(/\D/g, '');
                if (digits.length >= 4) {
                    sanitized[key] = `***-***-${digits.slice(-4)}`;
                } else {
                    sanitized[key] = '***REDACTED***';
                }
            }
            // Redact everything else
            else {
                sanitized[key] = '***REDACTED***';
            }
        }
        // Recursively sanitize nested objects
        else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeData(value, depth + 1);
        }
        // Keep safe values
        else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}

/**
 * Get formatted timestamp
 */
function getTimestamp(): string {
    return new Date().toISOString();
}

/**
 * Get log prefix
 */
function getPrefix(level: LogLevel, context?: string): string {
    const timestamp = getTimestamp();
    const levelUpper = level.toUpperCase().padEnd(5);
    const contextStr = context ? `[${context}]` : '';

    return `[${timestamp}] [${levelUpper}]${contextStr}`;
}

/**
 * Log a debug message (only in development)
 */
export function logDebug(message: string, options: LogOptions = {}): void {
    if (process.env.NODE_ENV === 'production') {
        return; // No debug logs in production
    }

    const { data, sanitize = true } = options;
    const prefix = getPrefix('debug');

    if (data) {
        const safeData = sanitize ? sanitizeData(data) : data;
        console.debug(prefix, message, safeData);
    } else {
        console.debug(prefix, message);
    }
}

/**
 * Log an info message
 */
export function logInfo(message: string, options: LogOptions = {}): void {
    const { data, sanitize = true } = options;
    const prefix = getPrefix('info');

    if (data) {
        const safeData = sanitize ? sanitizeData(data) : data;
        console.info(prefix, message, safeData);
    } else {
        console.info(prefix, message);
    }
}

/**
 * Log a warning
 */
export function logWarn(message: string, options: LogOptions = {}): void {
    const { data, sanitize = true } = options;
    const prefix = getPrefix('warn');

    if (data) {
        const safeData = sanitize ? sanitizeData(data) : data;
        console.warn(prefix, message, safeData);
    } else {
        console.warn(prefix, message);
    }
}

/**
 * Log an error
 */
export function logError(message: string, options: LogOptions = {}): void {
    const { data, sanitize = true } = options;
    const prefix = getPrefix('error');

    if (data) {
        const safeData = sanitize ? sanitizeData(data) : data;
        console.error(prefix, message, safeData);
    } else {
        console.error(prefix, message);
    }
}

/**
 * Log with custom context
 */
export function log(level: LogLevel, context: string, message: string, options: LogOptions = {}): void {
    const { data, sanitize = true } = options;
    const prefix = getPrefix(level, context);

    const logFn = {
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error
    }[level];

    if (data) {
        const safeData = sanitize ? sanitizeData(data) : data;
        logFn(prefix, message, safeData);
    } else {
        logFn(prefix, message);
    }
}

/**
 * Default export with all methods
 */
export default {
    debug: logDebug,
    info: logInfo,
    warn: logWarn,
    error: logError,
    log
};
