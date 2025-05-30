# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# 1. First copy ONLY package files (for optimal caching)
COPY package*.json ./


# 3. Copy ALL other project files (including tsconfig.json)
COPY . .

# 4. Build the application (now all files are available)
RUN npm run build

RUN npm install -g serve

# Expose port 1002
EXPOSE 1002

# Start the application
CMD ["npm", "run", "dev"]