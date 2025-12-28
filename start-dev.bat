@echo off
REM Start both backend and frontend in development mode

echo Starting M'Cheyne Bible Reading Plan...
echo.

REM Start backend in a new window
start "Backend API" cmd /k "cd backend && npm start"

REM Wait a moment for backend to start
timeout /t 3 /nobreak > nul

REM Start frontend in a new window
start "Frontend PWA" cmd /k "cd frontend && npm run dev"

echo.
echo Backend starting on http://localhost:3000
echo Frontend starting on http://localhost:5173
echo.
echo Press any key to close this window (servers will keep running)...
pause > nul
