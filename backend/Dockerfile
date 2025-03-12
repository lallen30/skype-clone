FROM node:20-alpine as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Build the app
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built files from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/uploads ./uploads

# Create .env file from .env.example if not exists
COPY .env.example .env

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "dist/server.js"]
