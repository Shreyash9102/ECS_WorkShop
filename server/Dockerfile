# Base image: Node.js 20 (LTS) on Alpine for minimal size
FROM node:20-alpine

WORKDIR /app

# Copy all files first (including entrypoint.sh)
COPY . .

# Install dependencies
RUN npm ci --only=production && \
    chmod +x /app/entrypoint.sh

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start with entrypoint script
ENTRYPOINT ["/app/entrypoint.sh"]
