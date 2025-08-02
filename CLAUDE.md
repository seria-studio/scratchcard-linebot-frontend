# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status: Initial Setup Complete

**Current State**: Fresh Next.js 15 project with TypeScript, Tailwind CSS, and complete shadcn/ui component library integration. All files are untracked (initial commit only).

## Overview

This is a Next.js-based scratchcard LINE Bot frontend application using TypeScript, Tailwind CSS, and shadcn/ui components. The app provides an admin interface for managing scratch cards and tracking user results.

## Project Architecture

### Tech Stack

- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.17 with CSS variables
- **UI Components**: Complete shadcn/ui component library with Radix UI primitives
- **Forms**: React Hook Form 7.54.1 with Zod 3.24.1 validation
- **LINE Integration**: @line/liff 2.27.1 for LINE Bot integration
- **Icons**: Lucide React 0.454.0
- **Themes**: next-themes 0.4.4 for dark mode support
- **Charts**: Recharts 2.15.0 for data visualization
- **Notifications**: Sonner 1.7.1 for toast notifications

### Directory Structure

```
├── app/                           # Next.js App Router pages
│   ├── admin/                    # Admin interface routes
│   │   ├── layout.tsx           # Admin layout
│   │   ├── page.tsx             # Admin dashboard
│   │   ├── scratch-cards/       # Scratch card management
│   │   │   └── page.tsx
│   │   ├── users/               # User management
│   │   │   ├── loading.tsx      # Loading UI
│   │   │   └── page.tsx
│   │   └── results/             # Results tracking
│   │       └── page.tsx
│   ├── scratch-cards/           # Public scratch card routes
│   │   └── [id]/
│   │       └── page.tsx         # Individual scratch card
│   ├── globals.css              # Global Tailwind styles
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
├── components/
│   ├── ui/                      # Complete shadcn/ui component library (40+ components)
│   ├── scratch-card.tsx         # Interactive scratch card component
│   ├── navigation.tsx           # Admin sidebar navigation
│   ├── theme-provider.tsx       # Theme context provider
│   ├── create-scratch-card-dialog.tsx
│   └── edit-scratch-card-dialog.tsx
├── hooks/                       # Custom React hooks
│   ├── use-mobile.tsx          # Mobile detection hook
│   └── use-toast.ts            # Toast notification hook
├── lib/
│   ├── types.ts                # TypeScript interfaces
│   ├── api.ts                  # API utilities
│   ├── utils.ts                # Utility functions (cn helper)
│   └── prize-selection.ts      # Prize logic
├── public/                     # Static assets
│   ├── placeholder-logo.png
│   ├── placeholder-logo.svg
│   ├── placeholder-user.jpg
│   ├── placeholder.jpg
│   └── placeholder.svg
└── styles/
    └── globals.css             # Additional global styles
```

### Key Components

- **ScratchCard**: Interactive canvas-based scratch card with touch/mouse support
- **Navigation**: Admin sidebar with Chinese text and Lucide icons  
- **Theme Provider**: Dark/light mode support with next-themes
- **Dialog Components**: Create and edit scratch card dialogs
- **UI Library**: Complete shadcn/ui component library (40+ components) including:
  - Forms, dialogs, tables, charts, navigation
  - Accordion, alert, avatar, badge, breadcrumb
  - Button, calendar, card, carousel, checkbox
  - Command palette, context menu, dropdown
  - Input, label, popover, progress, select
  - Sheet, skeleton, slider, switch, tabs
  - Toast notifications with Sonner integration

### State Management & Data Flow

- Uses React state and client-side components ('use client')
- API calls handled through lib/api.ts
- Type definitions centralized in lib/types.ts
- Form validation with Zod schemas

### Styling Approach

- Tailwind CSS 3.4.17 with CSS custom properties for theming
- Dark mode support via next-themes with theme provider configured
- Responsive design with mobile-first approach
- Chinese language support with appropriate fonts
- CSS-in-JS approach using CSS variables for dynamic theming
- Tailwind animations and custom utilities via tailwindcss-animate

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
