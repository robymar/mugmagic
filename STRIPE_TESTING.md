# 💳 Stripe Payment Integration - MugMagic

## ✅ Implementación Completada

### Endpoints Creados:
1. **`/api/create-payment-intent`** - Crea el Payment Intent de Stripe
2. **`/api/stripe/webhooks`** - Procesa eventos de Stripe (pagos exitosos/fallidos)

### Páginas:
- **`/checkout`** - Formulario de pago con Stripe Elements
- **`/checkout/success`** - Página de confirmación con confetti 🎉

---

## 🧪 Cómo Probar Pagos (Modo Test)

### 1. **Asegúrate de tener las claves en `.env.local`:**
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. **Inicia el servidor:**
```bash
npm run dev
```

### 3. **Flujo de prueba:**
1. Navega a `http://localhost:3000/products`
2. Click en "Customize" en una taza
3. Añade texto/imágenes al diseño
4. Click "Add to Cart"
5. En el carrito, click "Proceed to Checkout"
6. Usa las **tarjetas de prueba de Stripe**:
   - **Éxito:** `4242 4242 4242 4242`
   - **Fallo:** `4000 0000 0000 0002`
   - **Requiere autenticación:** `4000 0025 0000 3155`
   - Fecha: Cualquier fecha futura
   - CVC: Cualquier 3 dígitos
   - Código postal: Cualquier 5 dígitos

7. Completa el pago
8. Verás la página de éxito con confetti

---

## 🔔 Webhooks en Desarrollo Local

Para que los webhooks funcionen localmente:

### Opción A: Stripe CLI (Recomendado)
```bash
# Instalar (si no lo has hecho)
winget install stripe.stripe-cli

# Autenticar
stripe login

# Iniciar listener
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

Esto te dará un webhook secret que empieza con `whsec_...`. Úsalo en tu `.env.local`.

### Opción B: Sin Webhooks
Si no configuras webhooks, el pago funcionará pero no recibirás confirmaciones en el servidor. Suficiente para testing básico.

---

## 📊 Estados del Pago

- **pending** - Pago iniciado
- **succeeded** - Pago exitoso ✓
- **failed** - Pago fallido ✗

Los webhooks registran estos eventos en la consola del servidor.

---

## 🚀 Próximos Pasos (Opcional)

1. **Guardar pedidos en Supabase** cuando el pago tenga éxito
2. **Enviar emails de confirmación** (usando Resend o SendGrid)
3. **Panel de administración** para ver pedidos
4. **Exportar diseños a 300 DPI** antes de guardar el pedido

---

## 🔐 Producción

Antes de deployment:
1. Cambia las claves de Stripe de `pk_test_...` a `pk_live_...`
2. Configura webhooks en el dashboard de Stripe con tu URL de producción
3. Verifica que `STRIPE_WEBHOOK_SECRET` sea el de producción
