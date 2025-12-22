import {
    loginSchema,
    signUpSchema,
    productSchema,
    cartItemSchema,
    cartSchema,
    shippingInfoSchema,
    createPaymentIntentSchema,
    trackOrderSchema,
} from '@/lib/validation-schemas';
import { ZodError } from 'zod';

describe('Validation Schemas', () => {
    describe('loginSchema', () => {
        it('should validate correct login data', () => {
            const validData = {
                email: 'test@example.com',
                password: 'password123',
            };
            expect(() => loginSchema.parse(validData)).not.toThrow();
        });

        it('should reject invalid email', () => {
            const invalidData = {
                email: 'not-an-email',
                password: 'password123',
            };
            expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
        });

        it('should reject short password', () => {
            const invalidData = {
                email: 'test@example.com',
                password: '12345',
            };
            expect(() => loginSchema.parse(invalidData)).toThrow(ZodError);
        });

        it('should reject empty fields', () => {
            expect(() => loginSchema.parse({ email: '', password: 'test' })).toThrow();
            expect(() => loginSchema.parse({ email: 'test@test.com', password: '' })).toThrow();
        });
    });

    describe('cartItemSchema', () => {
        it('should validate correct cart item', () => {
            const validItem = {
                productId: 'mug-11oz',
                quantity: 2,
            };
            expect(() => cartItemSchema.parse(validItem)).not.toThrow();
        });

        it('should validate cart item with variant', () => {
            const validItem = {
                productId: 'mug-11oz',
                quantity: 1,
                selectedVariant: {
                    id: 'black',
                    name: 'Black',
                },
            };
            expect(() => cartItemSchema.parse(validItem)).not.toThrow();
        });

        it('should reject zero quantity', () => {
            const invalidItem = {
                productId: 'mug-11oz',
                quantity: 0,
            };
            expect(() => cartItemSchema.parse(invalidItem)).toThrow();
        });

        it('should reject negative quantity', () => {
            const invalidItem = {
                productId: 'mug-11oz',
                quantity: -1,
            };
            expect(() => cartItemSchema.parse(invalidItem)).toThrow();
        });

        it('should reject quantity over 99', () => {
            const invalidItem = {
                productId: 'mug-11oz',
                quantity: 100,
            };
            expect(() => cartItemSchema.parse(invalidItem)).toThrow();
        });

        it('should reject decimal quantities', () => {
            const invalidItem = {
                productId: 'mug-11oz',
                quantity: 1.5,
            };
            expect(() => cartItemSchema.parse(invalidItem)).toThrow();
        });

        it('should reject missing productId', () => {
            const invalidItem = {
                quantity: 1,
            };
            expect(() => cartItemSchema.parse(invalidItem)).toThrow();
        });
    });

    describe('cartSchema', () => {
        it('should validate cart with items', () => {
            const validCart = {
                items: [
                    { productId: 'mug-11oz', quantity: 1 },
                    { productId: 'mug-15oz', quantity: 2 },
                ],
            };
            expect(() => cartSchema.parse(validCart)).not.toThrow();
        });

        it('should reject empty cart', () => {
            const invalidCart = {
                items: [],
            };
            expect(() => cartSchema.parse(invalidCart)).toThrow();
        });

        it('should reject cart with over 50 items', () => {
            const items = Array(51).fill({ productId: 'mug-11oz', quantity: 1 });
            const invalidCart = { items };
            expect(() => cartSchema.parse(invalidCart)).toThrow();
        });
    });

    describe('shippingInfoSchema', () => {
        const validShippingInfo = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '+34666777888',
            address: '123 Main St, Apt 4B',
            city: 'Madrid',
            postalCode: '28001',
            country: 'Spain',
        };

        it('should validate complete shipping info', () => {
            expect(() => shippingInfoSchema.parse(validShippingInfo)).not.toThrow();
        });

        it('should reject invalid email', () => {
            const invalidInfo = {
                ...validShippingInfo,
                email: 'not-email',
            };
            expect(() => shippingInfoSchema.parse(invalidInfo)).toThrow();
        });

        it('should reject short phone number', () => {
            const invalidInfo = {
                ...validShippingInfo,
                phone: '12345',
            };
            expect(() => shippingInfoSchema.parse(invalidInfo)).toThrow();
        });

        it('should reject short address', () => {
            const invalidInfo = {
                ...validShippingInfo,
                address: '123',
            };
            expect(() => shippingInfoSchema.parse(invalidInfo)).toThrow();
        });

        it('should reject empty required fields', () => {
            expect(() =>
                shippingInfoSchema.parse({ ...validShippingInfo, firstName: '' })
            ).toThrow();
            expect(() =>
                shippingInfoSchema.parse({ ...validShippingInfo, lastName: '' })
            ).toThrow();
            expect(() =>
                shippingInfoSchema.parse({ ...validShippingInfo, city: '' })
            ).toThrow();
        });
    });

    describe('productSchema', () => {
        const validProduct = {
            name: 'Classic Mug',
            slug: 'classic-mug',
            description: 'A classic ceramic mug perfect for daily use',
            category: 'mug' as const,
            basePrice: 12.99,
        };

        it('should validate correct product', () => {
            expect(() => productSchema.parse(validProduct)).not.toThrow();
        });

        it('should validate product with optional fields', () => {
            const productWithOptionals = {
                ...validProduct,
                id: 'mug-11oz',
                longDescription: 'This is a longer description of the product...',
                compareAtPrice: 15.99,
                featured: true,
                bestseller: true,
            };
            expect(() => productSchema.parse(productWithOptionals)).not.toThrow();
        });

        it('should reject invalid category', () => {
            const invalidProduct = {
                ...validProduct,
                category: 'invalid-category',
            };
            expect(() => productSchema.parse(invalidProduct)).toThrow();
        });

        it('should reject negative price', () => {
            const invalidProduct = {
                ...validProduct,
                basePrice: -10,
            };
            expect(() => productSchema.parse(invalidProduct)).toThrow();
        });

        it('should reject short description', () => {
            const invalidProduct = {
                ...validProduct,
                description: 'Short',
            };
            expect(() => productSchema.parse(invalidProduct)).toThrow();
        });

        it('should reject long name', () => {
            const invalidProduct = {
                ...validProduct,
                name: 'A'.repeat(101),
            };
            expect(() => productSchema.parse(invalidProduct)).toThrow();
        });
    });

    describe('createPaymentIntentSchema', () => {
        const validPaymentIntent = {
            items: [{ productId: 'mug-11oz', quantity: 1 }],
            shippingInfo: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: '+34666777888',
                address: '123 Main St',
                city: 'Madrid',
                postalCode: '28001',
                country: 'Spain',
            },
            shippingMethod: 'standard' as const,
        };

        it('should validate correct payment intent', () => {
            expect(() => createPaymentIntentSchema.parse(validPaymentIntent)).not.toThrow();
        });

        it('should validate payment intent with userId', () => {
            const withUserId = {
                ...validPaymentIntent,
                userId: 'user-123',
            };
            expect(() => createPaymentIntentSchema.parse(withUserId)).not.toThrow();
        });

        it('should reject invalid shipping method', () => {
            const invalidIntent = {
                ...validPaymentIntent,
                shippingMethod: 'teleportation',
            };
            expect(() => createPaymentIntentSchema.parse(invalidIntent)).toThrow();
        });

        it('should validate all shipping methods', () => {
            const methods = ['standard', 'express', 'overnight'];
            methods.forEach((method) => {
                const intent = {
                    ...validPaymentIntent,
                    shippingMethod: method,
                };
                expect(() => createPaymentIntentSchema.parse(intent)).not.toThrow();
            });
        });
    });

    describe('trackOrderSchema', () => {
        it('should validate correct track order data', () => {
            const validData = {
                orderNumber: 'ORD-12345678',
                email: 'customer@example.com',
            };
            expect(() => trackOrderSchema.parse(validData)).not.toThrow();
        });

        it('should reject invalid email', () => {
            const invalidData = {
                orderNumber: 'ORD-12345678',
                email: 'not-email',
            };
            expect(() => trackOrderSchema.parse(invalidData)).toThrow();
        });

        it('should reject empty order number', () => {
            const invalidData = {
                orderNumber: '',
                email: 'customer@example.com',
            };
            expect(() => trackOrderSchema.parse(invalidData)).toThrow();
        });
    });

    describe('signUpSchema', () => {
        it('should validate signup without confirmPassword', () => {
            const validData = {
                email: 'test@example.com',
                password: 'password123',
            };
            expect(() => signUpSchema.parse(validData)).not.toThrow();
        });

        it('should validate signup with matching confirmPassword', () => {
            const validData = {
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'password123',
            };
            expect(() => signUpSchema.parse(validData)).not.toThrow();
        });

        it('should reject mismatched passwords', () => {
            const invalidData = {
                email: 'test@example.com',
                password: 'password123',
                confirmPassword: 'different',
            };
            expect(() => signUpSchema.parse(invalidData)).toThrow();
        });
    });
});
