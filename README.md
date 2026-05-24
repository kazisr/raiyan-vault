# Raiyan's Vault 🤍

A private, production-grade family memory vault and digital archive for **Kazi Ahmed Raiyan** (born May 17, 2026).

## Features

| Module | Description |
|---|---|
| **Dashboard** | Age counter, quick stats, vaccine reminders, recent events, ledger summary |
| **Child Profile** | Full profile with birth stats, blood group, auto age calculation |
| **Timeline** | Event timeline with types, moods, locations, tags, and images |
| **Gallery** | Photo gallery with albums, masonry grid, drag & drop upload, lightbox |
| **Medical** | Vaccine tracker, doctor visits, growth logs with charts |
| **Ledger** | Financial tracking in JPY & BDT with income/expense charts |
| **Blog** | Private family blog with draft/publish, rich text, tags |
| **Settings** | Theme toggle (light/dark/system), sign out, security info |

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4 + custom Material Design 3 token system
- **Components**: Radix UI primitives + custom shadcn-style components
- **Backend**: Supabase (PostgreSQL + Auth + Storage + RLS)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod
- **State**: Zustand
- **Package manager**: pnpm

## Quick Start

### 1. Clone and install

```bash
cd raiyan-vault
pnpm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Create a **private** storage bucket named `photos`
4. Apply the storage policies at the bottom of `schema.sql`

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to login.

### 5. Deploy to Vercel

```bash
vercel deploy
```

Add all environment variables in the Vercel project settings.

## Project Structure

```
src/
 ├── app/
 │    ├── (auth)/          # Login, signup, forgot password
 │    └── (app)/           # Protected app pages
 │         ├── dashboard/
 │         ├── profile/
 │         ├── timeline/
 │         ├── gallery/
 │         ├── medical/
 │         ├── ledger/
 │         └── blog/
 │
 ├── components/
 │    ├── ui/              # Design system components
 │    ├── layout/          # Sidebar, topbar, app shell
 │    ├── dashboard/       # Dashboard widgets
 │    ├── timeline/        # Event cards and forms
 │    ├── medical/         # Vaccine, visit, growth tabs
 │    └── child/           # Profile header, stats, form
 │
 ├── lib/
 │    ├── supabase/        # Client, server, middleware
 │    └── utils.ts         # cn() helper
 │
 ├── hooks/               # useChild, useSupabaseUser
 ├── services/            # Storage helpers
 ├── store/               # Zustand UI store
 ├── types/               # TypeScript types + DB schema
 ├── constants/           # Child info, event types, vaccines
 └── utils/               # Age calculator, currency formatter
```

## Database Schema

All tables use:
- UUID primary keys
- `user_id` FK to `auth.users` for RLS
- `created_at` / `updated_at` timestamps with auto-update triggers

Tables: `child_profiles`, `events`, `event_images`, `albums`, `photos`, `vaccines`, `doctor_visits`, `growth_logs`, `ledger_entries`, `blog_posts`

Row Level Security is enabled on every table — users can only access their own data.

## Design System

The app uses a custom **Material Design 3** inspired token system defined in CSS variables. Supports light and dark themes via `next-themes`.

Color palette:
- **Primary**: Warm blue `#5B7FA6`
- **Secondary**: Muted sage `#6B8F71`
- **Tertiary**: Warm peach `#C27A5A`
- **Surface**: Warm cream `#FEFBF7`

---

Built with love for Kazi Ahmed Raiyan 🌟
