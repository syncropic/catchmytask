# Use the official Node.js image as the base image
FROM node:alpine

# Set the working directory inside the container
WORKDIR /app
# Copy package.json and package-lock.json to the working directory
# COPY package.json package-lock.json ./
# copy dist/apps/dpwanjala-personal-site/.next to the app directory

COPY .next /app/.next
COPY public /app/public
COPY package.json /app
# copy env file
COPY .env.production /app

# Install dependencies
RUN npm install --production --legacy-peer-deps

# Copy the rest of the app's source code to the working directory
# COPY . .

# Build the Next.js app
# RUN npm run build

# Expose the port that the app will listen on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]