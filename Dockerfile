FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production

# Copy server code
COPY server ./server

# In Cloud Run, use Workload Identity or Secret Manager. Do NOT copy service account JSON into the image.
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "server/index.js"]
