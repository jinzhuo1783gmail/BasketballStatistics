#!/bin/bash

# Basketball Game Statistics - Deployment Script
# Usage: ./deploy.sh [dev|prod] [optional-tag]

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IMAGE_NAME="basketball-stats"
CONTAINER_NAME="basketball-stats"

# Environment configurations
DEV_API_GAME="http://matrixthoughts.ddns.net:1001/"
DEV_AUTH_API="https://intensivecredentialdev.azurewebsites.net/"

PROD_API_GAME="http://matrixthoughts.ddns.net:2001/"
PROD_AUTH_API="https://intensivecredentialprod.azurewebsites.net/"

# Parse arguments
ENVIRONMENT=${1:-prod}
TAG=${2:-latest}

echo "🚀 Basketball Game Statistics - Deployment"
echo "Environment: $ENVIRONMENT"
echo "Tag: $TAG"
echo "==========================================="

case $ENVIRONMENT in
  "dev"|"development")
    echo "🔧 Building DEVELOPMENT image..."
    
    docker build \
      --build-arg NODE_ENV=development \
      --build-arg REACT_APP_API_GAME="$DEV_API_GAME" \
      --build-arg REACT_APP_AUTH_API="$DEV_AUTH_API" \
      -t "${IMAGE_NAME}:dev-${TAG}" \
      .
    
    echo "✅ Development build complete!"
    echo ""
    echo "🏃 To run:"
    echo "docker run -p 1002:1002 --name ${CONTAINER_NAME}-dev ${IMAGE_NAME}:dev-${TAG}"
    echo ""
    echo "📊 API Endpoints:"
    echo "  Game API: $DEV_API_GAME"
    echo "  Auth API: $DEV_AUTH_API"
    ;;
    
  "prod"|"production")
    echo "🏭 Building PRODUCTION image..."
    
    docker build \
      --build-arg NODE_ENV=production \
      --build-arg REACT_APP_API_GAME="$PROD_API_GAME" \
      --build-arg REACT_APP_AUTH_API="$PROD_AUTH_API" \
      -t "${IMAGE_NAME}:prod-${TAG}" \
      -t "${IMAGE_NAME}:latest" \
      .
    
    echo "✅ Production build complete!"
    echo ""
    echo "🏃 To run:"
    echo "docker run -p 1002:1002 --name ${CONTAINER_NAME}-prod ${IMAGE_NAME}:prod-${TAG}"
    echo ""
    echo "📊 API Endpoints:"
    echo "  Game API: $PROD_API_GAME"
    echo "  Auth API: $PROD_AUTH_API"
    ;;
    
  *)
    echo "❌ Invalid environment. Use 'dev' or 'prod'"
    echo "Usage: $0 [dev|prod] [optional-tag]"
    exit 1
    ;;
esac

echo ""
echo "🐳 Available commands:"
echo "  View images: docker images | grep basketball-stats"
echo "  Stop running: docker stop ${CONTAINER_NAME}-${ENVIRONMENT}"
echo "  Remove container: docker rm ${CONTAINER_NAME}-${ENVIRONMENT}"
echo "  View logs: docker logs ${CONTAINER_NAME}-${ENVIRONMENT}"
echo ""
echo "�� Deployment ready!" 