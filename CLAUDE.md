# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Financial Dashboard is a personal finance management application built with Next.js, TypeScript, Supabase, and Tailwind CSS. It allows users to track income sources, manage regular and sporadic expenses, monitor pending loans, and maintain wishlists with affordability calculations.

## Development Commands

### Core Commands
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run type-check` - TypeScript type checking without emitting files

### Utility Commands
- `npm run clean` - Remove build cache and node_modules/.cache
- `npm run analyze` - Analyze bundle size with webpack-bundle-analyzer
- `npm run export` - Export static files
- `npm run db:generate-types` - Generate TypeScript types from Supabase schema

## Database Architecture

### Supabase Configuration
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **Database**: PostgreSQL with generated TypeScript types
- **Migration file**: `supabase/migrations/001_initial_schema.sql`

### Core Tables
- `users` - Extended user profiles linked to auth.users
- `income_sources` - Recurring income sources (salary, freelance, etc.)
- `income_transactions` - Individual income transactions
- `regular_expenses` - Monthly recurring expenses
- `sporadic_expenses` - One-time expenses
- `pending_loans` - Money lent to others with probability tracking
- `wishlist_items` - Items with priority and affordability tracking
- `monthly_salaries` - Legacy salary tracking (maintained for compatibility)

## Application Architecture

### Key Directories
- `src/app/` - Next.js 13+ App Router pages
- `src/components/` - Reusable React components
- `src/components/ui/` - Base UI components (Toast, LoadingSpinner, ThemeToggle)
- `src/hooks/` - Custom React hooks
- `src/lib/` - Utility functions and configurations
- `src/types/` - TypeScript type definitions

### Data Management
- **Primary Hook**: `useFinancialData(user)` - Comprehensive financial data management
- **Database Client**: `createClient()` from `src/lib/supabase.ts`
- **Type Definitions**: `src/types/financial.ts` and `src/types/database.ts`

### Income System Architecture
The application supports a flexible income source system:
- **Income Sources**: Configurable recurring income (weekly, biweekly, monthly, occasional)
- **Income Transactions**: Individual income records
- **Categories**: salary, freelance, investment, bonus, other
- **Calculations**: Automatic monthly income calculation with frequency conversion
- **Payment Scheduling**: Next payment date calculations for different frequencies

### Expense Categories
Predefined categories in `CATEGORIES` constant:
- comida, transporte, entretenimiento, tecnologia, servicios, salud, educacion, otros, pc

### Theme System
- **Dark Mode**: Class-based dark mode with Tailwind CSS
- **Custom Gradients**: Extended background gradients for both light and dark themes
- **Theme Toggle**: Persistent theme switching with smooth transitions

## Development Patterns

### Component Structure
- Use TypeScript for all components
- Follow existing naming conventions (PascalCase for components)
- Implement proper error handling and loading states
- Use Tailwind CSS for styling with custom gradient classes

### Data Fetching Pattern
```typescript
// All financial data is managed through useFinancialData hook
const {
  incomeSources,
  incomeTransactions,
  regularExpenses,
  // ... other data and operations
  loading,
  error,
  addIncomeSource,
  deleteIncomeSource,
  // ... CRUD operations
} = useFinancialData(user);
```

### Form Handling
- Forms use controlled components with useState
- Validation happens client-side before submission
- Success/error feedback through toast notifications
- Automatic data refresh after mutations

### Authentication Flow
- Supabase auth with automatic session management
- User redirected to `/auth/login` or `/auth/register` if unauthenticated
- Dashboard page requires authentication

## Financial Calculations

### Income Calculations
- **Monthly Conversion**: Weekly * 4.33, Biweekly * 2, Monthly * 1
- **Next Payment**: Calculated based on frequency and payment_day
- **Upcoming Income**: Configurable date range for upcoming payments

### Balance Calculations
- **Base Balance**: Monthly Income - Total Regular Expenses - Sporadic Expenses
- **Expected Loans**: Sum of (loan.amount * loan.probability / 100)
- **Potential Balance**: Base Balance + Expected Loans

### Affordability Logic
- **Affordable**: item.price <= potentialBalance
- **Affordable Without Loans**: item.price <= baseBalance

## Environment Setup

Required environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://vsicoejwbfdgpmhuhstn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Email Configuration
**⚠️ IMPORTANTE**: Para producción, debes configurar un servicio SMTP personalizado:
- El email service built-in de Supabase tiene límites estrictos
- Ver `SUPABASE_EMAIL_SETUP.md` para configuración completa
- Proveedores recomendados: Resend, SendGrid, Mailgun
- Configurar en: Supabase Dashboard → Settings → Auth → SMTP Settings

## Key Dependencies

- **Next.js 15.4.5** with App Router
- **React 19.1.1** with TypeScript 5
- **Supabase** for backend and authentication
- **Tailwind CSS** for styling with custom extensions
- **Lucide React** for icons
- **Recharts** for data visualization
- **date-fns** for date manipulation

## Deployment Configuration

### Netlify Deployment
- Build command: `npm run build`
- Publish directory: `.next`
- Node version: 18+
- Environment variables must be configured in Netlify dashboard

### Next.js Configuration
- ESLint disabled during builds (temporary fix for Next.js 15.4.5 dependency issue)
- Image optimization configured for external domains
- TypeScript strict mode enabled

## Spanish Language Support
The application is primarily in Spanish with:
- Spanish interface text and labels
- Date formatting for Spanish locale
- Currency formatting for Colombian Peso (COP)