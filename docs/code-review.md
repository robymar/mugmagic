# 🔍 Revisión Exhaustiva de Código - MugMagic
**Fecha:** 22 de Diciembre, 2024
**Revisor:** Antigravity AI
**Versión del Proyecto:** 0.1.0

---

## 📋 Índice
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura General](#arquitectura-general)
3. [Seguridad](#seguridad)
4. [Rendimiento](#rendimiento)
5. [Mantenibilidad](#mantenibilidad)
6. [Testing](#testing)
7. [Accesibilidad](#accesibilidad)
8. [SEO](#seo)
9. [Recomendaciones por Área](#recomendaciones-por-área)
10. [Plan de Acción Priorizado](#plan-de-acción-priorizado)

---

## 🎯 Resumen Ejecutivo

### Estado General
- **Stack**: Next.js 16.1.0, React 19, TypeScript, Supabase, Stripe
- **Líneas de Código**: ~15,000+ estimadas
- **Componentes**: 30+ componentes
- **API Routes**: 11 rutas
- **Estado**: MVP funcional con áreas de mejora

### Puntos Fuertes ✅
1. Arquitectura moderna con Next.js App Router
2. TypeScript estricto activado
3. Integración completa de Supabase y Stripe
4. Sistema de diseño basado en componentes
5. Testing configurado (Jest + Playwright)
6. Headers de seguridad implementados
7. Estado global con Zustand bien estructurado

### Áreas Críticas de Mejora 🚨
1. **Seguridad**: Variables de entorno expuestas, falta validación en algunos endpoints
2. **Rendimiento**: Sin optimización de imágenes, bundle sin analizar
3. **Testing**: Cobertura muy baja (~5%)
4. **Accesibilidad**: Falta de atributos ARIA, navegación por teclado incompleta
5. **Manejo de Errores**: Inconsistente, falta error boundaries en áreas clave
6. **Documentación**: Código sin documentar, falta README técnico

---

## 🏗️ Arquitectura General

### Estructura de Carpetas
```
mugmagic/
├── app/                # Next.js App Router
│   ├── api/           # API Routes (11 rutas)
│   ├── admin/         # Panel de administración
│   ├── auth/          # Autenticación
│   ├── checkout/      # Proceso de compra
│   ├── editor/        # Editor de diseño
│   └── ...
├── components/        # Componentes React (30+)
│   ├── admin/
│   ├── editor/
│   ├── layout/
│   ├── product/
│   ├── shop/
│   └── ui/
├── lib/              # Utilidades y configuración
├── stores/           # Estado global (Zustand)
├── types/            # Definiciones TypeScript
└── utils/            # Helpers
```

### Evaluación de Arquitectura

#### ✅ Buenas Prácticas
- Separación clara de responsabilidades
- Uso correcto de Server Components vs Client Components
- Stores Zustand bien organizados
- Tipado TypeScript consistente

#### ⚠️ Problemas Identificados
1. **Mezcla de lógica de negocio**: Algunas validaciones en frontend y backend
2. **Duplicación de código**: Lógica de validación repetida
3. **Acoplamiento**: Componentes muy acoplados a Zustand stores
4. **Falta de capas**: No hay clara separación entre servicios/repositorios

### Recomendaciones Arquitectónicas

#### 1️⃣ Implementar Arquitectura en Capas
```typescript
// Ejemplo propuesto
src/
├── domain/           # Lógica de negocio pura
│   ├── entities/    # Modelos
│   └── use-cases/   # Casos de uso
├── infrastructure/   # Implementaciones concretas
│   ├── api/
│   ├── database/
│   └── services/
└── presentation/     # UI (componentes actuales)
```

#### 2️⃣ Crear Servicios Reutilizables
```typescript
// services/ProductService.ts
export class ProductService {
  constructor(private repository: ProductRepository) {}
  
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    return this.repository.findAll(filters);
  }
  
  async validateProduct(product: Product): Promise<ValidationResult> {
    // Validación centralizada
  }
}
```

#### 3️⃣ Implementar Repository Pattern
```typescript
// repositories/ProductRepository.ts
export interface ProductRepository {
  findAll(filters?: ProductFilters): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  create(product: Product): Promise<Product>;
  update(id: string, product: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
}
```

---

## 🔒 Seguridad

### Vulnerabilidades Críticas

#### 1. Exposición de Service Role Key ❌
**Archivo**: `lib/supabase-admin.ts`
```typescript
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                           process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
```
**Problema**: Fallback a ANON_KEY es peligroso.
**Solución**: 
```typescript
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations');
}
```

#### 2. Falta de Rate Limiting en Endpoints Críticos ⚠️
**Archivo**: `app/api/auth/login/route.ts`
**Problema**: No hay protección contra ataques de fuerza bruta.
**Solución**: Implementar rate limiting con Redis o Upstash
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 intentos por minuto
});

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  // ... resto del código
}
```

#### 3. Validación de Input Insuficiente 🟡
**Archivos afectados**: Múltiples API routes
**Problema**: Uso inconsistente de Zod para validación.
**Solución**: Crear schemas Zod para todos los endpoints
```typescript
// lib/validation-schemas.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const productSchema = z.object({
  name: z.string().min(1).max(100),
  basePrice: z.number().positive(),
  // ... más validaciones
});

// En route.ts
const validatedData = loginSchema.parse(await request.json());
```

#### 4. CSRF Protection ⚠️
**Problema**: No hay tokens CSRF en formularios.
**Solución**: Implementar tokens CSRF para formularios POST
```typescript
// middleware.ts - Agregar CSRF middleware
import { csrf } from '@edge-csrf/nextjs';

const csrfProtect = csrf({
  cookie: {
    secure: process.env.NODE_ENV === 'production',
  },
});

export const middleware = csrfProtect;
```

#### 5. XSS en Diseños Guardados 🟡
**Archivo**: `stores/designStore.ts`
**Problema**: Guardar JSON de fabric.js sin sanitización.
**Solución**: Sanitizar antes de guardar
```typescript
import DOMPurify from 'isomorphic-dompurify';

saveDesign: async (productId: string, userId?: string) => {
  const json = canvas.toJSON();
  
  // Sanitizar texto de objetos
  if (json.objects) {
    json.objects = json.objects.map(obj => {
      if (obj.type === 'text' || obj.type === 'i-text') {
        obj.text = DOMPurify.sanitize(obj.text);
      }
      return obj;
    });
  }
  
  // ... resto del código
}
```

### Recomendaciones de Seguridad Adicionales

#### Headers de Seguridad
**Archivo**: `next.config.ts`
✅ Ya implementados, pero mejorar:
```typescript
// Agregar Permissions-Policy más restrictivo
"Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(self)"
```

#### Content Security Policy
⚠️ Actual permite 'unsafe-eval' y 'unsafe-inline'
**Mejorar a**:
```typescript
"script-src 'self' 'nonce-{RANDOM}' https://js.stripe.com",
"style-src 'self' 'nonce-{RANDOM}' https://fonts.googleapis.com",
```

#### SQL Injection
✅ Protegido por Supabase ORM, pero:
- Revisar queries raw (si existen)
- Validar todos los parámetros de búsqueda

---

## ⚡ Rendimiento

### Análisis de Bundle

#### Problemas Identificados
1. **No hay análisis de bundle**: Falta `@next/bundle-analyzer`
2. **Three.js completo**: Importando toda la librería
3. **Fabric.js grande**: ~500KB sin tree-shaking
4. **Sin lazy loading**: Componentes pesados sin code splitting

#### Soluciones Propuestas

##### 1. Instalar Bundle Analyzer
```bash
npm install @next/bundle-analyzer
```
```typescript
// next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);
```

##### 2. Optimizar Importaciones de Three.js
```typescript
// ❌ Antes
import * as THREE from 'three';

// ✅ Después
import { WebGLRenderer, PerspectiveCamera, Scene } from 'three';
```

##### 3. Lazy Load Componentes Pesados
```typescript
// ❌ Antes
import ProductViewer3D from '@/components/viewer/ProductViewer3D';

// ✅ Después
const ProductViewer3D = dynamic(() => import('@/components/viewer/ProductViewer3D'), {
  loading: () => <LoadingSpinner />,
  ssr: false // Three.js no soporta SSR
});
```

##### 4. Implementar Image Optimization
```typescript
// components/product/ProductCard.tsx
// ❌ Usar <img> nativo
<img src={product.thumbnail} alt={product.name} />

// ✅ Usar next/image
<Image
  src={product.thumbnail}
  alt={product.name}
  width={400}
  height={400}
  loading="lazy"
  placeholder="blur"
/>
```

### Optimización de Stores Zustand

#### Problema: Re-renders innecesarios
```typescript
// ❌ Mal uso
const { items, total, discount } = useCartStore(); // Re-render en cualquier cambio

// ✅ Selectores específicos
const items = useCartStore(state => state.items);
const total = useCartStore(state => state.total());
```

#### Solución: Implementar Middleware de Logging Solo en Dev
```typescript
// stores/cartStore.ts
import { devtools } from 'zustand/middleware';

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        // ... store
      }),
      { name: 'mugmagic-cart' }
    ),
    { enabled: process.env.NODE_ENV === 'development' }
  )
);
```

### Caché y Revalidación

#### Implementar ISR (Incremental Static Regeneration)
```typescript
// app/products/page.tsx
export const revalidate = 3600; // Revalidar cada hora

