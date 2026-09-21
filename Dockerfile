# ---- deps ------------------------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

# ---- build -----------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# The Prisma client is generated code; it has to exist before next build.
RUN pnpm exec prisma generate

# next build needs these set, but never reads their values — the real ones are
# supplied at runtime. NEXT_PUBLIC_* is the exception: it is inlined into the
# client bundle here, and empty means "use this app's own /api/graphql".
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"
ENV JWT_SECRET="build-only"
ENV NEXT_PUBLIC_HANDAN_API=""
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# ---- migrator --------------------------------------------------------------
# Runs migrations, then exits. Kept as its own stage because the Prisma CLI needs
# the full dependency tree, which the lean runtime image deliberately does not
# carry. Compose runs this to completion before starting the app.
FROM build AS migrator
ENV NODE_ENV=production
CMD ["pnpm", "exec", "prisma", "migrate", "deploy"]

# ---- runtime ---------------------------------------------------------------
# Next's standalone output bundles the server and only the code it imports.
# Prisma 7 talks to Postgres through the pg driver adapter, so there is no native
# query engine to ship here.
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
