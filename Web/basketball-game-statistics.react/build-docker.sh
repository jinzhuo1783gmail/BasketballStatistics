#!/bin/bash

# Basketball Game Statistics React App - Docker Build Script
# Usage: ./build-docker.sh [development|production]

ENVIRONMENT=${1:-production}
IMAGE_NAME="basketball.statistic.web"

echo "Building Docker image for $ENVIRONMENT environment..."

case $ENVIRONMENT in
  "development"|"dev")
    echo "Building development image..."
    docker build \
      --build-arg NODE_ENV=development \
      --build-arg REACT_APP_API_GAME=http://matrixthoughts.ddns.net:1001/ \
      --build-arg REACT_APP_AUTH_API=https://intensivecredentialdev.azurewebsites.net/ \
      -t ${IMAGE_NAME}:dev \
      .
    
    echo "Development image built successfully!"
    echo "Run with: docker run -p 1002:1002 ${IMAGE_NAME}:dev"
    echo "Or use: docker-compose up basketball-stats-dev"
    ;;
    
  "production"|"prod")
    echo "Building production image..."
    docker build \
      --build-arg NODE_ENV=production \
      --build-arg REACT_APP_API_GAME=http://matrixthoughts.ddns.net:2001/ \
      --build-arg REACT_APP_AUTH_API=https://intensivecredentialprod.azurewebsites.net/ \
      -t ${IMAGE_NAME}:prod \
      .
    
    echo "Production image built successfully!"
    echo "Run with: docker run -p 3000:3000 ${IMAGE_NAME}:prod"
    echo "Or use: docker-compose up basketball-stats-prod"
    ;;
    
  *)
    echo "Invalid environment. Use 'development' or 'production'"
    echo "Usage: $0 [development|production]"
    exit 1
    ;;
esac

echo "Build completed!" 