#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Build Process for CMD Hub...${NC}"

# 1. Build Server (NestJS)
echo -e "${GREEN}📦 Building Backend (NestJS)...${NC}"
cd server
npm install
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Backend build failed!"
    exit 1
fi
cd ..

# 2. Build Client (Vite + Tailwind v4)
echo -e "${GREEN}🎨 Building Frontend (Vite)...${NC}"
cd client
npm install
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi
cd ..

# 3. Launch with PM2
echo -e "${BLUE}🛠️  Launching with PM2...${NC}"

# Check if pm2 is installed
if ! command -v pm2 &> /dev/null
then
    echo "⚠️  PM2 not found. Installing globally..."
    npm install -g pm2
fi

# Stop existing processes to avoid port conflicts
pm2 delete ecosystem.config.cjs 2>/dev/null

# Start the ecosystem
pm2 start ecosystem.config.cjs --env production

echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${BLUE}Follow logs with: ${NC}pm2 logs"