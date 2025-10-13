# Commitly Development Server Startup Script

Write-Host "🚀 Starting Commitly Development Server..." -ForegroundColor Cyan
Write-Host ""

# Clear previous build cache
Write-Host "📦 Clearing build cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Build cache cleared" -ForegroundColor Green
} else {
    Write-Host "✅ No cache to clear" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔧 Starting Next.js development server..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📍 Server will be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Start the dev server
npm run dev
