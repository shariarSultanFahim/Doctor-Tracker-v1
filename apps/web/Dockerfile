FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
COPY package*.json ./
COPY packages ./packages
COPY apps/web ./apps/web
RUN npm install --legacy-peer-deps
RUN npm run build --workspace=@doctor-tracker/web

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/package.json ./package.json
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000
CMD ["npm", "start"]
