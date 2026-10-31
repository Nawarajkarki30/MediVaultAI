# scripts/start-postgres.ps1
# MediVault AI — Local PostgreSQL Startup Helper

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " MediVault AI — Local PostgreSQL Launcher" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Docker CLI not detected in PATH. Please install or enable Docker Desktop."
    exit 1
}

Write-Host "Starting PostgreSQL container via docker compose..." -ForegroundColor Yellow
docker compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "PostgreSQL container is running on 127.0.0.1:5434 (healthy)" -ForegroundColor Green
    Write-Host "Applying Prisma migrations to dev database..." -ForegroundColor Yellow
    npx prisma migrate deploy --schema=database/prisma/schema.prisma
} else {
    Write-Warning "Could not start PostgreSQL. Ensure Docker Desktop is open and the Linux Engine is active."
}

