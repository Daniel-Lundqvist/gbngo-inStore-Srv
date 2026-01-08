#!/bin/bash

# ================================================
# Grab'n GO QuickGames - Development Environment Setup
# ================================================
# This script sets up and runs the development environment
# for the Grab'n GO interactive game portal.
# ================================================

set -e

echo "=============================================="
echo "   Grab'n GO QuickGames - Setup Script"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check Node.js version
echo -e "${BLUE}Checking Node.js version...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed.${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Error: Node.js 18+ is required. Current version: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}Node.js version: $(node -v) ✓${NC}"

# Check npm
echo -e "${BLUE}Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed.${NC}"
    exit 1
fi
echo -e "${GREEN}npm version: $(npm -v) ✓${NC}"

echo ""

# Install backend dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
if [ -d "server" ]; then
    cd server
    npm install
    cd ..
    echo -e "${GREEN}Backend dependencies installed ✓${NC}"
else
    echo -e "${YELLOW}Backend directory (server/) not found yet - will be created during implementation${NC}"
fi

# Install frontend dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
if [ -d "client" ]; then
    cd client
    npm install
    cd ..
    echo -e "${GREEN}Frontend dependencies installed ✓${NC}"
else
    echo -e "${YELLOW}Frontend directory (client/) not found yet - will be created during implementation${NC}"
fi

# Initialize SQLite database if needed
echo ""
echo -e "${BLUE}Checking database setup...${NC}"
if [ -d "server" ] && [ -f "server/src/database/init.js" ]; then
    echo "Initializing database..."
    cd server
    npm run db:init 2>/dev/null || echo -e "${YELLOW}Database init script not available yet${NC}"
    cd ..
fi

echo ""
echo "=============================================="
echo -e "${GREEN}   Setup Complete!${NC}"
echo "=============================================="
echo ""
echo -e "${BLUE}To start the development servers:${NC}"
echo ""
echo "  Backend (port 3001):"
echo "    cd server && npm run dev"
echo ""
echo "  Frontend (port 5173):"
echo "    cd client && npm run dev"
echo ""
echo "  Or run both concurrently:"
echo "    npm run dev"
echo ""
echo -e "${BLUE}Access the application:${NC}"
echo "  Main App (iPad/Screen): http://localhost:5173"
echo "  Mobile Controller:      http://localhost:5173/controller"
echo "  API Server:             http://localhost:3001"
echo ""
echo -e "${BLUE}Admin Access:${NC}"
echo "  Navigate to /admin and enter code: 5250"
echo ""
echo -e "${YELLOW}Technology Stack:${NC}"
echo "  Frontend: React + Vite + Framer Motion + Three.js"
echo "  Backend:  Node.js + Express + SQLite + Socket.io"
echo "  Styling:  CSS Modules + CSS Variables (themes)"
echo "  i18n:     react-i18next (sv, en, da, de)"
echo ""
echo "=============================================="
