FROM node:20-alpine

WORKDIR /app

# Install simple static server
RUN npm install -g http-server

# Copy dependencies
COPY package*.json ./
RUN npm install

# Copy application files
COPY . .

EXPOSE 8080

# Starts generate-env.js then boots up http-server
CMD ["npm", "start"]