export default async function ProductsPage() {
  const products = await getProductsFromDB();
  return <ProductList products={products} />;
}
```

#### Agregar SWR para Client-Side Fetching
```typescript
import useSWR from 'swr';

const { data, error, isLoading } = useSWR('/api/products', fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 60000, // 1 minuto
});
```

---

## 🔧 Mantenibilidad

### Documentación

#### Problemas
1. ❌ No hay JSDoc en funciones complejas
2. ❌ README genérico sin instrucciones técnicas
3. ❌ Falta documentación de API
4. ❌ No hay guía de contribución

#### Soluciones

##### 1. Agregar JSDoc
```typescript
/**
 * Calcula el total del carrito incluyendo descuentos y envío.
 * 
 * @returns {number} Total en centavos (EUR)
 * @throws {Error} Si el carrito está vacío
 * 
 * @example
 * const total = calculateTotal();
 * console.log(total); // 1499 (14.99 EUR)
 */
export function calculateTotal(): number {
  // ...
}
```

##### 2. Crear README.md Técnico
```markdown
# MugMagic - Documentación Técnica

## Stack
- Next.js 16.1.0
- React 19
- TypeScript 5
- Supabase (Auth + DB)
- Stripe (Pagos)

## Instalación
...

## Variables de Entorno
...

