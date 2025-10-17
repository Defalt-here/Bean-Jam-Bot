FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy server code
COPY server ./server

# Copy service account (will be overridden by mount in production)
# In production, mount secret as volume or use env var
COPY src/Keys/*.json ./service-account.json

# Set environment variable
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/service-account.json
ENV PORT=3001
ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "server/index.js"]
