import { z } from 'zod';

/**
 * Environment Variables Schema
 * Validates all required environment variables at startup
 */
const envSchema = z.object({
    // Stripe
    STRIPE_SECRET_KEY: z.string().min(1).startsWith('sk_'),
    STRIPE_WEBHOOK_SECRET: z.string().min(1).startsWith('whsec_'),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),

    // Supabase
    SUPABASE_URL: z.string().url(),
    SUPABASE_ANON_KEY: z.string().min(1),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

    // App
    NEXT_PUBLIC_APP_URL: z.string().url().optional().default('http://localhost:3000'),
    ALLOWED_ORIGINS: z.string().optional().default('http://localhost:3000'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

/**
 * Validated environment variables
 * @throws {ZodError} if validation fails
 */
export const env = envSchema.parse(process.env);

/**
 * Type-safe environment variables
 */
export type Env = z.infer<typeof envSchema>;

// Log validation success (non-sensitive info only)
if (process.env.NODE_ENV !== 'production') {
    console.log('✅ Environment variables validated successfully');
}
