# # Stage 1: Build the Next.js app
# FROM node:alpine AS builder

# # Set the working directory inside the container
# WORKDIR /app

# # Copy package.json and package-lock.json to the working directory
# COPY package.json package-lock.json ./

# # Install dependencies
# RUN npm install --legacy-peer-deps

# # Copy the rest of the app's source code to the working directory
# COPY . .

# # Build the Next.js app
# RUN npm run build

# # Remove the .next/cache folder
# RUN rm -rf .next/cache

# Stage 2: Create the production image
FROM node:alpine

# # Set the working directory inside the container
WORKDIR /app

# # Copy the built Next.js app from the builder stage
# COPY --from=builder /app/.next /app/.next
# COPY --from=builder /app/public /app/public
# COPY --from=builder /app/package.json /app
# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Copy env file
COPY .env.production /app

# Install production dependencies
RUN npm install --production --legacy-peer-deps

# Expose the port that the app will listen on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
