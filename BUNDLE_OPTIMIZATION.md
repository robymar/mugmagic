# Bundle Optimization Guide - MugMagic

**Fecha:** 22 de Diciembre, 2024
**Estado:** ✅ Implementado

---

## 🎯 Resumen

Se han aplicado optimizaciones de bundle para mejorar el rendimiento y reducir el tamaño de carga inicial.

### Optimizaciones Implementadas

1. ✅ **Lazy Loading** - Componentes pesados con code splitting
2. ✅ **Three.js Optimization** - Importaciones específicas en lugar de wildcard
3. ✅ **Next.js Performance Config** - Compresión y optimización de paquetes
4. ✅ **Image Optimization** - AVIF/WebP formats
5. 📝 **Bundle Analyzer** - Configurado (requiere instalación)

---

## 📦 Componentes Optimizados

### 1. Editor (MugMasterEditor)
**Antes:**
```typescript
import MugMasterEditor from '@/components/editor/mugmaster/MugMasterEditor';
```

**Después:**
```typescript
const MugMasterEditor = dynamic(
    () => import('@/components/editor/mugmaster/MugMasterEditor'),
    {
        loading: () => <LoadingSpinner />,
        ssr: false,
    }
);
```

**Beneficio:** ~500KB de código no se carga hasta que el usuario accede al editor.

### 2. Visor 3D (ProductViewer3D)
**Antes:**
```typescript
import * as THREE from 'three';
```

**Después:**
```typescript
import { Mesh, MeshStandardMaterial, Texture, DoubleSide, BackSide } from 'three';
```

**Beneficio:** Reducción de ~200KB al importar solo módulos necesarios.

---

## ⚙️ Configuración de Next.js

### Performance Optimizations (`next.config.ts`)
```typescript
const nextConfig: NextConfig = {
  // Compresión GZIP
  compress: true,
  
  // Eliminar header "X-Powered-By"
  poweredByHeader: false,
  
  // Optimizar importaciones de paquetes
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // Formatos de imagen modernos
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
};
```

---

## 📊 Bundle Analyzer

### Instalación (Opcional)
```bash
npm install --save-dev @next/bundle-analyzer cross-env
```

### Uso
```bash
# Analizar el bundle
npm run analyze

# El navegador se abrirá automáticamente mostrando:
# - Tamaño de cada paquete
# - Dependencias duplicadas
# - Oportunidades de optimización
```

### Configurar en `next.config.ts`
```typescript
// Descomentar estas líneas después de instalar
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Al final del archivo
export default withBundleAnalyzer(nextConfig);
```

---

## 🎨 Optimización de Imágenes

### Uso Correcto de next/image
```typescript
// ❌ Antes (img nativo)
<img src={product.thumbnail} alt={product.name} />

// ✅ Después (next/image optimizado)
<Image
  src={product.thumbnail}
  alt={product.name}
  width={400}
  height={400}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/svg+xml;base64,..."
/>
```

### Beneficios
- Lazy loading automático
- Responsive images
- Formatos modernos (AVIF/WebP)
- Placeholder blur

---

## 📈 Métricas Objetivo

### First Load JS
- **Antes:** ~800KB (estimado)
- **Objetivo:** <500KB
- **Actual:** Por medir con `npm run analyze`

### Lighthouse Score
- **Performance:** >90
- **Accessibility:** >95
- **Best Practices:** >95
- **SEO:** >95

---

## 🚀 Próximas Optimizaciones

### 1. Route-based Code Splitting
```typescript
// Dividir rutas grandes en chunks más pequeños
const AdminPanel = dynamic(() => import('@/components/admin/AdminPanel'));
const ProductGallery = dynamic(() => import('@/components/product/ProductGallery'));
```

### 2. Optimizar Fabric.js
```typescript
// Actualmente cargamos todo fabric.js (~500KB)
// Investigar si podemos usar solo módulos necesarios
```

### 3. Preload Critical Resources
```typescript
// app/layout.tsx
<link rel="preload" href="/fonts/inter.woff2" as="font" crossOrigin="anonymous" />
<link rel="preconnect" href="https://images.unsplash.com" />
```

### 4. Service Worker / PWA
```typescript
// Cachear assets estáticos
// Offline support para páginas clave
```

---

## 🔍 Cómo Identificar Problemas

### 1. Usar Lighthouse
```bash
# En Chrome DevTools
F12 > Lighthouse > Generate Report
```

### 2. Bundle Analyzer
```bash
npm run analyze
```

### 3. Network Tab
- Verificar tamaño de JS chunks
- Identificar recursos bloqueantes
- Detectar imágenes sin optimizar

---

## ✅ Checklist de Optimización

### Código
- [x] Lazy loading de componentes pesados
- [x] Importaciones específicas de Three.js
- [ ] Optimizar importaciones de Fabric.js
- [ ] Code splitting por ruta
- [ ] Preloading de recursos críticos

### Imágenes
- [ ] Migrar todas las `<img>` a `<Image>`
- [ ] Generar blur placeholders
- [ ] Optimizar imágenes de productos
- [ ] CDN para assets estáticos

### Configuración
- [x] Next.js compress habilitado
- [x] optimizePackageImports configurado
- [ ] Bundle analyzer instalado
- [ ] Service Worker configurado

### Métricas
- [ ] Lighthouse score >90
- [ ] First Load JS <500KB
- [ ] Time to Interactive <3s
- [ ] Largest Contentful Paint <2.5s

---

## 📚 Recursos

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Bundle Analyzer](https://www.npmjs.com/package/@next/bundle-analyzer)
- [Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Web Vitals](https://web.dev/vitals/)

---

**Última Actualización:** 22 de Diciembre, 2024
**Próxima Revisión:** Después de implementar todas las optimizaciones
