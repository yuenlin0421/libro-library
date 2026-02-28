# Stage 1: Dependencies
FROM node:23.11.1-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
# 強制安裝 webpack 及其所有必要的輔助模組
RUN npm install --legacy-peer-deps && npm install webpack webpack-sources

# Stage 2: Builder
FROM node:23.11.1-alpine AS builder
WORKDIR /app

# 複製依賴
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# --- 🚀 關鍵：處理 Next.js 16 的環境 ---
ENV NEXT_TELEMETRY_DISABLED=1
# 嘗試關閉 Turbo (如果 v16 允許的話)
ENV NEXT_PRIVATE_LOCAL_WEBPACK=true 
# 增加記憶體限制
ENV NODE_OPTIONS="--max-old-space-size=4096"

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_REDIRECT_URI
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=$NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_PUBLIC_REDIRECT_URI=$NEXT_PUBLIC_REDIRECT_URI

# 執行正式構建
RUN npm run build

# Stage 3: Runner
FROM node:23.11.1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]