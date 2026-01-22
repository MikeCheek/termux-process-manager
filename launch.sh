#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Paths
SRC_DIR="$HOME/cmd-manager"
PROD_DIR="$HOME/cmd_hub_production"
SCRIPT_NAME=$(basename "$0")

echo -e "${BLUE}🚀 Preparing Isolated Production Build...${NC}"

# 1. Reset the Production Folder
echo -e "${GREEN}📂 Copying project to: $PROD_DIR...${NC}"
rm -rf "$PROD_DIR"
mkdir -p "$PROD_DIR"
cp -r "$SRC_DIR/." "$PROD_DIR/"

# 2. Strict Cleanup of Development/Source Metadata
echo -e "${GREEN}🔐 Isolating Production Environment...${NC}"

# Remove Git metadata and dev-only environment files
rm -rf "$PROD_DIR/.git"
rm -f "$PROD_DIR/.gitignore"
find "$PROD_DIR" -name ".env.development" -type f -delete

# Ensure node_modules and dist start fresh
rm -rf "$PROD_DIR/server/node_modules" "$PROD_DIR/server/dist"
rm -rf "$PROD_DIR/client/node_modules" "$PROD_DIR/client/dist"

# Verify that the base .env exists
if [ ! -f "$PROD_DIR/server/.env" ]; then
    echo -e "${RED}❌ ERROR: No .env found in $PROD_DIR/server/. Production needs this file!${NC}"
    exit 1
fi

# 3. Build inside the Production Directory
echo -e "${BLUE}🏗️  Starting Build inside $PROD_DIR...${NC}"
cd "$PROD_DIR"

# Build Backend
echo -e "${GREEN}📦 Building Backend (NestJS)...${NC}"
cd server
npm install
npm run build
if [ ! -f "dist/main.js" ]; then 
    echo -e "${RED}❌ Backend build failed!${NC}"; exit 1; 
fi
# Remove devDependencies to save space
npm prune --production
cd ..

# Build Frontend
echo -e "${GREEN}🎨 Building Frontend (Vite)...${NC}"
cd client
npm install
npm run build
if [ ! -d "dist" ]; then 
    echo -e "${RED}❌ Frontend build failed!${NC}"; exit 1; 
fi
cd ..

# 4. Production Pruning (Keep only what's necessary)
echo -e "${BLUE}🧹 Pruning staging area for production...${NC}"

# Remove the deployment script from the production folder
rm -f "$PROD_DIR/$SCRIPT_NAME"

# Inside Server: Keep ONLY dist, node_modules, .env, and package.json
cd "$PROD_DIR/server"
find . -maxdepth 1 ! -name 'dist' ! -name 'node_modules' ! -name '.env' ! -name 'package.json' ! -name '.' -exec rm -rf {} +

# Inside Client: Keep ONLY dist and package.json (and node_modules if using serve)
cd "$PROD_DIR/client"
find . -maxdepth 1 ! -name 'dist' ! -name 'node_modules' ! -name 'package.json' ! -name '.' -exec rm -rf {} +

echo -e "${GREEN}✨ Staging area cleaned. Only build artifacts remain.${NC}"

# 5. Launch with PM2
echo -e "${BLUE}🛠️  Starting PM2 from Clean Production Folder...${NC}"
cd "$PROD_DIR"
pm2 delete ecosystem.config.cjs 2>/dev/null
pm2 start ecosystem.config.cjs --env production

echo -e "${GREEN}✅ Isolated Deployment Successful!${NC}"
echo -e "${BLUE}Running from:${NC} $PROD_DIR"

# Return to source
cd "$SRC_DIR"