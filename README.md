# MugMagic - Technical Documentation

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![Tests](https://img.shields.io/badge/Tests-75+-green.svg)](https://github.com/)
[![Security](https://img.shields.io/badge/Security-90%25-success.svg)](https://github.com/)

Custom mug design platform with AI-powered personalization, 3D preview, and e-commerce integration.

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Key Features](#key-features)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)

---

## 🛠 Tech Stack

### Core
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.0
- **Styling:** Tailwind CSS
- **State:** Zustand

### Design & 3D
- **Canvas:** Fabric.js 6.0
- **3D Rendering:** Three.js + React Three Fiber
- **Animations:** Framer Motion

### Backend & Data
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Payment:** Stripe
- **File Storage:** Supabase Storage

### Testing
- **Unit Tests:** Jest + React Testing Library
- **E2E Tests:** Playwright
- **Coverage:** ~85% (unit), 100% (critical flows)

### Dev Tools
- **Validation:** Zod
- **Linting:** ESLint
- **Type Checking:** TypeScript strict mode

---

## 🚀 Getting Started

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/mugmagic.git
cd mugmagic

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_SECRET_KEY=your_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📁 Project Structure

```
mugmagic/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── products/     # Product CRUD
│   │   └── stripe/       # Payment webhooks
│   ├── (routes)/         # Page routes
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
│
├── components/            # React components
│   ├── cart/             # Shopping cart
│   ├── editor/           # Design editor
│   ├── shop/             # E-commerce UI
│   ├── ui/               # Reusable UI
│   └── seo/              # SEO components
│
├── lib/                   # Utilities & helpers
│   ├── api-utils.ts      # API validation
│   ├── sanitization.ts   # XSS protection
│   ├── validation-schemas.ts # Zod schemas
│   └── db/               # Database queries
│
├── stores/               # Zustand state management
│   ├── cartStore.ts      # Shopping cart
│   └── designStore.ts    # Canvas design
│
├── tests/                # Test suites
│   ├── e2e/             # Playwright E2E
│   └── unit/            # Jest unit tests
│
├── docs/                 # Documentation
│   └── API.md           # API reference
│
└── public/              # Static assets
```

---

## ✨ Key Features

### 1. Design Editor
- **Canvas Engine:** Fabric.js with custom controls
- **3D Preview:** Real-time Three.js rendering
- **Tools:** Text, images, stickers, AI avatars
- **Export:** High-res PNG for printing

### 2. E-commerce
- **Cart:** Persistent, discount codes, free shipping
- **Checkout:** Stripe integration, server-side validation
- **Orders:** Email confirmations, tracking
- **Payment:** Card, Apple Pay, Google Pay

### 3. Security
- **Rate Limiting:** 5-20 req/min per endpoint
- **Validation:** Zod schemas on all inputs
- **XSS Protection:** DOMPurify sanitization
- **Auth:** Role-based access (admin/user)

### 4. Performance
- **Bundle:** Lazy loading, code splitting
- **Images:** next/image, AVIF/WebP
- **3D:** Optimized Three.js imports
- **Caching:** API responses, static generation

---

## 💻 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build           # Production build
npm run start           # Start production server
npm run analyze         # Bundle analyzer

# Testing
npm test                # Run unit tests
npm run test:watch      # Watch mode
npm run test:coverage   # Coverage report
npm run test:e2e        # E2E tests
npm run test:e2e:ui     # E2E with UI

# Code Quality
npm run lint            # ESLint
npm run type-check      # TypeScript
```

### Development Workflow

1. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make changes and test**
   ```bash
   npm test
   npm run test:e2e
   ```

3. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add new feature"
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature
   ```

---

## 🧪 Testing

### Unit Tests (Jest)

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

**Key test files:**
- `__tests__/stores/cartStore.test.ts` - Cart logic
- `__tests__/lib/validation-schemas.test.ts` - Zod validation

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Interactive UI
npm run test:e2e:ui

# Headed mode (see browser)
npm run test:e2e:headed
```

**Test scenarios:**
- Complete checkout flow
- Cart operations
- Product browsing
- Editor interaction
- Responsive design

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Environment Variables

Set in Vercel dashboard:
- All `.env.local` variables
- `NODE_ENV=production`

### Database Migration

```bash
# Run Supabase migrations
npx supabase db push
```

---

## 📚 API Documentation

Full API documentation: [`docs/API.md`](./docs/API.md)

### Quick Reference

**Authentication**
```
POST /api/auth/login
```

**Products**
```
GET  /api/products
POST /api/products (admin)
PUT  /api/products/[id] (admin)
```

**Orders**
```
POST /api/create-payment-intent
POST /api/track-order
```

**Rate Limits:**
- Login: 5 req/min
- Track Order: 10 req/min  
- Create Product: 10 req/min

---

## 🔒 Security

- **Validation:** Zod schemas on all inputs
- **Sanitization:** XSS protection via DOMPurify
- **Rate Limiting:** Per-IP, per-endpoint
- **HTTPS:** Required in production
- **CSP:** Content Security Policy headers
- **CORS:** Restricted origins

See [`SECURITY_FINAL.md`](./SECURITY_FINAL.md) for details.

---

## 🐛 Troubleshooting

### Common Issues

**Port 3000 in use:**
```bash
lsof -ti:3000 | xargs kill
```

**Supabase connection:**
- Verify `.env.local` credentials
- Check Supabase project status

**Type errors:**
```bash
npm run type-check
```

**Test failures:**
```bash
npm test -- --verbose
```

---

## 📊 Performance

**Lighthouse Scores (Target):**
- Performance: >90
- Accessibility: >95
- Best Practices: >95
- SEO: >95

**Bundle Size:**
- First Load JS: <500KB
- Editor chunk: ~300KB (lazy loaded)

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes with tests
4. Submit pull request

**Commit Convention:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `test:` Tests
- `perf:` Performance
- `refactor:` Code refactoring

---

## 📄 License

MIT License - see [LICENSE](./LICENSE)

---

## 👥 Team

**Development:** Your Team
**Maintained by:** [Your Name]

---

## 📞 Support

- **Documentation:** [`/docs`](./docs)
- **Issues:** GitHub Issues
- **Email:** support@mugmagic.com

---

**Built with ❤️ using Next.js and TypeScript**