## Arquitectura
...

## Testing
...
```

### Code Smells Identificados

#### 1. Funciones Demasiado Largas
**Archivo**: `app/checkout/page.tsx` (586 líneas)
**Solución**: Dividir en sub-componentes
```typescript
// ✅ Mejor estructura
<CheckoutPage>
  <ShippingStep />
  <PaymentStep />
  <OrderSummary />
</CheckoutPage>
```

#### 2. Magic Numbers
```typescript
// ❌ Antes
if (subtotal >= 50) { 
  shippingCost = 0;
}

// ✅ Después
const FREE_SHIPPING_THRESHOLD = 50;
if (subtotal >= FREE_SHIPPING_THRESHOLD) {
  shippingCost = 0;
}
```

#### 3. Constantes Hardcodeadas
**Archivo**: `components/editor/EditorUI.tsx`
```typescript
// ❌ Antes
price: 1499, // cents

// ✅ Después
import { DEFAULT_PRODUCT_PRICE } from '@/lib/constants';
price: DEFAULT_PRODUCT_PRICE,
```

### Refactoring Sugerido

#### Extraer Hooks Personalizados
```typescript
// hooks/useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const supabase = createClient();
    // ... lógica de auth
  }, []);
  
  return { user, loading };
}

// Uso en componentes
const { user, loading } = useAuth();
```

#### Crear Composables para Lógica Compartida
```typescript
// hooks/useProductFilters.ts
export function useProductFilters() {
  const [filters, setFilters] = useState<ProductFilters>({});
  
  const applyFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const clearFilters = () => setFilters({});
  
  return { filters, applyFilter, clearFilters };
}
```

---

## 🧪 Testing

### Estado Actual
- **Cobertura**: ~5% (muy bajo)
- **Tests Unitarios**: Pocos
- **Tests de Integración**: Mínimos
- **Tests E2E**: Configurado pero no ejecutado

### Plan de Testing

#### 1. Tests Unitarios Prioritarios
```typescript
// __tests__/lib/validate-cart.test.ts
describe('validateCart', () => {
  it('should reject cart with negative quantities', () => {
    const invalidCart = { items: [{ quantity: -1 }] };
    expect(() => validateCart(invalidCart)).toThrow();
  });
  
  it('should validate price against product catalog', () => {
    // ...
  });
});

