# Multi-stage build для оптимизации размера образа
FROM python:3.11-slim as builder

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Создаем виртуальное окружение
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Копируем и устанавливаем Python зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim

# Создаем пользователя для безопасности
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Устанавливаем только необходимые системные зависимости
RUN apt-get update && apt-get install -y \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Копируем виртуальное окружение из builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем код приложения
COPY --chown=appuser:appuser . .

# Создаем необходимые директории
RUN mkdir -p /app/uploads/avatars /app/logs && \
    chown -R appuser:appuser /app/uploads /app/logs && \
    chmod 755 /app/uploads/avatars

# Переключаемся на непривилегированного пользователя
USER appuser

# Открываем порт
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Запускаем приложение
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
