FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace setup and package manifests for caching
COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY apps/web/package*.json ./apps/web/

RUN npm ci

# Copy application source code after dependencies are installed
COPY apps/web ./apps/web

ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}

RUN npm run build --workspace=@cosmetics/web && rm -rf /app/apps/web/.next/cache

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/web ./apps/web

EXPOSE 3000
CMD ["npm", "run", "start", "--workspace=@cosmetics/web"]
