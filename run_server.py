#!/usr/bin/env python3
"""
Скрипт для запуска сервера с правильными настройками CORS
"""
import uvicorn
import logging
import sys
import os

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def main():
    logger.info("🚀 Запуск FastAPI Auth System...")
    
    # Проверяем, что все зависимости установлены
    try:
        import fastapi
        import sqlalchemy
        import passlib
        import jose
        logger.info("✅ Все зависимости найдены")
    except ImportError as e:
        logger.error(f"❌ Отсутствует зависимость: {e}")
        logger.error("💡 Выполните: pip install -r requirements.txt")
        sys.exit(1)
    
    # Создаем папку для загрузок
    os.makedirs("uploads/avatars", exist_ok=True)
    logger.info("📁 Папка uploads/avatars создана")
    
    # Запускаем сервер
    try:
        uvicorn.run(
            "main:app",
            host="0.0.0.0",
            port=8000,
            reload=True,
            log_level="info",
            access_log=True,
            reload_dirs=[".", "routers"],
            reload_includes=["*.py"]
        )
    except KeyboardInterrupt:
        logger.info("🛑 Сервер остановлен пользователем")
    except Exception as e:
        logger.error(f"❌ Ошибка запуска сервера: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
