# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
RUN npm install -g pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod=false

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm

# ============ TAMBAHKAN INI ============
ARG NEXT_PUBLIC_API_BASE_URL
# ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL='/api-server/test-sharing-vision-golang/api/v1'
# =======================================

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build dengan ENV yang sudah di-set
RUN pnpm build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
RUN npm install -g pnpm && apk add --no-cache wget

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

ARG PORT=3000
ENV PORT=${PORT}
EXPOSE ${PORT}
ENV HOSTNAME="0.0.0.0"

CMD ["sh", "-c", "pnpm start --port=${PORT}"]