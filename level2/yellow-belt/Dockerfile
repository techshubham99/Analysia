# Multi-stage build for StellarGas.Calculator
# Deploy on Render, Railway, or any Docker host

# ---- Build Stage ----
FROM oven/bun:latest AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# ---- Serve Stage ----
FROM nginx:alpine AS serve
COPY --from=build /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
