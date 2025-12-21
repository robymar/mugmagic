/**
 * Tests for Secure Logging
 * Validates that sensitive data is sanitized
 */

import logger, { logInfo, logWarn, logError, logDebug } from '@/lib/logger';

describe('Logging - Security Tests', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
        // Spy on console methods
        consoleSpy = jest.spyOn(console, 'info').mockImplementation();
        jest.spyOn(console, 'warn').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
        jest.spyOn(console, 'debug').mockImplementation();
    });

    afterEach(() => {
        // Restore console methods
        jest.restoreAllMocks();
    });

    describe('Sensitive data sanitization', () => {
        it('should redact password fields', () => {
            logInfo('User login', {
                data: {
                    username: 'john',
                    password: 'secret123'
                }
            });

            const callArgs = consoleSpy.mock.calls[0];
            const loggedData = JSON.stringify(callArgs);

            expect(loggedData).not.toContain('secret123');
            expect(loggedData).toContain('***REDACTED***');
        });

        it('should redact credit card numbers', () => {
            logInfo('Payment processed', {
                data: {
                    cardNumber: '4242424242424242',
                    amount: 100
                }
            });

            const callArgs = consoleSpy.mock.calls[0];
            const loggedData = JSON.stringify(callArgs);

            expect(loggedData).not.toContain('4242424242424242');
            expect(loggedData).toContain('***REDACTED***');
        });

        it('should partially redact email addresses', () => {
            logInfo('Email sent', {
                data: {
                    email: 'john.doe@example.com'
                }
            });

            const callArgs = consoleSpy.mock.calls[0];
            const loggedData = JSON.stringify(callArgs);

            expect(loggedData).not.toContain('john.doe@example.com');
            expect(loggedData).toMatch(/jo\*\*\*@example\.com/);
        });

        it('should partially redact phone numbers', () => {
            logInfo('SMS sent', {
                data: {
                    phoneNumber: '+34-600-123-456'
                }
            });

            const callArgs = consoleSpy.mock.calls[0];
            const loggedData = JSON.stringify(callArgs);

            expect(loggedData).not.toContain('600-123-456');
            expect(loggedData).toMatch(/\*\*\*-\*\*\*-3456/);
        });

        it('should redact API keys', () => {
            logInfo('API call', {
                data: {
                    apiKey: 'sk_test_1234567890',
                    endpoint: '/api/data'
                }
            });

            const callArgs = consoleSpy.mock.calls[0];
            const loggedData = JSON.stringify(callArgs);

            expect(loggedData).not.toContain('sk_test_1234567890');
            expect(loggedData).toContain('***REDACTED***');
        });

        it('should redact tokens', () => {
            logInfo('Auth request', {
                data: {
                    authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
                }
            });

            const callArgs = consoleSpy.mock.calls[0];
            const loggedData = JSON.stringify(callArgs);

            expect(loggedData).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
            expect(loggedData).toContain('***REDACTED***');
        });

        it('should handle nested objects', () => {
            logInfo('User data', {
                data: {
                    user: {
                        name: 'John',
                        credentials: {
                            password: 'secret',
                            apiKey: 'key123'
                        }
                    }
                }
            });

            const callArgs = consoleSpy.mock.calls[0];
            const loggedData = JSON.stringify(callArgs);

            expect(loggedData).not.toContain('secret');
            expect(loggedData).not.toContain('key123');
            expect(loggedData).toContain('John'); // Non-sensitive data preserved
        });

        it('should handle arrays', () => {
            logInfo('Batch operation', {
                data: {
                    users: [
                        { email: 'user1@example.com', password: 'pass1' },
                        { email: 'user2@example.com', password: 'pass2' }
                    ]
                }
            });

            const callArgs = consoleSpy.mock.calls[0];
            const loggedData = JSON.stringify(callArgs);

            expect(loggedData).not.toContain('pass1');
            expect(loggedData).not.toContain('pass2');
        });

        it('should preserve safe data', () => {
            logInfo('Order created', {
                data: {
                    orderId: 'ORD-12345',
                    amount: 100,
                    status: 'pending'
                }
            });

            const callArgs = consoleSpy.mock.calls[0];
            const loggedData = JSON.stringify(callArgs);

            // All safe data should be preserved
            expect(loggedData).toContain('ORD-12345');
            expect(loggedData).toContain('100');
            expect(loggedData).toContain('pending');
        });
    });

    describe('Log levels', () => {
        it('should log info messages', () => {
            const spy = jest.spyOn(console, 'info').mockImplementation();

            logInfo('Test message');

            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });

        it('should log warnings', () => {
            const spy = jest.spyOn(console, 'warn').mockImplementation();

            logWarn('Warning message');

            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });

        it('should log errors', () => {
            const spy = jest.spyOn(console, 'error').mockImplementation();

            logError('Error message');

            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });

        it('should skip debug in production', () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = 'production';

            const spy = jest.spyOn(console, 'debug').mockImplementation();

            logDebug('Debug message');

            expect(spy).not.toHaveBeenCalled();

            process.env.NODE_ENV = originalEnv;
            spy.mockRestore();
        });
    });

    describe('Timestamp formatting', () => {
        it('should include timestamp in logs', () => {
            logInfo('Test');

            const callArgs = consoleSpy.mock.calls[0];
            const loggedString = callArgs.join(' ');

            // Should contain ISO timestamp format
            expect(loggedString).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        });

        it('should include log level', () => {
            logInfo('Test');

            const callArgs = consoleSpy.mock.calls[0];
            const loggedString = callArgs.join(' ');

            expect(loggedString).toContain('INFO');
        });
    });

    describe('Sanitize option', () => {
        it('should respect sanitize: false option', () => {
            logInfo('Raw data', {
                data: { password: 'secret123' },
                sanitize: false
            });

            const callArgs = consoleSpy.mock.calls[0];
            const loggedData = JSON.stringify(callArgs);

            // With sanitize: false, password should be logged
            expect(loggedData).toContain('secret123');
        });
    });

    describe('Edge cases', () => {
        it('should handle null data', () => {
            expect(() => {
                logInfo('Null data', {
                    data: null
                });
            }).not.toThrow();
        });

        it('should handle undefined data', () => {
            expect(() => {
                logInfo('Undefined data', {
                    data: undefined
                });
            }).not.toThrow();
        });

        it('should handle circular references', () => {
            const circular: any = { name: 'test' };
            circular.self = circular;

            // Should not throw on circular references
            expect(() => {
                logInfo('Circular data', {
                    data: circular
                });
            }).not.toThrow();
        });

        it('should handle very deep objects', () => {
            let deep: any = { level: 0 };
            let current = deep;

            for (let i = 1; i < 20; i++) {
                current.nested = { level: i };
                current = current.nested;
            }

            expect(() => {
                logInfo('Deep object', {
                    data: deep
                });
            }).not.toThrow();
        });
    });
});
