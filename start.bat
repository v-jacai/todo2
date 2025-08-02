@echo off
setlocal enabledelayedexpansion

REM Todo App Startup Script
echo 🚀 Starting Todo Application...

REM Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is required
    pause
    exit /b 1
)

REM Setup backend
echo 📦 Setting up backend...
cd backend

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    python -m venv venv
)

REM Activate virtual environment and install dependencies
call venv\Scripts\activate.bat
pip install -r requirements.txt >nul 2>&1

REM Start backend in background
echo 🚀 Starting backend on port 5000...
start /B python app.py

REM Wait a moment for backend to start
timeout /t 2 /nobreak >nul

REM Start frontend
echo 🌐 Starting frontend on port 8080...
cd ..\frontend

echo ✅ Todo app running at http://localhost:8080
echo    Backend API at http://localhost:5000
echo    Press Ctrl+C to stop

REM Start frontend server
python -m http.server 8080
