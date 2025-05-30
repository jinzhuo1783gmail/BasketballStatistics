# Environment Variables Setup Guide - SIMPLIFIED! 🎉

## 🎯 New Simplified Approach

Your Basketball Game Statistics React app now uses this **much simpler** logic:

### **Game Components (Home, Games, Admin, etc.)**
```javascript
function getApiBaseUrl() {
  return process.env.REACT_APP_API_GAME;
}
```

### **Authentication Component (Login.js only)**
```javascript
function getApiBaseUrl() {
  return process.env.REACT_APP_AUTH_API;
}
```

## 📁 Environment Files Setup

### **Step 1: Copy Environment Files**
```bash
# Copy for development
cp env.development .env.development

# Copy for production  
cp env.production .env.production
```

### **Step 2: Environment Variables**

**`.env.development`**:
```bash
# Game API for development
REACT_APP_API_GAME=http://matrixthoughts.ddns.net:1001/

# Authentication API for development  
REACT_APP_AUTH_API=https://intensivecredentialdev.azurewebsites.net/
```

**`.env.production`**:
```bash
# Game API for production
REACT_APP_API_GAME=http://matrixthoughts.ddns.net:1002/

# Authentication API for production
REACT_APP_AUTH_API=https://intensivecredentialprod.azurewebsites.net/
```

## 🚀 What Changed

### **Before (Complex)**:
- Two variables: `REACT_APP_API_DEV` and `REACT_APP_API_PROD`
- Conditional logic in every component
- Had to determine environment in each file

### **After (Simple)**:
- One variable: `REACT_APP_API_GAME` (different values per environment)
- Direct usage - no conditional logic needed
- Separate `REACT_APP_AUTH_API` for authentication

## 📊 API Endpoints Used

### **Game API** (`REACT_APP_API_GAME`):
| **Endpoint** | **Used In** | **Purpose** |
|--------------|-------------|-------------|
| `api/games/1` | Home.js, Games.js, Admin.js | Get games |
| `api/games` | CreateGame.js, EditGame.js | Create/Edit games |
| `api/games/statistics/{gameId}` | Games.js | Get game statistics |
| `api/playerstatistics/game/{gameId}` | VoiceStatisticsInput.js | Get player stats |
| `api/playerstatistics` | VoiceStatisticsInput.js | Create player stats |
| `api/playerstatistics/revert` | VoiceStatisticsInput.js | Revert stats |

### **Auth API** (`REACT_APP_AUTH_API`):
| **Endpoint** | **Used In** | **Purpose** |
|--------------|-------------|-------------|
| `api/identity/token` | Login.js | Authentication |

## 🐳 Docker Usage

Docker is now **super simple** - only needs `NODE_ENV`:

```bash
# Development build
docker build --build-arg NODE_ENV=development -t basketball-stats:dev .

# Production build  
docker build --build-arg NODE_ENV=production -t basketball-stats:prod .
```

React automatically loads the right `.env` file:
- `NODE_ENV=development` → loads `.env.development`
- `NODE_ENV=production` → loads `.env.production`

## 🔧 Quick Setup Commands

```bash
# 1. Copy environment files
cp env.development .env.development
cp env.production .env.production

# 2. Update components (if not done yet)
chmod +x update-components.sh
./update-components.sh

# 3. Build for development
docker-compose up basketball-stats-dev

# 4. Build for production
docker-compose up basketball-stats-prod
```

## ✅ Benefits

- ✅ **Much simpler** - no conditional logic
- ✅ **Single responsibility** - one variable per API
- ✅ **Clear separation** - game API vs auth API
- ✅ **Docker friendly** - only need `NODE_ENV`
- ✅ **Environment specific** - different ports for dev/prod

Your app automatically picks the right endpoints! 🎯 