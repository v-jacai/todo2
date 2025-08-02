@echo off
setlocal

REM Todo App Stop Script
echo 🛑 Stopping Todo Application...

REM Kill processes on our ports
echo Stopping backend (port 5000)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo Stopping frontend (port 8080)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8080" ^| find "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)

REM Clean up any remaining todo processes
taskkill /f /im python.exe /fi "windowtitle eq app.py*" >nul 2>&1
taskkill /f /im python.exe /fi "commandline eq *http.server*" >nul 2>&1

echo ✅ Todo application stopped!
pause
