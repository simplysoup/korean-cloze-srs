# Prisma 7 — Key Changes & Reference

> Based on official Prisma v7 documentation as of Feb 2026.

---

## 1. Generator: `prisma-client` (replaces `prisma-client-js`)

`prisma-client-js` is **deprecated**. The new default generator is `prisma-client`.

```prisma
generator client {
  provider = "prisma-client"            # required
  output   = "../src/generated/prisma"  # required — no longer generates into node_modules
}
```

### Key differences from `prisma-client-js`

| | `prisma-client-js` (deprecated) | `prisma-client` (v7 default) |
|---|---|---|
| Output location | `node_modules/.prisma/client` | Custom path via `output` (required) |
| Import path | `from '@prisma/client'` | `from './generated/prisma/client'` |
| `.env` loading | Auto at runtime | Manual (`dotenv/config`) or Bun (auto) |
| Module format | CJS only | ESM or CJS via `moduleFormat` |
| `Prisma.validator` | Available | **Removed** — use `satisfies` |
| Generated structure | Single barrel file | Split into `client.ts`, `browser.ts`, `models.ts`, `enums.ts` |

### Optional generator fields

| Field | Default | Notes |
|-------|---------|-------|
| `runtime` | `nodejs` | `nodejs`, `deno`, `bun`, `workerd`, `vercel-edge`, `react-native` |
| `moduleFormat` | Inferred | `esm` or `cjs` |
| `generatedFileExtension` | `ts` | `ts`, `mts`, `cts` |
| `importFileExtension` | Inferred | `ts`, `js`, `mjs`, etc. |

### Import entry points

| File | Use case |
|------|----------|
| `client.ts` | Server code — `PrismaClient` + all types |
| `browser.ts` | Frontend — types only, no `PrismaClient` |
| `models.ts` | All model types (backend + frontend) |
| `enums.ts` | Enum types only (slim, tree-shakeable) |
| `models/<Name>.ts` | Per-model types |

---

## 2. Datasource Block (schema)

In Prisma 7, the schema `datasource` block **only declares the provider**. The connection URL is configured in `prisma.config.ts`.

```prisma
datasource db {
  provider = "postgresql"
  // No url here — configured in prisma.config.ts
}
```

---

## 3. `prisma.config.ts` — Central CLI Configuration

Lives at the **project root** (next to `package.json`). Auto-detected by the CLI.

```ts
import 'dotenv/config';                    // needed for Node.js; Bun auto-loads .env
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
    seed: 'tsx prisma/seed.ts',            // replaces package.json "prisma.seed"
  },
  datasource: {
    url: env('DATABASE_URL'),              // type-safe; throws if missing
  },
});
```

### Import source

- `defineConfig` and `env` come from **`"prisma/config"`** (NOT `"@prisma/internals"`)
- `PrismaConfig` type from **`"prisma"`**

### `env()` vs `process.env`

| | `env('VAR')` | `process.env.VAR` |
|---|---|---|
| Throws if missing | Yes | No |
| Use when | URL must exist | Optional / CI where only `generate` runs |

### Config options reference

| Option | Required | Default | Notes |
|--------|----------|---------|-------|
| `schema` | No | `./prisma/schema.prisma` | File or folder (for multi-file schemas) |
| `migrations.path` | No | — | Where migration files are stored |
| `migrations.seed` | No | — | Replaces `prisma.seed` from `package.json` |
| `datasource.url` | Yes | — | Connection string |
| `datasource.shadowDatabaseUrl` | No | — | For cloud-hosted shadow DBs |

### Removed options in v7

- `datasource.directUrl` — use `url` instead
- `adapter` — driver adapters work automatically
- `engine` — removed
- `studio` — Studio now reads from `datasource` automatically

---

## 4. Driver Adapters (Required in v7)

Prisma 7 **requires a driver adapter** to connect to the database. The built-in engine approach is gone.

### PostgreSQL setup

```ts
import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
```

### Available adapters

| Database | Adapter package | Driver |
|----------|----------------|--------|
| PostgreSQL | `@prisma/adapter-pg` | `pg` |
| MySQL/MariaDB | `@prisma/adapter-mariadb` | `mariadb` |
| SQLite | `@prisma/adapter-better-sqlite3` | `better-sqlite3` |
| SQLite (Turso) | `@prisma/adapter-libsql` | `libSQL` |
| SQL Server | `@prisma/adapter-mssql` | `node-mssql` |
| Neon (serverless) | `@prisma/adapter-neon` | Neon serverless |
| PlanetScale | `@prisma/adapter-planetscale` | PlanetScale serverless |
| Cloudflare D1 | `@prisma/adapter-d1` | D1 |

---

## 5. PrismaClient Singleton (Hot Reload Safe)

For frameworks with HMR (SvelteKit, Next.js, etc.):

```ts
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

function makeClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || makeClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

## 6. Bun-Specific Notes

- Bun **auto-loads `.env`** — no `import 'dotenv/config'` needed
- CLI must use `bunx --bun prisma ...` (the `--bun` flag ensures Bun runtime; without it, Prisma falls back to Node.js due to `#!/usr/bin/env node` shebang)
- Seed command example: `bun prisma/seed.ts`

---

## 7. CLI Commands Quick Reference

```bash
bunx --bun prisma generate          # Generate client into output dir
bunx --bun prisma validate          # Validate schema
bunx --bun prisma migrate dev       # Create & apply migration (dev)
bunx --bun prisma migrate deploy    # Apply migrations (production)
bunx --bun prisma migrate reset     # Reset DB + reapply migrations
bunx --bun prisma db seed           # Run seed (uses migrations.seed from config)
bunx --bun prisma db push           # Push schema without migration files
bunx --bun prisma db pull           # Introspect existing DB into schema
bunx --bun prisma studio            # Launch data browser
bunx --bun prisma format            # Auto-format schema files
```

---

## 8. Schema Syntax (Unchanged)

The Prisma Schema Language (PSL) itself is unchanged in v7. All model attributes, relations, `@@map`, `@map`, `@default`, `@unique`, `Json`, `String[]`, etc. work the same.

```prisma
model Example {
  id        String   @id @default(cuid())
  name      String
  tags      String[]
  data      Json
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt      @map("updated_at")

  @@map("examples")
}
```
