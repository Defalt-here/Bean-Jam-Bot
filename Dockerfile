FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
# NOTE: using `npm install --omit=dev` here is a temporary/workaround to avoid
# build failures when package.json and package-lock.json are out of sync.
# Recommended: run `npm install` locally, commit the updated package-lock.json,
# and revert this line back to `npm ci --omit=dev` (or `npm ci --only=production`).
RUN npm install --omit=dev

# Copy server code
COPY server ./server

# In Cloud Run, use Workload Identity or Secret Manager. Do NOT copy service account JSON into the image.
ENV PORT=8080
ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "server/index.js"]
