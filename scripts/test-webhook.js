const fetch = require('node-fetch'); // Native fetch is available in Node 18+, but using standard fetch

async function testWebhook() {
    const payload = {
        id: 'evt_test_webhook_' + Date.now(),
        object: 'event',
        type: 'payment_intent.succeeded',
        data: {
            object: {
                id: 'pi_test_123456789', // Fake PaymentIntent ID
                object: 'payment_intent',
                amount: 2500,
                currency: 'eur',
                metadata: {
                    userId: 'test_user_123'
                }
            }
        }
    };

    console.log('🚀 Sending mock webhook event...');

    try {
        const response = await fetch('http://localhost:3000/api/stripe/webhooks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // No signature needed in dev mode thanks to our logic
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        console.log('Status:', response.status);
        console.log('Response:', data);

        if (response.status === 200) {
            console.log('✅ Webhook test PASSED!');
        } else {
            console.error('❌ Webhook test FAILED');
        }

    } catch (error) {
        console.error('❌ Connection failed:', error.message);
    }
}

testWebhook();
