# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**lofn-react** is an NPM React component library and SDK for integrating with the Lofn ecommerce API. It provides context providers, hooks, services, and pre-built admin components for store, product, category, image, shopping cart, and store user management.

The library is consumed by applications (see `example-app/`) via `import { ... } from 'lofn-react'`.

## Commands

```bash
# Library (root)
npm run build            # tsc + vite build → dist/ (ES + CJS + types + CSS)
npm run type-check       # TypeScript check only (no emit)
npm run test             # vitest run
npm run test:watch       # vitest watch mode
npm run test:coverage    # vitest with coverage
npm run lint             # eslint (zero warnings enforced)
npm run storybook        # storybook dev on :6006

# Example App (example-app/)
cd example-app && npm run dev      # vite dev server
cd example-app && npm run build    # tsc + vite build
cd example-app && npx tsc --noEmit # type-check only
```

After changing library code, rebuild with `npm run build` before the example-app picks up changes (it references `"lofn-react": "file:.."`).

## Architecture

### Two-package structure

- **Root (`/`)** — The publishable library. Entry point: `src/index.ts`. Built with Vite in library mode to `dist/`.
- **`example-app/`** — A full Vite+React app that imports `lofn-react` via file link. Used for development and as a reference implementation.

### Layer pattern (library)

```
types/index.ts          → All TypeScript interfaces, enums, API_ENDPOINTS constant
services/*Service.ts    → API call classes (Axios for REST, GraphQLClient for queries)
contexts/*Context.tsx   → React Context providers that wrap services + expose hooks
hooks/use*.ts           → Thin re-exports of context hooks
components/             → Pre-built UI components (admin CRUD, shared utilities)
index.ts                → Public API — every export consumed by apps
```

### Provider hierarchy (required nesting order)

```
NAuthProvider (from nauth-react — provides auth token)
  └─ LofnProvider (creates shared Axios instance with auth interceptors)
       └─ StoreProvider, ProductProvider, CategoryProvider,
          ImageProvider, ShopCarProvider, StoreUserProvider
```

`LofnProvider` must be inside `NAuthProvider`. All domain providers must be inside `LofnProvider`. See `example-app/src/App.tsx` for the full nesting.

### API integration pattern

- **Mutations** (create/update/delete) use **REST** endpoints via Axios
- **Queries** (list/get) use **GraphQL** via `GraphQLClient` (public: `/graphql`, admin: `/graphql/admin`)
- Services mix both: e.g., `ProductService` has GraphQL queries and REST mutations
- `ShopCarService` is REST-only (single `POST /shopcar/insert` endpoint)
- `ShopCarContext` additionally manages local cart state in `localStorage`

### Path alias

`@/*` resolves to `./src/*` (configured in tsconfig.json and vite.config.ts). Use `@/` imports within the library source.

## Key conventions

- **Language**: UI text and comments are in Portuguese (pt-BR)
- **Styling**: Tailwind CSS with dark mode (`class` strategy). Utility `cn()` from `src/utils/cn.ts` merges classes safely
- **Components**: Use Radix UI primitives for base components (Button, Input, Label, Avatar)
- **State**: React Context only — no Redux or external state libraries
- **Types**: All types centralized in `src/types/index.ts`. Enums use numeric values matching the backend
- **Exports**: Everything consumed externally must be exported from `src/index.ts`
- **Toast notifications**: Example app uses `sonner` library
- **API docs**: `docs/API_REFERENCE.md` contains the complete backend API specification — use it as the source of truth for DTOs, endpoints, and GraphQL schemas

## Adding a new entity/feature

1. Add types to `src/types/index.ts`
2. Create `src/services/<name>Service.ts`
3. Create `src/contexts/<Name>Context.tsx` (provider + hook)
4. Create `src/hooks/use<Name>.ts` (re-export)
5. Export everything from `src/index.ts`
6. Add components to `src/components/` if needed
7. Wire up in `example-app/` (add provider to App.tsx, create pages)
