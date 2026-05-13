# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: runtime ────────────────────────────────────────────────────────
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache python3

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/scripts ./scripts

EXPOSE 5000
CMD ["node", "dist/server.js"]
