FROM node:20-alpine AS builder
WORKDIR /app

# Copy root workspace configs and manifests for caching
COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY apps/api/package*.json ./apps/api/
COPY apps/api/prisma ./apps/api/prisma

# Install dependencies and generate prisma
RUN npm ci
RUN npm run prisma:generate --workspace=@cosmetics/api

# Copy API source code after dependencies are installed
COPY apps/api ./apps/api

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/tsconfig.base.json ./
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/api ./apps/api

EXPOSE 4000
CMD ["npm", "run", "start", "--workspace=@cosmetics/api"]
