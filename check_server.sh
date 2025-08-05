#!/bin/bash

echo "🔍 Checking FastAPI server status..."

# Проверка, запущен ли сервер
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Server is running"
    
    # Проверка основных endpoints
    echo "📝 Testing endpoints..."
    
    echo "- Root endpoint:"
    curl -s http://localhost:8000/ | jq .
    
    echo "- Health endpoint:"
    curl -s http://localhost:8000/health | jq .
    
    echo "- Auth me endpoint (should return 401):"
    curl -s -w "Status: %{http_code}\n" http://localhost:8000/auth/me
    
else
    echo "❌ Server is not running on port 8000"
    echo "💡 Try running: python debug_server.py"
fi
