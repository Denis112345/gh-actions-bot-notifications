# --- ЭТАП 1: Сборка ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY . .

RUN npm run build

# --- ЭТАП 2: Финальный образ ---
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

COPY src/config.json ./dist/

# Запуск приложения
CMD ["node", "dist/index.js"]