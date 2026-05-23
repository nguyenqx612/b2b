# GitHub Codespaces

Hybrid dev: Docker runs **Postgres, Redis, and MinIO**; API and web run on the host with `npm run dev`.

## First open

`post-create.sh` runs automatically:

1. Creates `.env` from `.env.example`
2. Sets Codespaces public URLs for NextAuth and `NEXT_PUBLIC_*`
3. `npm install`, Prisma generate, DB migrate + seed
4. Starts infra containers

## Daily use

After the Codespace starts (`post-start.sh` restarts infra):

```bash
npm run dev
```

Open the **Ports** tab and set **3000** (web) and **3001** (API) to **Public**.

| Port | Service        |
|------|----------------|
| 3000 | HarborLane web |
| 3001 | API            |
| 9001 | MinIO console  |

Demo logins (after seed): `buyer@b2b.local`, `seller@b2b.local`, `tamlongcraft@gmail.com` — password `password123`.

## Re-apply Codespaces URLs

If auth or API calls fail in the browser:

```bash
node .devcontainer/configure-env.js
npm run dev
```

## Stop billing

Stop the Codespace from github.com → **Codespaces** when you are done (free tier: ~120 core-hours/month).
