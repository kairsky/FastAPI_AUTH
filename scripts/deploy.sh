#!/bin/bash

echo "🚀 Deploying FastAPI Auth System..."

# Останавливаем существующие контейнеры
docker-compose down

# Собираем новые образы
docker-compose build --no-cache

# Запускаем сервисы
docker-compose up -d

# Ждем запуска базы данных
echo "⏳ Waiting for database to be ready..."
sleep 10

# Проверяем статус сервисов
docker-compose ps

# Проверяем логи
echo "📋 Recent logs:"
docker-compose logs --tail=20

echo "✅ Deployment completed!"
echo "🌐 Backend: http://localhost:8000"
echo "🌐 Frontend: http://localhost:3000"
echo "📊 Health check: http://localhost:8000/health"
