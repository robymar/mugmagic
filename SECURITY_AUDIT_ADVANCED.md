# 🔴 AUDITORÍA DE SEGURIDAD AVANZADA - NIVEL HACKER
## MugMagic E-commerce Platform

**Fecha:** 2026-01-05 21:46 CET  
**Auditor:** Red Team / Offensive Security Specialist  
**Tipo:** Advanced Penetration Testing  
**Profundidad:** DEEP DIVE - Análisis de vulnerabilidades sutiles

---

## 🎯 **OBJETIVO**

Identificar vulnerabilidades avanzadas que un atacante experto explotaría para:
- Comprometer la integridad del sistema
- Robar datos sensibles
- Manipular transacciones financieras
- Escalar privilegios
- Ejecutar ataques de denegación de servicio (DoS)

---

## 🔴 **VULNERABILIDADES CRÍTICAS ENCONTRADAS**

### 1. **RACE CONDITION EN STOCK RESERVATIONS** 🔴🔴🔴
**Severidad:** CRÍTICO  
**CVSS Score:** 9.1  
**Archivo:** `lib/stock-reservation.ts`

#### Descripción del Ataque:
Un atacante puede explotar condiciones de carrera en la creación de reservas de stock para comprar más productos de los disponibles.

#### Código Vulnerable:
```typescript
// lib/stock-reservation.ts línea 96-127
export async function createBulkReservations(
    items: Array<{ variantId: string; quantity: number }>,
    checkoutId: string,
    userId?: string
): Promise<{ success: boolean; reservations: StockReservation[]; errors: string[] }> {
    const reservations: StockReservation[] = [];
    const errors: string[] = [];

    // ❌ VULNERABLE: No hay transacción atómica
    for (const item of items) {
        const result = await createStockReservation({
            variantId: item.variantId,
            quantity: item.quantity,
            checkoutId,
            userId
        });

        if (result.success && result.reservation) {
            reservations.push(result.reservation);
        } else {
            errors.push(result.error || `Failed for variant ${item.variantId}`);

            // Rollback manual - VULNERABLE a race conditions
            if (reservations.length > 0) {
                await releaseReservations(checkoutId);
            }

            return { success: false, reservations: [], errors };
        }
    }

    return { success: true, reservations, errors: [] };
}
```

#### Proof of Concept (PoC):
```javascript
// ATAQUE: Múltiples usuarios compran el último item simultáneamente
// Stock disponible: 1
// Usuarios atacando: 10

// Script de ataque
async function raceConditionAttack() {
    const promises = [];
    
    for (let i = 0; i < 10; i++) {
        promises.push(
            fetch('/api/checkout/init', {
                method: 'POST',
                body: JSON.stringify({
                    items: [{ 
                        variant_id: 'limited-edition-mug', 
                        quantity: 1 
                    }]
                })
            })
        );
    }
    
    // Ejecutar todas las requests simultáneamente
    const results = await Promise.all(promises);
    
    // RESULTADO: Múltiples reservas creadas para el mismo stock
    // Stock: 1, Reservas: 10 ❌
}
```

#### Impacto:
- **Overselling masivo**: Vender más productos de los que hay en stock
- **Pérdida financiera**: Costos de reembolso y envío
- **Reputación dañada**: Clientes recibiendo órdenes canceladas
- **Fraude**: Atacantes comprando productos agotados

#### Solución Requerida:
```typescript
// Usar transacción atómica en base de datos
export async function createBulkReservations(
    items: Array<{ variantId: string; quantity: number }>,
    checkoutId: string,
    userId?: string
): Promise<{ success: boolean; reservations: StockReservation[]; errors: string[] }> {
    // Llamar a función SQL que maneja TODO en una transacción
    const { data, error } = await supabaseAdmin.rpc('create_bulk_reservations_atomic', {
        p_items: items,
        p_checkout_id: checkoutId,
        p_user_id: userId
    });
    
    if (error) {
        return { success: false, reservations: [], errors: [error.message] };
    }
    
    return { success: true, reservations: data.reservations, errors: [] };
}
```

