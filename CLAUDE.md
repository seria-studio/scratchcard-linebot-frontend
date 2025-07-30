# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Next.js-based scratchcard LINE Bot frontend application using TypeScript, Tailwind CSS, and shadcn/ui components. The app provides an admin interface for managing scratch cards and tracking user results.

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Production server
npm start

# Linting
npm run lint
```

## Project Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with CSS-in-JS via CSS variables
- **UI Components**: shadcn/ui with Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **LINE Integration**: @line/liff for LINE Bot integration

### Directory Structure

```
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin interface routes
│   │   ├── scratch-cards/ # Scratch card management
│   │   ├── users/         # User management
│   │   └── results/       # Results tracking
│   ├── layout.tsx         # Root layout with Chinese locale
│   └── page.tsx           # Home page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── scratch-card.tsx   # Interactive scratch card component
│   ├── navigation.tsx     # Admin sidebar navigation
│   └── *.tsx             # Feature-specific components
├── lib/
│   ├── types.ts          # TypeScript interfaces
│   ├── api.ts            # API utilities
│   ├── utils.ts          # Utility functions (cn helper)
│   └── prize-selection.ts # Prize logic
└── styles/               # Global styles
```

### Key Components

- **ScratchCard**: Interactive canvas-based scratch card with touch/mouse support
- **Navigation**: Admin sidebar with Chinese text and Lucide icons
- **UI Components**: Complete shadcn/ui component library for forms, dialogs, tables

### State Management & Data Flow

- Uses React state and client-side components ('use client')
- API calls handled through lib/api.ts
- Type definitions centralized in lib/types.ts
- Form validation with Zod schemas

### Styling Approach

- CSS-in-JS using Tailwind with CSS custom properties
- Dark mode support configured but may need theme provider
- Responsive design with mobile-first approach
- Chinese language support with appropriate fonts

### LINE Bot Integration

- Uses @line/liff SDK for LINE platform integration
- Configured for Traditional Chinese (zh-TW) locale
- Mobile-optimized touch interactions

## Development Guidelines

### Component Patterns
- All interactive components use 'use client' directive
- Event handlers use useCallback for performance
- Canvas interactions support both mouse and touch events
- Form components integrate with react-hook-form

### Styling Conventions
- Use shadcn/ui components for consistent design
- Leverage Tailwind utility classes
- CSS custom properties defined in globals.css
- Icons from Lucide React library

### API Integration
- Centralized API utilities in lib/api.ts
- TypeScript interfaces in lib/types.ts
- Error handling with toast notifications

### Production Deployment
- PM2 configuration for production (port 3005)
- Build optimization with Next.js
- TypeScript strict mode enabled

## Testing

No test framework is currently configured. When adding tests, consider:
- Jest + React Testing Library for component tests
- Cypress or Playwright for E2E testing
- Test scratch card interactions and form submissions