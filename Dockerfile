# Stage 1 — build
FROM node:18-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

# If you use pnpm or yarn change accordingly
COPY package*.json ./
# If you have package-lock.json or pnpm-lock, copy that too
RUN npm ci --production=false

COPY . .
RUN npm run build

# Stage 2 — runtime
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# if using next.js image-specific env
ENV PORT=3000

# copy only needed files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# include Prisma client if you generate it
# If you need to regenerate prisma client on container start, handle that in entrypoint.

EXPOSE 3000

# default command for production Next.js
CMD ["node_modules/.bin/next", "start", "-p", "3000"]