**Prioridad:** 🚨 CRÍTICA - Implementar INMEDIATAMENTE

---

### 2. **BYPASS DE RESERVACIONES CON CHECKOUT_ID PREDECIBLE** 🔴🔴
**Severidad:** CRÍTICO  
**CVSS Score:** 8.7  
**Archivo:** `lib/stock-reservation.ts` línea 215-218

#### Código Vulnerable:
```typescript
// BYPASS MASIVO - línea 215-218
export async function areReservationsValid(checkoutId: string): Promise<boolean> {
    try {
        // ❌ BYPASS FOR TESTING MOCKED RESERVATIONS
        if (checkoutId.startsWith('chk_')) {
            return true; // ❌ SIEMPRE RETORNA TRUE
        }
        // ...
```

#### Proof of Concept:
```javascript
// ATAQUE: Crear checkout_id falso que bypasea validación
const fakeCheckoutId = 'chk_fake_' + Date.now();

// Intentar pagar SIN crear reservas reales
const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        items: [
            {
                productId: 'expensive-mug',
                selectedVariant: { id: 'var-expensive' },
                quantity: 100 // Cantidad masiva
            }
        ],
        shippingInfo: {...},
        checkout_id: fakeCheckoutId // ❌ Bypasea validación
    })
});

// RESULTADO: Pago procesado SIN validar stock real
```

#### Impacto:
- **Bypass completo de stock validation**
- **Compra ilimitada sin stock**
- **Fraude a gran escala**
- **Pérdida financiera masiva**

#### Solución:
```typescript
// ELIMINAR el bypass completamente
export async function areReservationsValid(checkoutId: string): Promise<boolean> {
    try {
        // ❌ ELIMINAR ESTAS LÍNEAS:
        // if (checkoutId.startsWith('chk_')) {
        //     return true;
        // }
        
        const { data, error } = await supabaseAdmin
            .from('stock_reservations')
            .select('status, expires_at')
            .eq('checkout_id', checkoutId)
            .eq('status', 'pending');

        if (error || !data || data.length === 0) {
            return false;
        }

        const now = new Date();
        return data.every(res => new Date(res.expires_at) > now);
    } catch (error: any) {
        logError('Exception in areReservationsValid', { data: error });
        return false;
    }
}
```

**Prioridad:** 🚨 CRÍTICA - ELIMINAR INMEDIATAMENTE

---

### 3. **WEAK RANDOM NUMBER GENERATION - PREDICTABLE IDs** 🔴
**Severidad:** ALTO  
**CVSS Score:** 7.8  
**Archivos Afectados:** 9 archivos

#### Código Vulnerable:
```typescript
// Múltiples archivos usan Math.random() para IDs críticos:

// 1. api-utils.ts línea 255
return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// 2. checkout-utils.ts línea 59
const random = Math.random().toString(36).substring(2, 15);

// 3. create-payment-intent/route.ts línea 168
const stripeIdempotencyKey = idempotencyKey || 
    `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// 4. checkout/init/route.ts línea 82
const checkoutId = `chk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// 5. order numbers - checkout/success/page.tsx
setOrderNumber(`ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
```

#### Problema:
`Math.random()` **NO es criptográficamente seguro** y puede ser predicho por un atacante.

#### Proof of Concept - Predicción de Order Numbers:
```javascript
// ATAQUE: Predecir order numbers
function predictOrderNumbers() {
    // Math.random() usa LCG (Linear Congruential Generator)
    // que es predecible si conoces outputs anteriores
    
    const observedOrders = [
        'ORD-A7B3F',
        'ORD-C9D2E',
        'ORD-E1F4G'
    ];
    
    // Con 3-4 observaciones se puede predecir el estado interno
    // y generar todos los futuros order numbers
    const predictedOrders = lcgPredict(observedOrders);
    
    // Ahora el atacante puede:
    // 1. Acceder a órdenes antes de que se creen
    // 2. Enumerar todas las órdenes
    // 3. Predecir idempotency keys
}
```

#### Impacto:
- **Enumeración de órdenes**: Acceder a órdenes de otros usuarios
- **Bypass de idempotency**: Crear duplicados de pagos
- **Session fixation**: Predecir checkout IDs
- **Information disclosure**: Revelar número de órdenes/día

#### Solución:
```typescript
import { randomUUID, randomBytes } from 'crypto';

