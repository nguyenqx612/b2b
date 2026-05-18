# ── Build stage ──────────────────────────────────────────────
FROM node:20-slim AS builder
WORKDIR /app

# NEXT_PUBLIC_* vars must be present at build time (baked into client bundle)
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ARG NEXT_PUBLIC_WS_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL

COPY package.json tsconfig.base.json ./
COPY scripts/ ./scripts/
COPY packages/shared/package.json ./packages/shared/
COPY packages/db/package.json ./packages/db/
COPY apps/web/package.json ./apps/web/

RUN npm install --workspaces --include-workspace-root --ignore-scripts

COPY packages/shared/ ./packages/shared/
COPY packages/db/ ./packages/db/
COPY apps/web/ ./apps/web/

RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/web

# ── Runtime stage ─────────────────────────────────────────────
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/apps/web/next.config.ts ./apps/web/

EXPOSE 3000

WORKDIR /app/apps/web
CMD ["node", "../../node_modules/.bin/next", "start"]
