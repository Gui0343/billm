# Build stage
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage
FROM node:18-alpine
WORKDIR /app

RUN npm i -g serve
COPY --from=build /app/dist/spa ./dist/spa

EXPOSE 8080
CMD ["serve", "-s", "dist/spa", "-l", "8080"]