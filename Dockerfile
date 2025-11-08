# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml* tsconfig.json tsconfig.build.json nest-cli.json ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY src ./src
COPY proto ./proto
COPY config ./config
COPY tests ./tests
RUN pnpm build

FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/config ./config
EXPOSE 3000
CMD ["node", "dist/main.js"]
