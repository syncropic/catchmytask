# Stage 1: Build the Next.js app
FROM node:16-alpine AS builder

# Install build tools for native modules (optional)
RUN apk add --no-cache python3 make g++

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy the rest of the app's source code to the working directory
COPY . .

# Build the Next.js app and clean up the cache
RUN npm run build && rm -rf .next/cache

# Stage 2: Create the production image
FROM node:16-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the built Next.js app from the builder stage
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json

# Copy env file (optional)
COPY .env.production /app

# Install production dependencies
RUN npm ci --only=production --legacy-peer-deps

# Expose the port that the app will listen on
EXPOSE 3000
ENV PORT 3000

# Start the app
ENTRYPOINT ["npm"]
CMD ["start"]
