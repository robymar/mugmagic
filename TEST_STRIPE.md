# 🧪 GUÍA RÁPIDA: Probar Pago Stripe

## ✅ **Fix Aplicado**
- El parámetro `shippingMethod` ahora se envía como `shippingMethodId` ✅
- El backend y frontend ahora están sincronizados ✅

## 🎯 **INSTRUCCIONES DE PRUEBA**

### Paso 1: Verifica tus claves en `.env.local`
Las claves ya están configuradas según dijiste. Si tienes algún problema, verifica que empiecen así:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

### Paso 2: El servidor ya está corriendo
Tu servidor está activo en http://localhost:3000 desde hace 40 minutos.

**IMPORTANTE**: Los cambios de código se recargan automáticamente con Next.js, pero si tienes problemas, reinicia manualmente:
```bash
# En la terminal donde corre npm run dev, presiona Ctrl+C
# Luego ejecuta de nuevo:
npm run dev
```

### Paso 3: Realiza una Compra de Prueba

1. **Abre tu navegador** en http://localhost:3000
2. **Selecciona un producto** (ej: Classic White Mug)  
3. **Personalízalo** en el editor (opcional)
4. **Añade al carrito**
5. **Ve al checkout** (click en el icono del carrito → "Proceed to Checkout")
6. **Formulario de envío:**
   - First Name: Test
   - Last Name: User
   - Email: test@example.com
   - Phone: 123456789
   - Address: 123 Test Street
   - City: Madrid
   - Postal Code: 28001
   - Country: Spain

7. **Click en "Continue to Payment"** ← Aquí es donde fallaba antes

8. **Deberías ver ahora:**
   - ✅ El paso "Payment" activarse
   - ✅ Formulario de Stripe Elements aparecer
   - ✅ Campos para tarjeta de crédito

9. **Ingresa la tarjeta de prueba de Stripe:**
   ```
   Número: 4242 4242 4242 4242
   MM/YY: 12/34
   CVC: 123
   Código Postal: 12345
   ```

10. **Click en "Pay €XX.XX"**

11. **Resultado esperado:**
    - ✅ Redirección a `/checkout/success`
    - ✅ Mensaje de confirmación del pedido
    - ✅ Número de orden generado

### Paso 4: Verifica en Stripe Dashboard

1. Ve a https://dashboard.stripe.com/test/payments
2. Deberías ver tu pago listado
3. Click en él para ver los detalles completos

---

## 🐛 **Si Algo Sale Mal**

### Error: "Failed to create payment intent"
- Abre la consola del navegador (F12)
- Ve a la pestaña "Network"
- Busca la petición a `/api/create-payment-intent`
- Revisa el error en "Response"

### Error: "Stripe has not been configured"
- Verifica que las claves estén en `.env.local`
- Reinicia el servidor

### Error: "Reservations expired"
- Esto pasa si tardas más de 15 minutos
- Simplemente vuelve a añadir los productos al carrito

---

## 🎨 **Lo Que Deberías Ver**

Al completar el pago exitosamente:
1. Página de confirmación con tu número de orden
2. Mensaje de éxito
3. El carrito en la app se vaciará
4. En Stripe Dashboard: pago registrado como "Succeeded"

---

## 📋 **RESUMEN**

- ✅ **Backend**: Endpoint funcionando
- ✅ **Frontend**: Parámetro corregido
- ✅ **Stripe**: Cliente inicializado
- ✅ **Claves**: Configuradas (según indicaste)
- ⏳ **Siguiente**: Probar el flujo completo

**¿Listo para probar?** 🚀
