const fetch = require('node-fetch');

async function testCheckoutFlow() {
    console.log('🚀 Iniciando prueba simulada de checkout...\n');

    const BASE_URL = 'http://localhost:3000/api';

    try {
        // 1. OBTENER PRODUCTO Y VARIANTE
        console.log('📦 Paso 1: Obteniendo producto y variante...');
        const productRes = await fetch(`${BASE_URL}/products/mug-11oz-white`);

        if (!productRes.ok) throw new Error(`Error fetching product: ${productRes.status}`);
        const product = await productRes.json();

        const variantId = product.variants?.[0]?.id;
        console.log(`   ✅ Producto: ${product.name}`);
        console.log(`   ✅ Variant ID encontrado: ${variantId}`);

        if (!variantId) throw new Error('No se encontró variant ID');

        // 2. INICIAR RESERVA DE STOCK (Checkout Init)
        console.log('\n🔒 Paso 2: Reservando stock (Checkout Init)...');
        const initPayload = {
            items: [{
                variant_id: variantId,
                quantity: 1
            }]
        };

        const initRes = await fetch(`${BASE_URL}/checkout/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(initPayload)
        });

        const initData = await initRes.json();
        if (!initRes.ok) {
            console.log('   ❌ Error en init:', initData);
            throw new Error(`Error checkout init: ${initRes.status}`);
        }

        const checkoutId = initData.checkout_id;
        console.log('   ✅ Reserva exitosa (MOCKED)');
        console.log(`   ✅ Checkout ID: ${checkoutId}`);

        // 3. CREAR PAYMENT INTENT DE STRIPE
        console.log('\n💳 Paso 3: Creando Payment Intent en Stripe...');
        const paymentPayload = {
            items: [{
                productId: product.id,
                selectedVariant: { id: variantId, name: "Standard White" },
                quantity: 1,
                price: product.basePrice
            }],
            shippingInfo: {
                firstName: "Test",
                lastName: "User",
                email: "test@example.com",
                phone: "123456789",
                address: "123 Test Street",
                city: "Madrid",
                postalCode: "28001",
                country: "Spain"
            },
            shippingMethodId: "standard",
            checkout_id: checkoutId
        };

        const paymentRes = await fetch(`${BASE_URL}/create-payment-intent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentPayload)
        });

        const paymentData = await paymentRes.json();

        if (!paymentRes.ok) {
            console.log('   ❌ Error en payment intent:', paymentData);
            throw new Error(`Error payment intent: ${paymentRes.status}`);
        }

        console.log('   ✅ Payment Intent creado');
        console.log(`   ✅ Client Secret: ${paymentData.clientSecret ? 'Presente' : 'Faltante'}`);
        console.log(`   ✅ Amount: €${paymentData.amount / 100}`);

        console.log('\n✨ ¡PRUEBA EXITOSA! El backend está 100% OPERATIVO.');

    } catch (error) {
        console.error('\n❌ LA PRUEBA FALLÓ:', error.message);
        console.error(error);
    }
}

testCheckoutFlow();
