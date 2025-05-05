FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --production

# Copy source code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001
ENV API_ONLY_MODE=true

# Expose port
EXPOSE 3001

# Start the ARLO server
CMD ["node", "server.js"]