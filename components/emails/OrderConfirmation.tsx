import { CartItem } from '@/stores/cartStore';

interface OrderEmailProps {
    orderNumber: string;
    items: CartItem[];
    total: number;
    shippingInfo: {
        firstName: string;
        lastName: string;
        address: string;
        city: string;
        country: string;
    };
}

export function generateOrderEmailHtml({ orderNumber, items, total, shippingInfo }: OrderEmailProps) {
    const itemsList = items.map(item => `
        <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
            <p style="margin: 0; font-weight: bold;">${item.product.name} ${item.selectedVariant ? `(${item.selectedVariant.name})` : ''}</p>
            <p style="margin: 0; color: #666;">Qty: ${item.quantity} x €${item.price.toFixed(2)}</p>
        </div>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Order Confirmation</title>
        </head>
        <body style="font-family: sans-serif; line-height: 1.5; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #2563eb;">Thank you for your order!</h1>
                <p>Hi ${shippingInfo.firstName},</p>
                <p>We're getting your order ready to be shipped. We will notify you when it has been sent.</p>
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="margin-top: 0; font-size: 18px;">Order #${orderNumber}</h2>
                    ${itemsList}
                    <div style="border-top: 2px solid #ddd; margin-top: 10px; padding-top: 10px; text-align: right;">
                        <strong>Total: €${total.toFixed(2)}</strong>
                    </div>
                </div>

                <div style="margin-top: 20px;">
                    <h3 style="font-size: 16px;">Shipping Address</h3>
                    <p style="color: #666;">
                        ${shippingInfo.firstName} ${shippingInfo.lastName}<br>
                        ${shippingInfo.address}<br>
                        ${shippingInfo.city}, ${shippingInfo.country}
                    </p>
                </div>

                <div style="margin-top: 40px; text-align: center; color: #888; font-size: 12px;">
                    <p>&copy; ${new Date().getFullYear()} MugMagic. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}
