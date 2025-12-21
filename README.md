# 🧶 MugMagic - 3D Customization Platform

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env.local
```

Fill in your API keys in `.env.local`:
- **Supabase**: URL and Anon Key
- **Stripe**: Publishable Key and Secret Key

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

- **Frontend**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + Custom Claymorphism
- **State**: Zustand (`designStore`, `cartStore`)
- **2D Editor**: Fabric.js v6
- **3D Viewer**: React Three Fiber + Drei
- **Backend Service**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Stripe Elements

## 🧪 Testing

Run E2E tests with Playwright:
```bash
npx playwright test
```