// 1. Para IDs únicos
const checkoutId = `chk_${randomUUID()}`;
const requestId = `req_${randomUUID()}`;

// 2. Para order numbers
const orderNumber = `ORD-${randomBytes(6).toString('base64url')}`;

// 3. Para idempotency keys
const idempotencyKey = `pi_${randomUUID()}`;

// 4. Para file uploads
const fileName = `${randomUUID()}.${fileExt}`;
```

**Prioridad:** 🔥 ALTA

---

### 4. **HASH FUNCTION COLLISION EN IDEMPOTENCY** 🟠
**Severidad:** MEDIO-ALTO  
**CVSS Score:** 6.5  
**Archivo:** `lib/idempotency-middleware.ts` línea 126-134

#### Código Vulnerable:
```typescript
function hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
}
```

#### Problema:
Este hash es **extremadamente débil** y susceptible a colisiones. Similar al antiguo hash de Java.

#### Proof of Concept - Colisión:
```javascript
// ATAQUE: Generar colisiones de hash
function findCollisions() {
    const hashes = new Map();
    let collisions = 0;
    
    for (let i = 0; i < 1000000; i++) {
        const randomString = Math.random().toString();
        const hash = weakHash(randomString);
        
        if (hashes.has(hash)) {
            console.log('COLLISION!');
            console.log('String 1:', hashes.get(hash));
            console.log('String 2:', randomString);
            collisions++;
        }
        
        hashes.set(hash, randomString);
    }
    
    return collisions; // Típicamente 100-200 colisiones en 1M
}

// RESULTADO: Múltiples strings diferentes generan mismo hash
// Permite bypass de idempotency
```

#### Impacto:
- **Bypass de idempotency**: Múltiples requests con diferente data pero mismo hash
- **Duplicate charges**: Dos pagos diferentes tratados como duplicados
- **Cache poisoning**: Respuesta incorrecta retornada

#### Solución:
```typescript
import { createHash } from 'crypto';

function hashString(str: string): string {
    return createHash('sha256')
        .update(str)
        .digest('base64url')
        .substring(0, 32); // Primeros 32 chars
}

// Aún mejor: usar todo el hash
function generateIdempotencyKey(userId: string, data: any): string {
    const dataString = JSON.stringify(data);
    const hash = createHash('sha256')
        .update(`${userId}:${dataString}:${Date.now()}`)
        .digest('base64url');
    
    return `idem_${hash}`;
}
```

**Prioridad:** 🟡 MEDIA-ALTA

---

### 5. **TIMING ATTACK EN EMAIL VERIFICATION** 🟠
**Severidad:** MEDIO  
**CVSS Score:** 5.8  
**Archivo:** `app/api/track-order/route.ts` línea 76-82

#### Código Vulnerable:
```typescript
// Validar email match - línea 76-82
if (order.customer_email.toLowerCase() !== normalizedEmail) {
    return NextResponse.json(
        { error: 'Order not found or email does not match.' },
        { status: 404 }
    );
}
```

#### Problema:
La comparación de strings revela información mediante **timing differences**.

#### Proof of Concept:
```javascript
// ATAQUE: User Enumeration via Timing Attack
async function timingAttack(orderNumber) {
    const attempts = [
        'a@test.com',
        'ab@test.com',
        'abc@test.com',
        'admin@mugmagic.com',
        // ...
    ];
    
    const timings = [];
    
    for (const email of attempts) {
        const start = performance.now();
        
        await fetch('/api/track-order', {
            method: 'POST',
            body: JSON.stringify({ orderNumber, email })
        });
        
        const end = performance.now();
        timings.push({ email, time: end - start });
    }
    
    // El email con mayor tiempo probablemente tenga más caracteres correctos
    timings.sort((a, b) => b.time - a.time);
    
    return timings[0].email; // Email más probable
}
```

#### Impacto:
- **User enumeration**: Revelar emails válidos
- **Information disclosure**: Confirmar existencia de órdenes
- **Targeted attacks**: Facilitar phishing

#### Solución:
```typescript
import { timingSafeEqual } from 'crypto';

