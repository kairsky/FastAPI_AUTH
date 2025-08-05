#!/bin/bash

# Скрипт для запуска разработки

echo "🚀 Запуск FastAPI Auth System..."

# Проверяем, установлены ли зависимости Python
if [ ! -d "venv" ]; then
    echo "📦 Создание виртуального окружения..."
    python -m venv venv
fi

# Активируем виртуальное окружение
source venv/bin/activate || venv\Scripts\activate

# Устанавливаем зависимости
echo "📦 Установка зависимостей Python..."
pip install -r requirements.txt

# Создаем папку для загрузок
mkdir -p uploads/avatars
chmod 755 uploads/avatars

# Запускаем FastAPI сервер в фоне
echo "🔧 Запуск FastAPI сервера..."
uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
FASTAPI_PID=$!

# Ждем запуска сервера
sleep 3

# Проверяем, что сервер запустился
if curl -s http://localhost:8000/ > /dev/null; then
    echo "✅ FastAPI сервер запущен на http://localhost:8000"
else
    echo "❌ Ошибка запуска FastAPI сервера"
    kill $FASTAPI_PID 2>/dev/null
    exit 1
fi

# Запускаем React приложение
echo "🔧 Запуск React приложения..."
if [ -f "package.json" ]; then
    if [ ! -d "node_modules" ]; then
        echo "📦 Установка зависимостей Node.js..."
        npm install
    fi
    
    echo "✅ React приложение запущено на http://localhost:3000"
    npm run dev
else
    echo "⚠️  package.json не найден. Запустите React приложение вручную."
fi

# Останавливаем FastAPI при завершении
trap "echo '🛑 Остановка серверов...'; kill $FASTAPI_PID 2>/dev/null" EXIT
