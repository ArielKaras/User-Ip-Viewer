FROM node:20-alpine

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -S app && adduser -S app -G app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Change ownership to non-root user
RUN chown -R app:app /app

# Switch to non-root user
USER app

EXPOSE 3001
CMD [ "node", "server.js" ]
