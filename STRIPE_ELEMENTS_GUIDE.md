# 🔐 IMPLEMENTACIÓN DE STRIPE ELEMENTS

## ⚠️ CRÍTICO PARA PCI-DSS COMPLIANCE

**Estado Actual:** ❌ Card data en memoria (inseguro)  
**Estado Requerido:** ✅ Stripe Elements (PCI-DSS compliant)  
**Prioridad:** 🔴 ALTA - Implementar antes de pagos reales

---

## 🎯 OBJETIVO

Eliminar completamente el manejo de datos de tarjetas del código frontend usando **Stripe Elements**, que maneja todos los datos sensibles de forma segura.

---

## 📋 PASOS DE IMPLEMENTACIÓN

### 1. Instalar Dependencias (Ya Instalado ✅)

```bash
# Ya está instalado en package.json
npm install @stripe/react-stripe-js @stripe/stripe-js
```

---

### 2. Crear Stripe Elements Provider

**Archivo:** `app/checkout/page.tsx`

```typescript
'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useState, useEffect } from 'react';

// Load Stripe (memoized)
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
    const [clientSecret, setClientSecret] = useState<string>('');
    const { items } = useCartStore();

    useEffect(() => {
        // Create payment intent when page loads
        async function createPaymentIntent() {
            const res = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items })
            });

            const data = await res.json();
            setClientSecret(data.clientSecret);
        }

        if (items.length > 0) {
            createPaymentIntent();
        }
    }, [items]);

    // Stripe Elements options
    const options = {
        clientSecret,
        appearance: {
            theme: 'stripe' as const,
            variables: {
                colorPrimary: '#3b82f6',
                fontFamily: 'system-ui, sans-serif',
                borderRadius: '12px',
            }
        }
    };

    if (!clientSecret) {
        return <div>Loading...</div>;
    }

    return (
        <Elements options={options} stripe={stripePromise}>
            <CheckoutForm />
        </Elements>
    );
}
```

---

### 3. Crear Checkout Form con Stripe Elements

**Archivo:** `components/checkout/CheckoutForm.tsx` (crear)

