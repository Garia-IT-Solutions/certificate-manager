
# Build script for Backend Executable using PyInstaller
Write-Host "Building Python Backend Executable..." -ForegroundColor Cyan

# Install PyInstaller if not present (optional, user might have it)
# pip install pyinstaller

# Clean previous builds
if (Test-Path "backend/dist") { Remove-Item "backend/dist" -Recurse -Force }
if (Test-Path "backend/build") { Remove-Item "backend/build" -Recurse -Force }

# Run PyInstaller
# --onefile: Single executable
# --name: Output filename
# --distpath: Output directory
# --paths: Search paths for modules
# --clean: Clean cache
# --noconfirm: Overwrite existing
pyinstaller backend/run_server.py `
    --onefile `
    --name backend-server `
    --distpath backend/dist `
    --workpath backend/build `
    --paths . `
    --clean `
    --noconfirm

if ($LASTEXITCODE -eq 0) {
    Write-Host "Backend build successful! Output: backend/dist/backend-server.exe" -ForegroundColor Green
} else {
    Write-Host "Backend build failed." -ForegroundColor Red
    exit 1
}
