# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy manifests from app folder
COPY app/package*.json ./
RUN npm ci --only=production --no-audit --no-fund

# Copy source code
COPY app/. .
RUN npm run build || echo "No build step; skipping"

# Runtime stage
FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
COPY --from=build /app /app
USER 10001:10001
ENV NODE_ENV=production
EXPOSE 3000
CMD ["server.js"]