```typescript
'use client';

import { useState } from 'react';
import {
    PaymentElement,
    AddressElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';

export function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const router = useRouter();
    const { clearCart } = useCartStore();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setErrorMessage('');

        // Confirm payment
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/success`,
            },
            redirect: 'if_required'
        });

        if (error) {
            setErrorMessage(error.message || 'Payment failed');
            setIsProcessing(false);
        } else {
            // Payment successful
            clearCart();
            router.push('/checkout/success');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                <AddressElement
                    options={{
                        mode: 'shipping',
                        allowedCountries: ['ES', 'FR', 'DE', 'IT', 'PT', 'GB', 'US']
                    }}
                />
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Payment Details</h2>
                <PaymentElement
                    options={{
                        layout: 'tabs',
                        defaultValues: {
                            billingDetails: {
                                name: '',
                                email: ''
                            }
                        }
                    }}
                />
            </div>

            {/* Error Message */}
            {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                    {errorMessage}
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={!stripe || !elements || isProcessing}
                className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold text-lg rounded-xl hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isProcessing ? (
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Processing...
                    </div>
                ) : (
                    'Place Order'
                )}
            </button>
        </form>
    );
}
```

---

### 4. Actualizar Success Page

**Archivo:** `app/checkout/success/page.tsx`

```typescript
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<string>('loading');

    useEffect(() => {
        const clientSecret = searchParams.get('payment_intent_client_secret');
        
        if (!clientSecret) {
            setStatus('error');
            return;
        }

        // Verify payment status with Stripe
        fetch(`/api/verify-payment?client_secret=${clientSecret}`)
            .then(res => res.json())
            .then(data => setStatus(data.status))
            .catch(() => setStatus('error'));
    }, [searchParams]);

    if (status === 'loading') {
        return <div>Verifying payment...</div>;
    }

    if (status === 'succeeded') {
        return (
            <div className="text-center">
                <h1 className="text-3xl font-bold text-green-600 mb-4">
                    Payment Successful!
                </h1>
                <p>Your order has been confirmed.</p>
            </div>
        );
    }

    return (
        <div className="text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">
                Payment Failed
            </h1>
            <p>Please try again or contact support.</p>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
```

---

### 5. Crear API para Verificar Pago

**Archivo:** `app/api/verify-payment/route.ts` (crear)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { logInfo, logError } from '@/lib/logger';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const clientSecret = searchParams.get('client_secret');

        if (!clientSecret) {
            return NextResponse.json(
                { error: 'Missing client secret' },
                { status: 400 }
            );
        }

        // Retrieve payment intent
        const paymentIntentId = clientSecret.split('_secret_')[0];
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        logInfo('Payment verification', {
            data: {
                paymentIntentId,
                status: paymentIntent.status
            }
        });

        return NextResponse.json({
            status: paymentIntent.status,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency
        });

    } catch (err: any) {
        logError('Payment verification failed', {
            data: { error: err.message }
        });

        return NextResponse.json(
            { error: 'Verification failed' },
            { status: 500 }
        );
    }
}
```

---

## ⚠️ VENTAJAS DE STRIPE ELEMENTS

### ✅ Seguridad:
- **NO tocas card data** en tu código
- **PCI-DSS compliant** automáticamente
- Datos van directo a Stripe (encriptados)
- No vulnerable a XSS

### ✅ Funcionalidad:
- Validación automática de tarjetas
- Auto-format de números
- Detección de tipo de tarjeta
- 3D Secure (SCA) automático
- Soporte para wallets (Apple Pay, Google Pay)

### ✅ UX:
- Diseño customizable
- Responsive out-of-the-box
- Múltiples métodos de pago
- Localización automática

---

## 🔄 MIGRACIÓN DESDE CÓDIGO ACTUAL

### ❌ Código Actual (INSEGURO):
```typescript
// checkout/page.tsx
const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',  // ❌ En memoria
    cvv: ''         // ❌ Viola PCI-DSS
});

<input 
    type="text"
    value={paymentInfo.cardNumber} // ❌ NO HACER
    onChange={...}
/>
```

### ✅ Código Nuevo (SEGURO):
```typescript
// components/checkout/CheckoutForm.tsx
import { PaymentElement } from '@stripe/react-stripe-js';

// ✅ Stripe maneja todo
<PaymentElement
    options={{ layout: 'tabs' }}
/>

// ✅ No más useState para card data
// ✅ No más inputs manuales
// ✅ PCI-DSS compliant
```

---

## 📝 CHECKLIST DE IMPLEMENTACIÓN

### Antes de Empezar:
- [ ] Tener cuenta de Stripe
- [ ] Obtener claves (test para dev, live para prod)
- [ ] Configurar webhook endpoint

### Durante Implementación:
- [ ] Instalar dependencias
- [ ] Crear CheckoutForm component
- [ ] Integrar Elements provider
- [ ] Eliminar inputs de card manual
- [ ] Actualizar API de payment intent
- [ ] Crear API de verificación
- [ ] Actualizar success page

### Testing:
- [ ] Test con tarjeta test: 4242 4242 4242 4242
- [ ] Test 3D Secure: 4000 0025 0000 3155
- [ ] Test declined: 4000 0000 0000 0002
- [ ] Verificar webhook funciona
- [ ] Check PCI compliance en Stripe Dashboard

### Deployment:
- [ ] Cambiar a Live keys
- [ ] Configurar webhook en producción
- [ ] Test end-to-end en producción
- [ ] Monitorear primeros pagos

---

## 🔗 RECURSOS

### Documentación Oficial:
- [Stripe Elements Docs](https://stripe.com/docs/payments/accept-a-payment)
- [React Stripe.js](https://stripe.com/docs/stripe-js/react)
- [Payment Element](https://stripe.com/docs/payments/payment-element)

### Test Cards:
```
Success: 4242 4242 4242 4242
3D Secure: 4000 0025 0000 3155
Declined: 4000 0000 0000 0002
Insufficient funds: 4000 0000 0000 9995
```

---

## ⏱️ TIEMPO ESTIMADO

- **Setup:** 30 min
- **Implementación:** 2-3 horas
- **Testing:** 1 hora
- **Total:** ~4 horas

---

## 🎯 RESULTADO FINAL

### Antes:
```typescript
❌ Card data en useState
❌ CVV en memoria
❌ Viola PCI-DSS
❌ Vulnerable si hay XSS
❌ Mantenimiento manual
```

### Después:
```typescript
✅ Stripe maneja card data
✅ PCI-DSS compliant
✅ No vulnerable a XSS
✅ 3D Secure automático
✅ Múltiples métodos de pago
✅ Cero mantenimiento
```

---

## 🚨 IMPORTANTE

**NO PROCESAR PAGOS REALES sin implementar Stripe Elements.**

El código actual solo es válido para:
- ✅ Testing UI/UX
- ✅ Demo/prototyping
- ❌ **NO para producción con pagos reales**

---

**Prioridad:** 🔴 **CRÍTICA**  
**Tiempo:** 4 horas  
**Impacto:** **ALTO** (PCI-DSS compliance)  
**Siguiente paso:** Implementar CheckoutForm component
