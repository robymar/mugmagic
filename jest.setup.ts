import '@testing-library/jest-dom';

// Mock environment variables for testing
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock_secret';
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_mock_key';
process.env.SUPABASE_URL = 'https://mock.supabase.co';
process.env.SUPABASE_ANON_KEY = 'mock_anon_key';

// Set NODE_ENV using defineProperty to avoid read-only error
Object.defineProperty(process.env, 'NODE_ENV', {
    value: 'test',
    writable: true,
    configurable: true
});