// __tests__/stores/cartStore.test.ts
describe('CartStore', () => {
  it('should calculate total correctly with discount', () => {
    const store = useCartStore.getState();
    store.addItem(mockItem);
    store.applyDiscount('SAVE20');
    expect(store.total()).toBe(expectedTotal);
  });
});
```

#### 2. Tests de Integración
```typescript
// __tests__/api/checkout.test.ts
describe('Checkout API', () => {
  it('should create payment intent with valid cart', async () => {
    const response = await POST(mockRequest);
    expect(response.status).toBe(200);
    expect(response.json()).toHaveProperty('clientSecret');
  });
  
  it('should reject cart with invalid items', async () => {
    const response = await POST(invalidRequest);
    expect(response.status).toBe(400);
  });
});
```

#### 3. Tests E2E con Playwright
```typescript
// tests/checkout-flow.spec.ts
test('complete checkout flow', async ({ page }) => {
  await page.goto('/products');
  await page.click('[data-testid="add-to-cart"]');
  await page.click('[data-testid="checkout-button"]');
  
  // Rellenar formulario
  await page.fill('#email', 'test@example.com');
  // ...
  
  await page.click('[data-testid="submit-payment"]');
  await expect(page).toHaveURL('/checkout/success');
});
```

#### 4. Visual Regression Testing
```bash
npm install @playwright/test
```
```typescript
test('product page visual', async ({ page }) => {
  await page.goto('/products/classic-mug-11oz');
  await expect(page).toHaveScreenshot();
});
```

### Mocking y Fixtures

#### Crear Fixtures Reutilizables
```typescript
// __tests__/fixtures/products.ts
export const mockProducts: Product[] = [
  {
    id: 'test-mug-1',
    name: 'Test Mug',
    basePrice: 12.99,
    // ...
  },
];

// __tests__/fixtures/users.ts
export const mockUser = {
  id: 'test-user-1',
  email: 'test@example.com',
};
```

---

## ♿ Accesibilidad

### Problemas Identificados

#### 1. Falta de Atributos ARIA
```typescript
// ❌ components/ui/Button.tsx
<button onClick={onClick}>Click me</button>

// ✅ Mejorado
<button
  onClick={onClick}
  aria-label={ariaLabel}
  aria-disabled={disabled}
  role="button"
>
  {children}
</button>
```

#### 2. Contraste de Colores
Revisar con herramientas como:
- axe DevTools
- WAVE
- Lighthouse

#### 3. Navegación por Teclado
```typescript
// ❌ Elementos clickables sin soporte de teclado
<div onClick={handleClick}>Clickme</div>

// ✅ Usar elementos semánticos
<button onClick={handleClick} onKeyDown={handleKeyDown}>
  Click me
</button>
```

#### 4. Anuncios de Pantalla Lectora
```typescript
// components/cart/CartDrawer.tsx
const [announcement, setAnnouncement] = useState('');

const addItem = (item: CartItem) => {
  // ...
  setAnnouncement(`${item.name} added to cart`);
};

