# 🔐 Plan de Tests de Seguridad - MugMagic

**Fecha:** 2026-01-05 21:16  
**Estado:** ⏳ ESPERANDO BUILD

---

## 📋 Tests de Seguridad Planificados

### 1. **Tests de Sanitización XSS**
- [ ] Test básico: `<script>alert('xss')</script>`
- [ ] Test con eventos: `<img src=x onerror=alert('xss')>`
- [ ] Test con SVG: `<svg onload=alert('xss')>`
- [ ] Test con javascript: URI
- [ ] Test con data: URI
- [ ] Test con event handlers

### 2. **Tests de Autenticación**
- [ ] Acceso a /api/admin/seed sin auth
- [ ] Acceso a /api/admin/seed con user normal
- [ ] Acceso a /api/admin/seed con admin
- [ ] Verificación de rol desde profiles

### 3. **Tests de Validación de Stock**
- [ ] Intentar comprar más stock del disponible
- [ ] Verificar mensaje de error
- [ ] Validar que no se crea reserva

### 4. **Tests de Manipulación de Precios**
- [ ] Enviar variant_id de producto barato con productId caro
- [ ] Verificar rechazo de transacción
- [ ] Validar mensaje de error de seguridad

### 5. **Tests de Rate Limiting**
- [ ] Exceder límite en /api/auth/login
- [ ] Exceder límite en /api/track-order
- [ ] Verificar header Retry-After

### 6. **Tests de Validación de Inputs**
- [ ] Cantidades negativas
- [ ] Cantidades > 99
- [ ] Emails inválidos
- [ ] Order numbers con caracteres especiales

---

## 🎯 Criterios de Éxito

- ✅ Todos los ataques XSS bloqueados
- ✅ Acceso admin correctamente restringido
- ✅ Stock validation funcionando
- ✅ Price manipulation bloqueada
- ✅ Rate limiting activo
- ✅ Validaciones de input funcionando

---

**Estado:** Esperando compilación...
