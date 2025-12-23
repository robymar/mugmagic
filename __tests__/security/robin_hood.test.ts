
import { NextRequest } from 'next/server';

// 1. Mock Stripe class structure for default import
const mockPaymentIntentsCreate = jest.fn();
jest.mock('stripe', () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
            paymentIntents: {
                create: mockPaymentIntentsCreate.mockResolvedValue({
                    id: 'pi_mock_123',
                    client_secret: 'secret_mock_123',
                }),
            },
        })),
    };
});

// 2. Mock Supabase Admin
jest.mock('@/lib/supabase-admin', () => ({
    supabaseAdmin: {
        from: jest.fn(() => ({
            insert: jest.fn().mockResolvedValue({ error: null }),
            select: jest.fn(() => ({
                eq: jest.fn(() => ({
                    single: jest.fn().mockResolvedValue({ data: { stock_count: 100, in_stock: true, name: 'Test Product' }, error: null })
                }))
            }))
        })),
    },
}));

describe('Security: Robin Hood Attack', () => {
    let POST: any;

    beforeAll(() => {
        // Set env vars BEFORE requiring the module
        process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock_key';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock_anon_key';

        // Dynamically require the route to ensure env vars are picked up
        // and mocks are applied.
        const routeModule = require('@/app/api/create-payment-intent/route');
        POST = routeModule.POST;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('SHOULD ignore client-side price manipulation and charge the correct amount', async () => {
        // ATTACK PAYLOAD
        const attackPayload = {
            items: [
                {
                    productId: 'mug-11oz', // Real ID from products.ts
                    quantity: 10,
                    price: 0.01, // MALICIOUS INJECTION
                    selectedVariant: {
                        id: 'white',
                        name: 'White',
                        priceModifier: -9999 // MALICIOUS MODIFIER
                    }
                }
            ],
            shippingInfo: {
                firstName: 'Robin',
                lastName: 'Hood',
                email: 'robin@sherwood.com',
                phone: '555123456',
                address: 'Sherwood Forest',
                city: 'Nottingham',
                postalCode: '12345',
                country: 'UK'
            },
            shippingMethod: 'standard',
            userId: 'user_123'
        };

        const req = new NextRequest('http://localhost:3000/api/create-payment-intent', {
            method: 'POST',
            body: JSON.stringify(attackPayload),
        });

        const res = await POST(req);
        const data = await res.json();

        // 12.99 * 10 = 129.90. Shipping = 0 (Free > 50). Total = 129.90.
        // In cents: 12990.
        const expectedAmount = 12990;

        // Assertion: Status OK (meaning it processed the REAL price)
        expect(res.status).toBe(200);

        // Assertion: Stripe called with REAL price
        expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                amount: expectedAmount,
                currency: 'eur',
            })
        );

        // Assertion: NOT called with malicious price
        expect(mockPaymentIntentsCreate).not.toHaveBeenCalledWith(
            expect.objectContaining({
                amount: 10, // 0.10 EUR
            })
        );
    });
});
