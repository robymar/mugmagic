# 🧪 GUÍA DE PRUEBA MANUAL - STRIPE CHECKOUT

## ✅ Verificación Previa Completada

El endpoint `/api/products/mug-11oz-white` está **funcionando correctamente** ✓

---

## 📋 **PASOS PARA PROBAR MANUALMENTE**

### ⚙️ Preparación

1. **Servidor**: Ya está corriendo en http://localhost:3000 ✅
2. **Claves Stripe**: Ya configuradas en `.env.local` ✅
3. **Base de datos**: Productos y variants poblados ✅

---

### 🎯 **TEST 1: Verificar Producto en el Editor**

1. **Abre tu navegador** (Chrome, Firefox, Edge)
2. **Ve a**: http://localhost:3000/products
3. **Busca**: "Classic White Mug 11oz"
4. **Click en**: Botón azul "Customize"
5. **Espera**: 3-5 segundos para que cargue el editor 3D

**✅ Resultado esperado**: 
- Editor 3D con taza blanca
- Panel lateral con herramientas (Text, Stickers, Upload)
- Botón "Add to Bag" visible

**❌ Si algo falla**: 
- Abre DevTools (F12) → pestaña Console
- Busca errores en rojo
- Toma screenshot y compártelo

---

### 🎯 **TEST 2: Añadir al Carrito**

1. **En el editor**, opcionalmente añade texto o stickers
2. **Click en**: Botón "Add to Bag" (ícono de bolsa)
3. **Observa**: Animación de confetti 🎉
4. **Verifica**: Mensaje "It's in the bag!"

**✅ Resultado esperado**:
- Drawer del carrito se abre automáticamente
- Producto visible con imagen preview
- Contador del carrito actualizado (1)
- Subtotal mostrando €12.99

**📸 CHECKPOINT**: Toma screenshot del carrito abierto

---

### 🎯 **TEST 3: Ir al Checkout**

1. **En el drawer del carrito**, busca el botón "Proceed to Checkout"
2. **Click en**: "Proceed to Checkout"
3. **Espera**: Página de checkout carga

**✅ Resultado esperado**:
- URL cambia a: http://localhost:3000/checkout
- Formulario de envío visible
- Progress bar mostrando: "Shipping" activo, "Payment" inactivo
- Sidebar derecho con resumen del pedido

---

### 🎯 **TEST 4: Llenar Formulario de Envío**

Completa **TODOS** los campos:

```
✏️ First Name: Test
✏️ Last Name: User
✏️ Email: test@example.com
✏️ Phone: 123456789
✏️ Address: 123 Test Street
✏️ City: Madrid
✏️ Postal Code: 28001
✏️ Country: Spain (selecciona del dropdown)
```

**Shipping Method**: Deja "Standard Shipping" seleccionado

**✅ Resultado esperado**:
- Todos los campos aceptan el texto
- No hay mensajes de error en rojo
- Botón "Continue to Payment" está habilitado (azul brillante)

---

### 🎯 **TEST 5: Proceder al Pago** ⚡ CRÍTICO

1. **Click en**: Botón azul "Continue to Payment"
2. **Observa**: 
   - Mensaje de loading "Reserving your items..."
   - Espera 5-10 segundos

**🔍 MONITOREO EN TIEMPO REAL**:

Abre **DevTools** (F12):
- **Pestaña Console**: busca mensajes
- **Pestaña Network**: busca peticiones a:
  - `/api/products/mug-11oz-white` (debería ser 200 OK)
  - `/api/checkout/init` (debería ser 200 OK o 201 Created)
  - `/api/create-payment-intent` (debería ser 200 OK)

**✅ RESULTADO ESPERADO**:

1. **Toast de confirmación**: "Items reserved for 15 minutes! ⏱️"
2. **Progress bar actualizado**: "Shipping" con ✓, "Payment" activo
3. **Formulario de Stripe aparece** con:
   - Banner azul: "Secure Payment: Transactions are encrypted..."
   - Campo de tarjeta (Stripe Elements)
   - Botones "Back" y "Pay €XX.XX"

**📸 CHECKPOINT CRÍTICO**: 
- Toma screenshot si aparece el formulario de Stripe
- Toma screenshot de la pestaña Network si hay error

**❌ SI HAY ERROR**:

Revisa la pestaña **Console** y busca:
- ❌ **Error 405**: El endpoint GET no funciona → reportar
- ❌ **Error 400**: Problema con variant_id → reportar  
- ❌ **Error 500**: Error del servidor → reportar
- ❌ **"Failed to fetch"**: Problema de red → verificar servidor

---

### 🎯 **TEST 6: Completar Pago con Stripe** 💳

**SOLO si llegaste al formulario de Stripe:**

1. **En el campo de tarjeta**, escribe:
   ```
   Número: 4242 4242 4242 4242
   ```
   (Stripe lo formateará automáticamente)

2. **Fecha de expiración**:
   ```
   12/34
   ```

3. **CVC**:
   ```
   123
   ```

4. **Código Postal** (en el formulario de tarjeta):
   ```
   12345
   ```

5. **Click en**: "Pay €XX.XX"

6. **Espera**: 5-15 segundos mientras procesa

**✅ RESULTADO ESPERADO**:

- **Redirección a**: http://localhost:3000/checkout/success
- **Página de confirmación** con:
  - ✅ Mensaje de éxito
  - 📝 Número de orden
  - 📧 Email de confirmación mencionado
  - 🎉 Posible animación/confetti

**📸 CHECKPOINT FINAL**: Toma screenshot de la página de éxito

---

### 🎯 **TEST 7: Verificar en Stripe Dashboard**

1. **Abre**: https://dashboard.stripe.com/test/payments
2. **Inicia sesión** (si es necesario)
3. **Busca**: Tu pago más reciente
4. **Verifica**:
   - Estado: "Succeeded" ✅
   - Monto: €12.99 (o el total correcto)
   - Metadata incluye checkout_id

**📸 CHECKPOINT**: Toma screenshot del pago en Stripe

---

## 📊 **CHECKLIST DE RESULTADOS**

Marca con ✅ o ❌ cada paso:

- [ ] Editor carga correctamente
- [ ] Producto se añade al carrito
- [ ] Checkout page carga
- [ ] Formulario de envío acepta datos
- [ ] **"Continue to Payment" funciona** ⚡
- [ ] **Formulario de Stripe aparece** ⚡
- [ ] Tarjeta de prueba se acepta
- [ ] Pago se procesa exitosamente
- [ ] Redirección a página de éxito
- [ ] Pago visible en Stripe Dashboard

---

## 🐛 **REPORTE DE PROBLEMAS**

Si algo falla, proporciona:

1. **En qué paso** falló
2. **Screenshot** de la pantalla
3. **Screenshot** de DevTools Console (F12)
4. **Screenshot** de DevTools Network (peticiones en rojo)
5. **Mensaje de error** exacto (copia/pega)

---

## 💡 **TIPS**

- **F12**: Abre DevTools
- **Ctrl+Shift+R**: Recarga sin caché
- **Ctrl+0**: Reset zoom del navegador
- Si algo no funciona, recarga la página y vuelve a intentar
- El timer de reserva es de 15 minutos

---

## ✅ **SI TODO FUNCIONA**

¡Felicitaciones! 🎉 La integración de Stripe está **completamente operativa**.

Próximos pasos opcionales:
- Probar otras tarjetas de test
- Probar con diferentes productos
- Configurar webhooks para producción
- Personalizar página de éxito

---

**¡Adelante con las pruebas!** 🚀
