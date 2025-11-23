# Stage 1: Builder
# This stage installs dependencies, and builds the Nuxt application.
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build
RUN ls -la .output/server

# Stage 2: Runner
# This stage creates the final, lean image for production.
FROM node:20-alpine
WORKDIR /app

# Copy the built output from the builder stage
COPY --from=builder /app/.output ./.output

# Copy node_modules and package.json
# Nuxt needs this to run the server in production
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables for production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# The command to start the app
# This runs the built-in Node.js server that Nuxt provides.
CMD ["node", ".output/server/index.mjs"]
