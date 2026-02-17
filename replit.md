# Social Go

## Overview

Social Go is a location-based social networking web application. Users can see nearby people on an interactive map, toggle a "Go Mode" to broadcast their location, drop geo-tagged posts/messages at specific locations, and view a feed of nearby activity. It's built as a mobile-first web app with a map-centric experience, inspired by social discovery apps. Authentication is via Replit Auth (Google, GitHub, Apple, email). Profiles persist across web and future mobile app through shared API/database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State/Data Fetching**: TanStack React Query for server state management
- **UI Components**: shadcn/ui component library (New York style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming (light/dark mode support)
- **Mapping**: Leaflet + react-leaflet with Esri World Imagery satellite tiles (real terrain/buildings view)
- **Forms**: React Hook Form with Zod resolvers
- **Build**: Vite for dev server and production builds
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript, executed via tsx
- **API Pattern**: REST endpoints defined in `shared/routes.ts` with Zod schemas for input validation and response typing. The shared route definitions ensure type safety between client and server.
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Database**: PostgreSQL (required via `DATABASE_URL` environment variable)
- **Schema**: Defined in `shared/schema.ts` using Drizzle's `pgTable` definitions. Uses `drizzle-zod` for generating Zod schemas from table definitions.
- **Authentication**: Replit Auth (OIDC) with session management via connect-pg-simple
- **Sessions**: express-session with PostgreSQL session store

### Database Schema
Public schema tables:
1. **users** - Replit Auth managed table (`id` varchar PK from OIDC `sub` claim, `username`, `email`, `first_name`, `last_name`, `profile_image_url`, `created_at`, `updated_at`)
2. **profiles** - Social Go profile data (`id` serial PK, `user_id` varchar FK to users, `username`, `bio`, social links, `is_go_mode`, `latitude`, `longitude`, `coins`, `stripe_customer_id`, `stripe_subscription_id`, `subscription_tier`)
3. **posts** - `id` (serial PK), `content` (text), `latitude` (double), `longitude` (double), `author_name` (text), `created_at` (timestamp)

Profile fields include: `is_founding_member` (boolean, marks pre-launch users), `age_verified` (boolean, 18+ confirmation gate), `is_boosted` (boolean, paid visibility boost), `boost_expires_at` (timestamp), `coins` (integer), `stripe_customer_id`, `stripe_subscription_id`, `subscription_tier`.

Stripe schema (managed by `stripe-replit-sync`, DO NOT manually create or modify):
- `stripe.products`, `stripe.prices`, `stripe.customers`, `stripe.subscriptions`, etc.
- Synced automatically via webhooks and `syncBackfill()` on startup.

Schema migrations are managed via `drizzle-kit push` (push-based, not migration files).

### API Endpoints
All API routes require authentication (except `/api/auth/*` and `/api/logout`).
- `GET /api/auth/user` - Returns current authenticated user (from session)
- `GET /api/me` - Returns current user's Social Go profile (auto-creates on first login)
- `PATCH /api/users/status` - Update user's Go Mode status, location, and profile fields
- `GET /api/users/nearby` - Get nearby users who have Go Mode enabled
- `GET /api/posts` - List all posts ordered by recency
- `POST /api/posts` - Create a new geo-tagged post
- `POST /api/users/block` - Block a user
- `POST /api/users/report` - Report a user
- `GET /api/logout` - Log out and destroy session
- `GET /api/stripe/publishable-key` - Get Stripe publishable key for frontend
- `GET /api/stripe/products` - List all active products with prices from Stripe
- `POST /api/stripe/checkout` - Create Stripe Checkout session (requires priceId, mode)
- `POST /api/stripe/portal` - Create Stripe Customer Portal session for billing management
- `GET /api/stripe/subscription` - Get current user's active subscription info
- `POST /api/verify-age` - Confirm age verification (18+) for new users

### Key Design Decisions
- **Shared route contracts**: The `shared/routes.ts` file defines API paths, methods, input schemas, and response schemas in one place. Both client hooks and server handlers reference these, ensuring consistency.
- **Authentication**: Replit Auth (OIDC) with Google/GitHub/Apple/email providers. Profiles auto-created on first login using claims data.
- **Database seeding**: On server startup, `server/seed.ts` checks if posts exist and seeds sample data if empty.
- **Mobile-first layout**: The app uses a fixed bottom navigation bar with five tabs: Explore (map), Feed, Profile, Shop, Settings. UI is optimized for mobile viewports.
- **Leaflet over Google Maps**: Uses open-source Leaflet for mapping to avoid API key requirements.
- **Safety features**: Location fuzzing (~300m offset), auto-expiring Go Mode (2 hours), blocking/reporting.

### Build Process
- **Development**: `npm run dev` runs the Express server with Vite middleware for HMR
- **Production build**: `npm run build` runs a custom script (`script/build.ts`) that builds the client with Vite and bundles the server with esbuild. Select dependencies are bundled to reduce cold start times.
- **Production start**: `npm start` serves the built app from `dist/`

### Project Structure
```
client/          - React frontend
  src/
    components/  - Reusable components (Map, PostFeed, CreatePostDialog)
    components/ui/ - shadcn/ui component library
    hooks/       - Custom hooks (use-location, use-posts, use-toast, use-auth)
    pages/       - Page components (SocialMap, Feed, Profile, Shop, AppSettings, Landing, UserProfile)
    lib/         - Utilities (queryClient, utils)
server/          - Express backend
  index.ts       - Server entry point (includes Stripe init + webhook route)
  routes.ts      - API route registration
  storage.ts     - Database access layer (IStorage interface + DatabaseStorage)
  stripeClient.ts - Stripe SDK client with Replit connection credentials
  webhookHandlers.ts - Stripe webhook processing via stripe-replit-sync
  seed-stripe-products.ts - Script to seed Stripe products (run manually)
  seed.ts        - Database seeding
  db.ts          - Database connection setup
  vite.ts        - Vite dev middleware setup
  static.ts      - Production static file serving
  replit_integrations/ - Auth integration (Replit OIDC)
shared/          - Shared code between client and server
  schema.ts      - Drizzle database schema definitions
  routes.ts      - API route contracts with Zod schemas
```

## External Dependencies

- **PostgreSQL** - Primary database, connected via `DATABASE_URL` environment variable. Required for the app to start.
- **DiceBear Avatars** - Used for generating user avatar images via `https://api.dicebear.com/7.x/avataaars/svg`
- **Leaflet Tile Servers** - Map tiles loaded from unpkg.com CDN for marker icons; actual tile provider configured in the MapContainer component
- **Google Fonts** - Outfit, Inter, DM Sans, Fira Code, Geist Mono fonts loaded from Google Fonts CDN