# Tarkov Directory

Monorepo for https://tarkov.directory — frontend (Next.js), backend (Elysia on Bun), and shared TypeScript types.

## How it works

Data flows through three layers. The browser never talks to tarkov.dev.

```
tarkov.dev JSON dumps (~16MB)
        │
        ▼
  Elysia backend
  (validate → map to Gun/Mod → in-memory cache)
        │
        ▼
  Next.js pages
  ("use cache" / "use cache: remote")
        │
        ▼
     Browser
```

### 1. Tarkov JSON API → backend

The backend downloads four files in parallel from [json.tarkov.dev](https://json.tarkov.dev/endpoints):

| File | Purpose |
| --- | --- |
| `/regular/items` | All items (guns, mods, slots, prices, …) |
| `/regular/items_en` | English strings for names, slots, categories |
| `/regular/traders` | Trader metadata |
| `/regular/traders_en` | English trader names |

The main items dump is language-neutral (names look like `"… Name"` placeholders). The `_en` files are dictionaries we join while mapping. Zod validates responses at the boundary; bad entries are skipped, a totally unusable dump fails hard.

### 2. Mapping → shared types

`data-mapping.ts` turns the raw dump into the `Gun` / `Mod` / `Slot` shapes in `shared-types` (what the frontend already expects): resolve English names, handbook categories, trader offers, flea prices, preset images, and filter to the weapon/mod types we care about.

`processRelevantMods` walks a gun’s slot tree so `/guns/:id/mods` returns only attachments that can appear on that gun — not the full mod catalog.

### 3. Backend cache (`tarkovDataCache`)

An in-memory Map in the Bun process (lost on restart):

- `gunData` — processed guns + category lists
- `modData` — processed mods

Refreshed on **startup**, **hourly** (prices move; dump is ~2MB gzipped), and on **cache miss**. Concurrent misses share one in-flight refresh (single-flight). Relevant mods are computed from `modData` on request, not pre-cached per gun.

HTTP API (still requires `API-Key`):

| Route | Returns |
| --- | --- |
| `GET /guns` | `{ gunsByCategory, allGuns }` |
| `GET /guns/:id/mods` | `{ gun, relevantMods }` (or 404) |

Upstream Tarkov failures surface as **503**.

### 4. Frontend → Next cache

Next talks only to the Elysia API (Eden Treaty). It never hits tarkov.dev.

- **Home** — `"use cache"` + `cacheLife("tarkovHourly")` on the page (one shared list for everyone)
- **Gun detail** — `"use cache: remote"` on `getGun(id)` so per-id results survive across serverless instances

`tarkovHourly` ≈ stale 5 minutes, revalidate/expire 1 hour. Backend cache and Next cache are **independent** (both ~hourly); they can drift slightly, which is fine for this data.

### Request walkthrough

**Home:** Next cache hit → done. Miss → `GET /guns` → backend memory (or Tarkov refresh if empty) → Next caches the page.

**Gun page:** remote cache for that id → miss → `GET /guns/:id/mods` → derive relevant mods from in-memory `modData` → Next caches the payload.

## Packages

- **Frontend** — Next.js App Router + Cache Components
- **Backend** — Elysia on Bun
- **shared-types** — `Gun` / `Mod` / etc. used by both sides

## Restoring the old GraphQL backend

The backend previously used tarkov.dev’s GraphQL API (`gql.tada` + `graphql-request`). To restore that implementation:

- Branch: `last-graphql-version`
- Tag: `last-graphql-api`

```bash
git checkout last-graphql-api
# or
git checkout last-graphql-version
```
