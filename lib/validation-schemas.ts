import { z } from 'zod';

// ==========================================
// Authentication Schemas
// ==========================================

export const loginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signUpSchema = loginSchema.extend({
    confirmPassword: z.string().optional(),
}).refine(
    (data) => !data.confirmPassword || data.password === data.confirmPassword,
    {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    }
);

// ==========================================
// Product Schemas
// ==========================================

export const productVariantSchema = z.object({
    id: z.string(),
    name: z.string(),
    color: z.string().optional(),
    hexCode: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    priceModifier: z.number(),
});

export const productSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1).max(100),
    slug: z.string().min(1).max(100),
    description: z.string().min(10).max(500),
    longDescription: z.string().min(10).max(2000).optional(),
    category: z.enum(['mug', 'travel-mug', 'camping-mug', 'other']),
    basePrice: z.number().positive(),
    compareAtPrice: z.number().positive().optional(),
    inStock: z.boolean().default(true),
    featured: z.boolean().default(false),
    bestseller: z.boolean().default(false),
    new: z.boolean().default(false),
    variants: z.array(productVariantSchema).optional(),
});

// ==========================================
// Cart Schemas
// ==========================================

export const cartItemSchema = z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive().max(99, 'Maximum quantity is 99'),
    selectedVariant: z
        .object({
            id: z.string(),
            name: z.string(),
        })
        .optional(),
});

export const cartSchema = z.object({
    items: z
        .array(cartItemSchema)
        .min(1, 'Cart must have at least one item')
        .max(50, 'Cart cannot have more than 50 items'),
});

// ==========================================
// Shipping and Checkout Schemas
// ==========================================

export const shippingInfoSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    email: z.string().email('Invalid email format'),
    phone: z
        .string()
        .min(9, 'Phone number must be at least 9 characters')
        .max(20, 'Phone number is too long'),
    address: z.string().min(5, 'Address is too short').max(200),
    city: z.string().min(2, 'City name is too short').max(100),
    postalCode: z.string().min(4, 'Postal code is too short').max(10),
    country: z.string().min(2, 'Country name is too short').max(50),
});

export const shippingMethodSchema = z.enum(['standard', 'express', 'overnight']);

export const createPaymentIntentSchema = z.object({
    items: z.array(cartItemSchema).min(1),
    shippingInfo: shippingInfoSchema,
    shippingMethod: shippingMethodSchema,
    userId: z.string().optional(),
});

// ==========================================
// Order Tracking Schema
// ==========================================

export const trackOrderSchema = z.object({
    orderNumber: z.string().min(1, 'Order number is required'),
    email: z.string().email('Invalid email format'),
});

// ==========================================
// Design Schemas
// ==========================================

export const saveDesignSchema = z.object({
    productId: z.string().min(1),
    name: z.string().min(1).max(100),
    canvasState: z.any(), // JSON object from fabric.js
    previewUrl: z.string().url().optional(),
});

// ==========================================
// Admin Schemas
// ==========================================

export const updateOrderStatusSchema = z.object({
    orderId: z.string().min(1),
    status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
});

// ==========================================
// Type Exports
// ==========================================

export type LoginInput = z.infer<typeof loginSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
export type CartInput = z.infer<typeof cartSchema>;
export type ShippingInfoInput = z.infer<typeof shippingInfoSchema>;
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
export type TrackOrderInput = z.infer<typeof trackOrderSchema>;
export type SaveDesignInput = z.infer<typeof saveDesignSchema>;
