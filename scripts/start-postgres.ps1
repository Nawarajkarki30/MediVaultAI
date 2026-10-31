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
    Write-Host "PostgreSQL container is running on localhost:5432" -ForegroundColor Green
    Write-Host "Applying Prisma migrations to dev database..." -ForegroundColor Yellow
    npm run prisma:migrate
} else {
    Write-Warning "Could not start PostgreSQL. Ensure Docker Desktop is open and the Linux Engine is active."
}

