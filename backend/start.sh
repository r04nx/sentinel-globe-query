#!/bin/bash

# SENTINEL Backend Startup Script
# This script kills any existing backend process and starts a new one in background

echo "🌟 SENTINEL Backend Startup Script"
echo "=================================="

# Change to backend directory
BACKEND_DIR="/home/rohan/Public/sentinel-globe-query/backend"
cd "$BACKEND_DIR"

# Kill existing processes on port 8000
echo "🔍 Checking for existing processes on port 8000..."
PIDS=$(lsof -ti :8000 2>/dev/null || true)

if [ -n "$PIDS" ]; then
    echo "❌ Found existing processes: $PIDS"
    echo "🔪 Killing existing processes..."
    
    # Try graceful shutdown first
    kill -TERM $PIDS 2>/dev/null || true
    sleep 2
    
    # Force kill if still running
    PIDS_REMAINING=$(lsof -ti :8000 2>/dev/null || true)
    if [ -n "$PIDS_REMAINING" ]; then
        echo "🔥 Force killing remaining processes: $PIDS_REMAINING"
        kill -KILL $PIDS_REMAINING 2>/dev/null || true
        sleep 1
    fi
    
    echo "✅ Existing processes stopped"
else
    echo "✅ No existing processes found on port 8000"
fi

# Remove old log file if it exists
if [ -f "/tmp/sentinel-backend.logs" ]; then
    echo "🗑️  Removing old log file..."
    rm -f /tmp/sentinel-backend.logs
fi

# Activate virtual environment and start backend
echo "🚀 Starting SENTINEL backend..."
echo "📝 Logs will be written to: /tmp/sentinel-backend.logs"

# Start the backend in background
source venv/bin/activate
nohup python start.py > /tmp/sentinel-backend.logs 2>&1 &

# Get the process ID
BACKEND_PID=$!
echo "🔢 Backend started with PID: $BACKEND_PID"

# Wait a moment for startup
echo "⏳ Waiting for server to start..."
sleep 4

# Check if the process is still running
if ps -p $BACKEND_PID > /dev/null; then
    echo "✅ Backend is running successfully!"
    
    # Test the API endpoint
    echo "🧪 Testing API endpoint..."
    if curl -s http://localhost:8000/ > /dev/null; then
        echo "✅ API is responding at http://localhost:8000"
        echo "📚 API Documentation: http://localhost:8000/docs"
        echo "📊 Health Check: http://localhost:8000/health"
    else
        echo "⚠️  API not responding yet, check logs for details"
    fi
    
    echo ""
    echo "🎯 SENTINEL Backend Commands:"
    echo "  • View logs: tail -f /tmp/sentinel-backend.logs"
    echo "  • Stop backend: pkill -f 'python start.py'"
    echo "  • Restart: ./start.sh"
    echo ""
    echo "🌐 Frontend URLs to use:"
    echo "  • Backend API: http://localhost:8000"
    echo "  • Disasters: http://localhost:8000/api/disasters"
    echo "  • Chat: http://localhost:8000/api/chat"
    echo "  • Crawler: http://localhost:8000/api/crawler"
    
else
    echo "❌ Backend failed to start! Check logs:"
    echo "   tail /tmp/sentinel-backend.logs"
    exit 1
fi

echo ""
echo "🎉 SENTINEL Backend is ready for your frontend!"
