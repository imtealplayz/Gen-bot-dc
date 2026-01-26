# Discord Bot Dashboard

## Overview

A full-stack Discord bot monitoring application with a React dashboard frontend and Express backend. The application allows users to view real-time Discord bot status, connected guilds, and activity logs through a modern web interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and data fetching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with tsx for TypeScript execution
- **Discord Integration**: discord.js library for bot functionality
- **API Design**: RESTful endpoints defined in `shared/routes.ts` for type-safe client-server communication
- **Development**: Vite dev server with HMR integrated into Express for development mode

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains all database table definitions
- **Current Tables**: `users` (authentication) and `bot_logs` (Discord activity logging)
- **Migrations**: Drizzle Kit with output to `./migrations` directory
- **In-Memory Fallback**: `MemStorage` class provides in-memory storage when database is not available

### Build System
- **Client Build**: Vite builds to `dist/public`
- **Server Build**: esbuild bundles server code to `dist/index.cjs`
- **Module Format**: ESM for development, CJS for production server bundle

## External Dependencies

### Discord Integration
- **Library**: discord.js v14
- **Required Environment Variable**: `DISCORD_TOKEN`
- **Intents**: Guilds, GuildMessages, MessageContent
- **Features**: Bot status monitoring, message handling, activity logging

### Database
- **Type**: PostgreSQL
- **Required Environment Variable**: `DATABASE_URL`
- **Connection**: Direct connection via Drizzle ORM
- **Session Storage**: connect-pg-simple for Express sessions (available but not currently active)

### UI Framework Dependencies
- **Component Library**: shadcn/ui (new-york style)
- **Primitives**: Full Radix UI component suite
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date Handling**: date-fns

### Replit-Specific Integrations
- **Error Overlay**: @replit/vite-plugin-runtime-error-modal
- **Development Tools**: @replit/vite-plugin-cartographer, @replit/vite-plugin-dev-banner (dev only)