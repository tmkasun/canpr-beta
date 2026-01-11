# Maple Metrics

[![Deploy to Cloudflare][cloudflarebutton]]

Maple Metrics is a full-stack web application built on Cloudflare Workers, featuring a modern React frontend with shadcn/ui components and a robust backend powered by Hono and Durable Objects. This demo showcases multi-entity management (users, chat boards, messages) with indexed listings, pagination, CRUD operations, and real-time storage using a single shared Global Durable Object.

## Features

- **Full-Stack Architecture**: React + Vite frontend, Hono API on Workers, Durable Objects for stateful entities.
- **Entity Management**: Indexed Durable Object entities for Users and ChatBoards with automatic indexing, listing, and pagination.
- **Real-Time Chat**: Per-chat message storage and retrieval.
- **Modern UI**: shadcn/ui components, Tailwind CSS, dark mode, responsive design.
- **Type-Safe**: Shared types between frontend and backend, full TypeScript support.
- **Production-Ready**: Error handling, CORS, logging, TanStack Query for data fetching.
- **Hot Reload**: Vite dev server with Workers integration.
- **Easy Deployment**: One-command deploy to Cloudflare Workers.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, shadcn/ui, Lucide React, TanStack Query, React Router, Sonner, Framer Motion.
- **Backend**: Cloudflare Workers, Hono, Durable Objects, TypeScript.
- **State Management**: Durable Objects with CAS (Compare-And-Swap) for concurrency, IndexedEntity for listings.
- **Build Tools**: Bun, Wrangler, Cloudflare Vite Plugin.
- **UI/UX**: Responsive design, themes, animations, sidebar layout.

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) (recommended package manager)
- [Cloudflare Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install/)
- Node.js (for some dev tools)

### Installation

1. Clone the repository.
2. Install dependencies:

   ```bash
   bun install
   ```

3. Generate Worker types (if needed):

   ```bash
   bun run cf-typegen
   ```

### Local Development

1. Start the development server:

   ```bash
   bun run dev
   ```

   The app will be available at `http://localhost:3000` (or `$PORT`).

2. In a separate terminal, you can deploy a preview:

   ```bash
   bun run deploy
   ```

The frontend proxies API calls to the Worker. Edit `src/pages/HomePage.tsx` for your app logic, and add routes in `worker/user-routes.ts` using the entity system in `worker/entities.ts`.

## Usage

### Frontend Development

- Replace `src/pages/HomePage.tsx` with your app.
- Use `api` helper from `@/lib/api-client.ts` for type-safe API calls.
- Leverage TanStack Query for caching and mutations.
- shadcn/ui components are pre-installed in `src/components/ui/`.

### Backend API (Hono + Durable Objects)

All routes under `/api/*`. Key endpoints:

- **Users**: `GET/POST /api/users` (list/create), `DELETE /api/users/:id`
- **Chats**: `GET/POST /api/chats` (list/create), `DELETE /api/chats/:id`
- **Messages**: `GET/POST /api/chats/:chatId/messages` (list/send)
- Supports `?cursor` and `?limit` for pagination.

Extend entities in `worker/entities.ts` (extends `IndexedEntity`), add routes in `worker/user-routes.ts`.

Example frontend query:

```tsx
import { api } from '@/lib/api-client';
import type { User } from '@shared/types';

const users = api<User[]>('/api/users');
```

### Seeding

Mock data auto-seeds on first API call via `ensureSeed()`.

## Deployment

Deploy to Cloudflare Workers with assets (SPA hosting):

```bash
bun run deploy
```

Or use the button:

[cloudflarebutton]

**Configure your Worker:**

1. Run `wrangler secret put YOUR_SECRET` for env vars.
2. Update `wrangler.jsonc` for custom domains/bindings.
3. `wrangler tail` for logs.

Built-in SPA asset handling routes `/*` to `dist/index.html` (except `/api/*`).

## Project Structure

```
├── shared/          # Shared types and mock data
├── src/             # React frontend (Vite)
│   ├── components/  # shadcn/ui + custom
│   ├── hooks/       # Custom hooks
│   └── pages/       # Router pages
├── worker/          # Cloudflare Worker backend
│   ├── core-utils.ts # DO entity base classes
│   ├── entities.ts  # Your entities (UserEntity, etc.)
│   └── user-routes.ts # Add routes here
├── wrangler.jsonc   # Worker config
└── package.json     # Bun scripts
```

## Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start Vite dev server |
| `bun run build` | Build for production |
| `bun run preview` | Preview production build |
| `bun run deploy` | Build + deploy to Workers |
| `bun run lint` | Lint code |

## Contributing

1. Fork and create a PR.
2. Follow TypeScript/best practices.
3. Do not modify `worker/index.ts` or `worker/core-utils.ts` (core infra).
4. Test thoroughly.

## License

MIT. See [LICENSE](LICENSE) for details.