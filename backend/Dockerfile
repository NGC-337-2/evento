# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies
RUN npm install --ignore-scripts

# Copy the rest of the application code
COPY . .

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Set environment variable to production
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm ci --omit=dev --ignore-scripts

# Copy source code from the builder stage
COPY --from=builder /app/src ./src

# Create a non-root user for security
RUN addgroup -g 1001 nodejs && adduser -S -u 1001 nodejs -G nodejs
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "src/server.js"]
