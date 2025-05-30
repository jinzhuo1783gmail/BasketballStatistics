# Basketball Game Statistics - PowerShell Deployment Script
# Usage: .\deploy.ps1 [dev|prod] [optional-tag]

param(
    [string]$Environment = "prod",
    [string]$Tag = "latest"
)

# Configuration
$ImageName = "basketball-stats"
$ContainerName = "basketball-stats"

# Environment configurations
$DevApiGame = "http://matrixthoughts.ddns.net:1001/"
$DevAuthApi = "https://intensivecredentialdev.azurewebsites.net/"

$ProdApiGame = "http://matrixthoughts.ddns.net:2001/"
$ProdAuthApi = "https://intensivecredentialprod.azurewebsites.net/"

Write-Host "🚀 Basketball Game Statistics - Deployment" -ForegroundColor Green
Write-Host "Environment: $Environment" -ForegroundColor Yellow
Write-Host "Tag: $Tag" -ForegroundColor Yellow
Write-Host "===========================================" -ForegroundColor Green

switch ($Environment) {
    { $_ -in "dev", "development" } {
        Write-Host "🔧 Building DEVELOPMENT image..." -ForegroundColor Cyan
        
        docker build `
            --build-arg NODE_ENV=development `
            --build-arg REACT_APP_API_GAME="$DevApiGame" `
            --build-arg REACT_APP_AUTH_API="$DevAuthApi" `
            -t "${ImageName}:dev-${Tag}" `
            .
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Development build complete!" -ForegroundColor Green
            Write-Host ""
            Write-Host "🏃 To run:" -ForegroundColor Yellow
            Write-Host "docker run -p 1002:1002 --name ${ContainerName}-dev ${ImageName}:dev-${Tag}" -ForegroundColor White
            Write-Host ""
            Write-Host "📊 API Endpoints:" -ForegroundColor Yellow
            Write-Host "  Game API: $DevApiGame" -ForegroundColor White
            Write-Host "  Auth API: $DevAuthApi" -ForegroundColor White
        } else {
            Write-Host "❌ Build failed!" -ForegroundColor Red
            exit 1
        }
    }
    
    { $_ -in "prod", "production" } {
        Write-Host "🏭 Building PRODUCTION image..." -ForegroundColor Cyan
        
        docker build `
            --build-arg NODE_ENV=production `
            --build-arg REACT_APP_API_GAME="$ProdApiGame" `
            --build-arg REACT_APP_AUTH_API="$ProdAuthApi" `
            -t "${ImageName}:prod-${Tag}" `
            -t "${ImageName}:latest" `
            .
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Production build complete!" -ForegroundColor Green
            Write-Host ""
            Write-Host "🏃 To run:" -ForegroundColor Yellow
            Write-Host "docker run -p 1002:1002 --name ${ContainerName}-prod ${ImageName}:prod-${Tag}" -ForegroundColor White
            Write-Host ""
            Write-Host "📊 API Endpoints:" -ForegroundColor Yellow
            Write-Host "  Game API: $ProdApiGame" -ForegroundColor White
            Write-Host "  Auth API: $ProdAuthApi" -ForegroundColor White
        } else {
            Write-Host "❌ Build failed!" -ForegroundColor Red
            exit 1
        }
    }
    
    default {
        Write-Host "❌ Invalid environment. Use 'dev' or 'prod'" -ForegroundColor Red
        Write-Host "Usage: .\deploy.ps1 [dev|prod] [optional-tag]" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "🐳 Available commands:" -ForegroundColor Yellow
Write-Host "  View images: docker images | findstr basketball-stats" -ForegroundColor White
Write-Host "  Stop running: docker stop ${ContainerName}-${Environment}" -ForegroundColor White
Write-Host "  Remove container: docker rm ${ContainerName}-${Environment}" -ForegroundColor White
Write-Host "  View logs: docker logs ${ContainerName}-${Environment}" -ForegroundColor White
Write-Host ""
Write-Host "🎉 Deployment ready!" -ForegroundColor Green 