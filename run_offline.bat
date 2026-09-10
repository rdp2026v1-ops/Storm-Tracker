@echo off
title Rong Doi Storm Tracker - Offline Server
echo ================================================================
echo       RONG DOI STORM TRACKER - OFFLINE OPERATION LAUNCHER
echo       Offshore Decision Support System (Block 11.2 ^& 12.11)
echo ================================================================
echo.
echo [*] Starting local HTTP server on port 8000...
echo [*] Browser will open automatically at http://localhost:8000
echo.
echo Press Ctrl+C in this console window when you wish to stop the server.
echo ================================================================
echo.

start http://localhost:8000
python -m http.server 8000

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Python was not detected in system PATH.
    echo [*] Attempting Node.js http-server / serve fallback...
    where npx >nul 2>nul
    if %ERRORLEVEL% EQU 0 (
        npx --yes serve -p 8000 .
    ) else (
        echo [ERROR] Neither Python nor Node.js was found.
        echo Please install Python (python.org) or Node.js to serve ES6 modules locally.
        pause
    )
)
pause
