#!/bin/bash

# M'Cheyne Bible Reading Plan - Setup Script
# This script helps you set up the complete application

set -e

echo "======================================"
echo "M'Cheyne Bible Reading Plan - Setup"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Excel file exists
echo -e "${YELLOW}Step 1: Converting Excel to JSON${NC}"
if [ -f "Scaled M'Cheyne Bible Reading Plan.xlsx" ]; then
    echo "Found Excel file. Converting to JSON..."
    cd data

    # Check if Python is installed
    if command -v python3 &> /dev/null; then
        pip3 install -r requirements.txt
        python3 convert_excel_to_json.py
        echo -e "${GREEN}✓ Conversion complete!${NC}"
    else
        echo "Python 3 not found. Please install Python 3 and run:"
        echo "  cd data && python3 convert_excel_to_json.py"
    fi
    cd ..
else
    echo -e "${YELLOW}Excel file not found. Please copy 'Scaled M'Cheyne Bible Reading Plan.xlsx' to the project root.${NC}"
    echo "Then run: cd data && python3 convert_excel_to_json.py"
fi

echo ""
echo -e "${YELLOW}Step 2: Installing Backend Dependencies${NC}"
cd backend
if command -v npm &> /dev/null; then
    npm install
    echo -e "${GREEN}✓ Backend dependencies installed!${NC}"
else
    echo "npm not found. Please install Node.js and npm."
fi
cd ..

echo ""
echo -e "${YELLOW}Step 3: Installing Frontend Dependencies${NC}"
cd frontend
if command -v npm &> /dev/null; then
    npm install
    echo -e "${GREEN}✓ Frontend dependencies installed!${NC}"
else
    echo "npm not found. Please install Node.js and npm."
fi
cd ..

echo ""
echo -e "${YELLOW}Step 4: Creating Environment Files${NC}"

# Backend .env
if [ ! -f "backend/.env" ]; then
    echo "PORT=3000" > backend/.env
    echo "NODE_ENV=development" >> backend/.env
    echo -e "${GREEN}✓ Created backend/.env${NC}"
else
    echo "backend/.env already exists"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    echo "VITE_API_URL=http://localhost:3000" > frontend/.env
    echo -e "${GREEN}✓ Created frontend/.env${NC}"
else
    echo "frontend/.env already exists"
fi

echo ""
echo "======================================"
echo -e "${GREEN}Setup Complete!${NC}"
echo "======================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the backend:"
echo "   cd backend && npm start"
echo ""
echo "2. In a new terminal, start the frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "3. Open your browser to:"
echo "   http://localhost:5173"
echo ""
echo "For deployment to VPS:"
echo "   cd deployment && docker-compose up -d"
echo ""
echo "For voice assistant setup, see:"
echo "   - voice-assistants/alexa/README.md"
echo "   - voice-assistants/custom/README.md"
echo ""
echo "Happy Bible reading!"
