FROM node:20-alpine AS base

FROM base AS builder
WORKDIR /app
COPY package*.json ./
COPY packages ./packages
COPY apps/api ./apps/api
RUN npm install
RUN npm run build --workspace=@doctor-tracker/api

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 4000
CMD ["npm", "start"]
