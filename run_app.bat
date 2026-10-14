@echo off
title InvestPulse Launcher
echo =======================================================
echo   Starting InvestPulse Full-Stack Financial Platform
echo =======================================================

echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8000 ...
start "InvestPulse Backend (FastAPI)" cmd /k "cd /d %~dp0backend && venv\Scripts\activate && uvicorn app.main:app --reload --port 8000"

timeout /t 3 /nobreak >nul

echo [2/2] Launching React 19 Frontend on http://localhost:5173 ...
start "InvestPulse Frontend (Vite)" cmd /k "cd /d %~dp0client && npm run dev"

echo.
echo =======================================================
echo   InvestPulse is running!
echo   Frontend: http://localhost:5173
echo   Backend:  http://127.0.0.1:8000 (Docs: /docs)
echo =======================================================
pause
