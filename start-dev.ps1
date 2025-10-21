#!/usr/bin/env pwsh

# Commitly - Start All Development Servers
# This script starts the frontend and admin applications

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "║              Commitly - Development Server Launcher          ║" -ForegroundColor Cyan
Write-Host "║                                                              ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Get the directory where this script is located
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $ScriptDir

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "✗ Node.js not found!" -ForegroundColor Red
        Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ Node.js not found!" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Function to check and install dependencies
function Check-Dependencies {
    param($appPath, $appName)

    if (Test-Path "$appPath/node_modules") {
        Write-Host "✓ $appName dependencies found" -ForegroundColor Green
        return $true
    } else {
        Write-Host "⚠ $appName dependencies not found. Installing..." -ForegroundColor Yellow
        Set-Location $appPath
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Host "✗ Failed to install $appName dependencies" -ForegroundColor Red
            Set-Location $ScriptDir
            return $false
        }
        Write-Host "✓ $appName dependencies installed" -ForegroundColor Green
        Set-Location $ScriptDir
        return $true
    }
}

# Check Frontend
Write-Host ""
Write-Host "Checking Frontend App..." -ForegroundColor Cyan
if (Test-Path "frontend") {
    $frontendReady = Check-Dependencies -appPath "frontend" -appName "Frontend"
} else {
    Write-Host "✗ Frontend folder not found!" -ForegroundColor Red
    $frontendReady = $false
}

# Check Admin
Write-Host ""
Write-Host "Checking Admin App..." -ForegroundColor Cyan
if (Test-Path "admin") {
    $adminReady = Check-Dependencies -appPath "admin" -appName "Admin"
} else {
    Write-Host "✗ Admin folder not found!" -ForegroundColor Red
    $adminReady = $false
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# If neither app is ready, exit
if (-not $frontendReady -and -not $adminReady) {
    Write-Host "✗ No applications are ready to start" -ForegroundColor Red
    exit 1
}

# Display startup information
Write-Host "🚀 Starting Development Servers..." -ForegroundColor Green
Write-Host ""

if ($frontendReady) {
    Write-Host "  Frontend App:" -ForegroundColor Cyan
    Write-Host "    → http://localhost:3000" -ForegroundColor White
    Write-Host ""
}

if ($adminReady) {
    Write-Host "  Admin Dashboard:" -ForegroundColor Cyan
    Write-Host "    → http://localhost:3001" -ForegroundColor White
    Write-Host ""
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Function to start a dev server
function Start-DevServer {
    param($appPath, $appName, $port)

    if (Test-Path $appPath) {
        Write-Host "Starting $appName on port $port..." -ForegroundColor Green
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir/$appPath'; Write-Host '[$appName] Development Server' -ForegroundColor Cyan; npm run dev"
        Start-Sleep -Seconds 2
    }
}

# Start servers
if ($frontendReady) {
    Start-DevServer -appPath "frontend" -appName "Frontend" -port 3000
}

if ($adminReady) {
    Start-DevServer -appPath "admin" -appName "Admin" -port 3001
}

Write-Host ""
Write-Host "✓ All servers started!" -ForegroundColor Green
Write-Host ""
Write-Host "New PowerShell windows have been opened for each server." -ForegroundColor Yellow
Write-Host "Close those windows to stop the servers." -ForegroundColor Yellow
Write-Host ""
Write-Host "Happy coding! 🎉" -ForegroundColor Cyan
Write-Host ""
