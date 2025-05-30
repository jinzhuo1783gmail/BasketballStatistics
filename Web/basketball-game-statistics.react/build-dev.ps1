#!/usr/bin/env pwsh

# Build development Docker image for Basketball Game Statistics
Write-Host "Building development Docker image with proper environment variables..." -ForegroundColor Green

$buildCmd = @(
    "docker", "build",
    "--build-arg", "NODE_ENV=development",
    "--build-arg", "REACT_APP_API_GAME=http://matrixthoughts.ddns.net:1001/",
    "--build-arg", "REACT_APP_AUTH_API=https://intensivecredentialdev.azurewebsites.net/",
    "-t", "basketball.statistic.web:dev",
    "."
)

Write-Host "Running: $($buildCmd -join ' ')" -ForegroundColor Yellow
& $buildCmd[0] $buildCmd[1..($buildCmd.Length-1)]

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Development image built successfully!" -ForegroundColor Green
    Write-Host "To run: docker run -p 1002:1002 --rm basketball.statistic.web:dev" -ForegroundColor Cyan
} else {
    Write-Host "❌ Build failed with exit code $LASTEXITCODE" -ForegroundColor Red
} 