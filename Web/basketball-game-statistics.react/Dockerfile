# Basketball Game Statistics React App
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Accept build arguments for environment configuration
ARG NODE_ENV=production
ARG REACT_APP_API_GAME
ARG REACT_APP_AUTH_API

# Set environment variables for React build
ENV NODE_ENV=$NODE_ENV
ENV REACT_APP_API_GAME=$REACT_APP_API_GAME
ENV REACT_APP_AUTH_API=$REACT_APP_AUTH_API

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the React application
RUN npm run build

# Install serve for production serving
RUN npm install -g serve

# Expose port
EXPOSE 1002

# Start the application
CMD ["serve", "-s", "build", "-l", "1002"]