# This dockerfile should run in the monorepo root context to work properly

FROM oven/bun

WORKDIR /app

COPY package.json bun.lock ./
COPY backend/package.json backend/
COPY frontend/package.json frontend/
COPY shared-types/package.json shared-types/

RUN bun install --production --frozen-lockfile

COPY backend/src backend/src

WORKDIR /app/backend

ENV NODE_ENV=production
CMD ["bun", "src/index.ts"]

EXPOSE 3001