// Usar comparación constant-time
if (order.customer_email.toLowerCase() !== normalizedEmail) {
    // Agregar delay random para prevenir timing attacks
    await new Promise(resolve => 
        setTimeout(resolve, Math.random() * 100 + 50)
    );
    
    return NextResponse.json(
        { error: 'Order not found or email does not match.' },
        { status: 404 }
    );
}

// O mejor aún, usar crypto.timingSafeEqual con buffers
const emailBuffer1 = Buffer.from(order.customer_email.toLowerCase());
const emailBuffer2 = Buffer.from(normalizedEmail);

if (emailBuffer1.length !== emailBuffer2.length || 
    !timingSafeEqual(emailBuffer1, emailBuffer2)) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
}
```

**Prioridad:** 🟡 MEDIA

---

## 🟡 **VULNERABILIDADES MEDIAS**

### 6. **INFORMACIÓN SENSIBLE EN LOGS** 🟡
**Severidad:** MEDIO  
**CVSS Score:** 5.3

#### Código Vulnerable:
```typescript
// Múltiples archivos logean datos sensibles:

// stock-reservation.ts línea 36-38
logInfo('Creating stock reservation', {
    data: { variantId, quantity, checkoutId, ttlMinutes }
});

// create-payment-intent/route.ts línea 115-117
logInfo('Payment intent creation started', {
    data: { itemCount: items.length, checkoutId: checkout_id, ip }
});
```

#### Problema:
Los logs incluyen:
- IPs de usuarios
- Checkout IDs (pueden revelar patrones)
- Detalles de compras
- Información de stock

#### Impacto:
- **Privacy violation**: GDPR concerns
- **Information disclosure**: Logs accesibles revelan datos
- **Pattern analysis**: Atacantes pueden identificar compras de alto valor

#### Solución:
```typescript
// Sanitizar logs en producción
logInfo('Creating stock reservation', {
    data: { 
        variantId: process.env.NODE_ENV === 'production' ? '[REDACTED]' : variantId,
        quantity,
        checkoutId: checkoutId.substring(0, 8) + '...',
        ttlMinutes 
    }
});

// O usar niveles de log diferentes
if (process.env.NODE_ENV === 'development') {
    logDebug('Full reservation data', { data: { variantId, quantity, checkoutId }});
}
logInfo('Reservation created');
```

**Prioridad:** 🟡 MEDIA

---

### 7. **FALTA DE WEBHOOK SIGNATURE VERIFICATION** 🟡🟡
**Severidad:** MEDIO-ALTO  
**CVSS Score:** 6.8

#### Problema:
No encontré implementación de webhook de Stripe en el código. Si existe, debe verificarse la firma.

#### Código que DEBERÍA existir:
```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
    const body = await req.text();
    const sig = headers().get('stripe-signature');

    if (!sig) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
        // ✅ CRÍTICO: Verificar firma
        event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Procesar evento...
}
```

#### Impacto sin verificación:
- **Fake payment confirmations**: Atacante puede enviar webhooks falsos
- **Free products**: Confirmar órdenes sin pagar
- **Business logic bypass**: Completar checkout sin Stripe

**Prioridad:** 🔥 ALTA (si webhooks existen)

---

### 8. **DENIAL OF SERVICE - RESERVATION FLOOD** 🟡
**Severidad:** MEDIO  
**CVSS Score:** 5.5

#### Vector de Ataque:
```javascript
// ATAQUE: Crear millones de reservas que expiran
async function dosAttack() {
    for (let i = 0; i < 10000; i++) {
        await fetch('/api/checkout/init', {
            method: 'POST',
            body: JSON.stringify({
                items: [{ variant_id: 'any-variant', quantity: 1 }]
            })
        });
        
        // No completar el pago - dejar que expiren
    }
    
    // RESULTADO:
    // - Base de datos saturada con reservas expiradas
    // - Cleanup job sobrecargado
    // - Stock bloqueado innecesariamente
}
```

#### Impacto:
- **Database bloat**: Tabla stock_reservations crece exponencialmente
- **Performance degradation**: Queries lentas
- **Legitimate users blocked**: Stock artificialmente agotado

#### Solución:
```typescript
// 1. Rate limiting más agresivo para checkout/init
const checkCheckoutRateLimit = (ip: string) => {
    const maxAttempts = 5; // Reducir de 10 a 5
    const windowMs = 60000; // 1 minuto
    // ...
};

