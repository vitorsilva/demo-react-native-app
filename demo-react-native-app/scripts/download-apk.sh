#!/bin/bash
# Download latest EAS build APK for Maestro testing
#
# Usage:
#   ./scripts/download-apk.sh           # Download only
#   ./scripts/download-apk.sh --install # Download and install on emulator
#
# Requirements:
#   - eas-cli installed and authenticated
#   - curl
#   - adb (for --install option)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
APK_PATH="$PROJECT_DIR/saborspin.apk"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Fetching latest EAS build...${NC}"

# Get latest Android build info
BUILD_INFO=$(eas build:list --platform android --limit 1 --json --non-interactive 2>/dev/null)

if [ -z "$BUILD_INFO" ]; then
    echo -e "${RED}Error: Failed to fetch build info. Make sure you're authenticated with EAS.${NC}"
    exit 1
fi

# Extract APK URL using grep/sed (works without jq)
# Handle both "key":"value" and "key": "value" formats
APK_URL=$(echo "$BUILD_INFO" | grep -oE '"applicationArchiveUrl":\s*"[^"]*"' | head -1 | sed 's/"applicationArchiveUrl":\s*"//;s/"$//')

if [ -z "$APK_URL" ]; then
    echo -e "${RED}Error: No APK URL found. Make sure there's a completed Android build.${NC}"
    exit 1
fi

# Extract build ID for reference
BUILD_ID=$(echo "$BUILD_INFO" | grep -oE '"id":\s*"[^"]*"' | head -1 | sed 's/"id":\s*"//;s/"$//')

echo -e "Build ID: ${GREEN}$BUILD_ID${NC}"
echo -e "APK URL: ${GREEN}$APK_URL${NC}"
echo ""

# Download APK
echo -e "${YELLOW}Downloading APK...${NC}"
curl -L -o "$APK_PATH" "$APK_URL"

if [ ! -f "$APK_PATH" ]; then
    echo -e "${RED}Error: Failed to download APK${NC}"
    exit 1
fi

APK_SIZE=$(du -h "$APK_PATH" | cut -f1)
echo -e "${GREEN}Downloaded: $APK_PATH ($APK_SIZE)${NC}"

# Install if --install flag provided
if [ "$1" == "--install" ]; then
    echo ""
    echo -e "${YELLOW}Installing APK on emulator...${NC}"

    # Check if adb is available
    if ! command -v adb &> /dev/null; then
        echo -e "${RED}Error: adb not found. Please add Android SDK platform-tools to PATH.${NC}"
        exit 1
    fi

    # Check if device is connected
    DEVICE_COUNT=$(adb devices | grep -c "device$" || true)
    if [ "$DEVICE_COUNT" -eq 0 ]; then
        echo -e "${RED}Error: No Android device/emulator connected.${NC}"
        echo "Start an emulator with: emulator -avd <AVD_NAME>"
        exit 1
    fi

    # Install APK
    adb install -r "$APK_PATH"
    echo -e "${GREEN}APK installed successfully!${NC}"
fi

echo ""
echo -e "${GREEN}Done!${NC}"
echo ""
echo "Next steps:"
echo "  1. Start emulator (if not running)"
echo "  2. Install APK: adb install -r $APK_PATH"
echo "  3. Run Maestro tests: maestro test e2e/maestro/"
