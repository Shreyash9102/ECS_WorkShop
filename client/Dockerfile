# Build stage: Node.js 20 Alpine for building
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# Build the React app (output to dist/)
RUN npm run build

# Production stage: Nginx Alpine to serve static files
FROM nginx:1.27-alpine

# Copy built app from builder to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config for SPA (single page app)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
