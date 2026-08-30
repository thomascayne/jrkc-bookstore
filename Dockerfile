FROM node:24-bookworm-slim AS dependencies

ENV NEXT_TELEMETRY_DISABLED=1 \
    NPM_CONFIG_AUDIT=false \
    NPM_CONFIG_FETCH_RETRIES=5 \
    NPM_CONFIG_FETCH_RETRY_FACTOR=2 \
    NPM_CONFIG_FETCH_RETRY_MAXTIMEOUT=120000 \
    NPM_CONFIG_FETCH_RETRY_MINTIMEOUT=5000 \
    NPM_CONFIG_FETCH_TIMEOUT=600000 \
    NPM_CONFIG_FUND=false
WORKDIR /app

COPY package.json package-lock.json ./
RUN set -eu; \
    installAttempt=1; \
    maximumAttempts=3; \
    while ! npm ci --no-audit --no-fund; do \
      if [ "$installAttempt" -ge "$maximumAttempts" ]; then \
        echo "npm ci failed after ${maximumAttempts} attempts." >&2; \
        exit 1; \
      fi; \
      npm cache clean --force; \
      installAttempt=$((installAttempt + 1)); \
      retryDelaySeconds=$((installAttempt * 5)); \
      echo "npm ci failed; retrying attempt ${installAttempt}/${maximumAttempts} in ${retryDelaySeconds} seconds." >&2; \
      sleep "$retryDelaySeconds"; \
    done

FROM dependencies AS migration

WORKDIR /app

COPY drizzle ./drizzle
COPY scripts/migrate-database.mjs ./scripts/migrate-database.mjs

CMD ["node", "scripts/migrate-database.mjs"]

FROM node:24-bookworm-slim AS builder

ARG NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY
ARG NEXT_PUBLIC_GOOGLE_BOOKS_API_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

ENV NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY=${NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY}
ENV NEXT_PUBLIC_GOOGLE_BOOKS_API_URL=${NEXT_PUBLIC_GOOGLE_BOOKS_API_URL}
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM node:24-bookworm-slim AS runner

ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV PORT=3100

WORKDIR /app

RUN groupadd --system --gid 1001 nodejs \
    && useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3100

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3100/api/health').then((response) => { if (!response.ok) process.exit(1); }).catch(() => process.exit(1));"]

CMD ["node", "server.js"]
