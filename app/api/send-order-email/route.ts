import { NextResponse } from 'next/server';
import { resend, EMAIL_FROM } from '@/lib/email';
import { generateOrderEmailHtml } from '@/components/emails/OrderConfirmation';

export async function POST(req: Request) {
    try {
        const { orderNumber, items, total, shippingInfo, email } = await req.json();

        if (!process.env.RESEND_API_KEY) {
            console.log('Skipping email send: No RESEND_API_KEY configured');
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
            to: email, // In production, limit to verified domains or user email
            subject: `Order Confirmation ${orderNumber}`,
            html: html,
        });

        if (error) {
            console.error('Resend error:', error);
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error('Email sending error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