return (
  <>
    <div role="status" aria-live="polite" className="sr-only">
      {announcement}
    </div>
    {/* ... resto del drawer */}
  </>
);
```

### Recomendaciones de Accesibilidad

1. **Agregar Skip Links**
```tsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>
```

2. **Landmarks ARIA**
```tsx
<nav aria-label="Main navigation">
<main id="main-content">
<aside aria-label="Shopping cart">
```

3. **Focus Management**
```typescript
// En modales y drawers
useEffect(() => {
  if (isOpen) {
    const firstFocusable = dialogRef.current?.querySelector('button, input');
    firstFocusable?.focus();
  }
}, [isOpen]);
```

---

## 🔍 SEO

### Estado Actual
✅ Metadata básico implementado
⚠️ Falta optimización avanzada

### Mejoras Propuestas

#### 1. Structured Data (JSON-LD)
```typescript
// components/product/ProductStructuredData.tsx
export function ProductStructuredData({ product }: { product: Product }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.images.gallery,
    "description": product.description,
    "sku": product.id,
    "offers": {
      "@type": "Offer",
      "price": product.basePrice,
      "priceCurrency": "EUR",
      "availability": product.inStock 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviewCount
    }
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
```

#### 2. Sitemap Dinámico
```typescript
// app/sitemap.ts
export default async function sitemap() {
  const products = await getProductsFromDB();
  
  const productUrls = products.map(p => ({
    url: `https://mugmagic.com/products/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
  
  return [
    {
      url: 'https://mugmagic.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...productUrls,
  ];
}
```

#### 3. Robots.txt
```typescript
// app/robots.ts
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: 'https://mugmagic.com/sitemap.xml',
  };
}
```

---

## 📊 Recomendaciones por Área

### 1. **Autenticación y Autorización**

#### Implementar Middleware de Autorización
```typescript
// middleware/auth.ts
export function requireAuth(roles?: string[]) {
  return async (request: Request) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.redirect('/login');
    }
    
    if (roles && !roles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    return null; // Permitir continuar
  };
}

// Uso en API routes
export async function GET(request: Request) {
  const authError = await requireAuth(['admin'])(request);
  if (authError) return authError;
  
  // ... lógica del endpoint
}
```

#### Session Refresh Automático
```typescript
// hooks/useSession.ts
export function useSessionRefresh() {
  useEffect(() => {
    const supabase = createClient();
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') {
        console.log('Session refreshed');
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);
}
```

### 2. **Editor de Diseño**

#### Optimizar Fabric.js Performance
```typescript
// stores/designStore.ts
setCanvas: (canvas) => {
  // Configurar para mejor rendimiento
  canvas.renderOnAddRemove = false; // Manual rendering
  canvas.skipTargetFind = false;
  canvas.selection = true;
  
  // Usar requestAnimationFrame para updates
  let rafId: number;
  const scheduleRender = () => {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      canvas.requestRenderAll();
    });
  };
  
  canvas.on('object:modified', scheduleRender);
},
```

#### Historial de Cambios (Undo/Redo)
```typescript
interface DesignState {
  // ... existing
  history: string[]; // JSON states
  historyIndex: number;
  
  undo: () => void;
  redo: () => void;
  saveState: () => void;
}

// Implementación
saveState: () => {
  const { canvas, history, historyIndex } = get();
  if (!canvas) return;
  
  const json = JSON.stringify(canvas.toJSON());
  const newHistory = history.slice(0, historyIndex + 1);
  newHistory.push(json);
  
  set({ history: newHistory, historyIndex: newHistory.length - 1 });
},

undo: () => {
  const { canvas, history, historyIndex } = get();
  if (historyIndex > 0) {
    const previousState = history[historyIndex - 1];
    canvas?.loadFromJSON(previousState, () => {
      canvas.requestRenderAll();
    });
    set({ historyIndex: historyIndex - 1 });
  }
},
```

### 3. **Checkout y Pagos**

#### Validación de Precios Server-Side
```typescript
// lib/validate-cart.ts - MEJORADO
export async function validateCartPrices(items: CartItem[]): Promise<{
  valid: boolean;
  errors: string[];
  correctedTotal: number;
}> {
  const errors: string[] = [];
  let correctedTotal = 0;
  
  for (const item of items) {
    const product = await getProductById(item.productId);
    
    if (!product) {
      errors.push(`Product ${item.productId} not found`);
      continue;
    }
    
    let expectedPrice = product.basePrice;
    if (item.selectedVariant) {
      const variant = product.variants?.find(v => v.id === item.selectedVariant.id);
      if (variant) {
        expectedPrice += variant.priceModifier;
      }
    }
    
    const actualPrice = item.price / 100; // Convert cents to euros
    if (Math.abs(expectedPrice - actualPrice) > 0.01) {
      errors.push(
        `Price mismatch for ${product.name}: expected ${expectedPrice}, got ${actualPrice}`
      );
    }
    
    correctedTotal += expectedPrice * item.quantity;
  }
  
  return {
    valid: errors.length === 0,
    errors,
    correctedTotal: Math.round(correctedTotal * 100), // Back to cents
  };
}
```

#### Retry Logic para Stripe
```typescript
// lib/stripe-utils.ts
export async function createPaymentIntentWithRetry(
  params: Stripe.PaymentIntentCreateParams,
  maxRetries = 3
): Promise<Stripe.PaymentIntent> {
  let lastError: Error;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await stripe.paymentIntents.create(params);
    } catch (error) {
      lastError = error as Error;
      
      // No reintentar errores de validación
      if (error.type === 'StripeInvalidRequestError') {
        throw error;
      }
      
      // Backoff exponencial
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, attempt) * 1000)
      );
    }
  }
  
  throw lastError!;
}
```

### 4. **Admin Panel**

#### Implementar Roles y Permisos
```typescript
// types/roles.ts
export enum Role {
  ADMIN = 'admin',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

export enum Permission {
  CREATE_PRODUCT = 'create:product',
  UPDATE_PRODUCT = 'update:product',
  DELETE_PRODUCT = 'delete:product',
  VIEW_ORDERS = 'view:orders',
  MANAGE_ORDERS = 'manage:orders',
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: Object.values(Permission),
  [Role.EDITOR]: [
    Permission.CREATE_PRODUCT,
    Permission.UPDATE_PRODUCT,
    Permission.VIEW_ORDERS,
  ],
  [Role.VIEWER]: [Permission.VIEW_ORDERS],
};

// hooks/usePermissions.ts
export function usePermissions() {
  const { user } = useAuth();
  
  const hasPermission = (permission: Permission) => {
    if (!user) return false;
    const userPermissions = ROLE_PERMISSIONS[user.role as Role] || [];
    return userPermissions.includes(permission);
  };
  
  return { hasPermission };
}
```

#### Audit Log
```typescript
// lib/audit-log.ts
export async function logAdminAction(
  userId: string,
  action: string,
  resource: string,
  details?: any
) {
  await supabaseAdmin.from('audit_logs').insert({
    user_id: userId,
    action,
    resource,
    details,
    ip_address: headers().get('x-forwarded-for'),
    user_agent: headers().get('user-agent'),
    created_at: new Date().toISOString(),
  });
}

// Uso
await logAdminAction(user.id, 'DELETE', 'product', { 
  productId: id,
  productName: product.name 
});
```

---

## 🎯 Plan de Acción Priorizado

### Fase 1: Seguridad Crítica (1-2 semanas)
- [ ] Implementar rate limiting en auth endpoints
- [ ] Agregar validación Zod en todos los API routes
- [ ] Corregir exposición de service key
- [ ] Implementar CSRF tokens
- [ ] Sanitizar inputs de usuario

### Fase 2: Testing (2-3 semanas)
- [ ] Configurar cobertura mínima (60%)
- [ ] Tests unitarios para stores
- [ ] Tests de integración para API routes
- [ ] Tests E2E para flujos críticos
- [ ] Visual regression tests

### Fase 3: Rendimiento (1-2 semanas)
- [ ] Implementar bundle analyzer
- [ ] Optimizar importaciones de librerías
- [ ] Lazy loading de componentes pesados
- [ ] Image optimization
- [ ] Implementar ISR y caching

### Fase 4: Accesibilidad (1 semana)
- [ ] Auditoría completa con axe
- [ ] Agregar ARIA labels
- [ ] Mejorar navegación por teclado
- [ ] Focus management en modales
- [ ] Screen reader announcements

### Fase 5: Mantenibilidad (Continuo)
- [ ] Documentar funciones complejas
- [ ] Crear README técnico
- [ ] Extraer hooks personalizados
- [ ] Implementar arquitectura en capas
- [ ] Configurar linters y formatters

### Fase 6: SEO y Marketing (1 semana)
- [ ] Structured data para productos
- [ ] Sitemap dinámico
- [ ] Robots.txt
- [ ] Meta tags optimizados
- [ ] Open Graph images

---

## 📝 Conclusiones

### Fortalezas del Proyecto
1. ✅ Stack moderno y bien elegido
2. ✅ TypeScript estricto
3. ✅ Integración Stripe/Supabase sólida
4. ✅ Componentes bien organizados
5. ✅ Headers de seguridad básicos

### Deudas Técnicas Principales
1. 🔴 **Testing**: Cobertura muy baja
2. 🔴 **Seguridad**: Validación inconsistente
3. 🟡 **Rendimiento**: Bundle sin optimizar
4. 🟡 **Accesibilidad**: Falta ARIA y navegación teclado
5. 🟡 **Documentación**: Código sin documentar

### Próximos Pasos Inmediatos
1. **Implementar rate limiting** en `/api/auth/login`
2. **Agregar validación Zod** en todos los endpoints
3. **Escribir tests** para `cartStore` y `validateCart`
4. **Optimizar bundle** con code splitting
5. **Documentar API** con JSDoc

---

**Última Actualización**: 22 de Diciembre, 2024
**Próxima Revisión**: 22 de Enero, 2025
