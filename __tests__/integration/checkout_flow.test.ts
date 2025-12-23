
import { NextRequest } from 'next/server';

// 1. Mock Stripe
const mockPaymentIntentsCreate = jest.fn();
jest.mock('stripe', () => {
    return {
        __esModule: true,
        default: jest.fn().mockImplementation(() => ({
            paymentIntents: {
                create: mockPaymentIntentsCreate.mockResolvedValue({
                    id: 'pi_test_123456789',
                    client_secret: 'pi_test_secret_123',
                }),
            },
        })),
    };
});

// 2. Mock Supabase Admin
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockInsert = jest.fn();

jest.mock('@/lib/supabase-admin', () => ({
    supabaseAdmin: {
        from: mockFrom,
    },
}));

describe('Integration: Checkout Flow (Happy Path)', () => {
    let POST: any;

    beforeAll(() => {
        process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test';
        process.env.SUPABASE_SERVICE_ROLE_KEY = 'mock_service_key';
        process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock_anon_key';

        // Setup mocked chain
        // supabase.from('products').select(...).eq(...).single()
        // supabase.from('orders').insert(...)
        mockFrom.mockReturnValue({
            select: mockSelect,
            insert: mockInsert,
        });
        mockSelect.mockReturnValue({
            eq: mockEq,
        });
        mockEq.mockReturnValue({
            single: mockSingle,
        });

        // Default success responses - MATCHING ACTUAL PRODUCT DATA for 'mug-11oz'
        mockSingle.mockResolvedValue({
            data: {
                id: 'mug-11oz',
                name: 'Classic Mug 11oz',
                stock_count: 50,
                in_stock: true
            },
            error: null
        });

        mockInsert.mockResolvedValue({ error: null });

        // Require route
        const routeModule = require('@/app/api/create-payment-intent/route');
        POST = routeModule.POST;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset chain return values to ensure clean state
        mockFrom.mockReturnValue({
            select: mockSelect,
            insert: mockInsert,
        });
        mockSelect.mockReturnValue({
            eq: mockEq,
        });
        mockEq.mockReturnValue({
            single: mockSingle,
        });
    });

    it('SHOULD create a payment intent and save order for a valid cart', async () => {
        const validPayload = {
            items: [
                {
                    productId: 'mug-11oz', // REAL ID
                    quantity: 2
                }
            ],
            shippingInfo: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                phone: '1234567890',
                address: '123 Main St',
                city: 'Test City',
                postalCode: '12345',
                country: 'Test Country'
            },
            shippingMethod: 'standard'
        };

        const req = new NextRequest('http://localhost:3000/api/create-payment-intent', {
            method: 'POST',
            body: JSON.stringify(validPayload),
        });

        const res = await POST(req);
        const data = await res.json();

        // Expect 200 OK
        expect(res.status).toBe(200);

        // Expect Client Secret
        expect(data).toHaveProperty('clientSecret', 'pi_test_secret_123');

        // Verify Stripe Charge Calculation
        // Product: mug-11oz (12.99)
        // 2 items * 12.99 = 25.98
        // Shipping (standard, < 50) = 5.00
        // Total = 30.98 -> 3098 cents
        expect(mockPaymentIntentsCreate).toHaveBeenCalledWith(
            expect.objectContaining({
                amount: 3098,
                currency: 'eur',
                metadata: expect.objectContaining({
                    user_id: 'guest',
                    shipping_name: 'John Doe'
                })
            })
        );

        // Verify Order Saved to DB
        expect(mockFrom).toHaveBeenCalledWith('orders');
        expect(mockInsert).toHaveBeenCalledWith(
            expect.objectContaining({
                total_amount: 30.98,
                customer_email: 'john@example.com',
                payment_status: 'pending'
            })
        );
    });

    it('SHOULD fail if stock is insufficient', async () => {
        // Mock product returning low stock - USE REAL ID 'mug-11oz' for pricing lookup success
        // Simulating the DB check failing due to low stock
        mockSingle.mockResolvedValueOnce({
            data: {
                id: 'mug-11oz',
                name: 'Classic Mug 11oz',
                stock_count: 1, // Only 1 left
                in_stock: true
            },
            error: null
        });

        const invalidPayload = {
            items: [
                {
                    productId: 'mug-11oz',
                    quantity: 5 // Want 5, have 1
                }
            ],
            shippingInfo: {
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane@example.com',
                phone: '1234567890',
                address: '456 Side St',
                city: 'Test City',
                postalCode: '54321',
                country: 'Test Country'
            },
            shippingMethod: 'standard'
        };

        const req = new NextRequest('http://localhost:3000/api/create-payment-intent', {
            method: 'POST',
            body: JSON.stringify(invalidPayload),
        });

        const res = await POST(req);
        const data = await res.json();

        expect(res.status).toBe(400);
        expect(data.error).toMatch(/Insufficient stock/);

        // Stripe should NOT be called
        expect(mockPaymentIntentsCreate).not.toHaveBeenCalled();
    });
});
