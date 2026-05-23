# B2B Trade Platform

B2B international trade platform for Vietnam → USA flows: product catalog, purchase orders, real-time messaging, container simulation, export documents, and landed cost breakdown.

## Architecture

| Layer | Tech |
|-------|------|
| Web | Next.js 15, React 19, NextAuth, shadcn/ui, Tailwind CSS 4 |
| API | Express, Socket.io, JWT auth, Puppeteer PDFs |
| Database | PostgreSQL 15, Prisma |
| Cache / WS | Redis 7 |
| Storage | MinIO (S3-compatible) |

Monorepo workspaces: `apps/api`, `apps/web`, `packages/db`, `packages/shared`.

## Quick Start (Docker — full stack)

```bash
npm install                    # copies .env.example → .env if missing
docker compose up --build      # postgres, redis, minio, api, web
npm run db:migrate             # first time only (from host)
npm run db:seed                # optional demo data
```

- Web: http://localhost:3000
- API: http://localhost:3001/health
- MinIO console: http://localhost:9001

## Hybrid Dev (infra in Docker, apps on host)

```bash
docker compose up postgres redis minio minio-init
# .env.example already uses localhost URLs for hybrid dev
npm run db:generate && npm run db:migrate && npm run db:seed
npm run dev                    # API :3001 + Web :3000
```

## GitHub Codespaces (free cloud dev)

No local Docker Desktop required. Open the repo on GitHub → **Code** → **Codespaces** → **Create codespace on main**.

Setup runs automatically (infra, migrate, seed). Then:

```bash
npm run dev
```

Set ports **3000** (web) and **3001** (API) to **Public** in the Ports tab. See [`.devcontainer/README.md`](.devcontainer/README.md) for details.

Stop the Codespace when done to save free core-hours (~120/month on GitHub Free).

## Demo Accounts (after seed)

| Email | Password | Role |
|-------|----------|------|
| admin@b2b.local | password123 | admin |
| seller@b2b.local | password123 | seller |
| buyer@b2b.local | password123 | buyer |
| tamlongcraft@gmail.com | password123 | seller (Tam Long Craft) |

## Admin Bootstrap

Admin accounts cannot self-register. Either run `npm run db:seed` or create manually:

```sql
-- password hash is bcrypt of 'password123' at 10 rounds (run seed instead for convenience)
INSERT INTO users (id, email, password_hash, role, company_name, is_active)
VALUES (gen_random_uuid(), 'admin@b2b.local', '<hash>', 'admin', 'B2B Admin', true);
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API + web in watch mode |
| `npm run build` | Build all workspaces |
| `npm run typecheck` | TypeScript check all packages |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (packages/shared) |
| `npm run test:api` | API integration tests (requires running API) |
| `npm run test:uat` | UAT journey tests (requires running API) |
| `npm run test:all` | Unit + API + UAT |
| `npm run db:generate` | Prisma client generate |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:studio` | Prisma Studio |

## Environment

Copy `.env.example` to `.env`. Key variables:

- `DATABASE_URL` — PostgreSQL connection string
- `API_JWT_SECRET` — JWT signing for API + WebSocket
- `AUTH_SECRET` / `AUTH_NEXTAUTH_SECRET` — NextAuth session encryption
- `NEXT_PUBLIC_API_URL` — Browser → API (localhost:3001)
- `API_URL` — Server components → API (Docker: `http://api:3001`)

Docker Compose overrides `DATABASE_URL`, `REDIS_URL`, `S3_ENDPOINT` to use internal service hostnames.

## Testing

Integration tests require the API running:

```bash
docker compose up postgres redis minio minio-init api
npm run db:migrate
npm run test:api
npm run test:uat
```

Or run the full stack and execute `npm run test:all`.