// 2. Límite por usuario
const checkUserReservationLimit = async (userId: string) => {
    const { count } = await supabaseAdmin
        .from('stock_reservations')
        .select('id', { count: 'exact' })
        .eq('user_id', userId)
        .eq('status', 'pending');
    
    if (count > 10) {
        throw new Error('Too many pending reservations');
    }
};

// 3. Background job más frecuente
// Ejecutar cleanup cada 2 minutos en lugar de 5
```

**Prioridad:** 🟡 MEDIA

---

## 🔷 **MEJORAS RECOMENDADAS**

### 9. **IMPLEMENTAR CAPTCHA EN ENDPOINTS SENSIBLES**

```typescript
// checkout/init/route.ts
import { verifyCaptcha } from '@/lib/captcha';

export async function POST(req: Request) {
    const body = await req.json();
    
    // Verificar captcha
    const captchaValid = await verifyCaptcha(body.captchaToken);
    if (!captchaValid) {
        return errorResponse('Invalid CAPTCHA', 400);
    }
    
    // Continuar con checkout...
}
```

### 10. **IMPLEMENTAR CSP HEADERS**

```typescript
// next.config.ts
const securityHeaders = [
    {
        key: 'Content-Security-Policy',
        value: `
            default-src 'self';
            script-src 'self' 'unsafe-eval' 'unsafe-inline' *.stripe.com;
            style-src 'self' 'unsafe-inline';
            img-src 'self' blob: data: *.supabase.co;
            font-src 'self';
            connect-src 'self' *.supabase.co *.stripe.com;
            frame-src *.stripe.com;
        `.replace(/\s{2,}/g, ' ').trim()
    }
];
```

### 11. **IMPLEMENTAR ANOMALY DETECTION**

```typescript
// Detectar patrones sospechosos
async function detectAnomalies(userId: string) {
    // 1. Múltiples reservas canceladas
    const cancelledReservations = await getCancelledCount(userId, '24h');
    if (cancelledReservations > 10) {
        await flagSuspiciousActivity(userId, 'excessive_cancellations');
    }
    
    // 2. Checkout desde múltiples IPs
    const uniqueIPs = await getUniqueIPs(userId, '1h');
    if (uniqueIPs.length > 3) {
        await flagSuspiciousActivity(userId, 'multiple_ips');
    }
    
    // 3. Compras de alto valor repentinas
    const avgOrderValue = await getAvgOrderValue(userId);
    const currentOrderValue = getCurrentCart(userId);
    if (currentOrderValue > avgOrderValue * 10) {
        await requireAdditionalVerification(userId);
    }
}
```

---

## 📊 **MATRIZ DE RIESGO ACTUALIZADA**

| # | Vulnerabilidad | Severidad | Exploitabilidad | Impacto Financiero | Prioridad |
|---|----------------|-----------|-----------------|-------------------|-----------|
| 1 | Race Condition Stock | 🔴 CRÍTICO | Muy Alta | Muy Alto ($$$$) | P0 |
| 2 | Bypass Reservations | 🔴 CRÍTICO | Alta | Muy Alto ($$$$) | P0 |
| 3 | Weak Random - IDs | 🟠 ALTO | Media | Alto ($$$) | P1 |
| 4 | Hash Collisions | 🟠 MEDIO-ALTO | Media | Medio ($$) | P1 |
| 5 | Timing Attack | 🟡 MEDIO | Baja-Media | Bajo ($) | P2 |
| 6 | Logs Sensibles | 🟡 MEDIO | Baja | Bajo ($) | P2 |
| 7 | Webhook Signature | 🟠 ALTO | Alta (si existe) | Muy Alto ($$$$) | P0 |
| 8 | DoS Reservations | 🟡 MEDIO | Media | Medio ($$) | P2 |

---

## 🎯 **PLAN DE REMEDIACIÓN URGENTE**

### Fase CRÍTICA (HOY - No Esperar)
1. ✅ **ELIMINAR** bypass de reservations (línea 215-218)
2. ✅ **IMPLEMENTAR** transacciones atómicas en bulk reservations
3. ✅ **VERIFICAR** si existe webhook de Stripe y añadir signature verification
4. ✅ **REEMPLAZAR** Math.random() con crypto.randomUUID() en IDs críticos

### Fase ALTA (Esta Semana)
5. ✅ Implementar hash criptográfico en idempotency
6. ✅ Agregar rate limiting más agresivo en checkout
7. ✅ Implementar cleanup job más frecuente
8. ✅ Añadir monitoreo de anomalías

### Fase MEDIA (Próximas 2 Semanas)
9. ✅ Implementar timing-safe comparisons
10. ✅ Sanitizar logs en producción
11. ✅ Agregar CAPTCHA en checkout
12. ✅ Implementar CSP headers

---

## 💀 **ESCENARIOS DE ATAQUE COMBINADOS**

### Ataque 1: "The Perfect Storm"
```
1. Atacante identifica producto de edición limitada (1 unidad)
2. Usa bypass de reservations (chk_fake_id)
3. Ejecuta race condition con 10 requests simultáneas
4. Todas pasan validación debido al bypass
5. 10 órdenes creadas con stock de 1
6. Compañía pierde dinero en refunds y envíos
7. Daño reputacional masivo
```

**Probabilidad:** Alta  
**Impacto:** Catastrófico  

### Ataque 2: "Order Enumeration Chain"
```
1. Atacante observa 3-4 order numbers
2. Reverse-engineer el generador Math.random()
3. Predice todos los futuros order numbers
4. Usa timing attack para confirmar emails
5. Accede a órdenes antes de que lleguen
6. Intercepta envíos o roba información
```

**Probabilidad:** Media  
**Impacto:** Alto  

---

## 🔥 **CONCLUSIÓN**

### Score de Seguridad Actualizado:
- **Auditoría Básica:** 8.5/10
- **Auditoría Avanzada:** **6.2/10** ⚠️

### Hallazgos:
- **2 Vulnerabilidades CRÍTICAS** que pueden causar pérdida financiera directa
- **3 Vulnerabilidades ALTAS** que facilitan fraude
- **3 Vulnerabilidades MEDIAS** que comprometen privacidad

### Recomendación Final:
**⚠️ NO DEPLOYAR EN PRODUCCIÓN** hasta corregir las vulnerabilidades críticas P0.

El sistema tiene defensas básicas sólidas pero es vulnerable a **ataques avanzados** que explotan:
- Condiciones de carrera
- Generadores de números débiles
- Bypasses de testing en producción
- Falta de atomicidad en transacciones

---

**Próximo Paso:** Implementar correcciones P0 y repetir auditoría.

**Auditor:** Offensive Security Team  
**Fecha:** 2026-01-05 21:46 CET  
**Criticidad:** 🔴 ALTA
