import { NextResponse } from 'next/server';
import { z } from 'zod';
import { resend, EMAIL_FROM } from '@/lib/email';
import { generateOrderEmailHtml } from '@/components/emails/OrderConfirmation';
import { getIP, requireAuth } from '@/lib/api-utils';
import { sanitizeEmail } from '@/lib/sanitization';

// Validation schema
const orderEmailSchema = z.object({
    orderNumber: z.string().min(1).max(100),
    email: z.string().email('Invalid email address'),
    total: z.number().positive('Total must be positive'),
    items: z.array(z.object({
        id: z.string(),
        name: z.string().max(200),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
    })).min(1, 'At least one item required'),
    shippingInfo: z.object({
        name: z.string().max(200),
        address: z.string().max(500),
        city: z.string().max(100),
        postalCode: z.string().max(20),
        country: z.string().max(100),
    }),
});

// Rate limiting: 3 emails per 5 minutes per IP
const emailAttempts = new Map<string, { count: number; resetTime: number }>();

function checkEmailRateLimit(ip: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    const windowMs = 5 * 60000; // 5 minutes
    const maxAttempts = 3;

    if (emailAttempts.size > 500) {
        for (const [key, value] of emailAttempts.entries()) {
            if (value.resetTime < now) emailAttempts.delete(key);
        }
    }

    const attempt = emailAttempts.get(ip);
    if (!attempt || attempt.resetTime < now) {
        emailAttempts.set(ip, { count: 1, resetTime: now + windowMs });
        return { allowed: true };
    }

    if (attempt.count >= maxAttempts) {
        return { allowed: false, resetTime: attempt.resetTime };
    }

    attempt.count++;
    return { allowed: true };
}

export async function POST(req: Request) {
    try {
        // Authentication required - only authenticated users can send order emails
        const user = await requireAuth(req);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Rate limiting
        const ip = getIP(req);
        const rateLimitCheck = checkEmailRateLimit(ip);

        if (!rateLimitCheck.allowed) {
            const retryAfter = Math.ceil((rateLimitCheck.resetTime! - Date.now()) / 1000);
            return NextResponse.json(
                { error: 'Too many email requests', retryAfter },
                { status: 429, headers: { 'Retry-After': retryAfter.toString() } }
            );
        }

        // Parse and validate request
        const body = await req.json();
        const validation = orderEmailSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                {
                    error: 'Invalid request',
                    details: validation.error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                },
                { status: 400 }
            );
        }

        const { orderNumber, items, total, shippingInfo, email } = validation.data;

        // Sanitize email
        const sanitizedEmail = sanitizeEmail(email);
        if (!sanitizedEmail) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        if (!process.env.RESEND_API_KEY) {
            if (process.env.NODE_ENV === 'development') {
                console.log('Skipping email send: No RESEND_API_KEY configured');
            }
            return NextResponse.json({ success: true, message: 'Skipped (No API Key)' });
        }

        const html = generateOrderEmailHtml({
            orderNumber,
            items,
            total,
            shippingInfo
        });

        const { data, error } = await resend.emails.send({
            from: EMAIL_FROM,
            to: sanitizedEmail,
            subject: `Order Confirmation ${orderNumber}`,
            html: html,
        });

        if (error) {
            console.error('Resend error:', error);
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Email sending error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
