# Docker Setup for Basketball Game Statistics

## Build Commands

### Development Build
```bash
docker build \
  --build-arg NODE_ENV=development \
  --build-arg REACT_APP_API_GAME=http://matrixthoughts.ddns.net:1001/ \
  --build-arg REACT_APP_AUTH_API=https://intensivecredentialdev.azurewebsites.net/ \
  -t basketball-stats:dev \
  .
```

### Production Build
```bash
docker build \
  --build-arg NODE_ENV=production \
  --build-arg REACT_APP_API_GAME=http://matrixthoughts.ddns.net:2001/ \
  --build-arg REACT_APP_AUTH_API=https://intensivecredentialprod.azurewebsites.net/ \
  -t basketball-stats:prod \
  .
```

## Run Commands

### Development
```bash
docker run -p 1002:1002 --rm basketball-stats:dev
```

### Production
```bash
docker run -p 1002:1002 --rm basketball-stats:prod
```

## Access
Open your browser to: http://localhost:1002

## Notes
- The `--build-arg` parameters are **required** during build
- Environment variables must be passed during build time, not run time
- The app serves on port 1002 inside the container 