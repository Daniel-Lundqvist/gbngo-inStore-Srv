@echo off
title GBNGO KundPortal - Launcher
echo ========================================
echo    GBNGO KundPortal - Starting...
echo ========================================
echo.

echo Starting Server...
start "GBNGO Server" cmd /k "cd /d "%~dp0server" && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting Client...
start "GBNGO Client" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo ========================================
echo    Both services are starting!
echo    Server: http://localhost:3001
echo    Client: http://localhost:5173
echo ========================================
echo.
echo You can close this window.
pause
