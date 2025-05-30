#!/bin/bash

# Script to update all components (except Login.js) to use REACT_APP_API_GAME

echo "Updating components to use REACT_APP_API_GAME..."

# List of files to update (excluding Login.js which uses REACT_APP_AUTH_API)
FILES=(
  "src/Home.js"
  "src/VoiceStatisticsInput.js" 
  "src/CreateGame.js"
  "src/EditGame.js"
  "src/Admin.js"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating $file..."
    
    # Replace the getApiBaseUrl function
    sed -i.bak '/function getApiBaseUrl() {/,/}/c\
function getApiBaseUrl() {\
  return process.env.REACT_APP_API_GAME;\
}' "$file"
    
    echo "✅ Updated $file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo ""
echo "🎉 All components updated!"
echo ""
echo "Manual updates needed:"
echo "1. Copy environment files:"
echo "   cp env.development .env.development"
echo "   cp env.production .env.production"
echo ""
echo "2. Components now use:"
echo "   - REACT_APP_API_GAME (for game API endpoints)"
echo "   - REACT_APP_AUTH_API (for authentication - Login.js only)" 