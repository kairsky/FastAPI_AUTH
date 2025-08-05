#!/bin/bash

echo "🐳 Setting up FastAPI Auth System with Docker..."

# Создаем необходимые директории
mkdir -p uploads/avatars logs nginx/ssl

# Устанавливаем права доступа
chmod 755 uploads/avatars
chmod 755 logs

# Копируем environment файл
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://fastapi_user:secure_password_123@localhost:5432/fastapi_auth

# Security Configuration
SECRET_KEY=your-super-secret-key-change-this-in-production

# Environment
ENVIRONMENT=development

# CORS
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
EOF
fi

echo "✅ Docker setup completed!"
echo "💡 Run 'docker-compose up -d' to start the services"
