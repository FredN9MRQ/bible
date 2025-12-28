@echo off
REM M'Cheyne Bible Reading Plan - Setup Script for Windows
REM This script helps you set up the complete application

echo ======================================
echo M'Cheyne Bible Reading Plan - Setup
echo ======================================
echo.

REM Step 1: Convert Excel to JSON
echo Step 1: Converting Excel to JSON
if exist "Scaled M'Cheyne Bible Reading Plan.xlsx" (
    echo Found Excel file. Converting to JSON...
    cd data
    pip install -r requirements.txt
    python convert_excel_final.py
    echo [OK] Conversion complete!
    cd ..
) else (
    echo [WARNING] Excel file not found.
    echo Please copy 'Scaled M'Cheyne Bible Reading Plan.xlsx' to the project root.
    echo Then run: cd data ^&^& python convert_excel_to_json.py
)

echo.
echo Step 2: Installing Backend Dependencies
cd backend
npm install
echo [OK] Backend dependencies installed!
cd ..

echo.
echo Step 3: Installing Frontend Dependencies
cd frontend
npm install
echo [OK] Frontend dependencies installed!
cd ..

echo.
echo Step 4: Creating Environment Files

REM Backend .env
if not exist "backend\.env" (
    echo PORT=3000 > backend\.env
    echo NODE_ENV=development >> backend\.env
    echo [OK] Created backend\.env
) else (
    echo backend\.env already exists
)

REM Frontend .env
if not exist "frontend\.env" (
    echo VITE_API_URL=http://localhost:3000 > frontend\.env
    echo [OK] Created frontend\.env
) else (
    echo frontend\.env already exists
)

echo.
echo ======================================
echo Setup Complete!
echo ======================================
echo.
echo Next steps:
echo.
echo 1. Start the backend:
echo    cd backend ^&^& npm start
echo.
echo 2. In a new terminal, start the frontend:
echo    cd frontend ^&^& npm run dev
echo.
echo 3. Open your browser to:
echo    http://localhost:5173
echo.
echo For deployment to VPS:
echo    cd deployment ^&^& docker-compose up -d
echo.
echo For voice assistant setup, see:
echo    - voice-assistants\alexa\README.md
echo    - voice-assistants\custom\README.md
echo.
echo Happy Bible reading!
echo.
pause
