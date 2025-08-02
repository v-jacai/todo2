#!/bin/bash

# Todo App Stop Script
echo "🛑 Stopping Todo Application..."

# Kill processes on our ports
echo "Stopping backend (port 5000)..."
lsof -ti:5000 | xargs -r kill -9 2>/dev/null

echo "Stopping frontend (port 8080)..."
lsof -ti:8080 | xargs -r kill -9 2>/dev/null

# Clean up any remaining todo processes
pkill -f "app.py" 2>/dev/null || true
pkill -f "http.server" 2>/dev/null || true

echo "✅ Todo application stopped!"
