# Download latest EAS build APK for Maestro testing
#
# Usage:
#   .\scripts\download-apk.ps1           # Download only
#   .\scripts\download-apk.ps1 -Install  # Download and install on emulator
#
# Requirements:
#   - eas-cli installed and authenticated
#   - adb (for -Install option)

param(
    [switch]$Install
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir
$ApkPath = Join-Path $ProjectDir "saborspin.apk"

Write-Host "Fetching latest EAS build..." -ForegroundColor Yellow

# Get latest Android build info
try {
    $BuildInfo = eas build:list --platform android --limit 1 --json --non-interactive 2>$null | ConvertFrom-Json
} catch {
    Write-Host "Error: Failed to fetch build info. Make sure you're authenticated with EAS." -ForegroundColor Red
    exit 1
}

if (-not $BuildInfo -or $BuildInfo.Count -eq 0) {
    Write-Host "Error: No builds found." -ForegroundColor Red
    exit 1
}

$Build = $BuildInfo[0]
$ApkUrl = $Build.artifacts.applicationArchiveUrl
$BuildId = $Build.id

if (-not $ApkUrl) {
    Write-Host "Error: No APK URL found. Make sure there's a completed Android build." -ForegroundColor Red
    exit 1
}

Write-Host "Build ID: " -NoNewline
Write-Host $BuildId -ForegroundColor Green
Write-Host "APK URL: " -NoNewline
Write-Host $ApkUrl -ForegroundColor Green
Write-Host ""

# Download APK
Write-Host "Downloading APK..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $ApkUrl -OutFile $ApkPath -UseBasicParsing
} catch {
    Write-Host "Error: Failed to download APK" -ForegroundColor Red
    exit 1
}

$ApkSize = (Get-Item $ApkPath).Length / 1MB
Write-Host "Downloaded: $ApkPath ($([math]::Round($ApkSize, 1)) MB)" -ForegroundColor Green

# Install if -Install flag provided
if ($Install) {
    Write-Host ""
    Write-Host "Installing APK on emulator..." -ForegroundColor Yellow

    # Check if adb is available
    $adbPath = Get-Command adb -ErrorAction SilentlyContinue
    if (-not $adbPath) {
        Write-Host "Error: adb not found. Please add Android SDK platform-tools to PATH." -ForegroundColor Red
        exit 1
    }

    # Check if device is connected
    $devices = adb devices | Select-String "device$"
    if (-not $devices) {
        Write-Host "Error: No Android device/emulator connected." -ForegroundColor Red
        Write-Host "Start an emulator with: emulator -avd <AVD_NAME>"
        exit 1
    }

    # Install APK
    adb install -r $ApkPath
    Write-Host "APK installed successfully!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Start emulator (if not running)"
Write-Host "  2. Install APK: adb install -r $ApkPath"
Write-Host "  3. Run Maestro tests: maestro test e2e/maestro/"
