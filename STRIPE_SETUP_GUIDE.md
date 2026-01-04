# 🔐 Guía de Configuración de Stripe para MugMagic

Esta guía te ayudará a configurar Stripe para procesar pagos de prueba en tu tienda MugMagic.

## 📋 Paso 1: Crear Cuenta de Stripe (si no la tienes)

1. Ve a **https://stripe.com**
2. Haz clic en **"Sign up"** o **"Start now"**
3. Completa el registro con tu email
4. **IMPORTANTE**: Activa el **modo de prueba** (Test Mode) - verás un switch en el dashboard

## 🔑 Paso 2: Obtener las Claves de API (Test Mode)

### 2.1 Navega al Dashboard de API Keys

1. Ve a **https://dashboard.stripe.com/test/apikeys**
2. O desde el dashboard: Click en **"Developers"** → **"API Keys"**
3. **Asegúrate** de estar en **modo TEST** (verás "Viewing test data" en la esquina superior derecha)

### 2.2 Copia las Claves

Verás dos tipos de claves:

#### **Publishable Key** (Clave Pública)
- Comienza con `pk_test_...`
- Es segura para compartir en el frontend
- Click en "Reveal test key" si está oculta
- **Copia esta clave completa**

#### **Secret Key** (Clave Secreta)
- Comienza con `sk_test_...`
- NUNCA la compartas públicamente
- Click en "Reveal test key" si está oculta
- **Copia esta clave completa**

## ✏️ Paso 3: Añadir las Claves a tu .env.local

1. Abre el archivo `.env.local` en tu proyecto
2. Encuentra las líneas de Stripe:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
   STRIPE_SECRET_KEY=sk_test_your_key_here
   ```
3. **Reemplaza** `pk_test_your_key_here` con tu clave pública
4. **Reemplaza** `sk_test_your_key_here` con tu clave secreta
5. **Guarda el archivo**

### Ejemplo de cómo debería verse:
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9
STRIPE_SECRET_KEY=sk_test_51a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

## 🔄 Paso 4: Reiniciar el Servidor de Desarrollo

**IMPORTANTE**: Debes reiniciar el servidor para que cargue las nuevas variables de entorno.

1. Ve a la terminal donde está corriendo `npm run dev`
2. Presiona `Ctrl + C` para detener el servidor
3. Ejecuta de nuevo: `npm run dev`
4. Espera a que el servidor inicie

## 🧪 Paso 5: Probar el Pago con Tarjetas de Prueba

Stripe proporciona tarjetas de prueba que puedes usar:

### ✅ Tarjeta que FUNCIONA (Pago Exitoso)
```
Número: 4242 4242 4242 4242
Fecha: Cualquier fecha futura (ej: 12/34)
CVC: Cualquier 3 dígitos (ej: 123)
Código Postal: Cualquier 5 dígitos (ej: 12345)
```

### ❌ Tarjeta que FALLA (Pago Rechazado)
```
Número: 4000 0000 0000 0002
Fecha: Cualquier fecha futura
CVC: Cualquier 3 dígitos
```

### 🔐 Tarjeta que Requiere Autenticación 3D Secure
```
Número: 4000 0025 0000 3155
Fecha: Cualquier fecha futura
CVC: Cualquier 3 dígitos
```

## 🧪 Paso 6: Probar el Checkout Completo

1. **Abre tu tienda**: http://localhost:3000
2. **Personaliza una taza** en el editor
3. **Añade al carrito**
4. **Ve al checkout**
5. **Completa los datos de envío**
6. **En la sección de pago**, usa la tarjeta de prueba:
   - Número: `4242 4242 4242 4242`
   - Fecha: `12/34`
   - CVC: `123`
7. **Click en "Place Order"** o "Complete Payment"
8. Deberías ver una confirmación de pago exitoso ✅

## 📊 Paso 7: Verificar el Pago en Stripe Dashboard

1. Ve a **https://dashboard.stripe.com/test/payments**
2. Deberías ver tu pago de prueba listado allí
3. Click en el pago para ver los detalles completos

## ⚠️ Webhook Secret (Opcional - Solo para Producción)

El `STRIPE_WEBHOOK_SECRET` es necesario para validar webhooks en producción. 

Para testing local NO es necesario, pero si quieres configurarlo:

1. Ve a **https://dashboard.stripe.com/test/webhooks**
2. Click en **"Add endpoint"**
3. URL del endpoint: `http://localhost:3000/api/webhooks/stripe`
4. Selecciona eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copia el **Signing Secret** que comienza con `whsec_...`
6. Añádelo a `.env.local` como `STRIPE_WEBHOOK_SECRET`

**NOTA**: Para webhooks locales, necesitarás usar Stripe CLI o ngrok para exponer tu localhost.

## 🚀 ¡Listo!

Ahora tu tienda MugMagic debería poder procesar pagos de prueba con Stripe.

## 🔍 Troubleshooting

### "Invalid API Key provided"
- Verifica que copiaste las claves correctamente (sin espacios extra)
- Asegúrate de estar usando claves de **TEST** (empiezan con `pk_test_` y `sk_test_`)
- Reinicia el servidor después de cambiar las claves

### "No such customer" o errores de Stripe
- Revisa la consola del navegador (F12)
- Revisa los logs del servidor en la terminal
- Ve al Log de errores en Stripe Dashboard

### El botón de pago no aparece
- Verifica que `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` esté configurada
- Abre la consola del navegador para ver errores de JavaScript
- Reinicia el servidor

## 📚 Recursos Adicionales

- **Stripe Test Cards**: https://stripe.com/docs/testing
- **Stripe API Docs**: https://stripe.com/docs/api
- **Stripe Dashboard**: https://dashboard.stripe.com/test

---

**¿Necesitas ayuda?** Revisa los logs de la aplicación o pídeme ayuda específica.
