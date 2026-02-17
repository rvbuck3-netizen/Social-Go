# Social Go

## Overview

Social Go is a location-based social networking web application. Users can see nearby people on an interactive map, toggle a "Go Mode" to broadcast their location, drop geo-tagged posts/messages at specific locations, and view a feed of nearby activity. It's built as a mobile-first web app with a map-centric experience, inspired by social discovery apps. Currently in MVP stage with hardcoded user identity (no real authentication yet).

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side router)
- **State/Data Fetching**: TanStack React Query for server state management
- **UI Components**: shadcn/ui component library (New York style) built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming (light/dark mode support)
- **Mapping**: Leaflet + react-leaflet for interactive maps
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
- **Sessions**: connect-pg-simple available for session storage (not yet actively used since auth is mocked)

### Database Schema
Two tables:
1. **users** - `id` (serial PK), `username` (unique text), `is_go_mode` (boolean), `latitude` (double), `longitude` (double), `last_seen` (timestamp)
2. **posts** - `id` (serial PK), `content` (text), `latitude` (double), `longitude` (double), `author_name` (text), `created_at` (timestamp)

Schema migrations are managed via `drizzle-kit push` (push-based, not migration files).

### API Endpoints
- `GET /api/me` - Returns current user (hardcoded to user ID 1 for MVP)
- `PATCH /api/users/status` - Update user's Go Mode status and location
- `GET /api/users/nearby` - Get nearby users who have Go Mode enabled
- `GET /api/posts` - List all posts ordered by recency
- `POST /api/posts` - Create a new geo-tagged post

### Key Design Decisions
- **Shared route contracts**: The `shared/routes.ts` file defines API paths, methods, input schemas, and response schemas in one place. Both client hooks and server handlers reference these, ensuring consistency.
- **No authentication yet**: The app uses a hardcoded user (ID 1, "Alice") for the MVP. Auth infrastructure is not implemented.
- **Database seeding**: On server startup, `server/seed.ts` checks if posts exist and seeds sample data if empty.
- **Mobile-first layout**: The app uses a fixed bottom navigation bar with three tabs: Feed, Social Go (map), and Profile. The UI is optimized for mobile viewports.
- **Leaflet over Google Maps**: Uses open-source Leaflet for mapping to avoid API key requirements.

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
    hooks/       - Custom hooks (use-location, use-posts, use-toast)
    pages/       - Page components (SocialMap, Feed, Profile)
    lib/         - Utilities (queryClient, utils)
server/          - Express backend
  index.ts       - Server entry point
  routes.ts      - API route registration
  storage.ts     - Database access layer (IStorage interface + DatabaseStorage)
  seed.ts        - Database seeding
  db.ts          - Database connection setup
  vite.ts        - Vite dev middleware setup
  static.ts      - Production static file serving
shared/          - Shared code between client and server
  schema.ts      - Drizzle database schema definitions
  routes.ts      - API route contracts with Zod schemas
```

## External Dependencies

- **PostgreSQL** - Primary database, connected via `DATABASE_URL` environment variable. Required for the app to start.
- **DiceBear Avatars** - Used for generating user avatar images via `https://api.dicebear.com/7.x/avataaars/svg`
- **Leaflet Tile Servers** - Map tiles loaded from unpkg.com CDN for marker icons; actual tile provider configured in the MapContainer component
- **Google Fonts** - Outfit, Inter, DM Sans, Fira Code, Geist Mono fonts loaded from Google Fonts CDN