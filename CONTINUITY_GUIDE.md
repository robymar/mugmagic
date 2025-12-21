# 📦 MugMagic - Continuity Guide

This project is ready to be moved to another machine.

## 1. Moving the files
Copy the `mugmagic` folder to your new computer. 
**Tip:** You can delete the `node_modules` folder before copying to save space (it contains thousands of files). You will reinstall them anyway.

## 2. Setup on New Machine

1. **Install Node.js**: Ensure Node.js (v18 or newer) is installed.
2. **Open Terminal**: Navigate to the `mugmagic` folder.
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Environment Variables**:
   - Rename `.env.example` to `.env.local` (if you haven't already).
   - Add your **Supabase** and **Stripe** keys.

## 3. Database Sync (Supabase)
Run these SQL commands in your Supabase SQL Editor to create the tables:

```sql
-- 1. Profiles
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  display_name text,
  created_at timestamptz default now()
);

-- 2. Designs
create table public.designs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  product_type text not null,
  fabric_json jsonb not null,
  preview_url text,
  created_at timestamptz default now()
);

-- 3. Storage
insert into storage.buckets (id, name, public) values ('designs', 'designs', true);
```

## 4. Run the App
```bash
npm run dev
```

## Current Status
- **2D Editor**: Functional (Add Text/Images).
- **3D Viewer**: Implemented with sync.
- **Cart**: Persists to localStorage.
- **Checkout**: Stripe integration ready (requires API keys).
