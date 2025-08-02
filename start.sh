#!/bin/bash

# Todo App Startup Script
echo "🚀 Starting Todo Application..."

# Check for Python
if ! command -v python3 >/dev/null 2>&1; then
    echo "❌ Python 3 is required"
    exit 1
fi

# Setup backend
echo "📦 Setting up backend..."
cd backend

# Create virtual environment if it doesn't exist
[ ! -d "venv" ] && python3 -m venv venv

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install -r requirements.txt >/dev/null 2>&1

# Start backend
echo "🚀 Starting backend on port 5000..."
python app.py &
BACKEND_PID=$!
sleep 2

# Start frontend
echo "🌐 Starting frontend on port 8080..."
cd ../frontend

# Cleanup function
cleanup() {
    echo -e "\n🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "✅ Todo app running at http://localhost:8080"
echo "   Backend API at http://localhost:5000"
echo "   Press Ctrl+C to stop"

# Start frontend server
python3 -m http.server 8080
